import React, { lazy, Suspense } from 'react';

// Code Splitting: Carga diferida de SSTDiagnosis
// Esto reduce el bundle inicial y mejora el tiempo de First Contentful Paint
const SSTDiagnosis = lazy(() =>
  import('@/components/SSTDiagnosis').then(module => ({
    default: module.SSTDiagnosis
  }))
);

// Componente de carga que aparece mientras se descarga SSTDiagnosis
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-lg font-medium text-muted-foreground">Cargando diagnóstico...</p>
    </div>
  </div>
);

const Index = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SSTDiagnosis />
    </Suspense>
  );
};

export default Index;
