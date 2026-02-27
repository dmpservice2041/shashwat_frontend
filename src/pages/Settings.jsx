import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import styles from './MasterModules.module.css';

const Settings = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchRoles(); }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const res = await api.get('/roles');
            if (res.success) setRoles(res.data);
        } catch {
            setRoles([
                { id: 1, name: 'Admin', description: 'Full system access to all modules', usersCount: 1, status: 'Active' },
                { id: 2, name: 'Accountant', description: 'Finance and payment modules', usersCount: 2, status: 'Active' },
                { id: 3, name: 'Hospital User', description: 'View quotations and challans', usersCount: 5, status: 'Active' },
                { id: 4, name: 'Delivery Person', description: 'Manage and confirm deliveries', usersCount: 3, status: 'Active' },
            ]);
        } finally { setLoading(false); }
    };

    const filtered = roles.filter(r =>
        r.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.iconWrapper}><ShieldCheck size={24} /></div>
                    <div>
                        <h1 className={styles.pageTitle}>Roles &amp; Permissions</h1>
                        <p className={styles.pageSubtitle}>Manage system roles and their access permissions.</p>
                    </div>
                </div>
                <button className="btn-primary"><Plus size={20} /><span>Add Role</span></button>
            </header>

            <div className={`glass-panel ${styles.tableContainer}`}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input type="text" placeholder="Search roles..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={styles.searchInput} />
                    </div>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead><tr>
                            <th>Role Name</th><th>Description</th><th>Users Assigned</th>
                            <th>Status</th><th className={styles.textRight}>Actions</th>
                        </tr></thead>
                        <tbody>
                            {loading ? <tr><td colSpan="5" className={styles.loadingCell}>Loading...</td></tr>
                                : filtered.length === 0 ? <tr><td colSpan="5" className={styles.emptyState}>No roles found.</td></tr>
                                    : filtered.map(r => (
                                        <tr key={r.id}>
                                            <td className={`${styles.fw600} ${styles.primaryText}`}>{r.name}</td>
                                            <td>{r.description}</td>
                                            <td>{r.usersCount}</td>
                                            <td><span className={`${styles.statusBadge} ${r.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>{r.status}</span></td>
                                            <td className={styles.actionsCell}>
                                                <button className={styles.actionBtn}><Edit2 size={16} /></button>
                                                <button className={`${styles.actionBtn} ${styles.dangerBtn}`}><Trash2 size={16} /></button>
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

export default Settings;
