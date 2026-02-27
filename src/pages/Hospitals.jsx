import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Building2 } from 'lucide-react';
import api from '../services/api';
import styles from './MasterModules.module.css';

const Hospitals = () => {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        try {
            setLoading(true);
            const res = await api.get('/hospitals');
            if (res.success) {
                setHospitals(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch hospitals', error);
            setHospitals([
                { id: 1, code: 'HOSP-001', name: 'City Central Hospital', email: 'contact@citycentral.com', phone: '+91 9876543210', status: 'Active' },
                { id: 2, code: 'HOSP-002', name: 'Lifeline Wellness Center', email: 'info@lifeline.com', phone: '+91 8765432109', status: 'Active' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredHospitals = hospitals.filter(h =>
        h.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.iconWrapper}>
                        <Building2 size={24} className={styles.headerIcon} />
                    </div>
                    <div>
                        <h1 className={styles.pageTitle}>Hospitals</h1>
                        <p className={styles.pageSubtitle}>Manage hospital network and contacts.</p>
                    </div>
                </div>
                <button className="btn-primary">
                    <Plus size={20} />
                    <span>Add Hospital</span>
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
                                <th>Hospital Name</th>
                                <th>Email Contact</th>
                                <th>Phone Number</th>
                                <th>Status</th>
                                <th className={styles.textRight}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className={styles.loadingCell}>Loading data...</td></tr>
                            ) : filteredHospitals.length === 0 ? (
                                <tr><td colSpan="6" className={styles.emptyState}>No hospitals found.</td></tr>
                            ) : (
                                filteredHospitals.map(hospital => (
                                    <tr key={hospital.id}>
                                        <td className={styles.fw600}>{hospital.code || `HOSP-00${hospital.id}`}</td>
                                        <td className={styles.primaryText}>{hospital.name}</td>
                                        <td>{hospital.email}</td>
                                        <td>{hospital.phone}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${hospital.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>
                                                {hospital.status || 'Active'}
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

export default Hospitals;
