import { PERMISSION_MODULES, permKey } from '../../../utils/permissions';
import { MODULE_KEYS } from '../../../constants/permissionModules';

const ACTION_LABELS = {
    view: 'View',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    approve: 'Approve',
    update_status: 'Update Status',
};

const ACTION_COLORS = {
    view: 'var(--primary-600)',
    create: '#10b981',
    edit: '#f59e0b',
    delete: '#ef4444',
    approve: 'var(--primary-500)',
    update_status: 'var(--primary-500)',
};

const PermissionMatrix = ({ permissions = [], onChange, readOnly = false, catalogue = null, enabledModules = [] }) => {

    const toTitleCase = (str) =>
        str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const rawModules = catalogue
        ? Object.entries(catalogue).map(([moduleKey, perms]) => ({
            key: moduleKey,
            label: perms[0]?.module_label || toTitleCase(moduleKey),
            actions: perms.map(p => p.action),
        }))
        : PERMISSION_MODULES;

    const modules = rawModules.filter(m => enabledModules.includes(m.key));

    const isChecked = (key) => permissions.includes(key);

    const getModuleActionKeys = (moduleKey) => {
        if (catalogue && catalogue[moduleKey]) {
            return catalogue[moduleKey].map(p => p.key);
        }
        const mod = PERMISSION_MODULES.find(m => m.key === moduleKey);
        return mod ? mod.actions.map(a => permKey(moduleKey, a)) : [];
    };

    const handleToggle = (moduleKey, action) => {
        if (readOnly) return;

        const key = permKey(moduleKey, action);
        const viewKey = permKey(moduleKey, 'view');
        let next = [...permissions];

        if (action === 'view') {
            if (isChecked(key)) {
                const moduleKeys = getModuleActionKeys(moduleKey);
                next = next.filter(p => !moduleKeys.includes(p));
            } else {
                if (!next.includes(key)) next.push(key);
            }
        } else {
            if (isChecked(key)) {
                next = next.filter(p => p !== key);
            } else {
                if (!next.includes(viewKey)) next.push(viewKey);
                if (!next.includes(key)) next.push(key);
            }
        }

        onChange(next);
    };

    const handleModuleToggle = (moduleKey, checked) => {
        if (readOnly) return;
        const moduleKeys = getModuleActionKeys(moduleKey);
        let next = [...permissions];
        if (checked) {
            moduleKeys.forEach(k => { if (!next.includes(k)) next.push(k); });
        } else {
            next = next.filter(p => !moduleKeys.includes(p));
        }
        onChange(next);
    };

    const isModuleFullyChecked = (mod) => {
        const moduleKeys = getModuleActionKeys(mod.key);
        return moduleKeys.length > 0 && moduleKeys.every(k => isChecked(k));
    };

    const isModulePartiallyChecked = (mod) => {
        const moduleKeys = getModuleActionKeys(mod.key);
        return moduleKeys.some(k => isChecked(k)) && !isModuleFullyChecked(mod);
    };

    const isViewChecked = (moduleKey) => isChecked(permKey(moduleKey, 'view'));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {modules.map((mod) => {
                const fullyChecked = isModuleFullyChecked(mod);
                const partial = isModulePartiallyChecked(mod);
                const viewOn = isViewChecked(mod.key);

                return (
                    <div key={mod.key} style={{
                        border: '1px solid var(--neutral-200)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: (viewOn || partial) ? 'var(--primary-50)' : 'var(--surface-color)',
                        transition: 'background 0.15s'
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 16px', borderBottom: '1px solid var(--neutral-200)', background: 'var(--neutral-50)',
                        }}>
                            <input
                                type="checkbox"
                                checked={fullyChecked}
                                ref={el => { if (el) el.indeterminate = partial; }}
                                onChange={(e) => handleModuleToggle(mod.key, e.target.checked)}
                                disabled={readOnly}
                                style={{ width: '16px', height: '16px', cursor: readOnly ? 'not-allowed' : 'pointer', accentColor: 'var(--primary-600)' }}
                                title={`Toggle all ${mod.label} permissions`}
                            />
                            <span style={{
                                fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
                                letterSpacing: '0.05em', color: 'var(--neutral-900)', flex: 1,
                            }}>
                                {mod.label}
                            </span>
                            {(fullyChecked || partial) && (
                                <span style={{
                                    fontSize: '11px', padding: '2px 8px',
                                    background: fullyChecked ? '#d1fae5' : '#fef3c7',
                                    color: fullyChecked ? '#065f46' : '#92400e',
                                    borderRadius: '9999px', fontWeight: 600,
                                }}>
                                    {fullyChecked ? 'Full Access' : 'Partial'}
                                </span>
                            )}
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(auto-fill, minmax(140px, 1fr))`,
                            padding: '12px 16px', gap: '8px',
                        }}>
                            {mod.actions.map(action => {
                                const key = permKey(mod.key, action);
                                const checked = isChecked(key);
                                const isActionDisabled = readOnly || (action !== 'view' && !viewOn);

                                return (
                                    <label
                                        key={action}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            cursor: isActionDisabled ? 'not-allowed' : 'pointer',
                                            opacity: isActionDisabled && action !== 'view' ? 0.4 : 1,
                                            userSelect: 'none',
                                        }}
                                        title={action !== 'view' && !viewOn ? 'Enable View permission first' : ACTION_LABELS[action] || action}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => handleToggle(mod.key, action)}
                                            disabled={isActionDisabled}
                                            style={{
                                                width: '15px', height: '15px',
                                                cursor: isActionDisabled ? 'not-allowed' : 'pointer',
                                                accentColor: ACTION_COLORS[action] || 'var(--primary-600)',
                                            }}
                                        />
                                        <span style={{
                                            fontSize: '13px',
                                            fontWeight: checked ? 600 : 400,
                                            color: checked ? (ACTION_COLORS[action] || 'var(--neutral-900)') : 'var(--neutral-500)',
                                        }}>
                                            {ACTION_LABELS[action] || action}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PermissionMatrix;
