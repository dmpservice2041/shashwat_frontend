import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { hasPermission } from '../utils/permissions';
import { MODULE_KEYS } from '../constants/permissionModules';

const ProtectedRoute = (props) => {
    const { allowedOrganizationTypes, requiredPermission, module, withLayout = false } = props;
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

    if (allowedOrganizationTypes && !allowedOrganizationTypes.includes(user.organization_type)) {
        return <Navigate to="/permission-denied" replace />;
    }

    const enabledModules = user.enabled_modules || [];

    if (module && !enabledModules.includes(module)) {
        return <Navigate to="/permission-denied" state={{ message: 'This module is not enabled for your organization.' }} replace />;
    }

    if (requiredPermission && !hasPermission(user.permissions, requiredPermission)) {
        return <Navigate to="/permission-denied" state={{ message: 'You do not have permission to access this page.' }} replace />;
    }

    const content = <Outlet />;

    if (withLayout) {
        return <Layout>{content}</Layout>;
    }

    return content;
};

export default ProtectedRoute;
