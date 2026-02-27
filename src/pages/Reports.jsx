import { BarChart3, TrendingUp, Package, Clock, AlertTriangle } from 'lucide-react';
import styles from './Reports.module.css';

const reportCards = [
    { title: 'Sales Report', desc: 'Hospital-wise and product-wise revenue summary.', icon: TrendingUp, link: '#sales', color: 'primary' },
    { title: 'Inventory Stock', desc: 'Current warehouse stock via ledger aggregation.', icon: Package, link: '#inventory', color: 'success' },
    { title: 'Expiry Alerts', desc: 'Batches expiring within the next 30/60/90 days.', icon: Clock, link: '#expiry', color: 'warning' },
    { title: 'Pending Challans', desc: 'Delivery challans pending full completion.', icon: AlertTriangle, link: '#challans', color: 'danger' },
];

const colorMap = {
    primary: { bg: 'var(--primary-100)', color: 'var(--primary-600)' },
    success: { bg: '#d1fae5', color: 'var(--success)' },
    warning: { bg: '#fef3c7', color: 'var(--warning)' },
    danger: { bg: '#fee2e2', color: 'var(--danger)' },
};

const Reports = () => {
    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.iconWrapper} style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}>
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <h1 className={styles.pageTitle}>Reports</h1>
                        <p className={styles.pageSubtitle}>Analytical views and business reports.</p>
                    </div>
                </div>
            </header>

            <div className={styles.reportGrid}>
                {reportCards.map((card) => {
                    const { bg, color } = colorMap[card.color];
                    return (
                        <a key={card.title} href={card.link} className={`glass-panel ${styles.reportCard}`}>
                            <div className={styles.cardIconWrapper} style={{ background: bg, color }}>
                                <card.icon size={28} />
                            </div>
                            <div className={styles.cardBody}>
                                <h3 className={styles.cardTitle}>{card.title}</h3>
                                <p className={styles.cardDesc}>{card.desc}</p>
                            </div>
                            <div className={styles.cardArrow}>→</div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
};

export default Reports;
