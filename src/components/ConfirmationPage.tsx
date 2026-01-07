import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ConfirmationPageProps {
  email: string;
  onRestart: () => void;
}

export const ConfirmationPage: React.FC<ConfirmationPageProps> = ({ email, onRestart }) => {
  return (
    <div className="min-h-[100dvh] py-8 sm:py-12 px-3 sm:px-4 flex items-center justify-center overflow-x-hidden">
      <div className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-xl lg:max-w-2xl mx-auto">
        {/* Main Card */}
        <div className="sb-card text-center">
          {/* Success Icon + Logo */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-sb-success/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-sb-success" />
            </div>
            <img
              src="https://www.supportbrigades.com/wp-content/uploads/2025/09/xxpfbFuUGcA4.png"
              alt="Support Brigades"
              className="h-12 mx-auto"
            />
          </div>

          {/* Main Content */}
          <div className="mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-4 sm:mb-6">
              ¡Tu informe está en camino!</h1>

            <div className="space-y-3 sm:space-y-4 text-base sm:text-lg text-muted-foreground">
              <p>
                Gracias por completar la evaluación. Hemos enviado un informe detallado con el análisis de riesgos y la multa potencial estimada a la siguiente dirección de correo electrónico:
              </p>

              <div className="bg-muted p-4 rounded-lg">
                <p className="font-semibold text-foreground text-xl">
                  {email}
                </p>
              </div>

              <p>
                Nuestro equipo se pondrá en contacto contigo si se requiere información adicional. Valoramos tu compromiso con un entorno de trabajo seguro.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onRestart}
            className="sb-button-secondary text-lg px-8 py-3"
          >
            Finalizar
          </button>

          {/* Additional Information */}
          <div className="mt-8 p-6 bg-muted rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">
              ¿Qué sigue ahora?
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2 text-left">
              <li>• Recibirás el reporte detallado en tu correo en los próximos minutos</li>
              <li>• Un especialista de Support Brigades te contactará para explicar los resultados</li>
              <li>• Te ayudaremos a desarrollar un plan de acción para minimizar riesgos</li>
              <li>• Podrás solicitar una consultoría personalizada si lo deseas</li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="mt-6 text-sm text-muted-foreground">
            <p>
              ¿Tienes preguntas? Contáctanos en:
              <span className="font-medium text-primary ml-1">info@supportbrigades.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};