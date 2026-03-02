import { useState, useEffect, useCallback } from 'react';
import { X, Save, Loader2, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import api from '../../../services/api';
import PermissionMatrix from './PermissionMatrix';
import { isHighPrivilegeRole } from '../../../utils/permissions';

const RoleForm = ({ isOpen, onClose, onSuccess, editRole = null }) => {
    const [roleName, setRoleName] = useState('');
    const [description, setDescription] = useState('');

    const [selectedKeys, setSelectedKeys] = useState([]);

    const [catalogue, setCatalogue] = useState(null);
    const [catalogueLoading, setCatalogueLoading] = useState(false);
    const [catalogueError, setCatalogueError] = useState('');

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!editRole;
    const isSystemRole = editRole?.is_system === true;
    const highPrivilege = isHighPrivilegeRole(selectedKeys);

    const fetchCatalogue = useCallback(async () => {
        setCatalogueLoading(true);
        setCatalogueError('');
        try {
            const res = await api.get('/roles/permissions');
            const grouped = res.grouped || res.data?.grouped || {};
            setCatalogue(grouped);

            const map = {};
            Object.values(grouped).forEach(perms => {
                if (Array.isArray(perms)) {
                    perms.forEach(p => { if (p.key && p.id) map[p.key] = p.id; });
                }
            });
            setKeyToId(map);
        } catch (err) {
            setCatalogueError('Could not load permissions from server. Using built-in list.');
        } finally {
            setCatalogueLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        fetchCatalogue();

        if (editRole) {
            setRoleName(editRole.name || '');
            setDescription(editRole.description || '');

            const rawPerms = Array.isArray(editRole.permissions) ? editRole.permissions : [];
            const keys = rawPerms.map(p => {
                if (typeof p === 'string') {
                    return p.includes(':') ? p : null;
                }
                return p.key || null;
            }).filter(Boolean);
            setSelectedKeys(keys);
        } else {
            setRoleName('');
            setDescription('');
            setSelectedKeys([]);
        }
        setError('');
    }, [isOpen, editRole, fetchCatalogue]);

    const keysToIds = (keys) =>
        keys.map(k => keyToId[k]).filter(Boolean);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!roleName.trim()) {
            setError('Role name is required.');
            return;
        }
        if (selectedKeys.length === 0) {
            setError('Please assign at least one permission to this role.');
            return;
        }

        setError('');
        setSaving(true);

        try {
            const permissionIds = keysToIds(selectedKeys);
            const permissionsPayload = permissionIds.length > 0 ? permissionIds : selectedKeys;

            if (isEditing) {
                await api.put(`/roles/${editRole.id}`, {
                    name: roleName.trim(),
                    description: description.trim(),
                });

                await api.put(`/roles/${editRole.id}/permissions`, {
                    permission_ids: permissionsPayload,
                });
            } else {
                await api.post('/roles', {
                    name: roleName.trim(),
                    description: description.trim(),
                    permission_ids: permissionsPayload,
                });
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            const msg =
                err?.status === 403
                    ? 'Access denied — you do not have permission to create or edit roles. Contact your organization admin.'
                    : err?.message ||
                    err?.error ||
                    (typeof err === 'string' ? err : 'An error occurred while saving.');
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 60,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
            background: 'rgba(0,0,0,0.45)'
        }}>
            <div style={{
                background: 'white', width: '100%', maxWidth: '680px', height: '100vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
            }}>
                <div style={{
                    padding: '20px 24px', borderBottom: '1px solid #e5e7eb',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#f9fafb', flexShrink: 0,
                }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShieldCheck size={20} style={{ color: 'var(--primary-600)' }} />
                        {isEditing ? `Edit Role: ${editRole.name}` : 'Create New Role'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}>
                        <X size={22} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    {isSystemRole && (
                        <div style={{
                            padding: '12px 16px', background: '#fef3c7', border: '1px solid #fcd34d',
                            borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start'
                        }}>
                            <AlertTriangle size={18} style={{ color: '#92400e', flexShrink: 0, marginTop: '1px' }} />
                            <div style={{ fontSize: '13px', color: '#92400e' }}>
                                <strong>System Role</strong> — Changes affect all members. The backend will prevent emptying this role's permissions entirely.
                            </div>
                        </div>
                    )}

                    {!isSystemRole && highPrivilege && (
                        <div style={{
                            padding: '12px 16px', background: '#fff7ed', border: '1px solid #fed7aa',
                            borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start'
                        }}>
                            <AlertTriangle size={18} style={{ color: '#c2410c', flexShrink: 0, marginTop: '1px' }} />
                            <div style={{ fontSize: '13px', color: '#c2410c' }}>
                                <strong>High Privilege Warning</strong> — This role includes delete permissions. Ensure only trusted members are assigned.
                            </div>
                        </div>
                    )}

                    {catalogueError && (
                        <div style={{
                            padding: '10px 14px', background: '#fffbeb', border: '1px solid #fcd34d',
                            borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#92400e',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px'
                        }}>
                            <span>{catalogueError}</span>
                            <button onClick={fetchCatalogue} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e' }} title="Retry">
                                <RefreshCw size={14} />
                            </button>
                        </div>
                    )}

                    {error && (
                        <div style={{
                            padding: '12px 16px', background: '#fee2e2', border: '1px solid #f87171',
                            borderRadius: '8px', marginBottom: '20px', fontSize: '14px', color: '#991b1b'
                        }}>
                            {error}
                        </div>
                    )}

                    <form id="role-form" onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                                Role Name *
                            </label>
                            <input
                                type="text"
                                value={roleName}
                                onChange={e => { setRoleName(e.target.value); if (error) setError(''); }}
                                placeholder="e.g. Pharmacist, Billing Manager"
                                required
                                style={{ width: '100%', padding: '9px 12px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                                Description
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Brief description of this role's purpose"
                                style={{ width: '100%', padding: '9px 12px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                            />
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                                    Permissions *
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {catalogueLoading && <Loader2 size={14} className="animate-spin" style={{ color: '#6b7280' }} />}
                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                        {selectedKeys.length} selected
                                        {catalogue && <span style={{ marginLeft: '4px', color: '#10b981', fontWeight: 600 }}>· live</span>}
                                    </span>
                                </div>
                            </div>
                            <PermissionMatrix
                                permissions={selectedKeys}
                                onChange={setSelectedKeys}
                                readOnly={false}
                                catalogue={catalogue}
                                enabledModules={useAuth().user?.enabled_modules}
                            />
                        </div>
                    </form>
                </div>

                <div style={{
                    padding: '16px 24px', borderTop: '1px solid #e5e7eb',
                    display: 'flex', justifyContent: 'flex-end', gap: '12px',
                    background: '#f9fafb', flexShrink: 0,
                }}>
                    <button
                        type="button" onClick={onClose}
                        style={{ padding: '9px 20px', border: '1px solid #d1d5db', background: 'white', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit" form="role-form"
                        disabled={saving || selectedKeys.length === 0}
                        title={selectedKeys.length === 0 ? 'Select at least one permission' : ''}
                        style={{
                            padding: '9px 20px', border: 'none',
                            background: selectedKeys.length === 0 ? '#9ca3af' : 'var(--primary-600)',
                            color: 'white', borderRadius: '6px', fontSize: '14px', fontWeight: 500,
                            cursor: selectedKeys.length === 0 || saving ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            transition: 'background 0.15s',
                        }}
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {isEditing ? 'Save Changes' : 'Create Role'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleForm;
