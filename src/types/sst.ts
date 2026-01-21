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
