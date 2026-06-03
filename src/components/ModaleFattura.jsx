import React, { useState } from 'react';
import { Plus, Trash2, FileText, Eye, EyeOff } from 'lucide-react';
import { useLang } from '../LanguageContext';

export default function ModaleFattura({ clienti = [], fattureCount = 0, onSalva, onAnnulla, fatturaInModifica = null, config = {} }) {
  const { t, lang } = useLang();
  const currency = lang === 'it' ? '€' : '£';
  const isEdit = !!fatturaInModifica;
  const [anteprima, setAnteprima] = useState(false);

  const [form, setForm] = useState(fatturaInModifica ? {
    numero: fatturaInModifica.numero,
    data: fatturaInModifica.data,
    cliente_id: String(fatturaInModifica.cliente_id),
    iva: String(fatturaInModifica.iva),
    note: fatturaInModifica.note || '',
    servizi: fatturaInModifica.servizi || [{ descrizione: '', quantita: 1, prezzo: '' }],
  } : {
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
    if (!config?.codice_fiscale) return alert(lang === 'it'
      ? 'Per emettere una fattura è obbligatoria la P.IVA o il Codice Fiscale.\nVai su Impostazioni → Coordinate bancarie per aggiungerlo.'
      : 'A VAT or Company number is required to issue an invoice.\nGo to Settings → Bank details to add it.');
    if (!config?.iban) return alert(lang === 'it'
      ? 'Per emettere una fattura è obbligatorio l\'IBAN.\nVai su Impostazioni → Coordinate bancarie per aggiungerlo.'
      : 'An IBAN is required to issue an invoice.\nGo to Settings → Bank details to add it.');
    onSalva({
      ...form,
      numero: form.numero || `${new Date().getFullYear()}-${String(fattureCount + 1).padStart(3, '0')}`,
      cliente_id: parseInt(form.cliente_id),
      iva: parseInt(form.iva),
      totale,
    });
  };

  // Genera HTML anteprima
  const generaAnteprimaHTML = () => {
    const cliente = clienti.find(c => c.id === parseInt(form.cliente_id));
    const servizi = form.servizi.filter(s => s.descrizione && s.prezzo);
    const subtot = servizi.reduce((a, s) => a + (parseFloat(s.prezzo) || 0) * (parseInt(s.quantita) || 1), 0);
    const ivaImp = subtot * (parseInt(form.iva) / 100);
    const tot = subtot + ivaImp;
    const isIT = lang === 'it';
    const numero = form.numero || `${new Date().getFullYear()}-${String(fattureCount + 1).padStart(3, '0')}`;

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',Arial,sans-serif; color:#1E293B; background:white; padding:32px; font-size:12px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; padding-bottom:20px; border-bottom:2px solid #F1F5F9; }
  .company-name { font-size:20px; font-weight:900; color:#5D5C9E; }
  .company-info { text-align:right; font-size:11px; color:#64748B; line-height:1.7; }
  .company-info .name { font-size:13px; font-weight:800; color:#1E293B; }
  .title-row { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:24px; }
  .invoice-label { font-size:28px; font-weight:900; color:#5D5C9E; }
  .invoice-badge { background:#F0F0FA; border-radius:10px; padding:6px 14px; text-align:right; }
  .invoice-badge .num-label { font-size:9px; color:#94A3B8; text-transform:uppercase; }
  .invoice-badge .num-value { font-size:16px; font-weight:900; color:#5D5C9E; }
  .meta-row { display:flex; gap:12px; margin-bottom:24px; }
  .meta-box { background:#F8FAFC; border:1px solid #F1F5F9; border-radius:10px; padding:10px 14px; flex:1; }
  .meta-box .label { font-size:9px; color:#94A3B8; text-transform:uppercase; margin-bottom:3px; }
  .meta-box .value { font-size:12px; font-weight:700; color:#1E293B; }
  .parties { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:24px; }
  .party-box { background:#F8FAFC; border:1px solid #F1F5F9; border-radius:10px; padding:12px 14px; }
  .party-label { font-size:9px; color:#94A3B8; text-transform:uppercase; margin-bottom:6px; }
  .party-name { font-size:13px; font-weight:800; color:#1E293B; margin-bottom:3px; }
  .party-info { font-size:11px; color:#64748B; line-height:1.6; }
  table { width:100%; border-collapse:collapse; margin-bottom:16px; }
  thead tr { background:#5D5C9E; }
  th { color:white; padding:9px 12px; font-size:10px; font-weight:700; text-transform:uppercase; }
  th:first-child { border-radius:8px 0 0 8px; }
  th:last-child { border-radius:0 8px 8px 0; }
  td { padding:10px 12px; border-bottom:1px solid #F1F5F9; font-size:12px; }
  .totals-wrapper { display:flex; justify-content:flex-end; margin-bottom:20px; }
  .totals-box { width:240px; }
  .total-row { display:flex; justify-content:space-between; padding:6px 0; font-size:11px; border-bottom:1px solid #F1F5F9; color:#64748B; }
  .total-final { display:flex; justify-content:space-between; padding:10px 16px; font-size:15px; font-weight:900; color:white; background:#5D5C9E; border-radius:10px; margin-top:6px; }
  .payment-box { background:#F0F0FA; border-radius:10px; padding:12px 14px; margin-bottom:20px; }
  .payment-label { font-size:9px; color:#7B7BC0; text-transform:uppercase; margin-bottom:6px; font-weight:700; }
  .iban { font-size:13px; font-weight:800; color:#5D5C9E; letter-spacing:1px; }
  .footer { text-align:center; padding-top:16px; border-top:1px solid #F1F5F9; font-size:10px; color:#CBD5E1; }
  .kipri { font-weight:700; color:#5D5C9E; }
  .preview-badge { background:#FFF7ED; border:1px solid #FFB347; border-radius:8px; padding:6px 12px; text-align:center; font-size:11px; color:#B45309; font-weight:700; margin-bottom:20px; }
</style></head><body>
<div class="preview-badge">⚠️ ${isIT ? 'ANTEPRIMA — non ancora salvata' : 'PREVIEW — not saved yet'}</div>
<div class="header">
  <div>${config?.logo_url ? `<img src="${config.logo_url}" style="height:40px"/>` : `<div class="company-name">${config?.nome_azienda || 'KIPRI'}</div>`}</div>
  <div class="company-info">
    <div class="name">${config?.nome_azienda || ''}</div>
    ${config?.settore ? `<p>${config.settore}</p>` : ''}
    ${config?.email_business ? `<p>${config.email_business}</p>` : ''}
  </div>
</div>
<div class="title-row">
  <div class="invoice-label">${isIT ? 'FATTURA' : 'INVOICE'}</div>
  <div class="invoice-badge">
    <div class="num-label">${isIT ? 'Numero' : 'Number'}</div>
    <div class="num-value">#${numero}</div>
  </div>
</div>
<div class="meta-row">
  <div class="meta-box"><div class="label">${isIT ? 'Data' : 'Date'}</div><div class="value">${new Date(form.data).toLocaleDateString('en-GB')}</div></div>
  <div class="meta-box"><div class="label">Status</div><div class="value" style="color:#15803D;">✓ ${isIT ? 'Anteprima' : 'Preview'}</div></div>
  ${parseInt(form.iva) > 0 ? `<div class="meta-box"><div class="label">IVA/VAT</div><div class="value">${form.iva}%</div></div>` : ''}
</div>
<div class="parties">
  <div class="party-box">
    <div class="party-label">${isIT ? 'Da' : 'From'}</div>
    <div class="party-name">${config?.nome_azienda || ''}</div>
    <div class="party-info">${config?.settore || ''}</div>
  </div>
  <div class="party-box">
    <div class="party-label">${isIT ? 'Fatturato a' : 'Billed to'}</div>
    <div class="party-name">${cliente?.nome || (isIT ? 'Cliente non selezionato' : 'No client selected')}</div>
    <div class="party-info">${cliente?.email || ''}</div>
  </div>
</div>
<table>
  <thead><tr>
    <th style="text-align:left;">${isIT ? 'Descrizione' : 'Description'}</th>
    <th style="text-align:center;">${isIT ? 'Qtà' : 'Qty'}</th>
    <th style="text-align:right;">${isIT ? 'Prezzo' : 'Price'}</th>
    <th style="text-align:right;">Totale</th>
  </tr></thead>
  <tbody>
    ${servizi.map(s => `<tr>
      <td>${s.descrizione}</td>
      <td style="text-align:center;">${s.quantita}</td>
      <td style="text-align:right;">${currency}${parseFloat(s.prezzo).toFixed(2)}</td>
      <td style="text-align:right;font-weight:700;">${currency}${((parseFloat(s.prezzo)||0)*(parseInt(s.quantita)||1)).toFixed(2)}</td>
    </tr>`).join('')}
  </tbody>
</table>
<div class="totals-wrapper"><div class="totals-box">
  <div class="total-row"><span>Subtotale</span><span>${currency}${subtot.toFixed(2)}</span></div>
  ${parseInt(form.iva) > 0 ? `<div class="total-row"><span>IVA/VAT ${form.iva}%</span><span>${currency}${ivaImp.toFixed(2)}</span></div>` : ''}
  <div class="total-final"><span>TOTALE</span><span>${currency}${tot.toFixed(2)}</span></div>
</div></div>
${config?.iban ? `<div class="payment-box"><div class="payment-label">${isIT ? 'Coordinate bancarie' : 'Payment details'}</div><div class="iban">${config.iban}</div>${config?.nome_banca ? `<div style="font-size:11px;color:#7B7BC0;margin-top:3px;">${config.nome_banca}</div>` : ''}</div>` : ''}
${form.note ? `<div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:12px 14px;margin-bottom:20px;"><div style="font-size:9px;color:#92400E;text-transform:uppercase;margin-bottom:4px;font-weight:700;">Note</div><p style="font-size:11px;color:#78350F;">${form.note}</p></div>` : ''}
<div class="footer"><p>Generated with <span class="kipri">KIPRI</span> · your business in your pocket</p></div>
</body></html>`;
  };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onAnnulla(); }} style={overlay}>
      <div style={modal}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <FileText size={18} color="#5D5C9E" />
          <h3 style={title}>
            {isEdit
              ? (lang === 'it' ? '✏️ Modifica Fattura' : '✏️ Edit Invoice')
              : (lang === 'it' ? 'Nuova Fattura' : 'New Invoice')}
          </h3>
        </div>

        {!anteprima ? (
          <>
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
              <button onClick={() => setAnteprima(true)} style={previewBtn}>
                <Eye size={15} />
                {lang === 'it' ? 'Anteprima' : 'Preview'}
              </button>
              <button onClick={handleSalva} style={saveBtn}>
                {isEdit ? (lang === 'it' ? '✓ Aggiorna' : '✓ Update') : t('fatture_save')}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* ANTEPRIMA */}
            <div style={{ marginBottom: '12px', background: '#FFF7ED', border: '1px solid #FFB347', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', color: '#B45309', fontWeight: '700', fontFamily: "'Baloo 2',sans-serif" }}>
              👁 {lang === 'it' ? 'Anteprima — puoi tornare indietro e modificare' : 'Preview — you can go back and edit'}
            </div>
            <iframe
              srcDoc={generaAnteprimaHTML()}
              style={{ width: '100%', height: '420px', border: '1px solid #E2E8F0', borderRadius: '12px', marginBottom: '14px' }}
              title="anteprima fattura"
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setAnteprima(false)} style={{ ...cancelBtn, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <EyeOff size={14} />
                {lang === 'it' ? 'Modifica' : 'Edit'}
              </button>
              <button onClick={handleSalva} style={saveBtn}>
                {isEdit ? (lang === 'it' ? '✓ Aggiorna' : '✓ Update') : t('fatture_save')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const overlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', boxSizing: 'border-box', overflowY: 'auto' };
const modal = { background: 'white', borderRadius: '24px', padding: '22px', width: '100%', maxWidth: '380px', boxSizing: 'border-box', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', margin: 'auto', maxHeight: '90vh', overflowY: 'auto' };
const title = { margin: 0, fontFamily: "'Baloo 2', sans-serif", fontSize: '17px', fontWeight: '800', color: '#1E293B' };
const lbl = { display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '5px', fontFamily: "'Baloo 2', sans-serif", textTransform: 'uppercase', letterSpacing: '0.3px' };
const inp = { display: 'block', width: '100%', padding: '10px 12px', borderRadius: '11px', border: '1.5px solid #E2E8F0', boxSizing: 'border-box', fontFamily: "'Baloo 2', sans-serif", fontSize: '13px', color: '#1E293B', outline: 'none', background: '#F8FAFC', WebkitAppearance: 'none' };
const saveBtn = { flex: 1, background: '#5D5C9E', color: 'white', border: 'none', padding: '13px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '14px' };
const cancelBtn = { flex: 1, background: '#F1F5F9', color: '#64748B', border: 'none', padding: '13px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '14px' };
const previewBtn = { flex: 1, background: '#FFF7ED', color: '#B45309', border: '1px solid #FFB347', padding: '13px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' };
const smallBtn = { background: '#EEEEF8', color: '#5D5C9E', border: 'none', padding: '7px 11px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'Baloo 2', sans-serif" };
