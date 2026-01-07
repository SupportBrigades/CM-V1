import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface CustomDropdownProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    error?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
    label,
    value,
    onChange,
    options,
    placeholder = 'Selecciona una opción',
    error
}) => {
    const [isOpen, setIsOpen] = useState(false);
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

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const selectedLabel = options.find(opt => opt.value === value)?.label;

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-fluid-xs font-medium text-foreground mb-1 sm:mb-2">
                {label}
            </label>

            {/* Botón principal del dropdown */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full input-fluid border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-left flex items-center justify-between ${error ? 'border-destructive' : 'border-input'
                    }`}
            >
                <span className={`truncate ${value ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {selectedLabel || placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Panel desplegable */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-lg shadow-lg max-h-48 sm:max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option.value)}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between hover:bg-muted/50 transition-colors text-left border-b border-input last:border-b-0"
                        >
                            <span className="text-fluid-xs text-foreground">{option.label}</span>
                            {value === option.value && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />}
                        </button>
                    ))}
                </div>
            )}

            {error && <p className="text-destructive text-xs mt-1">{error}</p>}
        </div>
    );
};
