import React, { useState } from 'react';
import { CompanyData } from './SSTDiagnosis';
import { ChevronRight, Play } from 'lucide-react';
import TextType from './TextType';
import { CargoDropdown } from './CargoDropdown';
import { CustomDropdown } from './CustomDropdown';

interface CompanyDataFormProps {
  onSubmit: (data: CompanyData) => void;
}

const PUBLIC_EMAIL_DOMAINS = [
  'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'live.com',
  'icloud.com', 'aol.com', 'protonmail.com', 'zoho.com'
];

export const CompanyDataForm: React.FC<CompanyDataFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<CompanyData>({
    nombre: '',
    email: '',
    telefono: '',
    empresa: '',
    cargo: '',
    numeroTrabajadores: 0,
    tipoEmpresa: '',
  });

  const [errors, setErrors] = useState<{ [K in keyof CompanyData]?: string }>({});
  const [videoPlaying, setVideoPlaying] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^'\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;

    const domain = email.split('@')[1]?.toLowerCase();
    return !PUBLIC_EMAIL_DOMAINS.includes(domain);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [K in keyof CompanyData]?: string } = {};

    if (!formData.nombre.trim()) { newErrors.nombre = 'El nombre es requerido'; }
    if (!formData.email.trim()) { newErrors.email = 'El correo es requerido'; }
    else if (!validateEmail(formData.email)) { newErrors.email = 'Por favor, ingresa un correo corporativo válido'; }
    if (!formData.telefono.trim()) { newErrors.telefono = 'El teléfono es requerido'; }
    if (!formData.empresa.trim()) { newErrors.empresa = 'El nombre de la empresa es requerido'; }
    if (!formData.cargo.trim()) { newErrors.cargo = 'El cargo es requerido'; }
    if (formData.numeroTrabajadores <= 0) { newErrors.numeroTrabajadores = 'Debe ingresar un número válido de trabajadores'; }
    if (!formData.tipoEmpresa) { newErrors.tipoEmpresa = 'Debe seleccionar el tipo de empresa'; }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof CompanyData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-[100dvh] py-4 sm:py-8 px-3 sm:px-4 relative overflow-x-hidden">
      {/* Logo - responsive */}
      <div className="absolute top-3 left-3 sm:top-6 sm:left-6 z-10">
        <img
          src="https://www.supportbrigades.com/wp-content/uploads/2025/09/xxpfbFuUGcA4.png"
          alt="Support Brigades"
          className="h-10 sm:h-14 lg:h-16"
        />
      </div>

      <div className="min-h-full flex items-start justify-center xl:justify-between gap-x-8 lg:gap-x-12 px-2 sm:px-6 lg:px-12">
        {/* PANEL IZQUIERDO: Texto + Video - Solo en xl+ */}
        <div className="hidden xl:flex xl:flex-col xl:flex-1 xl:pl-8 xl:pt-[130px] 2xl:pt-[146px] xl:pb-8 xl:justify-between xl:min-h-[calc(100vh-4rem)]">
          {/* Texto Animado - Altura fija */}
          <div className="h-48 2xl:h-56">
            <TextType
              as="h1"
              text={[
                "¿Tu empresa cumple con la Ley de Seguridad y Salud en el Trabajo?",
                "Obtén un diagnóstico rápido y cumple con la normativa sin complicaciones."
              ]}
              typingSpeed={50}
              pauseDuration={3500}
              loop={true}
              className="text-fluid-hero text-white leading-tight"
              sentenceClassNames={['font-bold', 'font-light']}
            />
          </div>

          {/* Video Tutorial - Posición fija abajo */}
          <div className="max-w-lg 2xl:max-w-xl mt-16">
            {/* Wrapper para el efecto de luz */}
            <div className="video-glow-border rounded-xl p-[2px]">
              <div className="relative rounded-xl overflow-hidden shadow-2xl bg-slate-900">
                <div className="aspect-video">
                  {videoPlaying ? (
                    <iframe
                      src="https://www.youtube.com/embed/v_L4lTXpie4?autoplay=1&rel=0&modestbranding=1"
                      title="Tutorial - Cómo usar el Diagnóstico SST"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : (
                    <button
                      onClick={() => setVideoPlaying(true)}
                      className="relative w-full h-full group cursor-pointer bg-slate-900"
                    >
                      {/* Miniatura del video */}
                      <img
                        src="https://img.youtube.com/vi/v_L4lTXpie4/maxresdefault.jpg"
                        alt="Tutorial de la herramienta de Diagnóstico SST"
                        className="w-full h-full object-cover scale-105"
                      />
                      {/* Overlay oscuro */}
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors scale-105" />
                      {/* Botón de Play */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                          <Play className="w-7 h-7 sm:w-9 sm:h-9 text-primary ml-1" fill="currentColor" />
                        </div>
                      </div>
                      {/* Texto opcional */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white text-sm font-medium drop-shadow-lg">
                          ▶ Aprende a usar nuestra herramienta de Diagnóstico
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* FORMULARIO */}
        <div className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg xl:max-w-md 2xl:max-w-xl pt-14 sm:pt-16 pb-4">
          <div className="sb-card p-3 sm:p-5 lg:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-fluid-xl font-bold text-foreground mb-1 sm:mb-2 leading-tight">
                Diagnóstico de Cumplimiento SST
              </h2>
              <p className="text-muted-foreground text-fluid-xs italic">
                Completa tus datos para iniciar la evaluación
              </p>
            </div>
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-center gap-2 text-fluid-xs text-muted-foreground">
                <span className="font-medium text-primary">Paso 1 de 3</span>
                <span>•</span>
                <span>Datos de la Empresa</span>
              </div>
            </div>
            {/* GRILLA DEL FORMULARIO */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-fluid-sm">
              <div className="sm:col-span-2">
                <label htmlFor="nombre" className="block text-fluid-xs font-medium text-foreground mb-1 sm:mb-2">Tu nombre y apellidos completos *</label>
                <input type="text" id="nombre" value={formData.nombre} onChange={(e) => handleInputChange('nombre', e.target.value)} className="w-full input-fluid border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background" placeholder="Ingresa tu nombre y apellidos completos" />
                {errors.nombre && (<p className="text-destructive text-sm mt-1">{errors.nombre}</p>)}
              </div>
              <div>
                <label htmlFor="empresa" className="block text-fluid-xs font-medium text-foreground mb-1 sm:mb-2">Razón Social *</label>
                <input type="text" id="empresa" value={formData.empresa} onChange={(e) => handleInputChange('empresa', e.target.value)} className="w-full input-fluid border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background" placeholder="Nombre de tu empresa" />
                {errors.empresa && (<p className="text-destructive text-sm mt-1">{errors.empresa}</p>)}
              </div>
              <CargoDropdown
                value={formData.cargo}
                onChange={(value) => handleInputChange('cargo', value)}
                error={errors.cargo}
              />
              <div>
                <label htmlFor="email" className="block text-fluid-xs font-medium text-foreground mb-1 sm:mb-2">Correo corporativo *</label>
                <input type="email" id="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full input-fluid border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background" placeholder="nombre@empresa.com" />
                {errors.email && (<p className="text-destructive text-xs mt-1">{errors.email}</p>)}
              </div>
              <div>
                <label htmlFor="telefono" className="block text-fluid-xs font-medium text-foreground mb-1 sm:mb-2">Número de contacto *</label>
                <input type="tel" id="telefono" value={formData.telefono} onChange={(e) => handleInputChange('telefono', e.target.value)} className="w-full input-fluid border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background" placeholder="+51 999 999 999" />
                {errors.telefono && (<p className="text-destructive text-xs mt-1">{errors.telefono}</p>)}
              </div>
              <CustomDropdown
                label="Tipo de empresa *"
                value={formData.tipoEmpresa}
                onChange={(value) => handleInputChange('tipoEmpresa', value)}
                options={[
                  { value: 'micro', label: 'Micro Empresa' },
                  { value: 'pequena', label: 'Pequeña Empresa' },
                  { value: 'no_mype', label: 'No MYPE' },
                ]}
                placeholder="Tipo"
                error={errors.tipoEmpresa}
              />
              <div>
                <label htmlFor="trabajadores" className="block text-fluid-xs font-medium text-foreground mb-1 sm:mb-2">Número de trabajadores *</label>
                <input type="number" id="trabajadores" min="1" value={formData.numeroTrabajadores || ''} onChange={(e) => handleInputChange('numeroTrabajadores', parseInt(e.target.value) || 0)} className="w-full input-fluid border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background" placeholder="Ej: 25" />
                {errors.numeroTrabajadores && (<p className="text-destructive text-xs mt-1">{errors.numeroTrabajadores}</p>)}
              </div>

              {/* Casillas de aceptación de políticas */}
              <div className="sm:col-span-2 space-y-2 sm:space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="mt-1 w-4 h-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span className="text-fluid-xs text-foreground">
                    Aceptación del{' '}
                    <a
                      href="https://www.supportbrigades.com/politica-de-tratamiento-de-datos-personales/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Tratamiento de Datos Personales
                    </a>
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="mt-1 w-4 h-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">
                    Autorización para{' '}
                    <a
                      href="https://www.supportbrigades.com/autorizacion-de-usos-adicionales-de-datos-personales/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Usos Adicionales de Datos Personales
                    </a>
                  </span>
                </label>
              </div>

              <div className="sm:col-span-2">
                <button type="submit" className="w-full sb-button-primary">
                  Comenzar Diagnóstico
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};