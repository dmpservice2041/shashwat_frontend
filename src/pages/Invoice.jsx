import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Download, Receipt } from 'lucide-react';
import api from '../services/api';
import styles from './MasterModules.module.css';

const Invoice = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await api.get('/invoice');
            if (res.success) setItems(res.data);
        } catch {
            setItems([
                { id: 1, invoiceNo: 'INV-2526-0001', hospital: 'City Central Hospital', date: '2025-04-15', subtotal: 28000, gstAmount: 5040, totalAmount: 33040, status: 'Unpaid' },
                { id: 2, invoiceNo: 'INV-2526-0002', hospital: 'Lifeline Wellness Center', date: '2025-04-18', subtotal: 14500, gstAmount: 2610, totalAmount: 17110, status: 'Paid' },
            ]);
        } finally { setLoading(false); }
    };

    const filtered = items.filter(i =>
        i.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.hospital?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.iconWrapper}><Receipt size={24} /></div>
                    <div>
                        <h1 className={styles.pageTitle}>Invoices</h1>
                        <p className={styles.pageSubtitle}>Generate and manage GST-compliant invoices from usage entries.</p>
                    </div>
                </div>
                <button className="btn-primary"><Plus size={20} /><span>New Invoice</span></button>
            </header>

            <div className={`glass-panel ${styles.tableContainer}`}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input type="text" placeholder="Search by invoice no. or hospital..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={styles.searchInput} />
                    </div>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead><tr>
                            <th>Invoice No.</th><th>Hospital</th><th>Date</th>
                            <th>Subtotal (₹)</th><th>GST (₹)</th><th>Total (₹)</th>
                            <th>Status</th><th className={styles.textRight}>Actions</th>
                        </tr></thead>
                        <tbody>
                            {loading ? <tr><td colSpan="8" className={styles.loadingCell}>Loading...</td></tr>
                                : filtered.length === 0 ? <tr><td colSpan="8" className={styles.emptyState}>No invoices found.</td></tr>
                                    : filtered.map(i => (
                                        <tr key={i.id}>
                                            <td className={styles.fw600}>{i.invoiceNo}</td>
                                            <td className={styles.primaryText}>{i.hospital}</td>
                                            <td>{i.date}</td>
                                            <td>₹{Number(i.subtotal).toFixed(2)}</td>
                                            <td>₹{Number(i.gstAmount).toFixed(2)}</td>
                                            <td className={styles.fw600}>₹{Number(i.totalAmount).toFixed(2)}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${i.status === 'Paid' ? styles.statusActive : styles.statusInactive}`}>{i.status}</span>
                                            </td>
                                            <td className={styles.actionsCell}>
                                                <button className={styles.actionBtn} title="View"><Eye size={16} /></button>
                                                <button className={styles.actionBtn} title="Download"><Download size={16} /></button>
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

export default Invoice;
