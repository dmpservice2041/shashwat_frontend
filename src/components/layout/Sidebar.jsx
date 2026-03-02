import { NavLink } from 'react-router-dom';
import {
    Home,
    Package,
    ShoppingCart,
    FileText,
    Users,
    Building2,
    Settings as SettingsIcon,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Stethoscope,
    Activity,
    Truck,
    BarChart3,
    CreditCard,
    ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/permissions';
import { MODULE_KEYS } from '../../constants/permissionModules';
import styles from './Sidebar.module.css';

const NAV_GROUPS = [
    {
        group: 'General',
        items: [
            { path: '/dashboard', label: 'Dashboard', icon: Home, module: MODULE_KEYS.DASHBOARD },
        ]
    },
    {
        group: 'Master Data',
        items: [
            { path: '/hospitals', label: 'Hospitals', icon: Building2, permission: 'hospitals:view', module: MODULE_KEYS.HOSPITALS },
            { path: '/doctors', label: 'Doctors', icon: Stethoscope, permission: 'doctors:view', module: MODULE_KEYS.DOCTORS },
            { path: '/patients', label: 'Patients', icon: Activity, permission: 'patients:view', module: MODULE_KEYS.PATIENTS },
            { path: '/suppliers', label: 'Suppliers', icon: Truck, permission: 'suppliers:view', module: MODULE_KEYS.SUPPLIERS },
            { path: '/products', label: 'Products', icon: Package, permission: 'products:view', module: MODULE_KEYS.PRODUCTS },
        ]
    },
    {
        group: 'Operations',
        items: [
            { path: '/purchase', label: 'Purchase Entry', icon: ShoppingCart, permission: 'purchase:view', module: MODULE_KEYS.PURCHASE },
            { path: '/quotation', label: 'Quotations', icon: FileText, permission: 'quotations:view', module: MODULE_KEYS.QUOTATIONS },
            { path: '/challan', label: 'Challan', icon: ClipboardList, permission: 'challans:view', module: MODULE_KEYS.CHALLANS },
            { path: '/usage', label: 'Usage', icon: Activity, permission: 'usage:view', module: MODULE_KEYS.USAGE },
            { path: '/invoice', label: 'Invoice', icon: FileText, permission: 'invoices:view', module: MODULE_KEYS.INVOICES },
            { path: '/payment', label: 'Payment', icon: CreditCard, permission: 'payments:view', module: MODULE_KEYS.PAYMENTS },
        ]
    },
    {
        group: 'Analytics',
        items: [
            { path: '/reports', label: 'Reports', icon: BarChart3, permission: 'reports:view', module: MODULE_KEYS.REPORTS },
        ]
    },
    {
        group: 'Administration',
        items: [
            { path: '/admin/organizations', label: 'Organizations', icon: Building2, permission: 'organizations:view', module: MODULE_KEYS.ORGANIZATIONS },
            { path: '/users', label: 'Users', icon: Users, permission: 'users:view', module: MODULE_KEYS.USERS },
            { path: '/roles', label: 'Roles & Permissions', icon: ShieldCheck, permission: 'roles:view', module: MODULE_KEYS.ROLES },
            { path: '/settings', label: 'Settings', icon: SettingsIcon, permission: 'settings:view', module: MODULE_KEYS.SETTINGS },
        ]
    }
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const userPermissions = user?.permissions || [];
    const enabledModules = user?.enabled_modules || [];

    const visibleGroups = NAV_GROUPS.map(group => ({
        ...group,
        items: group.items.filter(item => {
            if (!enabledModules.includes(item.module)) return false;
            return hasPermission(userPermissions, item.permission);
        })
    })).filter(group => group.items.length > 0);

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
            <div className={styles.brandHeader}>
                <div className={styles.iconWrapper}>
                    <ShieldCheck size={28} className={styles.logoIcon} />
                </div>
                {isOpen && (
                    <h2 className={styles.brandTitle}>
                        Medic<span className="gradient-text">ERP</span>
                    </h2>
                )}
            </div>

            <div className={styles.navContainer}>
                {visibleGroups.map((group) => (
                    <div key={group.group} className={styles.navGroup}>
                        {isOpen && <h3 className={styles.groupHeader}>{group.group}</h3>}
                        <ul className={styles.navList}>
                            {group.items.map((item) => (
                                <li key={item.path} className={styles.navItem}>
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `${styles.navLink} ${isActive ? styles.active : ''}`
                                        }
                                        title={!isOpen ? item.label : undefined}
                                    >
                                        <item.icon size={22} className={styles.navIcon} />
                                        {isOpen && <span className={styles.navLabel}>{item.label}</span>}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className={styles.sidebarFooter}>
                <button className={styles.logoutButton} onClick={logout} title={!isOpen ? 'Logout' : undefined}>
                    <LogOut size={22} className={styles.logoutIcon} />
                    {isOpen && <span className={styles.logoutLabel}>Logout</span>}
                </button>

                <button
                    className={styles.collapseToggle}
                    onClick={toggleSidebar}
                    aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                    {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

