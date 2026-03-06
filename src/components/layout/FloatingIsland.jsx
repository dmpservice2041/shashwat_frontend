import { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './FloatingIsland.module.css';

const FloatingIsland = () => {
    const { user, impersonatingOrg, exitImpersonation, logout } = useAuth();
    const navigate = useNavigate();
    const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchPhoto = async () => {
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
                    console.error('FloatingIsland: Failed to fetch photo', res.statusText);
                }
            } catch (err) {
                console.error('FloatingIsland: Failed to fetch photo', err);
            }
        };

        if (user) fetchPhoto();

        return () => {
            if (profilePhotoUrl) URL.revokeObjectURL(profilePhotoUrl);
        };
    }, [user]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleProfileClick = () => {
        setShowDropdown(!showDropdown);
    };

    const handleNavigate = (path) => {
        navigate(path);
        setShowDropdown(false);
    };

    const handleLogout = () => {
        logout();
        setShowDropdown(false);
        navigate('/login');
    };

    return (
        <div className={styles.islandContainer}>
            <div className={styles.islandInner}>
                {/* Search Section */}
                <div className={styles.searchSection}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search records..."
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.divider}></div>

                {/* Actions Section */}
                <div className={styles.actionsSection}>
                    {impersonatingOrg && (
                        <div className={styles.impersonationBadge}>
                            <span>{impersonatingOrg}</span>
                            <button onClick={exitImpersonation} className={styles.exitBtn}>
                                <LogOut size={12} />
                            </button>
                        </div>
                    )}

                    <button className={styles.iconBtn} aria-label="Notifications">
                        <Bell size={20} />
                        <span className={styles.notificationDot}></span>
                    </button>

                    <div className={styles.profileWrapper} ref={dropdownRef}>
                        <div
                            className={`${styles.userProfile} ${showDropdown ? styles.active : ''}`}
                            onClick={handleProfileClick}
                        >
                            <div className={styles.avatar}>
                                {profilePhotoUrl ? (
                                    <img src={profilePhotoUrl} alt="Me" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                                )}
                            </div>
                        </div>

                        {showDropdown && (
                            <div className={styles.dropdownMenu}>
                                <button className={styles.dropdownItem} onClick={() => handleNavigate('/profile')}>
                                    <User size={16} /> Profile
                                </button>
                                <div className={styles.menuDivider}></div>
                                <button className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FloatingIsland;
