import React from 'react';
import { useLang } from '../LanguageContext';

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
};

const modalStyle = {
  background: 'white', padding: '24px', borderRadius: '24px',
  width: '100%', maxWidth: '400px', boxSizing: 'border-box',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
};

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: '12px',
  border: '1.5px solid #E2E8F0', boxSizing: 'border-box',
  fontFamily: "'Baloo 2', sans-serif", fontSize: '14px',
  color: '#1E293B', outline: 'none',
};

const saveBtn = {
  flex: 1, background: '#5D5C9E', color: 'white', border: 'none',
  padding: '12px', borderRadius: '12px', fontWeight: '800',
  cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '15px',
};

const cancelBtn = {
  flex: 1, background: '#F1F5F9', color: '#64748B', border: 'none',
  padding: '12px', borderRadius: '12px', fontWeight: '800',
  cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '15px',
};

export default function ModaleCliente({
  clienteInModifica, formCliente, setFormCliente,
  onSalva, onAnnulla
}) {
  const { t } = useLang();

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onAnnulla(); }}>
      <div style={modalStyle}>
        <h3 style={{ marginTop: 0, fontFamily: "'Baloo 2', sans-serif", fontSize: '18px', fontWeight: '800', color: '#1E293B', marginBottom: '16px' }}>
          {clienteInModifica ? t('rubrica_editClient') : t('rubrica_newClient')}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input style={inputStyle} placeholder={t('rubrica_name')} value={formCliente.nome}
            onChange={e => setFormCliente({ ...formCliente, nome: e.target.value })} />
          <input style={inputStyle} placeholder={t('rubrica_phone')} value={formCliente.tel}
            onChange={e => setFormCliente({ ...formCliente, tel: e.target.value })} />
          <input style={inputStyle} placeholder={t('rubrica_email')} value={formCliente.email}
            onChange={e => setFormCliente({ ...formCliente, email: e.target.value })} />
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            placeholder={t('rubrica_notes')} value={formCliente.note}
            onChange={e => setFormCliente({ ...formCliente, note: e.target.value })} />
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button onClick={onAnnulla} style={cancelBtn}>{t('cancel')}</button>
            <button onClick={onSalva} style={saveBtn}>{t('save')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
