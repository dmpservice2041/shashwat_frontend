import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LayoutGrid, Save, Loader2, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../../../services/api';
import { PERMISSION_MODULES } from '../../../utils/permissions';
import { MODULE_KEYS } from '../../../constants/permissionModules';
import { showToast } from '../../../components/common/Toast';

const OrganizationModuleSettings = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [enabledModules, setEnabledModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [orgName, setOrgName] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const allOrgsRes = await api.get('/admin/organizations');
                const allOrgs = allOrgsRes.data?.organizations || allOrgsRes.data || [];
                const org = allOrgs.find(o => o.id === id);
                if (org) setOrgName(org.name);

                const modulesRes = await api.get(`/admin/organizations/${id}/modules`);
                const moduleData = modulesRes.data || [];

                const enabled = moduleData
                    .filter(m => m.is_enabled)
                    .map(m => m.module_name);

                if (!enabled.includes(MODULE_KEYS.DASHBOARD)) {
                    enabled.push(MODULE_KEYS.DASHBOARD);
                }

                setEnabledModules(enabled);
            } catch (err) {
                setError('Failed to load module configuration.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [id]);

    const handleToggle = (moduleKey) => {
        if (moduleKey === MODULE_KEYS.DASHBOARD) return;

        setEnabledModules(prev =>
            prev.includes(moduleKey)
                ? prev.filter(k => k !== moduleKey)
                : [...prev, moduleKey]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/admin/organizations/${id}/modules`, {
                enabled_modules: enabledModules
            });
            showToast('Module configuration updated successfully', 'success');
            navigate(`/admin/organizations/${id}`);
        } catch (err) {
            showToast(err.message || 'Failed to update module settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', height: '50vh', gap: '12px' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary-600)' }} />
                <span style={{ color: '#6b7280' }}>Loading module configuration...</span>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    onClick={() => navigate(`/admin/organizations/${id}`)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1px solid #d1d5db', color: '#374151', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#111827' }}>
                        Module Configuration: {orgName}
                    </h1>
                    <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                        Enable or disable entire functional modules for this organization.
                    </p>
                </div>
            </div>

            {error && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                    {error}
                </div>
            )}

            <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <AlertCircle size={20} style={{ color: '#92400e', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '13px', color: '#92400e', lineHeight: 1.5 }}>
                    <strong>Administrative Control</strong> — Disabling a module hides it from the Sidebar and Role Management for all users in this organization. Roles that previously had permissions for a disabled module will retain them in the database, but they will be ignored by the UI and API gateways.
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
            }}>
                {PERMISSION_MODULES.map((mod) => {
                    const isEnabled = enabledModules.includes(mod.key);
                    const isDashboard = mod.key === MODULE_KEYS.DASHBOARD;

                    return (
                        <div
                            key={mod.key}
                            onClick={() => !isDashboard && handleToggle(mod.key)}
                            style={{
                                padding: '16px 20px',
                                background: 'white',
                                border: `1px solid ${isEnabled ? 'var(--primary-200)' : '#e5e7eb'}`,
                                borderRadius: '12px',
                                cursor: isDashboard ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.2s ease',
                                boxShadow: isEnabled ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none',
                                opacity: isDashboard ? 0.7 : 1
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: isEnabled ? 'var(--primary-50)' : '#f3f4f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: isEnabled ? 'var(--primary-600)' : '#9ca3af'
                                }}>
                                    <LayoutGrid size={20} />
                                </div>
                                <div style={{ fontWeight: 600, color: isEnabled ? '#111827' : '#6b7280' }}>
                                    {mod.label}
                                    {isDashboard && <span style={{ marginLeft: '8px', fontSize: '10px', color: '#9ca3af', fontWeight: 400 }}>(Required)</span>}
                                </div>
                            </div>

                            <div style={{
                                width: '44px',
                                height: '24px',
                                background: isEnabled ? 'var(--primary-600)' : '#d1d5db',
                                borderRadius: '12px',
                                position: 'relative',
                                transition: 'background 0.2s',
                            }}>
                                <div style={{
                                    width: '18px',
                                    height: '18px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    top: '3px',
                                    left: isEnabled ? '23px' : '3px',
                                    transition: 'left 0.2s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{
                padding: '20px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                background: '#f9fafb',
                borderRadius: '0 0 12px 12px',
                margin: '0 -24px -24px -24px'
            }}>
                <button
                    onClick={() => navigate(`/admin/organizations/${id}`)}
                    style={{ padding: '10px 24px', background: 'white', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 28px' }}
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    <span>Save Configuration</span>
                </button>
            </div>
        </div>
    );
};

export default OrganizationModuleSettings;
