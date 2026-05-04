import React from 'react';
import { useLang } from '../LanguageContext';

export default function ModaleCliente({ clienteInModifica, formCliente, setFormCliente, onSalva, onAnnulla }) {
  const { t } = useLang();
  const isEdit = !!clienteInModifica;

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onAnnulla(); }} style={overlay}>
      <div style={modal}>
        <h3 style={title}>{isEdit ? t('rubrica_editClient') : t('rubrica_addClient')}</h3>

        <div style={{ marginBottom: '12px' }}>
          <label style={lbl}>{t('rubrica_name')} *</label>
          <input style={inp} placeholder="Mario Rossi" value={formCliente.nome}
            onChange={e => setFormCliente({ ...formCliente, nome: e.target.value })} autoFocus />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={lbl}>{t('rubrica_phone')}</label>
          <input style={inp} placeholder="+39 333 123 4567" type="tel" value={formCliente.tel}
            onChange={e => setFormCliente({ ...formCliente, tel: e.target.value })} />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={lbl}>Email</label>
          <input style={inp} placeholder="mario@email.com" type="email" value={formCliente.email}
            onChange={e => setFormCliente({ ...formCliente, email: e.target.value })} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={lbl}>{t('rubrica_notes')}</label>
          <textarea style={{ ...inp, minHeight: '72px', resize: 'vertical' }}
            placeholder={t('rubrica_notesPlaceholder')} value={formCliente.note}
            onChange={e => setFormCliente({ ...formCliente, note: e.target.value })} />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onAnnulla} style={cancelBtn}>{t('cancel')}</button>
          <button onClick={onSalva} style={saveBtn}>{t('save')}</button>
        </div>
      </div>
    </div>
  );
}

const overlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px', boxSizing: 'border-box' };
const modal = { background: 'white', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '360px', boxSizing: 'border-box', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', overflow: 'hidden' };
const title = { margin: '0 0 20px', fontFamily: "'Baloo 2', sans-serif", fontSize: '18px', fontWeight: '800', color: '#1E293B' };
const lbl = { display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '6px', fontFamily: "'Baloo 2', sans-serif", textTransform: 'uppercase', letterSpacing: '0.3px' };
const inp = { display: 'block', width: '100%', padding: '11px 13px', borderRadius: '12px', border: '1.5px solid #E2E8F0', boxSizing: 'border-box', fontFamily: "'Baloo 2', sans-serif", fontSize: '14px', color: '#1E293B', outline: 'none', background: '#F8FAFC', WebkitAppearance: 'none' };
const saveBtn = { flex: 1, background: '#5D5C9E', color: 'white', border: 'none', padding: '13px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '15px' };
const cancelBtn = { flex: 1, background: '#F1F5F9', color: '#64748B', border: 'none', padding: '13px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '15px' };
