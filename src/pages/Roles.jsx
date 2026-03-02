import { ShieldCheck } from 'lucide-react';
import RoleList from './settings/roles/RoleList';

const Roles = () => {
    return (
        <div style={{ padding: '24px' }}>
            {/* Page header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck size={24} style={{ color: 'var(--primary-600)' }} />
                    Roles & Permissions
                </h1>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                    Define organization roles and configure granular resource access.
                </p>
            </div>

            <RoleList />
        </div>
    );
};

export default Roles;
