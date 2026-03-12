import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit2, Trash2, ShoppingCart, Loader2, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { hasPermission } from '../../../utils/permissions';
import { showToast } from '../../../components/common/Toast';
import PurchaseForm from './PurchaseForm';
import styles from '../../MasterModules.module.css';
import modalStyles from './PurchaseModal.module.css';

const PurchasesPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('ADD');
    const [selectedPurchase, setSelectedPurchase] = useState(null);

    const userPermissions = user?.permissions || [];

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            setLoading(true);
            const res = await api.get('/purchases');
            if (res.success !== false) {
                setEntries(Array.isArray(res.data) ? res.data : (res.data?.purchases || []));
            } else {
                showToast(res.message || 'Failed to fetch purchases', 'error');
            }
        } catch (error) {
            console.error('Failed to fetch purchases', error);
            showToast('Failed to load purchases list', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, purchase = null) => {
        setModalMode(mode);
        setSelectedPurchase(purchase);
        setIsModalOpen(true);
    };

    const handleCloseModal = (refresh = false) => {
        setIsModalOpen(false);
        setSelectedPurchase(null);
        if (refresh === true) fetchPurchases();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this purchase entry?')) return;

        try {
            const res = await api.delete(`/purchases/${id}`);
            if (res.success !== false) {
                showToast('Purchase deleted successfully', 'success');
                fetchPurchases();
            } else {
                showToast(res.message || 'Failed to delete purchase', 'error');
            }
        } catch (error) {
            console.error('Failed to delete purchase', error);
            showToast('Error deleting purchase', 'error');
        }
    };
    const handleConfirm = async (id) => {
        if (!window.confirm('Are you sure you want to confirm this purchase? This will update stock and cannot be undone.')) return;

        try {
            const res = await api.post(`/purchases/${id}/confirm`, {});
            if (res.success !== false) {
                showToast('Purchase confirmed and stock updated successfully', 'success');
                fetchPurchases();
            } else {
                showToast(res.message || 'Failed to confirm purchase', 'error');
            }
        } catch (error) {
            console.error('Failed to confirm purchase', error);
            showToast('Error confirming purchase', 'error');
        }
    };

    const filtered = entries.filter(e =>
        e.purchase_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.Supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.iconWrapper}>
                        <ShoppingCart size={24} className={styles.headerIcon} />
                    </div>
                    <div>
                        <h1 className={styles.pageTitle}>Purchases</h1>
                        <p className={styles.pageSubtitle}>Manage incoming stock and supplier invoices.</p>
                    </div>
                </div>
                {hasPermission(userPermissions, 'purchases:create') && (
                    <button className="btn-primary" onClick={() => handleOpenModal('ADD')}>
                        <Plus size={20} />
                        <span>New Purchase</span>
                    </button>
                )}
            </header>

            <div className={`glass-panel ${styles.tableContainer}`}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by purchase no or supplier..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className={styles.searchInput}
                        />
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Bill No</th>
                                <th>Supplier</th>
                                <th>Date</th>
                                <th>Warehouse</th>
                                <th>Grand Total (₹)</th>
                                <th>Status</th>
                                <th className={styles.textRight}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className={styles.loadingCell}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <Loader2 size={24} className="animate-spin" />
                                            <span>Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className={styles.emptyState}>
                                        {searchTerm ? 'No matches found.' : 'No purchases found.'}
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map(item => (
                                    <tr key={item.id}>
                                        <td className={styles.fw600}>{item.purchase_no}</td>
                                        <td>{item.Supplier?.name || item.supplier_name || 'N/A'}</td>
                                        <td>{item.purchase_date}</td>
                                        <td>{item.Warehouse?.name || item.warehouse_name || 'N/A'}</td>
                                        <td>₹{parseFloat(item.grand_total || 0).toFixed(2)}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${item.status === 'Draft' ? styles.statusInactive : styles.statusActive}`}>
                                                {item.status || 'Posted'}
                                            </span>
                                        </td>
                                        <td className={styles.actionsCell}>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => navigate(`/purchase/view/${item.id}`)}
                                                title="View"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {item.status?.toLowerCase() === 'draft' && hasPermission(userPermissions, 'purchases:edit') && (
                                                <>
                                                    <button
                                                        className={styles.actionBtn}
                                                        onClick={() => handleConfirm(item.id)}
                                                        title="Confirm Purchase"
                                                        style={{ color: 'var(--success-600)' }}
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button
                                                        className={styles.actionBtn}
                                                        onClick={() => handleOpenModal('EDIT', item)}
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                            {item.status?.toLowerCase() === 'draft' && hasPermission(userPermissions, 'purchases:delete') && (
                                                <button
                                                    className={`${styles.actionBtn} ${styles.dangerBtn}`}
                                                    onClick={() => handleDelete(item.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <div className={styles.paginationInfo}>
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filtered.length)} of {filtered.length} entries
                        </div>
                        <div className={styles.paginationControls}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={styles.pageBtn}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.activePage : ''}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={styles.pageBtn}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className={modalStyles.modalOverlay} onClick={() => handleCloseModal()}>
                    <div onClick={(e) => e.stopPropagation()} className={modalStyles.modalContainer}>
                        <PurchaseForm
                            mode={modalMode}
                            initialData={selectedPurchase}
                            onClose={handleCloseModal}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchasesPage;
