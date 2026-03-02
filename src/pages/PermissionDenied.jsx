import { ShieldAlert, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const PermissionDenied = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const message = location.state?.message || "You do not have permission to access this page. Please contact your administrator if you believe this is an error.";

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            background: 'var(--bg-color)',
        }}>
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                color: '#ef4444'
            }}>
                <ShieldAlert size={40} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 12px 0', color: '#111827' }}>
                Access Denied
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280', maxWidth: '400px', margin: '0 0 32px 0', lineHeight: 1.6 }}>
                {message}
            </p>
            <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
            >
                <Home size={20} />
                <span>Return to Dashboard</span>
            </button>
        </div>
    );
};

export default PermissionDenied;
