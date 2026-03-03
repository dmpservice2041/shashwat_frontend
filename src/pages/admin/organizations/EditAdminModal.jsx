import { useState, useEffect } from 'react';
import { X, Save, Loader2, User, Mail, Phone } from 'lucide-react';
import api from '../../../services/api';

const EditAdminModal = ({ isOpen, onClose, onSuccess, orgId, initialAdmin = null }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialAdmin) {
            setFormData({
                full_name: `${initialAdmin.first_name || ''} ${initialAdmin.last_name || ''}`.trim(),
                email: initialAdmin.email || '',
                phone: initialAdmin.phone || ''
            });
        }
        setError('');
    }, [initialAdmin, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const payload = {
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone
            };

            await api.put(`/admin/organizations/${orgId}/admin`, payload);
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || 'An error occurred while updating the admin info.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
            <div style={{ background: 'var(--surface-color)', borderRadius: '8px', width: '100%', maxWidth: '500px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--neutral-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={20} style={{ color: 'var(--primary-600)' }} />
                        Edit Primary Admin
                    </h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--neutral-500)' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '20px' }}>
                    {error && (
                        <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', border: '1px solid #f87171' }}>
                            {error}
                        </div>
                    )}

                    <form id="edit-admin-form" onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--neutral-900)' }}>
                                    Full Name *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', top: '10px', left: '10px', color: 'var(--neutral-400)' }} />
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '8px 12px 8px 36px', boxSizing: 'border-box', border: '1px solid var(--neutral-200)', borderRadius: '6px', fontSize: '14px', background: 'var(--surface-color)', color: 'var(--neutral-900)' }}
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--neutral-900)' }}>
                                    Email Address *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', top: '10px', left: '10px', color: 'var(--neutral-400)' }} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '8px 12px 8px 36px', boxSizing: 'border-box', border: '1px solid var(--neutral-200)', borderRadius: '6px', fontSize: '14px', background: 'var(--surface-color)', color: 'var(--neutral-900)' }}
                                        placeholder="admin@org.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--neutral-900)' }}>
                                    Mobile Number *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={16} style={{ position: 'absolute', top: '10px', left: '10px', color: 'var(--neutral-400)' }} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '8px 12px 8px 36px', boxSizing: 'border-box', border: '1px solid var(--neutral-200)', borderRadius: '6px', fontSize: '14px', background: 'var(--surface-color)', color: 'var(--neutral-900)' }}
                                        placeholder="9999999999"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--neutral-200)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--neutral-50)', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                    <button
                        onClick={onClose}
                        style={{ padding: '8px 16px', border: '1px solid var(--neutral-200)', background: 'var(--surface-color)', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: 'var(--neutral-900)' }}
                        type="button"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="edit-admin-form"
                        disabled={loading}
                        style={{ padding: '8px 16px', border: 'none', background: 'var(--primary-600)', color: 'white', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditAdminModal;
