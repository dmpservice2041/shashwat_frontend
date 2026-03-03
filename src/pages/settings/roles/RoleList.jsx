import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, ShieldCheck, Shield, Users, Lock, AlertTriangle } from 'lucide-react';
import api from '../../../services/api';
import RoleForm from './RoleForm';
import { countPermissions } from '../../../utils/permissions';

const RoleList = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [apiError, setApiError] = useState('');
    const [isForbidden, setIsForbidden] = useState(false);

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        setApiError('');
        setIsForbidden(false);
        try {
            const res = await api.get('/roles');
            const data = res.data?.roles || res.data || (Array.isArray(res) ? res : []);
            setRoles(Array.isArray(data) ? data : []);
        } catch (err) {
            if (err?.status === 403) {
                setIsForbidden(true);
            } else {
                setApiError(err?.message || 'Failed to load roles.');
            }
            setRoles([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRoles(); }, [fetchRoles]);

    const handleDelete = async (role) => {
        setDeleting(true);
        setApiError('');
        try {
            await api.delete(`/roles/${role.id}`);
            setDeleteConfirm(null);
            fetchRoles();
        } catch (err) {
            if (err?.status === 403) {
                setApiError('You do not have permission to delete roles.');
            } else {
                setApiError(err?.message || 'Failed to delete role.');
            }
        } finally {
            setDeleting(false);
        }
    };

    const openCreate = () => { setEditingRole(null); setIsFormOpen(true); };
    const openEdit = (role) => { setEditingRole(role); setIsFormOpen(true); };

    const getPermissionCount = (role) => {
        if (Array.isArray(role.permissions)) return countPermissions(role.permissions);
        if (typeof role.permissionsCount === 'number') return role.permissionsCount;
        return 0;
    };

    const getMemberCount = (role) => {
        if (typeof role.membersCount === 'number') return role.membersCount;
        if (typeof role.usersCount === 'number') return role.usersCount;
        if (Array.isArray(role.members)) return role.members.length;
        return null;
    };

    const isProtected = (role) =>
        role.is_system === true || role.name?.toLowerCase() === 'org admin';

    const filtered = roles.filter(r =>
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {/* 403 — Permission Denied */}
            {isForbidden && (
                <div style={{
                    padding: '32px', textAlign: 'center', border: '1px solid #fcd34d',
                    borderRadius: '10px', background: '#fffbeb', color: '#92400e'
                }}>
                    <ShieldCheck size={40} style={{ color: '#f59e0b', marginBottom: '12px' }} />
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700 }}>Access Denied</h3>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6 }}>
                        Your account does not have the <strong>roles:view</strong> permission.<br />
                        Ask your organization admin to grant you access to Role Management.
                    </p>
                </div>
            )}

            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '340px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }} />
                    <input
                        type="text"
                        placeholder="Search roles..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', padding: '9px 12px 9px 36px', boxSizing: 'border-box',
                            border: '1px solid var(--neutral-200)', borderRadius: '6px', fontSize: '14px'
                        }}
                    />
                </div>
                <button
                    onClick={openCreate}
                    style={{
                        background: 'var(--primary-600)', color: 'white', padding: '9px 16px',
                        borderRadius: '6px', fontSize: '14px', fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: '6px',
                        border: 'none', cursor: 'pointer',
                    }}
                >
                    <Plus size={18} /> Add Role
                </button>
            </div>

            {/* API Error */}
            {apiError && (
                <div style={{
                    padding: '12px 16px', background: '#fee2e2', border: '1px solid #f87171',
                    borderRadius: '8px', marginBottom: '16px', fontSize: '14px', color: '#991b1b',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    {apiError}
                    <button onClick={() => setApiError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontWeight: 700, fontSize: '16px' }}>×</button>
                </div>
            )}

            {/* Roles Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--neutral-500)', fontSize: '14px' }}>Loading roles...</div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--neutral-500)', fontSize: '14px' }}>
                    {searchTerm ? 'No roles match your search.' : 'No roles created yet.'}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {filtered.map(role => {
                        const permCount = getPermissionCount(role);
                        const memberCount = getMemberCount(role);
                        const protected_ = isProtected(role);

                        return (
                            <div key={role.id} style={{
                                background: 'var(--surface-color)', border: '1px solid var(--neutral-200)', borderRadius: '10px',
                                padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                borderTop: `3px solid ${protected_ ? '#f59e0b' : 'var(--primary-600)'}`,
                            }}>
                                {/* Role Header */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '38px', height: '38px', borderRadius: '8px',
                                            background: protected_ ? '#fef3c7' : 'var(--primary-50)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                        }}>
                                            {protected_
                                                ? <Lock size={18} style={{ color: '#d97706' }} />
                                                : <Shield size={18} style={{ color: 'var(--primary-600)' }} />
                                            }
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--neutral-900)' }}>{role.name}</div>
                                            {protected_ && (
                                                <span style={{
                                                    fontSize: '10px', fontWeight: 600,
                                                    background: '#fef3c7', color: '#92400e',
                                                    padding: '1px 6px', borderRadius: '9999px',
                                                }}>PROTECTED</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                        <button
                                            onClick={() => openEdit(role)}
                                            title="Edit Role"
                                            style={{
                                                padding: '6px', borderRadius: '6px', border: 'none',
                                                background: 'var(--neutral-50)', color: 'var(--neutral-900)', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center',
                                            }}
                                        >
                                            <Edit2 size={15} />
                                        </button>
                                        <button
                                            onClick={() => !protected_ && setDeleteConfirm(role)}
                                            disabled={protected_}
                                            title={protected_ ? 'Protected role cannot be deleted' : 'Delete Role'}
                                            style={{
                                                padding: '6px', borderRadius: '6px', border: 'none',
                                                background: protected_ ? 'var(--neutral-50)' : '#fee2e2',
                                                color: protected_ ? 'var(--neutral-400)' : '#dc2626',
                                                cursor: protected_ ? 'not-allowed' : 'pointer',
                                                display: 'flex', alignItems: 'center',
                                            }}
                                        >
                                            {protected_ ? <Lock size={15} /> : <Trash2 size={15} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Description */}
                                {role.description && (
                                    <p style={{ fontSize: '13px', color: 'var(--neutral-500)', margin: 0, lineHeight: 1.5 }}>
                                        {role.description}
                                    </p>
                                )}

                                {/* Stats */}
                                <div style={{ display: 'flex', gap: '16px', paddingTop: '8px', borderTop: '1px solid var(--neutral-200)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--neutral-500)' }}>
                                        <ShieldCheck size={14} style={{ color: 'var(--primary-600)' }} />
                                        <span><strong style={{ color: 'var(--neutral-900)' }}>{permCount}</strong> permissions</span>
                                    </div>
                                    {memberCount !== null && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--neutral-500)' }}>
                                            <Users size={14} style={{ color: '#10b981' }} />
                                            <span><strong style={{ color: 'var(--neutral-900)' }}>{memberCount}</strong> members</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 70,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.5)'
                }}>
                    <div style={{
                        background: 'var(--surface-color)', borderRadius: '10px', padding: '28px 32px',
                        maxWidth: '420px', width: '100%', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', textAlign: 'center',
                    }}>
                        <AlertTriangle size={40} style={{ color: '#f59e0b', marginBottom: '16px' }} />
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700 }}>Delete Role?</h3>
                        <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'var(--neutral-500)' }}>
                            Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This cannot be undone. Members assigned to this role will lose access.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                disabled={deleting}
                                style={{ padding: '9px 20px', border: '1px solid var(--neutral-200)', borderRadius: '6px', background: 'var(--surface-color)', fontWeight: 500, cursor: 'pointer', fontSize: '14px' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                disabled={deleting}
                                style={{ padding: '9px 20px', border: 'none', borderRadius: '6px', background: '#dc2626', color: 'white', fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', fontSize: '14px' }}
                            >
                                {deleting ? 'Deleting…' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Form Drawer */}
            <RoleForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={fetchRoles}
                editRole={editingRole}
            />
        </div>
    );
};

export default RoleList;
