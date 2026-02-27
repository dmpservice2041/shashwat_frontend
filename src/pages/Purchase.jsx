import { useState, useEffect } from 'react';
import { Plus, Search, Eye, ShoppingCart } from 'lucide-react';
import api from '../services/api';
import styles from './MasterModules.module.css';

const Purchase = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchEntries(); }, []);

    const fetchEntries = async () => {
        try {
            setLoading(true);
            const res = await api.get('/purchase');
            if (res.success) setEntries(res.data);
        } catch {
            setEntries([
                { id: 1, purchaseNo: 'PUR-2526-0001', supplier: 'Medipharma Global', billNo: 'INV-001', purchaseDate: '2025-04-01', totalAmount: 12500, status: 'Posted' },
                { id: 2, purchaseNo: 'PUR-2526-0002', supplier: 'Surgical Equipments Ltd', billNo: 'INV-002', purchaseDate: '2025-04-03', totalAmount: 8900, status: 'Posted' },
            ]);
        } finally { setLoading(false); }
    };

    const filtered = entries.filter(e =>
        e.purchaseNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.iconWrapper}><ShoppingCart size={24} /></div>
                    <div>
                        <h1 className={styles.pageTitle}>Purchase Entries</h1>
                        <p className={styles.pageSubtitle}>Record incoming stock from suppliers.</p>
                    </div>
                </div>
                <button className="btn-primary"><Plus size={20} /><span>New Purchase</span></button>
            </header>

            <div className={`glass-panel ${styles.tableContainer}`}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input type="text" placeholder="Search by number or supplier..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={styles.searchInput} />
                    </div>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead><tr>
                            <th>Purchase No.</th><th>Supplier</th><th>Supplier Bill No.</th>
                            <th>Date</th><th>Total Amount (₹)</th><th>Status</th>
                            <th className={styles.textRight}>Actions</th>
                        </tr></thead>
                        <tbody>
                            {loading ? <tr><td colSpan="7" className={styles.loadingCell}>Loading...</td></tr>
                                : filtered.length === 0 ? <tr><td colSpan="7" className={styles.emptyState}>No entries found.</td></tr>
                                    : filtered.map(e => (
                                        <tr key={e.id}>
                                            <td className={styles.fw600}>{e.purchaseNo}</td>
                                            <td className={styles.primaryText}>{e.supplier}</td>
                                            <td>{e.billNo}</td>
                                            <td>{e.purchaseDate}</td>
                                            <td>₹{Number(e.totalAmount).toFixed(2)}</td>
                                            <td><span className={`${styles.statusBadge} ${styles.statusActive}`}>{e.status}</span></td>
                                            <td className={styles.actionsCell}>
                                                <button className={styles.actionBtn} aria-label="View"><Eye size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Purchase;
