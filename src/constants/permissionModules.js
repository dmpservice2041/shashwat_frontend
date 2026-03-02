/**
 * Canonical Module Keys
 * These MUST match the backend internal module names exactly.
 */
export const MODULE_KEYS = {
    DASHBOARD: 'dashboard',
    USERS: 'users',
    ROLES: 'roles',
    HOSPITALS: 'hospitals',
    DOCTORS: 'doctors',
    PATIENTS: 'patients',
    SUPPLIERS: 'suppliers',
    PRODUCTS: 'products',
    PURCHASE: 'purchase',
    QUOTATIONS: 'quotations',
    CHALLANS: 'challans',
    USAGE: 'usage',
    INVOICES: 'invoices',
    PAYMENTS: 'payments',
    REPORTS: 'reports',
    SETTINGS: 'settings',
    ORGANIZATIONS: 'organizations',
};

export const ALL_MODULES = Object.values(MODULE_KEYS);
