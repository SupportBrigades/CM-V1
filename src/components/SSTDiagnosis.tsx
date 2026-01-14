import React, { useState } from 'react';
import { CompanyDataForm } from './CompanyDataForm';
import { InteractiveQuestionnaire } from './InteractiveQuestionnaire';
import { ConfirmationPage } from './ConfirmationPage';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

// Loader component for the loading overlay
const Loader = () => (
  <div className="flex flex-col items-center justify-center space-y-2">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    <p className="text-lg font-semibold">Procesando diagnóstico...</p>
  </div>
);

export interface CompanyData {
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  cargo: string;
  numeroTrabajadores: number;
  tipoEmpresa: 'micro' | 'pequena' | 'no_mype' | '';
}

export interface QuestionnaireData {
  [key: string]: 'si' | 'no';
}

export const SSTDiagnosis: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [companyData, setCompanyData] = useState<CompanyData>({
    nombre: '',
    email: '',
    telefono: '',
    empresa: '',
    cargo: '',
    numeroTrabajadores: 0,
    tipoEmpresa: '',
  });
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData>({});
  const [calculatedFine, setCalculatedFine] = useState<number>(0);
  const [hasInfractions, setHasInfractions] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompanyDataSubmit = (data: CompanyData) => {
    setCompanyData(data);
    setCurrentStep(2);
  };

  const handleQuestionnaireComplete = async (data: QuestionnaireData, totalFine: number, infractions: boolean) => {
    // Debug logs solo en desarrollo
    if (import.meta.env.DEV) {
      console.log("Estado de companyData al iniciar envío:", companyData);
      console.log("Multa calculada:", totalFine);
      console.log("Tiene infracciones:", infractions);
    }
    setQuestionnaireData(data);
    setCalculatedFine(totalFine);
    setHasInfractions(infractions);
    setIsLoading(true);
    setError(null);

    const payload = {
      nombre: companyData.nombre,
      email: companyData.email,
      telefono: companyData.telefono,
      empresa: companyData.empresa,
      cargo: companyData.cargo,
      numero_trabajadores: companyData.numeroTrabajadores,
      tipo_empresa: companyData.tipoEmpresa,
      respuestas: data
    };

    if (import.meta.env.DEV) {
      console.log("Enviando este payload al backend:", payload);
    }

    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/diagnostico`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('La respuesta del servidor no fue exitosa.');
      }

      setCurrentStep(3);
    } catch (error) {
      setError("Ocurrió un error al procesar el diagnóstico. Por favor, inténtalo de nuevo más tarde.");
      console.error("Error en el diagnóstico:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setCompanyData({
      nombre: '',
      email: '',
      telefono: '',
      empresa: '',
      cargo: '',
      numeroTrabajadores: 0,
      tipoEmpresa: '',
    });
    setQuestionnaireData({});
    setError(null);
  };

  return (
    <div className="min-h-screen">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader />
        </div>
      )}

      {currentStep === 1 && (
        <CompanyDataForm onSubmit={handleCompanyDataSubmit} />
      )}
      {currentStep === 2 && (
        <div className="w-full px-3 sm:px-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          <InteractiveQuestionnaire
            companyData={companyData}
            onComplete={handleQuestionnaireComplete}
            onBack={() => setCurrentStep(1)}
          />
        </div>
      )}
      {currentStep === 3 && (
        <ConfirmationPage
          email={companyData.email}
          empresa={companyData.empresa}
          nombre={companyData.nombre}
          cargo={companyData.cargo}
          numeroTrabajadores={companyData.numeroTrabajadores}
          tipoEmpresa={companyData.tipoEmpresa}
          multaPotencial={calculatedFine}
          hasInfractions={hasInfractions}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};