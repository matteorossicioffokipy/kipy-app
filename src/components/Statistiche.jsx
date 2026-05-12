import React, { useState, useEffect } from 'react';
import { BarChart2, Users, TrendingUp, PieChart } from 'lucide-react';
import { useLang } from '../LanguageContext';

export default function Statistiche({ supabase, user, clienti, appuntamenti }) {
  const { lang } = useLang();
  const [tab, setTab] = useState('entrate');
  const [movimenti, setMovimenti] = useState([]);

  useEffect(() => {
    const fetchMovimenti = async () => {
      const { data } = await supabase
        .from('movimenti')
        .select('*')
        .eq('user_id', user.id);
      setMovimenti(data || []);
    };
    fetchMovimenti();
  }, []);

  const t = (it, en) => lang === 'it' ? it : en;

  // Ultimi 6 mesi
  const ultimi6Mesi = () => {
    const mesi = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      mesi.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', { month: 'short' }),
      });
    }
    return mesi;
  };

  const mesi = ultimi6Mesi();

  // ENTRATE per mese
  const entratePerMese = mesi.map(m => ({
    ...m,
    valore: movimenti
      .filter(mv => mv.tipo === 'entrata' && mv.data?.startsWith(m.key))
      .reduce((acc, mv) => acc + parseFloat(mv.importo || 0), 0),
  }));

  // APPUNTAMENTI per mese
  const appPerMese = mesi.map(m => ({
    ...m,
    valore: appuntamenti.filter(a => a.data?.startsWith(m.key)).length,
  }));

  // TOP 5 clienti per appuntamenti
  const clientiTop = clienti
    .map(c => ({
      nome: c.nome + (c.cognome ? ' ' + c.cognome : ''),
      count: appuntamenti.filter(a => a.cliente_id === c.id).length,
    }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ENTRATE per categoria
  const categorie = {};
  movimenti.filter(m => m.tipo === 'entrata').forEach(m => {
    const cat = m.categoria || 'Altro';
    categorie[cat] = (categorie[cat] || 0) + parseFloat(m.importo || 0);
  });
  const categorieList = Object.entries(categorie)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const currency = lang === 'it' ? '€' : '£';
  const maxEntrate = Math.max(...entratePerMese.map(m => m.valore), 1);
  const maxApp = Math.max(...appPerMese.map(m => m.valore), 1);
  const maxTop = Math.max(...clientiTop.map(c => c.count), 1);
  const maxCat = Math.max(...categorieList.map(c => c[1]), 1);

  const colori = ['#5D5C9E', '#70C18E', '#FFB347', '#EF4444', '#06B6D4'];

  const tabs = [
    { key: 'entrate', icon: <TrendingUp size={16} />, label: t('Entrate', 'Revenue') },
    { key: 'appuntamenti', icon: <BarChart2 size={16} />, label: t('Appuntamenti', 'Appointments') },
    { key: 'clienti', icon: <Users size={16} />, label: t('Top clienti', 'Top clients') },
    { key: 'categorie', icon: <PieChart size={16} />, label: t('Categorie', 'Categories') },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Baloo 2', sans-serif" }}>

      <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1E293B', margin: 0 }}>
        {t('Statistiche', 'Statistics')}
      </h2>

      {/* TABS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '10px 8px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            background: tab === t.key ? '#5D5C9E' : 'white',
            color: tab === t.key ? 'white' : '#64748B',
            fontWeight: '700', fontSize: '12px', fontFamily: "'Baloo 2', sans-serif",
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            boxShadow: tab === t.key ? '0 4px 12px rgba(93,92,158,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
            transition: 'all 0.2s',
          }}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* GRAFICO ENTRATE */}
      {tab === 'entrate' && (
        <div style={cardStyle}>
          <div style={cardTitleStyle}>{lang === 'it' ? 'Entrate ultimi 6 mesi' : 'Revenue last 6 months'}</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px', marginTop: '16px' }}>
            {entratePerMese.map((m, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#5D5C9E' }}>
                  {m.valore > 0 ? `${currency}${m.valore.toFixed(0)}` : ''}
                </div>
                <div style={{
                  width: '100%', borderRadius: '8px 8px 0 0',
                  background: 'linear-gradient(180deg, #5D5C9E 0%, #7B78D4 100%)',
                  height: `${Math.max((m.valore / maxEntrate) * 120, m.valore > 0 ? 4 : 0)}px`,
                  transition: 'height 0.4s ease',
                  minHeight: m.valore > 0 ? '4px' : '0',
                }} />
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>{m.label}</div>
              </div>
            ))}
          </div>
          <div style={totalStyle}>
            {lang === 'it' ? 'Totale' : 'Total'}: {currency}{entratePerMese.reduce((a, m) => a + m.valore, 0).toFixed(2)}
          </div>
        </div>
      )}

      {/* GRAFICO APPUNTAMENTI */}
      {tab === 'appuntamenti' && (
        <div style={cardStyle}>
          <div style={cardTitleStyle}>{lang === 'it' ? 'Appuntamenti ultimi 6 mesi' : 'Appointments last 6 months'}</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px', marginTop: '16px' }}>
            {appPerMese.map((m, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#70C18E' }}>
                  {m.valore > 0 ? m.valore : ''}
                </div>
                <div style={{
                  width: '100%', borderRadius: '8px 8px 0 0',
                  background: 'linear-gradient(180deg, #70C18E 0%, #56a874 100%)',
                  height: `${Math.max((m.valore / maxApp) * 120, m.valore > 0 ? 4 : 0)}px`,
                  transition: 'height 0.4s ease',
                }} />
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>{m.label}</div>
              </div>
            ))}
          </div>
          <div style={totalStyle}>
            {lang === 'it' ? 'Totale' : 'Total'}: {appPerMese.reduce((a, m) => a + m.valore, 0)} {lang === 'it' ? 'appuntamenti' : 'appointments'}
          </div>
        </div>
      )}

      {/* TOP CLIENTI */}
      {tab === 'clienti' && (
        <div style={cardStyle}>
          <div style={cardTitleStyle}>{lang === 'it' ? 'Clienti più attivi' : 'Most active clients'}</div>
          {clientiTop.length === 0 ? (
            <div style={emptyStyle}>{lang === 'it' ? 'Nessun dato ancora' : 'No data yet'}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {clientiTop.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: colori[i % colori.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '4px' }}>{c.nome}</div>
                    <div style={{ height: '6px', borderRadius: '3px', background: '#F1F5F9', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '3px', background: colori[i % colori.length], width: `${(c.count / maxTop) * 100}%`, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: colori[i % colori.length], flexShrink: 0 }}>
                    {c.count} {lang === 'it' ? 'app.' : 'appt.'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CATEGORIE */}
      {tab === 'categorie' && (
        <div style={cardStyle}>
          <div style={cardTitleStyle}>{lang === 'it' ? 'Entrate per categoria' : 'Revenue by category'}</div>
          {categorieList.length === 0 ? (
            <div style={emptyStyle}>{lang === 'it' ? 'Nessun dato ancora' : 'No data yet'}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {categorieList.map(([cat, val], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: colori[i % colori.length], flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>{cat}</span>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: colori[i % colori.length] }}>{currency}{val.toFixed(2)}</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '3px', background: '#F1F5F9', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '3px', background: colori[i % colori.length], width: `${(val / maxCat) * 100}%`, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RIEPILOGO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <div style={miniCardStyle}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>{lang === 'it' ? 'Clienti totali' : 'Total clients'}</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#5D5C9E' }}>{clienti.length}</div>
        </div>
        <div style={miniCardStyle}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>{lang === 'it' ? 'App. totali' : 'Total appt.'}</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#70C18E' }}>{appuntamenti.length}</div>
        </div>
        <div style={miniCardStyle}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>{lang === 'it' ? 'Entrate totali' : 'Total revenue'}</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#FFB347' }}>
            {currency}{movimenti.filter(m => m.tipo === 'entrata').reduce((a, m) => a + parseFloat(m.importo || 0), 0).toFixed(0)}
          </div>
        </div>
      </div>

    </div>
  );
}

const cardStyle = { background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' };
const cardTitleStyle = { fontSize: '15px', fontWeight: '800', color: '#1E293B' };
const totalStyle = { fontSize: '12px', color: '#94A3B8', fontWeight: '600', marginTop: '12px', textAlign: 'right' };
const emptyStyle = { fontSize: '14px', color: '#94A3B8', textAlign: 'center', padding: '32px 0' };
const miniCardStyle = { background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '4px' };
