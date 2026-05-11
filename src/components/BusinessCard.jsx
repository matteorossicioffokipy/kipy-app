import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Mail, Pencil, Save, MessageCircle, Eye, QrCode, Crown, Lock } from 'lucide-react';
import { useLang } from '../LanguageContext';

export default function BusinessCard({ config, user, supabase, fetchDati, isPro }) {
  const { lang } = useLang();
  const [editing, setEditing] = useState(false);
  const [mostraQR, setMostraQR] = useState(false);
  const [form, setForm] = useState({
    nome: config.nome_titolare || '',
    cognome: config.cognome_titolare || '',
    telefono: config.telefono_business || '',
    email_business: config.email_business || user.email,
    sito: config.sito_web || '',
    azienda: config.nome_azienda || '',
    piva: config.piva || '',
    indirizzo: config.indirizzo || '',
    orari: config.orari || '',
  });

  const [visibili, setVisibili] = useState({
    telefono: true,
    email: true,
    sito: true,
    piva: false,
    indirizzo: false,
    orari: false,
  });

  const toggleVisibile = (campo) => {
    if (!isPro && ['piva', 'indirizzo', 'orari'].includes(campo)) return;
    setVisibili(prev => ({ ...prev, [campo]: !prev[campo] }));
  };

  const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${form.nome} ${form.cognome}
ORG:${form.azienda}
TEL:${form.telefono}
EMAIL:${form.email_business}
URL:${form.sito}
ADR:;;${form.indirizzo};;;
END:VCARD`;

  const handleSave = async () => {
    await supabase.from('impostazioni').update({
      nome_titolare: form.nome,
      cognome_titolare: form.cognome,
      telefono_business: form.telefono,
      email_business: form.email_business,
      sito_web: form.sito,
      piva: form.piva,
      indirizzo: form.indirizzo,
      orari: form.orari,
    }).eq('user_id', user.id);
    setEditing(false);
    fetchDati();
  };

  const shareEmail = () => {
    const subject = encodeURIComponent(`Contatto di ${form.nome} ${form.cognome}`);
    const body = encodeURIComponent(
      `Ciao, ecco i miei riferimenti:\n\n` +
      `${form.azienda}\n` +
      (visibili.telefono ? `Tel: ${form.telefono}\n` : '') +
      (visibili.email ? `Email: ${form.email_business}\n` : '') +
      (visibili.sito ? `Sito: ${form.sito}\n` : '') +
      (isPro && visibili.indirizzo ? `Indirizzo: ${form.indirizzo}\n` : '') +
      (isPro && visibili.piva ? `P.IVA: ${form.piva}\n` : '') +
      (isPro && visibili.orari ? `Orari: ${form.orari}\n` : '')
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Ciao! Ecco i miei riferimenti business:\n\n` +
      `*${form.nome} ${form.cognome}*\n` +
      `_${form.azienda}_\n\n` +
      (visibili.telefono ? `📞 ${form.telefono}\n` : '') +
      (visibili.email ? `✉️ ${form.email_business}\n` : '') +
      (visibili.sito ? `🌐 ${form.sito}\n` : '') +
      (isPro && visibili.indirizzo ? `📍 ${form.indirizzo}\n` : '') +
      (isPro && visibili.piva ? `🧾 P.IVA: ${form.piva}\n` : '') +
      (isPro && visibili.orari ? `🕐 ${form.orari}\n` : '')
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const iniziali = `${form.nome?.[0] || ''}${form.cognome?.[0] || ''}`.toUpperCase() || '?';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Baloo 2', sans-serif" }}>

      {/* ── MODALE QR FULLSCREEN ── */}
      {mostraQR && (
        <div onClick={() => setMostraQR(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(10,10,10,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', cursor: 'pointer' }}>
          <div style={{ background: 'white', borderRadius: '28px', padding: '28px', boxShadow: '0 40px 80px rgba(0,0,0,0.4)' }}>
            <QRCodeSVG value={vCard} size={240} fgColor="#5D5C9E" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>{form.nome} {form.cognome}</div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{form.azienda}</div>
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Tocca per chiudere</div>
        </div>
      )}

      {/* ── BIGLIETTO DA VISITA ── */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {config.logo_url ? (
              <img src={config.logo_url} alt="Logo" style={logoStyle} />
            ) : (
              <div style={avatarStyle}>{iniziali}</div>
            )}
            <div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#1E293B', lineHeight: 1.2 }}>{form.nome} {form.cognome}</div>
              <div style={{ fontSize: '13px', color: '#5D5C9E', fontWeight: '600', marginTop: '2px' }}>{form.azienda || 'La tua Azienda'}</div>
              {config.settore && <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{config.settore}</div>}
            </div>
          </div>
          <div style={qrSmallStyle}>
            <QRCodeSVG value={vCard} size={72} fgColor="#5D5C9E" />
          </div>
        </div>

        <div style={{ height: '1px', background: '#F1F5F9', margin: '16px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {visibili.telefono && form.telefono && (
            <div style={infoRowStyle}>
              <div style={infoIconStyle('#EEEEF8')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5D5C9E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.4h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l1.87-1.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <span style={infoTextStyle}>{form.telefono}</span>
            </div>
          )}
          {visibili.email && form.email_business && (
            <div style={infoRowStyle}>
              <div style={infoIconStyle('#EEF8F2')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#56a874" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <span style={infoTextStyle}>{form.email_business}</span>
            </div>
          )}
          {visibili.sito && form.sito && (
            <div style={infoRowStyle}>
              <div style={infoIconStyle('#FFFBEB')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </div>
              <span style={infoTextStyle}>{form.sito}</span>
            </div>
          )}
          {isPro && visibili.indirizzo && form.indirizzo && (
            <div style={infoRowStyle}>
              <div style={infoIconStyle('#FFF0F6')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DB2777" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <span style={infoTextStyle}>{form.indirizzo}</span>
            </div>
          )}
          {isPro && visibili.piva && form.piva && (
            <div style={infoRowStyle}>
              <div style={infoIconStyle('#EEEEF8')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5D5C9E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <span style={infoTextStyle}>P.IVA {form.piva}</span>
            </div>
          )}
          {isPro && visibili.orari && form.orari && (
            <div style={infoRowStyle}>
              <div style={infoIconStyle('#DCFCE7')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <span style={infoTextStyle}>{form.orari}</span>
            </div>
          )}
        </div>

        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '10px', color: '#CBD5E1', fontWeight: '600', letterSpacing: '1px' }}>powered by KIPRI</span>
        </div>
      </div>

      {/* ── TOGGLE VISIBILITÀ ── */}
      <div style={sectionBox}>
        <div style={sectionTitleStyle}>
          <Eye size={15} color="#5D5C9E" /> {lang === 'it' ? 'Cosa mostrare nel biglietto' : 'What to show on the card'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { key: 'telefono', label: lang === 'it' ? 'Telefono' : 'Phone', valore: form.telefono, proOnly: false },
            { key: 'email', label: 'Email', valore: form.email_business, proOnly: false },
            { key: 'sito', label: lang === 'it' ? 'Sito web' : 'Website', valore: form.sito, proOnly: false },
            { key: 'indirizzo', label: lang === 'it' ? 'Indirizzo' : 'Address', valore: form.indirizzo, proOnly: true },
            { key: 'piva', label: 'P.IVA / VAT', valore: form.piva, proOnly: true },
            { key: 'orari', label: lang === 'it' ? 'Orari' : 'Hours', valore: form.orari, proOnly: true },
          ].map(item => (
            <div key={item.key} style={{ ...toggleRowStyle, opacity: item.proOnly && !isPro ? 0.5 : 1 }} onClick={() => toggleVisibile(item.key)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.label}
                    {item.proOnly && !isPro && (
                      <span style={{ background: '#EEEEF8', color: '#5D5C9E', fontSize: '9px', fontWeight: '800', padding: '1px 6px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Crown size={8} /> PRO
                      </span>
                    )}
                  </div>
                  {item.valore
                    ? <div style={{ fontSize: '11px', color: '#94A3B8' }}>{item.valore}</div>
                    : <div style={{ fontSize: '11px', color: '#CBD5E1' }}>{lang === 'it' ? 'Non inserito' : 'Not set'}</div>
                  }
                </div>
              </div>
              {item.proOnly && !isPro
                ? <Lock size={14} color="#CBD5E1" />
                : <div style={toggleStyle(visibili[item.key])}>
                    <div style={toggleThumbStyle(visibili[item.key])} />
                  </div>
              }
            </div>
          ))}
        </div>
      </div>

      {/* ── AZIONI ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        <button onClick={() => setEditing(!editing)} style={actionBtn('#EEEEF8', '#5D5C9E')}>
          <Pencil size={18} />
          <span style={{ fontSize: '12px', fontWeight: '700' }}>{lang === 'it' ? 'Modifica' : 'Edit'}</span>
        </button>
        <button onClick={shareEmail} style={actionBtn('#EEF8F2', '#15803D')}>
          <Mail size={18} />
          <span style={{ fontSize: '12px', fontWeight: '700' }}>Email</span>
        </button>
        <button onClick={shareWhatsApp} style={actionBtn('#DCFCE7', '#15803D')}>
          <MessageCircle size={18} />
          <span style={{ fontSize: '12px', fontWeight: '700' }}>WhatsApp</span>
        </button>
        <button onClick={() => setMostraQR(true)} style={actionBtn('#FFFBEB', '#D97706')}>
          <QrCode size={18} />
          <span style={{ fontSize: '12px', fontWeight: '700' }}>QR Code</span>
        </button>
      </div>

      {/* ── FORM MODIFICA ── */}
      {editing && (
        <div style={sectionBox}>
          <div style={sectionTitleStyle}>
            <Pencil size={15} color="#5D5C9E" /> {lang === 'it' ? 'Modifica dati' : 'Edit details'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>{lang === 'it' ? 'Nome' : 'First name'}</label>
                <input style={inputStyle} placeholder="Nome" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>{lang === 'it' ? 'Cognome' : 'Last name'}</label>
                <input style={inputStyle} placeholder="Cognome" value={form.cognome} onChange={e => setForm({ ...form, cognome: e.target.value })} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>{lang === 'it' ? 'Telefono' : 'Phone'}</label>
              <input style={inputStyle} placeholder="+39 333 444 5566" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} placeholder="email@esempio.com" value={form.email_business} onChange={e => setForm({ ...form, email_business: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>{lang === 'it' ? 'Sito web' : 'Website'}</label>
              <input style={inputStyle} placeholder="www.esempio.com" value={form.sito} onChange={e => setForm({ ...form, sito: e.target.value })} />
            </div>

            {/* CAMPI PRO */}
            {isPro ? (
              <>
                <div>
                  <label style={labelStyle}>{lang === 'it' ? 'Indirizzo' : 'Address'}</label>
                  <input style={inputStyle} placeholder="Via Roma 1, Milano" value={form.indirizzo} onChange={e => setForm({ ...form, indirizzo: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>P.IVA / VAT</label>
                  <input style={inputStyle} placeholder="IT00000000000" value={form.piva} onChange={e => setForm({ ...form, piva: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>{lang === 'it' ? 'Orari' : 'Hours'}</label>
                  <input style={inputStyle} placeholder="Lun-Ven 9:00-18:00" value={form.orari} onChange={e => setForm({ ...form, orari: e.target.value })} />
                </div>
              </>
            ) : (
              <div style={{ background: '#EEEEF8', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Crown size={16} color="#5D5C9E" />
                <div style={{ fontSize: '12px', color: '#5D5C9E', fontWeight: '700' }}>
                  {lang === 'it' ? 'Passa a Pro per aggiungere indirizzo, P.IVA e orari.' : 'Upgrade to Pro to add address, VAT and hours.'}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button onClick={() => setEditing(false)} style={cancelBtn}>{lang === 'it' ? 'Annulla' : 'Cancel'}</button>
              <button onClick={handleSave} style={saveBtn}>
                <Save size={16} /> {lang === 'it' ? 'Salva' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle = { background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 24px rgba(93,92,158,0.1)', border: '1.5px solid rgba(93,92,158,0.12)' };
const cardHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' };
const logoStyle = { width: '60px', height: '60px', borderRadius: '16px', objectFit: 'contain', background: '#F8F9FF', border: '1.5px solid #EEEEF8', padding: '6px', flexShrink: 0 };
const avatarStyle = { width: '60px', height: '60px', borderRadius: '16px', background: '#5D5C9E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '800', color: 'white', flexShrink: 0 };
const qrSmallStyle = { background: '#F8F9FF', border: '1.5px solid #EEEEF8', borderRadius: '16px', padding: '10px', flexShrink: 0 };
const infoRowStyle = { display: 'flex', alignItems: 'center', gap: '10px' };
const infoIconStyle = (bg) => ({ width: '28px', height: '28px', borderRadius: '8px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 });
const infoTextStyle = { fontSize: '13px', color: '#475569', fontWeight: '500' };
const sectionBox = { background: 'white', borderRadius: '20px', padding: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '12px' };
const sectionTitleStyle = { fontSize: '14px', fontWeight: '800', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' };
const toggleRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', cursor: 'pointer', borderBottom: '1px solid #F8FAFC' };
const toggleStyle = (attivo) => ({ width: '42px', height: '24px', borderRadius: '12px', background: attivo ? '#5D5C9E' : '#E2E8F0', position: 'relative', transition: 'background 0.2s', flexShrink: 0 });
const toggleThumbStyle = (attivo) => ({ position: 'absolute', top: '3px', left: attivo ? '21px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' });
const actionBtn = (bg, color) => ({ background: bg, color: color, border: 'none', padding: '12px 8px', borderRadius: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', fontFamily: "'Baloo 2', sans-serif", touchAction: 'manipulation' });
const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontFamily: "'Baloo 2', sans-serif", color: '#1E293B', outline: 'none', boxSizing: 'border-box' };
const saveBtn = { flex: 1, background: '#5D5C9E', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
const cancelBtn = { flex: 1, background: '#F1F5F9', color: '#64748B', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '15px' };
