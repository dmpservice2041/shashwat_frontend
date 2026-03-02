import { MODULE_KEYS } from '../constants/permissionModules';

const ACTIONS_FULL = ['view', 'create', 'edit', 'delete'];
const ACTIONS_EXTENDED = ['view', 'create', 'edit', 'delete', 'approve', 'update_status'];

export const PERMISSION_MODULES = [
    {
        key: MODULE_KEYS.DASHBOARD,
        label: 'Dashboard',
        actions: ['view'],
    },
    {
        key: MODULE_KEYS.USERS,
        label: 'Users',
        actions: ACTIONS_FULL,
    },
    {
        key: MODULE_KEYS.ROLES,
        label: 'Roles',
        actions: ACTIONS_FULL,
    },
    {
        key: MODULE_KEYS.HOSPITALS,
        label: 'Hospitals',
        actions: ACTIONS_FULL,
    },
    {
        key: MODULE_KEYS.DOCTORS,
        label: 'Doctors',
        actions: ACTIONS_FULL,
    },
    {
        key: MODULE_KEYS.PATIENTS,
        label: 'Patients',
        actions: ACTIONS_FULL,
    },
    {
        key: MODULE_KEYS.SUPPLIERS,
        label: 'Suppliers',
        actions: ACTIONS_FULL,
    },
    {
        key: MODULE_KEYS.PRODUCTS,
        label: 'Products',
        actions: ACTIONS_FULL,
    },
    {
        key: MODULE_KEYS.PURCHASE,
        label: 'Purchase',
        actions: ACTIONS_EXTENDED,
    },
    {
        key: MODULE_KEYS.QUOTATIONS,
        label: 'Quotations',
        actions: ACTIONS_FULL,
    },
    {
        key: MODULE_KEYS.CHALLANS,
        label: 'Challans',
        actions: ACTIONS_FULL,
    },
    {
        key: MODULE_KEYS.USAGE,
        label: 'Usage',
        actions: ACTIONS_FULL,
    },
    {
        key: MODULE_KEYS.INVOICES,
        label: 'Invoices',
        actions: ACTIONS_FULL,
    },
    {
        key: MODULE_KEYS.PAYMENTS,
        label: 'Payments',
        actions: ['view', 'create'],
    },
    {
        key: MODULE_KEYS.REPORTS,
        label: 'Reports',
        actions: ['view'],
    },
    {
        key: MODULE_KEYS.SETTINGS,
        label: 'Settings',
        actions: ACTIONS_FULL,
    },
];

export const permKey = (module, action) => `${module}:${action}`;

/**
 * Robust permission check that handles:
 * 1. Wildcard '*' (SuperAdmin/Impersonator)
 * 2. Exact match 'module:action'
 */
export const hasPermission = (userPermissions, requiredPermission) => {
    if (!requiredPermission) return true;
    if (!userPermissions) return false;
    const perms = Array.isArray(userPermissions) ? userPermissions : [];
    return perms.includes('*') || perms.includes(requiredPermission);
};

export const hasModuleView = (userPermissions = [], moduleKey) =>
    hasPermission(userPermissions, permKey(moduleKey, 'view'));

export const countPermissions = (permissionsArray = []) =>
    Array.isArray(permissionsArray) ? permissionsArray.length : 0;

export const isHighPrivilegeRole = (permissionsArray = []) =>
    Array.isArray(permissionsArray) &&
    permissionsArray.some(p => p.endsWith(':delete'));

export const ALL_PERMISSION_KEYS = PERMISSION_MODULES.flatMap(m =>
    m.actions.map(a => permKey(m.key, a))
);
