# constants.py
import pandas as pd

# --- VALORES GLOBALES ---
VALOR_UIT = 5500  # UIT 2026
PREGUNTAS_EXENTAS_MYPE = ['q36', 'q37', 'q38', 'q39', 'q41']

# --- TABLAS DE MULTAS ---
data_micro = {
    '1': [240.75, 588.50, 1230.50], '2': [267.50, 749.00, 1337.50], '3': [374.50, 856.00, 1551.50], '4': [428.00, 963.00, 1712.00], '5': [481.50, 1070.00, 1926.00], '6': [588.50, 1337.50, 2193.50], '7': [749.00, 1551.50, 2514.50], '8': [856.00, 1819.00, 2889.00], '9': [963.00, 2033.00, 3263.50], '10 y más': [1230.50, 2407.50, 3638.00]
}
TABLA_MULTAS_MICRO = pd.DataFrame(data_micro, index=['Leves', 'Grave', 'Muy Grave'])

data_pequena = {
    '1 a 5': [481.50, 2407.50, 4440.50], '6 a 10': [749.00, 3156.50, 6742.00], '11 a 20': [963.00, 4120.50, 8827.50], '21 a 30': [1230.50, 5189.50, 11449.00], '31 a 40': [1712.00, 6742.00, 14817.50], '41 a 50': [2407.50, 8078.50, 17912.50], '51 a 60': [3263.50, 10700.00, 23754.00], '61 a 70': [4440.50, 13321.50, 29634.00], '71 a 99': [5403.50, 16328.50, 35310.00], '100 y más': [12037.50, 24167.50, 61840.50]
}
TABLA_MULTAS_PEQUENA = pd.DataFrame(data_pequena, index=['Leves', 'Grave', 'Muy Grave'])

TABLA_MULTAS_GENERAL_UIT = {
    '1-10': {'Leve': 0.13, 'Grave': 0.45, 'Muy Grave': 0.94}, '11-25': {'Leve': 0.38, 'Grave': 1.58, 'Muy Grave': 3.16}, '26-50': {'Leve': 0.61, 'Grave': 6.46, 'Muy Grave': 10.61}, '51-100': {'Leve': 1.04, 'Grave': 10.70, 'Muy Grave': 21.22}, '101-200': {'Leve': 1.58, 'Grave': 14.94, 'Muy Grave': 31.83}, '201-300': {'Leve': 2.01, 'Grave': 18.06, 'Muy Grave': 42.44}, '301-400': {'Leve': 2.44, 'Grave': 21.18, 'Muy Grave': 53.04}, '401-500': {'Leve': 2.87, 'Grave': 24.29, 'Muy Grave': 63.64}, '501-600': {'Leve': 3.29, 'Grave': 28.53, 'Muy Grave': 74.25}, '601-700': {'Leve': 3.72, 'Grave': 32.77, 'Muy Grave': 84.85}, '701-800': {'Leve': 4.15, 'Grave': 37.01, 'Muy Grave': 95.45}, '801-900': {'Leve': 4.58, 'Grave': 41.25, 'Muy Grave': 106.05}, '901-a-mas': {'Leve': 5.02, 'Grave': 45.49, 'Muy Grave': 116.65}
}
TABLA_MULTAS_GENERAL = pd.DataFrame(TABLA_MULTAS_GENERAL_UIT).T * VALOR_UIT

# --- BASE DE DATOS DE INFRACCIONES ---
BASE_DE_DATOS_INFRACCIONES = {
    'q1': {'severidad': 'Grave', 'articulo': 'Art. 27.11', 'descripcion': 'No contar con una política de seguridad y salud en el trabajo.'},
    'q2': {'severidad': 'Leves', 'articulo': 'Art. 26.5', 'descripcion': 'Incumplimiento formal o documental, como no difundir la política de SST.'},
    'q3': {'severidad': 'Grave', 'articulo': 'Art. 27.11', 'descripcion': 'No demostrar el liderazgo del empleador, como la falta de asignación de recursos para el SGSST.'},
    'q4': {'severidad': 'Grave', 'articulo': 'Art. 27.11', 'descripcion': 'No contar con un Reglamento Interno de Seguridad y Salud en el Trabajo (RISST) para empresas con 20 o más trabajadores.'},
    'q5': {'severidad': 'Leves', 'articulo': 'Art. 26.5', 'descripcion': 'Incumplimiento documental, como no poder acreditar la entrega del RISST a cada trabajador.'},
    'q6': {'severidad': 'Grave', 'articulo': 'Art. 27.12', 'descripcion': 'No constituir o no designar a un supervisor o Comité de Seguridad y Salud en el Trabajo.'},
    'q7': {'severidad': 'Leves', 'articulo': 'Art. 26.5', 'descripcion': 'Incumplimiento formal en el proceso de elección de los representantes de los trabajadores.'},
    'q8': {'severidad': 'Grave', 'articulo': 'Art. 27.10', 'descripcion': 'No proporcionar la formación e información suficiente y adecuada sobre los riesgos del puesto de trabajo.'},
    'q9': {'severidad': 'Grave', 'articulo': 'Art. 27.12', 'descripcion': 'No asegurar el correcto funcionamiento del Comité de SST (reuniones, libro de actas).'},
    'q10': {'severidad': 'Grave', 'articulo': 'Art. 27.11', 'descripcion': 'No realizar la evaluación inicial o estudio de línea base del SGSST.'},
    'q11': {'severidad': 'Muy Grave', 'articulo': 'Art. 28.10', 'descripcion': 'No contar con el Estudio de Identificación de Peligros y Evaluación de Riesgos (IPERC).'},
    'q12': {'severidad': 'Grave', 'articulo': 'Art. 27.11', 'descripcion': 'No actualizar la evaluación de riesgos según lo establecido por la normativa.'},
    'q13': {'severidad': 'Grave', 'articulo': 'Art. 27.11', 'descripcion': 'No garantizar la participación efectiva de los trabajadores en el SGSST, incluyendo la elaboración del IPERC.'},
    'q14': {'severidad': 'Grave', 'articulo': 'Art. 27.11', 'descripcion': 'No elaborar y/o no exhibir el Mapa de Riesgos en un lugar visible.'},
    'q15': {'severidad': 'Grave', 'articulo': 'Art. 27.11', 'descripcion': 'No contar con un plan y programa anual de seguridad y salud en el trabajo.'},
    'q16': {'severidad': 'Grave', 'articulo': 'Art. 27.11', 'descripcion': 'No contar con un programa anual de capacitaciones.'},
    'q17': {'severidad': 'Grave', 'articulo': 'Art. 27.10', 'descripcion': 'No impartir la formación e información mínima obligatoria (4 al año) sobre los riesgos del puesto.'},
    'q18': {'severidad': 'Grave', 'articulo': 'Art. 27.10', 'descripcion': 'No proporcionar la formación e información específica en la contratación (inducción).'},
    'q19': {'severidad': 'Leves', 'articulo': 'Art. 26.5', 'descripcion': 'Incumplimiento formal, como la falta de registros que acrediten las capacitaciones impartidas.'},
    'q20': {'severidad': 'Muy Grave', 'articulo': 'Art. 28.10', 'descripcion': 'No implementar las medidas de prevención y protección aplicando la jerarquía de controles.'},
    'q21': {'severidad': 'Grave', 'articulo': 'Art. 27.6', 'descripcion': 'No proporcionar a los trabajadores los equipos de protección personal (EPP) adecuados.'},
    'q22': {'severidad': 'Leves', 'articulo': 'Art. 26.5', 'descripcion': 'Incumplimiento documental, como no mantener un registro de entrega de EPP.'},
    'q23': {'severidad': 'Grave', 'articulo': 'Art. 27.10', 'descripcion': 'No formar o informar a los trabajadores sobre el uso correcto de los EPP.'},
    'q24': {'severidad': 'Muy Grave', 'articulo': 'Art. 28.10', 'descripcion': 'No establecer los medios y precauciones adecuadas para trabajos de alto riesgo (ej. PETS).'},
    'q25': {'severidad': 'Grave', 'articulo': 'Art. 27.11', 'descripcion': 'No contar con planes y preparativos para la respuesta ante emergencias.'},
    'q26': {'severidad': 'Grave', 'articulo': 'Art. 27.11', 'descripcion': 'No designar y capacitar a las brigadas de emergencia.'},
    'q27': {'severidad': 'Grave', 'articulo': 'Art. 27.11', 'descripcion': 'No organizar y ejecutar simulacros de emergencia periódicamente.'},
    'q28': {'severidad': 'Muy Grave', 'articulo': 'Art. 28.13', 'descripcion': 'No cumplir con realizar los exámenes médicos ocupacionales y/o la vigilancia de la salud de los trabajadores.'},
    'q29': {'severidad': 'Grave', 'articulo': 'Art. 27.6', 'descripcion': 'No realizar las mediciones de agentes físicos, químicos, biológicos, etc., que entrañen riesgo.'},
    'q30': {'severidad': 'Grave', 'articulo': 'Art. 27.1', 'descripcion': 'Incumplir las obligaciones de coordinación en materia de prevención con empresas contratistas.'},
    'q31': {'severidad': 'Grave', 'articulo': 'Art. 27.11', 'descripcion': 'No realizar el seguimiento a los objetivos y metas del plan anual de SST.'},
    'q32': {'severidad': 'Grave', 'articulo': 'Art. 27.7', 'descripcion': 'No investigar los accidentes de trabajo, enfermedades ocupacionales o incidentes peligrosos.'},
    'q33': {'severidad': 'Grave', 'articulo': 'Art. 27.11', 'descripcion': 'No realizar las auditorías del Sistema de Gestión de SST exigidas por la normativa.'},
    'q34': {'severidad': 'Grave', 'articulo': 'Art. 27.8', 'descripcion': 'No llevar el registro de accidentes de trabajo, enfermedades ocupacionales e incidentes peligrosos.'},
    'q35': {'severidad': 'Grave', 'articulo': 'Art. 27.8', 'descripcion': 'No llevar el registro de exámenes médicos ocupacionales.'},
    'q36': {'severidad': 'Grave', 'articulo': 'Art. 27.8', 'descripcion': 'No llevar el registro del monitoreo de agentes (físicos, químicos, etc.).'},
    'q37': {'severidad': 'Grave', 'articulo': 'Art. 27.8', 'descripcion': 'No llevar el registro de inspecciones internas de seguridad y salud en el trabajo.'},
    'q38': {'severidad': 'Leves', 'articulo': 'Art. 26.6', 'descripcion': 'No llevar el registro de estadísticas de seguridad y salud.'},
    'q39': {'severidad': 'Leves', 'articulo': 'Art. 26.6', 'descripcion': 'No llevar el registro de equipos de seguridad o emergencia.'},
    'q40': {'severidad': 'Grave', 'articulo': 'Art. 27.8', 'descripcion': 'No llevar el registro de inducción, capacitación, entrenamiento y simulacros de emergencia.'},
    'q41': {'severidad': 'Grave', 'articulo': 'Art. 27.8', 'descripcion': 'No llevar el registro de auditorías.'},
}
