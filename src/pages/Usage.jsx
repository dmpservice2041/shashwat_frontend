import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Activity } from 'lucide-react';
import api from '../services/api';
import styles from './MasterModules.module.css';

const Usage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await api.get('/usage');
            if (res.success) setItems(res.data);
        } catch {
            setItems([
                {
                    id: 1,
                    usageNo: 'USE-2526-0001',
                    patient: { first_name: 'Amit', last_name: 'Patel' },
                    hospital: 'City Care Hospital',
                    doctor: { first_name: 'Raj', last_name: 'Sharma' },
                    date: '2025-04-11',
                    status: 'Invoiced'
                },
                {
                    id: 2,
                    usageNo: 'USE-2526-0002',
                    patient: { first_name: 'Sneha', last_name: 'Gupta' },
                    hospital: 'Aarogya Wellness Center',
                    doctor: { first_name: 'Ananya', last_name: 'Iyer' },
                    date: '2025-04-13',
                    status: 'Pending'
                },
            ]);
        } finally { setLoading(false); }
    };

    const formatName = (user) => {
        if (!user) return 'N/A';
        if (typeof user === 'string') return user;
        return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A';
    };

    const filtered = items.filter(i => {
        const patientName = formatName(i.patient);
        const doctorName = formatName(i.doctor);
        return i.usageNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.hospital?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.iconWrapper}><Activity size={24} /></div>
                    <div>
                        <h1 className={styles.pageTitle}>Usage Entries</h1>
                        <p className={styles.pageSubtitle}>Record patient-wise product usage during procedures.</p>
                    </div>
                </div>
                <button className="btn-primary"><Plus size={20} /><span>New Usage Entry</span></button>
            </header>

            <div className={`glass-panel ${styles.tableContainer}`}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input type="text" placeholder="Search by usage no., patient or hospital..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={styles.searchInput} />
                    </div>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead><tr>
                            <th>Usage No.</th><th>Patient</th><th>Hospital</th>
                            <th>Doctor</th><th>Date</th><th>Status</th>
                            <th className={styles.textRight}>Actions</th>
                        </tr></thead>
                        <tbody>
                            {loading ? <tr><td colSpan="7" className={styles.loadingCell}>Loading...</td></tr>
                                : filtered.length === 0 ? <tr><td colSpan="7" className={styles.emptyState}>No usage entries found.</td></tr>
                                    : filtered.map(i => (
                                        <tr key={i.id}>
                                            <td className={styles.fw600}>{i.usageNo}</td>
                                            <td className={styles.primaryText}>{formatName(i.patient)}</td>
                                            <td>{i.hospital}</td>
                                            <td>{formatName(i.doctor)}</td>
                                            <td>{i.date}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${i.status === 'Invoiced' ? styles.statusActive : styles.statusInactive}`}>{i.status}</span>
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

export default Usage;
