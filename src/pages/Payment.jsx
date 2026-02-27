import { useState, useEffect } from 'react';
import { Plus, Search, Eye, CreditCard } from 'lucide-react';
import api from '../services/api';
import styles from './MasterModules.module.css';

const Payment = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await api.get('/payment');
            if (res.success) setItems(res.data);
        } catch {
            setItems([
                { id: 1, paymentNo: 'PAY-2526-0001', hospital: 'Lifeline Wellness Center', invoiceNo: 'INV-2526-0002', date: '2025-04-20', amount: 17110, mode: 'NEFT', status: 'Cleared' },
                { id: 2, paymentNo: 'PAY-2526-0002', hospital: 'City Central Hospital', invoiceNo: 'INV-2526-0001', date: '2025-04-22', amount: 10000, mode: 'Cheque', status: 'Pending' },
            ]);
        } finally { setLoading(false); }
    };

    const filtered = items.filter(i =>
        i.paymentNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.hospital?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.iconWrapper}><CreditCard size={24} /></div>
                    <div>
                        <h1 className={styles.pageTitle}>Payments</h1>
                        <p className={styles.pageSubtitle}>Record hospital payments and maintain ledger entries.</p>
                    </div>
                </div>
                <button className="btn-primary"><Plus size={20} /><span>Record Payment</span></button>
            </header>

            <div className={`glass-panel ${styles.tableContainer}`}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input type="text" placeholder="Search by payment no. or hospital..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={styles.searchInput} />
                    </div>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead><tr>
                            <th>Payment No.</th><th>Hospital</th><th>Invoice No.</th>
                            <th>Date</th><th>Amount (₹)</th><th>Mode</th>
                            <th>Status</th><th className={styles.textRight}>Actions</th>
                        </tr></thead>
                        <tbody>
                            {loading ? <tr><td colSpan="8" className={styles.loadingCell}>Loading...</td></tr>
                                : filtered.length === 0 ? <tr><td colSpan="8" className={styles.emptyState}>No payments found.</td></tr>
                                    : filtered.map(i => (
                                        <tr key={i.id}>
                                            <td className={styles.fw600}>{i.paymentNo}</td>
                                            <td className={styles.primaryText}>{i.hospital}</td>
                                            <td>{i.invoiceNo}</td>
                                            <td>{i.date}</td>
                                            <td className={styles.fw600}>₹{Number(i.amount).toFixed(2)}</td>
                                            <td>{i.mode}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${i.status === 'Cleared' ? styles.statusActive : styles.statusInactive}`}>{i.status}</span>
                                            </td>
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

export default Payment;
