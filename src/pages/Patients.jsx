import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Activity } from 'lucide-react';
import api from '../services/api';
import styles from './MasterModules.module.css';

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const res = await api.get('/patients');
            if (res.success) {
                setPatients(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch patients', error);
            setPatients([
                { id: 1, uhid: 'UHID-1001', name: 'Michael Smith', age: 45, hospital: 'City Central Hospital', doctor: 'Dr. John Doe' },
                { id: 2, uhid: 'UHID-1002', name: 'Emily Chen', age: 32, hospital: 'Lifeline Wellness Center', doctor: 'Dr. Sarah Lee' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.uhid?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.iconWrapper}>
                        <Activity size={24} className={styles.headerIcon} />
                    </div>
                    <div>
                        <h1 className={styles.pageTitle}>Patients</h1>
                        <p className={styles.pageSubtitle}>Manage patient records for usage entries.</p>
                    </div>
                </div>
                <button className="btn-primary">
                    <Plus size={20} />
                    <span>Add Patient</span>
                </button>
            </header>

            <div className={`glass-panel ${styles.tableContainer}`}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by name or UHID..."
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
                                <th>UHID / MRN</th>
                                <th>Patient Name</th>
                                <th>Age</th>
                                <th>Hospital</th>
                                <th>Attending Doctor</th>
                                <th className={styles.textRight}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className={styles.loadingCell}>Loading data...</td></tr>
                            ) : filteredPatients.length === 0 ? (
                                <tr><td colSpan="6" className={styles.emptyState}>No patients found.</td></tr>
                            ) : (
                                filteredPatients.map(patient => (
                                    <tr key={patient.id}>
                                        <td className={styles.fw600}>{patient.uhid}</td>
                                        <td className={styles.primaryText}>{patient.name}</td>
                                        <td>{patient.age}</td>
                                        <td>{patient.hospital}</td>
                                        <td>{patient.doctor}</td>
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

export default Patients;
