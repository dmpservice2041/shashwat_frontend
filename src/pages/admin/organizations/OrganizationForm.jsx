import { useState, useEffect } from 'react';
import { Save, User, Mail, Phone, Lock, KeyRound, Building2, Globe, CheckSquare, Square, Loader2 } from 'lucide-react';
import api from '../../../services/api';
import { PERMISSION_MODULES } from '../../../utils/permissions';
import { MODULE_KEYS } from '../../../constants/permissionModules';

const OrganizationForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        org_type: 'HOSPITAL',
        address: '',

        full_name: '',
        email: '',
        phone: '',
        password: '',
        confirm_password: '',
        enabled_modules: ['dashboard', 'users', 'roles', 'settings'],
        settings: {}
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            const loadedModules = initialData.OrganizationModules
                ? initialData.OrganizationModules.filter(m => m.is_enabled).map(m => m.module_name)
                : (initialData.enabled_modules || initialData.settings?.enabled_modules || ['dashboard']);

            setFormData({
                name: initialData.name || '',
                org_type: initialData.org_type || initialData.type || 'HOSPITAL',
                address: initialData.address || '',
                enabled_modules: loadedModules.includes('dashboard') ? loadedModules : [...loadedModules, 'dashboard'],
                settings: initialData.settings || {}
            });
        } else {
            setFormData({
                name: '',
                org_type: 'HOSPITAL',
                address: '',
                full_name: '',
                email: '',
                phone: '',
                password: '',
                confirm_password: '',
                enabled_modules: ['dashboard', 'users', 'roles', 'settings'],
                settings: {}
            });
        }
        setError('');
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const validateForm = () => {
        if (!initialData) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                return 'Please enter a valid admin email address.';
            }

            if (formData.password.length < 8) {
                return 'Password must be at least 8 characters long.';
            }

            if (formData.password !== formData.confirm_password) {
                return 'Passwords do not match.';
            }
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        setLoading(true);
        try {
            const payload = {
                name: formData.name || '',
                org_type: formData.org_type || 'HOSPITAL',
                address: formData.address || '',
                enabled_modules: formData.enabled_modules,
                settings: formData.settings || {}
            };

            if (!initialData) {
                payload.full_name = formData.full_name;
                payload.email = formData.email;
                payload.phone = formData.phone;
                payload.password = formData.password;
            }

            await onSubmit(payload);
            onClose();
        } catch (err) {
            setError(err.message || 'An error occurred while saving.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
            <div style={{ background: 'white', borderRadius: '8px', width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building size={20} style={{ color: 'var(--primary-600)' }} />
                        {initialData ? 'Edit Organization' : 'Create Organization with Admin'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                    {error && (
                        <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', border: '1px solid #f87171' }}>
                            {error}
                        </div>
                    )}

                    <form id="org-form" onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                                1. Organization Details
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
                                        Organization Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                                        placeholder="e.g. Apollo Hospital"
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
                                        Organization Type *
                                    </label>
                                    <select
                                        name="org_type"
                                        value={formData.org_type}
                                        onChange={handleChange}
                                        required
                                        disabled={!!initialData}
                                        style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', background: initialData ? '#f3f4f6' : 'white', cursor: initialData ? 'not-allowed' : 'auto' }}
                                    >
                                        <option value="HOSPITAL">HOSPITAL</option>
                                        <option value="DOCTOR">DOCTOR</option>
                                        <option value="DEALER">DEALER</option>
                                        <option value="DISTRIBUTOR">DISTRIBUTOR</option>
                                        <option value="SUB_DISTRIBUTOR">SUB_DISTRIBUTOR</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                                        placeholder="City, State"
                                    />
                                </div>
                            </div>
                        </div>

                        {!initialData && (
                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                                    2. Primary Admin Account
                                </h3>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
                                            Full Name *
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <User size={16} style={{ position: 'absolute', top: '10px', left: '10px', color: '#9ca3af' }} />
                                            <input
                                                type="text"
                                                name="full_name"
                                                value={formData.full_name}
                                                onChange={handleChange}
                                                required
                                                style={{ width: '100%', padding: '8px 12px 8px 36px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
                                            Email Address *
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={16} style={{ position: 'absolute', top: '10px', left: '10px', color: '#9ca3af' }} />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                style={{ width: '100%', padding: '8px 12px 8px 36px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                                                placeholder="admin@org.com"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
                                            Mobile Number *
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Phone size={16} style={{ position: 'absolute', top: '10px', left: '10px', color: '#9ca3af' }} />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                style={{ width: '100%', padding: '8px 12px 8px 36px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                                                placeholder="9999999999"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
                                            Password *
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={16} style={{ position: 'absolute', top: '10px', left: '10px', color: '#9ca3af' }} />
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                style={{ width: '100%', padding: '8px 12px 8px 36px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                                                placeholder="Min 8 characters"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
                                            Confirm Password *
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <KeyRound size={16} style={{ position: 'absolute', top: '10px', left: '10px', color: '#9ca3af' }} />
                                            <input
                                                type="password"
                                                name="confirm_password"
                                                value={formData.confirm_password}
                                                onChange={handleChange}
                                                required
                                                style={{ width: '100%', padding: '8px 12px 8px 36px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                                                placeholder="Repeat password"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: '24px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                                3. Module Access
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                                {PERMISSION_MODULES.map(mod => {
                                    const isEnabled = formData.enabled_modules.includes(mod.key);
                                    const isRequired = mod.key === MODULE_KEYS.DASHBOARD || mod.key === MODULE_KEYS.SETTINGS;

                                    return (
                                        <div
                                            key={mod.key}
                                            onClick={() => {
                                                if (isRequired) return;
                                                const next = isEnabled
                                                    ? formData.enabled_modules.filter(k => k !== mod.key)
                                                    : [...formData.enabled_modules, mod.key];
                                                setFormData(prev => ({ ...prev, enabled_modules: next }));
                                            }}
                                            style={{
                                                padding: '8px 12px',
                                                border: `1px solid ${isEnabled ? 'var(--primary-200)' : '#e5e7eb'}`,
                                                borderRadius: '6px',
                                                background: isEnabled ? 'var(--primary-50)' : 'white',
                                                cursor: isRequired ? 'default' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '13px',
                                                color: isEnabled ? 'var(--primary-700)' : '#6b7280',
                                                opacity: isRequired ? 0.7 : 1
                                            }}
                                        >
                                            {isEnabled ? <CheckSquare size={16} /> : <Square size={16} />}
                                            {mod.label}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </form>
                </div>

                <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f9fafb', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', flexShrink: 0 }}>
                    <button
                        onClick={onClose}
                        style={{ padding: '8px 16px', border: '1px solid #d1d5db', background: 'white', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
                        type="button"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="org-form"
                        disabled={loading}
                        style={{ padding: '8px 16px', border: 'none', background: 'var(--primary-600)', color: 'white', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Organization
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrganizationForm;
