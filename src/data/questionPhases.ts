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

// Preguntas exentas para empresas MYPE (micro y pequeña)
export const PREGUNTAS_EXENTAS_MYPE = ['q36', 'q37', 'q38', 'q39', 'q41'];

// Todas las preguntas organizadas por ID
export const QUESTIONS: Record<string, string> = {
    q1: '¿Existe una Política de Seguridad y Salud en el Trabajo documentada y firmada?',
    q2: '¿La política ha sido difundida a todos los trabajadores?',
    q3: '¿La alta dirección evidencia su liderazgo?',
    q4: '¿Existe un Reglamento Interno de Seguridad y Salud en el Trabajo aprobado?',
    q5: '¿Se ha entregado el Reglamento Interno a cada trabajador?',
    q6: '¿Cuenta con un Comité o Supervisor de Seguridad y Salud en el Trabajo?',
    q7: '¿El proceso de elección del Comité fue documentado?',
    q8: '¿Los miembros del Comité o Supervisor han sido capacitados?',
    q9: '¿El Comité o Supervisor se reúne mensualmente y tiene Libro de Actas?',
    q10: '¿Se ha realizado un estudio de línea base?',
    q11: '¿Existe una Matriz de Identificación de Peligros y Evaluación de Riesgos para todos los puestos?',
    q12: '¿La Matriz de Peligros y Riesgos ha sido actualizada?',
    q13: '¿Los trabajadores participaron en la identificación de peligros y riesgos?',
    q14: '¿Se ha elaborado y exhibido un Mapa de Riesgos?',
    q15: '¿Existe un Plan y Programa Anual de Seguridad y Salud con presupuesto?',
    q16: '¿Existe un Programa Anual de Capacitaciones?',
    q17: '¿Se han realizado las 4 capacitaciones obligatorias al año?',
    q18: '¿Se realiza la inducción de seguridad a todo nuevo trabajador?',
    q19: '¿Las capacitaciones están documentadas?',
    q20: '¿Se aplican los controles de seguridad según la jerarquía?',
    q21: '¿Se entregan los Equipos de Protección Personal adecuados sin costo?',
    q22: '¿Existe un registro de entrega de Equipos de Protección?',
    q23: '¿Se capacitó en el uso correcto de los Equipos de Protección?',
    q24: '¿Existen Procedimientos Escritos de Trabajo Seguro para tareas de alto riesgo?',
    q25: '¿Cuenta con un Plan de Respuesta ante Emergencias?',
    q26: '¿Se han conformado y capacitado las brigadas?',
    q27: '¿Se realizan simulacros de emergencia periódicamente?',
    q28: '¿Se realizan los Exámenes Médicos Ocupacionales?',
    q29: '¿Se realiza el monitoreo de agentes (físicos, químicos, etc.)?',
    q30: '¿Se verifica que las contratas cumplen con la normativa de seguridad?',
    q31: '¿Se realiza seguimiento a los objetivos del Plan Anual?',
    q32: '¿Existe un procedimiento para investigación de accidentes?',
    q33: '¿Se ha realizado la auditoría obligatoria del Sistema de Gestión?',
    q34: '¿Lleva el Registro de accidentes de trabajo?',
    q35: '¿Lleva el Registro de exámenes médicos ocupacionales?',
    q36: '¿Lleva el Registro del monitoreo de agentes?',
    q37: '¿Lleva el Registro de inspecciones internas de seguridad?',
    q38: '¿Lleva el Registro de estadísticas de seguridad y salud?',
    q39: '¿Lleva el Registro de equipos de seguridad o emergencia?',
    q40: '¿Lleva el Registro de inducción y capacitación?',
    q41: '¿Lleva el Registro de auditorías?'
};

// Explicaciones contextuales para cada pregunta (tooltips)
export const QUESTION_TOOLTIPS: Record<string, string> = {
    q1: 'La Política de SST es un documento firmado por la gerencia que establece el compromiso de la empresa con la seguridad y salud de todos los trabajadores.',
    q2: 'Todos los trabajadores deben conocer la política. Esto puede hacerse mediante charlas, correos, carteles o firma de recepción.',
    q3: 'El liderazgo se demuestra cuando la gerencia participa activamente en reuniones de SST, asigna recursos y promueve una cultura de seguridad.',
    q4: 'El RISST (Reglamento Interno de Seguridad y Salud en el Trabajo) es un documento obligatorio que establece las normas y reglas de seguridad de la empresa.',
    q5: 'Cada trabajador debe recibir una copia física o digital del RISST y firmar un cargo de recepción.',
    q6: 'El CSST (Comité de Seguridad y Salud en el Trabajo) es obligatorio para empresas con 20+ trabajadores. Empresas menores requieren un Supervisor de SST.',
    q7: 'El proceso de elección debe incluir convocatoria, actas de votación, y acta de instalación del CSST debidamente firmadas.',
    q8: 'Los miembros del comité deben recibir capacitación en temas de SST para ejercer correctamente sus funciones.',
    q9: 'El CSST debe reunirse mínimo una vez al mes y registrar sus acuerdos en un Libro de Actas legalizado.',
    q10: 'El estudio de línea base es un diagnóstico inicial que evalúa el estado actual del sistema de gestión de SST en la empresa.',
    q11: 'La Matriz IPERC identifica los Peligros, Evalúa los Riesgos y establece Controles para cada puesto de trabajo.',
    q12: 'El IPERC debe actualizarse anualmente o cuando haya cambios en procesos, equipos, incidentes o nueva legislación.',
    q13: 'Los trabajadores deben participar activamente en la identificación de peligros de sus propios puestos de trabajo.',
    q14: 'El Mapa de Riesgos es un plano del lugar de trabajo donde se señalan visualmente los peligros y riesgos identificados.',
    q15: 'El Plan Anual de SST incluye objetivos, metas, actividades y un presupuesto asignado para la gestión de seguridad.',
    q16: 'El Programa de Capacitaciones debe planificar todas las formaciones en SST que recibirán los trabajadores durante el año.',
    q17: 'La ley exige mínimo 4 capacitaciones anuales en SST, incluyendo temas como primeros auxilios, uso de extintores, evacuación, etc.',
    q18: 'Todo trabajador nuevo debe recibir una inducción específica de SST antes de iniciar sus labores.',
    q19: 'Las capacitaciones deben registrarse con listas de asistencia, temario desarrollado y evaluaciones si aplica.',
    q20: 'La jerarquía de controles va desde eliminar el peligro hasta usar EPP: Eliminación → Sustitución → Controles de ingeniería → Controles administrativos → EPP.',
    q21: 'Los EPP (Equipos de Protección Personal) como cascos, guantes, lentes, etc. deben entregarse sin costo al trabajador.',
    q22: 'Debe existir un registro firmado por cada trabajador al recibir sus EPP, indicando tipo, cantidad y fecha.',
    q23: 'Los trabajadores deben ser capacitados en el uso, cuidado y mantenimiento correcto de sus EPP.',
    q24: 'Los PETS (Procedimientos Escritos de Trabajo Seguro) describen paso a paso cómo realizar tareas de alto riesgo de forma segura.',
    q25: 'El Plan de Emergencias establece los procedimientos a seguir ante sismos, incendios, derrames u otras emergencias.',
    q26: 'Las brigadas de emergencia (evacuación, primeros auxilios, contra incendios) deben estar conformadas y entrenadas.',
    q27: 'Los simulacros deben realizarse mínimo 2 veces al año para evaluar y mejorar la respuesta ante emergencias.',
    q28: 'Los exámenes médicos ocupacionales son obligatorios: pre-ocupacional, periódico y de retiro.',
    q29: 'El monitoreo mide la exposición a agentes físicos (ruido, iluminación), químicos (gases, polvos) y otros en el ambiente laboral.',
    q30: 'Las empresas contratistas también deben cumplir con la normativa de SST y la empresa principal debe verificarlo.',
    q31: 'Se debe medir y revisar periódicamente el avance de los objetivos establecidos en el Plan Anual de SST.',
    q32: 'Debe existir un procedimiento claro para investigar accidentes e incidentes, identificar causas y prevenir repeticiones.',
    q33: 'La auditoría del SGSST es obligatoria cada 2 años para empresas de sectores de alto riesgo, según la ley.',
    q34: 'Registro obligatorio de todos los accidentes de trabajo ocurridos, incluyendo investigación y medidas correctivas.',
    q35: 'Registro de los exámenes médicos realizados a los trabajadores con sus resultados y recomendaciones.',
    q36: 'Registro de los monitoreos ocupacionales realizados (ruido, iluminación, agentes químicos, etc.).',
    q37: 'Registro de las inspecciones internas de seguridad realizadas en las instalaciones.',
    q38: 'Registro estadístico de accidentes, incidentes y enfermedades ocupacionales (índices de frecuencia, severidad, etc.).',
    q39: 'Registro y control de extintores, botiquines, equipos de emergencia y su mantenimiento.',
    q40: 'Registro de todas las inducciones y capacitaciones impartidas a los trabajadores.',
    q41: 'Registro de las auditorías internas y externas realizadas al sistema de gestión de SST.'
};

// Configuración de las 3 fases
export const QUESTION_PHASES: Phase[] = [
    {
        id: 1,
        name: 'Organización y Política',
        description: 'Estableciendo las bases del Sistema de Gestión SST',
        questionIds: [
            'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9',
            'q10', 'q11', 'q12', 'q13', 'q14'
        ],
        points: 100,
        totalPoints: 100,
        progressMessage: '¡Ganaste 100 puntos! Continúa para desbloquear tu informe.',
        buttonText: 'Continuar a la siguiente fase'
    },
    {
        id: 2,
        name: 'Prevención y Control',
        description: 'Implementando medidas de protección',
        questionIds: [
            'q15', 'q16', 'q17', 'q18', 'q19', 'q20', 'q21', 'q22',
            'q23', 'q24', 'q25', 'q26', 'q27'
        ],
        points: 200,
        totalPoints: 300,
        progressMessage: '¡+200 puntos! Ya llevas 300. Solo una fase más para tu recompensa.',
        buttonText: 'Continuar a la siguiente fase'
    },
    {
        id: 3,
        name: 'Vigilancia y Mejora',
        description: 'Monitoreando y mejorando continuamente',
        questionIds: [
            'q28', 'q29', 'q30', 'q31', 'q32', 'q33', 'q34', 'q35',
            'q36', 'q37', 'q38', 'q39', 'q40', 'q41'
        ],
        points: 300,
        totalPoints: 600,
        progressMessage: '¡Felicitaciones! Has acumulado 600 puntos y desbloqueaste tu informe de diagnóstico SST.',
        buttonText: 'Canjea ahora tu informe'
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
