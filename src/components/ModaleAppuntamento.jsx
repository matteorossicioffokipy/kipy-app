import React from 'react';
import { useLang } from '../LanguageContext';

export default function ModaleAppuntamento({ formApp, setFormApp, onSalva, onAnnulla }) {
  const { t } = useLang();

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onAnnulla(); }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '24px',
        width: '100%',
        maxWidth: '360px',
        boxSizing: 'border-box',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        overflow: 'hidden',
      }}>

        <h3 style={{ margin: '0 0 20px', fontFamily: "'Baloo 2', sans-serif", fontSize: '18px', fontWeight: '800', color: '#1E293B' }}>
          {t('appt_title')}
        </h3>

        <div style={{ marginBottom: '14px' }}>
          <label style={lbl}>Titolo</label>
          <input style={inp} placeholder={t('appt_titleField')} value={formApp.titolo}
            onChange={e => setFormApp({ ...formApp, titolo: e.target.value })} />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={lbl}>Data</label>
            <input style={inp} type="date" value={formApp.data}
              onChange={e => setFormApp({ ...formApp, data: e.target.value })} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={lbl}>Ora</label>
            <input style={inp} type="time" value={formApp.ora}
              onChange={e => setFormApp({ ...formApp, ora: e.target.value })} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onAnnulla} style={cancelBtn}>{t('cancel')}</button>
          <button onClick={onSalva} style={saveBtn}>{t('save')}</button>
        </div>

      </div>
    </div>
  );
}

const lbl = { display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '6px', fontFamily: "'Baloo 2', sans-serif", textTransform: 'uppercase', letterSpacing: '0.3px' };
const inp = { display: 'block', width: '100%', padding: '11px 13px', borderRadius: '12px', border: '1.5px solid #E2E8F0', boxSizing: 'border-box', fontFamily: "'Baloo 2', sans-serif", fontSize: '14px', color: '#1E293B', outline: 'none', background: '#F8FAFC', WebkitAppearance: 'none' };
const saveBtn = { flex: 1, background: '#5D5C9E', color: 'white', border: 'none', padding: '13px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '15px' };
const cancelBtn = { flex: 1, background: '#F1F5F9', color: '#64748B', border: 'none', padding: '13px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '15px' };
