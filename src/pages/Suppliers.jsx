import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Truck } from 'lucide-react';
import api from '../services/api';
import styles from './MasterModules.module.css';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/products/suppliers');
            if (res.success) {
                setSuppliers(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch suppliers', error);
            setSuppliers([
                { id: 1, name: 'Medipharma Global', code: 'SUP-001', contactPerson: 'Alice Brown', email: 'alice@medipharma.com', phone: '+91 9123456780', status: 'Active' },
                { id: 2, name: 'Surgical Equipments Ltd', code: 'SUP-002', contactPerson: 'Bob White', email: 'sales@surgicalcorp.com', phone: '+91 9234567890', status: 'Active' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <button className="btn-primary">
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
                                <th>Code</th>
                                <th>Supplier Name</th>
                                <th>Contact Person</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th className={styles.textRight}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className={styles.loadingCell}>Loading data...</td></tr>
                            ) : filteredSuppliers.length === 0 ? (
                                <tr><td colSpan="7" className={styles.emptyState}>No suppliers found.</td></tr>
                            ) : (
                                filteredSuppliers.map(sup => (
                                    <tr key={sup.id}>
                                        <td className={styles.fw600}>{sup.code}</td>
                                        <td className={styles.primaryText}>{sup.name}</td>
                                        <td>{sup.contactPerson}</td>
                                        <td>{sup.email}</td>
                                        <td>{sup.phone}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${sup.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>
                                                {sup.status || 'Active'}
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

export default Suppliers;
