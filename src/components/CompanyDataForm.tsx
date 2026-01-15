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
      {/* Logo - responsive con dimensiones explícitas para prevenir CLS */}
      <div className="absolute top-3 left-3 sm:top-6 sm:left-6 z-10">
        <img
          src="https://www.supportbrigades.com/wp-content/uploads/2025/09/xxpfbFuUGcA4.png"
          alt="Support Brigades"
          width={160}
          height={40}
          className="h-10 sm:h-14 lg:h-16 w-auto"
        />
      </div>

      <div className="min-h-full flex items-start justify-center xl:justify-between gap-x-8 lg:gap-x-12 px-2 sm:px-6 lg:px-12">
        {/* PANEL IZQUIERDO: Texto - Solo en xl+ */}
        <div className="hidden xl:flex xl:flex-col xl:flex-1 xl:pl-8 xl:pt-[220px] 2xl:pt-[260px] xl:pb-8 xl:justify-start xl:min-h-[calc(100vh-4rem)]">
          {/* Texto Animado - Centrado verticalmente */}
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

          {/* VIDEO TUTORIAL - Comentado temporalmente hasta tener el video definitivo
          <div className="max-w-lg 2xl:max-w-xl mt-16">
            <div className="video-glow-border rounded-xl p-[2px]">
              <div className="relative rounded-xl overflow-hidden shadow-2xl bg-slate-900">
                <div className="aspect-video overflow-hidden">
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
                      <img
                        src="https://img.youtube.com/vi/v_L4lTXpie4/maxresdefault.jpg"
                        alt="Tutorial de la herramienta de Diagnóstico SST"
                        className="w-full h-full object-cover scale-105"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors scale-105" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                          <Play className="w-7 h-7 sm:w-9 sm:h-9 text-primary ml-1" fill="currentColor" />
                        </div>
                      </div>
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
          */}
        </div>
        {/* FORMULARIO - Optimizado para tablets */}
        <div className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-md 2xl:max-w-xl pt-20 sm:pt-14 md:pt-24 lg:pt-28 pb-4">
          {/* Título y Descripción estáticos - Solo visible en móvil y tablet (<xl) */}
          <div className="xl:hidden text-center mb-3 md:mb-6 px-2 md:px-8">
            <h1 className="text-fluid-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3 md:mb-4 drop-shadow-sm">
              ¿Tu empresa cumple con la Ley de Seguridad y Salud en el Trabajo?
            </h1>
            <p className="text-white/90 text-fluid-base md:text-xl lg:text-2xl font-medium max-w-prose mx-auto">
              Obtén un diagnóstico rápido y cumple con la normativa sin complicaciones.
            </p>
          </div>

          {/* Flecha animada indicadora - Solo visible en móviles */}
          <div className="sm:hidden flex justify-center mb-2">
            <div className="animate-arrow-bounce-soft text-white/60">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>

          {/* Contenedor con animación de borde brillante - Solo visible en móviles */}
          <div className="sm:hidden video-glow-border rounded-xl p-[2px]">
            <div className="sb-card p-3">
              <div className="text-center mb-4">
                <h2 className="text-fluid-xl font-bold text-foreground mb-1 leading-tight">
                  Diagnóstico de Cumplimiento SST
                </h2>
                <p className="text-muted-foreground text-fluid-xs italic">
                  Completa tus datos para iniciar la evaluación
                </p>
              </div>
              {/* GRILLA DEL FORMULARIO - Móvil */}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-fluid-sm">
                <div>
                  <label htmlFor="nombre-mobile" className="block text-fluid-xs font-medium text-foreground mb-1">Tu nombre y apellidos completos *</label>
                  <input type="text" id="nombre-mobile" value={formData.nombre} onChange={(e) => handleInputChange('nombre', e.target.value)} className="w-full input-fluid border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background" placeholder="Ingresa tu nombre y apellidos completos" />
                  {errors.nombre && (<p className="text-destructive text-sm mt-1">{errors.nombre}</p>)}
                </div>
                <div>
                  <label htmlFor="empresa-mobile" className="block text-fluid-xs font-medium text-foreground mb-1">Razón Social *</label>
                  <input type="text" id="empresa-mobile" value={formData.empresa} onChange={(e) => handleInputChange('empresa', e.target.value)} className="w-full input-fluid border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background" placeholder="Nombre de tu empresa" />
                  {errors.empresa && (<p className="text-destructive text-sm mt-1">{errors.empresa}</p>)}
                </div>
                <CargoDropdown
                  value={formData.cargo}
                  onChange={(value) => handleInputChange('cargo', value)}
                  error={errors.cargo}
                />
                <div>
                  <label htmlFor="email-mobile" className="block text-fluid-xs font-medium text-foreground mb-1">Correo corporativo *</label>
                  <input type="email" id="email-mobile" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full input-fluid border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background" placeholder="nombre@empresa.com" />
                  {errors.email && (<p className="text-destructive text-xs mt-1">{errors.email}</p>)}
                </div>
                <div>
                  <label htmlFor="telefono-mobile" className="block text-fluid-xs font-medium text-foreground mb-1">Número de contacto *</label>
                  <input type="tel" inputMode="tel" autoComplete="tel" id="telefono-mobile" value={formData.telefono} onChange={(e) => handleInputChange('telefono', e.target.value)} className="w-full input-fluid border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background" placeholder="+51 999 999 999" />
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
                  <label htmlFor="trabajadores-mobile" className="block text-fluid-xs font-medium text-foreground mb-1">Número de trabajadores *</label>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" id="trabajadores-mobile" value={formData.numeroTrabajadores || ''} onChange={(e) => handleInputChange('numeroTrabajadores', parseInt(e.target.value) || 0)} className="w-full input-fluid border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background" placeholder="Ej: 25" />
                  {errors.numeroTrabajadores && (<p className="text-destructive text-xs mt-1">{errors.numeroTrabajadores}</p>)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="tratamiento-datos-mobile"
                      defaultChecked={true}
                      className="mt-1 w-5 h-5 min-w-[20px] rounded border-input text-primary focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="tratamiento-datos-mobile" className="text-fluid-xs text-foreground cursor-pointer">
                      Aceptación del{' '}
                      <a
                        href="https://www.supportbrigades.com/politica-de-tratamiento-de-datos-personales/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Tratamiento de Datos Personales
                      </a>
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="usos-adicionales-mobile"
                      defaultChecked={true}
                      className="mt-1 w-5 h-5 min-w-[20px] rounded border-input text-primary focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="usos-adicionales-mobile" className="text-fluid-xs text-foreground cursor-pointer">
                      Autorización para{' '}
                      <a
                        href="https://www.supportbrigades.com/autorizacion-de-usos-adicionales-de-datos-personales/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Usos Adicionales de Datos Personales
                      </a>
                    </label>
                  </div>
                </div>

                <div>
                  <button type="submit" className="w-full sb-button-primary">
                    Comenzar Diagnóstico
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Formulario sin animación - Visible en sm+ */}
          <div className="hidden sm:block sb-card p-3 sm:p-5 md:p-8 lg:p-10">
            <div className="text-center mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-fluid-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1 sm:mb-2 leading-tight">
                Diagnóstico de Cumplimiento SST
              </h2>
              <p className="text-muted-foreground text-fluid-xs md:text-base italic">
                Completa tus datos para iniciar la evaluación
              </p>
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
                {/* MEJORA: inputMode="tel" + autoComplete para teclado móvil optimizado */}
                <input type="tel" inputMode="tel" autoComplete="tel" id="telefono" value={formData.telefono} onChange={(e) => handleInputChange('telefono', e.target.value)} className="w-full input-fluid border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background" placeholder="+51 999 999 999" />
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
                {/* MEJORA: type="text" + inputMode="numeric" + pattern para teclado numérico en iOS/Android */}
                <input type="text" inputMode="numeric" pattern="[0-9]*" id="trabajadores" value={formData.numeroTrabajadores || ''} onChange={(e) => handleInputChange('numeroTrabajadores', parseInt(e.target.value) || 0)} className="w-full input-fluid border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background" placeholder="Ej: 25" />
                {errors.numeroTrabajadores && (<p className="text-destructive text-xs mt-1">{errors.numeroTrabajadores}</p>)}
              </div>

              {/* MEJORA ACCESIBILIDAD: Checkboxes con id/htmlFor y tamaño aumentado (w-5 h-5) */}
              <div className="sm:col-span-2 space-y-2 sm:space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="tratamiento-datos"
                    defaultChecked={true}
                    className="mt-1 w-5 h-5 min-w-[20px] rounded border-input text-primary focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="tratamiento-datos" className="text-fluid-xs text-foreground cursor-pointer">
                    Aceptación del{' '}
                    <a
                      href="https://www.supportbrigades.com/politica-de-tratamiento-de-datos-personales/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Tratamiento de Datos Personales
                    </a>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="usos-adicionales"
                    defaultChecked={true}
                    className="mt-1 w-5 h-5 min-w-[20px] rounded border-input text-primary focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="usos-adicionales" className="text-fluid-xs text-foreground cursor-pointer">
                    Autorización para{' '}
                    <a
                      href="https://www.supportbrigades.com/autorizacion-de-usos-adicionales-de-datos-personales/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Usos Adicionales de Datos Personales
                    </a>
                  </label>
                </div>
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