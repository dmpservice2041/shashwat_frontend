import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Stethoscope } from 'lucide-react';
import api from '../services/api';
import styles from './MasterModules.module.css';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const res = await api.get('/doctors');
            if (res.success) {
                setDoctors(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch doctors', error);
            setDoctors([
                { id: 1, name: 'Dr. John Doe', specialization: 'Cardiology', hospital: 'City Central Hospital', contact: '+91 9999999999', status: 'Active' },
                { id: 2, name: 'Dr. Sarah Lee', specialization: 'Orthopedics', hospital: 'Lifeline Wellness Center', contact: '+91 8888888888', status: 'Active' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter(d =>
        d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.iconWrapper}>
                        <Stethoscope size={24} className={styles.headerIcon} />
                    </div>
                    <div>
                        <h1 className={styles.pageTitle}>Doctors</h1>
                        <p className={styles.pageSubtitle}>Manage affiliated doctors and specialists.</p>
                    </div>
                </div>
                <button className="btn-primary">
                    <Plus size={20} />
                    <span>Add Doctor</span>
                </button>
            </header>

            <div className={`glass-panel ${styles.tableContainer}`}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by name or specialization..."
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
                                <th>Doctor Name</th>
                                <th>Specialization</th>
                                <th>Affiliated Hospital</th>
                                <th>Contact</th>
                                <th>Status</th>
                                <th className={styles.textRight}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className={styles.loadingCell}>Loading data...</td></tr>
                            ) : filteredDoctors.length === 0 ? (
                                <tr><td colSpan="6" className={styles.emptyState}>No doctors found.</td></tr>
                            ) : (
                                filteredDoctors.map(doc => (
                                    <tr key={doc.id}>
                                        <td className={`${styles.fw600} ${styles.primaryText}`}>{doc.name}</td>
                                        <td>{doc.specialization}</td>
                                        <td>{doc.hospital}</td>
                                        <td>{doc.contact}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${doc.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>
                                                {doc.status || 'Active'}
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

export default Doctors;
