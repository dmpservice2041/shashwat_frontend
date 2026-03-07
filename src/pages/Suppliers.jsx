import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Truck, Loader2 } from 'lucide-react';
import api from '../services/api';
import styles from './MasterModules.module.css';
import SupplierModal from '../components/suppliers/SupplierModal';
import { showToast } from '../components/common/Toast';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('ADD');
    const [currentSupplier, setCurrentSupplier] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/suppliers');
            // Handle both success property and successful response without error
            if (res.success !== false) {
                // Ensure res.data is an array. If it's the wrap object, use res.data.suppliers
                const suppliersList = Array.isArray(res.data) ? res.data : (res.data?.suppliers || []);
                setSuppliers(suppliersList);
            }
        } catch (error) {
            console.error('Failed to fetch suppliers', error);
            showToast('Failed to load suppliers');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, supplier = null) => {
        setModalMode(mode);
        if (mode === 'EDIT' && supplier) {
            setCurrentSupplier(supplier);
        } else {
            setCurrentSupplier(null);
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        console.log('Suppliers: handleFormSubmit called', formData);
        setFormLoading(true);
        try {
            if (modalMode === 'ADD') {
                const res = await api.post('/suppliers', formData);
                // Handle both success property and successful response without error
                if (res.success !== false) {
                    showToast('Supplier added successfully');
                    fetchSuppliers();
                    setIsModalOpen(false);
                } else {
                    showToast(res.message || 'Failed to save supplier');
                }
            } else {
                const res = await api.put(`/suppliers/${currentSupplier.id}`, formData);
                // Handle both success property and successful response without error
                if (res.success !== false) {
                    showToast('Supplier updated successfully');
                    fetchSuppliers();
                    setIsModalOpen(false);
                } else {
                    showToast(res.message || 'Failed to update supplier');
                }
            }
        } catch (error) {
            console.error('Failed to save supplier', error);
            showToast(error.message || 'Failed to save supplier');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this supplier?')) return;

        try {
            const res = await api.delete(`/suppliers/${id}`);
            // Handle both success property and successful response without error
            if (res.success !== false) {
                showToast('Supplier deleted successfully');
                fetchSuppliers();
            } else {
                showToast(res.message || 'Failed to delete supplier');
            }
        } catch (error) {
            console.error('Failed to delete supplier', error);
            showToast(error.message || 'Failed to delete supplier');
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.iconWrapper}>
                        <Truck size={24} className={styles.headerIcon} />
                    </div>
                    <div>
                        <h1 className={styles.pageTitle}>Suppliers</h1>
                        <p className={styles.pageSubtitle}>Manage wholesale medical suppliers and vendors.</p>
                    </div>
                </div>
                <button className="btn-primary" onClick={() => handleOpenModal('ADD')}>
                    <Plus size={20} />
                    <span>Add Supplier</span>
                </button>
            </header>

            <div className={`glass-panel ${styles.tableContainer}`}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by name or company..."
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
                                <th>Display Name</th>
                                <th>Company Name</th>
                                <th>Email</th>
                                <th>Mobile</th>
                                <th>Status</th>
                                <th className={styles.textRight}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className={styles.loadingCell}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Loader2 size={20} className="animate-spin" />
                                        Loading data...
                                    </div>
                                </td></tr>
                            ) : filteredSuppliers.length === 0 ? (
                                <tr><td colSpan="6" className={styles.emptyState}>No suppliers found.</td></tr>
                            ) : (
                                filteredSuppliers.map(sup => (
                                    <tr key={sup.id}>
                                        <td className={styles.fw600}>{sup.display_name}</td>
                                        <td className={styles.primaryText}>{sup.company_name}</td>
                                        <td>{sup.email || (sup.contacts?.[0]?.email)}</td>
                                        <td>{sup.mobile || (sup.contacts?.[0]?.mobile)}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${sup.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                                                {sup.status || 'active'}
                                            </span>
                                        </td>
                                        <td className={styles.actionsCell}>
                                            <button
                                                className={styles.actionBtn}
                                                aria-label="Edit"
                                                onClick={() => handleOpenModal('EDIT', sup)}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className={`${styles.actionBtn} ${styles.dangerBtn}`}
                                                aria-label="Delete"
                                                onClick={() => handleDelete(sup.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <SupplierModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                initialData={currentSupplier}
                onSubmit={handleFormSubmit}
                loading={formLoading}
            />
        </div>
    );
};

export default Suppliers;
