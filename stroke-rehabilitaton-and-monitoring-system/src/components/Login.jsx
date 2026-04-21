/**
 * components/Login.jsx
 * ─────────────────────────────────────────────────────────────
 * Full-screen login page.
 *
 * Features:
 *   • Three role-selector cards (Patient / Caregiver / HP)
 *     – clicking one auto-fills the credentials for quick demo
 *   • Email + password form with error feedback
 *   • Calls useAuth().login() on submit
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/* Credentials hint shown on each role card */
const ROLE_INFO = {
  patient: {
    label: 'Patient',
    emoji: '🧑‍🦽',
    desc: 'Access your personalised exercises, log sessions, and message your care team.',
    hint: 'mercy@patient.zm  /  patient123',
  },
  caregiver: {
    label: 'Caregiver',
    emoji: '🤝',
    desc: "Monitor your loved one's progress, log vitals, and liaise with the clinician.",
    hint: 'john@caregiver.zm  /  caregiver123',
  },
  hp: {
    label: 'Health Professional',
    emoji: '👨‍⚕️',
    desc: 'Manage the patient plan, view all recovery data, and communicate with the care team.',
    hint: 'kumaran@cbu.ac.zm  /  doctor123',
  },
};

const Login = () => {
  const { login, loginAsRole } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [selected, setSelected] = useState(null);
  const [error,    setError]    = useState('');

  /**
   * Quick-fill credentials from a role card.
   * Also highlights the selected card.
   */
  const selectRole = (role) => {
    const CREDS = {
      patient:   { email: 'mercy@patient.zm',  password: 'patient123' },
      caregiver: { email: 'john@caregiver.zm', password: 'caregiver123' },
      hp:        { email: 'kumaran@cbu.ac.zm', password: 'doctor123' },
    };
    setSelected(role);
    setEmail(CREDS[role].email);
    setPassword(CREDS[role].password);
    setError('');
  };

  /** Attempt login with current form values. */
  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = login(email, password);
    if (!ok) {
      setError('Invalid email or password. Click a role card to auto-fill.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #0d2b26 0%, #1a5c52 55%, #2a4a8a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif",
        padding: 20,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .login-root { animation: fadeUp .4s ease; }
        .role-card { transition: all .18s ease; }
        .role-card:hover { transform: translateY(-3px); }
        .role-card.active { border-color: #f59e42 !important; background: rgba(255,255,255,.16) !important; }
        .login-input { transition: border-color .2s; }
        .login-input:focus { outline: none; border-color: #f59e42 !important; }
        .login-btn { transition: background .18s; }
        .login-btn:hover { background: #d97706 !important; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 880 }} className="login-root">
        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 34 }}>
          <div
            style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'rgba(255,255,255,.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', margin: '0 auto 14px',
              border: '1.5px solid rgba(255,255,255,.2)',
            }}
          >
            💊
          </div>
          <h1
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '2.1rem',
              color: '#fff',
              marginBottom: 6,
            }}
          >
            StrokeRehab <span style={{ color: '#f59e42' }}>Portal</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '0.9rem' }}>
            Copperbelt University · Rehabilitation &amp; Monitoring System
          </p>
        </div>

        {/* ── Role selector cards ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14,
            marginBottom: 22,
          }}
        >
          {Object.entries(ROLE_INFO).map(([role, info]) => (
            <div
              key={role}
              className={`role-card ${selected === role ? 'active' : ''}`}
              onClick={() => selectRole(role)}
              style={{
                background:
                  selected === role
                    ? 'rgba(255,255,255,.15)'
                    : 'rgba(255,255,255,.07)',
                border: `2px solid ${
                  selected === role
                    ? '#f59e42'
                    : 'rgba(255,255,255,.12)'
                }`,
                borderRadius: 14,
                padding: '22px 18px',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>
                {info.emoji}
              </div>
              <div
                style={{
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.96rem',
                  marginBottom: 6,
                }}
              >
                {info.label}
              </div>
              <div
                style={{
                  color: 'rgba(255,255,255,.45)',
                  fontSize: '0.76rem',
                  lineHeight: 1.55,
                  marginBottom: 10,
                }}
              >
                {info.desc}
              </div>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: 'rgba(255,255,255,.3)',
                  fontStyle: 'italic',
                }}
              >
                🔑 {info.hint}
              </div>
            </div>
          ))}
        </div>

        {/* ── Login form ── */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'rgba(255,255,255,.09)',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,.12)',
            padding: '24px 28px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              marginBottom: 14,
            }}
          >
            {/* Email */}
            <div>
              <div
                style={{
                  fontSize: '0.74rem',
                  color: 'rgba(255,255,255,.5)',
                  fontWeight: 600,
                  marginBottom: 5,
                }}
              >
                Email
              </div>
              <input
                className="login-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1.5px solid rgba(255,255,255,.15)',
                  background: 'rgba(255,255,255,.08)',
                  color: '#fff',
                  fontSize: '0.87rem',
                }}
              />
            </div>

            {/* Password */}
            <div>
              <div
                style={{
                  fontSize: '0.74rem',
                  color: 'rgba(255,255,255,.5)',
                  fontWeight: 600,
                  marginBottom: 5,
                }}
              >
                Password
              </div>
              <input
                className="login-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1.5px solid rgba(255,255,255,.15)',
                  background: 'rgba(255,255,255,.08)',
                  color: '#fff',
                  fontSize: '0.87rem',
                }}
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                color: '#ff9090',
                fontSize: '0.8rem',
                marginBottom: 10,
              }}
            >
              ⚠ {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="login-btn"
            style={{
              width: '100%',
              padding: 11,
              borderRadius: 8,
              border: 'none',
              background: '#f59e42',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.93rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Sign In →
          </button>

          {/* Sync indicator */}
          <div
            style={{
              textAlign: 'center',
              marginTop: 12,
              fontSize: '0.74rem',
              color: 'rgba(255,255,255,.3)',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 7, height: 7,
                borderRadius: '50%',
                background: '#22a06b',
                animation: 'pulse 2s infinite',
                marginRight: 6,
              }}
            />
            Live sync enabled · Click a role card above to auto-fill credentials
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
