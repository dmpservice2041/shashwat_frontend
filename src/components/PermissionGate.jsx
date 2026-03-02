import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PermissionGate = ({ requiredPermission, children, fallback = null, redirectTo = null }) => {
    const { user } = useAuth();

    const hasPermission = !requiredPermission || user?.permissions?.includes(requiredPermission);

    if (!hasPermission) {
        if (redirectTo) {
            return <Navigate to={redirectTo} replace />;
        }
        return fallback;
    }

    return children;
};

export default PermissionGate;
