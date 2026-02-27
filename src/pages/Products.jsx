import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import api from '../services/api';
import styles from './MasterModules.module.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get('/products');
            if (res.success) {
                setProducts(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch products', error);
            setProducts([
                { id: 1, itemCode: 'ITM-001', name: 'Surgical Gloves (Box of 100)', category: 'Consumables', basePrice: 450, cgst: 9, sgst: 9, status: 'Active' },
                { id: 2, itemCode: 'ITM-002', name: 'N95 Respirator Masks', category: 'PPE', basePrice: 850, cgst: 6, sgst: 6, status: 'Active' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.itemCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.iconWrapper}>
                        <Package size={24} className={styles.headerIcon} />
                    </div>
                    <div>
                        <h1 className={styles.pageTitle}>Products Inventory</h1>
                        <p className={styles.pageSubtitle}>Manage medical products, pricing, and tax details.</p>
                    </div>
                </div>
                <button className="btn-primary">
                    <Plus size={20} />
                    <span>Add Product</span>
                </button>
            </header>

            <div className={`glass-panel ${styles.tableContainer}`}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by name or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Item Code</th>
                                <th>Product Name</th>
                                <th>Category</th>
                                <th>Base Price (₹)</th>
                                <th>Tax / GST</th>
                                <th>Status</th>
                                <th className={styles.textRight}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className={styles.loadingCell}>Loading data...</td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan="7" className={styles.emptyState}>No products found.</td></tr>
                            ) : (
                                filteredProducts.map(prod => (
                                    <tr key={prod.id}>
                                        <td className={styles.fw600}>{prod.itemCode}</td>
                                        <td className={styles.primaryText}>{prod.name}</td>
                                        <td>{prod.category}</td>
                                        <td>₹{prod.basePrice?.toFixed(2)}</td>
                                        <td>{prod.cgst + prod.sgst}%</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${prod.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>
                                                {prod.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className={styles.actionsCell}>
                                            <button className={styles.actionBtn} aria-label="Edit"><Edit2 size={16} /></button>
                                            <button className={`${styles.actionBtn} ${styles.dangerBtn}`} aria-label="Delete"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Products;
