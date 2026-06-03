import React, { useState, useEffect } from 'react';
import { Users, Calendar, CheckSquare, Settings, QrCode, FileText, TrendingUp, BarChart2, Banknote, Clock } from 'lucide-react';
import { useLang } from '../LanguageContext';
import { formatOra } from '../utils/timeFormat';

export default function Dashboard({ setView, config, appuntamenti, supabase, user }) {
  const fmtOra = (ora) => formatOra(ora, config?.formato_orario ?? '24h');
  const { t } = useLang();
  const [todosOggi, setTodosOggi] = useState([]);

  const oggi = new Date().toLocaleDateString('en-CA');

  const appOggi = (appuntamenti || [])
    .filter(a => a.data === oggi)
    .sort((a, b) => a.ora.localeCompare(b.ora))
    .slice(0, 3);

  useEffect(() => {
    if (!supabase || !user) return;
    supabase.from('todo').select('*')
      .eq('user_id', user.id)
      .eq('data_scadenza', oggi)
      .eq('completato', false)
      .then(({ data }) => setTodosOggi(data || []));
  }, [user]);

  // Unisce appuntamenti + todo, ordina per orario
  const impegniOggi = [
    ...appOggi.map(a => ({ id: a.id, testo: a.titolo, orario: a.ora, isAppuntamento: true })),
    ...todosOggi.map(todo => ({ id: todo.id, testo: todo.testo, orario: todo.orario, isAppuntamento: false })),
  ].sort((a, b) => (a.orario || '99:99').localeCompare(b.orario || '99:99')).slice(0, 4);

  return (
    <div style={{ fontFamily: "'Baloo 2', sans-serif" }}>

      {/* CARD IMPEGNI OGGI */}
      {impegniOggi.length > 0 && (
        <div style={todayCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {t('dashboard_today')}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span onClick={() => setView('CALENDARIO')} style={{ fontSize: '11px', color: '#5D5C9E', fontWeight: '600', cursor: 'pointer' }}>📅</span>
              <span onClick={() => setView('TODO')} style={{ fontSize: '11px', color: '#22C55E', fontWeight: '600', cursor: 'pointer' }}>✅</span>
            </div>
          </div>
          {impegniOggi.map((item, i) => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 0',
              borderBottom: i < impegniOggi.length - 1 ? '1px solid #F1F5F9' : 'none',
              cursor: 'pointer',
            }}
              onClick={() => setView(item.isAppuntamento ? 'CALENDARIO' : 'TODO')}
            >
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                background: item.isAppuntamento ? '#5D5C9E' : '#22C55E'
              }} />
              <span style={{ flex: 1, fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>
                {item.testo}
              </span>
              {item.orario && (
                <span style={{ fontSize: '12px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Clock size={11} />{fmtOra(item.orario)}
                </span>
              )}
              <span style={{ fontSize: '10px', color: item.isAppuntamento ? '#5D5C9E' : '#22C55E', fontWeight: '700' }}>
                {item.isAppuntamento ? '📅' : '✓'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>

        <div onClick={() => setView('RUBRICA')} style={cardStyle}>
          <div style={{ ...iconWrapStyle, background: '#EEEEF8' }}>
            <Users color="#5D5C9E" size={28} />
          </div>
          <span style={labelStyle}>{t('dashboard_rubrica')}</span>
          <span style={subLabelStyle}>{t('dashboard_rubrica_sub')}</span>
        </div>

        <div onClick={() => setView('CALENDARIO')} style={cardStyle}>
          <div style={{ ...iconWrapStyle, background: '#FFF7ED' }}>
            <Calendar color="#F59E0B" size={28} />
          </div>
          <span style={labelStyle}>{t('dashboard_calendario')}</span>
          <span style={subLabelStyle}>{t('dashboard_calendario_sub')}</span>
        </div>

        <div onClick={() => setView('TODO')} style={cardStyle}>
          <div style={{ ...iconWrapStyle, background: '#F0FDF4' }}>
            <CheckSquare color="#22C55E" size={28} />
          </div>
          <span style={labelStyle}>{t('dashboard_todo')}</span>
          <span style={subLabelStyle}>{t('dashboard_todo_sub')}</span>
        </div>

        <div onClick={() => setView('BUSINESS_CARD')} style={cardStyle}>
          <div style={{ ...iconWrapStyle, background: '#FFF0F3' }}>
            <QrCode color="#D12E5F" size={28} />
          </div>
          <span style={labelStyle}>{t('dashboard_businessCard')}</span>
          <span style={subLabelStyle}>{t('dashboard_businessCard_sub')}</span>
        </div>

        <div onClick={() => setView('FATTURE')} style={cardStyle}>
          <div style={{ ...iconWrapStyle, background: '#EEF8F2' }}>
            <FileText color="#15803D" size={28} />
          </div>
          <span style={labelStyle}>{t('dashboard_fatture')}</span>
          <span style={subLabelStyle}>{t('dashboard_fatture_sub')}</span>
        </div>

        <div onClick={() => setView('FINANZE')} style={cardStyle}>
          <div style={{ ...iconWrapStyle, background: '#FFFBEB' }}>
            <TrendingUp color="#D97706" size={28} />
          </div>
          <span style={labelStyle}>{t('dashboard_finanze')}</span>
          <span style={subLabelStyle}>{t('dashboard_finanze_sub')}</span>
        </div>

        <div onClick={() => setView('PAGAMENTI_QR')} style={cardStyle}>
          <div style={{ ...iconWrapStyle, background: '#FFF0F6' }}>
            <Banknote color="#DB2777" size={28} />
          </div>
          <span style={labelStyle}>{t('dashboard_pagamentiQR')}</span>
          <span style={subLabelStyle}>{t('dashboard_pagamentiQR_sub')}</span>
        </div>

        <div onClick={() => setView('STATISTICHE')} style={cardStyle}>
          <div style={{ ...iconWrapStyle, background: '#F0F0FF' }}>
            <BarChart2 color="#5D5C9E" size={28} />
          </div>
          <span style={labelStyle}>{t('dashboard_statistiche')}</span>
          <span style={subLabelStyle}>{t('dashboard_statistiche_sub')}</span>
        </div>

        <div onClick={() => setView('IMPOSTAZIONI')} style={{ ...cardStyle, gridColumn: 'span 2' }}>
          <div style={{ ...iconWrapStyle, background: '#F8FAFC' }}>
            <Settings color="#64748B" size={28} />
          </div>
          <span style={labelStyle}>{t('dashboard_impostazioni')}</span>
          <span style={subLabelStyle}>{t('dashboard_impostazioni_sub')}</span>
        </div>

      </div>
    </div>
  );
}

const todayCardStyle = {
  background: 'white',
  borderRadius: '20px',
  padding: '16px',
  boxShadow: '0 2px 12px rgba(93,92,158,0.08)',
  border: '1px solid rgba(93,92,158,0.1)',
};
const cardStyle = {
  background: 'white',
  padding: '20px 16px',
  borderRadius: '22px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  cursor: 'pointer',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  border: '1px solid #F1F5F9',
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',
  textAlign: 'center',
};
const iconWrapStyle = {
  width: '60px',
  height: '60px',
  borderRadius: '18px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const labelStyle = {
  fontWeight: '800',
  fontSize: '14px',
  color: '#1E293B',
  fontFamily: "'Baloo 2', sans-serif",
};
const subLabelStyle = {
  fontSize: '11px',
  color: '#94A3B8',
  fontWeight: '500',
};
