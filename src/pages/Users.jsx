import { Users as UsersIcon } from 'lucide-react';

const Users = () => {
    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <UsersIcon size={24} style={{ color: 'var(--primary-600)' }} />
                    Users
                </h1>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                    Manage organization members and their system access.
                </p>
            </div>

            <div style={{
                padding: '48px',
                textAlign: 'center',
                background: 'white',
                borderRadius: '8px',
                border: '1px border #e5e7eb',
                color: '#6b7280'
            }}>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                    <UsersIcon size={48} style={{ opacity: 0.2 }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                    Users List Coming Soon
                </h3>
                <p style={{ maxWidth: '400px', margin: '0 auto' }}>
                    The user management interface is currently under development. You will soon be able to invite members and assign them roles.
                </p>
            </div>
        </div>
    );
};

export default Users;
