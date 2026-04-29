import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Trash2, Plus, Calendar as CalIcon, MessageCircle } from 'lucide-react';
import { useLang } from '../LanguageContext';

export default function Calendario({ appuntamenti, setMostraModuloApp, supabase, fetchDati, config, clienti }) {
  const { t } = useLang();
  const oggiCorretto = new Date().toLocaleDateString('en-CA');
  const [dataSelezionata, setDataSelezionata] = useState(oggiCorretto);
  const [meseVisualizzato, setMeseVisualizzato] = useState(new Date());
  const [vistaSettimanale, setVistaSettimanale] = useState(false);

  const orangeKipy = '#FFB347';
  const lightOrange = '#FFF7ED';
  const proMemoriaAttivo = config?.promemoria_attivo ?? true;

  const formattaLocale = (date) => {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getGiorniMese = () => {
    const anno = meseVisualizzato.getFullYear();
    const mese = meseVisualizzato.getMonth();
    const primoGiornoMese = new Date(anno, mese, 1).getDay();
    const offset = primoGiornoMese === 0 ? 6 : primoGiornoMese - 1;
    const giorniTotali = new Date(anno, mese + 1, 0).getDate();
    const giorni = [];
    for (let i = 0; i < offset; i++) giorni.push(null);
    for (let i = 1; i <= giorniTotali; i++) giorni.push(new Date(anno, mese, i));
    return giorni;
  };

  const getGiorniSettimana = () => {
    const pezzi = dataSelezionata.split('-');
    const corrente = new Date(pezzi[0], pezzi[1] - 1, pezzi[2]);
    const giornoSett = corrente.getDay();
    const diff = corrente.getDate() - (giornoSett === 0 ? 6 : giornoSett - 1);
    const lunedi = new Date(pezzi[0], pezzi[1] - 1, diff);
    const giorni = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(lunedi);
      d.setDate(lunedi.getDate() + i);
      giorni.push(d);
    }
    return giorni;
  };

  const isOggi = (date) => date && formattaLocale(date) === oggiCorretto;
  const isSelezionato = (date) => date && formattaLocale(date) === dataSelezionata;
  const haAppuntamenti = (date) => date && (appuntamenti || []).some(a => a.data === formattaLocale(date));

  const appuntamentiGiorno = (appuntamenti || [])
    .filter(a => a.data === dataSelezionata)
    .sort((a, b) => a.ora.localeCompare(b.ora));

  const eliminaAppuntamento = async (id) => {
    if (window.confirm(t('calendario_deleteConfirm'))) {
      const { error } = await supabase.from('appuntamenti').delete().eq('id', id);
      if (!error) fetchDati();
    }
  };

  const inviaPromemoria = (app) => {
    const cliente = (clienti || []).find(c =>
      app.titolo?.toLowerCase().includes(c.nome?.toLowerCase())
    );
    const tel = cliente?.tel?.replace(/\D/g, '');
    const pezzi = app.data.split('-');
    const dataObj = new Date(pezzi[0], pezzi[1] - 1, pezzi[2]);
    const dataFormattata = dataObj.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
    const testoTemplate = config?.promemoria_testo ||
      `Ciao! 👋\nTi ricordiamo il tuo appuntamento con ${config?.nome_azienda || 'noi'} {data} alle {ora}.\nA presto!`;
    const testo = testoTemplate
      .replace('{nome}', cliente?.nome || '')
      .replace('{data}', dataFormattata)
      .replace('{ora}', app.ora?.slice(0, 5) || '');
    const testoEncoded = encodeURIComponent(testo);
    if (tel) {
      window.open(`https://wa.me/${tel}?text=${testoEncoded}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${testoEncoded}`, '_blank');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', paddingBottom: '100px', width: '100%', fontFamily: "'Baloo 2', sans-serif" }}>

      <div style={{ background: 'white', padding: '15px', borderRadius: '25px', marginBottom: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: lightOrange, color: orangeKipy, padding: '8px', borderRadius: '12px' }}>
              <CalIcon size={20} />
            </div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
              {vistaSettimanale ? t('calendario_week') : meseVisualizzato.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '12px' }}>
            <button onClick={() => setVistaSettimanale(false)} style={{ border: 'none', background: !vistaSettimanale ? orangeKipy : 'transparent', color: !vistaSettimanale ? 'white' : '#64748B', padding: '6px 10px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '10px', touchAction: 'manipulation' }}>
              {t('calendario_month')}
            </button>
            <button onClick={() => setVistaSettimanale(true)} style={{ border: 'none', background: vistaSettimanale ? orangeKipy : 'transparent', color: vistaSettimanale ? 'white' : '#64748B', padding: '6px 10px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '10px', touchAction: 'manipulation' }}>
              {t('calendario_week')}
            </button>
          </div>
        </div>

        {!vistaSettimanale && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '10px' }}>
            <button onClick={() => setMeseVisualizzato(new Date(meseVisualizzato.getFullYear(), meseVisualizzato.getMonth() - 1, 1))} style={{ border: 'none', background: '#F8FAFC', padding: '6px', borderRadius: '10px', touchAction: 'manipulation' }}><ChevronLeft size={18} /></button>
            <button onClick={() => setMeseVisualizzato(new Date(meseVisualizzato.getFullYear(), meseVisualizzato.getMonth() + 1, 1))} style={{ border: 'none', background: '#F8FAFC', padding: '6px', borderRadius: '10px', touchAction: 'manipulation' }}><ChevronRight size={18} /></button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center' }}>
          {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => (
            <div key={i} style={{ fontSize: '10px', fontWeight: '800', color: '#CBD5E1', marginBottom: '8px' }}>{d}</div>
          ))}
          {(vistaSettimanale ? getGiorniSettimana() : getGiorniMese()).map((giorno, i) => (
            <div key={i} onClick={() => giorno && setDataSelezionata(formattaLocale(giorno))}
              style={{ height: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '12px', position: 'relative', background: isSelezionato(giorno) ? orangeKipy : 'transparent', color: isSelezionato(giorno) ? 'white' : (isOggi(giorno) ? orangeKipy : '#1E293B'), fontWeight: (isSelezionato(giorno) || isOggi(giorno)) ? '800' : '500', opacity: giorno ? 1 : 0, touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
              <span style={{ fontSize: '13px' }}>{giorno && giorno.getDate()}</span>
              {haAppuntamenti(giorno) && (
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: isSelezionato(giorno) ? 'white' : orangeKipy, position: 'absolute', bottom: '4px' }}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ paddingLeft: '5px', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>
          {(() => {
            const pezzi = dataSelezionata.split('-');
            return new Date(pezzi[0], pezzi[1] - 1, pezzi[2]).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
          })()}
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {appuntamentiGiorno.length > 0 ? appuntamentiGiorno.map(app => (
          <div key={app.id} style={{ background: 'white', padding: '15px', borderRadius: '22px', boxShadow: '0 5px 15px rgba(0,0,0,0.02)', borderLeft: `4px solid ${orangeKipy}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                  <Clock size={12} color={orangeKipy} />
                  <span style={{ fontSize: '12px', fontWeight: '800', color: orangeKipy }}>{app.ora.slice(0, 5)}</span>
                </div>
                <div style={{ fontWeight: '800', fontSize: '14px', color: '#1E293B' }}>{app.titolo}</div>
                {app.note && <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', fontStyle: 'italic' }}>{app.note}</div>}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                {proMemoriaAttivo && (
                  <button onClick={() => inviaPromemoria(app)} style={{ background: '#DCFCE7', border: 'none', color: '#15803D', padding: '8px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'manipulation' }} title={t('reminder_sent')}>
                    <MessageCircle size={16} />
                  </button>
                )}
                <button onClick={() => eliminaAppuntamento(app.id)} style={{ background: '#FEF2F2', border: 'none', color: '#EF4444', padding: '8px', borderRadius: '10px', cursor: 'pointer', touchAction: 'manipulation' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '30px', color: '#CBD5E1', background: 'white', borderRadius: '22px', border: '2px dashed #F1F5F9', fontSize: '13px' }}>
            {t('calendario_noAppointments')}
          </div>
        )}
      </div>

      <button onClick={() => setMostraModuloApp(true)} style={{ position: 'fixed', bottom: '30px', right: '20px', width: '64px', height: '64px', borderRadius: '20px', background: orangeKipy, color: 'white', border: 'none', boxShadow: `0 10px 20px ${orangeKipy}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation', cursor: 'pointer' }}>
        <Plus size={28} />
      </button>
    </div>
  );
}