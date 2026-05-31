import React, { useState, useEffect } from 'react';
import { Plus, FileText, Download, Trash2, Mail, Pencil, MessageCircle, ArrowLeft } from 'lucide-react';
import { useLang } from '../LanguageContext';
import ModaleFattura from './ModaleFattura';

export default function Fatture({ supabase, user, clienti, config }) {
  const { t, lang } = useLang();
  const [fatture, setFatture] = useState([]);
  const [mostraModale, setMostraModale] = useState(false);
  const [fatturaInModifica, setFatturaInModifica] = useState(null);
  const [fatturaAperta, setFatturaAperta] = useState(null);
  const currency = lang === 'it' ? '€' : '£';

  const fetchFatture = async () => {
    const { data } = await supabase.from('fatture').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false });
    setFatture(data || []);
  };

  useEffect(() => { fetchFatture(); }, []);

  const handleSalva = async (formData) => {
    const { error } = await supabase.from('fatture').insert([{
      user_id: user.id,
      numero: formData.numero,
      data: formData.data,
      cliente_id: formData.cliente_id,
      servizi: formData.servizi,
      iva: formData.iva,
      totale: formData.totale,
      note: formData.note,
    }]);
    if (!error) { setMostraModale(false); fetchFatture(); }
    else alert(t('error') + ': ' + error.message);
  };

  const handleModifica = async (formData) => {
    const { error } = await supabase.from('fatture').update({
      numero: formData.numero,
      data: formData.data,
      cliente_id: formData.cliente_id,
      servizi: formData.servizi,
      iva: formData.iva,
      totale: formData.totale,
      note: formData.note,
    }).eq('id', fatturaInModifica.id);
    if (!error) { setFatturaInModifica(null); fetchFatture(); }
    else alert(t('error') + ': ' + error.message);
  };

  const elimina = async (id) => {
    if (!window.confirm(t('delete') + '?')) return;
    await supabase.from('fatture').delete().eq('id', id);
    fetchFatture();
  };

  const generaHTML = (fattura, langOverride) => {
    const isIT = (langOverride || lang) === 'it';
    const curr = isIT ? '€' : '£';
    const cliente = clienti.find(c => c.id === fattura.cliente_id);
    const servizi = fattura.servizi || [];
    const subtot = servizi.reduce((a, s) => a + (parseFloat(s.prezzo) || 0) * (parseInt(s.quantita) || 1), 0);
    const ivaImp = subtot * (fattura.iva / 100);
    const firma = config?.firma || '';

    return `<!DOCTYPE html>
<html lang="${isIT ? 'it' : 'en'}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${isIT ? 'Fattura' : 'Invoice'} #${fattura.numero}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',Arial,sans-serif; color:#1E293B; background:#F8FAFC; font-size:13px; }
    .page { background:white; max-width:794px; margin:0 auto; padding:48px 56px; min-height:1123px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px; padding-bottom:28px; border-bottom:2px solid #F1F5F9; }
    .logo-area img { height:52px; object-fit:contain; }
    .logo-area .company-name { font-size:22px; font-weight:900; color:#5D5C9E; }
    .company-info { text-align:right; }
    .company-info .name { font-size:15px; font-weight:800; color:#1E293B; margin-bottom:4px; }
    .company-info p { font-size:11px; color:#64748B; line-height:1.8; }
    .title-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:28px; }
    .invoice-label { font-size:36px; font-weight:900; color:#5D5C9E; letter-spacing:-1px; }
    .invoice-badge { background:#F0F0FA; border-radius:12px; padding:10px 18px; text-align:right; }
    .invoice-badge .num-label { font-size:10px; color:#94A3B8; text-transform:uppercase; letter-spacing:1px; }
    .invoice-badge .num-value { font-size:20px; font-weight:900; color:#5D5C9E; }
    .meta-row { display:flex; gap:12px; margin-bottom:28px; }
    .meta-box { background:#F8FAFC; border:1px solid #F1F5F9; border-radius:12px; padding:12px 16px; flex:1; }
    .meta-box .label { font-size:10px; color:#94A3B8; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px; }
    .meta-box .value { font-size:13px; font-weight:700; color:#1E293B; }
    .parties { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:28px; }
    .party-box { background:#F8FAFC; border:1px solid #F1F5F9; border-radius:12px; padding:14px 18px; }
    .party-box .party-label { font-size:10px; color:#94A3B8; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
    .party-box .party-name { font-size:14px; font-weight:800; color:#1E293B; margin-bottom:4px; }
    .party-box p { font-size:11px; color:#64748B; line-height:1.7; }
    table { width:100%; border-collapse:collapse; margin-bottom:20px; }
    thead tr { background:#5D5C9E; }
    th { color:white; padding:11px 14px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
    th:first-child { border-radius:10px 0 0 10px; text-align:left; }
    th:last-child { border-radius:0 10px 10px 0; text-align:right; }
    td { padding:12px 14px; border-bottom:1px solid #F1F5F9; font-size:13px; }
    td:first-child { text-align:left; }
    td:nth-child(2) { text-align:center; }
    td:nth-child(3) { text-align:right; }
    td:last-child { text-align:right; font-weight:700; }
    tbody tr:last-child td { border-bottom:none; }
    tbody tr:nth-child(even) td { background:#FAFBFF; }
    .totals-wrapper { display:flex; justify-content:flex-end; margin-bottom:28px; }
    .totals-box { width:260px; }
    .total-row { display:flex; justify-content:space-between; padding:7px 0; font-size:12px; border-bottom:1px solid #F1F5F9; color:#64748B; }
    .total-final { display:flex; justify-content:space-between; padding:12px 18px; font-size:17px; font-weight:900; color:white; background:#5D5C9E; border-radius:12px; margin-top:8px; }
    .payment-box { background:#F0F0FA; border-radius:12px; padding:14px 18px; margin-bottom:24px; }
    .payment-label { font-size:10px; color:#7B7BC0; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; font-weight:700; }
    .iban { font-size:14px; font-weight:800; color:#5D5C9E; letter-spacing:1px; }
    .bank { font-size:11px; color:#7B7BC0; margin-top:3px; }
    .notes-box { background:#FFFBEB; border:1px solid #FDE68A; border-radius:12px; padding:14px 18px; margin-bottom:24px; }
    .notes-label { font-size:10px; color:#92400E; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; font-weight:700; }
    .notes-box p { font-size:12px; color:#78350F; line-height:1.6; }
    .firma-box { margin-top:40px; display:flex; justify-content:flex-end; }
    .firma-inner { text-align:center; min-width:200px; }
    .firma-label { font-size:10px; color:#94A3B8; text-transform:uppercase; letter-spacing:1px; margin-bottom:14px; }
    .firma-text { font-size:26px; font-family:'Brush Script MT','Segoe Script',cursive; color:#1E293B; font-style:italic; border-bottom:1.5px solid #1E293B; padding-bottom:8px; display:inline-block; min-width:160px; }
    .firma-name { font-size:10px; color:#94A3B8; margin-top:6px; }
    .footer { text-align:center; padding-top:24px; border-top:1px solid #F1F5F9; margin-top:32px; }
    .footer p { font-size:11px; color:#CBD5E1; }
    .footer .kipri { font-weight:700; color:#5D5C9E; }
    @media print { body { background:white; } .page { padding:32px 40px; } }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo-area">
      ${config?.logo_url ? `<img src="${config.logo_url}" alt="Logo"/>` : `<div class="company-name">${config?.nome_azienda || 'KIPRI'}</div>`}
    </div>
    <div class="company-info">
      <div class="name">${config?.nome_azienda || ''}</div>
      ${config?.settore ? `<p>${config.settore}</p>` : ''}
      ${config?.codice_fiscale ? `<p>${isIT ? 'P.IVA / C.F.' : 'VAT / Co. No.'}: ${config.codice_fiscale}</p>` : ''}
      ${config?.iban ? `<p>IBAN: ${config.iban}</p>` : ''}
    </div>
  </div>

  <div class="title-row">
    <div class="invoice-label">${isIT ? 'FATTURA' : 'INVOICE'}</div>
    <div class="invoice-badge">
      <div class="num-label">${isIT ? 'Numero' : 'Number'}</div>
      <div class="num-value">#${fattura.numero}</div>
    </div>
  </div>

  <div class="meta-row">
    <div class="meta-box"><div class="label">${isIT ? 'Data emissione' : 'Issue date'}</div><div class="value">${new Date(fattura.data).toLocaleDateString('en-GB')}</div></div>
    <div class="meta-box"><div class="label">Status</div><div class="value" style="color:#15803D;">✓ ${isIT ? 'Emessa' : 'Issued'}</div></div>
    ${fattura.iva > 0 ? `<div class="meta-box"><div class="label">IVA / VAT</div><div class="value">${fattura.iva}%</div></div>` : ''}
  </div>

  <div class="parties">
    <div class="party-box">
      <div class="party-label">${isIT ? 'Da' : 'From'}</div>
      <div class="party-name">${config?.nome_azienda || ''}</div>
      ${config?.settore ? `<p>${config.settore}</p>` : ''}
      ${config?.codice_fiscale ? `<p>${isIT ? 'P.IVA / C.F.' : 'VAT No.'}: ${config.codice_fiscale}</p>` : ''}
    </div>
    <div class="party-box">
      <div class="party-label">${isIT ? 'Fatturato a' : 'Billed to'}</div>
      <div class="party-name">${cliente?.nome || ''}</div>
      ${cliente?.email ? `<p>${cliente.email}</p>` : ''}
      ${cliente?.tel ? `<p>${cliente.tel}</p>` : ''}
      ${cliente?.indirizzo ? `<p>${cliente.indirizzo}</p>` : ''}
    </div>
  </div>

  <table>
    <thead><tr>
      <th>${isIT ? 'Descrizione' : 'Description'}</th>
      <th style="text-align:center;">${isIT ? 'Qtà' : 'Qty'}</th>
      <th style="text-align:right;">${isIT ? 'Prezzo unitario' : 'Unit price'}</th>
      <th style="text-align:right;">Totale</th>
    </tr></thead>
    <tbody>
      ${servizi.map(s => `<tr>
        <td>${s.descrizione}</td>
        <td style="text-align:center;">${s.quantita}</td>
        <td style="text-align:right;">${curr}${parseFloat(s.prezzo).toFixed(2)}</td>
        <td style="text-align:right;">${curr}${((parseFloat(s.prezzo)||0)*(parseInt(s.quantita)||1)).toFixed(2)}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <div class="totals-wrapper">
    <div class="totals-box">
      <div class="total-row"><span>Subtotale</span><span>${curr}${subtot.toFixed(2)}</span></div>
      ${fattura.iva > 0 ? `<div class="total-row"><span>IVA/VAT ${fattura.iva}%</span><span>${curr}${ivaImp.toFixed(2)}</span></div>` : ''}
      <div class="total-final"><span>TOTALE</span><span>${curr}${fattura.totale.toFixed(2)}</span></div>
    </div>
  </div>

  ${config?.iban ? `<div class="payment-box"><div class="payment-label">${isIT ? 'Coordinate bancarie' : 'Payment details'}</div><div class="iban">${config.iban}</div>${config?.nome_banca ? `<div class="bank">${config.nome_banca}</div>` : ''}</div>` : ''}
  ${fattura.note ? `<div class="notes-box"><div class="notes-label">Note</div><p>${fattura.note}</p></div>` : ''}

  ${firma ? `<div class="firma-box"><div class="firma-inner"><div class="firma-label">${isIT ? 'Firma' : 'Signature'}</div><div class="firma-text">${firma}</div><div class="firma-name">${config?.nome_azienda || ''}</div></div></div>` : ''}

  <div class="footer"><p>Generated with <span class="kipri">KIPRI</span> · your business in your pocket</p></div>
</div>
</body>
</html>`;
  };

  const scaricaPDF = (fattura) => {
    const html = generaHTML(fattura, lang);
    const win = window.open('', '_blank');
    if (!win) { alert(lang === 'it' ? 'Abilita i popup per scaricare la fattura.' : 'Please allow popups to download the invoice.'); return; }
    win.document.write(html);
    win.document.close();
    win.onload = () => { win.focus(); win.print(); };
  };

  const inviaWhatsApp = (fattura) => {
    const cliente = clienti.find(c => c.id === fattura.cliente_id);
    const tel = cliente?.tel?.replace(/\D/g, '');
    const testo = lang === 'it'
      ? `Ciao ${cliente?.nome || ''}! 👋\nEcco la tua fattura #${fattura.numero} di ${currency}${parseFloat(fattura.totale).toFixed(2)}.\n\nGrazie!\n— ${config?.nome_azienda || ''}`
      : `Hi ${cliente?.nome || ''}! 👋\nPlease find your invoice #${fattura.numero} for ${currency}${parseFloat(fattura.totale).toFixed(2)}.\n\nThank you!\n— ${config?.nome_azienda || ''}`;
    const encoded = encodeURIComponent(testo);
    if (tel) { window.open(`https://wa.me/${tel}?text=${encoded}`, '_blank'); }
    else { window.open(`https://wa.me/?text=${encoded}`, '_blank'); }
  };

  const inviaEmail = (fattura) => {
    const cliente = clienti.find(c => c.id === fattura.cliente_id);
    if (!cliente?.email) { alert(lang === 'it' ? "Questo cliente non ha un'email." : 'This client has no email.'); return; }
    const subject = encodeURIComponent(`${lang === 'it' ? 'Fattura' : 'Invoice'} #${fattura.numero} - ${config?.nome_azienda || 'KIPRI'}`);
    const body = encodeURIComponent(lang === 'it'
      ? `Ciao ${cliente.nome},\n\nIn allegato trovi la fattura #${fattura.numero} di ${currency}${parseFloat(fattura.totale).toFixed(2)}.\n\nGrazie,\n${config?.nome_azienda || ''}`
      : `Hi ${cliente.nome},\n\nPlease find attached invoice #${fattura.numero} for ${currency}${parseFloat(fattura.totale).toFixed(2)}.\n\nThank you,\n${config?.nome_azienda || ''}`);
    window.location.href = `mailto:${cliente.email}?subject=${subject}&body=${body}`;
  };

  if (fatturaAperta) {
    const html = generaHTML(fatturaAperta, lang);
    return (
      <div style={{ fontFamily: "'Baloo 2', sans-serif" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button onClick={() => setFatturaAperta(null)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '12px', padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Baloo 2',sans-serif", fontWeight: '700', fontSize: '14px', color: '#64748B' }}>
            <ArrowLeft size={16} /> {lang === 'it' ? 'Indietro' : 'Back'}
          </button>
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <button onClick={() => scaricaPDF(fatturaAperta)} style={{ background: '#EEF8F2', border: 'none', borderRadius: '12px', padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Baloo 2',sans-serif", fontWeight: '700', fontSize: '13px', color: '#15803D' }}>
              <Download size={15} /> PDF
            </button>
            <button onClick={() => inviaWhatsApp(fatturaAperta)} style={{ background: '#DCFCE7', border: 'none', borderRadius: '12px', padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Baloo 2',sans-serif", fontWeight: '700', fontSize: '13px', color: '#15803D' }}>
              <MessageCircle size={15} /> WhatsApp
            </button>
            <button onClick={() => inviaEmail(fatturaAperta)} style={{ background: '#EFF6FF', border: 'none', borderRadius: '12px', padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Baloo 2',sans-serif", fontWeight: '700', fontSize: '13px', color: '#3B82F6' }}>
              <Mail size={15} /> Email
            </button>
          </div>
        </div>
        <iframe srcDoc={html} style={{ width: '100%', height: '72vh', border: '1px solid #E2E8F0', borderRadius: '16px' }} title="fattura" />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Baloo 2', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#1E293B' }}>{t('fatture_title')}</h2>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94A3B8' }}>{fatture.length} {t('fatture_emesse')}</p>
        </div>
        <button onClick={() => setMostraModale(true)} style={addBtn}><Plus size={20} /></button>
      </div>

      {fatture.length === 0 ? (
        <div style={emptyStyle}>
          <FileText size={32} color="#CBD5E1" />
          <p style={{ margin: '10px 0 16px', color: '#94A3B8', fontSize: '14px' }}>{t('fatture_empty')}</p>
          <button onClick={() => setMostraModale(true)} style={{ ...addBtn, width: 'auto', padding: '10px 20px', borderRadius: '12px', fontSize: '14px', fontFamily: "'Baloo 2',sans-serif" }}>
            {lang === 'it' ? '+ Nuova fattura' : '+ New invoice'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {fatture.map(f => {
            const cliente = clienti.find(c => c.id === f.cliente_id);
            return (
              <div key={f.id} style={{ ...cardStyle, cursor: 'pointer' }} onClick={() => setFatturaAperta(f)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#5D5C9E', background: '#EEEEF8', padding: '2px 10px', borderRadius: '20px' }}>#{f.numero}</span>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>{new Date(f.data).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B' }}>
                      {cliente?.nome || (lang === 'it' ? 'Cliente eliminato' : 'Client deleted')}
                    </div>
                    {f.iva > 0 && <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{t('fatture_ivaIncluded')} {f.iva}%</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#5D5C9E' }}>{currency}{parseFloat(f.totale).toFixed(2)}</span>
                    <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => scaricaPDF(f)} title="PDF" style={iconBtn('#EEF8F2', '#15803D')}><Download size={14} /></button>
                      <button onClick={() => inviaWhatsApp(f)} title="WhatsApp" style={iconBtn('#DCFCE7', '#15803D')}><MessageCircle size={14} /></button>
                      <button onClick={() => inviaEmail(f)} title="Email" style={iconBtn('#EFF6FF', '#3B82F6')}><Mail size={14} /></button>
                      <button onClick={() => setFatturaInModifica(f)} title={lang === 'it' ? 'Modifica' : 'Edit'} style={iconBtn('#EEEEF8', '#5D5C9E')}><Pencil size={14} /></button>
                      <button onClick={() => elimina(f.id)} title={lang === 'it' ? 'Elimina' : 'Delete'} style={iconBtn('#FEF2F2', '#EF4444')}><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mostraModale && (
        <ModaleFattura clienti={clienti} fattureCount={fatture.length} config={config} onSalva={handleSalva} onAnnulla={() => setMostraModale(false)} />
      )}
      {fatturaInModifica && (
        <ModaleFattura clienti={clienti} fattureCount={fatture.length} config={config} fatturaInModifica={fatturaInModifica} onSalva={handleModifica} onAnnulla={() => setFatturaInModifica(null)} />
      )}
    </div>
  );
}

const addBtn = { background: '#5D5C9E', color: 'white', border: 'none', width: '44px', height: '44px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const cardStyle = { background: 'white', borderRadius: '18px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' };
const iconBtn = (bg, color) => ({ background: bg, color, border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' });
const emptyStyle = { textAlign: 'center', padding: '40px', background: 'white', borderRadius: '20px', border: '2px dashed #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center' };
