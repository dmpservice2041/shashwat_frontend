import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Stethoscope, X, User, Save, Loader2, Phone } from 'lucide-react';
import api from '../services/api';
import styles from './MasterModules.module.css';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('ADD'); // ADD or EDIT
    const [currentDoctor, setCurrentDoctor] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        specialization: '',
        hospital: '',
        contact: ''
    });

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
                { id: 1, first_name: 'Raj', last_name: 'Sharma', specialization: 'Cardiology', hospital: 'City Care Hospital', contact: '+91 9999999999', status: 'Active' },
                { id: 2, first_name: 'Ananya', last_name: 'Iyer', specialization: 'Orthopedics', hospital: 'Aarogya Wellness Center', contact: '+91 8888888888', status: 'Active' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, doctor = null) => {
        setModalMode(mode);
        setFormError('');
        if (mode === 'EDIT' && doctor) {
            setCurrentDoctor(doctor);
            setFormData({
                first_name: doctor.first_name || '',
                last_name: doctor.last_name || '',
                specialization: doctor.specialization || '',
                hospital: doctor.hospital || '',
                contact: doctor.contact || ''
            });
        } else {
            setCurrentDoctor(null);
            setFormData({
                first_name: '',
                last_name: '',
                specialization: '',
                hospital: '',
                contact: ''
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
                await api.post('/doctors', formData);
            } else {
                await api.put(`/doctors/${currentDoctor.id}`, formData);
            }
            setIsModalOpen(false);
            fetchDoctors();
        } catch (error) {
            setFormError(error.message || 'Failed to save doctor details. PLEASE TRY AGAIN!');
        } finally {
            setFormLoading(false);
        }
    };

    const filteredDoctors = doctors.filter(d =>
        d.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                <button className="btn-primary" onClick={() => handleOpenModal('ADD')}>
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
                                        <td className={`${styles.fw600} ${styles.primaryText}`}>
                                            {doc.first_name} {doc.last_name}
                                        </td>
                                        <td>{doc.specialization}</td>
                                        <td>{doc.hospital}</td>
                                        <td>{doc.contact}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${doc.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>
                                                {doc.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className={styles.actionsCell}>
                                            <button
                                                className={styles.actionBtn}
                                                aria-label="Edit"
                                                onClick={() => handleOpenModal('EDIT', doc)}
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
                                {modalMode === 'ADD' ? 'Add New Doctor' : 'Edit Doctor Details'}
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
                                                placeholder="Raj"
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
                                                placeholder="Sharma"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
                                    <label className={styles.label}>Specialization</label>
                                    <input
                                        type="text"
                                        name="specialization"
                                        className={styles.input}
                                        value={formData.specialization}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Cardiology"
                                    />
                                </div>

                                <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
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

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Contact Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={16} style={{ position: 'absolute', top: '10px', left: '10px', color: 'var(--neutral-400)' }} />
                                        <input
                                            type="text"
                                            name="contact"
                                            className={styles.input}
                                            style={{ paddingLeft: '36px', width: '100%' }}
                                            value={formData.contact}
                                            onChange={handleInputChange}
                                            placeholder="9999999999"
                                        />
                                    </div>
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
                                    {modalMode === 'ADD' ? 'Add Doctor' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Doctors;
