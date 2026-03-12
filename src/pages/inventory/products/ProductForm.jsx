import { useState, useEffect } from 'react';
import {
    Package,
    Hash,
    Factory,
    Layers,
    Tag,
    Boxes,
    Scale,
    Warehouse,
    BadgePercent,
    Calendar,
    FileText,
    AlertCircle,
    Loader2,
    X,
    Info,
    Smartphone,
    CreditCard,
    Zap
} from 'lucide-react';
import api from '../../../services/api';
import { showToast } from '../../../components/common/Toast';
import styles from './ProductModal.module.css';
import SearchableSelect from '../../../components/common/SearchableSelect';

const ProductForm = ({ initialData, onSubmit, loading, mode = 'ADD' }) => {
    const [formData, setFormData] = useState({
        product_name: '',
        product_code: '',
        manufacturer_id: '',
        department_id: '',
        category_id: '',
        sub_category_id: '',
        material_type_id: '',
        unit_id: '',
        warehouse_id: '',
        quantity: '',
        min_quantity: '',
        mrp: '',
        purchase_rate: '',
        sales_rate: '',
        gst_tax_id: '',
        batch_no: '',
        serial_no: '',
        expire_date: '',
        description: ''
    });

    const [masters, setMasters] = useState({
        manufacturers: [],
        departments: [],
        categories: [],
        sub_categories: [],
        material_types: [],
        units: [],
        gst_tax_codes: [],
        warehouses: []
    });

    const [mastersLoading, setMastersLoading] = useState(false);

    useEffect(() => {
        fetchMasters();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...formData,
                ...initialData,
                // Ensure IDs are strings for dropdown comparison
                manufacturer_id: initialData.manufacturer_id?.toString() || '',
                department_id: initialData.department_id?.toString() || '',
                category_id: initialData.category_id?.toString() || '',
                sub_category_id: initialData.sub_category_id?.toString() || '',
                material_type_id: initialData.material_type_id?.toString() || '',
                unit_id: initialData.unit_id?.toString() || '',
                warehouse_id: initialData.warehouse_id?.toString() || '',
                gst_tax_id: initialData.gst_tax_id?.toString() || '',
            });
        }
    }, [initialData]);

    const fetchMasters = async () => {
        try {
            setMastersLoading(true);
            const [
                mfr, dept, cat, subCat, mat, units, gst, wh
            ] = await Promise.all([
                api.get('/masters/manufacturers'),
                api.get('/masters/departments'),
                api.get('/masters/categories'),
                api.get('/masters/sub_categories'),
                api.get('/masters/material_types'),
                api.get('/masters/units'),
                api.get('/masters/gst_tax_codes'),
                api.get('/masters/warehouses')
            ]);

            setMasters({
                manufacturers: mfr.data || [],
                departments: dept.data || [],
                categories: cat.data || [],
                sub_categories: subCat.data || [],
                material_types: mat.data || [],
                units: units.data || [],
                gst_tax_codes: gst.data || [],
                warehouses: wh.data || []
            });
        } catch (error) {
            console.error('Failed to fetch master data', error);
            showToast('Failed to load form selection data');
        } finally {
            setMastersLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        // Required product fields
        if (!formData.product_name) {
            showToast("Product Name is required", 'error');
            return;
        }

        const requiredSelects = [
            { key: 'manufacturer_id', label: 'Manufacturer' },
            { key: 'department_id', label: 'Department' },
            { key: 'category_id', label: 'Category' },
            { key: 'sub_category_id', label: 'Sub Category' },
            { key: 'material_type_id', label: 'Material Type' },
            { key: 'unit_id', label: 'Stock Unit' },
            { key: 'warehouse_id', label: 'Warehouse' }
        ];

        const missingField = requiredSelects.find(item => !formData[item.key]);
        if (missingField) {
            showToast(`${missingField.label} is required`, 'error');
            return;
        }

        const convertEmptyToNull = (value) => (value === '' ? null : value);
        const sanitizeId = (value) => {
            if (value === '' || value === undefined || value === null) return null;
            return value;
        };

        const submissionData = {
            ...formData,
            manufacturer_id: sanitizeId(formData.manufacturer_id),
            department_id: sanitizeId(formData.department_id),
            category_id: sanitizeId(formData.category_id),
            sub_category_id: sanitizeId(formData.sub_category_id),
            material_type_id: sanitizeId(formData.material_type_id),
            unit_id: sanitizeId(formData.unit_id),
            warehouse_id: sanitizeId(formData.warehouse_id),
            gst_tax_id: sanitizeId(formData.gst_tax_id),
            quantity: formData.quantity ? Number(formData.quantity) : 0,
            min_quantity: formData.min_quantity ? Number(formData.min_quantity) : 0,
            mrp: formData.mrp ? Number(formData.mrp) : 0,
            purchase_rate: formData.purchase_rate ? Number(formData.purchase_rate) : 0,
            sales_rate: formData.sales_rate ? Number(formData.sales_rate) : 0,
            batch_no: convertEmptyToNull(formData.batch_no),
            serial_no: convertEmptyToNull(formData.serial_no),
            expire_date: convertEmptyToNull(formData.expire_date),
            description: convertEmptyToNull(formData.description)
        };

        const cleanedSubmissionData = Object.entries(submissionData).reduce((acc, [key, value]) => {
            if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
                return acc;
            }
            acc[key] = value;
            return acc;
        }, {});

        onSubmit(cleanedSubmissionData);
    };

    if (mastersLoading) {
        return (
            <div className={styles.loadingWrapper}>
                <Loader2 className="animate-spin" size={40} color="#2563eb" />
                <p>Loading master data...</p>
            </div>
        );
    }

    const isViewOnly = mode === 'VIEW';

    return (
        <form onSubmit={handleFormSubmit} className={`${styles.modalContent} ${isViewOnly ? styles.viewMode : ''}`}>
            <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>
                    {mode === 'ADD' ? 'Create New Product' : mode === 'EDIT' ? 'Update Product Information' : 'Product Details Overview'}
                </h2>
                <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('closeProductModal'))} className={styles.closeBtn}>
                    <X size={18} strokeWidth={2.5} />
                </button>
            </div>

            <div className={styles.formArea}>
                {/* Basic Information Section */}
                <div className={styles.formSection}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>
                            <Info className={styles.sectionIcon} size={18} />
                            Basic Information
                        </h3>
                    </div>
                    <div className={styles.formGrid}>
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label>Product Name <span style={{ color: '#ef4444' }}>*</span></label>
                            <div className={styles.inputWrapper}>
                                <Package className={styles.fieldIcon} size={16} />
                                <input
                                    name="product_name"
                                    value={formData.product_name}
                                    onChange={handleChange}
                                    placeholder="e.g. Premium Cotton Shirt"
                                    className={styles.inputField}
                                    required
                                    disabled={isViewOnly}
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Product Code</label>
                            <div className={styles.inputWrapper}>
                                <Hash className={styles.fieldIcon} size={16} />
                                <input
                                    name="product_code"
                                    value={formData.product_code}
                                    onChange={handleChange}
                                    placeholder="e.g. PRD-001"
                                    className={styles.inputField}
                                    disabled={isViewOnly}
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Manufacturer / Brand <span style={{ color: '#ef4444' }}>*</span></label>
                            <SearchableSelect
                                name="manufacturer_id"
                                value={formData.manufacturer_id}
                                onChange={handleChange}
                                options={masters.manufacturers.map(m => ({
                                    value: m.id,
                                    label: m.name || m.manufacturer_name
                                }))}
                                placeholder="Select Manufacturer"
                                disabled={isViewOnly}
                                icon={Factory}
                            />
                        </div>
                    </div>
                </div>

                {/* Classification Section */}
                <div className={styles.formSection}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>
                            <Layers className={styles.sectionIcon} size={18} />
                            Classification & Inventory
                        </h3>
                    </div>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Department <span style={{ color: '#ef4444' }}>*</span></label>
                            <SearchableSelect
                                name="department_id"
                                value={formData.department_id}
                                onChange={handleChange}
                                options={masters.departments.map(d => ({
                                    value: d.id,
                                    label: d.name || d.department_name
                                }))}
                                placeholder="Select Department"
                                disabled={isViewOnly}
                                icon={Smartphone}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Category <span style={{ color: '#ef4444' }}>*</span></label>
                            <SearchableSelect
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                options={masters.categories.map(c => ({
                                    value: c.id,
                                    label: c.name || c.category_name
                                }))}
                                placeholder="Select Category"
                                disabled={isViewOnly}
                                icon={Tag}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Sub Category <span style={{ color: '#ef4444' }}>*</span></label>
                            <SearchableSelect
                                name="sub_category_id"
                                value={formData.sub_category_id}
                                onChange={handleChange}
                                options={masters.sub_categories.map(s => ({
                                    value: s.id,
                                    label: s.name || s.subcategory_name
                                }))}
                                placeholder="Select Sub Category"
                                disabled={isViewOnly}
                                icon={Zap}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Material Type <span style={{ color: '#ef4444' }}>*</span></label>
                            <SearchableSelect
                                name="material_type_id"
                                value={formData.material_type_id}
                                onChange={handleChange}
                                options={masters.material_types.map(m => ({
                                    value: m.id,
                                    label: m.name || m.material_type
                                }))}
                                placeholder="Select Material Type"
                                disabled={isViewOnly}
                                icon={FileText}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Stock Unit <span style={{ color: '#ef4444' }}>*</span></label>
                            <SearchableSelect
                                name="unit_id"
                                value={formData.unit_id}
                                onChange={handleChange}
                                options={masters.units.map(u => ({
                                    value: u.id,
                                    label: u.name || (u.unit_name + ' (' + u.unit_symbol + ')')
                                }))}
                                placeholder="Select Unit"
                                disabled={isViewOnly}
                                icon={Scale}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Assigned Warehouse <span style={{ color: '#ef4444' }}>*</span></label>
                            <SearchableSelect
                                name="warehouse_id"
                                value={formData.warehouse_id}
                                onChange={handleChange}
                                options={masters.warehouses.map(w => ({
                                    value: w.id,
                                    label: w.name || w.warehouse_name
                                }))}
                                placeholder="Select Warehouse"
                                disabled={isViewOnly}
                                icon={Warehouse}
                            />
                        </div>
                    </div>
                </div>

                {/* Logistics section */}
                <div className={styles.formSection}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>
                            <Boxes className={styles.sectionIcon} size={18} />
                            Logistics & Pricing
                        </h3>
                    </div>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Current Stock</label>
                            <div className={styles.inputWrapper}>
                                <Boxes className={styles.fieldIcon} size={16} />
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="0"
                                    className={styles.inputField}
                                    disabled={isViewOnly}
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Min. Stock Level</label>
                            <div className={styles.inputWrapper}>
                                <AlertCircle className={styles.fieldIcon} size={16} />
                                <input
                                    type="number"
                                    name="min_quantity"
                                    value={formData.min_quantity}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="0"
                                    className={styles.inputField}
                                    disabled={isViewOnly}
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>MRP Price</label>
                            <div className={styles.inputWrapper}>
                                <CreditCard className={styles.fieldIcon} size={16} />
                                <input
                                    type="number"
                                    step="0.01"
                                    name="mrp"
                                    value={formData.mrp}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    min="0"
                                    className={styles.inputField}
                                    disabled={isViewOnly}
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Purchase Rate</label>
                            <div className={styles.inputWrapper}>
                                <CreditCard className={styles.fieldIcon} size={16} />
                                <input
                                    type="number"
                                    step="0.01"
                                    name="purchase_rate"
                                    value={formData.purchase_rate}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    min="0"
                                    className={styles.inputField}
                                    disabled={isViewOnly}
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Sales Rate</label>
                            <div className={styles.inputWrapper}>
                                <CreditCard className={styles.fieldIcon} size={16} />
                                <input
                                    type="number"
                                    step="0.01"
                                    name="sales_rate"
                                    value={formData.sales_rate}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    min="0"
                                    className={`${styles.inputField} ${Number(formData.sales_rate) > 0 &&
                                        Number(formData.purchase_rate) > 0 &&
                                        Number(formData.sales_rate) < Number(formData.purchase_rate)
                                        ? styles.warningField : ''
                                        }`}
                                    disabled={isViewOnly}
                                />
                            </div>
                            {Number(formData.sales_rate) > 0 &&
                                Number(formData.purchase_rate) > 0 &&
                                Number(formData.sales_rate) < Number(formData.purchase_rate) && (
                                    <p className={styles.warningText} style={{ fontSize: '0.75rem', color: '#ca8a04', marginTop: '0.25rem' }}>
                                        Warning: Sale rate is less than purchase rate
                                    </p>
                                )}
                        </div>
                        <div className={styles.formGroup}>
                            <label>GST Configuration</label>
                            <SearchableSelect
                                name="gst_tax_id"
                                value={formData.gst_tax_id}
                                onChange={handleChange}
                                options={masters.gst_tax_codes.map(g => ({
                                    value: g.id,
                                    label: `${g.name || g.tax_code} (${g.gst_percentage || g.percentage}%)`
                                }))}
                                placeholder="No Tax Applicable"
                                disabled={isViewOnly}
                                icon={BadgePercent}
                            />
                        </div>
                    </div>
                </div>

                {/* Additional details */}
                <div className={styles.formSection}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>
                            <Tag className={styles.sectionIcon} size={18} />
                            Additional Metadata
                        </h3>
                    </div>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Batch Code</label>
                            <div className={styles.inputWrapper}>
                                <Hash className={styles.fieldIcon} size={16} />
                                <input
                                    name="batch_no"
                                    value={formData.batch_no}
                                    onChange={handleChange}
                                    placeholder="e.g. BTC-SH-2024"
                                    className={styles.inputField}
                                    disabled={isViewOnly}
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Serial Number</label>
                            <div className={styles.inputWrapper}>
                                <Tag className={styles.fieldIcon} size={16} />
                                <input
                                    name="serial_no"
                                    value={formData.serial_no}
                                    onChange={handleChange}
                                    placeholder="e.g. SN-987654321"
                                    className={styles.inputField}
                                    disabled={isViewOnly}
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Expiry Date</label>
                            <div className={styles.inputWrapper}>
                                <Calendar className={styles.fieldIcon} size={16} />
                                <input
                                    type="date"
                                    name="expire_date"
                                    value={formData.expire_date}
                                    onChange={handleChange}
                                    className={styles.inputField}
                                    disabled={isViewOnly}
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup} style={{ gridColumn: 'span 3' }}>
                            <label>Product Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the product features, usage, etc..."
                                className={styles.textareaField}
                                disabled={isViewOnly}
                            ></textarea>
                        </div>
                    </div>
                </div>
            </div>

            {!isViewOnly && (
                <div className={styles.modalActions}>
                    <button type="button" className={styles.btnSecondary} onClick={() => window.dispatchEvent(new CustomEvent('closeProductModal'))}>
                        Discard Changes
                    </button>
                    <button type="submit" className={styles.btnPrimary} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={18} /> : (mode === 'ADD' ? 'Generate Product' : 'Save Changes')}
                    </button>
                </div>
            )}
        </form>
    );
};

export default ProductForm;
