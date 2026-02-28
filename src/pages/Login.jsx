import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await login(email, password);
            if (res.success) {
                navigate('/dashboard');
            } else {
                setError(res.message || 'Failed to login');
            }
        } catch (err) {
            setError('An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.backgroundShapes}>
                <div className={`${styles.shape} ${styles.shape1}`}></div>
                <div className={`${styles.shape} ${styles.shape2}`}></div>
                <div className={`${styles.shape} ${styles.shape3}`}></div>
            </div>

            <div className={`glass-panel ${styles.loginCard}`}>
                <div className={styles.logoSection}>
                    <div className={styles.iconWrapper}>
                        <ShieldCheck size={36} className={styles.logoIcon} />
                    </div>
                    <h1 className={styles.brandTitle}>Medic<span className="gradient-text">ERP</span></h1>
                    <p className={styles.brandSubtitle}>Secure distribution management platform</p>
                </div>

                <form onSubmit={handleLogin} className={styles.loginForm}>
                    {error && <div className={styles.errorMessage} style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '5px' }}>{error}</div>}
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel} htmlFor="email">Email Address</label>
                        <div className={styles.inputWrapper}>
                            <Mail className={styles.inputIcon} size={20} />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@medicerp.com"
                                required
                                className={styles.inputField}
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <div className={styles.labelRow}>
                            <label className={styles.inputLabel} htmlFor="password">Password</label>
                            <a href="#" className={styles.forgotPassword}>Forgot Password?</a>
                        </div>
                        <div className={styles.inputWrapper}>
                            <Lock className={styles.inputIcon} size={20} />
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className={styles.inputField}
                            />
                        </div>
                    </div>

                    <button type="submit" className={styles.loginButton} disabled={loading}>
                        <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                        {!loading && <ArrowRight size={20} className={styles.buttonIcon} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
