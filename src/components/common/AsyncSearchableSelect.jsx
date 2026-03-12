import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, X, Loader2 } from 'lucide-react';
import styles from './SearchableSelect.module.css';

const AsyncSearchableSelect = ({
    onSearch,
    value = '',
    onChange,
    placeholder = 'Search and select...',
    name,
    disabled = false,
    icon: Icon,
    initialOptions = [],
    debounceTime = 500
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [options, setOptions] = useState(initialOptions);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);
    const debounceTimer = useRef(null);

    // Get the label for the current value
    const selectedOption = options.find(opt => opt.value?.toString() === value?.toString());
    const displayValue = selectedOption ? selectedOption.label : '';

    const performSearch = async (term) => {
        if (!onSearch) return;
        setLoading(true);
        try {
            const results = await onSearch(term);
            setOptions(results || []);
        } catch (error) {
            console.error('Async search failed:', error);
            setOptions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputClick = (e) => {
        e.stopPropagation();
        if (!isOpen) {
            setIsOpen(true);
            if (!searchTerm && options.length === 0) {
                performSearch('');
            }
        }
    };

    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            performSearch(term);
        }, debounceTime);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    const handleSelect = (option) => {
        onChange({ target: { name, value: option.value } });
        setIsOpen(false);
        // We keep the option in the list so we can find its label later
        if (!options.find(o => o.value === option.value)) {
            setOptions(prev => [...prev, option]);
        }
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange({ target: { name, value: '' } });
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
                            placeholder="Type to search..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onClick={handleInputClick}
                            autoFocus
                        />
                    ) : (
                        <span className={displayValue ? styles.selectedText : styles.placeholder}>
                            {displayValue || placeholder}
                        </span>
                    )}
                </div>

                <div className={styles.actions}>
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    {!disabled && value && !isOpen && (
                        <X size={14} className={styles.clearBtn} onClick={handleClear} />
                    )}
                    <ChevronDown size={16} className={`${styles.caret} ${isOpen ? styles.rotated : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className={styles.dropdown}>
                    {loading && options.length === 0 ? (
                        <div className={styles.loadingState}>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Searching...</span>
                        </div>
                    ) : options.length > 0 ? (
                        <div className={styles.optionsList}>
                            {options.map((option, index) => (
                                <div
                                    key={index}
                                    className={`${styles.option} ${value?.toString() === option.value?.toString() ? styles.selected : ''}`}
                                    onClick={() => handleSelect(option)}
                                >
                                    {option.label}
                                </div>
                            ))}
                            {loading && (
                                <div className={styles.loadingMore}>
                                    <Loader2 size={12} className="animate-spin" />
                                    <span>Refreshing...</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={styles.noOptions}>
                            {searchTerm ? 'No matches found' : 'Type to start searching'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AsyncSearchableSelect;
