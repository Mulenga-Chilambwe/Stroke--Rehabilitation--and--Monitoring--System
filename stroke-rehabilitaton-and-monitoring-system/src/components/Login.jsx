/**
 * components/Login.jsx
 * ─────────────────────────────────────────────────────────────
 * Full-page login / registration screen for all three roles.
 * Features role-selection cards, demo auto-fill, background
 * image carousel, and a registration form with doctor selection.
 * ─────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

const LOGIN_BACKGROUNDS = [
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1800&q=88',
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1800&q=88',
  'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1800&q=88',
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1800&q=88',
];

const ROLE_INFO = {
  patient: {
    label: 'Patient',
    desc: 'Follow assigned exercises, log sessions, track recovery progress.',
    hint: 'mercy@patient.zm / patient123',
  },
  caregiver: {
    label: 'Caregiver',
    desc: 'Record vitals, monitor activity, support daily rehabilitation.',
    hint: 'john@caregiver.zm / caregiver123',
  },
  hp: {
    label: 'Health Professional',
    desc: 'Manage care plans, review recovery data, coordinate communication.',
    hint: 'kumaran@cbu.ac.zm / doctor123',
  },
};

const ROLE_CREDS = {
  patient: { email: 'mercy@patient.zm', password: 'patient123' },
  caregiver: { email: 'john@caregiver.zm', password: 'caregiver123' },
  hp: { email: 'kumaran@cbu.ac.zm', password: 'doctor123' },
};

const FIELD_STYLE = {
  width: '100%',
  height: 44,
  padding: '0 13px',
  borderRadius: 8,
  border: '1px solid #d5e1df',
  background: '#ffffff',
  color: '#172a2f',
  fontSize: '0.92rem',
};

const createPatientProfile = ({ user, caregiver, doctor }) => ({
  id: user.patientId,
  name: user.name,
  avatar: user.avatar,
  age: 0,
  condition: 'Stroke Rehabilitation',
  admitDate: 'New patient',
  rehabStart: 'Today',
  progress: 0,
  streak: 0,
  totalSessions: 0,
  targetSessions: 30,
  risk: 'moderate',
  focus: ['Hand and wrist', 'Balance'],
  caregiverId: user.caregiverId,
  doctorId: user.doctorId,
  caregiverEmail: caregiver?.email || '',
  doctorName: doctor?.name || 'Selected doctor',
});

const Login = () => {
  const { getAvailableDoctors, login, register } = useAuth();
  const [state, dispatch] = useStore();

  const [mode, setMode] = useState('login');
  const [bgIndex, setBgIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState(() =>
    state.doctors.filter((doctor) => doctor.isAvailable !== false)
  );
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    caregiverEmail: '',
    doctorId: '',
  });

  useEffect(() => {
    const rotation = setInterval(() => {
      setBgIndex((current) => (current + 1) % LOGIN_BACKGROUNDS.length);
    }, 7000);

    return () => clearInterval(rotation);
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadDoctors = async () => {
      const result = await getAvailableDoctors();
      if (ignore) return;

      if (result.ok && result.doctors.length > 0) {
        setAvailableDoctors(result.doctors);
        setRegisterForm((current) => ({
          ...current,
          doctorId: current.doctorId || result.doctors[0].id,
        }));
        return;
      }

      const localDoctors = state.doctors.filter((doctor) => doctor.isAvailable !== false);
      setAvailableDoctors(localDoctors);
      setRegisterForm((current) => ({
        ...current,
        doctorId: current.doctorId || localDoctors[0]?.id || '',
      }));
    };

    loadDoctors();
    return () => {
      ignore = true;
    };
  }, [getAvailableDoctors, state.doctors]);

  const selectRole = (role) => {
    setMode('login');
    setSelected(role);
    setLoginForm(ROLE_CREDS[role]);
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await login(loginForm.email.trim().toLowerCase(), loginForm.password);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message || 'Invalid email or password. Select a demo profile or register a new account.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const name = registerForm.name.trim();
    const email = registerForm.email.trim().toLowerCase();

    if (!name || !email || !registerForm.password) {
      setError('Please complete all required fields.');
      return;
    }

    if (registerForm.role === 'patient') {
      if (!registerForm.caregiverEmail.trim()) {
        setError('Please enter the registered caregiver email.');
        return;
      }

      if (!registerForm.doctorId) {
        setError('Please select one available doctor.');
        return;
      }
    }

    if (registerForm.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      name,
      email,
      password: registerForm.password,
      role: registerForm.role,
      caregiverEmail: registerForm.caregiverEmail.trim().toLowerCase(),
      doctorId: registerForm.doctorId,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    const createdUser = result.user;
    dispatch((s) => {
      if (createdUser.role === 'hp') {
        const doctorExists = s.doctors.some((doctor) => doctor.id === createdUser.doctorId);
        return {
          ...s,
          doctors: doctorExists
            ? s.doctors
            : [
                ...s.doctors,
                {
                  id: createdUser.doctorId,
                  name: createdUser.name,
                  title: 'Rehabilitation Specialist',
                  institution: 'StrokeRehab Portal',
                  email: createdUser.email,
                  isAvailable: createdUser.isAvailable,
                },
              ],
        };
      }

      if (createdUser.role !== 'patient') return s;

      const caregiverEmail = registerForm.caregiverEmail.trim().toLowerCase();
      const caregiver = {
        id: createdUser.caregiverId,
        name: caregiverEmail.split('@')[0],
        relation: 'Caregiver',
        phone: '',
        email: caregiverEmail,
        patientId: createdUser.patientId,
        doctorId: createdUser.doctorId,
      };
      const doctor = s.doctors.find((item) => item.id === createdUser.doctorId);
      const patient = createPatientProfile({ user: createdUser, caregiver, doctor });

      return {
        ...s,
        patients: s.patients.some((item) => item.id === createdUser.patientId)
          ? s.patients
          : [...s.patients, patient],
        caregivers: s.caregivers.some((item) => item.id === caregiver.id)
          ? s.caregivers.map((item) => (item.id === caregiver.id ? { ...item, ...caregiver } : item))
          : [...s.caregivers, caregiver],
        assignments: {
          ...s.assignments,
          [createdUser.patientId]: s.assignments[createdUser.patientId] || [],
        },
        vitals: {
          ...s.vitals,
          [createdUser.patientId]: s.vitals[createdUser.patientId] || {
            heartRate: 0,
            bp: '-',
            temp: 0,
            oxygenSat: 0,
            weight: 0,
            mood: 'New',
            sleep: 0,
            lastUpdated: 'Not logged yet',
            loggedBy: 'No caregiver entry yet',
          },
        },
        medications: {
          ...s.medications,
          [createdUser.patientId]: s.medications[createdUser.patientId] || [],
        },
        nextSession: {
          ...s.nextSession,
          [createdUser.patientId]: s.nextSession[createdUser.patientId] || null,
        },
      };
    });
  };

  const updateLogin = (field, value) => {
    setLoginForm((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const updateRegister = (field, value) => {
    setRegisterForm((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const patientRegistering = registerForm.role === 'patient';
  const filteredDoctors = availableDoctors.filter((doctor) => doctor.isAvailable !== false);

  return (
    <main className="auth-page">
      <style>{`
        .auth-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          font-family: var(--font-body, 'DM Sans', system-ui, sans-serif);
          color: #ffffff;
          background: #071513;
        }
        .auth-bg {
          position: fixed;
          inset: 0;
          background-position: center;
          background-size: cover;
          opacity: 0;
          transform: scale(1.01);
          transition: opacity 1.2s ease, transform 7s ease;
        }
        .auth-bg.active {
          opacity: 1;
          transform: scale(1.035);
        }
        .auth-overlay {
          position: fixed;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(5,20,20,.72), rgba(7,30,36,.42) 42%, rgba(7,15,34,.56)),
            linear-gradient(180deg, rgba(0,0,0,.14), rgba(0,0,0,.5));
        }
        .page-content {
          width: min(1180px, calc(100% - 44px));
          margin: 0 auto;
          position: relative;
          z-index: 1;
          padding: 22px 0 34px;
        }
        .topbar {
          min-height: 62px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #fff;
        }
        .brand-logo {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: rgba(255,255,255,.18);
          border: 1px solid rgba(255,255,255,.24);
          font-weight: 900;
        }
        .brand strong {
          display: block;
          font-size: 1rem;
        }
        .brand span {
          display: block;
          margin-top: 2px;
          color: rgba(255,255,255,.68);
          font-size: .76rem;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 18px;
          color: rgba(255,255,255,.74);
          font-size: .84rem;
          font-weight: 700;
        }
        .nav-pill {
          padding: 9px 13px;
          border: 1px solid rgba(255,255,255,.22);
          border-radius: 999px;
          background: rgba(255,255,255,.1);
          color: #fff;
        }
        .hero {
          min-height: calc(100vh - 118px);
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) 430px;
          align-items: center;
          gap: 42px;
          padding: 34px 0 42px;
        }
        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 11px;
          border-radius: 999px;
          color: #fff;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.18);
          font-size: .78rem;
          font-weight: 800;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 99px;
          background: #22a06b;
          box-shadow: 0 0 0 5px rgba(34,160,107,.18);
        }
        .hero-copy h1 {
          max-width: 720px;
          margin-top: 22px;
          font-family: var(--font-display, Georgia, serif);
          font-size: clamp(3rem, 6vw, 5.8rem);
          line-height: .93;
          font-weight: 500;
          letter-spacing: 0;
          text-shadow: 0 18px 50px rgba(0,0,0,.38);
        }
        .hero-copy p {
          max-width: 610px;
          margin-top: 22px;
          color: rgba(255,255,255,.8);
          font-size: 1.04rem;
          line-height: 1.75;
        }
        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 28px;
        }
        .hero-btn {
          min-height: 43px;
          padding: 0 17px;
          border: 0;
          border-radius: 8px;
          font-weight: 850;
          color: #10282c;
          background: #fff;
        }
        .hero-btn.secondary {
          color: #fff;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.22);
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          max-width: 650px;
          margin-top: 34px;
        }
        .stat {
          padding: 17px;
          border-radius: 10px;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.17);
          backdrop-filter: blur(8px);
        }
        .stat strong {
          display: block;
          font-size: 1.35rem;
          color: #fff;
        }
        .stat span {
          display: block;
          margin-top: 5px;
          color: rgba(255,255,255,.67);
          font-size: .78rem;
        }
        .auth-panel {
          align-self: start;
          margin-top: 12px;
          padding: 26px;
          color: #172a2f;
          border-radius: 14px;
          background: rgba(255,255,255,.94);
          box-shadow: 0 34px 90px rgba(0,0,0,.34);
          border: 1px solid rgba(255,255,255,.62);
        }
        .auth-card h2 {
          font-family: var(--font-display, Georgia, serif);
          font-size: 2rem;
          font-weight: 500;
          color: #10282c;
        }
        .auth-card p {
          margin-top: 6px;
          color: #65787c;
          font-size: .9rem;
          line-height: 1.55;
        }
        .mode-switch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin: 22px 0;
          padding: 5px;
          border-radius: 10px;
          background: #eaf1f0;
        }
        .mode-switch button {
          height: 38px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #63777a;
          font-weight: 800;
        }
        .mode-switch button.active {
          background: #fff;
          color: #115c54;
          box-shadow: 0 6px 18px rgba(15,45,52,.1);
        }
        .auth-form {
          display: grid;
          gap: 13px;
        }
        .field-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .field label {
          display: block;
          margin-bottom: 6px;
          color: #52666a;
          font-size: .76rem;
          font-weight: 800;
        }
        .field input:focus,
        .field select:focus {
          outline: none;
          border-color: #1a7f74 !important;
          box-shadow: 0 0 0 3px rgba(26,127,116,.14);
        }
        .submit-btn {
          height: 44px;
          margin-top: 3px;
          border: 0;
          border-radius: 8px;
          background: #f59e42;
          color: #fff;
          font-size: .94rem;
          font-weight: 900;
          transition: transform .18s ease, background .18s ease, box-shadow .18s ease;
        }
        .submit-btn:hover {
          background: #d97706;
          transform: translateY(-1px);
          box-shadow: 0 14px 28px rgba(217,119,6,.25);
        }
        .error-box {
          padding: 10px 12px;
          border-radius: 8px;
          color: #9b1c1c;
          background: #fff0f0;
          border: 1px solid #ffd1d1;
          font-size: .8rem;
        }
        .demo-list {
          margin-top: 17px;
          padding-top: 15px;
          border-top: 1px solid #dde8e6;
          color: #6d7f83;
          font-size: .74rem;
          line-height: 1.75;
        }
        .role-section,
        .standard-section {
          margin-top: 18px;
          padding: 24px;
          border-radius: 14px;
          background: rgba(255,255,255,.92);
          color: #172a2f;
          box-shadow: 0 20px 56px rgba(0,0,0,.18);
        }
        .section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 18px;
        }
        .section-heading h2 {
          font-family: var(--font-display, Georgia, serif);
          font-size: 1.8rem;
          font-weight: 500;
          color: #10282c;
        }
        .section-heading p {
          max-width: 500px;
          color: #65787c;
          font-size: .9rem;
          line-height: 1.6;
        }
        .role-grid,
        .standard-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 13px;
        }
        .role-card,
        .standard-card {
          min-height: 132px;
          padding: 17px;
          text-align: left;
          border-radius: 10px;
          border: 1px solid #dce8e6;
          background: #fff;
          color: #172a2f;
          transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
        }
        .role-card:hover {
          transform: translateY(-2px);
          border-color: #f59e42;
          box-shadow: 0 14px 34px rgba(20,60,70,.1);
        }
        .role-card.active {
          border-color: #f59e42;
          box-shadow: 0 0 0 3px rgba(245,158,66,.16);
        }
        .role-card strong,
        .standard-card strong {
          display: block;
          color: #10282c;
          font-size: .94rem;
          margin-bottom: 8px;
        }
        .role-card span,
        .standard-card span {
          display: block;
          color: #65787c;
          font-size: .8rem;
          line-height: 1.55;
        }
        .footer-line {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          padding: 22px 2px 4px;
          color: rgba(255,255,255,.72);
          font-size: .78rem;
        }
        @media (max-width: 980px) {
          .hero {
            grid-template-columns: 1fr;
            gap: 28px;
            padding-top: 24px;
          }
          .auth-panel {
            width: min(520px, 100%);
            margin-top: 0;
          }
          .nav-links {
            display: none;
          }
        }
        @media (max-width: 720px) {
          .page-content {
            width: min(100% - 28px, 1180px);
            padding-top: 14px;
          }
          .hero-copy h1 {
            font-size: clamp(2.7rem, 15vw, 4.4rem);
          }
          .hero-copy p {
            font-size: .96rem;
          }
          .stats-row,
          .role-grid,
          .standard-grid,
          .field-grid {
            grid-template-columns: 1fr;
          }
          .section-heading {
            display: block;
          }
          .section-heading p {
            margin-top: 8px;
          }
          .auth-panel,
          .role-section,
          .standard-section {
            padding: 20px;
          }
          .footer-line {
            display: block;
          }
          .footer-line span {
            display: block;
            margin-top: 7px;
          }
        }
      `}</style>

      {LOGIN_BACKGROUNDS.map((image, index) => (
        <div
          key={image}
          className={`auth-bg ${index === bgIndex ? 'active' : ''}`}
          style={{ backgroundImage: `url(${image})` }}
          aria-hidden="true"
        />
      ))}
      <div className="auth-overlay" aria-hidden="true" />

      <div className="page-content">
        <header className="topbar">
          <div className="brand">
            <div className="brand-logo">SR</div>
            <div>
              <strong>StrokeRehab Portal</strong>
              <span>Copperbelt University</span>
            </div>
          </div>
          <nav className="nav-links" aria-label="Landing page">
            <span>Recovery Tracking</span>
            <span>Care Coordination</span>
            <span className="nav-pill">Secure Demo Access</span>
          </nav>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" />
              Rehabilitation and monitoring system
            </div>
            <h1>Care connected around every recovery milestone.</h1>
            <p>
              A professional stroke rehabilitation workspace that brings patients,
              caregivers, and clinicians into one shared view of exercises, vitals,
              progress, and communication.
            </p>
            <div className="hero-actions">
              <button
                type="button"
                className="hero-btn"
                onClick={() => selectRole('patient')}
              >
                Try Patient Demo
              </button>
              <button
                type="button"
                className="hero-btn secondary"
                onClick={() => setMode('register')}
              >
                Register New Account
              </button>
            </div>
            <div className="stats-row">
              <div className="stat">
                <strong>3</strong>
                <span>dedicated portals</span>
              </div>
              <div className="stat">
                <strong>Live</strong>
                <span>progress visibility</span>
              </div>
              <div className="stat">
                <strong>One</strong>
                <span>coordinated care record</span>
              </div>
            </div>
          </div>

          <aside className="auth-panel" aria-label="Authentication">
            <div className="auth-card">
              <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
              <p>
                {mode === 'login'
                  ? 'Sign in or select a demo profile to open the right portal instantly.'
                  : 'Create a profile and enter the workspace for your recovery role.'}
              </p>

              <div className="mode-switch" role="tablist" aria-label="Authentication mode">
                <button
                  type="button"
                  className={mode === 'login' ? 'active' : ''}
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={mode === 'register' ? 'active' : ''}
                  onClick={() => {
                    setMode('register');
                    setSelected(null);
                    setError('');
                  }}
                >
                  Register
                </button>
              </div>

              {mode === 'login' ? (
                <form className="auth-form" onSubmit={handleLogin}>
                  <div className="field">
                    <label htmlFor="login-email">Email</label>
                    <input
                      id="login-email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => updateLogin('email', e.target.value)}
                      placeholder="your@email.com"
                      style={FIELD_STYLE}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="login-password">Password</label>
                    <input
                      id="login-password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => updateLogin('password', e.target.value)}
                      placeholder="Enter password"
                      style={FIELD_STYLE}
                    />
                  </div>
                  {error && <div className="error-box">{error}</div>}
                  <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>
              ) : (
                <form className="auth-form" onSubmit={handleRegister}>
                  <div className="field">
                    <label htmlFor="register-name">Full Name</label>
                    <input
                      id="register-name"
                      type="text"
                      value={registerForm.name}
                      onChange={(e) => updateRegister('name', e.target.value)}
                      placeholder="Enter full name"
                      style={FIELD_STYLE}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="register-email">Email</label>
                    <input
                      id="register-email"
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => updateRegister('email', e.target.value)}
                      placeholder="your@email.com"
                      style={FIELD_STYLE}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="register-role">Role</label>
                    <select
                      id="register-role"
                      value={registerForm.role}
                      onChange={(e) =>
                        setRegisterForm((current) => ({
                          ...current,
                          role: e.target.value,
                          doctorId: e.target.value === 'patient' ? current.doctorId || filteredDoctors[0]?.id || '' : current.doctorId,
                        }))
                      }
                      style={FIELD_STYLE}
                    >
                      <option value="patient">Patient</option>
                      <option value="caregiver">Caregiver</option>
                      <option value="hp">Health Professional</option>
                    </select>
                  </div>
                  {patientRegistering && (
                    <>
                      <div className="field">
                        <label htmlFor="register-caregiver-email">Caregiver Email</label>
                        <input
                          id="register-caregiver-email"
                          type="email"
                          value={registerForm.caregiverEmail}
                          onChange={(e) => updateRegister('caregiverEmail', e.target.value)}
                          placeholder="registered caregiver@email.com"
                          style={FIELD_STYLE}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="register-doctor">Available Doctor</label>
                        <select
                          id="register-doctor"
                          value={registerForm.doctorId}
                          onChange={(e) => updateRegister('doctorId', e.target.value)}
                          style={FIELD_STYLE}
                          disabled={filteredDoctors.length === 0}
                        >
                          {filteredDoctors.length === 0 ? (
                            <option value="">No doctors available</option>
                          ) : (
                            filteredDoctors.map((doctor) => (
                              <option key={doctor.id} value={doctor.id}>
                                {doctor.name}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    </>
                  )}
                  <div className="field-grid">
                    <div className="field">
                      <label htmlFor="register-password">Password</label>
                      <input
                        id="register-password"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => updateRegister('password', e.target.value)}
                        placeholder="At least 6 characters"
                        style={FIELD_STYLE}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="register-confirm-password">Confirm Password</label>
                      <input
                        id="register-confirm-password"
                        type="password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => updateRegister('confirmPassword', e.target.value)}
                        placeholder="Repeat password"
                        style={FIELD_STYLE}
                      />
                    </div>
                  </div>
                  {error && <div className="error-box">{error}</div>}
                  <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>
              )}

              <div className="demo-list">
                {Object.entries(ROLE_INFO).map(([role, info]) => (
                  <div key={role}>
                    <strong>{info.label}:</strong> {info.hint}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="role-section">
          <div className="section-heading">
            <h2>Built for the whole care team</h2>
            <p>
              Select a role to auto-fill demo access, or register to create a
              new in-memory account for testing the portal.
            </p>
          </div>
          <div className="role-grid">
            {Object.entries(ROLE_INFO).map(([role, info]) => (
              <button
                key={role}
                type="button"
                className={`role-card ${selected === role ? 'active' : ''}`}
                onClick={() => selectRole(role)}
              >
                <strong>{info.label}</strong>
                <span>{info.desc}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="standard-section">
          <div className="section-heading">
            <h2>What matters most</h2>
            <p>
              The first screen now focuses on credibility, clarity, and fast
              access to the actual rehabilitation workflows.
            </p>
          </div>
          <div className="standard-grid">
            <div className="standard-card">
              <strong>Progress clarity</strong>
              <span>Exercise completion, patient activity, vitals, and recovery trends stay visible.</span>
            </div>
            <div className="standard-card">
              <strong>Role-based focus</strong>
              <span>Patients, caregivers, and clinicians each see the workspace designed for them.</span>
            </div>
            <div className="standard-card">
              <strong>Care coordination</strong>
              <span>Messaging and shared records reduce gaps between home support and clinical review.</span>
            </div>
          </div>
        </section>

        <footer className="footer-line">
          <strong>StrokeRehab Portal</strong>
          <span>Rehabilitation and Monitoring System</span>
        </footer>
      </div>
    </main>
  );
};

export default Login;
