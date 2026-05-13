import React, { useState } from 'react';
import { Save, Upload, Check, MessageCircle, Building2, Image, Zap, Crown, Clock, Lock, CreditCard } from 'lucide-react';
import { useLang } from '../LanguageContext';

export default function Impostazioni({ config, setConfig, supabase, user, fetchDati, isPro }) {
  const { t, lang, switchLang } = useLang();
  const [loading, setLoading] = useState(false);
  const [salvato, setSalvato] = useState(false);
  const [loadingPro, setLoadingPro] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.from('impostazioni').update({
      nome_azienda: config.nome_azienda,
      settore: config.settore,
      promemoria_attivo: config.promemoria_attivo ?? true,
      promemoria_anticipo: config.promemoria_anticipo ?? '24',
      promemoria_testo: config.promemoria_testo ?? '',
      iban: config.iban ?? '',
      nome_banca: config.nome_banca ?? '',
      link_pagamento: config.link_pagamento ?? '',
      codice_fiscale: config.codice_fiscale ?? '',
      formato_orario: config.formato_orario ?? '24h',
      label_pagamento_1: config.label_pagamento_1 ?? '',
      link_pagamento_2: config.link_pagamento_2 ?? '',
      label_pagamento_2: config.label_pagamento_2 ?? '',
      link_pagamento_3: config.link_pagamento_3 ?? '',
      label_pagamento_3: config.label_pagamento_3 ?? '',
    }).eq('user_id', user.id);
    if (!error) {
      setSalvato(true);
      setTimeout(() => setSalvato(false), 3000);
      fetchDati();
    }
    setLoading(false);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileExt = file.name.split('.').pop();
    const filePath = `logos/${user.id}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('azienda-assets')
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      alert('Errore caricamento logo: ' + uploadError.message);
      return;
    }
    const { data: { publicUrl } } = supabase.storage
      .from('azienda-assets')
      .getPublicUrl(filePath);
    const urlConTimestamp = `${publicUrl}?t=${Date.now()}`;
    await supabase.from('impostazioni')
      .update({ logo_url: urlConTimestamp })
      .eq('user_id', user.id);
    setConfig(prev => ({ ...prev, logo_url: urlConTimestamp }));
  };

  const handleUpgradePro = async () => {
    setLoadingPro(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email, lang }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert('Errore nel creare la sessione di pagamento. Riprova.');
    } catch (err) {
      alert('Errore di rete. Riprova.');
    }
    setLoadingPro(false);
  };

  const testoDefault = `Ciao! 👋\nTi ricordiamo il tuo appuntamento con ${config?.nome_azienda || 'noi'} {data} alle {ora}.\nA presto!`;
  const formatoAttivo = config.formato_orario ?? '24h';
  const oraEsempio = formatoAttivo === '12h' ? '2:30 PM' : '14:30';
  const testoPreview = (config.promemoria_testo && config.promemoria_testo !== 'null' && config.promemoria_testo !== 'NULL')
    ? config.promemoria_testo
    : testoDefault;

  const metodiPagamento = [
    { link: config.link_pagamento || '', label: config.label_pagamento_1 || '', linkKey: 'link_pagamento', labelKey: 'label_pagamento_1', placeholder: 'https://revolut.me/tuonome', labelPlaceholder: lang === 'it' ? 'Es: Revolut' : 'E.g: Revolut' },
    { link: config.link_pagamento_2 || '', label: config.label_pagamento_2 || '', linkKey: 'link_pagamento_2', labelKey: 'label_pagamento_2', placeholder: 'https://paypal.me/tuonome', labelPlaceholder: lang === 'it' ? 'Es: PayPal' : 'E.g: PayPal' },
    { link: config.link_pagamento_3 || '', label: config.label_pagamento_3 || '', linkKey: 'link_pagamento_3', labelKey: 'label_pagamento_3', placeholder: 'https://monzo.me/tuonome', labelPlaceholder: lang === 'it' ? 'Es: Monzo' : 'E.g: Monzo' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Baloo 2', sans-serif" }}>
      <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1E293B', margin: 0 }}>
        {t('impostazioni_title')}
      </h2>

      {/* ── PIANO ── */}
      {isPro ? (
        <div style={{ background: 'linear-gradient(135deg, #5D5C9E 0%, #3d3b7a 100%)', borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 8px 24px rgba(93,92,158,0.3)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Crown size={22} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'white' }}>{lang === 'it' ? 'Piano Pro attivo ✨' : 'Pro Plan active ✨'}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>{lang === 'it' ? 'Hai accesso a tutte le funzionalità premium.' : 'You have access to all premium features.'}</div>
          </div>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '2px solid #EEEEF8', boxShadow: '0 2px 12px rgba(93,92,158,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#EEEEF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#5D5C9E" />
            </div>
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B' }}>{lang === 'it' ? 'Piano attuale: Free' : 'Current plan: Free'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            {[
              { it: 'Fino a 20 clienti', en: 'Up to 20 clients', pro: false },
              { it: 'Calendario', en: 'Calendar', pro: false },
              { it: 'Promemoria WhatsApp', en: 'WhatsApp reminders', pro: false },
              { it: 'Clienti illimitati', en: 'Unlimited clients', pro: true },
              { it: 'Fatture PDF', en: 'PDF invoices', pro: true },
              { it: 'Analytics avanzate', en: 'Advanced analytics', pro: true },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: f.pro ? '#5D5C9E' : '#64748B', fontWeight: f.pro ? '700' : '500' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0, background: f.pro ? '#EEEEF8' : '#EEF8F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '800', color: f.pro ? '#5D5C9E' : '#15803D' }}>
                  {f.pro ? '★' : '✓'}
                </div>
                {lang === 'it' ? f.it : f.en}
              </div>
            ))}
          </div>
          <button onClick={handleUpgradePro} disabled={loadingPro} style={{ width: '100%', padding: '14px', borderRadius: '14px', background: loadingPro ? '#94A3B8' : 'linear-gradient(135deg, #5D5C9E 0%, #3d3b7a 100%)', color: 'white', border: 'none', fontSize: '15px', fontWeight: '800', cursor: loadingPro ? 'not-allowed' : 'pointer', fontFamily: "'Baloo 2', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(93,92,158,0.3)' }}>
            <Crown size={18} />
            {loadingPro ? (lang === 'it' ? 'Reindirizzamento...' : 'Redirecting...') : (lang === 'it' ? 'Passa a Pro — €5.99/mese' : 'Upgrade to Pro — £5.99/month')}
          </button>
          <p style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', marginTop: '8px', margin: '8px 0 0' }}>
            {lang === 'it' ? 'Pagamento sicuro via Stripe · Annulla quando vuoi' : 'Secure payment via Stripe · Cancel anytime'}
          </p>
        </div>
      )}

      {/* LINGUA */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <div style={sectionIconStyle('#EEEEF8')}><span style={{ fontSize: '14px' }}>🌐</span></div>
          {t('impostazioni_language')}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => switchLang('it')} style={langChipStyle(lang === 'it')}>🇮🇹 Italiano</button>
          <button onClick={() => switchLang('en')} style={langChipStyle(lang === 'en')}>🇬🇧 English</button>
        </div>
      </div>

      {/* FORMATO ORARIO */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <div style={sectionIconStyle('#EEEEF8')}><Clock size={16} color="#5D5C9E" /></div>
          {lang === 'it' ? 'Formato orario' : 'Time format'}
        </div>
        <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 10px' }}>
          {lang === 'it' ? "Scegli come visualizzare gli orari in tutta l'app e nei promemoria." : 'Choose how times are displayed across the app and in reminders.'}
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div onClick={() => setConfig({ ...config, formato_orario: '24h' })} style={formatoChipStyle(formatoAttivo === '24h')}>
            <div style={{ fontSize: '18px', fontWeight: '900' }}>14:30</div>
            <div style={{ fontSize: '11px', marginTop: '2px' }}>24h</div>
          </div>
          <div onClick={() => setConfig({ ...config, formato_orario: '12h' })} style={formatoChipStyle(formatoAttivo === '12h')}>
            <div style={{ fontSize: '18px', fontWeight: '900' }}>2:30 PM</div>
            <div style={{ fontSize: '11px', marginTop: '2px' }}>12h AM/PM</div>
          </div>
        </div>
        <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '8px' }}>
          {lang === 'it' ? `Anteprima promemoria: "alle ${oraEsempio}"` : `Reminder preview: "at ${oraEsempio}"`}
        </p>
      </div>

      {/* PROFILO */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <div style={sectionIconStyle('#EEEEF8')}><Building2 size={16} color="#5D5C9E" /></div>
          {t('impostazioni_profile')}
        </div>
        <label style={labelStyle}>{t('impostazioni_businessName')}</label>
        <input style={inputStyle} value={config.nome_azienda || ''}
          onChange={(e) => setConfig({ ...config, nome_azienda: e.target.value })}
          placeholder="Es: Studio Tecnico Rossi" />
        <label style={{ ...labelStyle, marginTop: '10px' }}>{t('impostazioni_sector')}</label>
        <input style={inputStyle} value={config.settore || ''}
          onChange={(e) => setConfig({ ...config, settore: e.target.value })}
          placeholder={t('impostazioni_sectorPlaceholder')} />
      </div>

      {/* LOGO */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <div style={sectionIconStyle('#EEF8F2')}><Image size={16} color="#56a874" /></div>
          {t('impostazioni_logo')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
          {config.logo_url && <img src={config.logo_url} alt="Logo" key={config.logo_url} style={{ height: '50px', borderRadius: '10px', objectFit: 'contain' }} />}
          <label style={uploadBtnStyle}>
            <Upload size={18} /> {t('impostazioni_uploadLogo')}
            <input type="file" hidden onChange={handleLogoUpload} accept="image/*" />
          </label>
        </div>
      </div>

      {/* PROMEMORIA */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <div style={sectionIconStyle('#DCFCE7')}><MessageCircle size={16} color="#15803D" /></div>
          {t('impostazioni_whatsapp')}
        </div>
        <div style={toggleRowStyle} onClick={() => setConfig({ ...config, promemoria_attivo: !config.promemoria_attivo })}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{t('impostazioni_reminderActive')}</div>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{t('impostazioni_reminderSub')}</div>
          </div>
          <div style={toggleStyle(config.promemoria_attivo ?? true)}>
            <div style={toggleThumbStyle(config.promemoria_attivo ?? true)} />
          </div>
        </div>
        {(config.promemoria_attivo ?? true) && (
          <>
            <label style={{ ...labelStyle, marginTop: '14px' }}>{t('impostazioni_when')}</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px' }}>
              {[
                { label: t('impostazioni_sameDay'), value: '0' },
                { label: t('impostazioni_24h'), value: '24' },
                { label: t('impostazioni_48h'), value: '48' },
              ].map(opt => (
                <div key={opt.value} onClick={() => setConfig({ ...config, promemoria_anticipo: opt.value })}
                  style={chipStyle(config.promemoria_anticipo === opt.value)}>
                  {opt.label}
                </div>
              ))}
            </div>
            <label style={{ ...labelStyle, marginTop: '14px' }}>{t('impostazioni_messageText')}</label>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px' }}>{t('impostazioni_placeholders')}</div>
            <textarea
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
              value={testoPreview}
              onChange={(e) => setConfig({ ...config, promemoria_testo: e.target.value })}
              placeholder={testoDefault}
            />
            <div style={previewStyle}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#128C7E', marginBottom: '8px' }}>{t('impostazioni_preview')}</div>
              <div style={bubbleStyle}>
                {testoPreview
                  .replace('{nome}', 'Mario')
                  .replace('{data}', 'domani')
                  .replace('{ora}', oraEsempio)}
              </div>
            </div>
          </>
        )}
      </div>

      {/* COORDINATE BANCARIE — solo Pro */}
      {isPro ? (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>
            <div style={sectionIconStyle('#EEEEF8')}><span style={{ fontSize: '14px' }}>🏦</span></div>
            {lang === 'it' ? 'Coordinate bancarie' : 'Bank details'}
          </div>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0' }}>
            {lang === 'it' ? 'Appaiono automaticamente sulle fatture emesse.' : 'Shown automatically on issued invoices.'}
          </p>
          <label style={labelStyle}>IBAN</label>
          <input style={inputStyle}
            value={config.iban || ''}
            onChange={(e) => setConfig({ ...config, iban: e.target.value })}
            placeholder="IT60 X054 2811 1010 0000 0123 456" />
          <label style={{ ...labelStyle, marginTop: '10px' }}>{lang === 'it' ? 'Nome banca' : 'Bank name'}</label>
          <input style={inputStyle}
            value={config.nome_banca || ''}
            onChange={(e) => setConfig({ ...config, nome_banca: e.target.value })}
            placeholder={lang === 'it' ? 'Es: Banca Intesa, Revolut...' : 'E.g. Barclays, Revolut...'} />
          <label style={{ ...labelStyle, marginTop: '10px' }}>{lang === 'it' ? 'P.IVA / Codice Fiscale' : 'VAT / Company number'}</label>
          <input style={inputStyle}
            value={config.codice_fiscale || ''}
            onChange={(e) => setConfig({ ...config, codice_fiscale: e.target.value })}
            placeholder={lang === 'it' ? 'Es: IT12345678901' : 'E.g: GB123456789'} />
        </div>
      ) : (
        <div style={{ ...sectionStyle, opacity: 0.7, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px' }}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Lock size={24} color="#5D5C9E" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#5D5C9E' }}>
                {lang === 'it' ? 'Disponibile con Pro' : 'Available with Pro'}
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                {lang === 'it' ? 'IBAN, banca e P.IVA sulle fatture' : 'IBAN, bank and VAT on invoices'}
              </div>
            </div>
          </div>
          <div style={sectionTitleStyle}>
            <div style={sectionIconStyle('#EEEEF8')}><span style={{ fontSize: '14px' }}>🏦</span></div>
            {lang === 'it' ? 'Coordinate bancarie' : 'Bank details'}
          </div>
          <div style={{ height: '40px', background: '#F1F5F9', borderRadius: '12px' }} />
          <div style={{ height: '40px', background: '#F1F5F9', borderRadius: '12px' }} />
          <div style={{ height: '40px', background: '#F1F5F9', borderRadius: '12px' }} />
        </div>
      )}

      {/* METODI DI PAGAMENTO RAPIDO — solo Pro */}
      {isPro ? (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>
            <div style={sectionIconStyle('#EEEEF8')}><CreditCard size={16} color="#5D5C9E" /></div>
            {lang === 'it' ? 'Metodi di pagamento rapido' : 'Quick payment methods'}
          </div>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0' }}>
            {lang === 'it' ? 'Aggiungi fino a 3 link per ricevere pagamenti (Revolut, PayPal, Monzo…). Verranno usati per generare il QR.' : 'Add up to 3 payment links (Revolut, PayPal, Monzo…). Used to generate your payment QR.'}
          </p>
          {metodiPagamento.map((m, i) => (
            <div key={i} style={{ background: '#F8F9FF', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: i === 0 ? '4px' : '0' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#5D5C9E' }}>
                {lang === 'it' ? `Metodo ${i + 1}` : `Method ${i + 1}`}
              </div>
              <input style={inputStyle}
                value={m.label}
                onChange={(e) => setConfig({ ...config, [m.labelKey]: e.target.value })}
                placeholder={m.labelPlaceholder} />
              <input style={inputStyle}
                value={m.link}
                onChange={(e) => setConfig({ ...config, [m.linkKey]: e.target.value })}
                placeholder={m.placeholder} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ ...sectionStyle, opacity: 0.7, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px' }}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Lock size={24} color="#5D5C9E" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#5D5C9E' }}>
                {lang === 'it' ? 'Disponibile con Pro' : 'Available with Pro'}
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                {lang === 'it' ? 'Revolut, PayPal, Monzo e altro' : 'Revolut, PayPal, Monzo and more'}
              </div>
            </div>
          </div>
          <div style={sectionTitleStyle}>
            <div style={sectionIconStyle('#EEEEF8')}><CreditCard size={16} color="#5D5C9E" /></div>
            {lang === 'it' ? 'Metodi di pagamento rapido' : 'Quick payment methods'}
          </div>
          <div style={{ height: '40px', background: '#F1F5F9', borderRadius: '12px' }} />
          <div style={{ height: '40px', background: '#F1F5F9', borderRadius: '12px' }} />
        </div>
      )}

      {/* SALVA */}
      <button onClick={handleSave} disabled={loading}
        style={{ ...saveBtnStyle, backgroundColor: salvato ? '#22C55E' : '#5D5C9E' }}>
        {salvato ? <><Check size={20} /> {t('impostazioni_saved')}</> : <><Save size={20} /> {t('impostazioni_saveBtn')}</>}
      </button>
    </div>
  );
}

const sectionStyle = { background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #F1F5F9' };
const sectionTitleStyle = { fontSize: '15px', fontWeight: '800', color: '#1E293B', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' };
const sectionIconStyle = (bg) => ({ width: '32px', height: '32px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 });
const labelStyle = { fontSize: '13px', fontWeight: '700', color: '#64748B' };
const inputStyle = { padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: '500', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: "'Baloo 2', sans-serif", color: '#1E293B' };
const uploadBtnStyle = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#F1F5F9', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#5D5C9E' };
const toggleRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', cursor: 'pointer' };
const toggleStyle = (attivo) => ({ width: '46px', height: '26px', borderRadius: '13px', background: attivo ? '#5D5C9E' : '#E2E8F0', position: 'relative', transition: 'background 0.2s', flexShrink: 0 });
const toggleThumbStyle = (attivo) => ({ position: 'absolute', top: '3px', left: attivo ? '23px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' });
const chipStyle = (selected) => ({ padding: '10px 8px', borderRadius: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '700', cursor: 'pointer', background: selected ? '#5D5C9E' : '#F1F5F9', color: selected ? 'white' : '#64748B', border: selected ? '1.5px solid #5D5C9E' : '1.5px solid transparent', transition: 'all 0.15s' });
const formatoChipStyle = (selected) => ({ flex: 1, padding: '14px 10px', borderRadius: '14px', textAlign: 'center', cursor: 'pointer', background: selected ? '#5D5C9E' : '#F8FAFC', color: selected ? 'white' : '#64748B', border: selected ? '2px solid #5D5C9E' : '2px solid #E2E8F0', transition: 'all 0.15s', fontFamily: "'Baloo 2', sans-serif", fontWeight: '700' });
const previewStyle = { background: '#f0faf4', borderRadius: '14px', padding: '14px', marginTop: '8px' };
const bubbleStyle = { background: '#DCF8C6', borderRadius: '12px', borderBottomLeftRadius: '4px', padding: '10px 14px', fontSize: '13px', color: '#1E293B', lineHeight: '1.5', whiteSpace: 'pre-line' };
const saveBtnStyle = { border: 'none', padding: '16px', borderRadius: '16px', color: 'white', fontWeight: '800', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.3s', fontFamily: "'Baloo 2', sans-serif" };
const langChipStyle = (active) => ({ padding: '10px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', border: 'none', background: active ? '#5D5C9E' : '#F1F5F9', color: active ? 'white' : '#64748B', fontFamily: "'Baloo 2', sans-serif", transition: 'all 0.15s' });
