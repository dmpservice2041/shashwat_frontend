import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Activity, X, User, Save, Loader2, Hash } from 'lucide-react';
import api from '../services/api';
import styles from './MasterModules.module.css';

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('ADD'); // ADD or EDIT
    const [currentPatient, setCurrentPatient] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        uhid: '',
        first_name: '',
        last_name: '',
        age: '',
        hospital: '',
        doctor: ''
    });

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
                { id: 1, uhid: 'UHID-1001', first_name: 'Amit', last_name: 'Patel', age: 45, hospital: 'City Care Hospital', doctor: 'Dr. Raj Sharma' },
                { id: 2, uhid: 'UHID-1002', first_name: 'Sneha', last_name: 'Gupta', age: 32, hospital: 'Aarogya Wellness Center', doctor: 'Dr. Ananya Iyer' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, patient = null) => {
        setModalMode(mode);
        setFormError('');
        if (mode === 'EDIT' && patient) {
            setCurrentPatient(patient);
            setFormData({
                uhid: patient.uhid || '',
                first_name: patient.first_name || '',
                last_name: patient.last_name || '',
                age: patient.age || '',
                hospital: patient.hospital || '',
                doctor: patient.doctor || ''
            });
        } else {
            setCurrentPatient(null);
            setFormData({
                uhid: '',
                first_name: '',
                last_name: '',
                age: '',
                hospital: '',
                doctor: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formError) setFormError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');

        try {
            if (modalMode === 'ADD') {
                await api.post('/patients', formData);
            } else {
                await api.put(`/patients/${currentPatient.id}`, formData);
            }
            setIsModalOpen(false);
            fetchPatients();
        } catch (error) {
            setFormError(error.message || 'Failed to save patient details. PLEASE TRY AGAIN!');
        } finally {
            setFormLoading(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        p.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                <button className="btn-primary" onClick={() => handleOpenModal('ADD')}>
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
                                        <td className={styles.primaryText}>
                                            {patient.first_name} {patient.last_name}
                                        </td>
                                        <td>{patient.age}</td>
                                        <td>{patient.hospital}</td>
                                        <td>{patient.doctor}</td>
                                        <td className={styles.actionsCell}>
                                            <button
                                                className={styles.actionBtn}
                                                aria-label="Edit"
                                                onClick={() => handleOpenModal('EDIT', patient)}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button className={`${styles.actionBtn} ${styles.dangerBtn}`} aria-label="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                {modalMode === 'ADD' ? 'Add New Patient' : 'Edit Patient Details'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.modalBody}>
                                {formError && (
                                    <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
                                        {formError}
                                    </div>
                                )}

                                <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
                                    <label className={styles.label}>UHID / MRN *</label>
                                    <div style={{ position: 'relative' }}>
                                        <Hash size={16} style={{ position: 'absolute', top: '10px', left: '10px', color: 'var(--neutral-400)' }} />
                                        <input
                                            type="text"
                                            name="uhid"
                                            className={styles.input}
                                            style={{ paddingLeft: '36px', width: '100%' }}
                                            value={formData.uhid}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="UHID-1234"
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <label className={styles.label}>First Name *</label>
                                        <div style={{ position: 'relative' }}>
                                            <User size={16} style={{ position: 'absolute', top: '10px', left: '10px', color: 'var(--neutral-400)' }} />
                                            <input
                                                type="text"
                                                name="first_name"
                                                className={styles.input}
                                                style={{ paddingLeft: '36px', width: '100%' }}
                                                value={formData.first_name}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Amit"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={styles.label}>Last Name *</label>
                                        <div style={{ position: 'relative' }}>
                                            <User size={16} style={{ position: 'absolute', top: '10px', left: '10px', color: 'var(--neutral-400)' }} />
                                            <input
                                                type="text"
                                                name="last_name"
                                                className={styles.input}
                                                style={{ paddingLeft: '36px', width: '100%' }}
                                                value={formData.last_name}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Patel"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <label className={styles.label}>Age</label>
                                        <input
                                            type="number"
                                            name="age"
                                            className={styles.input}
                                            value={formData.age}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 45"
                                        />
                                    </div>
                                    <div>
                                        <label className={styles.label}>Attending Doctor</label>
                                        <input
                                            type="text"
                                            name="doctor"
                                            className={styles.input}
                                            value={formData.doctor}
                                            onChange={handleInputChange}
                                            placeholder="Dr. Name"
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Hospital</label>
                                    <input
                                        type="text"
                                        name="hospital"
                                        className={styles.input}
                                        value={formData.hospital}
                                        onChange={handleInputChange}
                                        placeholder="Hospital name"
                                    />
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn-secondary"
                                    style={{ border: '1px solid var(--neutral-200)', background: 'white' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={formLoading}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    {formLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {modalMode === 'ADD' ? 'Add Patient' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Patients;
