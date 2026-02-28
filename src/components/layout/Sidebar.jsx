import { NavLink } from 'react-router-dom';
import {
    Home,
    Package,
    ShoppingCart,
    FileText,
    Users,
    Building2,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Stethoscope,
    Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/purchase', label: 'Purchase Entry', icon: ShoppingCart },
    { path: '/quotation', label: 'Quotations', icon: FileText },
    { path: '/hospitals', label: 'Hospitals', icon: Building2 },
    { path: '/doctors', label: 'Doctors', icon: Stethoscope },
    { path: '/patients', label: 'Patients', icon: Activity },
    { path: '/users', label: 'Users & Roles', icon: Users },
    { path: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { logout } = useAuth();

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
                <ul className={styles.navList}>
                    {navItems.map((item) => (
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
