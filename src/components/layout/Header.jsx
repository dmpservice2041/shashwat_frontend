import { Menu, Bell, User } from 'lucide-react';
import styles from './Header.module.css';

const Header = ({ toggleSidebar }) => {
    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                <button onClick={toggleSidebar} className={styles.menuButton} aria-label="Toggle Navigation">
                    <Menu size={24} />
                </button>
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
                        <span className={styles.userName}>Admin</span>
                        <span className={styles.userRole}>Super Admin</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
