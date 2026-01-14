import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { CompanyData, QuestionnaireData } from './SSTDiagnosis';
import { ChevronLeft, Star, HelpCircle, X, Clock } from 'lucide-react';
import { PhaseCompletionModal } from './PhaseCompletionModal';
import { RiskExposureWidget } from './RiskExposureWidget';
import { HeaderRiskWidget } from './HeaderRiskWidget';
import { useRiskCalculator } from '@/hooks/useRiskCalculator';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  QUESTIONS,
  QUESTION_TOOLTIPS,
  getPhasesForCompanyType,
  getQuestionIndexInPhase,
  getPhaseMessage,
  PHASE3_BUTTON_TEXT,
  Phase
} from '@/data/questionPhases';

interface InteractiveQuestionnaireProps {
  companyData: CompanyData;
  onComplete: (data: QuestionnaireData, totalFine: number, hasInfractions: boolean) => void;
  onBack: () => void;
}

export const InteractiveQuestionnaire: React.FC<InteractiveQuestionnaireProps> = ({
  companyData,
  onComplete,
  onBack
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireData>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [completedPhase, setCompletedPhase] = useState<Phase | null>(null);
  const [pointsAnimation, setPointsAnimation] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevPoints, setPrevPoints] = useState(0);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [phaseHasInfractions, setPhaseHasInfractions] = useState(false);
  const [hasGlobalInfractions, setHasGlobalInfractions] = useState(false);

  // Configuración de tiempos dinámicos por fase
  // Fase 1 (Preguntas iniciales): tiempos más cortos
  // Fase 2 (Preguntas técnicas): tiempos medios  
  // Fase 3 (Preguntas complejas): tiempos más largos
  const INACTIVITY_CONFIG = {
    phase1: { idleDelay: 30000, countdown: 35 },  // 30s espera / 35s countdown
    phase2: { idleDelay: 45000, countdown: 40 },  // 45s espera / 40s countdown
    phase3: { idleDelay: 60000, countdown: 50 },  // 60s espera / 50s countdown
    default: { idleDelay: 45000, countdown: 40 }  // Fallback
  };

  // Estados para el sistema de asistencia por inactividad
  const [isIdle, setIsIdle] = useState(false);
  const [idleCountdown, setIdleCountdown] = useState(40);
  const [idleCycle, setIdleCycle] = useState(0); // Solo 1 ciclo
  const [showIdleConfirmModal, setShowIdleConfirmModal] = useState(false);

  // Estados para Exit Intent Pop-up (detección de intención de salida)
  const [showExitIntentModal, setShowExitIntentModal] = useState(false);
  const [hasExitedOnce, setHasExitedOnce] = useState(false);

  // Loss Salience: Track previous risk for animation triggers
  const prevRiskRef = useRef(0);

  // Ref para guardar las respuestas finales cuando se completa la última fase
  const finalAnswersRef = useRef<QuestionnaireData | null>(null);

  // Obtener fases filtradas por tipo de empresa
  const phases = useMemo(() =>
    getPhasesForCompanyType(companyData.tipoEmpresa),
    [companyData.tipoEmpresa]
  );

  // Crear lista plana de preguntas en orden de fases
  const allQuestionIds = useMemo(() =>
    phases.flatMap(phase => phase.questionIds),
    [phases]
  );

  const totalQuestions = allQuestionIds.length;
  const currentQuestionId = allQuestionIds[currentQuestionIndex];
  const currentQuestionText = QUESTIONS[currentQuestionId];

  // Obtener info de fase actual
  const phaseInfo = useMemo(() =>
    getQuestionIndexInPhase(currentQuestionId, companyData.tipoEmpresa),
    [currentQuestionId, companyData.tipoEmpresa]
  );

  const currentPhase = phaseInfo ? phases[phaseInfo.phaseIndex] : null;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Calcular tiempos de inactividad basados en la fase actual
  const currentInactivityTimes = useMemo(() => {
    if (!phaseInfo) return INACTIVITY_CONFIG.default;

    const phaseNumber = phaseInfo.phaseIndex + 1; // 1, 2, o 3
    switch (phaseNumber) {
      case 1:
        return INACTIVITY_CONFIG.phase1;
      case 2:
        return INACTIVITY_CONFIG.phase2;
      case 3:
        return INACTIVITY_CONFIG.phase3;
      default:
        return INACTIVITY_CONFIG.default;
    }
  }, [phaseInfo, INACTIVITY_CONFIG]);

  // Calcular puntos acumulados en tiempo real
  const currentPoints = useMemo(() => {
    let points = 0;

    // Puntos de fases completadas
    for (let i = 0; i < phases.length; i++) {
      if (phaseInfo && i < phaseInfo.phaseIndex) {
        points += phases[i].points;
      }
    }

    // Puntos parciales de la fase actual basados en preguntas respondidas
    if (phaseInfo && currentPhase) {
      const phaseProgress = phaseInfo.questionIndex / phaseInfo.totalInPhase;
      points += Math.floor(currentPhase.points * phaseProgress);
    }

    return points;
  }, [phases, phaseInfo, currentPhase]);

  // Loss Salience: Calcular exposición a riesgo de multas SUNAFIL
  const { totalRiskExposure, lastAddedFine } = useRiskCalculator(
    answers as Record<string, 'si' | 'no'>,
    companyData.numeroTrabajadores,
    companyData.tipoEmpresa,
    prevRiskRef.current
  );

  // Detectar si el riesgo está aumentando
  const isRiskIncreasing = totalRiskExposure > prevRiskRef.current;

  // Actualizar ref de riesgo previo después de cada respuesta
  useEffect(() => {
    prevRiskRef.current = totalRiskExposure;
  }, [totalRiskExposure]);

  const handleAnswer = (answer: 'si' | 'no') => {
    if (!currentQuestionId) return;

    setIsAnimating(true);
    const newAnswers = { ...answers, [currentQuestionId]: answer };
    setAnswers(newAnswers);

    setTimeout(() => {
      // Verificar si es la última pregunta de la fase actual
      if (phaseInfo && currentPhase) {
        const isLastInPhase = phaseInfo.questionIndex === phaseInfo.totalInPhase - 1;

        if (isLastInPhase) {
          // Calcular si hay infracciones en esta fase
          const phaseInfractions = currentPhase.questionIds.filter(
            qId => newAnswers[qId] === 'no'
          ).length;
          setPhaseHasInfractions(phaseInfractions > 0);

          // Siempre mostrar modal al completar fase
          setCompletedPhase(currentPhase);
          setShowPhaseModal(true);

          // Si es la última fase, guardar las respuestas en el ref
          // y calcular infracciones globales para el botón dinámico
          if (currentPhase.id === phases.length) {
            finalAnswersRef.current = newAnswers;
            // Calcular infracciones en TODO el diagnóstico (cualquier "no" = infracción)
            const totalInfractions = Object.values(newAnswers).filter(a => a === 'no').length;
            setHasGlobalInfractions(totalInfractions > 0);
          }
        } else {
          // Continuar a siguiente pregunta de la misma fase
          setCurrentQuestionIndex(prev => prev + 1);
        }
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
      }
      setIsAnimating(false);
    }, 300);
  };

  const handlePhaseModalContinue = () => {
    setShowPhaseModal(false);

    // Si es la última fase, enviar datos y pasar a confirmación
    if (completedPhase && completedPhase.id === phases.length) {
      // Usar las respuestas guardadas en el ref para asegurar que incluyan la última respuesta
      const answersToSend = finalAnswersRef.current || answers;
      onComplete(answersToSend, totalRiskExposure, hasGlobalInfractions);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
    setCompletedPhase(null);
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      onBack();
    }
  };

  useEffect(() => {
    setIsAnimating(false);
    setShowTooltip(false); // Cerrar tooltip al cambiar de pregunta
  }, [currentQuestionIndex]);

  // Efecto para celebrar cuando aumentan los puntos
  useEffect(() => {
    if (currentPoints > prevPoints && prevPoints !== 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 700);
    }
    setPrevPoints(currentPoints);
  }, [currentPoints, prevPoints]);

  // Función para resetear todos los estados de inactividad
  const resetInactivityState = useCallback(() => {
    setIsIdle(false);
    setIdleCountdown(currentInactivityTimes.countdown);
    setIdleCycle(0);
    setShowIdleConfirmModal(false);
  }, [currentInactivityTimes.countdown]);

  // Efecto para detectar inactividad (5 segundos sin interacción)
  useEffect(() => {
    // No activar si hay modales abiertos (incluyendo Exit Intent)
    if (showPhaseModal || showWelcomeBanner || showIdleConfirmModal || showExitIntentModal) {
      return;
    }

    let idleTimer: NodeJS.Timeout;

    const handleActivity = () => {
      // Resetear el estado de inactividad cuando hay actividad
      if (isIdle) {
        resetInactivityState();
      }

      // Reiniciar el timer de detección de inactividad
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsIdle(true);
        setIdleCountdown(currentInactivityTimes.countdown); // Usar countdown dinámico
      }, currentInactivityTimes.idleDelay); // Usar delay dinámico por fase
    };

    // Configurar listeners de eventos
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    // Iniciar el timer inicial
    idleTimer = setTimeout(() => {
      setIsIdle(true);
      setIdleCountdown(currentInactivityTimes.countdown);
    }, currentInactivityTimes.idleDelay);

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [isIdle, showPhaseModal, showWelcomeBanner, showIdleConfirmModal, showExitIntentModal, resetInactivityState, currentInactivityTimes]);

  // Efecto para el contador regresivo cuando está inactivo
  useEffect(() => {
    if (!isIdle || showIdleConfirmModal) return;

    const countdownInterval = setInterval(() => {
      setIdleCountdown(prev => {
        if (prev <= 1) {
          // El contador llegó a 0, mostrar modal de confirmación
          clearInterval(countdownInterval);
          setShowIdleConfirmModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [isIdle, idleCycle, showIdleConfirmModal]);

  // Manejadores para el modal de confirmación
  const handleIdleResume = () => {
    resetInactivityState();
  };

  const handleIdleRestart = () => {
    resetInactivityState();
    onBack(); // Volver al Step 1
  };

  // ======================================
  // EXIT INTENT POP-UP (Detección de intención de salida)
  // ======================================
  useEffect(() => {
    // No activar si ya se mostró una vez en esta sesión
    if (hasExitedOnce) return;

    // No activar si hay otros modales abiertos
    if (showPhaseModal || showWelcomeBanner || showIdleConfirmModal || showExitIntentModal) {
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Solo activar si el cursor sale por la parte superior del navegador
      // Umbral de -7 para reducir falsos positivos
      if (e.clientY < -1 && !hasExitedOnce) {
        setShowExitIntentModal(true);
        setHasExitedOnce(true); // Marcar que ya se mostró una vez
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasExitedOnce, showPhaseModal, showWelcomeBanner, showIdleConfirmModal, showExitIntentModal]);

  // Handler: Continuar con el diagnóstico
  const handleExitIntentContinue = () => {
    setShowExitIntentModal(false);
  };

  // Handler: Abandonar el diagnóstico
  const handleExitIntentAbandon = () => {
    setShowExitIntentModal(false);
    onBack(); // Volver al Step 1 / reiniciar proceso
  };

  if (!currentQuestionId || !currentPhase || !phaseInfo) return null;

  return (
    <div className="min-h-[100dvh] overflow-x-hidden">
      {/* Loss Salience: Widget de Riesgo Acumulado */}
      <RiskExposureWidget
        amount={totalRiskExposure}
        isIncreasing={isRiskIncreasing}
        lastAddedFine={lastAddedFine}
      />

      {/* Header con progreso - Diseño mejorado */}
      <div className="fixed top-0 left-0 w-full z-40 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
        {/* Barra de progreso animada con gradiente */}
        <div className="h-1.5 bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Info de fase y progreso - MEJORA: px-3 en móvil para ganar espacio */}
        <div className="px-3 sm:px-6 lg:px-10 xl:px-16 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            {/* Logo + Nombre de fase */}
            <div className="flex items-center gap-3 lg:gap-4">
              <img
                src="https://www.supportbrigades.com/wp-content/uploads/2021/01/logo-support-brigades-1.png"
                alt="Support Brigades"
                width={120}
                height={32}
                className="h-8 lg:h-10 w-auto hidden sm:block"
              />
              <div className="hidden sm:block w-px h-8 bg-gray-200" />
              <div>
                <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground">
                  {currentPhase.name}
                </h2>
                <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">
                  {currentPhase.description}
                </p>
              </div>
            </div>

            {/* Progreso + Riesgo + Usuario */}
            <div className="flex items-center gap-3 lg:gap-5">
              {/* Info de progreso */}
              <div className="text-right hidden md:block">
                <div className="text-sm lg:text-base font-semibold text-foreground">
                  Fase {phaseInfo.phaseIndex + 1} de {phases.length}
                </div>
                <div className="text-xs lg:text-sm text-muted-foreground">
                  Pregunta {phaseInfo.questionIndex + 1} de {phaseInfo.totalInPhase}
                </div>
              </div>

              {/* Widget de Riesgo en Header (solo desktop, solo si hay riesgo) */}
              <HeaderRiskWidget
                amount={totalRiskExposure}
                isIncreasing={isRiskIncreasing}
                lastAddedFine={lastAddedFine}
              />

              {/* Badge de Usuario - SIEMPRE VISIBLE */}
              {(companyData.nombre || companyData.empresa) && (
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-full border border-border shadow-sm">
                  {/* Ícono de usuario */}
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>

                  {/* Info */}
                  <div className="text-left">
                    {companyData.nombre && (
                      <div className="text-sm font-semibold text-foreground truncate max-w-28">
                        {companyData.nombre}
                      </div>
                    )}
                    {companyData.empresa && (
                      <div className="text-xs text-muted-foreground truncate max-w-28">
                        {companyData.empresa}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Indicadores de fase - Más grandes y visuales */}
          <div className="flex justify-center gap-2 lg:gap-3 mt-3">
            {phases.map((phase, index) => (
              <div
                key={phase.id}
                className={`h-2 lg:h-2.5 rounded-full transition-all duration-500 ${index < phaseInfo.phaseIndex
                  ? 'bg-red-500 w-12 lg:w-16'
                  : index === phaseInfo.phaseIndex
                    ? 'bg-primary w-16 lg:w-24'
                    : 'bg-gray-200 w-12 lg:w-16'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="pt-28 sm:pt-32 pb-8 sm:pb-12 px-3 sm:px-4 min-h-[100dvh] flex items-center justify-center">
        <div className={`w-full max-w-[calc(100vw-1.5rem)] sm:max-w-2xl lg:max-w-4xl transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
          {/* Logo con dimensiones explícitas para prevenir CLS */}
          <div className="text-center mb-4">
            <img
              src="https://www.supportbrigades.com/wp-content/uploads/2025/09/xxpfbFuUGcA4.png"
              alt="Support Brigades"
              width={160}
              height={48}
              className="h-12 w-auto mx-auto"
            />
          </div>

          {/* Question Card */}
          <div className="sb-question-card text-center p-4 sm:p-6 md:p-8 relative">
            {/* Botón de Ayuda */}
            <button
              onClick={() => setShowTooltip(!showTooltip)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200 hover:scale-110"
              aria-label="Ver explicación"
            >
              <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Tooltip Explicativo */}
            {showTooltip && QUESTION_TOOLTIPS[currentQuestionId] && (
              <div className="absolute top-14 right-3 sm:right-4 left-3 sm:left-auto sm:w-80 bg-primary text-white p-4 rounded-xl shadow-xl z-10 text-left animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm leading-relaxed">
                    {(() => {
                      const text = QUESTION_TOOLTIPS[currentQuestionId];
                      const parts = text.split('**Riesgo Legal:**');
                      if (parts.length === 2) {
                        return (
                          <>
                            <p>💡 {parts[0].trim()}</p>
                            <p className="mt-2"><strong>Riesgo Legal:</strong> {parts[1].trim()}</p>
                          </>
                        );
                      }
                      return <p>💡 {text}</p>;
                    })()}
                  </div>
                  <button
                    onClick={() => setShowTooltip(false)}
                    className="shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute -top-2 right-6 w-4 h-4 bg-primary rotate-45" />
              </div>
            )}

            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-foreground mb-6 sm:mb-8 leading-relaxed pr-10">
              {currentQuestionText}
            </h2>

            {/* Answer Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
              <button
                onClick={() => handleAnswer('si')}
                className="sb-response-button hover:scale-105 active:scale-95"
              >
                ✅ Sí
              </button>
              <button
                onClick={() => handleAnswer('no')}
                className="sb-response-button hover:scale-105 active:scale-95"
              >
                ❌ No
              </button>
              <button
                onClick={() => handleAnswer('no')}
                className="sb-response-button hover:scale-105 active:scale-95 bg-gray-50 border-gray-300 text-gray-600"
              >
                🤷 No sé
              </button>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex justify-between items-center">
              {/* Mostrar botón solo si NO es la primera pregunta de la fase actual */}
              {phaseInfo.questionIndex > 0 ? (
                <button
                  onClick={handleBack}
                  className="sb-button-secondary"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
              ) : (
                <div /> /* Placeholder para mantener el layout */
              )}

              {/* Badge de Puntos con Celebración */}
              <div className="relative group">
                {/* Partículas de Confeti */}
                {showConfetti && (
                  <>
                    <div className="confetti-particle confetti-1" style={{ top: '50%', left: '50%' }} />
                    <div className="confetti-particle confetti-2" style={{ top: '50%', left: '50%' }} />
                    <div className="confetti-particle confetti-3" style={{ top: '50%', left: '50%' }} />
                    <div className="confetti-particle confetti-4" style={{ top: '50%', left: '50%' }} />
                    <div className="confetti-particle confetti-5" style={{ top: '50%', left: '50%' }} />
                  </>
                )}

                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                  Puntos acumulados por pregunta respondida
                  <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-800" />
                </div>

                {/* Badge Principal */}
                <div
                  className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl shadow-lg animate-glow-pulse cursor-pointer ${showConfetti ? 'animate-bounce-pop' : ''}`}
                >
                  <Star className={`w-5 h-5 text-white fill-white ${showConfetti ? 'animate-star-spin' : ''}`} />
                  <span className="text-white font-bold text-lg tabular-nums">
                    {currentPoints}
                  </span>
                  <span className="text-white/80 text-sm font-medium">pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de progreso de fase */}
      {showPhaseModal && completedPhase && (
        <PhaseCompletionModal
          phaseName={completedPhase.name}
          phaseNumber={completedPhase.id}
          totalPhases={phases.length}
          points={completedPhase.points}
          totalPoints={completedPhase.totalPoints}
          message={getPhaseMessage(completedPhase.id, phaseHasInfractions)}
          buttonText={
            completedPhase.id === phases.length
              ? (hasGlobalInfractions ? PHASE3_BUTTON_TEXT.withInfractions : PHASE3_BUTTON_TEXT.noInfractions)
              : completedPhase.buttonText
          }
          isLastPhase={completedPhase.id === phases.length}
          onContinue={handlePhaseModalContinue}
        />
      )}

      {/* Modal de Bienvenida */}
      {showWelcomeBanner && currentQuestionIndex === 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md mx-4 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-blue-600 px-6 py-5 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-8 h-8 text-white fill-white" />
              </div>
              <h2 className="text-xl font-bold text-white">
                ¡Hola {companyData.nombre}!
              </h2>
            </div>

            {/* Contenido */}
            <div className="p-6 sm:p-8 text-center">
              <div className="mb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-white fill-white" />
                  </div>
                  <span className="text-2xl font-bold text-amber-500">600 pts</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Gana puntos con cada respuesta
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Responde las preguntas del diagnóstico y acumula puntos.
                  <strong className="text-foreground"> Los puntos desbloquearán tu informe personalizado</strong> con recomendaciones específicas para tu empresa.
                </p>
              </div>

              {/* Info de fases */}
              <div className="bg-muted/50 rounded-xl p-4 mb-6">
                <div className="flex justify-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">3</div>
                    <div className="text-muted-foreground text-xs">Fases</div>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{phases.reduce((acc, p) => acc + p.questionIds.length, 0)}</div>
                    <div className="text-muted-foreground text-xs">Preguntas</div>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-500">600</div>
                    <div className="text-muted-foreground text-xs">Puntos</div>
                  </div>
                </div>
              </div>

              {/* Botón */}
              <button
                onClick={() => setShowWelcomeBanner(false)}
                className="w-full sb-button-primary text-lg py-3"
              >
                🚀 Iniciar Diagnóstico
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Widget de Asistencia por Inactividad */}
      {isIdle && !showIdleConfirmModal && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className="bg-white rounded-xl shadow-2xl border border-border overflow-hidden min-w-64">
            {/* Header */}
            <div className="px-4 py-2 border-b border-border bg-gray-50">
              <p className="text-xs font-bold text-foreground tracking-widest uppercase">
                Pausa Detectada
              </p>
            </div>

            {/* Contenido */}
            <div className="px-4 py-3 flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm text-muted-foreground">
                Reserva de informe: <span className="font-bold text-foreground tabular-nums">{idleCountdown}s</span>
              </p>
            </div>

            {/* Barra de progreso */}
            <div className="h-1.5 bg-gray-200">
              <div
                className="h-full bg-primary inactivity-progress-bar"
                style={{
                  width: `${(idleCountdown / currentInactivityTimes.countdown) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      <AlertDialog open={showIdleConfirmModal} onOpenChange={setShowIdleConfirmModal}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader className="text-center sm:text-center">
            <AlertDialogTitle className="text-xl font-bold text-foreground uppercase tracking-wide">
              ¿Desea continuar con el blindaje?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground text-sm">
              La inactividad eliminará el avance de su informe y el cálculo de la multa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-3 sm:flex-col mt-4">
            <AlertDialogAction
              onClick={handleIdleResume}
              className="w-full sb-button-primary font-bold uppercase tracking-wide py-3"
            >
              Mantener Mi Avance
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={handleIdleRestart}
              className="w-full bg-transparent border-none text-muted-foreground text-xs hover:text-foreground hover:bg-transparent"
            >
              Salir y borrar datos
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exit Intent Pop-up (Detección de intención de salida) */}
      <AlertDialog open={showExitIntentModal} onOpenChange={setShowExitIntentModal}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="text-center sm:text-center">
            <AlertDialogTitle className="text-xl font-bold text-foreground">
              ¡Espera, {companyData.nombre || 'Usuario'}! Tu diagnóstico está incompleto
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground text-sm leading-relaxed mt-3">
              Estás a solo unas pocas respuestas de conocer el riesgo de multa de{' '}
              <strong className="text-foreground">{companyData.empresa || 'tu empresa'}</strong>.{' '}
              Si te vas ahora, perderás el progreso realizado y tu informe personalizado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-3 sm:flex-col mt-6">
            <AlertDialogAction
              onClick={handleExitIntentContinue}
              className="w-full sb-button-primary font-bold uppercase tracking-wide py-3"
            >
              Continuar mi diagnóstico
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={handleExitIntentAbandon}
              className="w-full bg-transparent border-none text-muted-foreground text-xs hover:text-foreground hover:bg-transparent"
            >
              Abandonar de todos modos
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};