import { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const ImpersonateButton = ({ organization, className = '' }) => {
    const { impersonate } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleImpersonate = async () => {
        setLoading(true);
        const res = await impersonate(organization.id, organization.name);
        setLoading(false);
        if (res.success) {
            window.location.href = '/dashboard';
        } else {
            alert(res.message || 'Failed to impersonate');
        }
    };

    return (
        <button
            onClick={handleImpersonate}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-md text-sm font-medium transition-colors ${className}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--primary-100)', color: 'var(--primary-700)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Impersonate
        </button>
    );
};

export default ImpersonateButton;
