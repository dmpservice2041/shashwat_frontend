import React from 'react';
import { Link } from 'react-router-dom';
import {
    Factory,
    Building,
    Tags,
    Columns,
    Layers,
    Scale,
    Receipt,
    Warehouse,
    ChevronRight,
    Database
} from 'lucide-react';
import styles from './MastersLandingPage.module.css';

const masterItems = [
    {
        path: '/masters/manufacturers',
        label: 'Manufacturers',
        description: 'Manage product manufacturers and suppliers',
        icon: Factory
    },
    {
        path: '/masters/departments',
        label: 'Departments',
        description: 'Organize products by departments',
        icon: Building
    },
    {
        path: '/masters/categories',
        label: 'Categories',
        description: 'Define main product categories',
        icon: Tags
    },
    {
        path: '/masters/sub-categories',
        label: 'Sub Categories',
        description: 'Detailed product sub-classification',
        icon: Columns
    },
    {
        path: '/masters/material-types',
        label: 'Material Types',
        description: 'Manage different material classifications',
        icon: Layers
    },
    {
        path: '/masters/units',
        label: 'Units of Measure',
        description: 'Define measurement units like KG, PCS',
        icon: Scale
    },
    {
        path: '/masters/tax-codes',
        label: 'GST Tax Codes',
        description: 'Manage HSN rates and tax percentages',
        icon: Receipt
    },
    {
        path: '/masters/warehouses',
        label: 'Warehouses',
        description: 'Storage locations and inventory facilities',
        icon: Warehouse
    }
];

const MastersLandingPage = () => {
    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Database size={32} color="var(--primary-600)" />
                    <h1 className={styles.title}>Master Data Management</h1>
                </div>
                <p className={styles.subtitle}>
                    Configure and manage core system entities for products and accounting.
                </p>
            </header>

            <div className={styles.grid}>
                {masterItems.map((item) => (
                    <Link key={item.path} to={item.path} className={styles.card}>
                        <div className={styles.iconWrapper}>
                            <item.icon size={24} />
                        </div>
                        <h3 className={styles.cardTitle}>{item.label}</h3>
                        <p className={styles.cardDescription}>{item.description}</p>
                        <ChevronRight className={styles.arrow} size={20} />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default MastersLandingPage;
