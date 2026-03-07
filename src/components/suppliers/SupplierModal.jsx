import React from 'react';
import { X } from 'lucide-react';
import SupplierForm from './SupplierForm';
import styles from '../../pages/MasterModules.module.css';

const SupplierModal = ({ isOpen, onClose, mode, initialData, onSubmit, loading }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        {mode === 'ADD' ? 'Add New Supplier' : 'Edit Supplier Details'}
                    </h2>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <SupplierForm
                        initialData={initialData}
                        onSubmit={onSubmit}
                        onCancel={onClose}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default SupplierModal;
