import React, { useState, useEffect, useRef } from 'react';
import {
  Megaphone, Send, Mail, MessageCircle, Users, Star,
  Check, ChevronRight, Info, UserCheck, X, Plus,
  Pencil, Trash2, BookOpen, Clock, ChevronDown, Tag, Image, Upload, Eye,
} from 'lucide-react';
import { useLang } from '../LanguageContext';

// ── ICONE EMOJI disponibili per personalizzare la promo ────────────────────
const ICONE_PROMO = [
  '🎁','🌸','⚡','🎉','🔥','💫','🌟','✨','🎊','💎',
  '🌈','🍀','🎯','🏷️','💰','🛍️','🎀','🌺','🍾','🥳',
];

const DEFAULT_TESTO_IT = `Ciao {nome}! 🎁

Questo mese ti offro uno sconto speciale del 20% se porti un'amica al tuo prossimo appuntamento.

Valido fino al 31 dic. Prenota subito! 👇

— {attività}`;

const DEFAULT_TESTO_EN = `Hi {nome}! 🎁

This month I'm offering you a special 20% discount if you bring a friend to your next appointment.

Valid until 31 Dec. Book now! 👇

— {attività}`;

// ── STYLES ────────────────────────────────────────────────────────────────
const card = {
  background: 'white',
  borderRadius: '22px',
  padding: '18px',
  boxShadow: '0 2px 12px rgba(93,92,158,0.08)',
  border: '1px solid rgba(93,92,158,0.1)',
};
const inputSt = {
  width: '100%', padding: '11px 14px',
  border: '1.5px solid #E2E8F0', borderRadius: '12px',
  fontFamily: "'Baloo 2', sans-serif", fontSize: '14px',
  color: '#1E293B', background: '#F8FAFC',
  outline: 'none', boxSizing: 'border-box',
};
const labelSt = {
  fontSize: '12px', fontWeight: '700', color: '#1E293B',
  fontFamily: "'Baloo 2', sans-serif", marginBottom: '6px', display: 'block',
};
const btnViolaSt = {
  background: 'linear-gradient(135deg, #5D5C9E 0%, #4a4980 100%)',
  color: 'white', border: 'none', borderRadius: '12px',
  padding: '11px 20px', fontFamily: "'Baloo 2', sans-serif",
  fontSize: '14px', fontWeight: '700', cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(93,92,158,0.25)',
  display: 'flex', alignItems: 'center', gap: '6px',
};
const btnSecSt = {
  background: 'none', border: '1.5px solid #E2E8F0',
  borderRadius: '10px', padding: '9px 16px',
  fontFamily: "'Baloo 2', sans-serif", fontSize: '13px',
  fontWeight: '700', color: '#94A3B8', cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: '6px',
};

// ── TAB BAR ───────────────────────────────────────────────────────────────
function TabBar({ active, onChange, labels }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1.5px solid #F1F5F9', marginBottom: '18px', gap: '0' }}>
      {labels.map((l, i) => (
        <button key={i} onClick={() => onChange(i)}
          style={{
            flex: 1, padding: '10px 6px', fontFamily: "'Baloo 2', sans-serif",
            fontSize: '13px', fontWeight: '700', border: 'none', background: 'none',
            color: active === i ? '#5D5C9E' : '#94A3B8', cursor: 'pointer',
            borderBottom: `2.5px solid ${active === i ? '#5D5C9E' : 'transparent'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            transition: 'color 0.15s',
          }}>
          {l}
        </button>
      ))}
    </div>
  );
}

// ── COMPONENTE PRINCIPALE ─────────────────────────────────────────────────
export default function Promuoviti({ supabase, user, clienti, config }) {
  const { lang, t } = useLang();
  const isEn = lang === 'en';

  // Tab attivo: 0=Libreria, 1=Crea/Modifica, 2=Storico
  const [tab, setTab] = useState(0);

  // Lista promozioni salvate (libreria)
  const [libreria, setLibreria] = useState([]);
  const [loadingLib, setLoadingLib] = useState(true);

  // Lista invii (storico)
  const [storico, setStorico] = useState([]);
  const [loadingSto, setLoadingSto] = useState(true);

  // Form crea/modifica
  const [editId, setEditId] = useState(null); // null = nuovo
  const [iconaPromo, setIconaPromo] = useState('🎁');
  const [mostraIcone, setMostraIcone] = useState(false);
  const [titolo, setTitolo] = useState('');
  const [testo, setTesto] = useState(isEn ? DEFAULT_TESTO_EN : DEFAULT_TESTO_IT);
  const [codiceSconto, setCodiceSconto] = useState('');
  const [canali, setCanali] = useState({ whatsapp: true, email: false });
  const [fotoUrl, setFotoUrl] = useState('');        // URL immagine salvata
  const [fotoUploading, setFotoUploading] = useState(false);
  const fotoInputRef = useRef(null);

  // Invio (bottom sheet)
  const [sheetPromo, setSheetPromo] = useState(null); // promo da inviare
  const [destinatari, setDestinatari] = useState('tutti');
  const [clientiSelezionati, setClientiSelezionati] = useState([]);
  const [dropdownClienti, setDropdownClienti] = useState(false);
  const [urlPronto, setUrlPronto] = useState('');
  const dropRef = useRef(null);

  // Conferma eliminazione
  const [deleteId, setDeleteId] = useState(null);

  // Anteprima promo
  const [anteprima, setAnteprima] = useState(null);

  const isEn_ = isEn;

  // ── HELPERS SUPABASE ───────────────────────────────────────────────────
  const caricaLibreria = () => {
    if (!supabase || !user) return;
    supabase.from('promozioni')
      .select('*')
      .eq('user_id', user.id)
      .eq('tipo', 'libreria')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setLibreria(data || []); setLoadingLib(false); })
      .catch(() => setLoadingLib(false));
  };

  const caricaStorico = () => {
    if (!supabase || !user) return;
    supabase.from('promozioni')
      .select('*')
      .eq('user_id', user.id)
      .eq('tipo', 'storico')
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => { setStorico(data || []); setLoadingSto(false); })
      .catch(() => setLoadingSto(false));
  };

  useEffect(() => { caricaLibreria(); caricaStorico(); }, [user]);

  // Ricarica quando torna visibile (es. dopo WhatsApp)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        caricaLibreria();
        caricaStorico();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [user]);

  // Aggiorna testo default al cambio lingua
  useEffect(() => {
    if (!editId) setTesto(isEn ? DEFAULT_TESTO_EN : DEFAULT_TESTO_IT);
  }, [lang]);

  // Chiudi dropdown cliccando fuori
  useEffect(() => {
    if (!dropdownClienti) return;
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownClienti(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [dropdownClienti]);

  // ── SALVA PROMO IN LIBRERIA ───────────────────────────────────────────
  const salvaInLibreria = async () => {
    if (!titolo.trim() || !testo.trim()) return;
    const record = {
      user_id: user.id,
      tipo: 'libreria',
      icona: iconaPromo,
      titolo,
      testo,
      codice_sconto: codiceSconto.trim() || null,
      canali: JSON.stringify(canali),
      created_at: new Date().toISOString(),
    };
    if (fotoUrl) record.foto_url = fotoUrl;
    try {
      if (editId) {
        await supabase.from('promozioni').update(record).eq('id', editId);
      } else {
        await supabase.from('promozioni').insert([record]);
      }
      caricaLibreria();
      resetForm();
      setTab(0);
    } catch (e) { /* silent */ }
  };

  // ── ELIMINA ───────────────────────────────────────────────────────────
  const eliminaPromo = async (id) => {
    await supabase.from('promozioni').delete().eq('id', id);
    caricaLibreria();
    setDeleteId(null);
  };

  // ── APRI MODIFICA ─────────────────────────────────────────────────────
  const apriModifica = (p) => {
    setEditId(p.id);
    setIconaPromo(p.icona || '🎁');
    setTitolo(p.titolo || '');
    setTesto(p.testo || '');
    setCodiceSconto(p.codice_sconto || '');
    setFotoUrl(p.foto_url || '');
    try { setCanali(JSON.parse(p.canali)); } catch { setCanali({ whatsapp: true, email: false }); }
    setTab(1);
  };

  const resetForm = () => {
    setEditId(null);
    setIconaPromo('🎁');
    setTitolo('');
    setTesto(isEn ? DEFAULT_TESTO_EN : DEFAULT_TESTO_IT);
    setCodiceSconto('');
    setCanali({ whatsapp: true, email: false });
    setMostraIcone(false);
    setFotoUrl('');
  };

  // ── INVIA ─────────────────────────────────────────────────────────────
  const nVip = clienti?.filter(c => c.vip)?.length || 0;

  const clientiFiltrati = (() => {
    if (!clienti?.length) return [];
    if (destinatari === 'tutti') return clienti;
    if (destinatari === 'vip') return clienti.filter(c => c.vip);
    if (destinatari === 'seleziona') return clienti.filter(c => clientiSelezionati.includes(c.id));
    return clienti;
  })();

  const calcolaUrl = (promo) => {
    const tplTesto = promo.testo || '';
    const codiceTesto = promo.codice_sconto ? promo.codice_sconto : '';
    let canaliP = {};
    try { canaliP = JSON.parse(promo.canali); } catch { canaliP = { whatsapp: true }; }

    const clientiConCanale = clientiFiltrati.filter(c =>
      (canaliP.whatsapp && c.tel) || (canaliP.email && c.email)
    );

    if (canaliP.whatsapp) {
      const primo = clientiConCanale.find(c => c.tel);
      if (primo) {
        const msg = tplTesto
          .replace(/\{nome\}/g, primo.nome || '')
          .replace(/\{attività\}/g, config?.nome_azienda || '')
          .replace(/\{codice\}/g, codiceTesto);
        return `https://wa.me/${primo.tel.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
      }
    } else if (canaliP.email) {
      const primo = clientiConCanale.find(c => c.email);
      if (primo) {
        const msg = tplTesto
          .replace(/\{nome\}/g, primo.nome || '')
          .replace(/\{attività\}/g, config?.nome_azienda || '')
          .replace(/\{codice\}/g, codiceTesto);
        return `mailto:${primo.email}?subject=${encodeURIComponent(promo.titolo)}&body=${encodeURIComponent(msg)}`;
      }
    }
    return '';
  };

  const apriSheet = (promo) => {
    setSheetPromo(promo);
    setDestinatari('tutti');
    setClientiSelezionati([]);
    setUrlPronto('');
  };

  const handleInviaSheet = () => {
    if (!sheetPromo) return;
    setUrlPronto(calcolaUrl(sheetPromo));
  };

  // Salva in storico quando si apre il link
  const onOpenLink = async () => {
    if (!sheetPromo || !user) return;
    const nDest = clientiFiltrati.filter(c => {
      let cp = {};
      try { cp = JSON.parse(sheetPromo.canali); } catch {}
      return (cp.whatsapp && c.tel) || (cp.email && c.email);
    }).length;
    try {
      await supabase.from('promozioni').insert([{
        user_id: user.id,
        tipo: 'storico',
        icona: sheetPromo.icona || '🎁',
        titolo: sheetPromo.titolo,
        testo: sheetPromo.testo,
        codice_sconto: sheetPromo.codice_sconto,
        destinatari,
        n_destinatari: nDest,
        canali: sheetPromo.canali,
        created_at: new Date().toISOString(),
      }]);
      caricaStorico();
    } catch { /* silent */ }
    setTimeout(() => {
      setSheetPromo(null);
      setUrlPronto('');
    }, 600);
  };

  // ── LABELS ───────────────────────────────────────────────────────────
  const L = {
    title:        isEn ? 'Promote Yourself'           : 'Promuoviti',
    sub:          isEn ? 'Your saved promotions'       : 'Le tue promozioni salvate',
    tabLib:       isEn ? 'Library'                     : 'Libreria',
    tabCrea:      isEn ? 'Create'                      : 'Crea',
    tabSto:       isEn ? 'History'                     : 'Storico',
    btnNew:       isEn ? 'New promotion'               : 'Nuova promozione',
    emptyLib:     isEn ? 'No promotions saved yet.'    : 'Nessuna promozione salvata ancora.',
    emptyLibSub:  isEn ? 'Create your first template.' : 'Crea il tuo primo template.',
    emptyHist:    isEn ? 'No promotions sent yet.'     : 'Nessuna promozione inviata ancora.',
    lblTitolo:    isEn ? 'Title'                       : 'Titolo',
    lblTesto:     isEn ? 'Message text'                : 'Testo del messaggio',
    lblCodice:    isEn ? 'Discount code (optional)'    : 'Codice sconto (opzionale)',
    pTitle:       isEn ? 'E.g. Spring offer — 20% off' : 'Es. Offerta Primavera — 20% sconto',
    pCodice:      isEn ? 'E.g. SPRING20'               : 'Es. PRIMAVERA20',
    varHint:      isEn
      ? '{nome} = client · {attività} = your business · {codice} = discount code'
      : '{nome} = cliente · {attività} = tua attività · {codice} = codice sconto',
    canaliLabel:  isEn ? 'Channels'                    : 'Canali',
    salva:        isEn ? 'Save to library'             : 'Salva nella libreria',
    aggiorna:     isEn ? 'Update'                      : 'Aggiorna',
    annulla:      isEn ? 'Cancel'                      : 'Annulla',
    invia:        isEn ? 'Send'                        : 'Invia',
    modifica:     isEn ? 'Edit'                        : 'Modifica',
    elimina:      isEn ? 'Delete'                      : 'Elimina',
    dest:         isEn ? 'clients'                     : 'clienti',
    tuttiLbl:     isEn ? 'All clients'                 : 'Tutti i clienti',
    vipLbl:       'VIP',
    selezionaLbl: isEn ? 'Select a client…'            : 'Seleziona un cliente…',
    inviaTramite: isEn ? 'Send via'                    : 'Invia tramite',
    apriWa:       isEn ? 'Open WhatsApp'               : 'Apri WhatsApp',
    apriEmail:    isEn ? 'Open Email'                  : 'Apri Email',
    noVip:        isEn ? 'No VIP clients yet.'         : 'Nessun cliente VIP.',
    noDest:       isEn ? 'No clients with contacts.'   : 'Nessun cliente con contatti.',
    sent:         isEn ? 'Sent'                        : 'Inviata',
    infoWa:       isEn
      ? 'WhatsApp opens a pre-filled message for the first client. Confirm sending with one tap.'
      : 'WhatsApp apre il messaggio pre-compilato per il primo cliente. Confermi con un tap.',
    confirmDel:   isEn ? 'Delete this promotion?'      : 'Eliminare questa promozione?',
    confirmDelSub:isEn ? 'This action cannot be undone.' : 'Questa azione non può essere annullata.',
    yes:          isEn ? 'Delete'                      : 'Elimina',
    no:           isEn ? 'Cancel'                      : 'Annulla',
    iconeScegli:  isEn ? 'Choose an icon'              : 'Scegli un\'icona',
    iconeLabel:   isEn ? 'Icon (optional)'             : 'Icona (facoltativa)',
    anteprima:    isEn ? 'Preview'                     : 'Anteprima',
    fotoLabel:    isEn ? 'Photo (optional)'            : 'Foto (facoltativa)',
    fotoBtn:      isEn ? 'Upload photo'                : 'Carica foto',
    fotoChange:   isEn ? 'Change'                      : 'Cambia',
    fotoRemove:   isEn ? 'Remove'                      : 'Rimuovi',
    fotoUpl:      isEn ? 'Uploading…'                  : 'Caricamento…',
  };

  // ── UPLOAD FOTO ───────────────────────────────────────────────────────
  const uploadFoto = async (file) => {
    if (!file || !supabase || !user) return;
    setFotoUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `promozioni/${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('promo-foto').upload(path, file, { upsert: true });
      if (!error) {
        const { data: urlData } = supabase.storage.from('promo-foto').getPublicUrl(path);
        setFotoUrl(urlData?.publicUrl || '');
      }
    } catch { /* silent */ }
    setFotoUploading(false);
  };

  const tabLabels = [
    <><BookOpen size={14} />{L.tabLib}</>,
    <><Plus size={14} />{editId ? L.modifica : L.tabCrea}</>,
    <><Clock size={14} />{L.tabSto}</>,
  ];

  // ── RENDER ─────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Baloo 2', sans-serif" }}>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp  { from { transform:translateY(100%); }           to { transform:translateY(0); } }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Megaphone color="#F97316" size={22} />
        </div>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#1E293B', lineHeight: 1.2 }}>{L.title}</div>
          <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '500' }}>{L.sub}</div>
        </div>
        {tab !== 1 && (
          <button onClick={() => { resetForm(); setTab(1); }}
            style={{ ...btnViolaSt, marginLeft: 'auto', padding: '8px 14px', fontSize: '13px', borderRadius: '10px' }}>
            <Plus size={15} color="white" />
            {L.btnNew}
          </button>
        )}
      </div>

      {/* ── TAB BAR ── */}
      <TabBar active={tab} onChange={(i) => { if (i !== 1) resetForm(); setTab(i); }} labels={tabLabels} />

      {/* ════════════════════ TAB 0 — LIBRERIA ════════════════════ */}
      {tab === 0 && (
        <div style={{ animation: 'fadeInUp 0.2s ease' }}>
          {loadingLib ? (
            <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '13px', padding: '32px' }}>{t('loading')}</div>
          ) : libreria.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#EEEDF7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Megaphone size={28} color="#5D5C9E" />
              </div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B', marginBottom: '4px' }}>{L.emptyLib}</div>
              <div style={{ fontSize: '13px', color: '#94A3B8' }}>{L.emptyLibSub}</div>
              <button onClick={() => { resetForm(); setTab(1); }}
                style={{ ...btnViolaSt, margin: '16px auto 0', justifyContent: 'center' }}>
                <Plus size={15} />{L.btnNew}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {libreria.map(p => {
                let canaliP = {};
                try { canaliP = JSON.parse(p.canali); } catch {}
                const dataStr = p.created_at
                  ? new Date(p.created_at).toLocaleDateString(isEn ? 'en-GB' : 'it-IT', { day: 'numeric', month: 'short' })
                  : '';
                return (
                  <div key={p.id} style={{ ...card, animation: 'fadeInUp 0.2s ease' }}>
                    {/* Riga superiore: icona + info */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                      {p.foto_url ? (
                        <img src={p.foto_url} alt={p.titolo} style={{ width: '44px', height: '44px', borderRadius: '14px', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#EEEDF7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                          {p.icona || '🎁'}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '3px' }}>
                          {p.titolo}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '6px' }}>
                          {p.testo?.slice(0, 60)}{(p.testo?.length || 0) > 60 ? '…' : ''}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {canaliP.whatsapp && <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', background: '#F0FDF4', color: '#16A34A' }}>WhatsApp</span>}
                          {canaliP.email    && <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', background: '#EEF2FF', color: '#5D5C9E' }}>Email</span>}
                          {p.codice_sconto  && <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', background: '#FFFBEB', color: '#92400E', display: 'flex', alignItems: 'center', gap: '3px' }}><Tag size={9} />{p.codice_sconto}</span>}
                          <span style={{ fontSize: '10px', color: '#CBD5E1', marginLeft: 'auto' }}>{dataStr}</span>
                        </div>
                      </div>
                    </div>

                    {/* Riga inferiore: 4 bottoni */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                      {/* Invia */}
                      <button onClick={() => apriSheet(p)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 4px', borderRadius: '12px', border: 'none', background: '#5D5C9E', cursor: 'pointer' }}>
                        <Send size={14} color="white" />
                        <span style={{ fontSize: '10px', fontWeight: '700', color: 'white', fontFamily: "'Baloo 2',sans-serif" }}>{L.invia}</span>
                      </button>
                      {/* Anteprima */}
                      <button onClick={() => setAnteprima(p)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 4px', borderRadius: '12px', border: '1.5px solid #E2E8F0', background: 'white', cursor: 'pointer' }}>
                        <Eye size={14} color="#5D5C9E" />
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#5D5C9E', fontFamily: "'Baloo 2',sans-serif" }}>{L.anteprima}</span>
                      </button>
                      {/* Modifica */}
                      <button onClick={() => apriModifica(p)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 4px', borderRadius: '12px', border: '1.5px solid #E2E8F0', background: 'white', cursor: 'pointer' }}>
                        <Pencil size={14} color="#5D5C9E" />
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#5D5C9E', fontFamily: "'Baloo 2',sans-serif" }}>{L.modifica}</span>
                      </button>
                      {/* Elimina */}
                      <button onClick={() => setDeleteId(p.id)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 4px', borderRadius: '12px', border: '1.5px solid #FEE2E2', background: '#FFF5F5', cursor: 'pointer' }}>
                        <Trash2 size={14} color="#EF4444" />
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#EF4444', fontFamily: "'Baloo 2',sans-serif" }}>{L.elimina}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════ TAB 1 — CREA / MODIFICA ════════════════════ */}
      {tab === 1 && (
        <div style={{ animation: 'fadeInUp 0.2s ease' }}>
          <div style={card}>

            {/* Icona facoltativa */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelSt}>{L.iconeLabel}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={() => setMostraIcone(v => !v)}
                  style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#EEEDF7', border: `2px solid ${mostraIcone ? '#5D5C9E' : '#E2E8F0'}`, fontSize: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {iconaPromo}
                </button>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>{L.iconeScegli}</span>
              </div>
              {mostraIcone && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px', padding: '12px', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                  {ICONE_PROMO.map(ic => (
                    <button key={ic} onClick={() => { setIconaPromo(ic); setMostraIcone(false); }}
                      style={{ width: '38px', height: '38px', borderRadius: '10px', border: `2px solid ${ic === iconaPromo ? '#5D5C9E' : 'transparent'}`, background: ic === iconaPromo ? '#EEEDF7' : 'white', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {ic}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Titolo */}
            <div style={{ marginBottom: '14px' }}>
              <label style={labelSt}>{L.lblTitolo}</label>
              <input value={titolo} onChange={e => setTitolo(e.target.value)}
                placeholder={L.pTitle} style={inputSt} />
            </div>

            {/* Testo */}
            <div style={{ marginBottom: '14px' }}>
              <label style={labelSt}>{L.lblTesto}</label>
              <textarea value={testo} onChange={e => setTesto(e.target.value)}
                rows={6} style={{ ...inputSt, resize: 'vertical', lineHeight: '1.6' }} />
              <div style={{ background: '#EEEDF7', borderRadius: '10px', padding: '8px 12px', marginTop: '6px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <Info size={13} color="#5D5C9E" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '11px', color: '#5D5C9E', fontWeight: '600', lineHeight: 1.5 }}>{L.varHint}</span>
              </div>
            </div>

            {/* Codice sconto */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelSt}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Tag size={13} color="#F59E0B" />{L.lblCodice}
                </span>
              </label>
              <input value={codiceSconto} onChange={e => setCodiceSconto(e.target.value.toUpperCase())}
                placeholder={L.pCodice}
                style={{ ...inputSt, fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }} />
              {codiceSconto && (
                <div style={{ fontSize: '11px', color: '#92400E', background: '#FFFBEB', borderRadius: '8px', padding: '6px 10px', marginTop: '6px', fontWeight: '600' }}>
                  {isEn ? 'In the message, use {codice} where you want to insert this code.' : 'Nel messaggio usa {codice} dove vuoi inserire questo codice.'}
                </div>
              )}
            </div>

            {/* Foto */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelSt}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Image size={13} color="#5D5C9E" />{L.fotoLabel}
                </span>
              </label>
              <input ref={fotoInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { if (e.target.files?.[0]) uploadFoto(e.target.files[0]); }} />
              {!fotoUrl ? (
                <button onClick={() => fotoInputRef.current?.click()} disabled={fotoUploading}
                  style={{ width: '100%', padding: '18px', border: '2px dashed #E2E8F0', borderRadius: '14px', background: '#F8FAFC', cursor: fotoUploading ? 'default' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontFamily: "'Baloo 2',sans-serif" }}>
                  {fotoUploading
                    ? <><Upload size={22} color="#94A3B8" /><span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>{L.fotoUpl}</span></>
                    : <><Image size={22} color="#94A3B8" /><span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>{L.fotoBtn}</span></>
                  }
                </button>
              ) : (
                <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', border: '2px solid #5D5C9E' }}>
                  <img src={fotoUrl} alt="promo" style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '6px' }}>
                    <button onClick={() => fotoInputRef.current?.click()}
                      style={{ padding: '5px 10px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: '700', color: '#5D5C9E', cursor: 'pointer', fontFamily: "'Baloo 2',sans-serif" }}>
                      {L.fotoChange}
                    </button>
                    <button onClick={() => setFotoUrl('')}
                      style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', background: 'rgba(239,68,68,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <X size={14} color="white" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Canali */}
            <div style={{ marginBottom: '18px' }}>
              <label style={labelSt}>{L.canaliLabel}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle size={22} color={canali.whatsapp ? '#25D366' : '#94A3B8'} />, activeBg: '#F0FDF4', activeColor: '#25D366' },
                  { id: 'email',    label: 'Email',    icon: <Mail          size={22} color={canali.email    ? '#5D5C9E' : '#94A3B8'} />, activeBg: '#EEEDF7', activeColor: '#5D5C9E' },
                ].map(ch => {
                  const active = canali[ch.id];
                  return (
                    <div key={ch.id} onClick={() => setCanali(p => ({ ...p, [ch.id]: !p[ch.id] }))}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '12px 8px', borderRadius: '14px', border: `2px solid ${active ? ch.activeColor : '#F1F5F9'}`, background: active ? ch.activeBg : 'white', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center' }}>
                      {ch.icon}
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B' }}>{ch.label}</span>
                      {active && <Check size={13} color={ch.activeColor} />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottoni footer form */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { resetForm(); setTab(0); }} style={{ ...btnSecSt, flex: 1, justifyContent: 'center' }}>
                {L.annulla}
              </button>
              <button onClick={salvaInLibreria}
                disabled={!titolo.trim() || !testo.trim()}
                style={{ ...btnViolaSt, flex: 2, justifyContent: 'center', opacity: (!titolo.trim() || !testo.trim()) ? 0.4 : 1 }}>
                <Check size={15} color="white" />
                {editId ? L.aggiorna : L.salva}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ TAB 2 — STORICO ════════════════════ */}
      {tab === 2 && (
        <div style={{ animation: 'fadeInUp 0.2s ease' }}>
          {loadingSto ? (
            <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '13px', padding: '32px' }}>{t('loading')}</div>
          ) : storico.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#EEEDF7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Clock size={28} color="#5D5C9E" />
              </div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B', marginBottom: '4px' }}>{L.emptyHist}</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {storico.map(p => {
                let canaliP = {};
                try { canaliP = JSON.parse(p.canali); } catch {}
                const dataStr = p.created_at
                  ? new Date(p.created_at).toLocaleDateString(isEn ? 'en-GB' : 'it-IT', { day: 'numeric', month: 'short' })
                  : '';
                return (
                  <div key={p.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#EEEDF7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                      {p.icona || '🎁'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.titolo}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span>{dataStr}</span>
                        {canaliP.whatsapp && <span style={{ color: '#16A34A' }}>WhatsApp</span>}
                        {canaliP.email    && <span style={{ color: '#5D5C9E' }}>Email</span>}
                        <span>· {p.n_destinatari || 0} {L.dest}</span>
                      </div>
                    </div>
                    <div style={{ background: '#F0FDF4', color: '#16A34A', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', flexShrink: 0 }}>
                      {L.sent}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════ BOTTOM SHEET — INVIA ════════════════════ */}
      {sheetPromo && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) { setSheetPromo(null); setUrlPronto(''); } }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: 'white', borderRadius: '22px 22px 0 0', width: '100%', maxWidth: '600px', margin: '0 auto', padding: '20px 18px', paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))', animation: 'slideUp 0.25s ease', maxHeight: '85vh', overflowY: 'auto' }}>
            {/* Handle */}
            <div style={{ width: '36px', height: '4px', background: '#E2E8F0', borderRadius: '2px', margin: '0 auto 16px' }} />

            {/* Titolo promo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#EEEDF7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                {sheetPromo.icona || '🎁'}
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B' }}>{sheetPromo.titolo}</div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>{isEn ? 'Send to…' : 'Invia a…'}</div>
              </div>
              <button onClick={() => { setSheetPromo(null); setUrlPronto(''); }}
                style={{ marginLeft: 'auto', width: '32px', height: '32px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} color="#94A3B8" />
              </button>
            </div>

            {/* Destinatari */}
            <label style={labelSt}>{isEn ? 'Recipients' : 'Destinatari'}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {[
                { id: 'tutti', label: L.tuttiLbl, icon: <Users size={17} color={destinatari === 'tutti' ? 'white' : '#5D5C9E'} />, n: clienti?.length || 0 },
                { id: 'vip',   label: L.vipLbl,   icon: <Star  size={17} color={destinatari === 'vip'   ? 'white' : '#F59E0B'} fill={destinatari === 'vip' ? 'white' : 'none'} />, n: nVip },
                { id: 'seleziona', label: L.selezionaLbl, icon: <UserCheck size={17} color={destinatari === 'seleziona' ? 'white' : '#6366F1'} />, n: clientiSelezionati.length },
              ].map(seg => {
                const active = destinatari === seg.id;
                return (
                  <div key={seg.id}>
                    <div onClick={() => { setDestinatari(seg.id); if (seg.id !== 'seleziona') setDropdownClienti(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '14px', border: `1.5px solid ${active ? '#5D5C9E' : '#F1F5F9'}`, background: active ? '#EEEDF7' : 'white', cursor: 'pointer', transition: 'all 0.15s' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: active ? '#5D5C9E' : '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {seg.icon}
                      </div>
                      <span style={{ flex: 1, fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{seg.label}</span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: active ? '#5D5C9E' : '#94A3B8', background: active ? 'rgba(93,92,158,0.1)' : '#F1F5F9', padding: '2px 9px', borderRadius: '20px' }}>
                        {seg.n} {L.dest}
                      </span>
                      {seg.id === 'seleziona' && (
                        <ChevronDown size={15} color="#94A3B8" style={{ transform: (active && dropdownClienti) ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                          onClick={(e) => { e.stopPropagation(); if (active) setDropdownClienti(v => !v); }} />
                      )}
                    </div>

                    {/* Dropdown selezione singolo cliente */}
                    {seg.id === 'seleziona' && active && (
                      <div ref={dropRef} style={{ border: '1.5px solid #5D5C9E', borderTop: 'none', borderRadius: '0 0 14px 14px', background: 'white', maxHeight: '180px', overflowY: 'auto' }}>
                        <div style={{ padding: '8px 12px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '8px' }}>
                          <button onClick={() => setClientiSelezionati(clienti?.map(c => c.id) || [])}
                            style={{ fontSize: '11px', fontWeight: '700', color: '#5D5C9E', background: '#EEEDF7', border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontFamily: "'Baloo 2',sans-serif" }}>
                            {isEn ? 'All' : 'Tutti'}
                          </button>
                          <button onClick={() => setClientiSelezionati([])}
                            style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontFamily: "'Baloo 2',sans-serif" }}>
                            {isEn ? 'None' : 'Nessuno'}
                          </button>
                        </div>
                        {(clienti || []).map(c => {
                          const sel = clientiSelezionati.includes(c.id);
                          return (
                            <div key={c.id} onClick={() => setClientiSelezionati(prev => sel ? prev.filter(x => x !== c.id) : [...prev, c.id])}
                              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', cursor: 'pointer', background: sel ? '#EEEDF7' : 'white', borderBottom: '1px solid #F8FAFC', transition: 'background 0.1s' }}>
                              <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: `2px solid ${sel ? '#5D5C9E' : '#E2E8F0'}`, background: sel ? '#5D5C9E' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                                {sel && <Check size={11} color="white" />}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {c.nome}{c.vip && <Star size={10} color="#F59E0B" fill="#F59E0B" style={{ marginLeft: '4px', verticalAlign: 'middle' }} />}
                                </div>
                                {(c.tel || c.email) && <div style={{ fontSize: '11px', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.tel || c.email}</div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {seg.id === 'vip' && active && nVip === 0 && (
                      <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '8px 12px', marginTop: '6px', fontSize: '12px', color: '#92400E', fontWeight: '600' }}>⭐ {L.noVip}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Info box */}
            <div style={{ background: '#EEEDF7', borderRadius: '12px', padding: '10px 13px', display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '16px' }}>
              <Info size={14} color="#5D5C9E" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '12px', color: '#5D5C9E', fontWeight: '600', lineHeight: 1.5 }}>{L.infoWa}</span>
            </div>

            {/* Bottone invia */}
            {!urlPronto ? (
              <button onClick={handleInviaSheet}
                disabled={destinatari === 'seleziona' && clientiSelezionati.length === 0}
                style={{ ...btnViolaSt, width: '100%', justifyContent: 'center', fontSize: '15px', padding: '14px', borderRadius: '16px', opacity: (destinatari === 'seleziona' && clientiSelezionati.length === 0) ? 0.4 : 1 }}>
                <Send size={16} color="white" />
                {isEn ? 'Prepare message' : 'Prepara messaggio'}
              </button>
            ) : (() => {
              let canaliP = {};
              try { canaliP = JSON.parse(sheetPromo.canali); } catch {}
              const isWa = canaliP.whatsapp;
              return (
                <a href={urlPronto} target="_blank" rel="noopener noreferrer"
                  onClick={onOpenLink}
                  style={{
                    ...btnViolaSt,
                    background: isWa
                      ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
                      : 'linear-gradient(135deg, #5D5C9E 0%, #4a4980 100%)',
                    width: '100%', justifyContent: 'center', fontSize: '15px', padding: '14px',
                    borderRadius: '16px', textDecoration: 'none', color: 'white',
                    boxShadow: isWa ? '0 4px 14px rgba(34,197,94,0.3)' : '0 4px 12px rgba(93,92,158,0.25)',
                  }}>
                  {isWa
                    ? <><MessageCircle size={16} color="white" />{L.apriWa}</>
                    : <><Mail         size={16} color="white" />{L.apriEmail}</>}
                </a>
              );
            })()}
          </div>
        </div>
      )}

      {/* ════════════════════ MODAL ANTEPRIMA ════════════════════ */}
      {anteprima && (
        <div onClick={() => setAnteprima(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: 'white', borderRadius: '22px', width: '100%', maxWidth: '340px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            {/* Foto header se presente */}
            {anteprima.foto_url && (
              <img src={anteprima.foto_url} alt={anteprima.titolo} style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
            )}
            <div style={{ padding: '18px' }}>
              {/* Icona + titolo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                {!anteprima.foto_url && (
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#EEEDF7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                    {anteprima.icona || '🎁'}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B' }}>{anteprima.titolo}</div>
                  {anteprima.codice_sconto && (
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', background: '#FFFBEB', color: '#92400E', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '3px' }}>
                      <Tag size={9} />{anteprima.codice_sconto}
                    </span>
                  )}
                </div>
                <button onClick={() => setAnteprima(null)}
                  style={{ width: '30px', height: '30px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <X size={15} color="#94A3B8" />
                </button>
              </div>
              {/* Testo messaggio */}
              <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '14px', fontSize: '13px', color: '#1E293B', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto', fontFamily: "'Baloo 2',sans-serif" }}>
                {anteprima.testo}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ DIALOG CONFERMA ELIMINAZIONE ════════════════════ */}
      {deleteId && (
        <div onClick={() => setDeleteId(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: 'white', borderRadius: '22px', padding: '24px 20px', maxWidth: '320px', width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#FFF5F5', border: '2px solid #FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Trash2 size={24} color="#EF4444" />
            </div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B', marginBottom: '6px' }}>{L.confirmDel}</div>
            <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px' }}>{L.confirmDelSub}</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteId(null)}
                style={{ ...btnSecSt, flex: 1, justifyContent: 'center' }}>{L.no}</button>
              <button onClick={() => eliminaPromo(deleteId)}
                style={{ ...btnViolaSt, flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', boxShadow: '0 4px 12px rgba(239,68,68,0.25)' }}>
                <Trash2 size={14} color="white" />{L.yes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
