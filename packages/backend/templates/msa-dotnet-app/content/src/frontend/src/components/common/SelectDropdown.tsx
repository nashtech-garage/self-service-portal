import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import React from 'react';

interface SelectDropdownProps {
    id?: string;
    name?: string;
    value: any;
    options: any[];
    onChange: (e: any) => void;
    optionLabel?: string;
    placeholder?: string;
    className?: string;
    error?: boolean;
    disabled?: boolean;
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({
    id,
    name,
    value,
    options,
    onChange,
    optionLabel = 'name',
    placeholder = 'Select an option',
    className = '',
    error = false,
    disabled = false,
}) => {
    return (
        <Dropdown
            id={id || name}
            value={value}
            options={options}
            onChange={onChange}
            optionLabel={optionLabel}
            placeholder={placeholder}
            className={classNames('h-2rem w-full', className, { 'p-invalid': error })}
            disabled={disabled}
        />
    );
};

export default SelectDropdown; 