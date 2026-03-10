import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Package,
    Loader2,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown
} from 'lucide-react';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { hasPermission } from '../../../utils/permissions';
import { showToast } from '../../../components/common/Toast';
import ProductForm from './ProductForm';
import styles from '../../MasterModules.module.css';

const ProductsPage = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('ADD'); // 'ADD', 'EDIT', 'VIEW'
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const userPermissions = user?.permissions || [];

    useEffect(() => {
        fetchProducts();

        const handleCloseModal = () => {
            setIsModalOpen(false);
            setSelectedProduct(null);
        };

        window.addEventListener('closeProductModal', handleCloseModal);
        return () => window.removeEventListener('closeProductModal', handleCloseModal);
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get('/products');
            if (res.success !== false) {
                setProducts(Array.isArray(res.data) ? res.data : (res.data?.products || []));
            } else {
                showToast(res.message || 'Failed to fetch products', 'error');
            }
        } catch (error) {
            console.error('Failed to fetch products', error);
            showToast('Failed to load products list', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, product = null) => {
        setModalMode(mode);
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        try {
            setSubmitting(true);
            let res;
            if (modalMode === 'ADD') {
                res = await api.post('/products', formData);
            } else {
                res = await api.put(`/products/${selectedProduct.id}`, formData);
            }

            if (res.success !== false) {
                showToast(`Product ${modalMode === 'ADD' ? 'created' : 'updated'} successfully`, 'success');
                setIsModalOpen(false);
                setSelectedProduct(null);
                fetchProducts();
            } else {
                showToast(res.message || `Failed to ${modalMode === 'ADD' ? 'create' : 'update'} product`, 'error');
            }
        } catch (error) {
            console.error(`Failed to ${modalMode === 'ADD' ? 'create' : 'update'} product`, error);
            showToast(error.message || `Failed to ${modalMode === 'ADD' ? 'create' : 'update'} product`, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const res = await api.delete(`/products/${id}`);
            if (res.success !== false) {
                showToast('Product deleted successfully', 'success');
                fetchProducts();
            } else {
                showToast(res.message || 'Failed to delete product', 'error');
            }
        } catch (error) {
            console.error('Failed to delete product', error);
            showToast(error.message || 'Failed to delete product', 'error');
        }
    };

    const filteredProducts = products.filter(p =>
        p.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.Category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.Manufacturer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.iconWrapper}>
                        <Package size={24} className={styles.headerIcon} />
                    </div>
                    <div>
                        <h1 className={styles.pageTitle}>Inventory</h1>
                        <p className={styles.pageSubtitle}>Manage your products, stock levels, and pricing.</p>
                    </div>
                </div>
                {hasPermission(userPermissions, 'products:create') && (
                    <button className="btn-primary" onClick={() => handleOpenModal('ADD')}>
                        <Plus size={20} />
                        <span>Add Product</span>
                    </button>
                )}
            </header>

            <div className={`glass-panel ${styles.tableContainer}`}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by name, code or category..."
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
                                <th>Product Name</th>
                                <th>Manufacturer</th>
                                <th>Category / Sub Category</th>
                                <th>Material Type</th>
                                <th>Stock Info</th>
                                <th>Price Info (₹)</th>
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
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className={styles.emptyState}>
                                        {searchTerm ? 'No matches found.' : 'Inventory is empty.'}
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map(p => {
                                    const isLowStock = p.quantity <= (p.min_quantity || 0);
                                    return (
                                        <tr key={p.id}>
                                            <td onClick={() => handleOpenModal('VIEW', p)} style={{ cursor: 'pointer' }}>
                                                <div className={styles.fw600}>{p.product_name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>{p.product_code}</div>
                                            </td>
                                            <td>{p.Manufacturer?.name || p.manufacturer_name || p.manufacturer?.name || 'N/A'}</td>
                                            <td>
                                                <div className={styles.primaryText}>{p.Category?.name || p.category_name || p.category?.name || 'N/A'}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>{p.SubCategory?.name || p.subcategory_name || p.sub_category?.name || '---'}</div>
                                            </td>
                                            <td>{p.MaterialType?.name || p.material_type || p.material?.name || 'N/A'}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span className={styles.fw600}>{p.quantity}</span>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>{p.Unit?.name || p.unit_name || p.unit?.name || p.unit_symbol}</span>
                                                    {isLowStock && (
                                                        <span title="Low Stock Alert" style={{ color: '#f59e0b' }}>
                                                            <AlertTriangle size={14} />
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '0.70rem', color: isLowStock ? '#ef4444' : 'var(--neutral-400)' }}>
                                                    Min: {p.min_quantity || 0}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem', marginBottom: '2px' }}>
                                                    MRP: <span className={styles.fw600}>₹{parseFloat(p.mrp || 0).toFixed(2)}</span>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', whiteSpace: 'nowrap' }}>
                                                    P: ₹{parseFloat(p.purchase_rate || 0).toFixed(2)} <span style={{ color: '#94a3b8', margin: '0 2px' }}>|</span> S: ₹{parseFloat(p.sales_rate || 0).toFixed(2)}
                                                </div>
                                            </td>
                                            <td className={styles.actionsCell}>
                                                {hasPermission(userPermissions, 'products:edit') && (
                                                    <button
                                                        className={styles.actionBtn}
                                                        onClick={() => handleOpenModal('EDIT', p)}
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                                {hasPermission(userPermissions, 'products:delete') && (
                                                    <button
                                                        className={`${styles.actionBtn} ${styles.dangerBtn}`}
                                                        onClick={() => handleDelete(p.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <div className={styles.paginationInfo}>
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} entries
                        </div>
                        <div className={styles.paginationControls}>
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={styles.pageBtn}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => paginate(i + 1)}
                                    className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.activePage : ''}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => paginate(currentPage + 1)}
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
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()}>
                        <ProductForm
                            initialData={selectedProduct}
                            onSubmit={handleFormSubmit}
                            loading={submitting}
                            mode={modalMode}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;
