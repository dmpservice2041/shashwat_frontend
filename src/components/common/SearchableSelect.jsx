import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X, Loader2 } from 'lucide-react';
import styles from './SearchableSelect.module.css';

const SearchableSelect = ({
    options = [],
    value = '',
    onChange,
    placeholder = 'Select an option',
    name,
    disabled = false,
    loading = false,
    icon: Icon
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);
    const containerRef = useRef(null);

    // Get the label for the current value
    const selectedOption = options.find(opt => opt.value?.toString() === value?.toString());
    const displayValue = selectedOption ? selectedOption.label : '';

    useEffect(() => {
        setFilteredOptions(
            options.filter(opt =>
                opt.label?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, options]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        onChange({ target: { name, value: option.value } });
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange({ target: { name, value: '' } });
        setSearchTerm('');
    };

    return (
        <div className={`${styles.container} ${isOpen ? styles.active : ''} ${disabled ? styles.disabled : ''}`} ref={containerRef}>
            <div
                className={styles.selectTrigger}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                {Icon && <Icon className={styles.icon} size={16} />}

                <div className={styles.valueContainer}>
                    {isOpen ? (
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    ) : (
                        <span className={displayValue ? styles.selectedText : styles.placeholder}>
                            {displayValue || placeholder}
                        </span>
                    )}
                </div>

                <div className={styles.actions}>
                    {!disabled && value && !isOpen && (
                        <X size={14} className={styles.clearBtn} onClick={handleClear} />
                    )}
                    <ChevronDown size={16} className={`${styles.caret} ${isOpen ? styles.rotated : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className={styles.dropdown}>
                    {loading ? (
                        <div className={styles.loadingState}>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Loading...</span>
                        </div>
                    ) : filteredOptions.length > 0 ? (
                        <div className={styles.optionsList}>
                            {filteredOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className={`${styles.option} ${value?.toString() === option.value?.toString() ? styles.selected : ''}`}
                                    onClick={() => handleSelect(option)}
                                >
                                    {option.label}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noOptions}>No results found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
