import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '100vh', width: '100%', background: 'var(--bg-color)' }}>
                <div style={{ animation: 'spin 1s linear infinite', border: '3px solid var(--primary-100)', borderTop: '3px solid var(--primary-600)', borderRadius: '50%', width: '40px', height: '40px' }} />
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Layout>
            <Outlet />
        </Layout>
    );
};

export default ProtectedRoute;
