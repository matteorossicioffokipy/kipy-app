import React from 'react';
import { useLang } from '../LanguageContext';

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
  boxSizing: 'border-box',
};

const modalStyle = {
  background: 'white', padding: '24px', borderRadius: '24px',
  width: 'calc(100% - 40px)', maxWidth: '400px',
  boxSizing: 'border-box',
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1.5px solid #E2E8F0',
  boxSizing: 'border-box',
  fontFamily: "'Baloo 2', sans-serif",
  fontSize: '15px',
  color: '#1E293B',
  outline: 'none',
  background: '#F8FAFC',
  display: 'block',
};

const labelStyle = {
  fontSize: '12px',
  fontWeight: '700',
  color: '#64748B',
  fontFamily: "'Baloo 2', sans-serif",
  display: 'block',
  marginBottom: '6px',
};

const saveBtn = {
  flex: 1, background: '#5D5C9E', color: 'white', border: 'none',
  padding: '13px', borderRadius: '12px', fontWeight: '800',
  cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '15px',
};

const cancelBtn = {
  flex: 1, background: '#F1F5F9', color: '#64748B', border: 'none',
  padding: '13px', borderRadius: '12px', fontWeight: '800',
  cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '15px',
};

export default function ModaleAppuntamento({ formApp, setFormApp, onSalva, onAnnulla }) {
  const { t } = useLang();

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onAnnulla(); }}>
      <div style={modalStyle}>
        <h3 style={{
          marginTop: 0, fontFamily: "'Baloo 2', sans-serif",
          fontSize: '18px', fontWeight: '800', color: '#1E293B', marginBottom: '20px',
        }}>
          {t('appt_title')}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Titolo */}
          <div>
            <label style={labelStyle}>{t('appt_titleField')}</label>
            <input
              style={inputStyle}
              placeholder={t('appt_titleField')}
              value={formApp.titolo}
              onChange={e => setFormApp({ ...formApp, titolo: e.target.value })}
            />
          </div>

          {/* Data e Ora affiancati */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label style={labelStyle}>Data</label>
              <input
                style={inputStyle}
                type="date"
                value={formApp.data}
                onChange={e => setFormApp({ ...formApp, data: e.target.value })}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label style={labelStyle}>Ora</label>
              <input
                style={inputStyle}
                type="time"
                value={formApp.ora}
                onChange={e => setFormApp({ ...formApp, ora: e.target.value })}
              />
            </div>
          </div>

          {/* Bottoni */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button onClick={onAnnulla} style={cancelBtn}>{t('cancel')}</button>
            <button onClick={onSalva} style={saveBtn}>{t('save')}</button>
          </div>

        </div>
      </div>
    </div>
  );
}
