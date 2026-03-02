import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, User, Edit2, KeyRound, ArrowLeft, Loader2, AlertCircle, LayoutGrid } from 'lucide-react';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import OrganizationForm from './OrganizationForm';
import EditAdminModal from './EditAdminModal';
import ResetAdminPasswordModal from './ResetAdminPasswordModal';

const OrganizationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { impersonatingOrg } = useAuth();

    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isEditOrgOpen, setIsEditOrgOpen] = useState(false);
    const [isEditAdminOpen, setIsEditAdminOpen] = useState(false);
    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/organizations`);
            const allOrgs = res.data?.organizations || res.data || (Array.isArray(res) ? res : []);

            const targetOrg = allOrgs.find(o => o.id === id);

            if (targetOrg) {
                setOrganization(targetOrg);
            } else {
                setError('Organization not found.');
            }
        } catch (err) {
            setError('Failed to fetch organization details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const handleOrgUpdate = async (payload) => {
        await api.put(`/admin/organizations/${id}`, {
            name: payload.name,
            org_type: payload.org_type,
            address: payload.address,
            settings: payload.settings
        });
        fetchDetails();
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: '#6b7280' }}>
                <Loader2 size={32} className="animate-spin" />
            </div>
        );
    }

    if (error || !organization) {
        return (
            <div style={{ padding: '24px' }}>
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '16px', borderRadius: '8px' }}>
                    {error}
                </div>
                <button
                    onClick={() => navigate('/admin/organizations')}
                    style={{ marginTop: '16px', padding: '8px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
                >
                    Back to Organizations
                </button>
            </div>
        );
    }

    let adminUser = organization.primary_admin || {};

    if (!adminUser.email && organization.OrganizationMembers && Array.isArray(organization.OrganizationMembers)) {
        const primaryMember = organization.OrganizationMembers.find(m => m.is_org_admin) || organization.OrganizationMembers[0];
        if (primaryMember && primaryMember.User) {
            adminUser = primaryMember.User;
        } else if (primaryMember && primaryMember.user) {
            adminUser = primaryMember.user;
        }
    }

    const isActionsDisabled = !!impersonatingOrg;

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    onClick={() => navigate('/admin/organizations')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1px solid #d1d5db', color: '#374151', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                    title="Back to List"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {organization.name}
                        <span style={{ padding: '4px 10px', background: '#dbeafe', color: '#1d4ed8', fontSize: '12px', fontWeight: 600, borderRadius: '9999px', verticalAlign: 'middle' }}>
                            {organization.type || organization.org_type || 'UNKNOWN'}
                        </span>
                        {organization.is_active === false && (
                            <span style={{ padding: '4px 10px', background: '#fee2e2', color: '#991b1b', fontSize: '12px', fontWeight: 600, borderRadius: '9999px', verticalAlign: 'middle' }}>
                                INACTIVE
                            </span>
                        )}
                    </h1>
                </div>
            </div>

            {isActionsDisabled && (
                <div style={{ marginBottom: '24px', background: '#fffbeb', border: '1px solid #fcd34d', padding: '16px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start', color: '#92400e' }}>
                    <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600 }}>Action Restricted</h4>
                        <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5 }}>
                            You are currently impersonating an organization. Modification of global administration rules and primary admin credentials is disabled to prevent context collisions. Exit impersonation to regain access.
                        </p>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>

                {/* Organization Details Panel */}
                <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Building2 size={18} style={{ color: '#6b7280' }} />
                            Organization Info
                        </h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => navigate(`/admin/organizations/${id}/modules`)}
                                disabled={isActionsDisabled}
                                style={{ padding: '6px 12px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: isActionsDisabled ? 'not-allowed' : 'pointer', color: isActionsDisabled ? '#9ca3af' : 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '6px', opacity: isActionsDisabled ? 0.6 : 1 }}
                            >
                                <LayoutGrid size={14} /> Modules
                            </button>
                            <button
                                onClick={() => setIsEditOrgOpen(true)}
                                disabled={isActionsDisabled}
                                style={{ padding: '6px 12px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: isActionsDisabled ? 'not-allowed' : 'pointer', color: isActionsDisabled ? '#9ca3af' : '#374151', display: 'flex', alignItems: 'center', gap: '6px', opacity: isActionsDisabled ? 0.6 : 1 }}
                            >
                                <Edit2 size={14} /> Edit
                            </button>
                        </div>
                    </div>
                    <div style={{ padding: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px', fontSize: '14px' }}>
                            <div style={{ color: '#6b7280', fontWeight: 500 }}>Global ID</div>
                            <div style={{ color: '#111827', fontFamily: 'monospace' }}>{organization.id}</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px', fontSize: '14px' }}>
                            <div style={{ color: '#6b7280', fontWeight: 500 }}>Name</div>
                            <div style={{ color: '#111827', fontWeight: 500 }}>{organization.name}</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px', fontSize: '14px' }}>
                            <div style={{ color: '#6b7280', fontWeight: 500 }}>Address</div>
                            <div style={{ color: '#111827' }}>{organization.address || '—'}</div>
                        </div>
                    </div>
                </div>

                {/* Primary Admin Details Panel */}
                <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={18} style={{ color: '#6b7280' }} />
                            Primary Admin Info
                        </h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => setIsEditAdminOpen(true)}
                                disabled={isActionsDisabled}
                                style={{ padding: '6px 12px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: isActionsDisabled ? 'not-allowed' : 'pointer', color: isActionsDisabled ? '#9ca3af' : '#374151', display: 'flex', alignItems: 'center', gap: '6px', opacity: isActionsDisabled ? 0.6 : 1 }}
                            >
                                <Edit2 size={14} /> Edit
                            </button>
                            <button
                                onClick={() => setIsResetPasswordOpen(true)}
                                disabled={isActionsDisabled}
                                style={{ padding: '6px 12px', background: 'white', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: isActionsDisabled ? 'not-allowed' : 'pointer', color: isActionsDisabled ? '#f87171' : '#dc2626', display: 'flex', alignItems: 'center', gap: '6px', opacity: isActionsDisabled ? 0.6 : 1 }}
                                title="Reset Password"
                            >
                                <KeyRound size={14} /> Reset
                            </button>
                        </div>
                    </div>
                    <div style={{ padding: '20px' }}>
                        {adminUser && adminUser.email ? (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px', fontSize: '14px' }}>
                                    <div style={{ color: '#6b7280', fontWeight: 500 }}>Name</div>
                                    <div style={{ color: '#111827', fontWeight: 500 }}>{`${adminUser.first_name || ''} ${adminUser.last_name || ''}`}</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px', fontSize: '14px' }}>
                                    <div style={{ color: '#6b7280', fontWeight: 500 }}>Email</div>
                                    <div style={{ color: '#111827' }}>{adminUser.email}</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px', fontSize: '14px' }}>
                                    <div style={{ color: '#6b7280', fontWeight: 500 }}>Mobile</div>
                                    <div style={{ color: '#111827' }}>{adminUser.phone || '—'}</div>
                                </div>
                            </>
                        ) : (
                            <div style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic', padding: '12px 0' }}>
                                No primary admin explicitly identified for this organization currently.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <OrganizationForm
                isOpen={isEditOrgOpen}
                onClose={() => setIsEditOrgOpen(false)}
                onSubmit={handleOrgUpdate}
                initialData={organization}
            />

            <EditAdminModal
                isOpen={isEditAdminOpen}
                onClose={() => setIsEditAdminOpen(false)}
                onSuccess={fetchDetails}
                orgId={organization.id}
                initialAdmin={adminUser}
            />

            <ResetAdminPasswordModal
                isOpen={isResetPasswordOpen}
                onClose={() => setIsResetPasswordOpen(false)}
                orgId={organization.id}
            />
        </div>
    );
};

export default OrganizationDetails;
