import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Clock, CheckCircle, MessageCircle } from 'lucide-react';

interface ConfirmationPageProps {
  email: string;
  empresa: string;
  nombre: string;
  cargo: string;
  numeroTrabajadores: number;
  tipoEmpresa: 'micro' | 'pequena' | 'no_mype' | '';
  multaPotencial: number;
  hasInfractions: boolean;
  onRestart: () => void;
}

// Animation variants for staggered fade-in and slide-up effect
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

// Logo-only header design (shield icon removed per user request)

// Audit step component for the protocol steps
interface AuditStepProps {
  stepNumber: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
}

const AuditStep: React.FC<AuditStepProps> = ({ stepNumber, title, description, icon, delay }) => {
  return (
    <motion.div
      className="relative flex items-start gap-4 p-4 rounded-xl text-left
                 bg-white/60 dark:bg-slate-800/50 
                 border border-slate-200/70 dark:border-slate-700/50"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {/* Step number badge */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg 
                      bg-gradient-to-br from-[#0056b4]/10 to-[#0056b4]/20 
                      dark:from-[#0056b4]/20 dark:to-[#0056b4]/30
                      flex items-center justify-center
                      border border-[#0056b4]/20">
        <span className="text-[#0056b4] dark:text-[#4d9fff]">
          {icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-[#0056b4] dark:text-[#4d9fff] uppercase tracking-wider">
            Paso {stepNumber}
          </span>
        </div>
        <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm sm:text-base mb-1">
          {title}
        </h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

// WhatsApp configuration
const WHATSAPP_NUMBER = "51981577120";

export const ConfirmationPage: React.FC<ConfirmationPageProps> = ({
  email,
  empresa,
  nombre,
  cargo,
  numeroTrabajadores,
  tipoEmpresa,
  multaPotencial,
  hasInfractions
}) => {
  // Helper para formatear tipo de empresa
  const formatTipoEmpresa = (tipo: string) => {
    switch (tipo) {
      case 'micro': return 'Microempresa';
      case 'pequena': return 'Pequeña Empresa';
      case 'no_mype': return 'No MYPE';
      default: return tipo;
    }
  };

  // Helper para formatear multa como moneda
  const formatMulta = (monto: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(monto);
  };

  // WhatsApp URLs - diferentes según contexto
  const whatsappMessageWithInfractions = encodeURIComponent(
    `Deseo priorizar mi protocolo de *Autodiagnóstico de SST*.

*DATOS DEL INFORME*
• *Contacto:* ${nombre}
• *Cargo:* ${cargo}
• *Empresa:* ${empresa}
• *Trabajadores:* ${numeroTrabajadores}
• *Tipo:* ${formatTipoEmpresa(tipoEmpresa)}
• *Multa Potencial:* ${formatMulta(multaPotencial)}`
  );

  // Con infracciones: mensaje con datos, sin infracciones: solo abre chat
  const whatsappUrl = hasInfractions
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessageWithInfractions}`
    : `https://wa.me/${WHATSAPP_NUMBER}`;

  const auditSteps = [
    {
      icon: <UserCheck className="w-5 h-5" />,
      title: "Asignación de Estratega",
      description: "Un Consultor especializado ha sido asignado para procesar su diagnóstico y jerarquizar sus prioridades legales.",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Hoja de Ruta de Mitigación",
      description: "Su consultor coordinará la sesión técnica para revisar sus hallazgos y activar el plan de acción correspondiente.",
    },
  ];

  return (
    <div className="min-h-[100dvh] py-8 sm:py-12 px-3 sm:px-4 flex items-center justify-center overflow-x-hidden">
      <motion.div
        className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-xl lg:max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Glassmorphism Card */}
        <motion.div
          className="relative overflow-hidden rounded-2xl p-6 sm:p-8 lg:p-10 text-center
                     bg-white/85 dark:bg-slate-900/85
                     backdrop-blur-md
                     border border-slate-200/50 dark:border-slate-700/40
                     shadow-2xl shadow-slate-900/10 dark:shadow-black/30"
          style={{
            boxShadow: `
              0 4px 6px -1px rgba(0, 0, 0, 0.05),
              0 10px 15px -3px rgba(0, 0, 0, 0.08),
              0 25px 50px -12px rgba(0, 0, 0, 0.12)
            `,
          }}
          variants={itemVariants}
        >
          {/* Subtle gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              background: 'radial-gradient(ellipse at top center, rgba(0, 86, 180, 0.04) 0%, transparent 50%)',
            }}
          />

          {/* Logo - Support Brigades (Color version) */}
          <motion.div className="mb-8 relative z-10" variants={itemVariants}>
            <a href="https://www.supportbrigades.com" target="_blank" rel="noopener noreferrer">
              <img
                src="https://www.supportbrigades.com/wp-content/uploads/2021/01/logo-support-brigades-1.png"
                alt="Support Brigades"
                className="h-14 sm:h-16 mx-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </a>
          </motion.div>

          {/* Main Header - Conditional based on infractions */}
          <motion.div className="mb-6 relative z-10" variants={itemVariants}>
            <h1 className="text-xl sm:text-2xl lg:text-[1.7rem] font-extrabold 
                          text-slate-800 dark:text-slate-100
                          tracking-tight leading-tight uppercase">
              {hasInfractions
                ? 'Informe de Riesgo Patrimonial Generado'
                : '¡Felicitaciones! Cumplimiento Verificado'}
            </h1>
          </motion.div>

          {/* Multa Potencial Display - Added for 320px UX */}
          {hasInfractions && (
            <motion.div className="mb-6 relative z-10" variants={itemVariants}>
              <div className="inline-block px-6 py-4 rounded-2xl bg-red-50 border border-red-100 dark:bg-red-900/20 dark:border-red-800/30 shadow-sm">
                <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
                  Riesgo Patrimonial Estimado
                </p>
                <p className="text-2xl xs:text-3xl font-extrabold text-red-700 dark:text-red-500 tabular-nums">
                  {formatMulta(multaPotencial)}
                </p>
              </div>
            </motion.div>
          )}

          {/* Body Content - Conditional message */}
          <motion.div className="mb-6 relative z-10" variants={itemVariants}>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 
                         leading-relaxed max-w-lg mx-auto">
              {hasInfractions ? (
                <>
                  El informe con el {' '}
                  <strong className="text-slate-800 dark:text-slate-100">Autodiagnóstico de Cumplimiento de SST</strong>{' '}
                  ha sido enviado a:
                </>
              ) : (
                <>
                  Hemos enviado {' '}
                  <strong className="text-slate-800 dark:text-slate-100">recursos gratuitos de SST</strong>{' '}
                  a:
                </>
              )}
            </p>

            {/* Email display - Secure verified field */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2.5 mt-4 rounded-lg
                        bg-slate-50 dark:bg-slate-800
                        border border-slate-200 dark:border-slate-600/50"
              style={{
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.04)',
              }}
            >
              <CheckCircle className="w-4 h-4 text-[#0056b4] flex-shrink-0" />
              <span className="font-semibold text-base sm:text-lg text-slate-700 dark:text-slate-200 break-all">
                {email}
              </span>
            </motion.div>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 
                         leading-relaxed max-w-lg mx-auto mt-4">
              {hasInfractions
                ? 'Este documento marca el inicio de su protocolo de cumplimiento legal ante SUNAFIL.'
                : 'Su Sistema de Gestión demuestra un alto nivel de madurez. Continúe fortaleciendo su cultura de seguridad.'}
            </p>
          </motion.div>

          {/* Audit Protocol Steps - Only shown if there are infractions */}
          {hasInfractions && (
            <motion.div
              className="p-4 sm:p-5 rounded-xl relative z-10 mb-6
                        bg-slate-50/80 dark:bg-slate-800/50
                        border border-slate-200/60 dark:border-slate-700/40"
              variants={itemVariants}
            >
              <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100 
                            mb-4 tracking-tight text-left uppercase">
                Protocolo de Cumplimiento Activado
              </h3>

              {/* Audit steps */}
              <div className="space-y-3">
                {auditSteps.map((step, index) => (
                  <AuditStep
                    key={index}
                    stepNumber={index + 1}
                    icon={step.icon}
                    title={step.title}
                    description={step.description}
                    delay={0.6 + index * 0.15}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* WhatsApp CTA - Different text based on context */}
          <motion.div className="relative z-10" variants={itemVariants}>
            <motion.a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex flex-col items-center justify-center
                        w-full sm:w-auto px-8 py-4 rounded-xl
                        bg-gradient-to-br from-[#0056b4] via-[#004a9e] to-[#003d82]
                        hover:from-[#0066d4] hover:via-[#0056b4] hover:to-[#004a9e]
                        shadow-lg shadow-[#0056b4]/25
                        hover:shadow-xl hover:shadow-[#0056b4]/35
                        transition-all duration-300 ease-out
                        focus:outline-none focus:ring-2 focus:ring-[#0056b4]/50 focus:ring-offset-2
                        dark:focus:ring-offset-slate-900"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {/* Button main text with icon */}
              <span className="flex items-center gap-2 text-white font-bold text-base sm:text-lg uppercase tracking-wide">
                <MessageCircle className="w-5 h-5" />
                {hasInfractions
                  ? 'Priorizar Protocolo vía WhatsApp'
                  : 'Contactar vía WhatsApp'}
              </span>

              {/* Button caption */}
              <span className="text-white/80 text-xs sm:text-sm mt-1 font-normal">
                {hasInfractions
                  ? 'Contactar con el Consultor asignado para validación inmediata'
                  : '¿Tienes preguntas? Estamos para ayudarte'}
              </span>
            </motion.a>
          </motion.div>

          {/* Contact Information - Minimal, professional */}
          <motion.div
            className="mt-6 text-xs text-slate-500 dark:text-slate-500 relative z-10"
            variants={itemVariants}
          >
            <p>
              Consultas técnicas:{' '}
              <a
                href="mailto:contactenos@supportbrigades.com"
                className="text-[#0056b4] dark:text-[#4d9fff] hover:underline underline-offset-2"
              >
                contactenos@supportbrigades.com
              </a>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};