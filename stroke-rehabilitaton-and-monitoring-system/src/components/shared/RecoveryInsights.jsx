import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { getPatientIdForUser } from '../../utils/care';

const Bar = ({ label, value, max, color, height = 60 }) => {
  const h = Math.max(4, (value / Math.max(max, 1)) * height);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%', height }}>
        <div style={{ height: `${h}px`, width: '100%', borderRadius: '3px 3px 0 0', background: color || 'var(--clr-primary)', opacity: 0.85, transition: 'height 0.6s cubic-bezier(.4,0,.2,1)', minWidth: 12 }} />
      </div>
      <span style={{ fontSize: '.55rem', color: 'var(--clr-muted)', fontWeight: 600, textAlign: 'center' }}>{label}</span>
    </div>
  );
};

const TrendLine = ({ data = [], color = 'var(--clr-primary)', height = 40 }) => {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 100 / data.length;
  const points = data.map((v, i) => `${i * w},${height - (v / max) * height}`).join(' ');
  return (
    <svg width="100%" height={height} style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => (
        <circle key={i} cx={i * w} cy={height - (v / max) * height} r="3" fill={color} />
      ))}
    </svg>
  );
};

export const RecoveryInsights = ({ patientId: propPatientId, compact = false }) => {
  const { currentUser } = useAuth();
  const [state] = useStore();
  const patientId = propPatientId || getPatientIdForUser(currentUser) || 'p1';
  const patient = (state.patients || []).find((p) => p.id === patientId) || (state.patients || [])[0] || {};
  if (!patient?.name) return null;
  const sessions = (state.sessions || []).filter((s) => s.patientId === patientId);
  const vitals = (state.vitals || {})[patientId];
  const vitalHistory = (state.vitalHistory || []).filter((v) => v.patientId === patientId);
  const medications = (state.medications || {})[patientId] || [];
  const alerts = (state.alerts || []).filter((a) => a.patientId === patientId);

  const completed = sessions.filter((s) => s.completed).length;
  const painReports = sessions.filter((s) => s.pain > 0);
  const avgPain = painReports.length ? Math.round((painReports.reduce((s, r) => s + r.pain, 0) / painReports.length) * 10) / 10 : 0;
  const medsTaken = medications.filter((m) => m.takenToday).length;

  const last7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const daySessions = sessions.filter((s) => s.date === dateStr);
      return {
        label: d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2),
        value: daySessions.filter((s) => s.completed).length,
        date: dateStr,
      };
    });
  }, [sessions]);

  const vitalTrends = useMemo(() => {
    const sorted = [...vitalHistory].sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    return {
      heartRates: sorted.map((v) => v.heartRate || 0),
      oxygenSats: sorted.map((v) => v.oxygenSat || 0),
      dates: sorted.map((v) => v.date),
    };
  }, [vitalHistory]);

  const maxSessions = Math.max(...last7.map((d) => d.value), 1);

  if (compact) {
    return (
      <div className="card">
        <div className="card__header">
          <span className="card__title">Recovery Insights</span>
          <span className="badge badge--blue">Live</span>
        </div>
        <div className="card__body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'var(--clr-border-lt)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
              <div style={{ fontSize: '.65rem', color: 'var(--clr-muted)', fontWeight: 600 }}>Progress</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--clr-primary)' }}>{patient.progress}%</div>
            </div>
            <div style={{ background: 'var(--clr-border-lt)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
              <div style={{ fontSize: '.65rem', color: 'var(--clr-muted)', fontWeight: 600 }}>Streak</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{patient.streak} days</div>
            </div>
            <div style={{ background: 'var(--clr-border-lt)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
              <div style={{ fontSize: '.65rem', color: 'var(--clr-muted)', fontWeight: 600 }}>Sessions</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{completed}/{sessions.length}</div>
            </div>
            <div style={{ background: 'var(--clr-border-lt)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
              <div style={{ fontSize: '.65rem', color: 'var(--clr-muted)', fontWeight: 600 }}>Meds</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{medsTaken}/{medications.length}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card__header">
        <span className="card__title">Recovery Insights Dashboard</span>
        <div className="chip-row">
          <span className="badge badge--green">{patient.streak}-day streak</span>
          <span className={`badge ${patient.risk === 'low' ? 'badge--green' : patient.risk === 'moderate' ? 'badge--warn' : 'badge--red'}`}>
            {patient.risk} risk
          </span>
        </div>
      </div>
      <div className="card__body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', display: 'grid', placeItems: 'center', background: `conic-gradient(var(--clr-primary) ${patient.progress}%, var(--clr-border-lt) ${patient.progress}%)`, flexShrink: 0 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--clr-card)', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1 }}>{patient.progress}%</div>
                <div style={{ fontSize: '.55rem', color: 'var(--clr-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Recovery</div>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={{ fontSize: '.65rem', color: 'var(--clr-muted)', fontWeight: 600 }}>Condition</div>
              <div style={{ fontWeight: 700, fontSize: '.85rem' }}>{patient.condition}</div>
            </div>
            <div>
              <div style={{ fontSize: '.65rem', color: 'var(--clr-muted)', fontWeight: 600 }}>Rehab Since</div>
              <div style={{ fontWeight: 700, fontSize: '.85rem' }}>{patient.rehabStart}</div>
            </div>
            <div>
              <div style={{ fontSize: '.65rem', color: 'var(--clr-muted)', fontWeight: 600 }}>Sessions Done</div>
              <div style={{ fontWeight: 700, fontSize: '.85rem' }}>{patient.totalSessions} / {patient.targetSessions}</div>
            </div>
            <div>
              <div style={{ fontSize: '.65rem', color: 'var(--clr-muted)', fontWeight: 600 }}>Avg Pain</div>
              <div style={{ fontWeight: 700, fontSize: '.85rem' }}>{avgPain > 0 ? `${avgPain}/5` : 'None'}</div>
            </div>
          </div>
        </div>

        <div className="divider" />

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '.78rem', fontWeight: 700 }}>7-Day Activity</span>
            <span className="badge badge--blue">{completed} total</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 70, padding: '4px 0' }}>
            {last7.map((d) => (
              <Bar key={d.label} label={d.label} value={d.value} max={maxSessions} color="var(--clr-primary)" height={60} />
            ))}
          </div>
        </div>

        {vitalTrends.heartRates.length > 1 && (
          <>
            <div className="divider" />
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '.78rem', fontWeight: 700, marginBottom: 8 }}>Heart Rate Trend</div>
              <TrendLine data={vitalTrends.heartRates} color="var(--clr-danger)" height={40} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {vitalTrends.dates.slice(-5).map((d, i) => (
                  <span key={i} style={{ fontSize: '.55rem', color: 'var(--clr-muted)' }}>{d}</span>
                ))}
              </div>
            </div>
          </>
        )}

        {vitalTrends.oxygenSats.length > 1 && (
          <>
            <div className="divider" />
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '.78rem', fontWeight: 700, marginBottom: 8 }}>Oxygen Saturation Trend</div>
              <TrendLine data={vitalTrends.oxygenSats} color="var(--clr-success)" height={40} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {vitalTrends.dates.slice(-5).map((d, i) => (
                  <span key={i} style={{ fontSize: '.55rem', color: 'var(--clr-muted)' }}>{d}</span>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="divider" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: '.78rem', fontWeight: 700, marginBottom: 8 }}>Latest Vitals</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                ['Heart Rate', vitals?.heartRate ? `${vitals.heartRate} bpm` : '-'],
                ['Blood Pressure', vitals?.bp || '-'],
                ['Oxygen', vitals?.oxygenSat ? `${vitals.oxygenSat}%` : '-'],
                ['Temperature', vitals?.temp ? `${vitals.temp}°C` : '-'],
                ['Sleep', vitals?.sleep ? `${vitals.sleep}h` : '-'],
                ['Mood', vitals?.mood || '-'],
              ].map(([label, value]) => (
                <div key={label} style={{ background: 'var(--clr-border-lt)', borderRadius: 'var(--radius)', padding: '6px 10px' }}>
                  <div style={{ fontSize: '.6rem', color: 'var(--clr-muted)', fontWeight: 500 }}>{label}</div>
                  <div style={{ fontWeight: 700, fontSize: '.8rem', marginTop: 1 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '.78rem', fontWeight: 700, marginBottom: 8 }}>Alerts & Updates</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {alerts.length === 0 && <p className="text-muted text-sm">No recent alerts.</p>}
              {alerts.slice(-3).reverse().map((alert) => (
                <div key={alert.id} style={{ padding: '6px 10px', borderRadius: 'var(--radius)', background: alert.type === 'warning' ? '#fef3c7' : '#ecfdf5', fontSize: '.72rem', lineHeight: 1.4 }}>
                  {alert.msg}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecoveryInsights;
