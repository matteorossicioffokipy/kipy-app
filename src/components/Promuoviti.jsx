import React, { useState, useEffect } from 'react';
import { Megaphone, Send, ChevronLeft, ChevronRight, Check, Image, Users, Mail } from 'lucide-react';
import { useLang } from '../LanguageContext';

// ── TEMPLATES ──────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'viola',
    label: { it: 'Classico', en: 'Classic' },
    bg: 'linear-gradient(135deg, #5D5C9E 0%, #4a4980 100%)',
    accent: '#fff',
    emoji: '✨',
  },
  {
    id: 'verde',
    label: { it: 'Natura', en: 'Nature' },
    bg: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
    accent: '#fff',
    emoji: '🌿',
  },
  {
    id: 'arancio',
    label: { it: 'Energia', en: 'Energy' },
    bg: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
    accent: '#fff',
    emoji: '🔥',
  },
];

export default function Promuoviti({ supabase, user, clienti, config }) {
  const { lang, t } = useLang();
  const isEn = lang === 'en';
  const currency = isEn ? '£' : '€';

  // ── wizard step: 1=testo, 2=template+foto, 3=destinatari+canale ──
  const [step, setStep] = useState(1);

  // ── form state ──
  const [titolo, setTitolo] = useState('');
  const [testo, setTesto] = useState('');
  const [templateId, setTemplateId] = useState('viola');
  const [fotoUrl, setFotoUrl] = useState(null); // base64 preview
  const [destinatari, setDestinatari] = useState('tutti'); // tutti | inattivi | vip
  const [canali, setCanali] = useState({ whatsapp: true, email: false });
  const [loading, setLoading] = useState(false);
  const [promozioni, setPromozioni] = useState([]);
  const [loadingPromo, setLoadingPromo] = useState(true);

  const tpl = TEMPLATES.find(t => t.id === templateId);

  // ── carica storico promozioni ──
  useEffect(() => {
    if (!supabase || !user) return;
    supabase
      .from('promozioni')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setPromozioni(data || []);
        setLoadingPromo(false);
      })
      .catch(() => setLoadingPromo(false));
  }, [user]);

  // ── inserisce variabile nel testo ──
  const insertVar = (v) => {
    setTesto(prev => prev + v);
  };

  // ── gestisce upload foto ──
  const handleFoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFotoUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ── filtra clienti per segmento ──
  const clientiFiltrati = (() => {
    if (!clienti?.length) return [];
    if (destinatari === 'tutti') return clienti;
    if (destinatari === 'vip') return clienti.filter(c => c.vip);
    // inattivi: senza appuntamenti recenti — approssimazione base
    return clienti.filter(c => !c.ultimo_appuntamento ||
      new Date(c.ultimo_appuntamento) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  })();

  const nDest = clientiFiltrati.length;

  // ── validazione per step ──
  const canProceed = () => {
    if (step === 1) return titolo.trim().length > 0 && testo.trim().length > 0;
    if (step === 2) return true; // template sempre selezionato
    if (step === 3) return canali.whatsapp || canali.email;
    return false;
  };

  // ── anteprima testo con nome esempio ──
  const testoAnteprima = testo
    .replace('{nome}', isEn ? 'Emma' : 'Giulia')
    .replace('{attività}', config?.nome_azienda || (isEn ? 'My Business' : 'La mia attività'));

  // ── invio promozione ──
  const handleInvia = async () => {
    if (!canali.whatsapp && !canali.email) return;
    setLoading(true);

    // Salva promozione su Supabase (tabella promozioni — opzionale, non blocca)
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
    } catch (_) { /* non bloccare se tabella non esiste ancora */ }

    // Apri WhatsApp / mail per i primi clienti
    const clientiConCanale = clientiFiltrati.filter(c =>
      (canali.whatsapp && c.tel) || (canali.email && c.email)
    );

    if (canali.whatsapp) {
      const primoConTel = clientiConCanale.find(c => c.tel);
      if (primoConTel) {
        const msg = testo.replace('{nome}', primoConTel.nome || '').replace('{attività}', config?.nome_azienda || '');
        const tel = primoConTel.tel.replace(/\D/g, '');
        window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, '_blank');
      }
    }

    if (canali.email) {
      const primoConEmail = clientiConCanale.find(c => c.email);
      if (primoConEmail) {
        const msg = testo.replace('{nome}', primoConEmail.nome || '').replace('{attività}', config?.nome_azienda || '');
        window.open(`mailto:${primoConEmail.email}?subject=${encodeURIComponent(titolo)}&body=${encodeURIComponent(msg)}`, '_blank');
      }
    }

    setLoading(false);

    // Ricarica storico
    const { data } = await supabase.from('promozioni').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
    setPromozioni(data || []);

    // Reset wizard
    setStep(1);
    setTitolo('');
    setTesto('');
    setTemplateId('viola');
    setFotoUrl(null);
    setDestinatari('tutti');
    setCanali({ whatsapp: true, email: false });
  };

  // ── labels ──
  const L = {
    title: isEn ? 'Promote Yourself' : 'Promuoviti',
    sub: isEn ? 'Create a promotion and send it to your clients.' : 'Crea una promozione e inviala ai tuoi clienti.',
    step1: isEn ? 'Write your promotion' : 'Scrivi la tua promozione',
    step1sub: isEn ? 'Use variables to personalise the message.' : 'Usa le variabili per personalizzare il messaggio.',
    step2: isEn ? 'Choose a template' : 'Scegli un template',
    step2sub: isEn ? 'Optional: add a photo.' : 'Opzionale: aggiungi una foto.',
    step3: isEn ? 'Recipients & channel' : 'Destinatari e canale',
    step3sub: isEn ? 'Who receives it and how.' : 'Chi lo riceve e come.',
    labelTitolo: isEn ? 'Promotion title' : 'Titolo promozione',
    labelTesto: isEn ? 'Message text' : 'Testo messaggio',
    placeholderTitolo: isEn ? 'E.g. Christmas offer — 30% off' : 'Es. Offerta Natale — 30% di sconto',
    placeholderTesto: isEn
      ? 'Hi {nome}! 🎁\n\nThis month I\'m offering you a special 20% discount if you bring a friend to your next appointment.\n\nValid until 31 Dec. Book now! 👇'
      : 'Ciao {nome}! 🎁\n\nQuesto mese ti offro uno sconto speciale del 20% se porti un\'amica al tuo prossimo appuntamento.\n\nValido fino al 31 dic. Prenota subito! 👇',
    varNome: isEn ? '+ {name}' : '+ {nome}',
    varAtt: isEn ? '+ {business}' : '+ {attività}',
    addPhoto: isEn ? 'Add a photo (optional)' : 'Aggiungi una foto (opzionale)',
    tuttiClienti: isEn ? 'All clients' : 'Tutti i clienti',
    tuttiSub: isEn ? 'Send to your entire contact list' : 'Invia a tutta la rubrica',
    inattivi: isEn ? 'Inactive clients' : 'Clienti inattivi',
    inativiSub: isEn ? 'No appointment in 30+ days' : 'Nessun appuntamento da 30+ giorni',
    vip: 'VIP',
    vipSub: isEn ? 'Marked as VIP' : 'Contrassegnati come VIP',
    whatsapp: 'WhatsApp',
    whatsappSub: isEn ? 'Opens pre-filled message' : 'Apre il messaggio pre-compilato',
    emailLbl: 'Email',
    emailSub: isEn ? 'Opens your email client' : 'Apre il client email',
    send: isEn ? '🚀 Send promotion' : '🚀 Invia promozione',
    sending: isEn ? 'Sending...' : 'Invio...',
    next: isEn ? 'Next →' : 'Avanti →',
    back: isEn ? '← Back' : '← Indietro',
    preview: isEn ? 'Preview' : 'Anteprima',
    history: isEn ? 'Sent promotions' : 'Promozioni inviate',
    noHistory: isEn ? 'No promotions sent yet.' : 'Nessuna promozione inviata ancora.',
    dest: isEn ? 'clients' : 'clienti',
    chars: isEn ? 'characters' : 'caratteri',
    stepLabels: isEn ? ['Text', 'Template', 'Send'] : ['Testo', 'Template', 'Invia'],
    photoAdded: isEn ? 'Photo added ✓' : 'Foto aggiunta ✓',
    infoWa: isEn
      ? 'WhatsApp opens a pre-filled window for each client. You confirm sending with one tap.'
      : 'WhatsApp apre una finestra per ogni cliente con il messaggio pre-compilato. Confermi l\'invio con un tap.',
    noDest: isEn ? 'No clients with contact details found.' : 'Nessun cliente con dati di contatto trovato.',
  };

  // ── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Baloo 2', sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={sectionTitleStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Megaphone color="#F97316" size={22} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#1E293B', lineHeight: 1.2 }}>{L.title}</div>
            <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '500' }}>{L.sub}</div>
          </div>
        </div>
      </div>

      {/* ── WIZARD ── */}
      <div style={cardStyle}>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '20px' }}>
          {L.stepLabels.map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <React.Fragment key={n}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '800', flexShrink: 0,
                    background: done ? '#22C55E' : active ? '#5D5C9E' : '#F1F5F9',
                    color: done || active ? 'white' : '#94A3B8',
                    transition: 'all 0.2s',
                  }}>
                    {done ? <Check size={13} /> : n}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: active ? '#5D5C9E' : done ? '#22C55E' : '#94A3B8' }}>
                    {label}
                  </span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: '2px', background: done ? '#22C55E' : '#F1F5F9', borderRadius: '2px', margin: '0 4px', transition: 'background 0.3s' }} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── STEP 1: Testo ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={stepTitleStyle}>{L.step1}</div>
              <div style={stepSubStyle}>{L.step1sub}</div>
            </div>

            {/* Titolo */}
            <div>
              <label style={labelStyle}>{L.labelTitolo}</label>
              <input
                value={titolo}
                onChange={e => setTitolo(e.target.value)}
                placeholder={L.placeholderTitolo}
                style={inputStyle}
              />
            </div>

            {/* Testo */}
            <div>
              <label style={labelStyle}>{L.labelTesto}</label>
              <textarea
                value={testo}
                onChange={e => setTesto(e.target.value)}
                placeholder={L.placeholderTesto}
                rows={6}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button style={chipStyle} onClick={() => insertVar(isEn ? '{name}' : '{nome}')}>{L.varNome}</button>
                  <button style={chipStyle} onClick={() => insertVar(isEn ? '{business}' : '{attività}')}>{L.varAtt}</button>
                </div>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>{testo.length} {L.chars}</span>
              </div>
            </div>

            {/* Anteprima inline */}
            {testo.length > 0 && (
              <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '14px', border: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{L.preview}</div>
                <div style={{ background: 'white', borderRadius: '10px 10px 10px 0', padding: '10px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'inline-block', maxWidth: '100%' }}>
                  <div style={{ fontSize: '13px', color: '#1E293B', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{testoAnteprima}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Template + Foto ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={stepTitleStyle}>{L.step2}</div>
              <div style={stepSubStyle}>{L.step2sub}</div>
            </div>

            {/* Template grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {TEMPLATES.map(tpl => (
                <div
                  key={tpl.id}
                  onClick={() => setTemplateId(tpl.id)}
                  style={{
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: `2px solid ${templateId === tpl.id ? '#5D5C9E' : '#F1F5F9'}`,
                    cursor: 'pointer',
                    boxShadow: templateId === tpl.id ? '0 0 0 3px rgba(93,92,158,0.15)' : 'none',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                >
                  {templateId === tpl.id && (
                    <div style={{ position: 'absolute', top: '6px', right: '6px', width: '20px', height: '20px', borderRadius: '50%', background: '#5D5C9E', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                      <Check size={11} color="white" />
                    </div>
                  )}
                  <div style={{ height: '70px', background: tpl.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>
                    {tpl.emoji}
                  </div>
                  <div style={{ padding: '6px 8px', textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#1E293B', background: 'white' }}>
                    {tpl.label[lang] || tpl.label.it}
                  </div>
                </div>
              ))}
            </div>

            {/* Preview card promozione */}
            <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
              <div style={{ background: tpl.bg, padding: '20px 16px', position: 'relative', minHeight: '80px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {fotoUrl && (
                  <img src={fotoUrl} alt="" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '10px', marginBottom: '8px' }} />
                )}
                <div style={{ fontSize: '15px', fontWeight: '800', color: tpl.accent, lineHeight: 1.2 }}>{titolo || (isEn ? 'Your promotion title' : 'Il titolo della tua promozione')}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{testoAnteprima.slice(0, 80)}{testoAnteprima.length > 80 ? '…' : ''}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', fontWeight: '600' }}>powered by KIPRI</div>
              </div>
            </div>

            {/* Upload foto */}
            <div>
              <label style={{ ...labelStyle, display: 'block', marginBottom: '6px' }}>{L.addPhoto}</label>
              <label style={uploadStyle}>
                <input type="file" accept="image/*" onChange={handleFoto} style={{ display: 'none' }} />
                <Image size={18} color="#94A3B8" />
                <span style={{ fontSize: '13px', color: fotoUrl ? '#22C55E' : '#94A3B8', fontWeight: '600' }}>
                  {fotoUrl ? L.photoAdded : (isEn ? 'Tap to add photo' : 'Tocca per aggiungere foto')}
                </span>
              </label>
            </div>
          </div>
        )}

        {/* ── STEP 3: Destinatari + Canale ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={stepTitleStyle}>{L.step3}</div>
              <div style={stepSubStyle}>{L.step3sub}</div>
            </div>

            {/* Segmenti */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'tutti', label: L.tuttiClienti, sub: L.tuttiSub, icon: '👥' },
                { id: 'inattivi', label: L.inattivi, sub: L.inativiSub, icon: '💤' },
                { id: 'vip', label: L.vip, sub: L.vipSub, icon: '⭐' },
              ].map(seg => (
                <div
                  key={seg.id}
                  onClick={() => setDestinatari(seg.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: `1.5px solid ${destinatari === seg.id ? '#5D5C9E' : '#F1F5F9'}`,
                    background: destinatari === seg.id ? '#EEEEF8' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: destinatari === seg.id ? '#5D5C9E' : '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, transition: 'all 0.15s' }}>
                    {seg.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{seg.label}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>{seg.sub}</div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#5D5C9E', background: '#EEEEF8', padding: '3px 10px', borderRadius: '20px', flexShrink: 0 }}>
                    {seg.id === 'tutti' ? clienti?.length || 0 : seg.id === 'inattivi' ? clientiFiltrati.length : clienti?.filter(c => c.vip)?.length || 0} {L.dest}
                  </div>
                </div>
              ))}
            </div>

            {/* Canali */}
            <div>
              <label style={{ ...labelStyle, display: 'block', marginBottom: '8px' }}>{isEn ? 'Send via' : 'Invia tramite'}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { id: 'whatsapp', label: L.whatsapp, sub: L.whatsappSub, icon: '💬', color: '#25D366' },
                  { id: 'email', label: L.emailLbl, sub: L.emailSub, icon: '✉️', color: '#5D5C9E' },
                ].map(ch => (
                  <div
                    key={ch.id}
                    onClick={() => setCanali(prev => ({ ...prev, [ch.id]: !prev[ch.id] }))}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                      padding: '14px 10px',
                      borderRadius: '14px',
                      border: `2px solid ${canali[ch.id] ? ch.color : '#F1F5F9'}`,
                      background: canali[ch.id] ? (ch.id === 'whatsapp' ? '#F0FDF4' : '#EEEEF8') : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: '26px' }}>{ch.icon}</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>{ch.label}</span>
                    <span style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.3 }}>{ch.sub}</span>
                    {canali[ch.id] && (
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: ch.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
                        <Check size={11} color="white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Nota informativa */}
            <div style={{ background: '#EEEEF8', borderRadius: '12px', padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>ℹ️</span>
              <span style={{ fontSize: '12px', color: '#5D5C9E', fontWeight: '600', lineHeight: 1.5 }}>{L.infoWa}</span>
            </div>

            {nDest === 0 && (
              <div style={{ background: '#FEF2F2', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', color: '#EF4444', fontWeight: '600' }}>
                ⚠️ {L.noDest}
              </div>
            )}
          </div>
        )}

        {/* ── FOOTER WIZARD ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
          <button
            onClick={() => setStep(s => s - 1)}
            style={{ ...backBtnStyle, visibility: step > 1 ? 'visible' : 'hidden' }}
          >
            {L.back}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              style={{ ...nextBtnStyle, opacity: canProceed() ? 1 : 0.45 }}
            >
              {L.next}
            </button>
          ) : (
            <button
              onClick={handleInvia}
              disabled={loading || (!canali.whatsapp && !canali.email) || nDest === 0}
              style={{ ...nextBtnStyle, opacity: (loading || (!canali.whatsapp && !canali.email) || nDest === 0) ? 0.45 : 1 }}
            >
              {loading ? L.sending : L.send}
            </button>
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
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>📣</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', marginBottom: '4px' }}>{L.noHistory}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {promozioni.map(p => {
              const canaliP = (() => { try { return JSON.parse(p.canali); } catch { return {}; } })();
              const canaleLabel = [canaliP.whatsapp && '💬 WA', canaliP.email && '✉️ Email'].filter(Boolean).join(' · ');
              const dataStr = p.created_at ? new Date(p.created_at).toLocaleDateString(isEn ? 'en-GB' : 'it-IT', { day: 'numeric', month: 'short' }) : '';
              return (
                <div key={p.id} style={{ background: 'white', borderRadius: '16px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: TEMPLATES.find(t => t.id === p.template_id)?.bg || '#EEEEF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                    {TEMPLATES.find(t => t.id === p.template_id)?.emoji || '📣'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.titolo}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                      {dataStr} · {canaleLabel} · {p.n_destinatari || 0} {L.dest}
                    </div>
                  </div>
                  <div style={{ background: '#EEF8F2', color: '#15803D', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', flexShrink: 0 }}>
                    {isEn ? 'Sent' : 'Inviata'}
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

// ── STYLES ──────────────────────────────────────────────────────────────────
const sectionTitleStyle = {
  marginBottom: '16px',
};
const cardStyle = {
  background: 'white',
  borderRadius: '22px',
  padding: '20px',
  boxShadow: '0 2px 12px rgba(93,92,158,0.08)',
  border: '1px solid rgba(93,92,158,0.1)',
};
const stepTitleStyle = {
  fontSize: '17px',
  fontWeight: '800',
  color: '#1E293B',
  fontFamily: "'Baloo 2', sans-serif",
};
const stepSubStyle = {
  fontSize: '12px',
  color: '#94A3B8',
  marginTop: '2px',
  fontWeight: '500',
};
const labelStyle = {
  fontSize: '13px',
  fontWeight: '700',
  color: '#1E293B',
  display: 'block',
  marginBottom: '6px',
  fontFamily: "'Baloo 2', sans-serif",
};
const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  border: '1.5px solid #E2E8F0',
  borderRadius: '12px',
  fontFamily: "'Baloo 2', sans-serif",
  fontSize: '14px',
  color: '#1E293B',
  background: '#F8FAFC',
  outline: 'none',
  boxSizing: 'border-box',
};
const chipStyle = {
  background: '#EEEEF8',
  color: '#5D5C9E',
  border: '1px solid rgba(93,92,158,0.2)',
  borderRadius: '8px',
  padding: '4px 10px',
  fontSize: '12px',
  fontWeight: '700',
  cursor: 'pointer',
  fontFamily: "'Baloo 2', sans-serif",
};
const uploadStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '14px',
  border: '1.5px dashed #E2E8F0',
  borderRadius: '12px',
  cursor: 'pointer',
  background: '#F8FAFC',
};
const backBtnStyle = {
  background: 'none',
  border: '1.5px solid #E2E8F0',
  borderRadius: '10px',
  padding: '9px 16px',
  fontFamily: "'Baloo 2', sans-serif",
  fontSize: '13px',
  fontWeight: '700',
  color: '#94A3B8',
  cursor: 'pointer',
};
const nextBtnStyle = {
  background: 'linear-gradient(135deg, #5D5C9E 0%, #4a4980 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  padding: '11px 22px',
  fontFamily: "'Baloo 2', sans-serif",
  fontSize: '14px',
  fontWeight: '700',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(93,92,158,0.25)',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};
