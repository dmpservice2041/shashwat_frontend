import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, Plus, Edit2, Trash2, Power, PowerOff } from 'lucide-react';
import api from '../../../services/api';
import ImpersonateButton from './ImpersonateButton';
import OrganizationForm from './OrganizationForm';

const OrganizationList = () => {
    const navigate = useNavigate();
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState(null);

    const fetchOrganizations = async () => {
        try {
            const res = await api.get('/admin/organizations');
            console.log('Orgs API Response:', res);
            if (res.success || res.status === 'success') {
                setOrganizations(res.data?.organizations || res.data || []);
            } else if (Array.isArray(res)) {
                setOrganizations(res);
            } else if (res.organizations && Array.isArray(res.organizations)) {
                setOrganizations(res.organizations);
            } else if (res.data && Array.isArray(res.data)) {
                setOrganizations(res.data);
            } else {
                setOrganizations([]);
            }
        } catch (error) {
            console.error('Failed to fetch orgs', error);
            setOrganizations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const handleCreateOrUpdate = async (payload) => {
        if (editingOrg) {
            await api.put(`/admin/organizations/${editingOrg.id}`, {
                name: payload.name,
                org_type: payload.org_type,
                address: payload.address,
                enabled_modules: payload.enabled_modules,
                settings: payload.settings
            });
        } else {
            await api.post('/admin/organizations', payload);
        }
        fetchOrganizations();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this organization?')) {
            await api.delete(`/admin/organizations/${id}`);
            fetchOrganizations();
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        await api.patch(`/admin/organizations/${id}/status`, { is_active: !currentStatus });
        fetchOrganizations();
    };

    const openCreateForm = () => {
        setEditingOrg(null);
        setIsFormOpen(true);
    };

    const openEditForm = (org) => {
        setEditingOrg(org);
        setIsFormOpen(true);
    };

    const safeOrgs = Array.isArray(organizations) ? organizations : [];

    const filteredOrgs = safeOrgs.filter(org =>
        org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        <Building2 size={24} style={{ color: 'var(--primary-600)' }} />
                        Organizations
                    </h1>
                    <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '14px' }}>Manage global organizations and impersonate accounts.</p>
                </div>
                <button
                    onClick={openCreateForm}
                    style={{ background: 'var(--primary-600)', color: 'white', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', border: 'none', cursor: 'pointer' }}
                >
                    <Plus size={18} />
                    Add Organization
                </button>
            </div>

            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ position: 'relative', maxWidth: '300px' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={20} />
                        <input
                            type="text"
                            placeholder="Search organizations..."
                            style={{ width: '100%', padding: '10px 10px 10px 40px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em' }}>
                                <th style={{ padding: '16px', fontWeight: 600 }}>Name</th>
                                <th style={{ padding: '16px', fontWeight: 600 }}>Type</th>
                                <th style={{ padding: '16px', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '14px' }}>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>Loading organizations...</td>
                                </tr>
                            ) : filteredOrgs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>No organizations found.</td>
                                </tr>
                            ) : (
                                filteredOrgs.map((org) => (
                                    <tr key={org.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '16px' }}>
                                            <a
                                                href={`/admin/organizations/${org.id}`}
                                                style={{ fontWeight: 500, color: 'var(--primary-600)', textDecoration: 'none', cursor: 'pointer', display: 'block' }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    window.location.href = `/admin/organizations/${org.id}`;
                                                }}
                                            >
                                                {org.name}
                                            </a>
                                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{org.email || 'No email specified'}</div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ padding: '4px 8px', background: '#dbeafe', color: '#1d4ed8', borderRadius: '9999px', fontSize: '12px', fontWeight: 500 }}>
                                                {org.org_type || org.type || 'UNKNOWN'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ padding: '4px 8px', background: org.is_active !== false ? '#d1fae5' : '#fee2e2', color: org.is_active !== false ? '#065f46' : '#991b1b', borderRadius: '9999px', fontSize: '12px', fontWeight: 500 }}>
                                                {org.is_active !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                {org.type !== 'ADMIN' && org.org_type !== 'ADMIN' && (
                                                    <ImpersonateButton organization={org} />
                                                )}
                                                <button
                                                    onClick={() => navigate(`/admin/organizations/${org.id}`)}
                                                    style={{ padding: '6px 12px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
                                                >
                                                    <Edit2 size={14} /> Edit
                                                </button>
                                                {org.type !== 'ADMIN' && org.org_type !== 'ADMIN' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleToggleStatus(org.id, org.is_active !== false)}
                                                            style={{ padding: '6px 12px', background: org.is_active !== false ? '#fee2e2' : '#d1fae5', color: org.is_active !== false ? '#991b1b' : '#065f46', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
                                                        >
                                                            {org.is_active !== false ? <PowerOff size={14} /> : <Power size={14} />}
                                                            {org.is_active !== false ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(org.id)}
                                                            style={{ padding: '6px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <OrganizationForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleCreateOrUpdate}
                initialData={editingOrg}
            />
        </div>
    );
};

export default OrganizationList;
