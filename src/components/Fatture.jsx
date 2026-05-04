import React, { useState, useEffect } from 'react';
import { Plus, FileText, Download, Trash2 } from 'lucide-react';
import { useLang } from '../LanguageContext';
import ModaleFattura from './ModaleFattura';

export default function Fatture({ supabase, user, clienti, config }) {
  const { t, lang } = useLang();
  const [fatture, setFatture] = useState([]);
  const [mostraModale, setMostraModale] = useState(false);
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

  const elimina = async (id) => {
    if (!window.confirm(t('delete') + '?')) return;
    await supabase.from('fatture').delete().eq('id', id);
    fetchFatture();
  };

  const scaricaPDF = (fattura) => {
    const cliente = clienti.find(c => c.id === fattura.cliente_id);
    const servizi = fattura.servizi || [];
    const subtot = servizi.reduce((a, s) => a + (parseFloat(s.prezzo) || 0) * (parseInt(s.quantita) || 1), 0);
    const ivaImp = subtot * (fattura.iva / 100);
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
    <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;color:#1E293B;padding:40px;font-size:13px;}
    .header{display:flex;justify-content:space-between;margin-bottom:40px;border-bottom:3px solid #5D5C9E;padding-bottom:24px;}
    h1{font-size:26px;color:#5D5C9E;font-weight:900;}.ar{text-align:right;font-size:12px;color:#64748B;line-height:1.6;}
    .ft{font-size:22px;font-weight:800;color:#5D5C9E;margin-bottom:6px;}
    .meta{display:flex;gap:32px;margin-bottom:28px;}.mb{background:#F8F9FF;border-radius:10px;padding:12px 18px;}
    .ml{font-size:10px;color:#94A3B8;text-transform:uppercase;}.mv{font-size:14px;font-weight:700;color:#1E293B;margin-top:2px;}
    .cb{background:#F8F9FF;border-radius:10px;padding:14px 18px;margin-bottom:28px;}
    .cb h3{font-size:10px;color:#94A3B8;text-transform:uppercase;margin-bottom:6px;}
    table{width:100%;border-collapse:collapse;margin-bottom:20px;}
    th{background:#5D5C9E;color:white;padding:9px 12px;text-align:left;font-size:11px;}
    td{padding:9px 12px;border-bottom:1px solid #F1F5F9;font-size:12px;}
    .tot{display:flex;justify-content:flex-end;}.tb{width:240px;}
    .tr{display:flex;justify-content:space-between;padding:6px 0;font-size:12px;border-bottom:1px solid #F1F5F9;}
    .tf{display:flex;justify-content:space-between;padding:10px 0;font-size:15px;font-weight:800;color:#5D5C9E;}
    .foot{margin-top:40px;text-align:center;font-size:11px;color:#94A3B8;border-top:1px solid #F1F5F9;padding-top:14px;}
    </style></head><body>
    <div class="header">
      <div>${config?.logo_url ? `<img src="${config.logo_url}" style="height:46px"/>` : `<h1>${config?.nome_azienda || 'KIPRI'}</h1>`}</div>
      <div class="ar"><p style="font-size:14px;font-weight:800;color:#1E293B;">${config?.nome_azienda || ''}</p><p>${config?.settore || ''}</p><p>${config?.email_business || ''}</p></div>
    </div>
    <div class="ft">${lang === 'it' ? 'FATTURA' : 'INVOICE'}</div>
    <div class="meta">
      <div class="mb"><div class="ml">${lang === 'it' ? 'Numero' : 'Number'}</div><div class="mv">${fattura.numero}</div></div>
      <div class="mb"><div class="ml">Date</div><div class="mv">${new Date(fattura.data).toLocaleDateString('en-GB')}</div></div>
    </div>
    <div class="cb"><h3>${lang === 'it' ? 'Fatturato a' : 'Billed to'}</h3>
      <p style="font-size:13px;font-weight:700;">${cliente?.nome || ''}</p>
      <span style="font-size:11px;color:#64748B;">${cliente?.email || ''} ${cliente?.tel ? '· ' + cliente.tel : ''}</span>
    </div>
    <table><thead><tr>
      <th>${lang === 'it' ? 'Descrizione' : 'Description'}</th>
      <th style="text-align:center;">${lang === 'it' ? 'Qtà' : 'Qty'}</th>
      <th style="text-align:right;">${lang === 'it' ? 'Prezzo' : 'Price'}</th>
      <th style="text-align:right;">Totale</th>
    </tr></thead><tbody>
    ${servizi.map(s => `<tr><td>${s.descrizione}</td><td style="text-align:center;">${s.quantita}</td><td style="text-align:right;">${currency}${parseFloat(s.prezzo).toFixed(2)}</td><td style="text-align:right;">${currency}${((parseFloat(s.prezzo)||0)*(parseInt(s.quantita)||1)).toFixed(2)}</td></tr>`).join('')}
    </tbody></table>
    <div class="tot"><div class="tb">
      <div class="tr"><span>Subtotale</span><span>${currency}${subtot.toFixed(2)}</span></div>
      ${fattura.iva > 0 ? `<div class="tr"><span>IVA/VAT ${fattura.iva}%</span><span>${currency}${ivaImp.toFixed(2)}</span></div>` : ''}
      <div class="tf"><span>TOTALE</span><span>${currency}${fattura.totale.toFixed(2)}</span></div>
    </div></div>
    ${fattura.note ? `<div style="margin-top:24px;background:#F8F9FF;border-radius:10px;padding:12px 16px;"><p style="font-size:11px;color:#94A3B8;text-transform:uppercase;margin-bottom:4px;">Note</p><p style="font-size:12px;">${fattura.note}</p></div>` : ''}
    <div class="foot">Generated with KIPRI · your business in your pocket</div>
    </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${lang === 'it' ? 'fattura' : 'invoice'}-${fattura.numero}.html`; a.click();
    URL.revokeObjectURL(url);
  };

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
              <div key={f.id} style={cardStyle}>
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
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => scaricaPDF(f)} style={iconBtn('#EEF8F2', '#15803D')}><Download size={14} /></button>
                      <button onClick={() => elimina(f.id)} style={iconBtn('#FEF2F2', '#EF4444')}><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mostraModale && (
        <ModaleFattura
          clienti={clienti}
          fattureCount={fatture.length}
          onSalva={handleSalva}
          onAnnulla={() => setMostraModale(false)}
        />
      )}
    </div>
  );
}

const addBtn = { background: '#5D5C9E', color: 'white', border: 'none', width: '44px', height: '44px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const cardStyle = { background: 'white', borderRadius: '18px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' };
const iconBtn = (bg, color) => ({ background: bg, color, border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' });
const emptyStyle = { textAlign: 'center', padding: '40px', background: 'white', borderRadius: '20px', border: '2px dashed #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center' };
