import React from 'react';
import { X, Loader2 } from 'lucide-react';
import SupplierForm from './SupplierForm';
import styles from '../../pages/MasterModules.module.css';

const SupplierModal = ({ isOpen, onClose, mode, initialData, onSubmit, loading, detailsLoading }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        {mode === 'ADD' ? 'Add New Supplier' : mode === 'VIEW' ? 'Supplier Details' : 'Edit Supplier Details'}
                    </h2>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {detailsLoading ? (
                        <div className={styles.loadingWrapper} style={{ padding: '3rem', textAlign: 'center' }}>
                            <div className="animate-spin" style={{ display: 'inline-block', color: 'var(--primary-600)' }}>
                                <Loader2 size={32} />
                            </div>
                            <p style={{ marginTop: '1rem', color: 'var(--neutral-600)' }}>Fetching supplier details...</p>
                        </div>
                    ) : (
                        <SupplierForm
                            mode={mode}
                            initialData={initialData}
                            onSubmit={onSubmit}
                            onCancel={onClose}
                            loading={loading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupplierModal;
