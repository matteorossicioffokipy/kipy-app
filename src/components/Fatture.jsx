import React, { useState, useEffect } from 'react';
import { Plus, FileText, Download, Trash2, ChevronUp } from 'lucide-react';
import { useLang } from '../LanguageContext';

export default function Fatture({ supabase, user, clienti, config }) {
  const { t } = useLang();
  const [fatture, setFatture] = useState([]);
  const [mostraForm, setMostraForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    numero: '', data: oggi(), cliente_id: '',
    iva: '0', note: '',
    servizi: [{ descrizione: '', quantita: 1, prezzo: '' }]
  });

  function oggi() {
    const d = new Date();
    return d.toLocaleDateString('en-CA');
  }

  const fetchFatture = async () => {
    const { data } = await supabase.from('fatture').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false });
    setFatture(data || []);
  };

  useEffect(() => { fetchFatture(); }, []);

  const subtotale = form.servizi.reduce((acc, s) => acc + (parseFloat(s.prezzo) || 0) * (parseInt(s.quantita) || 1), 0);
  const ivaImporto = subtotale * (parseInt(form.iva) / 100);
  const totale = subtotale + ivaImporto;

  const aggiungiServizio = () => setForm({ ...form, servizi: [...form.servizi, { descrizione: '', quantita: 1, prezzo: '' }] });
  const rimuoviServizio = (i) => setForm({ ...form, servizi: form.servizi.filter((_, idx) => idx !== i) });
  const aggiornaServizio = (i, campo, valore) => {
    const nuovi = [...form.servizi];
    nuovi[i][campo] = valore;
    setForm({ ...form, servizi: nuovi });
  };

  const salveFattura = async () => {
    if (!form.cliente_id) return alert(t('fatture_selectClientAlert'));
    if (form.servizi.some(s => !s.descrizione || !s.prezzo)) return alert(t('fatture_fillServices'));
    setLoading(true);
    const { error } = await supabase.from('fatture').insert([{
      user_id: user.id,
      numero: form.numero || `${new Date().getFullYear()}-${String(fatture.length + 1).padStart(3, '0')}`,
      data: form.data, cliente_id: parseInt(form.cliente_id),
      servizi: form.servizi, iva: parseInt(form.iva), totale, note: form.note
    }]);
    if (!error) {
      setMostraForm(false);
      setForm({ numero: '', data: oggi(), cliente_id: '', iva: '0', note: '', servizi: [{ descrizione: '', quantita: 1, prezzo: '' }] });
      fetchFatture();
    } else alert(t('error') + ': ' + error.message);
    setLoading(false);
  };

  const eliminaFattura = async (id) => {
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
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;border-bottom:3px solid #5D5C9E;padding-bottom:24px;}
    .logo-area h1{font-size:28px;color:#5D5C9E;font-weight:900;}.azienda-info{text-align:right;}.azienda-info p{font-size:12px;color:#64748B;line-height:1.6;}
    .fattura-title{font-size:22px;font-weight:800;color:#5D5C9E;margin-bottom:6px;}
    .meta{display:flex;gap:40px;margin-bottom:32px;}.meta-box{background:#F8F9FF;border-radius:10px;padding:14px 20px;}
    .meta-label{font-size:10px;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;}.meta-value{font-size:15px;font-weight:700;color:#1E293B;margin-top:2px;}
    .cliente-box{background:#F8F9FF;border-radius:10px;padding:16px 20px;margin-bottom:32px;}
    .cliente-box h3{font-size:11px;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;}
    .cliente-box p{font-size:14px;font-weight:700;color:#1E293B;}.cliente-box span{font-size:12px;color:#64748B;}
    table{width:100%;border-collapse:collapse;margin-bottom:24px;}
    th{background:#5D5C9E;color:white;padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;}
    td{padding:10px 14px;border-bottom:1px solid #F1F5F9;font-size:13px;}tr:last-child td{border-bottom:none;}
    .totali{display:flex;justify-content:flex-end;}.totali-box{width:260px;}
    .totali-row{display:flex;justify-content:space-between;padding:7px 0;font-size:13px;border-bottom:1px solid #F1F5F9;}
    .totali-finale{display:flex;justify-content:space-between;padding:12px 0;font-size:16px;font-weight:800;color:#5D5C9E;}
    .footer{margin-top:48px;text-align:center;font-size:11px;color:#94A3B8;border-top:1px solid #F1F5F9;padding-top:16px;}
    </style></head><body>
    <div class="header"><div class="logo-area">${config?.logo_url ? `<img src="${config.logo_url}" style="height:50px"/>` : `<h1>${config?.nome_azienda || 'KIPY'}</h1>`}</div>
    <div class="azienda-info"><p style="font-size:15px;font-weight:800;color:#1E293B;">${config?.nome_azienda || ''}</p><p>${config?.settore || ''}</p><p>${config?.email_business || ''}</p><p>${config?.telefono_business || ''}</p></div></div>
    <div class="fattura-title">INVOICE</div>
    <div class="meta"><div class="meta-box"><div class="meta-label">Number</div><div class="meta-value">${fattura.numero}</div></div>
    <div class="meta-box"><div class="meta-label">Date</div><div class="meta-value">${new Date(fattura.data).toLocaleDateString('en-GB')}</div></div></div>
    <div class="cliente-box"><h3>Billed to</h3><p>${cliente?.nome || 'Client'}</p><span>${cliente?.email || ''} ${cliente?.tel ? '· ' + cliente.tel : ''}</span></div>
    <table><thead><tr><th>Description</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th><th style="text-align:right;">Total</th></tr></thead>
    <tbody>${servizi.map(s => `<tr><td>${s.descrizione}</td><td style="text-align:center;">${s.quantita}</td><td style="text-align:right;">£${parseFloat(s.prezzo).toFixed(2)}</td><td style="text-align:right;">£${((parseFloat(s.prezzo) || 0) * (parseInt(s.quantita) || 1)).toFixed(2)}</td></tr>`).join('')}</tbody></table>
    <div class="totali"><div class="totali-box"><div class="totali-row"><span>Subtotal</span><span>£${subtot.toFixed(2)}</span></div>
    ${fattura.iva > 0 ? `<div class="totali-row"><span>VAT ${fattura.iva}%</span><span>£${ivaImp.toFixed(2)}</span></div>` : ''}
    <div class="totali-finale"><span>TOTAL</span><span>£${fattura.totale.toFixed(2)}</span></div></div></div>
    ${fattura.note ? `<div style="margin-top:32px;background:#F8F9FF;border-radius:10px;padding:14px 20px;"><h4 style="font-size:11px;color:#94A3B8;text-transform:uppercase;margin-bottom:6px;">Notes</h4><p>${fattura.note}</p></div>` : ''}
    <div class="footer">Generated with KIPY · your business in your pocket</div></body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `invoice-${fattura.numero}.html`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ fontFamily: "'Baloo 2', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#1E293B' }}>{t('fatture_title')}</h2>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94A3B8' }}>{fatture.length} {t('fatture_emesse')}</p>
        </div>
        <button onClick={() => setMostraForm(!mostraForm)} style={addBtnStyle}>
          {mostraForm ? <ChevronUp size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {mostraForm && (
        <div style={cardStyle}>
          <div style={sectionTitleStyle}><FileText size={16} color="#5D5C9E" />{t('fatture_new')}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>{t('fatture_number')}</label>
              <input style={inputStyle} placeholder="Auto" value={form.numero} onChange={e => setForm({ ...form, numero: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>{t('fatture_date')}</label>
              <input style={inputStyle} type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>{t('fatture_client')}</label>
            <select style={inputStyle} value={form.cliente_id} onChange={e => setForm({ ...form, cliente_id: e.target.value })}>
              <option value="">{t('fatture_selectClient')}</option>
              {clienti.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={labelStyle}>{t('fatture_services')}</label>
              <button onClick={aggiungiServizio} style={smallBtnStyle}>{t('fatture_addService')}</button>
            </div>
            {form.servizi.map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 80px 32px', gap: '6px', marginBottom: '8px' }}>
                <input style={inputStyle} placeholder={t('fatture_description')} value={s.descrizione} onChange={e => aggiornaServizio(i, 'descrizione', e.target.value)} />
                <input style={{ ...inputStyle, textAlign: 'center' }} placeholder={t('fatture_qty')} type="number" min="1" value={s.quantita} onChange={e => aggiornaServizio(i, 'quantita', e.target.value)} />
                <input style={{ ...inputStyle, textAlign: 'right' }} placeholder={t('fatture_price')} type="number" step="0.01" value={s.prezzo} onChange={e => aggiornaServizio(i, 'prezzo', e.target.value)} />
                {form.servizi.length > 1 && (
                  <button onClick={() => rimuoviServizio(i)} style={{ ...smallBtnStyle, background: '#FEF2F2', color: '#EF4444', padding: '8px' }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>{t('fatture_iva')}</label>
              <select style={inputStyle} value={form.iva} onChange={e => setForm({ ...form, iva: e.target.value })}>
                <option value="0">{t('fatture_ivaExempt')}</option>
                <option value="4">4%</option>
                <option value="10">10%</option>
                <option value="20">20%</option>
                <option value="22">22%</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={totaleBoxStyle}>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>{t('fatture_total')}</span>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#5D5C9E' }}>£{totale.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>{t('fatture_notes')}</label>
            <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
              placeholder={t('fatture_notesPlaceholder')} value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setMostraForm(false)} style={cancelBtn}>{t('cancel')}</button>
            <button onClick={salveFattura} disabled={loading} style={saveBtn}>
              {loading ? t('loading') : t('fatture_save')}
            </button>
          </div>
        </div>
      )}

      {fatture.length === 0 && !mostraForm ? (
        <div style={emptyStyle}>
          <FileText size={32} color="#CBD5E1" />
          <p style={{ margin: '10px 0 0', color: '#94A3B8', fontSize: '14px' }}>{t('fatture_empty')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          {fatture.map(f => {
            const cliente = clienti.find(c => c.id === f.cliente_id);
            return (
              <div key={f.id} style={fatturaCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#5D5C9E', background: '#EEEEF8', padding: '2px 10px', borderRadius: '20px' }}>#{f.numero}</span>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>{new Date(f.data).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B' }}>{cliente?.nome || 'Client deleted'}</div>
                    {f.iva > 0 && <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{t('fatture_ivaIncluded')} {f.iva}%</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#5D5C9E' }}>£{parseFloat(f.totale).toFixed(2)}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => scaricaPDF(f)} style={iconBtnStyle('#EEF8F2', '#15803D')} title={t('fatture_download')}><Download size={14} /></button>
                      <button onClick={() => eliminaFattura(f.id)} style={iconBtnStyle('#FEF2F2', '#EF4444')} title={t('delete')}><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const cardStyle = { background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9', marginBottom: '12px' };
const sectionTitleStyle = { fontSize: '15px', fontWeight: '800', color: '#1E293B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' };
const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '5px' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontFamily: "'Baloo 2', sans-serif", color: '#1E293B', outline: 'none', boxSizing: 'border-box' };
const addBtnStyle = { background: '#5D5C9E', color: 'white', border: 'none', width: '44px', height: '44px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const smallBtnStyle = { background: '#EEEEF8', color: '#5D5C9E', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' };
const totaleBoxStyle = { background: '#EEEEF8', borderRadius: '12px', padding: '10px 14px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' };
const saveBtn = { flex: 1, background: '#5D5C9E', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '15px' };
const cancelBtn = { flex: 1, background: '#F1F5F9', color: '#64748B', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '15px' };
const fatturaCardStyle = { background: 'white', borderRadius: '18px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' };
const iconBtnStyle = (bg, color) => ({ background: bg, color: color, border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' });
const emptyStyle = { textAlign: 'center', padding: '40px', background: 'white', borderRadius: '20px', border: '2px dashed #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center' };