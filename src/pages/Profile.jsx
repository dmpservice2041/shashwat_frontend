import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Lock, Camera, Save, Loader2, ShieldCheck, KeyRound, Trash2, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { showToast } from '../components/common/Toast';
import PhotoCropModal from '../components/common/PhotoCropModal';
import styles from './Profile.module.css';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [photoLoading, setPhotoLoading] = useState(false);
    const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [tempPhotoUrl, setTempPhotoUrl] = useState(null);
    const [orgName, setOrgName] = useState('');
    const fileInputRef = useRef(null);

    const [profileForm, setProfileForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
    });

    const [showPhotoDropdown, setShowPhotoDropdown] = useState(false);
    const photoDropdownRef = useRef(null);

    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    useEffect(() => {
        if (user) {
            setProfileForm({
                first_name: user.first_name || user.name?.split(' ')[0] || '',
                last_name: user.last_name || user.name?.split(' ')[1] || '',
                email: user.email || '',
                phone: user.phone || ''
            });
            fetchProfilePhoto();
        }

        const handleClickOutside = (event) => {
            if (photoDropdownRef.current && !photoDropdownRef.current.contains(event.target)) {
                setShowPhotoDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            if (profilePhotoUrl) URL.revokeObjectURL(profilePhotoUrl);
        };
    }, [user]);

    useEffect(() => {
    if (user?.active_organization_id) {
        api.get(`/organizations/${user.active_organization_id}`)
            .then(res => {
                const org = res.data?.organization || res.data || res;
                setOrgName(org.name);
            })
            .catch(() => {});
    }
}, [user]);

    const fetchProfilePhoto = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile-photo`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const blob = await res.blob();
                if (blob.size > 0 && blob.type.startsWith('image/')) {
                    const url = URL.createObjectURL(blob);
                    if (profilePhotoUrl) URL.revokeObjectURL(profilePhotoUrl);
                    setProfilePhotoUrl(url);
                }
            } else if (res.status !== 404) {
                console.error('Profile: Failed to fetch photo', res.statusText);
            }
        } catch (error) {
            console.error('Failed to fetch profile photo', error);
        }
    };

    const handleProfileChange = (e) => {
        setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        try {
            const res = await api.put('/auth/profile', profileForm);
            if (res.status === 'success' || res.success) {
                showToast('Profile updated successfully', 'success');
                const updatedData = res.data?.user || res.data || profileForm;
                const updatedUser = {
                    ...user,
                    ...updatedData,
                    name: `${updatedData.first_name} ${updatedData.last_name}`
                };
                setUser(updatedUser);
            }
        } catch (error) {
            showToast(error.message || 'Failed to update profile', 'error');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            showToast('New passwords do not match', 'error');
            return;
        }

        setPasswordLoading(true);
        try {
            const res = await api.put('/auth/password', {
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password
            });
            if (res.status === 'success' || res.success) {
                showToast('Password changed successfully', 'success');
                setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
            }
        } catch (error) {
            showToast(error.message || 'Failed to change password', 'error');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handlePhotoRemove = async () => {
        if (!window.confirm('Are you sure you want to remove your profile photo?')) return;

        setPhotoLoading(true);
        try {
            const res = await api.delete('/auth/profile-photo');
            if (res.status === 'success' || res.success) {
                showToast('Profile photo removed', 'success');
                if (profilePhotoUrl) URL.revokeObjectURL(profilePhotoUrl);
                setProfilePhotoUrl(null);

                const meRes = await api.get('/auth/me');
                if (meRes.status === 'success' || meRes.success) {
                    const userData = meRes.data?.user || meRes.data || meRes.user;
                    setUser({ ...user, ...userData, _photoUpdate: Date.now() });
                }
            }
        } catch (error) {
            showToast(error.message || 'Failed to remove photo', 'error');
        } finally {
            setPhotoLoading(false);
        }
    };

    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast('Image size must be less than 5MB', 'error');
            return;
        }

        const url = URL.createObjectURL(file);
        setTempPhotoUrl(url);
        setCropModalOpen(true);
        e.target.value = '';
    };

    const handlePhotoUpload = async (croppedBlob) => {
        const formData = new FormData();
        formData.append('photo', croppedBlob, 'profile-photo.jpg');

        setPhotoLoading(true);
        try {
            const res = await api.post('/auth/profile-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.status === 'success' || res.success) {
                showToast('Profile photo updated', 'success');
                const meRes = await api.get('/auth/me');
                if (meRes.status === 'success' || meRes.success) {
                    const userData = meRes.data?.user || meRes.data || meRes.user;
                    setUser({ ...user, ...userData, _photoUpdate: Date.now() });
                }
                fetchProfilePhoto();
            }
        } catch (error) {
            showToast(error.message || 'Failed to upload photo', 'error');
        } finally {
            setPhotoLoading(false);
            if (tempPhotoUrl) {
                URL.revokeObjectURL(tempPhotoUrl);
                setTempPhotoUrl(null);
            }
        }
    };

    const initials = (user?.first_name?.charAt(0) || user?.name?.charAt(0) || 'U').toUpperCase();

    return (
        <div className={styles.page}>
            {/* ── Profile Header Section ── */}
            <div className={styles.profileHeader}>
                <div className={styles.headerInner}>

                    {/* Large Avatar — overlaps card from left */}
                    <div className={styles.avatarWrap}>
                        {photoLoading ? (
                            <div className={styles.avatarFallback} style={{ background: 'var(--neutral-100)', color: 'var(--neutral-400)' }}>
                                <Loader2 size={32} className="animate-spin" />
                            </div>
                        ) : profilePhotoUrl ? (
                            <img src={profilePhotoUrl} alt="Profile" className={styles.avatar} />
                        ) : (
                            <div className={styles.avatarFallback}>{initials}</div>
                        )}

                        <div className={styles.avatarActions} ref={photoDropdownRef}>
                            <button
                                className={`${styles.avatarBtn} ${showPhotoDropdown ? styles.avatarBtnActive : ''}`}
                                onClick={() => setShowPhotoDropdown(!showPhotoDropdown)}
                                title="Edit photo"
                                disabled={photoLoading}
                            >
                                <Camera size={18} />
                            </button>

                            {showPhotoDropdown && (
                                <div className={styles.photoDropdown}>
                                    <button
                                        className={styles.photoDropdownItem}
                                        onClick={() => {
                                            fileInputRef.current.click();
                                            setShowPhotoDropdown(false);
                                        }}
                                    >
                                        <Camera size={14} />
                                        <span>Change Photo</span>
                                    </button>
                                    {profilePhotoUrl && (
                                        <button
                                            className={`${styles.photoDropdownItem} ${styles.photoRemoveItem}`}
                                            onClick={() => {
                                                handlePhotoRemove();
                                                setShowPhotoDropdown(false);
                                            }}
                                        >
                                            <Trash2 size={14} />
                                            <span>Remove Photo</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoSelect}
                            style={{ display: 'none' }}
                            accept="image/*"
                        />
                    </div>

                    {/* Info Card */}
                    <div className={styles.headerInfo}>
                        <h1 className={styles.headerName}>
                            {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.name || 'User'}
                        </h1>
                        <div className={styles.headerMeta}>
                            <div className={styles.orgSection}>
                                <Building2 size={16} className={styles.metaIcon} />
                                <span className={styles.orgName}>
    {localStorage.getItem('impersonated_org_name') || orgName || 'Organization'}
</span>
                            </div>
                            <div className={styles.statusBadges}>
    <span className={styles.roleText}>
        <span className={styles.roleDot} />
        {user?.roles?.[0]?.name || user?.organization_type || 'User'}
    </span>
    <span className={styles.roleBadge} style={{ background: 'var(--success-bg)', color: 'var(--success)', borderColor: 'transparent' }}>
        <span className={styles.statusDot} />
        Active
    </span>
</div>
                        </div>
                    </div>

                </div>
            </div>

            <PhotoCropModal
                isOpen={cropModalOpen}
                onClose={() => setCropModalOpen(false)}
                image={tempPhotoUrl}
                onCropComplete={handlePhotoUpload}
            />

            {/* ── Content Sections ── */}
            <div className={styles.sections}>
                {/* Personal Information */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={`${styles.cardIcon} ${styles.cardIconPrimary}`}>
                            <User size={18} />
                        </div>
                        <div>
                            <h2 className={styles.cardTitle}>Personal Information</h2>
                            <p className={styles.cardSubtitle}>Update your name, email, and phone number</p>
                        </div>
                    </div>

                    <form onSubmit={handleProfileSubmit}>
                        <div className={styles.cardBody}>
                            <div className={styles.formGrid}>
                                <div className={styles.field}>
                                    <label className={styles.fieldLabel}>First Name</label>
                                    <div className={styles.inputWrap}>
                                        <User size={16} className={styles.inputIcon} />
                                        <input
                                            type="text"
                                            name="first_name"
                                            className={styles.input}
                                            value={profileForm.first_name}
                                            onChange={handleProfileChange}
                                            required
                                            placeholder="John"
                                        />
                                    </div>
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.fieldLabel}>Last Name</label>
                                    <div className={styles.inputWrap}>
                                        <User size={16} className={styles.inputIcon} />
                                        <input
                                            type="text"
                                            name="last_name"
                                            className={styles.input}
                                            value={profileForm.last_name}
                                            onChange={handleProfileChange}
                                            required
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.fieldLabel}>Email Address</label>
                                    <div className={styles.inputWrap}>
                                        <Mail size={16} className={styles.inputIcon} />
                                        <input
                                            type="email"
                                            name="email"
                                            className={styles.input}
                                            value={profileForm.email}
                                            onChange={handleProfileChange}
                                            required
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.fieldLabel}>Phone Number</label>
                                    <div className={styles.inputWrap}>
                                        <Phone size={16} className={styles.inputIcon} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            className={styles.input}
                                            value={profileForm.phone}
                                            onChange={handleProfileChange}
                                            placeholder="+91 00000 00000"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.cardFooter}>
                            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={profileLoading}>
                                {profileLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>

                {/* Security & Password */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={`${styles.cardIcon} ${styles.cardIconGreen}`}>
                            <Lock size={18} />
                        </div>
                        <div>
                            <h2 className={styles.cardTitle}>Security & Password</h2>
                            <p className={styles.cardSubtitle}>Change your password to keep your account secure</p>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordSubmit}>
                        <div className={styles.cardBody}>
                            <div className={styles.formGrid}>
                                <div className={styles.field} style={{ gridColumn: '1 / -1', maxWidth: 440 }}>
                                    <label className={styles.fieldLabel}>Current Password</label>
                                    <div className={styles.inputWrap}>
                                        <KeyRound size={16} className={styles.inputIcon} />
                                        <input
                                            type="password"
                                            name="current_password"
                                            className={styles.input}
                                            value={passwordForm.current_password}
                                            onChange={handlePasswordChange}
                                            required
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.fieldLabel}>New Password</label>
                                    <div className={styles.inputWrap}>
                                        <Lock size={16} className={styles.inputIcon} />
                                        <input
                                            type="password"
                                            name="new_password"
                                            className={styles.input}
                                            value={passwordForm.new_password}
                                            onChange={handlePasswordChange}
                                            required
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.fieldLabel}>Confirm New Password</label>
                                    <div className={styles.inputWrap}>
                                        <Lock size={16} className={styles.inputIcon} />
                                        <input
                                            type="password"
                                            name="confirm_password"
                                            className={styles.input}
                                            value={passwordForm.confirm_password}
                                            onChange={handlePasswordChange}
                                            required
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.cardFooter}>
                            <button type="submit" className={`${styles.btn} ${styles.btnSuccess}`} disabled={passwordLoading}>
                                {passwordLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;