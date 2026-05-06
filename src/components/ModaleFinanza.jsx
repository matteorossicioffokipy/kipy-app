import React, { useState } from 'react';
import { useLang } from '../LanguageContext';

const CAT_IT = { entrata: ['Servizio', 'Consulenza', 'Prodotto', 'Abbonamento', 'Altro'], uscita: ['Materiali', 'Affitto', 'Utenze', 'Marketing', 'Software', 'Trasporti', 'Altro'] };
const CAT_EN = { entrata: ['Service', 'Consulting', 'Product', 'Subscription', 'Other'], uscita: ['Materials', 'Rent', 'Utilities', 'Marketing', 'Software', 'Transport', 'Other'] };

export default function ModaleFinanza({ onSalva, onAnnulla }) {
  const { t, lang } = useLang();
  const [tipo, setTipo] = useState('entrata');
  const [form, setForm] = useState({ importo: '', categoria: '', descrizione: '', data: new Date().toLocaleDateString('en-CA') });

  const currency = lang === 'it' ? '€' : '£';
  const CAT = lang === 'en' ? CAT_EN : CAT_IT;
  const isEntrata = tipo === 'entrata';

  const handleSalva = () => {
    if (!form.importo || !form.categoria) {
      alert(lang === 'it' ? 'Importo e categoria richiesti' : 'Amount and category required');
      return;
    }
    onSalva({ ...form, tipo, importo: parseFloat(form.importo) });
  };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onAnnulla(); }} style={overlay}>
      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
      <div style={modal}>
        <h3 style={title}>{lang === 'it' ? 'Nuovo movimento' : 'New transaction'}</h3>

        <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '12px', marginBottom: '16px' }}>
          <button onClick={() => setTipo('entrata')} style={tabBtn(isEntrata, '#15803D')}>{t('finanze_income_tab')}</button>
          <button onClick={() => setTipo('uscita')} style={tabBtn(!isEntrata, '#EF4444')}>{t('finanze_expense_tab')}</button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={lbl}>{lang === 'it' ? `Importo ${currency}` : `Amount ${currency}`}</label>
            <input style={inp} type="number" step="0.01" placeholder="0.00" value={form.importo}
              onChange={e => setForm({ ...form, importo: e.target.value })} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={lbl}>{lang === 'it' ? 'Data' : 'Date'}</label>
            <input style={inp} type="date" value={form.data}
              onChange={e => setForm({ ...form, data: e.target.value })} />
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={lbl}>{t('finanze_category')}</label>
          <select style={inp} value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
            <option value="">{t('finanze_selectCategory')}</option>
            {CAT[tipo].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={lbl}>{lang === 'it' ? 'Descrizione (opzionale)' : 'Description (optional)'}</label>
          <input style={inp} placeholder="..." value={form.descrizione}
            onChange={e => setForm({ ...form, descrizione: e.target.value })} />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onAnnulla} style={cancelBtn}>{t('cancel')}</button>
          <button onClick={handleSalva} style={{ ...saveBtn, background: isEntrata ? '#15803D' : '#EF4444' }}>
            {isEntrata ? (lang === 'it' ? '+ Entrata' : '+ Income') : (lang === 'it' ? '- Uscita' : '- Expense')}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px', boxSizing: 'border-box' };
const modal = { background: 'white', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '360px', boxSizing: 'border-box', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', overflow: 'hidden' };
const title = { margin: '0 0 16px', fontFamily: "'Baloo 2', sans-serif", fontSize: '18px', fontWeight: '800', color: '#1E293B' };
const lbl = { display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '6px', fontFamily: "'Baloo 2', sans-serif", textTransform: 'uppercase', letterSpacing: '0.3px' };
const inp = { display: 'block', width: '100%', padding: '11px 13px', borderRadius: '12px', border: '1.5px solid #E2E8F0', boxSizing: 'border-box', fontFamily: "'Baloo 2', sans-serif", fontSize: '14px', color: '#1E293B', outline: 'none', background: '#F8FAFC', WebkitAppearance: 'none', height: '46px', lineHeight: '1.4' };
const saveBtn = { flex: 1, color: 'white', border: 'none', padding: '13px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '15px' };
const cancelBtn = { flex: 1, background: '#F1F5F9', color: '#64748B', border: 'none', padding: '13px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '15px' };
const tabBtn = (active, color) => ({ flex: 1, border: 'none', background: active ? color : 'transparent', color: active ? 'white' : '#64748B', padding: '8px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', fontFamily: "'Baloo 2', sans-serif" });
