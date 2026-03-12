import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Loader2,
    Calendar,
    User,
    Warehouse as WarehouseIcon,
    Printer,
    Edit2,
    ShoppingCart,
    CheckCircle
} from 'lucide-react';
import api from '../../../services/api';
import { showToast } from '../../../components/common/Toast';
import styles from '../../MasterModules.module.css';

const PurchaseDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [purchase, setPurchase] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleConfirm = async () => {
        if (!window.confirm('Are you sure you want to confirm this purchase? This will update stock and cannot be undone.')) return;

        try {
            setLoading(true);
            const res = await api.post(`/purchases/${id}/confirm`, {});
            if (res.success !== false) {
                showToast('Purchase confirmed and stock updated successfully', 'success');
                // Refresh data
                const updatedRes = await api.get(`/purchases/${id}`);
                if (updatedRes.success !== false) setPurchase(updatedRes.data);
            } else {
                showToast(res.message || 'Failed to confirm purchase', 'error');
            }
        } catch (error) {
            console.error('Failed to confirm purchase', error);
            showToast('Error confirming purchase', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchPurchase = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/purchases/${id}`);
                if (res.success !== false) {
                    setPurchase(res.data);
                } else {
                    showToast(res.message || 'Failed to fetch purchase details', 'error');
                }
            } catch (error) {
                console.error('Failed to fetch purchase', error);
                showToast('Error loading purchase details', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPurchase();
    }, [id]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 size={40} className="animate-spin" />
                <p>Loading purchase details...</p>
            </div>
        );
    }

    if (!purchase) {
        return (
            <div className={styles.errorContainer}>
                <p>Purchase not found.</p>
                <button className="btn-primary" onClick={() => navigate('/purchase')}>Go Back</button>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <button className={styles.backBtn} onClick={() => navigate('/purchase')}>
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className={styles.pageTitle}>Purchase Details</h1>
                        <p className={styles.pageSubtitle}>Bill No: {purchase.purchase_no}</p>
                    </div>
                </div>
                <div className={styles.headerRight} style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" onClick={() => window.print()}>
                        <Printer size={18} /> <span>Print</span>
                    </button>
                    {purchase.status?.toLowerCase() === 'draft' && (
                        <>
                            <button className="btn-success" onClick={handleConfirm} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'var(--success-600)', color: 'white', fontWeight: '500', cursor: 'pointer' }}>
                                <CheckCircle size={18} /> <span>Confirm Purchase</span>
                            </button>
                            <button className="btn-primary" onClick={() => navigate(`/purchase/edit/${purchase.id}`)}>
                                <Edit2 size={18} /> <span>Edit Purchase</span>
                            </button>
                        </>
                    )}
                </div>
            </header>

            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <div className={styles.formGrid}>
                    <div className={styles.viewDataPoint}>
                        <User size={18} className={styles.dataIcon} />
                        <div className={styles.dataContent}>
                            <span className={styles.dataLabel}>Supplier</span>
                            <span className={styles.dataValue}>{purchase.Supplier?.name || purchase.supplier_name}</span>
                        </div>
                    </div>
                    <div className={styles.viewDataPoint}>
                        <Calendar size={18} className={styles.dataIcon} />
                        <div className={styles.dataContent}>
                            <span className={styles.dataLabel}>Date</span>
                            <span className={styles.dataValue}>{purchase.purchase_date}</span>
                        </div>
                    </div>
                    <div className={styles.viewDataPoint}>
                        <WarehouseIcon size={18} className={styles.dataIcon} />
                        <div className={styles.dataContent}>
                            <span className={styles.dataLabel}>Warehouse</span>
                            <span className={styles.dataValue}>{purchase.Warehouse?.name || purchase.warehouse_name}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '0px', marginBottom: '24px', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--neutral-200)' }}>
                    <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Items List</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className={styles.dataTable} style={{ margin: 0 }}>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Batch</th>
                                <th>Expiry</th>
                                <th>Qty</th>
                                <th>Rate (₹)</th>
                                <th>Discount</th>
                                <th>GST (₹)</th>
                                <th className={styles.textRight}>Total (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchase.PurchaseItems?.map((item, index) => (
                                <tr key={index}>
                                    <td className={styles.fw600}>{item.Product?.product_name || item.product_name}</td>
                                    <td>{item.batch_no || '-'}</td>
                                    <td>{item.expire_date || '-'}</td>
                                    <td>{item.quantity}</td>
                                    <td>₹{parseFloat(item.purchase_rate).toFixed(2)}</td>
                                    <td>
                                        {item.discount_type === 'percent'
                                            ? `${item.discount_value}%`
                                            : `₹${parseFloat(item.discount_value).toFixed(2)}`}
                                    </td>
                                    <td>₹{parseFloat(item.gst_amount || 0).toFixed(2)}</td>
                                    <td className={styles.textRight}>₹{parseFloat(item.total).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div className="glass-panel" style={{ width: '400px', padding: '24px' }}>
                    <div className={styles.summaryItem} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: 'var(--neutral-600)' }}>Subtotal:</span>
                        <span className={styles.fw600}>₹{parseFloat(purchase.sub_total || 0).toFixed(2)}</span>
                    </div>
                    <div className={styles.summaryItem} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: 'var(--neutral-600)' }}>Invoice Discount:</span>
                        <span style={{ color: '#ef4444' }}>- ₹{parseFloat(purchase.invoice_discount_amount || 0).toFixed(2)}</span>
                    </div>
                    <div className={styles.summaryItem} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed var(--neutral-300)' }}>
                        <span style={{ color: 'var(--neutral-600)' }}>Taxable Amount:</span>
                        <span className={styles.fw600}>₹{parseFloat(purchase.taxable_amount || (parseFloat(purchase.sub_total || 0) - parseFloat(purchase.invoice_discount_amount || 0))).toFixed(2)}</span>
                    </div>
                    <div className={styles.summaryItem} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', marginTop: '12px' }}>
                        <span style={{ color: 'var(--neutral-600)' }}>GST Total:</span>
                        <span className={styles.fw600}>₹{parseFloat(purchase.gst_total || 0).toFixed(2)}</span>
                    </div>
                    <div className={styles.summaryItem} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--neutral-200)' }}>
                        <span className={styles.fw600} style={{ fontSize: '1.1rem' }}>Grand Total:</span>
                        <span className={styles.fw600} style={{ fontSize: '1.25rem', color: 'var(--primary-600)' }}>₹{parseFloat(purchase.grand_total || 0).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseDetailsPage;
