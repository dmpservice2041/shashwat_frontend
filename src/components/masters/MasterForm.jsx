import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, CheckCircle2, Circle } from 'lucide-react';
import api from '../../services/api';
import styles from './MasterComponents.module.css';

const MasterForm = ({ isOpen, onClose, onSubmit, initialData = null, type, title, loading }) => {
    const isTaxCode = type === 'gst_tax_codes';
    const isUnit = type === 'units';
    const isCategory = type === 'categories';
    const isSubCategory = type === 'sub_categories';

    const [departments, setDepartments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [dropdownLoading, setDropdownLoading] = useState(false);

    const defaultState = {
        name: '',
        description: '',
        status: 'active',
        ...(isTaxCode && { hsn_code: '', gst_percentage: '', cgst: '', sgst: '', igst: '' }),
        ...(isUnit && { symbol: '' }),
        ...(isCategory && { department_id: '' }),
        ...(isSubCategory && { category_id: '' })
    };

    const [formData, setFormData] = useState(defaultState);

    useEffect(() => {
        if (isOpen) {
            // Load relational data if needed
            if (isCategory) fetchDropdownData('departments');
            if (isSubCategory) fetchDropdownData('categories');

            if (initialData) {
                setFormData({
                    ...defaultState,
                    ...initialData,
                    status: initialData.status || 'active'
                });
            } else {
                setFormData(defaultState);
            }
        }
    }, [isOpen, initialData, type]);

    const fetchDropdownData = async (depType) => {
        setDropdownLoading(true);
        try {
            const res = await api.get(`/ masters / ${depType} `);
            if (res.success || res.status === 'success') {
                if (depType === 'departments') setDepartments(res.data || []);
                if (depType === 'categories') setCategories(res.data || []);
            }
        } catch (error) {
            console.error(`Failed to fetch ${depType} `, error);
        } finally {
            setDropdownLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        let newValue = type === 'checkbox' ? (checked ? 'active' : 'inactive') : value;

        setFormData(prev => {
            const updated = { ...prev, [name]: newValue };

            // Auto-calculate CGST/SGST/IGST based on gst_percentage if edited
            if (isTaxCode && name === 'gst_percentage' && value) {
                const percentage = parseFloat(value);
                if (!isNaN(percentage)) {
                    updated.cgst = (percentage / 2).toString();
                    updated.sgst = (percentage / 2).toString();
                    updated.igst = percentage.toString();
                }
            }

            return updated;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const submissionData = { ...formData };

        // Clean up numeric fields for tax codes
        if (isTaxCode) {
            submissionData.gst_percentage = parseFloat(submissionData.gst_percentage) || 0;
            submissionData.cgst = parseFloat(submissionData.cgst) || 0;
            submissionData.sgst = parseFloat(submissionData.sgst) || 0;
            submissionData.igst = parseFloat(submissionData.igst) || 0;
        }

        // Ensure department_id and category_id are numbers if they exist
        if (isCategory && submissionData.department_id) {
            submissionData.department_id = parseInt(submissionData.department_id, 10);
        }
        if (isSubCategory && submissionData.category_id) {
            submissionData.category_id = parseInt(submissionData.category_id, 10);
        }

        onSubmit(submissionData);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        {initialData ? `Edit ${title} ` : `Add ${title} `}
                    </h2>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Name *</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder={`Enter ${title.toLowerCase()} name`}
                            autoFocus
                        />
                    </div>

                    {isUnit && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Symbol *</label>
                            <input
                                type="text"
                                name="symbol"
                                required
                                value={formData.symbol || ''}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="e.g. kg, pcs, box"
                            />
                        </div>
                    )}

                    {isCategory && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Department</label>
                            <select
                                name="department_id"
                                value={formData.department_id || ''}
                                onChange={handleChange}
                                className={styles.input}
                                disabled={dropdownLoading}
                            >
                                <option value="">None / Global</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {isSubCategory && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Category</label>
                            <select
                                name="category_id"
                                value={formData.category_id || ''}
                                onChange={handleChange}
                                className={styles.input}
                                disabled={dropdownLoading}
                            >
                                <option value="">Select a Category (Optional)</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {isTaxCode && (
                        <div className={styles.taxGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>HSN Code</label>
                                <input
                                    type="text"
                                    name="hsn_code"
                                    value={formData.hsn_code}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="e.g. 9983"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>GST % *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="gst_percentage"
                                    required
                                    value={formData.gst_percentage}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="Total GST %"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>CGST %</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="cgst"
                                    value={formData.cgst}
                                    onChange={handleChange}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>SGST %</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="sgst"
                                    value={formData.sgst}
                                    onChange={handleChange}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>IGST %</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="igst"
                                    value={formData.igst}
                                    onChange={handleChange}
                                    className={styles.input}
                                />
                            </div>
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            className={styles.textarea}
                            placeholder="Optional metadata or notes"
                            rows={3}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.toggleLabel}>
                            <input
                                type="checkbox"
                                name="status"
                                checked={formData.status === 'active'}
                                onChange={handleChange}
                                className={styles.checkbox}
                            />
                            <span className={styles.toggleText}>
                                {formData.status === 'active' ? (
                                    <><CheckCircle2 size={16} className={styles.activeIcon} /> Active</>
                                ) : (
                                    <><Circle size={16} className={styles.inactiveIcon} /> Inactive</>
                                )}
                            </span>
                        </label>
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.btnSecondary} disabled={loading || dropdownLoading}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.btnPrimary} disabled={loading || dropdownLoading}>
                            {(loading || dropdownLoading) ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {initialData ? 'Update' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MasterForm;
