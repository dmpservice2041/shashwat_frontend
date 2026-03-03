import { useState, useEffect } from 'react';
import { X, ShieldAlert, CheckCircle, Info, AlertCircle } from 'lucide-react';

const Toast = () => {
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const handleEvent = (e) => {
            const { message, type = 'error', duration = 5000 } = e.detail;
            setToast({ message, type, id: Date.now() });

            setTimeout(() => {
                setToast(null);
            }, duration);
        };

        window.addEventListener('medicerp-toast', handleEvent);
        return () => window.removeEventListener('medicerp-toast', handleEvent);
    }, []);

    if (!toast) return null;

    const config = {
        error: { icon: ShieldAlert, color: 'var(--danger)', bg: '#fee2e2', border: '#fecaca' },
        success: { icon: CheckCircle, color: 'var(--success)', bg: '#d1fae5', border: '#a7f3d0' },
        warning: { icon: AlertCircle, color: 'var(--warning)', bg: '#fef3c7', border: '#fde68a' },
        info: { icon: Info, color: 'var(--primary-600)', bg: 'var(--primary-50)', border: 'var(--primary-200)' },
    };

    const { icon: Icon, color, bg, border } = config[toast.type] || config.info;

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 20px',
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            minWidth: '320px',
            maxWidth: '500px',
            animation: 'slideUp 0.3s ease-out'
        }}>
            <Icon size={20} style={{ color, flexShrink: 0 }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--neutral-900)', flex: 1 }}>
                {toast.message}
            </span>
            <button
                onClick={() => setToast(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-400)', padding: '4px' }}
            >
                <X size={16} />
            </button>
            <style>{`
                @keyframes slideUp {
                    from { transform: translate(-50%, 20px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export const showToast = (message, type = 'error') => {
    window.dispatchEvent(new CustomEvent('medicerp-toast', {
        detail: { message, type }
    }));
};

export default Toast;
