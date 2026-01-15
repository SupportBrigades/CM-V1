import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/hooks/useRiskCalculator';

interface RiskExposureWidgetProps {
    amount: number;
    isIncreasing: boolean;
    lastAddedFine?: number;
}

/**
 * Widget flotante móvil que muestra el riesgo acumulado de multas SUNAFIL.
 * Solo visible en móvil (< md). En desktop se usa HeaderRiskWidget.
 * Implementa "Loss Salience" con feedback visual cuando aumenta el riesgo.
 */
export const RiskExposureWidget: React.FC<RiskExposureWidgetProps> = ({
    amount,
    isIncreasing,
    lastAddedFine = 0
}) => {
    const [isPulsing, setIsPulsing] = useState(false);
    const [showAddition, setShowAddition] = useState(false);

    // Activar animación de pulso cuando aumenta el riesgo
    useEffect(() => {
        if (isIncreasing && lastAddedFine > 0) {
            setIsPulsing(true);
            setShowAddition(true);

            // Remover animación después de 2 segundos
            const pulseTimer = setTimeout(() => setIsPulsing(false), 2000);
            const additionTimer = setTimeout(() => setShowAddition(false), 2500);

            return () => {
                clearTimeout(pulseTimer);
                clearTimeout(additionTimer);
            };
        }
    }, [isIncreasing, lastAddedFine, amount]);

    // No mostrar si no hay riesgo
    if (amount === 0) return null;

    return (
        <div id="tour-risk-widget" className="risk-widget-mobile">
            {/* Indicador de incremento - sale hacia abajo */}
            {showAddition && lastAddedFine > 0 && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 animate-float-down">
                    <span className="text-red-600 font-bold text-xs whitespace-nowrap bg-white/95 px-2 py-1 rounded-full shadow-lg border border-red-200">
                        -{formatCurrency(lastAddedFine)}
                    </span>
                </div>
            )}

            {/* Widget principal - Compacto para móvil */}
            <div
                className={`
                    flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg border
                    transition-all duration-300
                    ${isPulsing
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 border-red-400 animate-header-risk-alert shadow-red-500/50'
                        : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
                    }
                `}
            >
                {/* Ícono de advertencia */}
                <div className={`${isPulsing ? 'animate-shake-intense' : ''}`}>
                    <AlertTriangle className={`w-4 h-4 ${isPulsing ? 'text-white' : 'text-red-600'}`} />
                </div>

                {/* Contenido */}
                <div className="flex flex-col leading-tight">
                    <span className={`text-[10px] font-medium uppercase tracking-wide ${isPulsing ? 'text-white/90' : 'text-red-600/80'}`}>
                        Riesgo de Multa
                    </span>
                    <span className={`
                        text-sm font-bold tabular-nums
                        ${isPulsing ? 'text-white animate-number-grow' : 'text-red-700'}
                    `}>
                        -{formatCurrency(amount)}
                    </span>
                </div>
            </div>
        </div>
    );
};

