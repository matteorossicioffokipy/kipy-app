import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, Download, Trash2 } from 'lucide-react';
import { useLang } from '../LanguageContext';
import ModaleFinanza from './ModaleFinanza';

export default function Finanze({ supabase, user }) {
  const { t, lang } = useLang();
  const [movimenti, setMovimenti] = useState([]);
  const [mostraModale, setMostraModale] = useState(false);
  const [meseSelezionato, setMeseSelezionato] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const currency = lang === 'it' ? '€' : '£';

  const fetchMovimenti = async () => {
    const { data } = await supabase.from('movimenti').select('*')
      .eq('user_id', user.id).order('data', { ascending: false });
    setMovimenti(data || []);
  };

  useEffect(() => { fetchMovimenti(); }, []);

  const movimentiFiltrati = movimenti.filter(m => m.data?.startsWith(meseSelezionato));
  const totEntrate = movimentiFiltrati.filter(m => m.tipo === 'entrata').reduce((a, m) => a + parseFloat(m.importo), 0);
  const totUscite = movimentiFiltrati.filter(m => m.tipo === 'uscita').reduce((a, m) => a + parseFloat(m.importo), 0);
  const saldo = totEntrate - totUscite;

  const handleSalva = async (formData) => {
    const { error } = await supabase.from('movimenti').insert([{
      user_id: user.id,
      tipo: formData.tipo,
      importo: formData.importo,
      categoria: formData.categoria,
      descrizione: formData.descrizione,
      data: formData.data,
    }]);
    if (!error) { setMostraModale(false); fetchMovimenti(); }
    else alert(t('error') + ': ' + error.message);
  };

  const elimina = async (id) => {
    if (!window.confirm(t('delete') + '?')) return;
    await supabase.from('movimenti').delete().eq('id', id);
    fetchMovimenti();
  };

  const scaricaReport = () => {
    const [anno, mese] = meseSelezionato.split('-');
    const nomeMese = new Date(anno, parseInt(mese) - 1, 1)
      .toLocaleDateString(lang === 'en' ? 'en-GB' : 'it-IT', { month: 'long', year: 'numeric' });
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
    <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;color:#1E293B;padding:40px;font-size:13px;}
    h1{font-size:22px;font-weight:900;color:#5D5C9E;margin-bottom:4px;}.sub{color:#94A3B8;font-size:12px;margin-bottom:28px;}
    .sum{display:flex;gap:14px;margin-bottom:28px;}.sb{flex:1;border-radius:12px;padding:14px 18px;}
    .sl{font-size:10px;text-transform:uppercase;letter-spacing:1px;opacity:.7;}.sv{font-size:22px;font-weight:900;margin-top:4px;}
    .e{background:#EEF8F2;color:#15803D;}.u{background:#FEF2F2;color:#EF4444;}.s{background:#EEEEF8;color:#5D5C9E;}
    h2{font-size:13px;font-weight:800;margin:20px 0 10px;padding-bottom:5px;border-bottom:2px solid #F1F5F9;}
    table{width:100%;border-collapse:collapse;margin-bottom:8px;}
    th{background:#F8F9FF;padding:7px 10px;text-align:left;font-size:10px;text-transform:uppercase;color:#94A3B8;}
    td{padding:8px 10px;border-bottom:1px solid #F8F9FF;font-size:12px;}
    .ie{color:#15803D;font-weight:700;}.iu{color:#EF4444;font-weight:700;}
    .foot{margin-top:36px;text-align:center;font-size:11px;color:#94A3B8;}
    </style></head><body>
    <h1>${lang === 'en' ? 'Financial Report' : 'Report Finanziario'}</h1>
    <div class="sub">${nomeMese}</div>
    <div class="sum">
      <div class="sb e"><div class="sl">${t('finanze_income')}</div><div class="sv">${currency}${totEntrate.toFixed(2)}</div></div>
      <div class="sb u"><div class="sl">${t('finanze_expenses')}</div><div class="sv">${currency}${totUscite.toFixed(2)}</div></div>
      <div class="sb s"><div class="sl">${t('finanze_balance')}</div><div class="sv">${currency}${saldo.toFixed(2)}</div></div>
    </div>
    <h2>${t('finanze_income')}</h2>
    <table><thead><tr><th>${lang === 'it' ? 'Data' : 'Date'}</th><th>${lang === 'it' ? 'Categoria' : 'Category'}</th><th>${lang === 'it' ? 'Descrizione' : 'Description'}</th><th style="text-align:right;">${lang === 'it' ? 'Importo' : 'Amount'}</th></tr></thead>
    <tbody>${movimentiFiltrati.filter(m => m.tipo === 'entrata').map(m => `<tr><td>${new Date(m.data).toLocaleDateString('en-GB')}</td><td>${m.categoria}</td><td>${m.descrizione || '—'}</td><td style="text-align:right;" class="ie">+${currency}${parseFloat(m.importo).toFixed(2)}</td></tr>`).join('')}</tbody></table>
    <h2>${t('finanze_expenses')}</h2>
    <table><thead><tr><th>${lang === 'it' ? 'Data' : 'Date'}</th><th>${lang === 'it' ? 'Categoria' : 'Category'}</th><th>${lang === 'it' ? 'Descrizione' : 'Description'}</th><th style="text-align:right;">${lang === 'it' ? 'Importo' : 'Amount'}</th></tr></thead>
    <tbody>${movimentiFiltrati.filter(m => m.tipo === 'uscita').map(m => `<tr><td>${new Date(m.data).toLocaleDateString('en-GB')}</td><td>${m.categoria}</td><td>${m.descrizione || '—'}</td><td style="text-align:right;" class="iu">-${currency}${parseFloat(m.importo).toFixed(2)}</td></tr>`).join('')}</tbody></table>
    <div class="foot">Generated with KIPRI · your business in your pocket</div>
    </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `report-${meseSelezionato}.html`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ fontFamily: "'Baloo 2', sans-serif" }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#1E293B' }}>{t('finanze_title')}</h2>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94A3B8' }}>{t('finanze_subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={scaricaReport} style={{ background: '#EEF8F2', color: '#15803D', border: 'none', width: '44px', height: '44px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('finanze_report')}><Download size={20} /></button>
          <button onClick={() => setMostraModale(true)} style={addBtn}><Plus size={20} /></button>
        </div>
      </div>

      {/* FILTRO MESE */}
      <div style={{ marginBottom: '16px' }}>
        <input type="month" value={meseSelezionato}
          onChange={e => setMeseSelezionato(e.target.value)}
          style={{ padding: '9px 13px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontFamily: "'Baloo 2',sans-serif", fontWeight: '700', outline: 'none', background: 'white' }} />
      </div>

      {/* SUMMARY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '20px' }}>
        <div style={summaryCard('#EEF8F2', '#15803D')}>
          <TrendingUp size={16} color="#15803D" />
          <div style={{ fontSize: '11px', marginTop: '4px' }}>{t('finanze_income')}</div>
          <div style={{ fontSize: '20px', fontWeight: '800' }}>{currency}{totEntrate.toFixed(2)}</div>
        </div>
        <div style={summaryCard('#FEF2F2', '#EF4444')}>
          <TrendingDown size={16} color="#EF4444" />
          <div style={{ fontSize: '11px', marginTop: '4px' }}>{t('finanze_expenses')}</div>
          <div style={{ fontSize: '20px', fontWeight: '800' }}>{currency}{totUscite.toFixed(2)}</div>
        </div>
        <div style={summaryCard(saldo >= 0 ? '#EEEEF8' : '#FEF2F2', saldo >= 0 ? '#5D5C9E' : '#EF4444')}>
          <div style={{ fontSize: '11px', marginTop: '4px', textAlign: 'center', width: '100%' }}>{t('finanze_balance')}</div>
          <div style={{ fontSize: '20px', fontWeight: '800' }}>{currency}{saldo.toFixed(2)}</div>
        </div>
      </div>

      {/* LISTA */}
      {movimentiFiltrati.length === 0 ? (
        <div style={emptyStyle}>
          <TrendingUp size={32} color="#CBD5E1" />
          <p style={{ margin: '10px 0 0', color: '#94A3B8', fontSize: '14px' }}>{t('finanze_noMovements')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {movimentiFiltrati.map(m => (
            <div key={m.id} style={{ background: 'white', borderRadius: '14px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderLeft: `4px solid ${m.tipo === 'entrata' ? '#70C18E' : '#EF4444'}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 10px', borderRadius: '20px', background: m.tipo === 'entrata' ? '#EEF8F2' : '#FEF2F2', color: m.tipo === 'entrata' ? '#15803D' : '#EF4444' }}>{m.categoria}</span>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>{new Date(m.data).toLocaleDateString('en-GB')}</span>
                </div>
                {m.descrizione && <div style={{ fontSize: '13px', color: '#1E293B', fontWeight: '600', marginTop: '4px' }}>{m.descrizione}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px', fontWeight: '800', color: m.tipo === 'entrata' ? '#15803D' : '#EF4444' }}>
                  {m.tipo === 'entrata' ? '+' : '-'}{currency}{parseFloat(m.importo).toFixed(2)}
                </span>
                <button onClick={() => elimina(m.id)} style={iconBtn('#F1F5F9', '#94A3B8')}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALE */}
      {mostraModale && (
        <ModaleFinanza
          onSalva={handleSalva}
          onAnnulla={() => setMostraModale(false)}
        />
      )}
    </div>
  );
}

const summaryCard = (bg, color) => ({ background: bg, borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color });
const addBtn = { background: '#5D5C9E', color: 'white', border: 'none', width: '44px', height: '44px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const iconBtn = (bg, color) => ({ background: bg, color, border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' });
const emptyStyle = { textAlign: 'center', padding: '40px', background: 'white', borderRadius: '20px', border: '2px dashed #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center' };
