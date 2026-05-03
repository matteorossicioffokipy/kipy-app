import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, Download, Trash2, ChevronUp } from 'lucide-react';
import { useLang } from '../LanguageContext';

const CATEGORIE_ENTRATE_IT = ['Servizio', 'Consulenza', 'Prodotto', 'Abbonamento', 'Altro'];
const CATEGORIE_USCITE_IT = ['Materiali', 'Affitto', 'Utenze', 'Marketing', 'Software', 'Trasporti', 'Altro'];
const CATEGORIE_ENTRATE_EN = ['Service', 'Consulting', 'Product', 'Subscription', 'Other'];
const CATEGORIE_USCITE_EN = ['Materials', 'Rent', 'Utilities', 'Marketing', 'Software', 'Transport', 'Other'];

export default function Finanze({ supabase, user }) {
  const { t, lang } = useLang();
  const [movimenti, setMovimenti] = useState([]);
  const [mostraForm, setMostraForm] = useState(false);
  const [tipoForm, setTipoForm] = useState('entrata');
  const [meseSelezionato, setMeseSelezionato] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [form, setForm] = useState({
    importo: '', categoria: '', descrizione: '',
    data: new Date().toLocaleDateString('en-CA')
  });

  // Valuta in base alla lingua
  const currency = lang === 'it' ? '€' : '£';

  const CATEntrate = lang === 'en' ? CATEGORIE_ENTRATE_EN : CATEGORIE_ENTRATE_IT;
  const CATUscite = lang === 'en' ? CATEGORIE_USCITE_EN : CATEGORIE_USCITE_IT;

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

  const salvaMovimento = async () => {
    if (!form.importo || !form.categoria)
      return alert((lang === 'it' ? 'Importo e categoria richiesti' : 'Amount and category required'));
    const { error } = await supabase.from('movimenti').insert([{
      user_id: user.id, tipo: tipoForm,
      importo: parseFloat(form.importo),
      categoria: form.categoria, descrizione: form.descrizione, data: form.data
    }]);
    if (!error) {
      setMostraForm(false);
      setForm({ importo: '', categoria: '', descrizione: '', data: new Date().toLocaleDateString('en-CA') });
      fetchMovimenti();
    } else alert(t('error') + ': ' + error.message);
  };

  const eliminaMovimento = async (id) => {
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
    h1{font-size:24px;font-weight:900;color:#5D5C9E;margin-bottom:4px;}.subtitle{color:#94A3B8;font-size:13px;margin-bottom:32px;}
    .summary{display:flex;gap:16px;margin-bottom:32px;}.sum-box{flex:1;border-radius:12px;padding:16px 20px;}
    .sum-label{font-size:11px;text-transform:uppercase;letter-spacing:1px;opacity:0.7;}.sum-value{font-size:24px;font-weight:900;margin-top:4px;}
    .entrate-box{background:#EEF8F2;color:#15803D;}.uscite-box{background:#FEF2F2;color:#EF4444;}.saldo-box{background:#EEEEF8;color:#5D5C9E;}
    h2{font-size:14px;font-weight:800;color:#1E293B;margin:24px 0 12px;padding-bottom:6px;border-bottom:2px solid #F1F5F9;}
    table{width:100%;border-collapse:collapse;margin-bottom:8px;}
    th{background:#F8F9FF;padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#94A3B8;}
    td{padding:10px 12px;border-bottom:1px solid #F8F9FF;font-size:13px;}
    .importo-e{color:#15803D;font-weight:700;}.importo-u{color:#EF4444;font-weight:700;}
    .footer{margin-top:40px;text-align:center;font-size:11px;color:#94A3B8;}
    </style></head><body>
    <h1>${lang === 'en' ? 'Financial Report' : 'Report Finanziario'}</h1>
    <div class="subtitle">${nomeMese}</div>
    <div class="summary">
      <div class="sum-box entrate-box"><div class="sum-label">${t('finanze_income')}</div><div class="sum-value">${currency}${totEntrate.toFixed(2)}</div></div>
      <div class="sum-box uscite-box"><div class="sum-label">${t('finanze_expenses')}</div><div class="sum-value">${currency}${totUscite.toFixed(2)}</div></div>
      <div class="sum-box saldo-box"><div class="sum-label">${t('finanze_balance')}</div><div class="sum-value">${currency}${saldo.toFixed(2)}</div></div>
    </div>
    <h2>${t('finanze_income')}</h2>
    <table><thead><tr><th>${lang === 'it' ? 'Data' : 'Date'}</th><th>${lang === 'it' ? 'Categoria' : 'Category'}</th><th>${lang === 'it' ? 'Descrizione' : 'Description'}</th><th style="text-align:right;">${lang === 'it' ? 'Importo' : 'Amount'}</th></tr></thead>
    <tbody>${movimentiFiltrati.filter(m => m.tipo === 'entrata').map(m => `<tr><td>${new Date(m.data).toLocaleDateString('en-GB')}</td><td>${m.categoria}</td><td>${m.descrizione || '—'}</td><td style="text-align:right;" class="importo-e">+${currency}${parseFloat(m.importo).toFixed(2)}</td></tr>`).join('')}</tbody></table>
    <h2>${t('finanze_expenses')}</h2>
    <table><thead><tr><th>${lang === 'it' ? 'Data' : 'Date'}</th><th>${lang === 'it' ? 'Categoria' : 'Category'}</th><th>${lang === 'it' ? 'Descrizione' : 'Description'}</th><th style="text-align:right;">${lang === 'it' ? 'Importo' : 'Amount'}</th></tr></thead>
    <tbody>${movimentiFiltrati.filter(m => m.tipo === 'uscita').map(m => `<tr><td>${new Date(m.data).toLocaleDateString('en-GB')}</td><td>${m.categoria}</td><td>${m.descrizione || '—'}</td><td style="text-align:right;" class="importo-u">-${currency}${parseFloat(m.importo).toFixed(2)}</td></tr>`).join('')}</tbody></table>
    <div class="footer">Generated with KIPRI · your business in your pocket</div>
    </body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${meseSelezionato}.html`;
    a.click();
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
          <button onClick={scaricaReport} style={iconBtnStyle('#EEF8F2', '#15803D')} title={t('finanze_report')}>
            <Download size={18} />
          </button>
          <button onClick={() => { setMostraForm(!mostraForm); setTipoForm('entrata'); }} style={addBtnStyle}>
            {mostraForm ? <ChevronUp size={20} /> : <Plus size={20} />}
          </button>
        </div>
      </div>

      {/* FILTRO MESE */}
      <div style={{ marginBottom: '16px' }}>
        <input type="month" value={meseSelezionato}
          onChange={e => setMeseSelezionato(e.target.value)}
          style={{ ...inputStyle, width: 'auto', fontWeight: '700' }} />
      </div>

      {/* SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
        <div style={summaryCard('#EEF8F2', '#15803D')}>
          <TrendingUp size={16} color="#15803D" />
          <div style={{ fontSize: '11px', marginTop: '4px' }}>{t('finanze_income')}</div>
          <div style={{ fontSize: '20px', fontWeight: '800' }}>{currency}{totEntrate.toFixed(0)}</div>
        </div>
        <div style={summaryCard('#FEF2F2', '#EF4444')}>
          <TrendingDown size={16} color="#EF4444" />
          <div style={{ fontSize: '11px', marginTop: '4px' }}>{t('finanze_expenses')}</div>
          <div style={{ fontSize: '20px', fontWeight: '800' }}>{currency}{totUscite.toFixed(0)}</div>
        </div>
        <div style={summaryCard(saldo >= 0 ? '#EEEEF8' : '#FEF2F2', saldo >= 0 ? '#5D5C9E' : '#EF4444')}>
          <div style={{ fontSize: '11px', marginTop: '4px' }}>{t('finanze_balance')}</div>
          <div style={{ fontSize: '20px', fontWeight: '800' }}>{currency}{saldo.toFixed(0)}</div>
        </div>
      </div>

      {/* FORM */}
      {mostraForm && (
        <div style={cardStyle}>
          {/* Tab Entrata / Uscita */}
          <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '12px', marginBottom: '16px' }}>
            <button onClick={() => setTipoForm('entrata')} style={tabStyle(tipoForm === 'entrata', '#15803D')}>
              {t('finanze_income_tab')}
            </button>
            <button onClick={() => setTipoForm('uscita')} style={tabStyle(tipoForm === 'uscita', '#EF4444')}>
              {t('finanze_expense_tab')}
            </button>
          </div>

          {/* Importo + Data */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>{lang === 'it' ? `Importo ${currency}` : `Amount ${currency}`}</label>
              <input style={inputStyle} type="number" step="0.01" placeholder="0.00"
                value={form.importo} onChange={e => setForm({ ...form, importo: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>{lang === 'it' ? 'Data' : 'Date'}</label>
              <input style={{ ...inputStyle, background: '#F8FAFC' }} type="date"
                value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
            </div>
          </div>

          {/* Categoria */}
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>{t('finanze_category')}</label>
            <select style={inputStyle} value={form.categoria}
              onChange={e => setForm({ ...form, categoria: e.target.value })}>
              <option value="">{t('finanze_selectCategory')}</option>
              {(tipoForm === 'entrata' ? CATEntrate : CATUscite).map(c =>
                <option key={c} value={c}>{c}</option>
              )}
            </select>
          </div>

          {/* Descrizione */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>{t('finanze_description')}</label>
            <input style={inputStyle}
              placeholder={lang === 'it' ? 'Descrizione (opzionale)' : 'Description (optional)'}
              value={form.descrizione} onChange={e => setForm({ ...form, descrizione: e.target.value })} />
          </div>

          {/* Bottoni */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setMostraForm(false)} style={cancelBtn}>{t('cancel')}</button>
            <button onClick={salvaMovimento}
              style={{ ...saveBtn, background: tipoForm === 'entrata' ? '#15803D' : '#EF4444' }}>
              {tipoForm === 'entrata' ? t('finanze_addIncome') : t('finanze_addExpense')}
            </button>
          </div>
        </div>
      )}

      {/* LISTA MOVIMENTI */}
      {movimentiFiltrati.length === 0 ? (
        <div style={emptyStyle}>
          <TrendingUp size={32} color="#CBD5E1" />
          <p style={{ margin: '10px 0 0', color: '#94A3B8', fontSize: '14px' }}>{t('finanze_noMovements')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {movimentiFiltrati.map(m => (
            <div key={m.id} style={movimentoCardStyle(m.tipo)}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: '700', padding: '2px 10px',
                    borderRadius: '20px',
                    background: m.tipo === 'entrata' ? '#EEF8F2' : '#FEF2F2',
                    color: m.tipo === 'entrata' ? '#15803D' : '#EF4444'
                  }}>
                    {m.categoria}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                    {new Date(m.data).toLocaleDateString('en-GB')}
                  </span>
                </div>
                {m.descrizione && (
                  <div style={{ fontSize: '13px', color: '#1E293B', fontWeight: '600', marginTop: '4px' }}>
                    {m.descrizione}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px', fontWeight: '800', color: m.tipo === 'entrata' ? '#15803D' : '#EF4444' }}>
                  {m.tipo === 'entrata' ? '+' : '-'}{currency}{parseFloat(m.importo).toFixed(2)}
                </span>
                <button onClick={() => eliminaMovimento(m.id)} style={iconBtnStyle('#F1F5F9', '#94A3B8')}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const summaryCard = (bg, color) => ({ background: bg, borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color });
const cardStyle = { background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9', marginBottom: '12px' };
const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '5px' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontFamily: "'Baloo 2', sans-serif", color: '#1E293B', outline: 'none', boxSizing: 'border-box' };
const addBtnStyle = { background: '#5D5C9E', color: 'white', border: 'none', width: '44px', height: '44px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const tabStyle = (active, color) => ({ flex: 1, border: 'none', background: active ? color : 'transparent', color: active ? 'white' : '#64748B', padding: '8px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', fontFamily: "'Baloo 2', sans-serif" });
const saveBtn = { flex: 1, color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '15px' };
const cancelBtn = { flex: 1, background: '#F1F5F9', color: '#64748B', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '15px' };
const movimentoCardStyle = (tipo) => ({ background: 'white', borderRadius: '14px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderLeft: `4px solid ${tipo === 'entrata' ? '#70C18E' : '#EF4444'}` });
const iconBtnStyle = (bg, color) => ({ background: bg, color: color, border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' });
const emptyStyle = { textAlign: 'center', padding: '40px', background: 'white', borderRadius: '20px', border: '2px dashed #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center' };
