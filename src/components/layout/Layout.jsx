import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className={styles.layoutContainer}>
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
