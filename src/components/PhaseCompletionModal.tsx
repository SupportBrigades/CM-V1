import React, { useEffect, useState } from 'react';
import { ChevronRight, Gift, Star } from 'lucide-react';

interface PhaseCompletionModalProps {
    phaseName: string;
    phaseNumber: number;
    totalPhases: number;
    points: number;
    totalPoints: number;
    message: string;
    buttonText: string;
    isLastPhase: boolean;
    onContinue: () => void;
}

export const PhaseCompletionModal: React.FC<PhaseCompletionModalProps> = ({
    phaseName,
    phaseNumber,
    totalPhases,
    points,
    totalPoints,
    message,
    buttonText,
    isLastPhase,
    onContinue
}) => {
    const [showCelebration, setShowCelebration] = useState(true);

    useEffect(() => {
        // Mantener la celebración visible por un momento
        const timer = setTimeout(() => setShowCelebration(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            {/* Confeti de fondo */}
            {showCelebration && (
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    {/* Partículas de confeti dispersas */}
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-3 h-3 rounded-full"
                            style={{
                                left: `${10 + Math.random() * 80}%`,
                                top: '-20px',
                                background: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#a8e6cf', '#dcedc1', '#ffd93d'][i % 8],
                                animation: `confetti-fall ${1 + Math.random() * 1}s ease-out forwards`,
                                animationDelay: `${Math.random() * 0.5}s`
                            }}
                        />
                    ))}
                </div>
            )}

            <div className={`w-full max-w-md mx-4 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-scale-in ${showCelebration ? 'animate-celebration-shake' : ''}`}>
                {/* Header con progreso */}
                <div className="bg-primary/10 px-6 py-4 border-b border-border">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                            Fase {phaseNumber} de {totalPhases} completada
                        </span>
                        <div className="flex gap-1">
                            {Array.from({ length: totalPhases }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full transition-colors ${i < phaseNumber ? 'bg-primary' : 'bg-muted'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-6 sm:p-8 text-center relative">
                    {/* Estrellas decorativas */}
                    {showCelebration && (
                        <>
                            <Star className="absolute top-4 left-6 w-6 h-6 text-yellow-400 fill-yellow-400 animate-star-spin" />
                            <Star className="absolute top-8 right-8 w-4 h-4 text-yellow-400 fill-yellow-400 animate-star-spin" style={{ animationDelay: '0.2s' }} />
                            <Star className="absolute bottom-20 left-8 w-5 h-5 text-yellow-400 fill-yellow-400 animate-star-spin" style={{ animationDelay: '0.4s' }} />
                        </>
                    )}

                    {/* Puntos prominentes */}
                    <div className={`mb-4 ${showCelebration ? 'animate-bounce-pop' : ''}`}>
                        {isLastPhase ? (
                            // Fase final - mostrar total con icono de regalo
                            <div className="flex items-center justify-center gap-2">
                                <Gift className={`w-10 h-10 text-primary ${showCelebration ? 'animate-star-spin' : ''}`} />
                                <span className="text-5xl sm:text-6xl font-bold text-primary">
                                    {totalPoints}
                                </span>
                            </div>
                        ) : (
                            // Fases intermedias - mostrar puntos ganados
                            <div>
                                <span className="text-4xl sm:text-5xl font-bold text-primary">
                                    +{points}
                                </span>
                                <span className="text-2xl font-bold text-primary ml-1">pts</span>
                            </div>
                        )}
                    </div>

                    {/* Total acumulado (solo en fases intermedias) */}
                    {!isLastPhase && (
                        <p className="text-muted-foreground text-sm mb-2">
                            Total acumulado: <span className="font-semibold text-foreground">{totalPoints} puntos</span>
                        </p>
                    )}

                    <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                        {phaseName}
                    </h2>
                    <p className="text-muted-foreground text-base mb-8 leading-relaxed">
                        {message}
                    </p>

                    {/* Barra de progreso visual */}
                    <div className="w-full bg-muted rounded-full h-3 mb-6 overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${(totalPoints / 600) * 100}%` }}
                        />
                    </div>

                    {/* Botón */}
                    <button
                        onClick={onContinue}
                        className={`w-full text-base sm:text-lg py-3 ${isLastPhase
                            ? 'sb-button-primary bg-gradient-to-r from-primary to-primary/80'
                            : 'sb-button-primary'
                            }`}
                    >
                        {isLastPhase && <Gift className="w-5 h-5" />}
                        {buttonText}
                        {!isLastPhase && <ChevronRight className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
};
