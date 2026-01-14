// Configuración de las 3 fases del cuestionario SST
// Las preguntas se agrupan por temas para mejorar la experiencia del usuario

export interface Phase {
    id: number;
    name: string;
    description: string;
    questionIds: string[];
    points: number; // Puntos ganados al completar esta fase
    totalPoints: number; // Puntos acumulados al completar
    progressMessage: string; // Mensaje del modal
    buttonText: string; // Texto del botón
}

// ============================================
// MODELO DE RIESGO SUNAFIL - LOSS SALIENCE
// ============================================

export type RiskLevel = 'Leves' | 'Grave' | 'Muy Grave';

export interface QuestionRisk {
    riskLevel: RiskLevel;
    baseUIT: number; // UITs base según tabla SUNAFIL
    description: string; // Descripción de la infracción
}

// Valor UIT vigente 2026 (actualizar anualmente)
export const UIT_VALUE = 5500;

// Multiplicador por tamaño de empresa según número de trabajadores
export const getCompanyMultiplier = (numTrabajadores: number): number => {
    if (numTrabajadores <= 10) return 1;      // Micro
    if (numTrabajadores <= 100) return 1.5;   // Pequeña
    if (numTrabajadores <= 200) return 2;     // Mediana
    return 2.5;                                // Grande
};

// Multas base por nivel de riesgo (en UITs) según Tabla SUNAFIL
export const RISK_LEVEL_FINES: Record<RiskLevel, { min: number; max: number }> = {
    'Leves': { min: 0.20, max: 1.00 },
    'Grave': { min: 2.00, max: 10.00 },
    'Muy Grave': { min: 6.00, max: 25.00 }
};

// Mapeo de cada pregunta a su nivel de riesgo según normativa SUNAFIL
// Sincronizado con backend constants.py - Fuente oficial
export const QUESTION_RISKS: Record<string, QuestionRisk> = {
    // Fase 1: Organización y Política
    q1: { riskLevel: 'Grave', baseUIT: 3.0, description: 'No contar con Política de SST documentada' },
    q2: { riskLevel: 'Leves', baseUIT: 0.5, description: 'No difundir la política a trabajadores' },
    q3: { riskLevel: 'Grave', baseUIT: 3.0, description: 'Falta de liderazgo visible de la alta dirección' },
    q4: { riskLevel: 'Grave', baseUIT: 5.0, description: 'No contar con RISST aprobado' },
    q5: { riskLevel: 'Leves', baseUIT: 0.5, description: 'No entregar RISST a trabajadores' },
    q6: { riskLevel: 'Grave', baseUIT: 5.0, description: 'No contar con Comité o Supervisor de SST' },
    q7: { riskLevel: 'Leves', baseUIT: 0.5, description: 'Proceso de elección del CSST no documentado' },
    q8: { riskLevel: 'Grave', baseUIT: 4.0, description: 'Miembros del CSST sin capacitación' },
    q9: { riskLevel: 'Grave', baseUIT: 3.0, description: 'CSST sin reuniones mensuales o Libro de Actas' },
    q10: { riskLevel: 'Grave', baseUIT: 4.0, description: 'No realizar estudio de línea base' },
    q11: { riskLevel: 'Muy Grave', baseUIT: 12.0, description: 'No contar con Matriz IPERC' },
    q12: { riskLevel: 'Grave', baseUIT: 5.0, description: 'IPERC desactualizado' },
    q13: { riskLevel: 'Grave', baseUIT: 3.0, description: 'Trabajadores sin participación en IPERC' },
    q14: { riskLevel: 'Grave', baseUIT: 4.0, description: 'No contar con Mapa de Riesgos' },

    // Fase 2: Prevención y Control
    q15: { riskLevel: 'Grave', baseUIT: 5.0, description: 'No tener Plan Anual de SST con presupuesto' },
    q16: { riskLevel: 'Grave', baseUIT: 4.0, description: 'No contar con Programa de Capacitaciones' },
    q17: { riskLevel: 'Grave', baseUIT: 4.0, description: 'No realizar las 4 capacitaciones obligatorias' },
    q18: { riskLevel: 'Grave', baseUIT: 4.0, description: 'No realizar inducción SST a nuevos trabajadores' },
    q19: { riskLevel: 'Leves', baseUIT: 1.0, description: 'Capacitaciones sin documentar' },
    q20: { riskLevel: 'Muy Grave', baseUIT: 10.0, description: 'No aplicar controles de jerarquía IPERC' },
    q21: { riskLevel: 'Grave', baseUIT: 5.0, description: 'No entregar EPP adecuados' },
    q22: { riskLevel: 'Leves', baseUIT: 0.5, description: 'Sin registro de entrega de EPP' },
    q23: { riskLevel: 'Grave', baseUIT: 4.0, description: 'Sin capacitación en uso de EPP' },
    q24: { riskLevel: 'Muy Grave', baseUIT: 12.0, description: 'Sin PETS para tareas de alto riesgo' },
    q25: { riskLevel: 'Grave', baseUIT: 5.0, description: 'Sin Plan de Emergencias' },
    q26: { riskLevel: 'Grave', baseUIT: 5.0, description: 'Brigadas sin conformar o capacitar' },
    q27: { riskLevel: 'Grave', baseUIT: 4.0, description: 'Sin simulacros de emergencia' },

    // Fase 3: Vigilancia y Mejora
    q28: { riskLevel: 'Muy Grave', baseUIT: 15.0, description: 'Sin Exámenes Médicos Ocupacionales' },
    q29: { riskLevel: 'Grave', baseUIT: 5.0, description: 'Sin monitoreo de agentes ocupacionales' },
    q30: { riskLevel: 'Grave', baseUIT: 5.0, description: 'Sin verificar cumplimiento de contratas' },
    q31: { riskLevel: 'Grave', baseUIT: 4.0, description: 'Sin seguimiento a objetivos del Plan' },
    q32: { riskLevel: 'Grave', baseUIT: 5.0, description: 'Sin procedimiento de investigación de accidentes' },
    q33: { riskLevel: 'Grave', baseUIT: 6.0, description: 'Sin auditoría obligatoria del SGSST' },
    q34: { riskLevel: 'Grave', baseUIT: 5.0, description: 'Sin registro de accidentes' },
    q35: { riskLevel: 'Grave', baseUIT: 5.0, description: 'Sin registro de exámenes médicos' },
    q36: { riskLevel: 'Grave', baseUIT: 4.0, description: 'Sin registro de monitoreo de agentes' },
    q37: { riskLevel: 'Grave', baseUIT: 3.0, description: 'Sin registro de inspecciones internas' },
    q38: { riskLevel: 'Leves', baseUIT: 2.0, description: 'Sin registro de estadísticas SST' },
    q39: { riskLevel: 'Leves', baseUIT: 1.0, description: 'Sin registro de equipos de emergencia' },
    q40: { riskLevel: 'Grave', baseUIT: 4.0, description: 'Sin registro de capacitaciones' },
    q41: { riskLevel: 'Grave', baseUIT: 5.0, description: 'Sin registro de auditorías' }
};

// Función para calcular multa potencial de una pregunta
export const calculateQuestionFine = (
    questionId: string,
    numTrabajadores: number
): number => {
    const risk = QUESTION_RISKS[questionId];
    if (!risk) return 0;

    const multiplier = getCompanyMultiplier(numTrabajadores);
    return Math.round(risk.baseUIT * UIT_VALUE * multiplier);
};

// Preguntas exentas para empresas MYPE (micro y pequeña)
export const PREGUNTAS_EXENTAS_MYPE = ['q36', 'q37', 'q38', 'q39', 'q41'];

// Todas las preguntas organizadas por ID - Tono Consultor Legal
export const QUESTIONS: Record<string, string> = {
    // Fase 1: Cimentación de la Protección Legal
    q1: '¿Cuenta su organización con una Política de Seguridad y Salud en el Trabajo formalizada que respalde su cumplimiento ante fiscalizaciones?',
    q2: '¿Puede evidenciar que todos sus trabajadores conocen y han recibido la Política de Seguridad y Salud?',
    q3: '¿La gerencia participa activamente en la gestión de seguridad y salud con evidencia documentada?',
    q4: '¿Su empresa cuenta con un Reglamento Interno de Seguridad y Salud en el Trabajo aprobado que la proteja legalmente?',
    q5: '¿Puede acreditar la entrega formal del Reglamento Interno de Seguridad a cada trabajador con cargo firmado?',
    q6: '¿Su organización tiene constituido el Comité o Supervisor de Seguridad y Salud exigido por ley?',
    q7: '¿Dispone de la documentación completa del proceso de elección del Comité o designación del Supervisor de Seguridad?',
    q8: '¿Los miembros del Comité o el Supervisor de Seguridad cuentan con la formación acreditada que exige la norma?',
    q9: '¿El Comité o Supervisor de Seguridad mantiene sesiones periódicas con actas que demuestren su funcionamiento?',
    q10: '¿Su empresa realizó el diagnóstico inicial del Sistema de Gestión de Seguridad que establece la Ley 29783?',
    q11: '¿Cuenta con la Matriz de Identificación de Peligros, Evaluación de Riesgos y Controles para cada puesto de trabajo?',
    q12: '¿Su Matriz de Peligros y Riesgos está vigente y actualizada según los plazos normativos?',
    q13: '¿Puede demostrar la participación documentada de los trabajadores en la identificación de peligros y riesgos?',
    q14: '¿Su instalación exhibe el Mapa de Riesgos en un lugar visible como exige la normativa?',

    // Fase 2: Blindaje Operativo y Control de Riesgos
    q15: '¿Su Plan Anual de Seguridad y Salud cuenta con presupuesto asignado y aprobado por la dirección?',
    q16: '¿Dispone de un Programa de Capacitaciones planificado que garantice las competencias en seguridad y salud?',
    q17: '¿Puede acreditar el cumplimiento de las 4 capacitaciones mínimas anuales exigidas por ley?',
    q18: '¿Todo trabajador nuevo recibe y firma la inducción de seguridad antes de iniciar labores?',
    q19: '¿Las capacitaciones cuentan con registros que demuestren su ejecución y asistencia?',
    q20: '¿Su empresa implementa controles de riesgo siguiendo la jerarquía establecida en la norma?',
    q21: '¿Garantiza la provisión de Equipos de Protección Personal certificados y adecuados a cada riesgo identificado?',
    q22: '¿Cuenta con registros firmados de entrega de Equipos de Protección que acrediten su asignación?',
    q23: '¿Los trabajadores fueron instruidos en el uso, cuidado y limitaciones de sus Equipos de Protección?',
    q24: '¿Las actividades de alto riesgo cuentan con Procedimientos Escritos de Trabajo Seguro?',
    q25: '¿Su Plan de Emergencias está formalizado y difundido para responder ante contingencias?',
    q26: '¿Las brigadas de emergencia están constituidas, entrenadas y equipadas?',
    q27: '¿Puede evidenciar la ejecución de simulacros con la frecuencia que exige la norma?',

    // Fase 3: Estrategia de Defensa y Mejora Continua
    q28: '¿Sus trabajadores cuentan con Exámenes Médicos Ocupacionales vigentes según protocolo?',
    q29: '¿Realiza monitoreos de agentes físicos, químicos y biológicos en el ambiente laboral?',
    q30: '¿Gestiona y verifica el cumplimiento de seguridad de sus contratistas y subcontratistas?',
    q31: '¿Efectúa medición y seguimiento documentado de los objetivos de seguridad y salud?',
    q32: '¿Cuenta con un procedimiento formal para investigar accidentes e implementar acciones correctivas?',
    q33: '¿Ha ejecutado la auditoría del Sistema de Gestión de Seguridad con la periodicidad que establece la ley?',
    q34: '¿Mantiene actualizado el Registro obligatorio de accidentes e incidentes laborales?',
    q35: '¿Conserva el Registro de vigilancia de la salud de sus trabajadores?',
    q36: '¿Documenta los resultados de monitoreos ocupacionales en el registro correspondiente?',
    q37: '¿Las inspecciones internas de seguridad están registradas y con acciones de seguimiento?',
    q38: '¿Calcula y registra los indicadores estadísticos de accidentabilidad?',
    q39: '¿Controla y registra el mantenimiento de equipos de emergencia (extintores, botiquines)?',
    q40: '¿Administra un registro centralizado de todas las capacitaciones e inducciones impartidas?',
    q41: '¿Conserva evidencia documental de las auditorías realizadas al Sistema de Gestión?'
};

// Explicaciones contextuales para cada pregunta (tooltips) - Estructura: Definición + Riesgo Legal
export const QUESTION_TOOLTIPS: Record<string, string> = {
    q1: 'La Política de Seguridad y Salud es un documento firmado por la gerencia que establece el compromiso de la empresa con la protección de todos los trabajadores. **Riesgo Legal:** Su ausencia es una infracción grave que impide demostrar compromiso preventivo ante SUNAFIL.',
    q2: 'La política debe ser comunicada a todos los trabajadores mediante charlas, correos, carteles o firma de recepción. **Riesgo Legal:** Sin evidencia de difusión, la empresa no puede demostrar que los trabajadores conocían las reglas de seguridad.',
    q3: 'El liderazgo se demuestra cuando la gerencia participa en reuniones de seguridad, asigna recursos y promueve una cultura preventiva. **Riesgo Legal:** La falta de evidencia de liderazgo debilita la defensa legal en caso de accidentes.',
    q4: 'El Reglamento Interno de Seguridad y Salud en el Trabajo establece las normas, prohibiciones y sanciones propias de su empresa. **Riesgo Legal:** Su ausencia es una infracción grave sancionable con multas de hasta 10 UIT. Además, invalida cualquier sanción disciplinaria que intente aplicar ante faltas del trabajador.',
    q5: 'Cada trabajador debe recibir una copia física o digital del Reglamento y firmar un cargo de recepción. **Riesgo Legal:** Sin cargo firmado, el trabajador puede alegar desconocimiento de las normas y la empresa pierde capacidad sancionadora.',
    q6: 'El Comité de Seguridad es el órgano paritario obligatorio para empresas con 20+ trabajadores; las menores requieren un Supervisor de Seguridad. **Riesgo Legal:** No constituirlo es una infracción muy grave con multas superiores a 25 UIT y puede derivar en responsabilidad penal del empleador ante accidentes fatales.',
    q7: 'El proceso de elección debe incluir convocatoria, actas de votación y acta de instalación debidamente firmadas. **Riesgo Legal:** Sin documentación del proceso electoral, SUNAFIL puede declarar nulo al Comité o Supervisor.',
    q8: 'Los miembros del Comité o el Supervisor deben recibir capacitación en temas de seguridad para ejercer correctamente sus funciones. **Riesgo Legal:** Representantes sin formación no pueden cumplir su rol, exponiendo a la empresa a sanciones por gestión deficiente.',
    q9: 'El Comité o Supervisor debe reunirse mínimo una vez al mes y registrar acuerdos en un Libro de Actas legalizado. **Riesgo Legal:** Sin actas, no hay evidencia de funcionamiento del órgano de vigilancia, lo cual es infracción grave.',
    q10: 'El estudio de línea base es un diagnóstico inicial que evalúa el estado actual del sistema de gestión de seguridad en la empresa. **Riesgo Legal:** Su omisión impide demostrar una gestión planificada y sistemática.',
    q11: 'La Matriz de Identificación de Peligros, Evaluación de Riesgos y Controles identifica los peligros y establece los controles para cada puesto. **Riesgo Legal:** Su inexistencia es infracción muy grave. En caso de accidente, la empresa pierde toda defensa legal al no poder demostrar gestión preventiva.',
    q12: 'La Matriz de Peligros y Riesgos debe actualizarse anualmente o cuando haya cambios en procesos, equipos, incidentes o nueva legislación. **Riesgo Legal:** Una matriz desactualizada equivale a no tenerla, exponiendo a la empresa a multas muy graves.',
    q13: 'Los trabajadores deben participar activamente en la identificación de peligros de sus propios puestos de trabajo. **Riesgo Legal:** Sin evidencia de participación, SUNAFIL puede cuestionar la validez de toda la evaluación de riesgos.',
    q14: 'El Mapa de Riesgos es un plano del lugar de trabajo donde se señalan visualmente los peligros identificados. **Riesgo Legal:** Su inexistencia o no exhibición es infracción grave sancionable.',
    q15: 'El Plan Anual de Seguridad incluye objetivos, metas, actividades y un presupuesto asignado para la gestión de seguridad. **Riesgo Legal:** Sin presupuesto asignado, no hay compromiso demostrable de la empresa con la prevención.',
    q16: 'El Programa de Capacitaciones debe planificar todas las formaciones en seguridad que recibirán los trabajadores durante el año. **Riesgo Legal:** Sin programa, las capacitaciones se consideran improvisadas y no sistemáticas.',
    q17: 'La ley exige mínimo 4 capacitaciones anuales en seguridad, incluyendo temas como primeros auxilios, uso de extintores y evacuación. **Riesgo Legal:** No cumplir con las 4 capacitaciones es infracción muy grave con multas de hasta 25 UIT.',
    q18: 'Todo trabajador nuevo debe recibir una inducción específica de seguridad antes de iniciar sus labores. **Riesgo Legal:** Si un trabajador sin inducción sufre un accidente, la responsabilidad del empleador es agravada.',
    q19: 'Las capacitaciones deben registrarse con listas de asistencia, temario desarrollado y evaluaciones si aplica. **Riesgo Legal:** Sin registros, las capacitaciones se consideran no realizadas ante una fiscalización.',
    q20: 'La jerarquía de controles va desde eliminar el peligro hasta usar equipos de protección: Eliminación → Sustitución → Controles de ingeniería → Controles administrativos → Equipos de Protección. **Riesgo Legal:** No aplicar esta jerarquía es infracción muy grave.',
    q21: 'Los Equipos de Protección Personal protegen al trabajador de riesgos residuales que no pudieron eliminarse por otros medios. **Riesgo Legal:** No proveerlos es infracción muy grave. En caso de accidente sin protección, el empleador asume responsabilidad civil total y posible imputación penal.',
    q22: 'Debe existir un registro firmado por cada trabajador al recibir sus equipos de protección, indicando tipo, cantidad y fecha. **Riesgo Legal:** Sin registro, no hay prueba de que la empresa cumplió con su obligación de entrega.',
    q23: 'Los trabajadores deben ser capacitados en el uso, cuidado y mantenimiento correcto de sus equipos de protección. **Riesgo Legal:** Un accidente con equipos mal usados sin capacitación previa responsabiliza al empleador.',
    q24: 'Los Procedimientos Escritos de Trabajo Seguro describen paso a paso cómo realizar tareas de alto riesgo de forma segura. **Riesgo Legal:** Su ausencia en actividades de alto riesgo es infracción muy grave. La empresa no puede demostrar que el trabajador conocía el método seguro.',
    q25: 'El Plan de Emergencias establece los procedimientos a seguir ante sismos, incendios, derrames u otras emergencias. **Riesgo Legal:** Su inexistencia es infracción muy grave. Si ocurre una emergencia sin plan, la responsabilidad del empleador es agravada.',
    q26: 'Las brigadas de emergencia (evacuación, primeros auxilios, contra incendios) deben estar conformadas y entrenadas. **Riesgo Legal:** Brigadas sin conformar o sin entrenamiento evidencian negligencia en la preparación ante emergencias.',
    q27: 'Los simulacros deben realizarse mínimo 2 veces al año para evaluar y mejorar la respuesta ante emergencias. **Riesgo Legal:** Sin simulacros, no hay evidencia de preparación del personal ante contingencias.',
    q28: 'Los Exámenes Médicos Ocupacionales (ingreso, periódico y retiro) evalúan la aptitud del trabajador y detectan enfermedades ocupacionales. **Riesgo Legal:** Su omisión es infracción muy grave. Sin ellos, la empresa no puede demostrar que el daño a la salud no fue causado por el trabajo.',
    q29: 'El monitoreo mide la exposición a agentes físicos (ruido, iluminación), químicos (gases, polvos) y otros en el ambiente laboral. **Riesgo Legal:** Sin monitoreos, la empresa no puede demostrar condiciones de trabajo seguras.',
    q30: 'Las empresas contratistas también deben cumplir con la normativa de seguridad y la empresa principal debe verificarlo. **Riesgo Legal:** El empleador principal es solidariamente responsable por accidentes de personal de contratistas.',
    q31: 'Se debe medir y revisar periódicamente el avance de los objetivos establecidos en el Plan Anual de Seguridad. **Riesgo Legal:** Sin seguimiento, el plan es letra muerta y la empresa no demuestra mejora continua.',
    q32: 'Debe existir un procedimiento claro para investigar accidentes e incidentes, identificar causas y prevenir repeticiones. **Riesgo Legal:** Sin investigación formal, la empresa no puede demostrar que tomó medidas correctivas.',
    q33: 'La auditoría del Sistema de Gestión es obligatoria cada 2 años para empresas de sectores de alto riesgo. **Riesgo Legal:** No realizarla es infracción grave. Además, la empresa pierde oportunidad de demostrar mejora continua.',
    q34: 'Registro obligatorio de todos los accidentes de trabajo ocurridos, incluyendo investigación y medidas correctivas. **Riesgo Legal:** No llevar este registro es infracción muy grave. Sin él, no hay trazabilidad de la gestión de accidentes.',
    q35: 'Registro de los exámenes médicos realizados a los trabajadores con sus resultados y recomendaciones. **Riesgo Legal:** Su ausencia impide demostrar vigilancia de la salud de los trabajadores.',
    q36: 'Registro de los monitoreos ocupacionales realizados (ruido, iluminación, agentes químicos, etc.). **Riesgo Legal:** Sin este registro, no hay evidencia de las condiciones ambientales de trabajo.',
    q37: 'Registro de las inspecciones internas de seguridad realizadas en las instalaciones. **Riesgo Legal:** Inspecciones sin registrar se consideran no realizadas ante fiscalización.',
    q38: 'Registro estadístico de accidentes, incidentes y enfermedades ocupacionales (índices de frecuencia, severidad, etc.). **Riesgo Legal:** Los indicadores permiten demostrar gestión basada en datos y tendencias de mejora.',
    q39: 'Registro y control de extintores, botiquines, equipos de emergencia y su mantenimiento. **Riesgo Legal:** Equipos de emergencia sin registro de mantenimiento pueden fallar cuando más se necesitan.',
    q40: 'Registro de todas las inducciones y capacitaciones impartidas a los trabajadores. **Riesgo Legal:** Es la evidencia principal del cumplimiento del deber de capacitar.',
    q41: 'Registro de las auditorías internas y externas realizadas al sistema de gestión de seguridad. **Riesgo Legal:** Documenta el proceso de mejora continua y cierre de brechas identificadas.'
};

// ============================================
// MENSAJES DINÁMICOS POR FASE - CONTEXTUALES
// ============================================

// Mensajes según si hay infracciones o no en la fase
export const PHASE_MESSAGES: Record<number, { withInfractions: string; noInfractions: string }> = {
    1: {
        withInfractions: '¡Primera línea de defensa validada! Ha identificado brechas críticas en su estructura normativa.',
        noInfractions: '¡Excelente! Su estructura normativa está sólidamente cimentada. Fundamentos legales verificados.'
    },
    2: {
        withInfractions: 'Controles operativos evaluados. Su mapa de vulnerabilidades toma forma.',
        noInfractions: '¡Impecable! Sus controles operativos están correctamente implementados.'
    },
    3: {
        withInfractions: 'Auditoría completada. Su Mapa de Protección de Riesgos está listo.',
        noInfractions: '¡Felicitaciones! Su Sistema de Gestión demuestra un alto nivel de madurez.'
    }
};

// Helper para obtener mensaje según infracciones
export function getPhaseMessage(phaseId: number, hasInfractions: boolean): string {
    const messages = PHASE_MESSAGES[phaseId];
    if (!messages) return '';
    return hasInfractions ? messages.withInfractions : messages.noInfractions;
}

// Texto dinámico del botón de Fase 3 según infracciones GLOBALES
export const PHASE3_BUTTON_TEXT = {
    noInfractions: 'Descargar Recursos Gratuitos',
    withInfractions: 'Descargar Mapa de Protección'
};

// Configuración de las 3 fases - Framing de Protección Legal
export const QUESTION_PHASES: Phase[] = [
    {
        id: 1,
        name: 'Cimentación de la Protección Legal',
        description: 'Validando los fundamentos normativos de su Sistema de Gestión',
        questionIds: [
            'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9',
            'q10', 'q11', 'q12', 'q13', 'q14'
        ],
        points: 100,
        totalPoints: 100,
        progressMessage: '¡Primera línea de defensa validada! Ha identificado brechas críticas en su estructura normativa.',
        buttonText: 'Continuar análisis de controles'
    },
    {
        id: 2,
        name: 'Blindaje Operativo y Control de Riesgos',
        description: 'Evaluando la efectividad de sus medidas preventivas',
        questionIds: [
            'q15', 'q16', 'q17', 'q18', 'q19', 'q20', 'q21', 'q22',
            'q23', 'q24', 'q25', 'q26', 'q27'
        ],
        points: 200,
        totalPoints: 300,
        progressMessage: 'Controles operativos evaluados. Su mapa de vulnerabilidades toma forma.',
        buttonText: 'Finalizar auditoría de registros'
    },
    {
        id: 3,
        name: 'Estrategia de Defensa y Mejora Continua',
        description: 'Verificando su capacidad de demostrar cumplimiento',
        questionIds: [
            'q28', 'q29', 'q30', 'q31', 'q32', 'q33', 'q34', 'q35',
            'q36', 'q37', 'q38', 'q39', 'q40', 'q41'
        ],
        points: 300,
        totalPoints: 600,
        progressMessage: 'Auditoría completada. Su Mapa de Protección de Riesgos está listo.',
        buttonText: 'Descargar Mapa de Protección'
    }
];

// Helper: Obtener preguntas filtradas por tipo de empresa
export function getFilteredQuestions(tipoEmpresa: string): [string, string][] {
    const isMype = tipoEmpresa === 'micro' || tipoEmpresa === 'pequena';

    return Object.entries(QUESTIONS).filter(([questionId]) => {
        if (isMype) {
            return !PREGUNTAS_EXENTAS_MYPE.includes(questionId);
        }
        return true;
    });
}

// Helper: Obtener fases con preguntas filtradas por tipo de empresa
export function getPhasesForCompanyType(tipoEmpresa: string): Phase[] {
    const isMype = tipoEmpresa === 'micro' || tipoEmpresa === 'pequena';

    return QUESTION_PHASES.map(phase => ({
        ...phase,
        questionIds: phase.questionIds.filter(qId => {
            if (isMype) {
                return !PREGUNTAS_EXENTAS_MYPE.includes(qId);
            }
            return true;
        })
    }));
}

// Helper: Obtener la fase actual basada en el ID de pregunta
export function getCurrentPhase(questionId: string, tipoEmpresa: string): Phase | null {
    const phases = getPhasesForCompanyType(tipoEmpresa);
    return phases.find(phase => phase.questionIds.includes(questionId)) || null;
}

// Helper: Obtener índice de pregunta dentro de su fase
export function getQuestionIndexInPhase(questionId: string, tipoEmpresa: string): {
    phaseIndex: number;
    questionIndex: number;
    totalInPhase: number;
} | null {
    const phases = getPhasesForCompanyType(tipoEmpresa);

    for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex++) {
        const phase = phases[phaseIndex];
        const questionIndex = phase.questionIds.indexOf(questionId);

        if (questionIndex !== -1) {
            return {
                phaseIndex,
                questionIndex,
                totalInPhase: phase.questionIds.length
            };
        }
    }

    return null;
}
