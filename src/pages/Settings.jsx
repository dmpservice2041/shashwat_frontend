import { useState } from 'react';
import { ShieldCheck, Settings as SettingsIcon } from 'lucide-react';
const TABS = [
    { key: 'general', label: 'General', icon: SettingsIcon },
];

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');

    return (
        <div style={{ padding: '24px' }}>
            {/* Page header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <SettingsIcon size={24} style={{ color: 'var(--primary-600)' }} />
                    Settings
                </h1>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                    Manage organization global configurations.
                </p>
            </div>

            {/* Tab Bar */}
            <div style={{
                display: 'flex',
                borderBottom: '2px solid #e5e7eb',
                marginBottom: '28px',
                gap: '4px',
            }}>
                {TABS.map(tab => {
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                borderBottom: isActive ? '2px solid var(--primary-600)' : '2px solid transparent',
                                background: 'transparent',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? 'var(--primary-600)' : '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '-2px',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            {activeTab === 'general' && (
                <div style={{ color: '#6b7280', fontSize: '14px', padding: '32px', textAlign: 'center', border: '1px dashed #e5e7eb', borderRadius: '8px' }}>
                    General settings — coming soon.
                </div>
            )}
        </div>
    );
};

export default Settings;
