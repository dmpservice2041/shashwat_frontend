import { useState } from 'react';
import { X, Save, Loader2, KeyRound, Lock, AlertTriangle } from 'lucide-react';
import api from '../../../services/api';

const ResetAdminPasswordModal = ({ isOpen, onClose, orgId }) => {
    const [formData, setFormData] = useState({
        admin_password: '',
        admin_confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
        if (successMsg) setSuccessMsg('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.admin_password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        if (formData.admin_password !== formData.admin_confirm_password) {
            setError('Passwords do not match.');
            return;
        }

        if (!window.confirm("Are you critically sure you want to forcibly reset this admin's password? They will be logged out of current sessions.")) {
            return;
        }

        setError('');
        setLoading(true);
        try {
            await api.post(`/admin/organizations/${orgId}/admin/reset-password`, {
                password: formData.admin_password
            });
            setSuccessMsg('Password has been reset successfully!');
            setTimeout(() => {
                onClose();
                setFormData({ admin_password: '', admin_confirm_password: '' });
                setSuccessMsg('');
            }, 1500);
        } catch (err) {
            setError(err.message || 'An error occurred while resetting the password.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
            <div style={{ background: 'white', borderRadius: '8px', width: '100%', maxWidth: '450px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b' }}>
                        <AlertTriangle size={20} />
                        Reset Admin Password
                    </h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '20px' }}>
                    {error && (
                        <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', border: '1px solid #f87171' }}>
                            {error}
                        </div>
                    )}
                    {successMsg && (
                        <div style={{ padding: '12px', background: '#d1fae5', color: '#065f46', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', border: '1px solid #34d399' }}>
                            {successMsg}
                        </div>
                    )}

                    <p style={{ fontSize: '13px', color: '#4b5563', marginBottom: '20px', lineHeight: '1.5' }}>
                        You are about to forcibly reset the password for this organization's Primary Admin. This action creates an audit trail.
                    </p>

                    <form id="reset-password-form" onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
                                    New Password *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', top: '10px', left: '10px', color: '#9ca3af' }} />
                                    <input
                                        type="password"
                                        name="admin_password"
                                        value={formData.admin_password}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '8px 12px 8px 36px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                                        placeholder="Min 8 characters"
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
                                    Confirm New Password *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <KeyRound size={16} style={{ position: 'absolute', top: '10px', left: '10px', color: '#9ca3af' }} />
                                    <input
                                        type="password"
                                        name="admin_confirm_password"
                                        value={formData.admin_confirm_password}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '8px 12px 8px 36px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                                        placeholder="Repeat new password"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f9fafb', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                    <button
                        onClick={onClose}
                        style={{ padding: '8px 16px', border: '1px solid #d1d5db', background: 'white', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
                        type="button"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="reset-password-form"
                        disabled={loading || successMsg !== ''}
                        style={{ padding: '8px 16px', border: 'none', background: '#dc2626', color: 'white', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Reset Password
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetAdminPasswordModal;
