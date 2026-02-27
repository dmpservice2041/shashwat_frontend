import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Truck } from 'lucide-react';
import api from '../services/api';
import styles from './MasterModules.module.css';

const Challan = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await api.get('/challan');
            if (res.success) setItems(res.data);
        } catch {
            setItems([
                { id: 1, challanNo: 'DC-2526-0001', hospital: 'City Central Hospital', quotationNo: 'QT-2526-0001', date: '2025-04-10', status: 'Delivered' },
                { id: 2, challanNo: 'DC-2526-0002', hospital: 'Lifeline Wellness Center', quotationNo: 'QT-2526-0002', date: '2025-04-12', status: 'Partial' },
            ]);
        } finally { setLoading(false); }
    };

    const filtered = items.filter(i =>
        i.challanNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.hospital?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusClass = (s) => {
        if (s === 'Delivered') return styles.statusActive;
        if (s === 'Partial') return styles.statusBadgeWarning;
        return styles.statusInactive;
    };

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.iconWrapper}><Truck size={24} /></div>
                    <div>
                        <h1 className={styles.pageTitle}>Delivery Challans</h1>
                        <p className={styles.pageSubtitle}>Manage stock deliveries and partial shipments.</p>
                    </div>
                </div>
                <button className="btn-primary"><Plus size={20} /><span>New Challan</span></button>
            </header>

            <div className={`glass-panel ${styles.tableContainer}`}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input type="text" placeholder="Search by number or hospital..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={styles.searchInput} />
                    </div>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead><tr>
                            <th>Challan No.</th><th>Hospital</th><th>Against Quotation</th>
                            <th>Date</th><th>Status</th><th className={styles.textRight}>Actions</th>
                        </tr></thead>
                        <tbody>
                            {loading ? <tr><td colSpan="6" className={styles.loadingCell}>Loading...</td></tr>
                                : filtered.length === 0 ? <tr><td colSpan="6" className={styles.emptyState}>No challans found.</td></tr>
                                    : filtered.map(i => (
                                        <tr key={i.id}>
                                            <td className={styles.fw600}>{i.challanNo}</td>
                                            <td className={styles.primaryText}>{i.hospital}</td>
                                            <td>{i.quotationNo}</td>
                                            <td>{i.date}</td>
                                            <td><span className={`${styles.statusBadge} ${getStatusClass(i.status)}`}>{i.status}</span></td>
                                            <td className={styles.actionsCell}>
                                                <button className={styles.actionBtn}><Eye size={16} /></button>
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

export default Challan;
