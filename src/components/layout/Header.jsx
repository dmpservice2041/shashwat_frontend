import { Menu, Bell, User, LogOut } from 'lucide-react';
import styles from './Header.module.css';
import { useAuth } from '../../context/AuthContext';

const Header = ({ toggleSidebar }) => {
    const { user, impersonatingOrg, exitImpersonation } = useAuth();

    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                <button onClick={toggleSidebar} className={styles.menuButton} aria-label="Toggle Navigation">
                    <Menu size={24} />
                </button>
                {impersonatingOrg && (
                    <div style={{ marginLeft: '16px', background: '#fee2e2', border: '1px solid #f87171', padding: '6px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#991b1b' }}>
                            Impersonating: <strong style={{ fontWeight: 700 }}>{impersonatingOrg}</strong>
                        </span>
                        <button
                            onClick={exitImpersonation}
                            style={{ background: '#ef4444', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: 'none' }}
                        >
                            <LogOut size={14} /> Exit
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.headerRight}>
                <button className={styles.iconButton} aria-label="Notifications">
                    <Bell size={20} />
                    <span className={styles.badge}></span>
                </button>

                <div className={styles.userProfile}>
                    <div className={styles.avatarWrapper}>
                        <User size={20} className={styles.avatarIcon} />
                    </div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user?.name || 'User'}</span>
                        <span className={styles.userRole}>{user?.organization_type || 'Role'}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
