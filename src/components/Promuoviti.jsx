import React, { useState, useEffect, useRef } from 'react';
import {
  Megaphone, Send, Mail, MessageCircle, Users, Moon, Star,
  Image, Check, ChevronRight, Info, UserCheck, ChevronDown, X
} from 'lucide-react';
import { useLang } from '../LanguageContext';

// ── TEMPLATES ──────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'viola',
    label: { it: 'Classico', en: 'Classic' },
    bg: 'linear-gradient(135deg, #5D5C9E 0%, #4a4980 100%)',
    accent: '#fff',
    dot: '#5D5C9E',
  },
  {
    id: 'verde',
    label: { it: 'Natura', en: 'Nature' },
    bg: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
    accent: '#fff',
    dot: '#15803D',
  },
  {
    id: 'arancio',
    label: { it: 'Energia', en: 'Energy' },
    bg: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
    accent: '#fff',
    dot: '#EA580C',
  },
];

const DEFAULT_TESTO_IT = `Ciao {nome}! 🎁

Questo mese ti offro uno sconto speciale del 20% se porti un'amica al tuo prossimo appuntamento.

Valido fino al 31 dic. Prenota subito! 👇

— {attività}`;

const DEFAULT_TESTO_EN = `Hi {nome}! 🎁

This month I'm offering you a special 20% discount if you bring a friend to your next appointment.

Valid until 31 Dec. Book now! 👇

— {attività}`;

export default function Promuoviti({ supabase, user, clienti, config }) {
  const { lang, t } = useLang();
  const isEn = lang === 'en';

  const [step, setStep] = useState(1);
  const [titolo, setTitolo] = useState('');
  const [testo, setTesto] = useState(isEn ? DEFAULT_TESTO_EN : DEFAULT_TESTO_IT);
  const [templateId, setTemplateId] = useState('viola');
  const [fotoUrl, setFotoUrl] = useState(null);
  const [destinatari, setDestinatari] = useState('tutti');
  const [clientiSelezionati, setClientiSelezionati] = useState([]); // per "personale"
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [canali, setCanali] = useState({ whatsapp: true, email: false });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [waUrl, setWaUrl] = useState('');
  const [promozioni, setPromozioni] = useState([]);
  const [loadingPromo, setLoadingPromo] = useState(true);
  const dropdownRef = useRef(null);

  const tpl = TEMPLATES.find(tp => tp.id === templateId);

  const caricaPromozioni = () => {
    if (!supabase || !user) return;
    supabase
      .from('promozioni')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => { setPromozioni(data || []); setLoadingPromo(false); })
      .catch(() => setLoadingPromo(false));
  };

  useEffect(() => {
    caricaPromozioni();
  }, [user]);

  // Ricarica storico quando l'utente torna sull'app (dopo WhatsApp)
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') caricaPromozioni(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [user]);

  useEffect(() => {
    setTesto(isEn ? DEFAULT_TESTO_EN : DEFAULT_TESTO_IT);
  }, [lang]);

  // Chiudi dropdown cliccando fuori
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const handleFoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFotoUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  const nVip = clienti?.filter(c => c.vip)?.length || 0;
  const nInattivi = clienti?.filter(c => !c.ultimo_appuntamento ||
    new Date(c.ultimo_appuntamento) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))?.length || 0;

  const clientiFiltrati = (() => {
    if (!clienti?.length) return [];
    if (destinatari === 'tutti') return clienti;
    if (destinatari === 'vip') return clienti.filter(c => c.vip);
    if (destinatari === 'personale') return clienti.filter(c => clientiSelezionati.includes(c.id));
    return clienti.filter(c => !c.ultimo_appuntamento ||
      new Date(c.ultimo_appuntamento) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  })();

  const nDest = clientiFiltrati.length;

  const testoAnteprima = testo
    .replace(/\{nome\}/g, isEn ? 'Emma' : 'Giulia')
    .replace(/\{attività\}/g, config?.nome_azienda || (isEn ? 'My Business' : 'La mia attività'));

  const canProceed = () => {
    if (step === 1) return titolo.trim().length > 0 && testo.trim().length > 0;
    if (step === 2) return true;
    if (step === 3) {
      if (!(canali.whatsapp || canali.email)) return false;
      if (destinatari === 'personale' && clientiSelezionati.length === 0) return false;
      return true;
    }
    return false;
  };

  const toggleClienteSelezionato = (id) => {
    setClientiSelezionati(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const resetWizard = () => {
    setSent(false);
    setWaUrl('');
    setStep(1);
    setTitolo('');
    setTesto(isEn ? DEFAULT_TESTO_EN : DEFAULT_TESTO_IT);
    setTemplateId('viola');
    setFotoUrl(null);
    setDestinatari('tutti');
    setClientiSelezionati([]);
    setCanali({ whatsapp: true, email: false });
  };

  const handleInvia = async () => {
    if (loading) return;
    setLoading(true);

    const clientiConCanale = clientiFiltrati.filter(c =>
      (canali.whatsapp && c.tel) || (canali.email && c.email)
    );
    const nDest = clientiConCanale.length;

    // Calcola URL prima di salvare (usiamo i valori correnti degli state)
    let url = '';
    if (canali.whatsapp) {
      const primo = clientiConCanale.find(c => c.tel);
      if (primo) {
        const msg = testo
          .replace(/\{nome\}/g, primo.nome || '')
          .replace(/\{attività\}/g, config?.nome_azienda || '');
        url = `https://wa.me/${primo.tel.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
      }
    } else if (canali.email) {
      const primo = clientiConCanale.find(c => c.email);
      if (primo) {
        const msg = testo
          .replace(/\{nome\}/g, primo.nome || '')
          .replace(/\{attività\}/g, config?.nome_azienda || '');
        url = `mailto:${primo.email}?subject=${encodeURIComponent(titolo)}&body=${encodeURIComponent(msg)}`;
      }
    }

    // Salva su Supabase
    try {
      await supabase.from('promozioni').insert([{
        user_id: user.id,
        titolo,
        testo,
        template_id: templateId,
        destinatari,
        n_destinatari: nDest,
        canali: JSON.stringify(canali),
        created_at: new Date().toISOString(),
      }]);
      caricaPromozioni();
    } catch (_) {}

    setWaUrl(url);
    setSent(true);
    setLoading(false);
  };

  const L = {
    title:        isEn ? 'Promote Yourself'                          : 'Promuoviti',
    sub:          isEn ? 'Create a promotion and send it to clients.' : 'Crea una promozione e inviala ai tuoi clienti.',
    step1:        isEn ? 'Write your promotion'                      : 'Scrivi la tua promozione',
    step1sub:     isEn ? 'The client\'s name will be added automatically where you see {nome}.' : 'Il nome del cliente verrà inserito automaticamente dove vedi {nome}.',
    step2:        isEn ? 'Choose a template'                         : 'Scegli un template',
    step2sub:     isEn ? 'Optional: add a photo.'                    : 'Opzionale: aggiungi una foto.',
    step3:        isEn ? 'Recipients & channel'                      : 'Destinatari e canale',
    step3sub:     isEn ? 'Who receives it and how.'                  : 'Chi lo riceve e come.',
    lblTitolo:    isEn ? 'Promotion title'                           : 'Titolo promozione',
    lblTesto:     isEn ? 'Message'                                   : 'Messaggio',
    pTitle:       isEn ? 'E.g. Christmas offer — 30% off'           : 'Es. Offerta Natale — 30% di sconto',
    varHint:      isEn ? 'ℹ️  {nome} = client name · {attività} = your business name' : 'ℹ️  {nome} = nome del cliente · {attività} = nome della tua attività',
    addPhoto:     isEn ? 'Add a photo (optional)'                    : 'Aggiungi una foto (opzionale)',
    photoAdded:   isEn ? 'Photo added ✓'                            : 'Foto aggiunta ✓',
    preview:      isEn ? 'Preview'                                   : 'Anteprima',
    tuttiLbl:     isEn ? 'All clients'                               : 'Tutti i clienti',
    tuttiSub:     isEn ? 'Send to your entire contact list'          : 'Invia a tutta la rubrica',
    inativiLbl:   isEn ? 'Inactive clients'                         : 'Clienti inattivi',
    inativiSub:   isEn ? 'No appointment in 30+ days'               : 'Nessun appuntamento da 30+ giorni',
    vipLbl:       'VIP',
    vipSub:       isEn ? 'Marked as VIP'                            : 'Contrassegnati come VIP',
    personaleLbl: isEn ? 'Specific clients'                          : 'Clienti specifici',
    personaleSub: isEn ? 'Choose one or more clients'               : 'Scegli uno o più clienti',
    selectPlh:    isEn ? 'Select clients…'                           : 'Seleziona clienti…',
    sendVia:      isEn ? 'Send via'                                  : 'Invia tramite',
    waSub:        isEn ? 'Opens pre-filled message'                  : 'Apre il messaggio pre-compilato',
    emailSub:     isEn ? 'Opens your email client'                   : 'Apre il client email',
    infoWa:       isEn ? 'WhatsApp opens a pre-filled window for the first client. You confirm sending with one tap.' : 'WhatsApp apre una finestra con il messaggio pre-compilato per il primo cliente. Confermi con un tap.',
    send:         isEn ? 'Send promotion'                            : 'Invia promozione',
    sending:      isEn ? 'Sending...'                                : 'Invio...',
    sentOk:       isEn ? '✅ Sent!'                                  : '✅ Inviata!',
    next:         isEn ? 'Next'                                      : 'Avanti',
    back:         isEn ? 'Back'                                      : 'Indietro',
    history:      isEn ? 'SENT PROMOTIONS'                           : 'PROMOZIONI INVIATE',
    noHistory:    isEn ? 'No promotions sent yet.'                   : 'Nessuna promozione inviata ancora.',
    dest:         isEn ? 'clients'                                   : 'clienti',
    chars:        isEn ? 'characters'                                : 'caratteri',
    stepLabels:   isEn ? ['Text', 'Template', 'Send']                : ['Testo', 'Template', 'Invia'],
    sent:         isEn ? 'Sent'                                      : 'Inviata',
    noDest:       isEn ? 'No clients with contact details found.'    : 'Nessun cliente con dati di contatto trovato.',
    noVip:        isEn ? 'No VIP clients yet. Mark clients as VIP from the contacts list.' : 'Nessun cliente VIP. Contrassegna i clienti come VIP dalla rubrica.',
  };

  const segmenti = [
    { id: 'tutti',     label: L.tuttiLbl,     sub: L.tuttiSub,     icon: <Users      size={20} color={destinatari === 'tutti'     ? 'white' : '#5D5C9E'} />, n: clienti?.length || 0 },
    { id: 'inattivi',  label: L.inativiLbl,   sub: L.inativiSub,   icon: <Moon       size={20} color={destinatari === 'inattivi'  ? 'white' : '#94A3B8'} />, n: nInattivi },
    { id: 'vip',       label: L.vipLbl,       sub: L.vipSub,       icon: <Star       size={20} color={destinatari === 'vip'       ? 'white' : '#F59E0B'} />, n: nVip },
    { id: 'personale', label: L.personaleLbl, sub: L.personaleSub, icon: <UserCheck  size={20} color={destinatari === 'personale' ? 'white' : '#6366F1'} />, n: clientiSelezionati.length },
  ];

  const canaliBtns = [
    { id: 'whatsapp', label: 'WhatsApp', sub: L.waSub,    icon: <MessageCircle size={26} color={canali.whatsapp ? '#25D366' : '#94A3B8'} />, activeColor: '#25D366', activeBg: '#F0FDF4' },
    { id: 'email',    label: 'Email',    sub: L.emailSub, icon: <Mail          size={26} color={canali.email    ? '#5D5C9E' : '#94A3B8'} />, activeColor: '#5D5C9E', activeBg: '#EEEEF8' },
  ];

  return (
    <div style={{ fontFamily: "'Baloo 2', sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Megaphone color="#F97316" size={22} />
        </div>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#1E293B', lineHeight: 1.2 }}>{L.title}</div>
          <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '500' }}>{L.sub}</div>
        </div>
      </div>

      {/* ── WIZARD CARD ── */}
      <div style={cardStyle}>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '20px' }}>
          {L.stepLabels.map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <React.Fragment key={n}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '800',
                    background: done ? '#22C55E' : active ? '#5D5C9E' : '#F1F5F9',
                    color: done || active ? 'white' : '#94A3B8',
                    transition: 'all 0.2s',
                  }}>
                    {done ? <Check size={12} /> : n}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: active ? '#5D5C9E' : done ? '#22C55E' : '#94A3B8' }}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div style={{ flex: 1, height: '2px', background: done ? '#22C55E' : '#F1F5F9', borderRadius: '2px', margin: '0 4px', transition: 'background 0.3s' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={stepTitleStyle}>{L.step1}</div>
              <div style={stepSubStyle}>{L.step1sub}</div>
            </div>

            <div>
              <label style={labelStyle}>{L.lblTitolo}</label>
              <input
                value={titolo}
                onChange={e => setTitolo(e.target.value)}
                placeholder={L.pTitle}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>{L.lblTesto}</label>
              <textarea
                value={testo}
                onChange={e => setTesto(e.target.value)}
                rows={7}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '6px', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', flex: 1 }}>
                  <Info size={13} color="#94A3B8" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '500', lineHeight: 1.4 }}>{L.varHint}</span>
                </div>
                <span style={{ fontSize: '11px', color: '#94A3B8', flexShrink: 0 }}>{testo.length} {L.chars}</span>
              </div>
            </div>

            {testo.length > 0 && (
              <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '14px', border: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{L.preview}</div>
                <div style={{ background: 'white', borderRadius: '10px 10px 10px 0', padding: '10px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'inline-block', maxWidth: '100%' }}>
                  <div style={{ fontSize: '13px', color: '#1E293B', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{testoAnteprima}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={stepTitleStyle}>{L.step2}</div>
              <div style={stepSubStyle}>{L.step2sub}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {TEMPLATES.map(tp => (
                <div
                  key={tp.id}
                  onClick={() => setTemplateId(tp.id)}
                  style={{
                    borderRadius: '14px', overflow: 'hidden',
                    border: `2px solid ${templateId === tp.id ? tp.dot : '#F1F5F9'}`,
                    cursor: 'pointer',
                    boxShadow: templateId === tp.id ? `0 0 0 3px ${tp.dot}22` : 'none',
                    transition: 'all 0.2s', position: 'relative',
                  }}
                >
                  {templateId === tp.id && (
                    <div style={{ position: 'absolute', top: '6px', right: '6px', width: '20px', height: '20px', borderRadius: '50%', background: tp.dot, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                      <Check size={11} color="white" />
                    </div>
                  )}
                  <div style={{ height: '60px', background: tp.bg }} />
                  <div style={{ padding: '6px 8px', textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#1E293B', background: 'white' }}>
                    {tp.label[lang] || tp.label.it}
                  </div>
                </div>
              ))}
            </div>

            {/* Preview card */}
            <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
              <div style={{ background: tpl.bg, padding: '18px 16px' }}>
                {fotoUrl && (
                  <img src={fotoUrl} alt="" style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '10px', marginBottom: '10px' }} />
                )}
                <div style={{ fontSize: '15px', fontWeight: '800', color: tpl.accent, lineHeight: 1.2, marginBottom: '6px' }}>
                  {titolo || (isEn ? 'Your promotion title' : 'Il titolo della tua promozione')}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                  {testoAnteprima.slice(0, 80)}{testoAnteprima.length > 80 ? '…' : ''}
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '8px', fontWeight: '600' }}>powered by KIPRI</div>
              </div>
            </div>

            <label style={uploadStyle}>
              <input type="file" accept="image/*" onChange={handleFoto} style={{ display: 'none' }} />
              <Image size={18} color={fotoUrl ? '#22C55E' : '#94A3B8'} />
              <span style={{ fontSize: '13px', color: fotoUrl ? '#22C55E' : '#94A3B8', fontWeight: '600' }}>
                {fotoUrl ? L.photoAdded : L.addPhoto}
              </span>
            </label>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={stepTitleStyle}>{L.step3}</div>
              <div style={stepSubStyle}>{L.step3sub}</div>
            </div>

            {/* Segmenti */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {segmenti.map(seg => {
                const active = destinatari === seg.id;
                return (
                  <div key={seg.id}>
                    <div
                      onClick={() => { setDestinatari(seg.id); if (seg.id !== 'personale') setDropdownOpen(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 14px', borderRadius: active && seg.id === 'personale' && dropdownOpen ? '14px 14px 0 0' : '14px',
                        border: `1.5px solid ${active ? (seg.id === 'personale' ? '#6366F1' : '#5D5C9E') : '#F1F5F9'}`,
                        background: active ? (seg.id === 'personale' ? '#EEEEFD' : '#EEEEF8') : 'white',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: active ? (seg.id === 'personale' ? '#6366F1' : '#5D5C9E') : '#F8FAFC',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, transition: 'all 0.15s',
                      }}>
                        {seg.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{seg.label}</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>{seg.sub}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: seg.id === 'personale' ? '#6366F1' : '#5D5C9E', background: seg.id === 'personale' ? '#EEEEFD' : '#EEEEF8', padding: '3px 10px', borderRadius: '20px' }}>
                          {seg.n} {L.dest}
                        </div>
                        {seg.id === 'personale' && (
                          <ChevronDown size={16} color="#94A3B8" style={{ transform: active && dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                            onClick={(e) => { e.stopPropagation(); if (active) setDropdownOpen(d => !d); }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Dropdown selezione clienti */}
                    {seg.id === 'personale' && active && (
                      <div ref={dropdownRef} style={{
                        border: '1.5px solid #6366F1', borderTop: 'none',
                        borderRadius: '0 0 14px 14px', background: 'white',
                        maxHeight: '200px', overflowY: 'auto',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}>
                        {/* Selezione rapida */}
                        <div style={{ padding: '8px 12px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '8px' }}>
                          <button onClick={() => setClientiSelezionati(clienti.map(c => c.id))}
                            style={{ fontSize: '11px', fontWeight: '700', color: '#6366F1', background: '#EEEEFD', border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer' }}>
                            {isEn ? 'All' : 'Tutti'}
                          </button>
                          <button onClick={() => setClientiSelezionati([])}
                            style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer' }}>
                            {isEn ? 'None' : 'Nessuno'}
                          </button>
                        </div>
                        {clienti?.length === 0 ? (
                          <div style={{ padding: '16px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                            {isEn ? 'No clients yet.' : 'Nessun cliente.'}
                          </div>
                        ) : clienti?.map(c => {
                          const sel = clientiSelezionati.includes(c.id);
                          return (
                            <div key={c.id} onClick={() => toggleClienteSelezionato(c.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', cursor: 'pointer', background: sel ? '#EEEEFD' : 'white', borderBottom: '1px solid #F8FAFC', transition: 'background 0.1s' }}>
                              <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: `2px solid ${sel ? '#6366F1' : '#E2E8F0'}`, background: sel ? '#6366F1' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                                {sel && <Check size={12} color="white" />}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {c.nome}
                                  {c.vip && <Star size={11} color="#F59E0B" fill="#F59E0B" style={{ marginLeft: '5px', verticalAlign: 'middle' }} />}
                                </div>
                                {(c.tel || c.email) && (
                                  <div style={{ fontSize: '11px', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {c.tel || c.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Avviso nessun VIP */}
                    {seg.id === 'vip' && active && nVip === 0 && (
                      <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '10px 12px', marginTop: '6px', fontSize: '12px', color: '#92400E', fontWeight: '600' }}>
                        ⭐ {L.noVip}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Chip clienti selezionati */}
              {destinatari === 'personale' && clientiSelezionati.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '4px 0' }}>
                  {clienti?.filter(c => clientiSelezionati.includes(c.id)).map(c => (
                    <span key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#EEEEFD', color: '#6366F1', fontSize: '12px', fontWeight: '700', borderRadius: '20px', padding: '4px 10px' }}>
                      {c.nome}
                      <X size={12} style={{ cursor: 'pointer' }} onClick={() => toggleClienteSelezionato(c.id)} />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Canali */}
            <div>
              <label style={{ ...labelStyle, display: 'block', marginBottom: '8px' }}>{L.sendVia}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {canaliBtns.map(ch => {
                  const active = canali[ch.id];
                  return (
                    <div
                      key={ch.id}
                      onClick={() => setCanali(prev => ({ ...prev, [ch.id]: !prev[ch.id] }))}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                        padding: '14px 10px', borderRadius: '14px',
                        border: `2px solid ${active ? ch.activeColor : '#F1F5F9'}`,
                        background: active ? ch.activeBg : 'white',
                        cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                      }}
                    >
                      {ch.icon}
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>{ch.label}</span>
                      <span style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.3 }}>{ch.sub}</span>
                      {active && (
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: ch.activeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
                          <Check size={11} color="white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info box */}
            <div style={{ background: '#EEEEF8', borderRadius: '12px', padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Info size={16} color="#5D5C9E" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span style={{ fontSize: '12px', color: '#5D5C9E', fontWeight: '600', lineHeight: 1.5 }}>{L.infoWa}</span>
            </div>

            {nDest === 0 && destinatari !== 'personale' && (
              <div style={{ background: '#FEF2F2', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', color: '#EF4444', fontWeight: '600' }}>
                ⚠️ {L.noDest}
              </div>
            )}
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
          <button
            onClick={() => setStep(s => s - 1)}
            style={{ ...backBtnStyle, visibility: step > 1 && !sent ? 'visible' : 'hidden' }}
          >
            {L.back}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              style={{ ...nextBtnStyle, opacity: canProceed() ? 1 : 0.4, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {L.next} <ChevronRight size={16} color="white" />
            </button>
          ) : (
            {sent && waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setTimeout(resetWizard, 300)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                textDecoration: 'none', padding: '12px 20px', borderRadius: '14px',
                color: 'white', fontWeight: '700', fontSize: '15px',
                background: canali.whatsapp
                  ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
                  : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              }}
            >
              {canali.whatsapp ? <><MessageCircle size={16} color="white" /> Apri WhatsApp</> : <><Mail size={16} color="white" /> Apri Email</>}
            </a>
            ) : (
            <button
              onClick={handleInvia}
              disabled={loading || (!canali.whatsapp && !canali.email) || (destinatari === 'personale' && clientiSelezionati.length === 0)}
              style={{
                ...nextBtnStyle,
                background: canali.whatsapp
                  ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
                  : canali.email
                  ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                  : nextBtnStyle.background,
                opacity: (loading || (!canali.whatsapp && !canali.email) || (destinatari === 'personale' && clientiSelezionati.length === 0)) ? 0.4 : 1,
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              <Send size={16} color="white" />
              {loading ? L.sending : canali.whatsapp ? 'Invia con WhatsApp' : canali.email ? 'Invia con Email' : L.send}
            </button>
            )}
          )}
        </div>
      </div>

      {/* ── STORICO ── */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
          {L.history}
        </div>

        {loadingPromo ? (
          <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '13px', padding: '24px' }}>{t('loading')}</div>
        ) : promozioni.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px 20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <Megaphone size={36} color="#E2E8F0" />
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', marginBottom: '4px' }}>{L.noHistory}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {promozioni.map(p => {
              const canaliP = (() => { try { return JSON.parse(p.canali); } catch { return {}; } })();
              const canaleLabel = [canaliP.whatsapp && 'WhatsApp', canaliP.email && 'Email'].filter(Boolean).join(' · ');
              const dataStr = p.created_at
                ? new Date(p.created_at).toLocaleDateString(isEn ? 'en-GB' : 'it-IT', { day: 'numeric', month: 'short' })
                : '';
              const tplItem = TEMPLATES.find(tp => tp.id === p.template_id);
              return (
                <div key={p.id} style={{ background: 'white', borderRadius: '16px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: tplItem?.bg || '#EEEEF8', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Megaphone size={18} color="white" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.titolo}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                      {dataStr} · {canaleLabel} · {p.n_destinatari || 0} {L.dest}
                    </div>
                  </div>
                  <div style={{ background: '#EEF8F2', color: '#15803D', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', flexShrink: 0 }}>
                    {L.sent}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── STYLES ──
const cardStyle = {
  background: 'white',
  borderRadius: '22px',
  padding: '20px',
  boxShadow: '0 2px 12px rgba(93,92,158,0.08)',
  border: '1px solid rgba(93,92,158,0.1)',
};
const stepTitleStyle = {
  fontSize: '17px', fontWeight: '800', color: '#1E293B',
  fontFamily: "'Baloo 2', sans-serif",
};
const stepSubStyle = {
  fontSize: '12px', color: '#94A3B8', marginTop: '2px', fontWeight: '500',
};
const labelStyle = {
  fontSize: '13px', fontWeight: '700', color: '#1E293B',
  fontFamily: "'Baloo 2', sans-serif",
};
const inputStyle = {
  width: '100%', padding: '11px 14px',
  border: '1.5px solid #E2E8F0', borderRadius: '12px',
  fontFamily: "'Baloo 2', sans-serif", fontSize: '14px',
  color: '#1E293B', background: '#F8FAFC',
  outline: 'none', boxSizing: 'border-box',
};
const uploadStyle = {
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '14px', border: '1.5px dashed #E2E8F0',
  borderRadius: '12px', cursor: 'pointer', background: '#F8FAFC',
};
const backBtnStyle = {
  background: 'none', border: '1.5px solid #E2E8F0',
  borderRadius: '10px', padding: '9px 16px',
  fontFamily: "'Baloo 2', sans-serif", fontSize: '13px',
  fontWeight: '700', color: '#94A3B8', cursor: 'pointer',
};
const nextBtnStyle = {
  background: 'linear-gradient(135deg, #5D5C9E 0%, #4a4980 100%)',
  color: 'white', border: 'none', borderRadius: '12px',
  padding: '11px 22px', fontFamily: "'Baloo 2', sans-serif",
  fontSize: '14px', fontWeight: '700', cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(93,92,158,0.25)',
};
