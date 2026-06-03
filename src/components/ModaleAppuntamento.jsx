import React, { useState, useEffect } from 'react';
import { useLang } from '../LanguageContext';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

const COLORI_PRESET = [
  '#FFB347', '#5D5C9E', '#70C18E', '#EF4444', '#3B82F6',
  '#F59E0B', '#EC4899', '#06B6D4', '#8B5CF6', '#64748B',
];

export default function ModaleAppuntamento({ formApp, setFormApp, onSalva, onAnnulla, isEdit }) {
  const { t, lang } = useLang();
  const [mostraNoteDettagliate, setMostraNoteDettagliate] = useState(!!(formApp.note_dettagliate));

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Date extra — solo per nuovi appuntamenti (non modifica)
  const [dateExtra, setDateExtra] = useState([]);

  const aggiungiDataExtra = () => {
    setDateExtra([...dateExtra, { data: formApp.data || '', ora: formApp.ora || '', ora_fine: '' }]);
  };

  const rimuoviDataExtra = (i) => {
    setDateExtra(dateExtra.filter((_, idx) => idx !== i));
  };

  const aggiornaDataExtra = (i, campo, valore) => {
    const nuove = [...dateExtra];
    nuove[i][campo] = valore;
    setDateExtra(nuove);
  };

  const handleSalva = () => {
    // Passa le date extra al parent tramite formApp
    onSalva(dateExtra);
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onAnnulla(); }}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', boxSizing: 'border-box' }}
    >
      <div style={{ background: 'white', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '400px', boxSizing: 'border-box', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', maxHeight: '88vh', overflowY: 'auto' }}>

        <h3 style={{ margin: '0 0 20px', fontFamily: "'Baloo 2', sans-serif", fontSize: '18px', fontWeight: '800', color: '#1E293B' }}>
          {isEdit ? (lang === 'it' ? '✏️ Modifica appuntamento' : '✏️ Edit appointment') : t('appt_title')}
        </h3>

        {/* TITOLO */}
        <div style={{ marginBottom: '14px' }}>
          <label style={lbl}>{lang === 'it' ? 'Titolo' : 'Title'}</label>
          <input style={inp} placeholder={t('appt_titleField')} value={formApp.titolo}
            onChange={e => setFormApp({ ...formApp, titolo: e.target.value })} />
        </div>

        {/* CATEGORIA + COLORE */}
        <div style={{ marginBottom: '14px' }}>
          <label style={lbl}>{lang === 'it' ? 'Categoria e colore' : 'Category & colour'}</label>
          <input
            style={{ ...inp, marginBottom: '10px' }}
            placeholder={lang === 'it' ? 'Es: Shooting, Meeting, Consegna...' : 'E.g: Shooting, Meeting, Delivery...'}
            value={formApp.categoria || ''}
            onChange={e => setFormApp({ ...formApp, categoria: e.target.value })}
          />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {COLORI_PRESET.map(colore => (
              <div key={colore} onClick={() => setFormApp({ ...formApp, colore })}
                style={{ width: '28px', height: '28px', borderRadius: '8px', background: colore, cursor: 'pointer', border: (formApp.colore || '#FFB347') === colore ? '3px solid #1E293B' : '3px solid transparent', boxSizing: 'border-box', transition: 'transform 0.1s', transform: (formApp.colore || '#FFB347') === colore ? 'scale(1.15)' : 'scale(1)' }}
              />
            ))}
            <input type="color" value={formApp.colore || '#FFB347'}
              onChange={e => setFormApp({ ...formApp, colore: e.target.value })}
              style={{ width: '28px', height: '28px', borderRadius: '8px', border: '2px dashed #CBD5E1', cursor: 'pointer', padding: '2px', background: 'white' }}
              title={lang === 'it' ? 'Colore personalizzato' : 'Custom colour'} />
          </div>
        </div>

        {/* DATA PRINCIPALE */}
        <div style={{ marginBottom: '14px' }}>
          <label style={lbl}>{lang === 'it' ? `📅 Data 1 — Periodo` : `📅 Date 1 — Period`}</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700', marginBottom: '4px', fontFamily: "'Baloo 2', sans-serif" }}>{lang === 'it' ? 'Dal' : 'From'}</div>
              <input style={inp} type="date" value={formApp.data} onChange={e => setFormApp({ ...formApp, data: e.target.value })} />
            </div>
            <div style={{ color: '#CBD5E1', fontSize: '18px', marginTop: '18px' }}>→</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700', marginBottom: '4px', fontFamily: "'Baloo 2', sans-serif" }}>{lang === 'it' ? 'Al' : 'To'}</div>
              <input style={inp} type="date" value={formApp.data_fine || formApp.data} min={formApp.data} onChange={e => setFormApp({ ...formApp, data_fine: e.target.value })} />
            </div>
          </div>
        </div>

        {/* ORA PRINCIPALE */}
        <div style={{ marginBottom: '14px' }}>
          <label style={lbl}>{lang === 'it' ? 'Orario 1' : 'Time 1'}</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700', marginBottom: '4px', fontFamily: "'Baloo 2', sans-serif" }}>{lang === 'it' ? 'Dalle' : 'From'}</div>
              <input style={inp} type="time" value={formApp.ora} onChange={e => setFormApp({ ...formApp, ora: e.target.value })} />
            </div>
            <div style={{ color: '#CBD5E1', fontSize: '18px', marginTop: '18px' }}>→</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700', marginBottom: '4px', fontFamily: "'Baloo 2', sans-serif" }}>{lang === 'it' ? 'Alle' : 'To'}</div>
              <input style={inp} type="time" value={formApp.ora_fine || ''} onChange={e => setFormApp({ ...formApp, ora_fine: e.target.value })} />
            </div>
          </div>
        </div>

        {/* DATE EXTRA — solo per nuovo appuntamento */}
        {!isEdit && dateExtra.map((extra, i) => (
          <div key={i} style={{ marginBottom: '14px', background: '#F8FAFC', borderRadius: '14px', padding: '12px', border: '1.5px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ ...lbl, margin: 0 }}>📅 {lang === 'it' ? `Data ${i + 2}` : `Date ${i + 2}`}</label>
              <button onClick={() => rimuoviDataExtra(i)} style={{ background: '#FEF2F2', border: 'none', color: '#EF4444', padding: '5px 8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Trash2 size={13} />
              </button>
            </div>
            <input style={{ ...inp, marginBottom: '8px' }} type="date" value={extra.data}
              onChange={e => aggiornaDataExtra(i, 'data', e.target.value)} />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700', marginBottom: '4px', fontFamily: "'Baloo 2', sans-serif" }}>{lang === 'it' ? 'Dalle' : 'From'}</div>
                <input style={inp} type="time" value={extra.ora} onChange={e => aggiornaDataExtra(i, 'ora', e.target.value)} />
              </div>
              <div style={{ color: '#CBD5E1', fontSize: '18px', marginTop: '18px' }}>→</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700', marginBottom: '4px', fontFamily: "'Baloo 2', sans-serif" }}>{lang === 'it' ? 'Alle' : 'To'}</div>
                <input style={inp} type="time" value={extra.ora_fine} onChange={e => aggiornaDataExtra(i, 'ora_fine', e.target.value)} />
              </div>
            </div>
          </div>
        ))}

        {/* BOTTONE AGGIUNGI ALTRA DATA */}
        {!isEdit && (
          <button onClick={aggiungiDataExtra} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#EEEEF8', border: '1.5px dashed #5D5C9E', borderRadius: '12px', padding: '10px', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '13px', fontWeight: '700', color: '#5D5C9E', marginBottom: '14px' }}>
            <Plus size={14} />
            {lang === 'it' ? 'Aggiungi altra data' : 'Add another date'}
          </button>
        )}

        {/* IMPORTO INCASSO */
        <div style={{ marginBottom: '14px' }}>
          <label style={lbl}>💰 {lang === 'it' ? 'Importo incasso (opzionale)' : 'Fee amount (optional)'}</label>
          <input style={inp} type="number" step="0.01" placeholder="0.00"
            value={formApp.importo || ''} onChange={e => setFormApp({ ...formApp, importo: e.target.value })} />
          <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', fontFamily: "'Baloo 2', sans-serif" }}>
            {lang === 'it' ? 'Non visibile al cliente nel promemoria. Si aggiunge alle Entrate alla conferma.' : 'Not visible to client in reminders. Added to Income on confirmation.'}
          </p>
        </div>

        /* NOTE BREVI */}
        <div style={{ marginBottom: '14px' }}>
          <label style={lbl}>Note</label>
          <input style={inp} placeholder={lang === 'it' ? 'Note brevi...' : 'Quick notes...'}
            value={formApp.note || ''} onChange={e => setFormApp({ ...formApp, note: e.target.value })} />
        </div>

        {/* NOTE DETTAGLIATE */}
        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => setMostraNoteDettagliate(!mostraNoteDettagliate)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '11px 14px', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '13px', fontWeight: '700', color: '#5D5C9E' }}>
            <span>📝 {lang === 'it' ? 'Note dettagliate' : 'Detailed notes'}</span>
            {mostraNoteDettagliate ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {mostraNoteDettagliate && (
            <div style={{ marginTop: '8px' }}>
              <textarea
                style={{ ...inp, minHeight: '140px', resize: 'vertical', lineHeight: '1.6', fontSize: '14px' }}
                placeholder={lang === 'it' ? 'Es: Shot list, attrezzatura necessaria, dettagli cliente, riferimenti creativi...' : 'E.g: Shot list, required equipment, client details, creative references...'}
                value={formApp.note_dettagliate || ''}
                onChange={e => setFormApp({ ...formApp, note_dettagliate: e.target.value })}
              />
              <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', fontFamily: "'Baloo 2', sans-serif" }}>
                {lang === 'it' ? 'Spazio libero per appunti, checklist e tutto ciò che ti serve per questo appuntamento.' : 'Free space for notes, checklists and everything you need for this appointment.'}
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onAnnulla} style={cancelBtn}>{t('cancel')}</button>
          <button onClick={handleSalva} style={saveBtn}>
            {isEdit
              ? (lang === 'it' ? '✓ Salva modifiche' : '✓ Save changes')
              : dateExtra.length > 0
                ? (lang === 'it' ? `✓ Salva ${dateExtra.length + 1} date` : `✓ Save ${dateExtra.length + 1} dates`)
                : t('save')}
          </button>
        </div>

      </div>
    </div>
  );
}

const lbl = { display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '6px', fontFamily: "'Baloo 2', sans-serif", textTransform: 'uppercase', letterSpacing: '0.3px' };
const inp = { display: 'block', width: '100%', padding: '11px 13px', borderRadius: '12px', border: '1.5px solid #E2E8F0', boxSizing: 'border-box', fontFamily: "'Baloo 2', sans-serif", fontSize: '14px', color: '#1E293B', outline: 'none', background: '#F8FAFC', WebkitAppearance: 'none' };
const saveBtn = { flex: 1, background: '#5D5C9E', color: 'white', border: 'none', padding: '13px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '15px' };
const cancelBtn = { flex: 1, background: '#F1F5F9', color: '#64748B', border: 'none', padding: '13px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '15px' };
