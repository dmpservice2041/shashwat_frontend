import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Package,
  ShoppingCart,
  FileText,
  Users,
  User,
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
  Gauge,
  ChevronDown,
  Database,
  Factory,
  Tags,
  Columns,
  Layers,
  Scale,
  Receipt,
  Warehouse,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { hasPermission } from "../../utils/permissions";
import { MODULE_KEYS } from "../../constants/permissionModules";
import styles from "./Sidebar.module.css";


const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: Home, module: MODULE_KEYS.DASHBOARD },
  {
    group: "Master Data",
    items: [
      { path: "/hospitals", label: "Hospitals", icon: Building2, permission: "hospitals:view", module: MODULE_KEYS.HOSPITALS },
      { path: "/doctors", label: "Doctors", icon: Stethoscope, permission: "doctors:view", module: MODULE_KEYS.DOCTORS },
      { path: "/patients", label: "Patients", icon: Activity, permission: "patients:view", module: MODULE_KEYS.PATIENTS }

    ]
  },
  {
    group: "Accounts",
    items: [
      { path: "/suppliers", label: "Suppliers", icon: Truck, permission: "suppliers:view", module: MODULE_KEYS.SUPPLIERS },
      { path: "/products", label: "Inventory", icon: Package, permission: "products:view", module: MODULE_KEYS.PRODUCTS },
      { path: "/purchase", label: "Purchase", icon: ShoppingCart, permission: "purchases:view", module: MODULE_KEYS.PURCHASE },
      { path: "/quotation", label: "Quotations", icon: FileText, permission: "quotations:view", module: MODULE_KEYS.QUOTATIONS },
      { path: "/challan", label: "Challan", icon: ClipboardList, permission: "challans:view", module: MODULE_KEYS.CHALLANS },
      { path: "/usage", label: "Usage", icon: Gauge, permission: "usages:view", module: MODULE_KEYS.USAGE },
      { path: "/invoice", label: "Invoice", icon: FileText, permission: "invoices:view", module: MODULE_KEYS.INVOICES },
      { path: "/payment", label: "Payment", icon: CreditCard, permission: "payments:view", module: MODULE_KEYS.PAYMENTS },
      { path: "/masters", label: "Masters", icon: Database, permission: "masters:view", module: MODULE_KEYS.MASTERS }
    ]
  },
  {
    group: "Analytics",
    items: [
      { path: "/reports", label: "Reports", icon: BarChart3, permission: "reports:view", module: MODULE_KEYS.REPORTS }
    ]
  },
  {
    group: "Administration",
    items: [
      { path: "/admin/organizations", label: "Organizations", icon: Building2, adminOnly: true },
      { path: "/users", label: "Users", icon: Users, permission: "users:view", module: MODULE_KEYS.USERS },
      { path: "/roles", label: "Roles & Permissions", icon: ShieldCheck, permission: "roles:view", module: MODULE_KEYS.ROLES },
      { path: "/settings", label: "Settings", icon: SettingsIcon, permission: "settings:view", module: MODULE_KEYS.SETTINGS }
    ]
  }
];


const Sidebar = ({ isOpen, toggleSidebar }) => {

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userPermissions = user?.permissions || [];
  const enabledModules = user?.enabled_modules || [];

  const [openGroup, setOpenGroup] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile-photo`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const blob = await res.blob();
          if (blob.size > 0 && blob.type.startsWith('image/')) {
            const url = URL.createObjectURL(blob);
            if (profilePhotoUrl) URL.revokeObjectURL(profilePhotoUrl);
            setProfilePhotoUrl(url);
          }
        } else if (res.status !== 404) {
          console.error('Sidebar: Failed to fetch photo', res.statusText);
        }
      } catch (err) {
        console.error('Sidebar: Failed to fetch photo', err);
      }
    };

    if (user) fetchPhoto();

    return () => {
      if (profilePhotoUrl) URL.revokeObjectURL(profilePhotoUrl);
    };
  }, [user]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowDropdown(false);
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/login');
  };

  const visibleItems = NAV_ITEMS.map(item => {
    if (item.group) {
      const filteredItems = item.items.filter(subItem => {
        if (subItem.adminOnly) return user?.organization_type === 'ADMIN';

        if (subItem.module && !enabledModules.includes(subItem.module)) return false;
        if (subItem.permission && !hasPermission(userPermissions, subItem.permission)) return false;
        return true;
      });
      return filteredItems.length > 0 ? { ...item, items: filteredItems } : null;
    } else {
      if (item.adminOnly && user?.organization_type !== 'ADMIN') return null;
      if (item.module && !enabledModules.includes(item.module)) return false;
      if (item.permission && !hasPermission(userPermissions, item.permission)) return false;
      return item;
    }
  }).filter(Boolean);


  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>

      <div className={styles.brandHeader} onClick={() => navigate('/dashboard')} title="Go to Dashboard">
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

        {visibleItems.map((item) => {
          if (item.group) {
            const GroupIcon = item.items[0]?.icon;
            const isGroupOpen = openGroup === item.group;

            return (
              <div
                key={item.group}
                className={`${styles.navGroup} ${isGroupOpen ? styles.isOpen : ""}`}
              >
                <div
                  className={styles.groupHeader}
                  onClick={() => {
                    if (!isOpen) toggleSidebar();
                    setOpenGroup(isGroupOpen ? null : item.group);
                  }}
                >
                  <div className={styles.groupIconBox}>
                    {GroupIcon && <GroupIcon size={18} />}
                  </div>

                  {isOpen && (
                    <>
                      <span className={styles.groupLabel}>{item.group}</span>
                      <ChevronDown size={15} className={styles.groupChevron} />
                    </>
                  )}
                </div>

                {isOpen && isGroupOpen && (
                  <ul className={styles.navList}>
                    {item.items.map((subItem) => {
                      const ItemIcon = subItem.icon;
                      return (
                        <li key={subItem.path} className={styles.navItem}>
                          <NavLink
                            to={subItem.path}
                            className={({ isActive }) =>
                              `${styles.navLink} ${isActive ? styles.active : ""}`
                            }
                          >
                            <ItemIcon size={16} className={styles.navIcon} />
                            <span className={styles.navLabel}>{subItem.label}</span>
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          } else {
            const ItemIcon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `${styles.standaloneLink} ${isActive ? styles.active : ""}`
                }
              >
                <div className={styles.standaloneIconBox}>
                  <ItemIcon size={18} />
                </div>
                {isOpen && <span className={styles.standaloneLabel}>{item.label}</span>}
              </NavLink>
            );
          }
        })}

      </div>


      <div className={styles.sidebarFooter}>

        <div className={styles.footerRow} ref={dropdownRef}>

          <div
            className={`${styles.profileInfo} ${showDropdown ? styles.active : ''}`}
            onClick={handleProfileClick}
          >
            <div className={styles.avatarCircle}>
              {profilePhotoUrl ? (
                <img src={profilePhotoUrl} alt="Me" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                user?.first_name
                  ? user.first_name.charAt(0).toUpperCase()
                  : user?.name
                    ? user.name.charAt(0).toUpperCase()
                    : user?.email?.charAt(0).toUpperCase() ?? "U"
              )}
            </div>
            {isOpen && (
              <div className={styles.profileText}>
                <span className={styles.profileName}>
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.name || "User"}
                </span>
                <span className={styles.profileEmail}>{user?.email ?? ""}</span>
              </div>
            )}
          </div>

          {isOpen && (
            <button className={styles.logoutButton} onClick={showDropdown ? null : logout} title="Logout">
              <LogOut size={18} />
            </button>
          )}

          {showDropdown && (
            <div className={styles.dropdownMenu}>
              <button className={styles.dropdownItem} onClick={() => handleNavigate('/profile')}>
                <User size={16} /> Profile
              </button>
              <div className={styles.menuDivider}></div>
              <button className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}

        </div>

        {!isOpen && !showDropdown && (
          <button className={styles.logoutButtonCollapsed} onClick={logout} title="Logout">
            <LogOut size={18} />
          </button>
        )}

        <button className={styles.collapseToggle} onClick={toggleSidebar}>
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>

      </div>

    </aside >
  );
};

export default Sidebar;
