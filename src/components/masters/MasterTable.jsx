import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Loader2, Database } from 'lucide-react';
import api from '../../services/api';
import { showToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/permissions';
import MasterForm from './MasterForm';
import styles from './MasterComponents.module.css';

const MasterTable = ({
    type,
    title,
    subtitle = "Manage master data records",
    icon = Database,
    createPermission,
    editPermission,
    deletePermission
}) => {
    const { user } = useAuth();
    const userPermissions = user?.permissions || [];

    // Admin essentially has all permissions implicitly in this system, but let's be strict if needed.
    const canAdd = hasPermission(userPermissions, createPermission);
    const canEdit = hasPermission(userPermissions, editPermission);
    const canDelete = hasPermission(userPermissions, deletePermission);

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    const IconComponent = icon;
    const isTaxCode = type === 'gst_tax_codes';
    const isUnit = type === 'units';
    const isCategory = type === 'categories';
    const isSubCategory = type === 'sub_categories';

    useEffect(() => {
        fetchRecords();
    }, [type]);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/masters/${type}`);
            if (res.success || res.status === 'success') {
                setRecords(res.data || []);
            } else {
                showToast(res.message || `Failed to load ${title}`, 'error');
            }
        } catch (error) {
            console.error(`Failed to fetch ${type}`, error);
            showToast(`Error connecting to server`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (record = null) => {
        setCurrentRecord(record);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        setFormLoading(true);
        try {
            if (currentRecord) {
                // Update
                const res = await api.put(`/masters/${type}/${currentRecord.id}`, formData);
                if (res.success || res.status === 'success') {
                    showToast(`${title} updated successfully`, 'success');
                    fetchRecords();
                    setIsModalOpen(false);
                } else {
                    showToast(res.message || `Failed to update ${title}`, 'error');
                }
            } else {
                // Create
                const res = await api.post(`/masters/${type}`, formData);
                if (res.success || res.status === 'success') {
                    showToast(`${title} added successfully`, 'success');
                    fetchRecords();
                    setIsModalOpen(false);
                } else {
                    showToast(res.message || `Failed to add ${title}`, 'error');
                }
            }
        } catch (error) {
            console.error(`Failed to save ${type}`, error);
            showToast(error.message || `Server error during save`, 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

        try {
            const res = await api.delete(`/masters/${type}/${id}`);
            if (res.success || res.status === 'success') {
                showToast(`${title} deleted successfully`, 'success');
                fetchRecords();
            } else {
                showToast(res.message || `Failed to delete ${title}`, 'error');
            }
        } catch (error) {
            console.error(`Failed to delete ${type}`, error);
            showToast(error.message || `Server error during delete`, 'error');
        }
    };

    const filteredRecords = records.filter(r =>
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.iconWrapper}>
                        <IconComponent size={24} />
                    </div>
                    <div>
                        <h1 className={styles.pageTitle}>{title}</h1>
                        <p className={styles.pageSubtitle}>{subtitle}</p>
                    </div>
                </div>
                {canAdd && (
                    <button className={styles.btnPrimary} onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        <span>Add New</span>
                    </button>
                )}
            </header>

            <div className={styles.tableContainer}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search records..."
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
                                <th>Name</th>
                                {isUnit && <th>Symbol</th>}
                                {isCategory && <th>Department</th>}
                                {isSubCategory && <th>Category</th>}
                                {isTaxCode && (
                                    <>
                                        <th>HSN Code</th>
                                        <th>GST %</th>
                                        <th>CGST/SGST/IGST</th>
                                    </>
                                )}
                                <th>Description</th>
                                <th>Status</th>
                                {(canEdit || canDelete) && <th className={styles.textRight}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className={styles.loadingCell}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <Loader2 size={20} className="animate-spin" />
                                            Loading data...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className={styles.emptyState}>No records found.</td>
                                </tr>
                            ) : (
                                filteredRecords.map(record => (
                                    <tr key={record.id}>
                                        <td className={styles.fw600}>{record.name}</td>
                                        {isUnit && <td>{record.symbol || '-'}</td>}
                                        {isCategory && <td>{record.department?.name || record.department_id || '-'}</td>}
                                        {isSubCategory && <td>{record.category?.name || record.category_id || '-'}</td>}
                                        {isTaxCode && (
                                            <>
                                                <td>{record.hsn_code || '-'}</td>
                                                <td>{record.gst_percentage}%</td>
                                                <td style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>
                                                    C:{record.cgst}% | S:{record.sgst}% | I:{record.igst}%
                                                </td>
                                            </>
                                        )}
                                        <td>{record.description || '-'}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${record.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                                                {record.status || 'active'}
                                            </span>
                                        </td>
                                        {(canEdit || canDelete) && (
                                            <td className={styles.actionsCell}>
                                                {canEdit && (
                                                    <button
                                                        className={styles.actionBtn}
                                                        onClick={() => handleOpenModal(record)}
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        className={`${styles.actionBtn} ${styles.dangerBtn}`}
                                                        onClick={() => handleDelete(record.id, record.name)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <MasterForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={currentRecord}
                type={type}
                title={title}
                loading={formLoading}
            />
        </div>
    );
};

export default MasterTable;
