import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Save,
    X,
    Plus,
    Trash2,
    Calculator,
    Calendar,
    User,
    Warehouse,
    Tag,
    Hash,
    Loader2,
    ChevronLeft,
    Package,
    ArrowDownRight,
    BadgePercent,
    ShoppingCart,
    Info,
    CreditCard
} from 'lucide-react';
import api from '../../../services/api';
import { showToast } from '../../../components/common/Toast';
import styles from './PurchaseModal.module.css';
import AsyncSearchableSelect from '../../../components/common/AsyncSearchableSelect';

const PurchaseForm = ({ mode = 'ADD', initialData = null, onClose = null }) => {
    const navigate = useNavigate();
    const isModal = !!onClose;
    const [submitting, setSubmitting] = useState(false);
    const [loadingMasters, setLoadingMasters] = useState(true);

    // Master Data
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [taxCodes, setTaxCodes] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        supplier_id: '',
        purchase_date: new Date().toISOString().split('T')[0],
        warehouse_id: '',
        purchase_no: '',
        discount_type: 'amount', // 'percent' or 'amount'
        discount_value: 0,
        items: [
            {
                product_id: '',
                serial_no: '',
                batch_no: '',
                expire_date: '',
                quantity: 1,
                purchase_rate: 0,
                discount_type: 'amount',
                discount_value: 0,
                gst_tax_id: '',
                gst_percent: 0,
                product_total: 0,
                discount_amount: 0,
                taxable_amount: 0,
                gst_amount: 0,
                total: 0
            }
        ]
    });

    // Totals State
    const [totals, setTotals] = useState({
        subtotal: 0,
        invoiceDiscount: 0,
        taxableAmount: 0,
        gstTotal: 0,
        grandTotal: 0
    });

    useEffect(() => {
        fetchMasterData();
    }, []);

    useEffect(() => {
        if (mode === 'EDIT' && initialData) {
            const mappedItems = initialData.PurchaseItems?.map(item => {
                const discValue = parseFloat(item.discount_value) || 0;
                const discType = item.discount_type || 'amount';
                const qty = parseFloat(item.quantity) || 0;
                const rate = parseFloat(item.purchase_rate) || 0;
                const gstPct = parseFloat(item.gst_percent) || 0;

                const baseTotal = qty * rate;
                let dAmt = 0;
                if (discType === 'percent') {
                    dAmt = (baseTotal * discValue) / 100;
                } else {
                    dAmt = discValue;
                }

                const taxable = Math.max(0, baseTotal - dAmt);
                const gAmt = (taxable * gstPct) / 100;

                return {
                    product_id: item.product_id,
                    serial_no: item.serial_no || '',
                    batch_no: item.batch_no || '',
                    expire_date: item.expire_date ? new Date(item.expire_date).toISOString().split('T')[0] : '',
                    quantity: qty,
                    purchase_rate: rate,
                    discount_type: discType,
                    discount_value: discValue,
                    gst_tax_id: item.gst_tax_id || item.gst_tax_code_id || '',
                    gst_percent: gstPct,
                    product_total: baseTotal,
                    discount_amount: dAmt,
                    taxable_amount: taxable,
                    gst_amount: gAmt,
                    total: taxable + gAmt
                };
            }) || formData.items;

            setFormData({
                supplier_id: initialData.supplier_id || '',
                purchase_date: initialData.purchase_date ? new Date(initialData.purchase_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                warehouse_id: initialData.warehouse_id || '',
                purchase_no: initialData.purchase_no || '',
                discount_type: initialData.discount_type || initialData.invoice_discount_type || 'amount',
                discount_value: initialData.discount_value || initialData.invoice_discount_value || 0,
                items: mappedItems
            });

            // Initialize supplier dropdown with existing supplier if editing
            if (initialData.Supplier || initialData.supplier_name) {
                const s = initialData.Supplier || {};
                setSuppliers([{
                    value: initialData.supplier_id,
                    label: s.display_name || s.name || initialData.supplier_name || 'N/A'
                }]);
            }
        }
    }, [initialData, mode]);

    useEffect(() => {
        calculateGrandTotals();
    }, [formData]);

    const fetchMasterData = async () => {
        try {
            setLoadingMasters(true);
            const [prodRes, whRes, taxRes] = await Promise.all([
                api.get('/products'),
                api.get('/masters/warehouses'),
                api.get('/masters/gst_tax_codes')
            ]);

            if (prodRes.success !== false) {
                const data = prodRes.data;
                setProducts(Array.isArray(data) ? data : (data?.products || []));
            }
            // Suppliers fetch removed here, now using AsyncSearchableSelect
            if (whRes.success !== false) {
                const data = whRes.data;
                setWarehouses(Array.isArray(data) ? data : (data?.warehouses || []));
            }
            if (taxRes.success !== false) {
                const data = taxRes.data;
                setTaxCodes(Array.isArray(data) ? data : (data?.gst_tax_codes || data?.tax_codes || []));
            }
        } catch (error) {
            console.error('Failed to fetch master data', error);
            showToast('Failed to load master data', 'error');
        } finally {
            setLoadingMasters(false);
        }
    };

    const calculateItemTotals = (item) => {
        const qty = parseFloat(item.quantity) || 0;
        const rate = parseFloat(item.purchase_rate) || 0;
        const discVal = parseFloat(item.discount_value) || 0;
        const gstPct = parseFloat(item.gst_percent) || 0;

        const product_total = qty * rate;
        let discount_amount = 0;
        if (item.discount_type === 'percent') {
            discount_amount = (product_total * discVal) / 100;
        } else {
            discount_amount = discVal;
        }

        const taxable_amount = Math.max(0, product_total - discount_amount);
        const gst_amount = (taxable_amount * gstPct) / 100;
        const total = taxable_amount + gst_amount;

        return {
            product_total,
            discount_amount,
            taxable_amount,
            gst_amount,
            total
        };
    };

    const calculateGrandTotals = () => {
        const subtotal = formData.items.reduce((sum, item) => sum + (item.product_total || 0), 0);
        const itemDiscounts = formData.items.reduce((sum, item) => sum + (item.discount_amount || 0), 0);

        let invoiceDiscount = 0;
        const discVal = parseFloat(formData.discount_value) || 0;
        if (formData.discount_type === 'percent') {
            invoiceDiscount = ((subtotal - itemDiscounts) * discVal) / 100;
        } else {
            invoiceDiscount = discVal;
        }

        const taxableAmount = Math.max(0, subtotal - itemDiscounts - invoiceDiscount);
        const gstTotal = formData.items.reduce((sum, item) => sum + (item.gst_amount || 0), 0);
        const grandTotal = taxableAmount + gstTotal;

        setTotals({
            subtotal,
            invoiceDiscount,
            taxableAmount,
            gstTotal,
            grandTotal
        });
    };

    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSupplierSearch = async (term) => {
        try {
            const res = await api.get('/suppliers', { params: { search: term } });
            if (res.success !== false) {
                const list = Array.isArray(res.data) ? res.data : (res.data?.suppliers || []);
                return list.map(s => ({
                    value: s.id,
                    label: s.display_name || s.company_name || `${s.first_name} ${s.last_name}`
                }));
            }
            return [];
        } catch (error) {
            console.error('Supplier search failed', error);
            return [];
        }
    };

    const handleProductSearch = async (term) => {
        try {
            const res = await api.get('/products', { params: { search: term } });
            if (res.success !== false) {
                const list = Array.isArray(res.data) ? res.data : (res.data?.products || []);
                return list.map(p => ({
                    value: p.id,
                    label: p.product_name || p.name || p.product_code || 'Unnamed product'
                }));
            }
            return [];
        } catch (error) {
            console.error('Product search failed', error);
            return [];
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        const item = { ...newItems[index], [field]: value };

        if (field === 'product_id') {
            item.serial_no = '';
            item.batch_no = '';
            const prod = products.find(p => p.id === value);
            if (prod) {
                item.purchase_rate = prod.purchase_rate || 0;
                item.gst_tax_id = prod.gst_tax_id || '';
                const tax = taxCodes.find(t => t.id === item.gst_tax_id || prod.gst_tax_id);
                if (tax) {
                    item.gst_percent = parseFloat(tax.percentage) || parseFloat(tax.gst_percentage) || 0;
                } else {
                    item.gst_percent = 0;
                }
            } else {
                item.purchase_rate = 0;
                item.gst_tax_id = '';
                item.gst_percent = 0;
            }
        }

        if (field === 'serial_no' && !value) {
            item.batch_no = '';
        }

        if (field === 'gst_tax_id') {
            const tax = taxCodes.find(t => t.id === value);
            if (tax) {
                item.gst_percent = parseFloat(tax.percentage) || parseFloat(tax.gst_percentage) || 0;
            } else {
                item.gst_percent = 0;
            }
        }

        const calculated = calculateItemTotals(item);
        newItems[index] = { ...item, ...calculated };
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    product_id: '',
                    serial_no: '',
                    batch_no: '',
                    expire_date: '',
                    quantity: 1,
                    purchase_rate: 0,
                    discount_type: 'amount',
                    discount_value: 0,
                    gst_tax_id: '',
                    gst_percent: 0,
                    product_total: 0,
                    discount_amount: 0,
                    taxable_amount: 0,
                    gst_amount: 0,
                    total: 0
                }
            ]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length === 1) {
            showToast('At least one item is required', 'warning');
            return;
        }
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!formData.supplier_id) { showToast('Supplier is required', 'error'); return; }
        if (!formData.warehouse_id) { showToast('Warehouse is required', 'error'); return; }
        if (!formData.purchase_no) { showToast('Bill No is required', 'error'); return; }

        const invalidItem = formData.items.find(i => {
            if (!i.product_id) return true;
            if (!i.serial_no) return true;
            if (!i.batch_no) return true;
            if (i.gst_tax_id && (i.discount_value === '' || i.discount_value === null || isNaN(parseFloat(i.discount_value)))) return true;
            return false;
        });

        if (invalidItem) {
            showToast('Each item must have product, serial number, batch, and discount (if tax selected)', 'error');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                ...formData,
                discount_value: parseFloat(formData.discount_value) || 0,
                items: formData.items.map(item => ({
                    ...item,
                    quantity: parseFloat(item.quantity) || 0,
                    purchase_rate: parseFloat(item.purchase_rate) || 0,
                    discount_value: parseFloat(item.discount_value) || 0
                }))
            };

            let res;
            if (mode === 'EDIT') {
                res = await api.put(`/api/purchases/${initialData.id}`, payload);
            } else {
                res = await api.post('/api/purchases', payload);
            }

            if (res.success !== false) {
                showToast(`Purchase ${mode === 'ADD' ? 'created' : 'updated'} successfully`, 'success');
                if (isModal) {
                    onClose(true);
                } else {
                    navigate('/purchase');
                }
            } else {
                showToast(res.message || 'Failed to save purchase', 'error');
            }
        } catch (error) {
            console.error('Save error', error);
            showToast(error.message || 'Error saving purchase', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingMasters) {
        return (
            <div className={styles.loadingWrapper}>
                <Loader2 className="animate-spin" size={40} color="#2563eb" />
                <p>Loading master data...</p>
            </div>
        );
    }

    const formContent = (
        <div className={styles.formArea}>
            {/* General Info Section */}
            <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>
                        <Info className={styles.sectionIcon} size={18} />
                        General Information
                    </h3>
                </div>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label>Supplier *</label>
                        <AsyncSearchableSelect
                            name="supplier_id"
                            value={formData.supplier_id}
                            onChange={handleHeaderChange}
                            onSearch={handleSupplierSearch}
                            placeholder="Search Supplier..."
                            initialOptions={suppliers}
                            icon={User}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Purchase Date *</label>
                        <div className={styles.inputWrapper}>
                            <Calendar className={styles.fieldIcon} size={16} />
                            <input
                                type="date"
                                name="purchase_date"
                                value={formData.purchase_date}
                                onChange={handleHeaderChange}
                                className={styles.inputField}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Warehouse *</label>
                        <div className={styles.inputWrapper}>
                            <Warehouse className={styles.fieldIcon} size={16} />
                            <select
                                name="warehouse_id"
                                value={formData.warehouse_id}
                                onChange={handleHeaderChange}
                                className={`${styles.inputField} ${styles.selectField}`}
                                required
                            >
                                <option value="">Select Warehouse</option>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name || w.warehouse_name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Bill No *</label>
                        <div className={styles.inputWrapper}>
                            <Hash className={styles.fieldIcon} size={16} />
                            <input
                                type="text"
                                name="purchase_no"
                                value={formData.purchase_no}
                                onChange={handleHeaderChange}
                                placeholder="Enter Bill Number"
                                className={styles.inputField}
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Items Section */}
            <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>
                        <ShoppingCart className={styles.sectionIcon} size={18} />
                        Purchase Items
                    </h3>
                </div>
                <div className={styles.itemsContainer}>
                    {formData.items.map((item, index) => (
                        <div key={index} className={styles.itemCard}>
                            <button type="button" className={styles.removeItemBtn} onClick={() => removeItem(index)}>
                                <Trash2 size={14} />
                            </button>
                            <div className={styles.itemGrid}>
                                <div className={styles.formGroup}>
                                    <label>Product *</label>
                                    <div className={styles.inputWrapper}>
                                        <Package className={styles.fieldIcon} size={16} />
                                        <AsyncSearchableSelect
                                            name="product_id"
                                            value={item.product_id}
                                            onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                                            onSearch={handleProductSearch}
                                            placeholder="Search product..."
                                            initialOptions={products.map(p => ({ value: p.id, label: p.product_name || p.name || p.product_code }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Serial Number <span style={{ color: '#ef4444' }}>*</span></label>
                                    <div className={styles.inputWrapper}>
                                        <Hash className={styles.fieldIcon} size={16} />
                                        <input
                                            type="text"
                                            value={item.serial_no}
                                            onChange={(e) => handleItemChange(index, 'serial_no', e.target.value)}
                                            className={styles.inputField}
                                            placeholder={item.product_id ? 'Serial Number' : 'Select product first'}
                                            required={!!item.product_id}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Batch No <span style={{ color: '#ef4444' }}>*</span></label>
                                    <div className={styles.inputWrapper}>
                                        <Hash className={styles.fieldIcon} size={16} />
                                        <input
                                            type="text"
                                            value={item.batch_no}
                                            onChange={(e) => handleItemChange(index, 'batch_no', e.target.value)}
                                            className={styles.inputField}
                                            placeholder={item.serial_no ? 'Batch' : 'Enter serial first'}
                                            required={!!item.serial_no}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Qty *</label>
                                    <div className={styles.inputWrapper}>
                                        <Calculator className={styles.fieldIcon} size={16} />
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                            min="1"
                                            className={styles.inputField}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Rate *</label>
                                    <div className={styles.inputWrapper}>
                                        <CreditCard className={styles.fieldIcon} size={16} />
                                        <input
                                            type="number"
                                            value={item.purchase_rate}
                                            onChange={(e) => handleItemChange(index, 'purchase_rate', e.target.value)}
                                            step="0.01"
                                            className={styles.inputField}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Tax</label>
                                    <div className={styles.inputWrapper}>
                                        <BadgePercent className={styles.fieldIcon} size={16} />
                                        <select
                                            value={item.gst_tax_id}
                                            onChange={(e) => handleItemChange(index, 'gst_tax_id', e.target.value)}
                                            className={`${styles.inputField} ${styles.selectField}`}
                                        >
                                            <option value="">No Tax</option>
                                            {taxCodes.map(t => (
                                                <option key={t.id} value={t.id}>{t.name || t.tax_code} ({t.percentage || t.gst_percentage}%)</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {item.gst_tax_id && (
                                    <div className={styles.formGroup}>
                                        <label>Discount (after tax) *</label>
                                        <div className={styles.inputWrapper}>
                                            <BadgePercent className={styles.fieldIcon} size={16} />
                                            <input
                                                type="number"
                                                value={item.discount_value}
                                                onChange={(e) => handleItemChange(index, 'discount_value', e.target.value)}
                                                step="0.01"
                                                min="0"
                                                className={styles.inputField}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className={styles.formGroup}>
                                    <label>Total</label>
                                    <div className={styles.inputWrapper} style={{ background: '#f8fafc', padding: '0.625rem', borderRadius: '10px', height: '100%', alignItems: 'center', justifyContent: 'flex-end', fontWeight: '700', fontSize: '1rem', border: '1.5px solid #e2e8f0' }}>
                                        ₹{(item.total || 0).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button type="button" className={styles.addItemBtn} onClick={addItem}>
                    <Plus size={18} /> Add Another Product
                </button>
            </div>

            {/* Summary Section */}
            <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>
                        <ArrowDownRight className={styles.sectionIcon} size={18} />
                        Order Summary
                    </h3>
                </div>
                <div className={styles.summarySection}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div className={styles.formGroup}>
                            <label>Invoice Discount Type</label>
                            <div className={styles.inputWrapper}>
                                <Tag className={styles.fieldIcon} size={16} />
                                <select
                                    name="discount_type"
                                    value={formData.discount_type}
                                    onChange={handleHeaderChange}
                                    className={`${styles.inputField} ${styles.selectField}`}
                                >
                                    <option value="amount">Fixed Amount (₹)</option>
                                    <option value="percent">Percentage (%)</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Discount Value</label>
                            <div className={styles.inputWrapper}>
                                <BadgePercent className={styles.fieldIcon} size={16} />
                                <input
                                    type="number"
                                    name="discount_value"
                                    value={formData.discount_value}
                                    onChange={handleHeaderChange}
                                    className={styles.inputField}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.summaryTable}>
                        <div className={styles.summaryRow}>
                            <span>Subtotal:</span>
                            <span>₹{totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Total Tax (GST):</span>
                            <span>₹{totals.gstTotal.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Invoice Discount:</span>
                            <span style={{ color: '#ef4444' }}>- ₹{totals.invoiceDiscount.toFixed(2)}</span>
                        </div>
                        <div className={`${styles.summaryRow} ${styles.total}`}>
                            <span>Net Payable:</span>
                            <span>₹{totals.grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (isModal) {
        return (
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        {mode === 'ADD' ? 'Create New Purchase' : `Edit Purchase: ${formData.purchase_no || '---'}`}
                    </h2>
                    <button type="button" onClick={() => onClose()} className={styles.closeBtn}>
                        <X size={18} />
                    </button>
                </div>
                {formContent}
                <div className={styles.modalFooter}>
                    <button className={styles.btnSecondary} onClick={() => onClose()} disabled={submitting}>
                        Discard
                    </button>
                    <button className={styles.btnPrimary} onClick={handleSubmit} disabled={submitting}>
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        <span>{mode === 'ADD' ? 'Save' : 'Save Changes'}</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <div className="flex items-center gap-4">
                    <button className="back-btn" onClick={() => navigate('/purchase')}><ChevronLeft size={20} /></button>
                    <div>
                        <h1 className="text-2xl font-bold">{mode === 'ADD' ? 'New Purchase' : 'Edit Purchase'}</h1>
                        <p className="text-gray-500">{mode === 'ADD' ? 'Create a new purchase order' : `Ref: ${formData.purchase_no}`}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="btn-secondary" onClick={() => navigate('/purchase')} disabled={submitting}><X size={18} /> Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Order
                    </button>
                </div>
            </header>
            {formContent}
        </div>
    );
};

export default PurchaseForm;

