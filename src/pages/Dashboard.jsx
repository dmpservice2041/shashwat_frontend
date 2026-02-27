import { Activity, Users, Package, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './Dashboard.module.css';

const StatCard = ({ title, value, icon: Icon, trend, colorClass }) => (
    <div className={`glass-panel ${styles.statCard}`}>
        <div className={styles.statHeader}>
            <div>
                <h3 className={styles.statTitle}>{title}</h3>
                <p className={styles.statValue}>{value}</p>
            </div>
            <div className={`${styles.iconWrapper} ${colorClass}`}>
                <Icon size={24} />
            </div>
        </div>
        <div className={styles.statFooter}>
            <span className={trend > 0 ? styles.trendUp : styles.trendDown}>
                {trend > 0 ? '+' : ''}{trend}%
            </span>
            <span className={styles.trendLabel}>vs last month</span>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.dashboardHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Dashboard Overview</h1>
                    <p className={styles.pageSubtitle}>Welcome back, {user?.name || 'Admin'}. Here's what's happening today.</p>
                </div>
            </header>

            <div className={styles.statsGrid}>
                <StatCard
                    title="Total Sales"
                    value="₹4,25,000"
                    icon={Activity}
                    trend={12.5}
                    colorClass={styles.bgPrimary}
                />
                <StatCard
                    title="Active Hospitals"
                    value="45"
                    icon={Users}
                    trend={5.2}
                    colorClass={styles.bgSuccess}
                />
                <StatCard
                    title="Low Stock Items"
                    value="12"
                    icon={Package}
                    trend={-2.4}
                    colorClass={styles.bgWarning}
                />
                <StatCard
                    title="Pending Quotations"
                    value="8"
                    icon={FileText}
                    trend={1.2}
                    colorClass={styles.bgDanger}
                />
            </div>

            <div className={styles.dashboardContent}>
                <div className={`glass-panel ${styles.recentActivity}`}>
                    <h2 className={styles.sectionTitle}>Recent Activity</h2>
                    <div className={styles.emptyState}>
                        <p>No recent activity found.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
