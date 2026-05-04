import React, { useState } from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';
import { useLang } from '../LanguageContext';

export default function ModaleFattura({ clienti = [], fattureCount = 0, onSalva, onAnnulla }) {
  const { t, lang } = useLang();
  const currency = lang === 'it' ? '€' : '£';

  const [form, setForm] = useState({
    numero: '',
    data: new Date().toLocaleDateString('en-CA'),
    cliente_id: '',
    iva: '0',
    note: '',
    servizi: [{ descrizione: '', quantita: 1, prezzo: '' }],
  });

  const subtotale = form.servizi.reduce((acc, s) => acc + (parseFloat(s.prezzo) || 0) * (parseInt(s.quantita) || 1), 0);
  const totale = subtotale + subtotale * (parseInt(form.iva) / 100);

  const aggiungiServizio = () => setForm({ ...form, servizi: [...form.servizi, { descrizione: '', quantita: 1, prezzo: '' }] });
  const rimuoviServizio = (i) => setForm({ ...form, servizi: form.servizi.filter((_, idx) => idx !== i) });
  const aggiornaServizio = (i, campo, valore) => {
    const nuovi = [...form.servizi]; nuovi[i][campo] = valore; setForm({ ...form, servizi: nuovi });
  };

  const handleSalva = () => {
    if (!form.cliente_id) return alert(t('fatture_selectClientAlert'));
    if (form.servizi.some(s => !s.descrizione || !s.prezzo)) return alert(t('fatture_fillServices'));
    onSalva({
      ...form,
      numero: form.numero || `${new Date().getFullYear()}-${String(fattureCount + 1).padStart(3, '0')}`,
      cliente_id: parseInt(form.cliente_id),
      iva: parseInt(form.iva),
      totale,
    });
  };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onAnnulla(); }} style={overlay}>
      <div style={modal}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <FileText size={18} color="#5D5C9E" />
          <h3 style={title}>{lang === 'it' ? 'Nuova Fattura' : 'New Invoice'}</h3>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={lbl}>{t('fatture_number')}</label>
            <input style={inp} placeholder="Auto" value={form.numero}
              onChange={e => setForm({ ...form, numero: e.target.value })} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={lbl}>{lang === 'it' ? 'Data' : 'Date'}</label>
            <input style={{ ...inp, background: '#F1F5F9' }} type="date" value={form.data}
              onChange={e => setForm({ ...form, data: e.target.value })} />
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={lbl}>{t('fatture_client')}</label>
          <select style={inp} value={form.cliente_id} onChange={e => setForm({ ...form, cliente_id: e.target.value })}>
            <option value="">{t('fatture_selectClient')}</option>
            {clienti.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={lbl}>{t('fatture_services')}</label>
            <button onClick={aggiungiServizio} style={smallBtn}><Plus size={12} /> {t('fatture_addService')}</button>
          </div>
          {form.servizi.map((s, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <input style={{ ...inp, marginBottom: '6px' }} placeholder={t('fatture_description')} value={s.descrizione}
                onChange={e => aggiornaServizio(i, 'descrizione', e.target.value)} />
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ flex: '0 0 68px' }}>
                  <input style={{ ...inp, textAlign: 'center' }} type="number" min="1" placeholder={t('fatture_qty')} value={s.quantita}
                    onChange={e => aggiornaServizio(i, 'quantita', e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <input style={{ ...inp, textAlign: 'right' }} type="number" step="0.01" placeholder={`${currency} ${t('fatture_price')}`} value={s.prezzo}
                    onChange={e => aggiornaServizio(i, 'prezzo', e.target.value)} />
                </div>
                {form.servizi.length > 1 && (
                  <button onClick={() => rimuoviServizio(i)} style={{ ...smallBtn, background: '#FEF2F2', color: '#EF4444', padding: '10px', flexShrink: 0 }}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={lbl}>{t('fatture_iva')}</label>
            <select style={inp} value={form.iva} onChange={e => setForm({ ...form, iva: e.target.value })}>
              <option value="0">{t('fatture_ivaExempt')}</option>
              <option value="4">4%</option><option value="10">10%</option>
              <option value="20">20%</option><option value="22">22%</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={lbl}>{t('fatture_total')}</label>
            <div style={{ background: '#EEEEF8', borderRadius: '12px', padding: '11px 13px', textAlign: 'right' }}>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#5D5C9E', fontFamily: "'Baloo 2',sans-serif" }}>
                {currency}{totale.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={lbl}>{t('fatture_notes')}</label>
          <textarea style={{ ...inp, minHeight: '56px', resize: 'vertical' }} placeholder={t('fatture_notesPlaceholder')} value={form.note}
            onChange={e => setForm({ ...form, note: e.target.value })} />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onAnnulla} style={cancelBtn}>{t('cancel')}</button>
          <button onClick={handleSalva} style={saveBtn}>{t('fatture_save')}</button>
        </div>
      </div>
    </div>
  );
}

const overlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', boxSizing: 'border-box', overflowY: 'auto' };
const modal = { background: 'white', borderRadius: '24px', padding: '22px', width: '100%', maxWidth: '360px', boxSizing: 'border-box', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', margin: 'auto' };
const title = { margin: 0, fontFamily: "'Baloo 2', sans-serif", fontSize: '17px', fontWeight: '800', color: '#1E293B' };
const lbl = { display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '5px', fontFamily: "'Baloo 2', sans-serif", textTransform: 'uppercase', letterSpacing: '0.3px' };
const inp = { display: 'block', width: '100%', padding: '10px 12px', borderRadius: '11px', border: '1.5px solid #E2E8F0', boxSizing: 'border-box', fontFamily: "'Baloo 2', sans-serif", fontSize: '13px', color: '#1E293B', outline: 'none', background: '#F8FAFC', WebkitAppearance: 'none' };
const saveBtn = { flex: 1, background: '#5D5C9E', color: 'white', border: 'none', padding: '13px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '14px' };
const cancelBtn = { flex: 1, background: '#F1F5F9', color: '#64748B', border: 'none', padding: '13px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '14px' };
const smallBtn = { background: '#EEEEF8', color: '#5D5C9E', border: 'none', padding: '7px 11px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'Baloo 2', sans-serif" };
