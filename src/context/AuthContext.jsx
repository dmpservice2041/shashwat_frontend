import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import { MODULE_KEYS } from '../constants/permissionModules';

const normalizePermissions = (perms) => {
    if (!perms) return [];
    return perms.map(p => typeof p === 'object' ? p.key : p).filter(Boolean);
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [impersonatingOrg, setImpersonatingOrg] = useState(null);

    useEffect(() => {
    }, [user]);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            const impOrg = localStorage.getItem('impersonated_org_name');
            if (impOrg) {
                setImpersonatingOrg(impOrg);
            }
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    if (res.success || res.status === 'success') {
                        let userData = res.data?.user || res.data || res.user;

                        try {
                            const decoded = jwtDecode(token);

                            const apiEnabledModules = res.data?.active_organization?.enabled_modules || res.active_organization?.enabled_modules;
                            const apiPermissions = res.data?.permissions || res.permissions;

                            userData = {
                                ...userData,
                                organization_type: decoded.organization_type || decoded.org_type || null,
                                active_organization_id: decoded.active_organization_id || decoded.organization_id || null,
                                roles: decoded.roles || [],
                                permissions: normalizePermissions(apiPermissions || userData.permissions),
                                enabled_modules: apiEnabledModules || userData.enabled_modules || userData.settings?.enabled_modules || []
                            };
                        } catch (e) {
                            console.error('Failed to parse token payload', e);
                        }

                        setUser(userData);
                    } else {
                        localStorage.removeItem('token');
                        localStorage.removeItem('impersonated_org_name');
                        setImpersonatingOrg(null);
                    }
                } catch (error) {
                    console.error("Token validation failed", error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('impersonated_org_name');
                    setImpersonatingOrg(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    useEffect(() => {
        const handleForbidden = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    if (res.success || res.status === 'success') {
                        let userData = res.data?.user || res.data || res.user;
                        try {
                            const decoded = jwtDecode(token);
                            const apiEnabledModules = res.data?.active_organization?.enabled_modules || res.active_organization?.enabled_modules;
                            const apiPermissions = res.data?.permissions || res.permissions;
                            userData = {
                                ...userData,
                                organization_type: decoded.organization_type || decoded.org_type || null,
                                active_organization_id: decoded.active_organization_id || decoded.organization_id || null,
                                roles: decoded.roles || [],
                                permissions: normalizePermissions(apiPermissions || userData.permissions),
                                enabled_modules: apiEnabledModules || userData.enabled_modules || userData.settings?.enabled_modules || []
                            };
                            setUser(userData);
                        } catch (e) {
                            console.error('Failed to parse token payload in refresh', e);
                        }
                    }
                } catch (error) {
                    console.error("Force refresh failed", error);
                }
            }
        };
        window.addEventListener('auth:forbidden', handleForbidden);
        return () => window.removeEventListener('auth:forbidden', handleForbidden);
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });

        if (res.success || res.status === 'success' || res.token) {
            const token = res.data?.token || res.token;
            let userData = res.data?.user || res.data || res.user;

            try {
                const decoded = jwtDecode(token);

                const apiEnabledModules = res.data?.active_organization?.enabled_modules || res.active_organization?.enabled_modules;
                const apiPermissions = res.data?.permissions || res.permissions;

                userData = {
                    ...userData,
                    organization_type: decoded.organization_type || decoded.org_type || null,
                    active_organization_id: decoded.active_organization_id || decoded.organization_id || null,
                    roles: decoded.roles || [],
                    permissions: normalizePermissions(apiPermissions || decoded.permissions || userData.permissions),
                    enabled_modules: apiEnabledModules || decoded.enabled_modules || userData.enabled_modules || userData.settings?.enabled_modules || []
                };
            } catch (e) {
                console.error('Failed to parse token payload', e);
            }

            localStorage.setItem('token', token);
            setUser(userData);
            return { success: true };
        }
        return { success: false, message: res.message || 'Login failed' };
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('original_token');
        localStorage.removeItem('impersonated_org_name');
        setImpersonatingOrg(null);
        setUser(null);
    };

    const impersonate = async (orgId, orgName) => {
        try {
            const res = await api.post('/auth/impersonate', { organization_id: orgId });
            if (res.success || res.status === 'success' || res.token) {
                const currentToken = localStorage.getItem('token');
                if (!localStorage.getItem('original_token')) {
                    localStorage.setItem('original_token', currentToken);
                }

                localStorage.setItem('token', res.data?.token || res.token);
                localStorage.setItem('impersonated_org_name', orgName);

                setImpersonatingOrg(orgName);

                const meRes = await api.get('/auth/me');
                if (meRes.success || meRes.status === 'success') {
                    let userData = meRes.data?.user || meRes.data || meRes.user;
                    try {
                        const newToken = res.data?.token || res.token;
                        const decoded = jwtDecode(newToken);

                        const apiEnabledModules = meRes.data?.active_organization?.enabled_modules || meRes.active_organization?.enabled_modules;
                        const apiPermissions = meRes.data?.permissions || meRes.permissions;

                        userData = {
                            ...userData,
                            organization_type: decoded.organization_type || decoded.org_type || null,
                            active_organization_id: decoded.active_organization_id || decoded.organization_id || null,
                            roles: decoded.roles || [],
                            permissions: normalizePermissions(apiPermissions || decoded.permissions || userData.permissions),
                            enabled_modules: apiEnabledModules || decoded.enabled_modules || userData.enabled_modules || userData.settings?.enabled_modules || []
                        };
                    } catch (e) {
                        console.error('Failed to parse impersonation token', e);
                    }
                    setUser(userData);
                }

                return { success: true };
            }
            return { success: false, message: res.message || 'Impersonation failed' };
        } catch (error) {
            console.error('Impersonation error:', error);
            return { success: false, message: error.message || 'Server error' };
        }
    };

    const exitImpersonation = async () => {
        try {
            const originalToken = localStorage.getItem('original_token');
            if (originalToken) {
                localStorage.setItem('token', originalToken);
                localStorage.removeItem('original_token');
                localStorage.removeItem('impersonated_org_name');
                setImpersonatingOrg(null);

                const meRes = await api.get('/auth/me');
                if (meRes.success || meRes.status === 'success') {
                    let userData = meRes.data?.user || meRes.data || meRes.user;
                    try {
                        const decoded = jwtDecode(originalToken);

                        const apiEnabledModules = meRes.data?.active_organization?.enabled_modules || meRes.active_organization?.enabled_modules;
                        const apiPermissions = meRes.data?.permissions || meRes.permissions;

                        userData = {
                            ...userData,
                            organization_type: decoded.organization_type || decoded.org_type || null,
                            active_organization_id: decoded.active_organization_id || decoded.organization_id || null,
                            roles: decoded.roles || [],
                            permissions: normalizePermissions(apiPermissions || decoded.permissions || userData.permissions),
                            enabled_modules: apiEnabledModules || decoded.enabled_modules || userData.enabled_modules || userData.settings?.enabled_modules || []
                        };
                    } catch (e) {
                        console.error('Failed to parse original token', e);
                    }
                    setUser(userData);
                }
            }
        } catch (error) {
            console.error('Exit impersonation error:', error);
            logout();
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, impersonate, exitImpersonation, impersonatingOrg, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
