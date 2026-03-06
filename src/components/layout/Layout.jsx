import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import FloatingIsland from './FloatingIsland';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 1024) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className={styles.layoutContainer}>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className={styles.sidebarOverlay}
                    onClick={toggleSidebar}
                    aria-label="Close sidebar"
                />
            )}

            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <div className={`${styles.mainWrapper} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
                <FloatingIsland />
                {!sidebarOpen && (
                    <button
                        className={styles.mobileToggle}
                        onClick={toggleSidebar}
                        aria-label="Open menu"
                    >
                        <Menu size={20} />
                    </button>
                )}
                <main className={styles.mainContent}>
                    <div className={styles.contentInner}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
