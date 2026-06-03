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
  const [scaricando, setScaricando] = useState(false);
  const [mostraMenu, setMostraMenu] = useState(false);
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
    body { font-family:'Inter',Arial,sans-serif; color:#1E293B; background:white; font-size:13px; }
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
    .payment-label { font-size:10px; color:#7B7BC0; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; font-weight:700; }
    .payment-row { display:flex; gap:24px; flex-wrap:wrap; }
    .payment-item .pi-label { font-size:10px; color:#7B7BC0; margin-bottom:3px; }
    .payment-item .pi-value { font-size:13px; font-weight:800; color:#5D5C9E; }
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
    @media (max-width: 600px) {
      .page { padding:24px 20px; min-height:auto; }
      .header { flex-direction:column; gap:12px; }
      .company-info { text-align:left; }
      .title-row { flex-direction:column; gap:12px; align-items:flex-start; }
      .invoice-label { font-size:28px; }
      .invoice-badge { text-align:left; padding:8px 14px; }
      .invoice-badge .num-value { font-size:16px; }
      .meta-row { flex-direction:column; gap:8px; }
      .parties { grid-template-columns:1fr; gap:10px; }
      table { font-size:12px; }
      th { padding:9px 8px; font-size:10px; }
      td { padding:9px 8px; font-size:12px; }
      th:nth-child(3), td:nth-child(3) { display:none; }
      .totals-wrapper { justify-content:stretch; }
      .totals-box { width:100%; }
      .total-final { font-size:15px; padding:10px 14px; }
      .payment-box { padding:12px 14px; }
      .payment-row { flex-direction:column; gap:10px; }
      .firma-box { justify-content:center; }
    }
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

  ${(config?.iban || config?.nome_banca || config?.link_pagamento) ? `
  <div class="payment-box">
    <div class="payment-label">${isIT ? 'Dettagli pagamento' : 'Payment details'}</div>
    <div class="payment-row">
      ${config?.iban ? `<div class="payment-item"><div class="pi-label">IBAN</div><div class="pi-value">${config.iban}</div></div>` : ''}
      ${config?.nome_banca ? `<div class="payment-item"><div class="pi-label">${isIT ? 'Banca' : 'Bank'}</div><div class="pi-value">${config.nome_banca}</div></div>` : ''}
      ${config?.codice_fiscale ? `<div class="payment-item"><div class="pi-label">${isIT ? 'P.IVA / C.F.' : 'VAT / Co. No.'}</div><div class="pi-value">${config.codice_fiscale}</div></div>` : ''}
    </div>
  </div>` : ''}

  ${fattura.note ? `<div class="notes-box"><div class="notes-label">Note</div><p>${fattura.note}</p></div>` : ''}

  ${firma ? `<div class="firma-box"><div class="firma-inner"><div class="firma-label">${isIT ? 'Firma' : 'Signature'}</div><div class="firma-text">${firma}</div><div class="firma-name">${config?.nome_azienda || ''}</div></div></div>` : ''}

  <div class="footer"><p>Generated with <span class="kipri">KIPRI</span> · your business in your pocket</p></div>
</div>
</body>
</html>`;
  };

  const scaricaImmagine = async (fattura) => {
    setMostraMenu(false);
    setScaricando(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const html = generaHTML(fattura, lang);
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;top:-9999px;left:0;width:390px;background:white;z-index:-1;';
      container.innerHTML = html;
      document.body.appendChild(container);
      await new Promise(r => setTimeout(r, 800));
      const page = container.querySelector('.page') || container;
      const canvas = await html2canvas(page, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff',
        width: page.scrollWidth, height: page.scrollHeight, windowWidth: 390,
      });
      document.body.removeChild(container);
      const link = document.createElement('a');
      link.download = `fattura-${fattura.numero}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } catch (err) {
      console.error(err);
      alert(lang === 'it' ? 'Errore nel salvataggio. Riprova.' : 'Error saving. Please try again.');
    }
    setScaricando(false);
  };

  const scaricaPDF = async (fattura) => {
    setMostraMenu(false);
    setScaricando(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const html = generaHTML(fattura, lang);
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;top:-9999px;left:0;width:794px;background:white;z-index:-1;';
      container.innerHTML = html;
      document.body.appendChild(container);
      await new Promise(r => setTimeout(r, 800));

      const page = container.querySelector('.page') || container;
      const canvas = await html2canvas(page, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff',
        width: 794, windowWidth: 794,
      });
      document.body.removeChild(container);

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgData = canvas.toDataURL('image/png');
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pdfW) / canvas.width;

      let posY = 0;
      let remaining = imgH;
      let first = true;
      while (remaining > 0) {
        if (!first) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -posY, pdfW, imgH);
        posY += pdfH;
        remaining -= pdfH;
        first = false;
      }
      pdf.save(`fattura-${fattura.numero}.pdf`);
    } catch (err) {
      console.error(err);
      const html = generaHTML(fattura, lang);
      const win = window.open('', '_blank');
      if (win) { win.document.write(html); win.document.close(); win.onload = () => { win.print(); }; }
    }
    setScaricando(false);
  };

  const scaricaImmagineA4 = async (fattura) => {
    setMostraMenu(false);
    setScaricando(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const html = generaHTML(fattura, lang);
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;top:-9999px;left:0;width:794px;background:white;z-index:-1;';
      container.innerHTML = html;
      document.body.appendChild(container);
      await new Promise(r => setTimeout(r, 800));
      const page = container.querySelector('.page') || container;
      // A4 ratio: 794 x 1123px
      const canvas = await html2canvas(page, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff',
        width: 794, height: 1123, windowWidth: 794,
      });
      document.body.removeChild(container);
      const link = document.createElement('a');
      link.download = `fattura-${fattura.numero}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } catch (err) {
      console.error(err);
      alert(lang === 'it' ? 'Errore. Riprova.' : 'Error. Please try again.');
    }
    setScaricando(false);
  };

  const inviaWhatsApp = (fattura) => {
    const cliente = clienti.find(c => c.id === fattura.cliente_id);
    const tel = cliente?.tel?.replace(/\D/g, '');
    const testo = lang === 'it'
      ? `Ciao ${cliente?.nome || ''}! 👋\nEcco la tua fattura #${fattura.numero} di ${currency}${parseFloat(fattura.totale).toFixed(2)}.\n\nGrazie!\n— ${config?.nome_azienda || ''}`
      : `Hi ${cliente?.nome || ''}! 👋\nPlease find your invoice #${fattura.numero} for ${currency}${parseFloat(fattura.totale).toFixed(2)}.\n\nThank you!\n— ${config?.nome_azienda || ''}`;
    const encoded = encodeURIComponent(testo);
    if (tel) window.open(`https://wa.me/${tel}?text=${encoded}`, '_blank');
    else window.open(`https://wa.me/?text=${encoded}`, '_blank');
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

  // Vista fattura aperta
  if (fatturaAperta) {
    const html = generaHTML(fatturaAperta, lang);
    return (
      <div style={{ fontFamily: "'Baloo 2', sans-serif" }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button onClick={() => { setFatturaAperta(null); setMostraMenu(false); }} style={{ background: '#F1F5F9', border: 'none', borderRadius: '12px', padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Baloo 2',sans-serif", fontWeight: '700', fontSize: '13px', color: '#64748B' }}>
            <ArrowLeft size={15} /> {lang === 'it' ? 'Indietro' : 'Back'}
          </button>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMostraMenu(!mostraMenu)}
              disabled={scaricando}
              style={{ background: '#5D5C9E', border: 'none', borderRadius: '12px', padding: '10px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Baloo 2',sans-serif", fontWeight: '700', fontSize: '14px', color: 'white', opacity: scaricando ? 0.6 : 1 }}
            >
              {scaricando ? '...' : (lang === 'it' ? 'Condividi ▾' : 'Share ▾')}
            </button>
            {mostraMenu && (
              <div onClick={() => setMostraMenu(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }} />
            )}
            {mostraMenu && (
              <div style={{ position: 'absolute', right: 0, top: '52px', background: 'white', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid #F1F5F9', zIndex: 100, minWidth: '180px', overflow: 'hidden' }}>
                <button onClick={() => scaricaPDF(fatturaAperta)} style={menuItemStyle}>
                  <Download size={16} color="#15803D" /> <span>{lang === 'it' ? 'Scarica PDF' : 'Download PDF'}</span>
                </button>
                <button onClick={() => scaricaImmagineA4(fatturaAperta)} style={menuItemStyle}>
                  <FileText size={16} color="#5D5C9E" /> <span>{lang === 'it' ? 'Salva come immagine A4' : 'Save as A4 image'}</span>
                </button>
                <button onClick={() => { setMostraMenu(false); inviaWhatsApp(fatturaAperta); }} style={menuItemStyle}>
                  <MessageCircle size={16} color="#22C55E" /> <span>WhatsApp</span>
                </button>
                <button onClick={() => { setMostraMenu(false); inviaEmail(fatturaAperta); }} style={{ ...menuItemStyle, borderBottom: 'none' }}>
                  <Mail size={16} color="#3B82F6" /> <span>Email</span>
                </button>
              </div>
            )}
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
const menuItemStyle = { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '13px 16px', background: 'white', border: 'none', borderBottom: '1px solid #F1F5F9', cursor: 'pointer', fontFamily: "'Baloo 2',sans-serif", fontWeight: '700', fontSize: '14px', color: '#1E293B', textAlign: 'left' };
