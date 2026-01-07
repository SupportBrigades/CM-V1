import React, { useState, useEffect, useMemo } from 'react';
import { CompanyData, QuestionnaireData } from './SSTDiagnosis';
import { ChevronLeft, Star, HelpCircle, X } from 'lucide-react';
import { PhaseCompletionModal } from './PhaseCompletionModal';
import {
  QUESTIONS,
  QUESTION_TOOLTIPS,
  getPhasesForCompanyType,
  getQuestionIndexInPhase,
  Phase
} from '@/data/questionPhases';

interface InteractiveQuestionnaireProps {
  companyData: CompanyData;
  onComplete: (data: QuestionnaireData) => void;
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
          // Siempre mostrar modal al completar fase
          setCompletedPhase(currentPhase);
          setShowPhaseModal(true);
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
      onComplete(answers);
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

  if (!currentQuestionId || !currentPhase || !phaseInfo) return null;

  return (
    <div className="min-h-[100dvh] overflow-x-hidden">
      {/* Header con progreso - Diseño mejorado */}
      <div className="fixed top-0 left-0 w-full z-40 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
        {/* Barra de progreso animada con gradiente */}
        <div className="h-1.5 bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Info de fase y progreso */}
        <div className="px-4 py-3 lg:py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            {/* Logo + Nombre de fase */}
            <div className="flex items-center gap-3 lg:gap-4">
              <img
                src="https://www.supportbrigades.com/wp-content/uploads/2021/01/logo-support-brigades-1.png"
                alt="Support Brigades"
                className="h-8 lg:h-10 hidden sm:block"
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

            {/* Progreso + Puntos */}
            <div className="flex items-center gap-4 lg:gap-6">
              {/* Info de progreso */}
              <div className="text-right hidden md:block">
                <div className="text-sm lg:text-base font-semibold text-foreground">
                  Fase {phaseInfo.phaseIndex + 1} de {phases.length}
                </div>
                <div className="text-xs lg:text-sm text-muted-foreground">
                  Pregunta {phaseInfo.questionIndex + 1} de {phaseInfo.totalInPhase}
                </div>
              </div>

              {/* Badge de Puntos en Header */}
              <div className="flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 bg-gradient-to-r from-primary to-blue-600 rounded-full shadow-md">
                <Star className="w-4 h-4 lg:w-5 lg:h-5 text-white fill-white" />
                <span className="text-white font-bold text-sm lg:text-base tabular-nums">
                  {currentPoints}
                </span>
                <span className="text-white/80 text-xs lg:text-sm font-medium">pts</span>
              </div>
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
          {/* Logo */}
          <div className="text-center mb-4">
            <img
              src="https://www.supportbrigades.com/wp-content/uploads/2025/09/xxpfbFuUGcA4.png"
              alt="Support Brigades"
              className="h-12 mx-auto"
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
                  <p className="text-sm leading-relaxed">
                    💡 {QUESTION_TOOLTIPS[currentQuestionId]}
                  </p>
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
              {/* Mostrar botón solo si no es la primera pregunta */}
              {currentQuestionIndex > 0 ? (
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
          message={completedPhase.progressMessage}
          buttonText={completedPhase.buttonText}
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
    </div>
  );
};