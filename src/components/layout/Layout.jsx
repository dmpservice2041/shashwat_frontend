import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
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
                <Header toggleSidebar={toggleSidebar} />
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
