import { useState, useEffect } from 'react';
import {
    Users as UsersIcon,
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Check,
    Mail,
    Phone,
    Lock,
    UserCircle,
    Shield
} from 'lucide-react';
import api from '../services/api';
import { showToast } from '../components/common/Toast';
import styles from './Users.module.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingUser, setEditingUser] = useState(null);


    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: ''
    });
    const [selectedRoleIds, setSelectedRoleIds] = useState([]);
    const [isRolesOpen, setIsRolesOpen] = useState(false);

    useEffect(() => {
        fetchInitialData();


        const handleClickOutside = (e) => {
            if (isRolesOpen && !e.target.closest(`.${styles.roleDropdownContainer}`)) {
                setIsRolesOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isRolesOpen]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [rolesRes, usersRes] = await Promise.allSettled([
                api.get('/roles'),
                api.get('/users')
            ]);

            if (rolesRes.status === 'fulfilled' && rolesRes.value.status === 'success') {
                setRoles(rolesRes.value.data);
            }

            if (usersRes.status === 'fulfilled' && usersRes.value.status === 'success') {
                setUsers(usersRes.value.data);
            } else {
                setUsers([
                    {
                        "id": "e4922c07-fbac-4b80-b0fd-83854f5fba69",
                        "organization_id": "1e0689e3-877c-47eb-92b3-b0e04d7222f6",
                        "user_id": "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
                        "is_org_admin": true,
                        "is_active": true,
                        "User": {
                            "id": "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
                            "first_name": "Raj",
                            "last_name": "Sharma",
                            "email": "raj.sharma@shashwat.com",
                            "phone": "9876543210",
                            "is_active": true
                        },
                        "Roles": [
                            {
                                "id": "52c2165a-4bf2-4c0c-8bce-ec14676d39c6",
                                "name": "Organization Admin",
                                "description": "Full un-restricted administrative access"
                            }
                        ]
                    }
                ]);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            showToast('Failed to load users or roles', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getUserId = (user) => {
        return user.user_id || user.User?.id || user.id || user.profile?.userId || user.userId;
    };

    const getUserDetail = (user, field) => {
        return user[field] || user.User?.[field] || user.profile?.[field] || '';
    };

    const getUserRoles = (user) => {
        return user.Roles || user.roles || user.User?.Roles || user.User?.roles || [];
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setFormData({
            first_name: getUserDetail(user, 'first_name'),
            last_name: getUserDetail(user, 'last_name'),
            email: getUserDetail(user, 'email'),
            phone: getUserDetail(user, 'phone'),
            password: ''
        });
        setSelectedRoleIds((getUserRoles(user) || []).map(r => r.id));
        setShowModal(true);
    };

    const handleDelete = async (user) => {
        const userId = getUserId(user);
        if (!userId) {
            showToast('Unable to determine user ID', 'error');
            return;
        }

        if (!window.confirm(`Are you sure you want to delete ${getUserDetail(user, 'first_name')} ${getUserDetail(user, 'last_name')}?`)) return;

        try {
            const res = await api.delete(`/users/${userId}`);
            if (res.status === 'success' || res.success) {
                showToast('User deleted successfully', 'success');
                fetchInitialData();
            }
        } catch (error) {
            showToast(error.message || 'Failed to delete user', 'error');
        }
    };

    const handleToggleStatus = async (user) => {
        const userId = getUserId(user);
        if (!userId) {
            showToast('Unable to determine user ID', 'error');
            return;
        }

        try {
            const res = await api.put(`/users/${userId}`, {
                is_active: !user.is_active
            });
            if (res.status === 'success' || res.success) {
                showToast(`User ${!user.is_active ? 'activated' : 'deactivated'} successfully`, 'success');
                fetchInitialData();
            }
        } catch (error) {
            showToast(error.message || 'Failed to update status', 'error');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const toggleRole = (roleId) => {
        setSelectedRoleIds(prev =>
            prev.includes(roleId) ? [] : [roleId]
        );
        setIsRolesOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.first_name || !formData.last_name || !formData.email) {
            showToast('Please fill in all required fields', 'warning');
            return;
        }

        if (!editingUser && !formData.password) {
            showToast('Password is required for new users', 'warning');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                roles: selectedRoleIds,
            };


            if (editingUser && !payload.password) {
                delete payload.password;
            }

            let res;
            if (editingUser) {
                const userId = getUserId(editingUser);
                res = await api.put(`/users/${userId}`, payload);
            } else {
                res = await api.post('/users', { ...payload, is_active: true });
            }

            if (res.status === 'success' || res.success) {
                showToast(`User ${editingUser ? 'updated' : 'created'} successfully`, 'success');
                setShowModal(false);
                resetForm();
                fetchInitialData();
            }
        } catch (error) {
            console.error('Error saving user:', error);
            showToast(error.message || `Failed to ${editingUser ? 'update' : 'create'} user`, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            phone: ''
        });
        setSelectedRoleIds([]);
    };

    const filteredUsers = users.filter(user => {
        const firstName = getUserDetail(user, 'first_name').toLowerCase();
        const lastName = getUserDetail(user, 'last_name').toLowerCase();
        const fullName = `${firstName} ${lastName}`;
        const email = getUserDetail(user, 'email').toLowerCase();
        const search = searchTerm.toLowerCase();
        return fullName.includes(search) || email.includes(search);
    });

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.iconWrapper}>
                        <UsersIcon size={24} />
                    </div>
                    <div>
                        <h1 className={styles.pageTitle}>User Management</h1>
                        <p className={styles.pageSubtitle}>Manage your organization members and their access levels.</p>
                    </div>
                </div>
                <button className="btn-primary" onClick={() => { setEditingUser(null); resetForm(); setShowModal(true); }}>
                    <Plus size={20} />
                    <span>Add New User</span>
                </button>
            </header>

            <div className={styles.contentArea}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.userDataTable}>
                        <thead>
                            <tr>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Email</th>
                                <th>Mobile Number</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className={styles.loadingState}>Loading users...</div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className={styles.emptyState}>No users found.</div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => {
                                    const userId = getUserId(user);
                                    const userRoles = getUserRoles(user);

                                    return (
                                        <tr key={userId || Math.random()}>
                                            <td className={styles.primaryText}>{getUserDetail(user, 'first_name') || '-'}</td>
                                            <td className={styles.primaryText}>{getUserDetail(user, 'last_name') || '-'}</td>
                                            <td>{getUserDetail(user, 'email') || '-'}</td>
                                            <td>{getUserDetail(user, 'phone') || '-'}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                    {userRoles && userRoles.length > 0 ? (
                                                        userRoles.map((role, idx) => (
                                                            <span key={idx} className={styles.roleBadge}>{role.name}</span>
                                                        ))
                                                    ) : (
                                                        <span className={styles.roleBadge} style={{ background: '#f1f1f1', color: '#666' }}>No Role</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className={`${styles.statusBadge} ${user.is_active ? styles.statusActive : styles.statusInactive}`}
                                                    onClick={() => handleToggleStatus(user)}
                                                    style={{ cursor: 'pointer' }}
                                                    title={`Click to ${user.is_active ? 'deactivate' : 'activate'}`}
                                                >
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button
                                                        className={styles.actionBtn}
                                                        title="Edit User"
                                                        onClick={() => handleEditClick(user)}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        className={`${styles.actionBtn} ${styles.danger}`}
                                                        title="Delete User"
                                                        onClick={() => handleDelete(user)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <header className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>{editingUser ? 'Edit User' : 'Add New User'}</h2>
                            <button className={styles.closeBtn} onClick={() => { setShowModal(false); setEditingUser(null); }}>
                                <X size={20} />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>First Name *</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="text"
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleInputChange}
                                                className={styles.input}
                                                placeholder="e.g. Raj"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Last Name *</label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            className={styles.input}
                                            placeholder="e.g. Sharma"
                                            required
                                        />
                                    </div>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Email Address *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={styles.input}
                                            placeholder="raj.sharma@shashwat.com"
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Password {editingUser ? '(Optional)' : '*'}</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={styles.input}
                                            placeholder={editingUser ? 'Leave blank to keep current' : '••••••••'}
                                            required={!editingUser}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Mobile Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className={styles.input}
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Assign Roles</label>
                                        <div className={styles.roleDropdownContainer}>
                                            <div
                                                className={styles.roleDropdownTrigger}
                                                onClick={() => setIsRolesOpen(!isRolesOpen)}
                                            >
                                                <div className={styles.selectedRolesList}>
                                                    {selectedRoleIds.length > 0 ? (
                                                        selectedRoleIds.map(roleId => {
                                                            const role = roles.find(r => r.id === roleId);
                                                            return (
                                                                <span key={roleId} className={styles.roleTag}>
                                                                    {role?.name}
                                                                    <X
                                                                        size={12}
                                                                        className={styles.removeRole}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            toggleRole(roleId);
                                                                        }}
                                                                    />
                                                                </span>
                                                            );
                                                        })
                                                    ) : (
                                                        <span className={styles.placeholder}>Select roles...</span>
                                                    )}
                                                </div>
                                                <Shield size={16} style={{ opacity: 0.4 }} />
                                            </div>

                                            {isRolesOpen && (
                                                <div className={styles.roleOptions}>
                                                    {roles.length > 0 ? (
                                                        roles.map(role => (
                                                            <div
                                                                key={role.id}
                                                                className={`${styles.roleOption} ${selectedRoleIds.includes(role.id) ? styles.selected : ''}`}
                                                                onClick={() => toggleRole(role.id)}
                                                            >
                                                                <span>{role.name}</span>
                                                                {selectedRoleIds.includes(role.id) && <Check size={14} />}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className={styles.roleOption}>No roles found</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <footer className={styles.modalFooter}>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowModal(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? (editingUser ? 'Updating...' : 'Creating...') : (editingUser ? 'Update User' : 'Create User')}
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
