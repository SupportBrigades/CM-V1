import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';

interface CargoDropdownProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

const cargosByCategory: Record<string, string[]> = {
    'ssoma': [
        'Gerente de SSOMA / SST',
        'Jefe de SSOMA / SST',
        'Coordinador de SSOMA / SST',
        'Ingeniero de SSOMA / SST',
        'Supervisor de SSOMA / SST',
        'Especialista EHS / HSE',
        'Ingeniero / Prevencionista de Riesgos',
        'Inspector de Campo SSOMA',
        'Auditor Interno (ISO 45001 / ISO 14001)',
        'Especialista en Medio Ambiente y SST',
        'Analista de Gestión SSOMA',
    ],
    'salud': [
        'Médico Ocupacional',
        'Enfermero(a) Ocupacional',
        'Trabajador(a) Social',
        'Asistente de Bienestar Social',
        'Analista de Salud Ocupacional',
    ],
    'rrhh': [
        'Gerente / Jefe de Recursos Humanos',
        'Asistente / Analista de RR.HH.',
        'Abogado Laboralista',
        'Oficial de Cumplimiento',
        'Analista de Riesgos Laborales',
    ],
    'gerencia': [
        'Gerente General / Director',
        'Dueño de Negocio / Gerente MYPE',
        'Administrador de Empresa / Planta',
        'Director de Finanzas / Contador',
        'Miembro del Comité de SST',
    ],
    'operaciones': [
        'Gerente de Operaciones / Producción',
        'Administrador de Obra / Proyecto',
        'Jefe de Mantenimiento',
        'Jefe de Almacén / Logística',
        'Gestor de Contratistas y Proveedores',
    ],
    'otros': [
        'Consultor Externo SST / SSOMA',
        'Asesor de Seguros (SCTR / Vida Ley)',
        'Estudiante / Investigador',
        'Otro',
    ],
};

const categoryLabels: Record<string, string> = {
    'ssoma': 'Seguridad, Salud y Medio Ambiente',
    'salud': 'Salud Ocupacional y Bienestar',
    'rrhh': 'Recursos Humanos y Legal',
    'gerencia': 'Alta Gerencia y Administración',
    'operaciones': 'Operaciones, Proyectos y Logística',
    'otros': 'Consultoría y Otros',
};

export const CargoDropdown: React.FC<CargoDropdownProps> = ({ value, onChange, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCategoryClick = (categoryKey: string) => {
        setExpandedCategory(expandedCategory === categoryKey ? null : categoryKey);
    };

    const handleCargoSelect = (cargo: string) => {
        onChange(cargo);
        setIsOpen(false);
        setExpandedCategory(null);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label htmlFor="cargo" className="block text-fluid-xs font-medium text-foreground mb-1 sm:mb-2">
                Cargo *
            </label>

            {/* Botón principal del dropdown */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full input-fluid border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-left flex items-center justify-between ${error ? 'border-destructive' : 'border-input'
                    }`}
            >
                <span className={`truncate ${value ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {value || 'Cargo'}
                </span>
                <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Panel desplegable */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-lg shadow-lg max-h-60 sm:max-h-80 overflow-y-auto">
                    {Object.entries(categoryLabels).map(([key, label]) => (
                        <div key={key} className="border-b border-input last:border-b-0">
                            {/* Categoría */}
                            <button
                                type="button"
                                onClick={() => handleCategoryClick(key)}
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                            >
                                <span className="font-medium text-foreground text-fluid-xs">{label}</span>
                                <ChevronRight
                                    className={`w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground transition-transform ${expandedCategory === key ? 'rotate-90' : ''
                                        }`}
                                />
                            </button>

                            {/* Subcategorías (cargos) */}
                            {expandedCategory === key && (
                                <div className="bg-muted/30">
                                    {cargosByCategory[key].map((cargo) => (
                                        <button
                                            key={cargo}
                                            type="button"
                                            onClick={() => handleCargoSelect(cargo)}
                                            className="w-full px-4 py-2 sm:px-6 sm:py-2.5 flex items-center justify-between hover:bg-primary/10 transition-colors text-left"
                                        >
                                            <span className="text-fluid-xs text-foreground">{cargo}</span>
                                            {value === cargo && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {error && <p className="text-destructive text-xs mt-1">{error}</p>}
        </div>
    );
};
