import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useLang } from '../LanguageContext';
import { CheckCircle, Link, QrCode, Copy, ExternalLink } from 'lucide-react';

export default function PagamentiQR({ config, supabase, user }) {
  const { lang } = useLang();
  const [importo, setImporto] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [salvato, setSalvato] = useState(false);
  const [linkGenerato, setLinkGenerato] = useState('');
  const [loadingLink, setLoadingLink] = useState(false);
  const [copiato, setCopiato] = useState(false);

  const t = (it, en) => lang === 'it' ? it : en;
  const currency = lang === 'it' ? '€' : '£';

  const metodi = [
    { label: config?.label_pagamento_1 || '', link: config?.link_pagamento || '' },
    { label: config?.label_pagamento_2 || '', link: config?.link_pagamento_2 || '' },
    { label: config?.label_pagamento_3 || '', link: config?.link_pagamento_3 || '' },
  ].filter(m => m.link.trim().length > 0);

  const hasMetodi = metodi.length > 0;

  const generaLink = async () => {
    if (!importo || parseFloat(importo) <= 0) return;
    setLoadingLink(true);
    try {
      const { data, error } = await supabase.from('pagamenti_qr').insert([{
        user_id: user.id,
        importo: parseFloat(importo),
        descrizione: descrizione || '',
        metodi: metodi,
        nome_professionista: config?.nome_azienda || '',
        logo_url: config?.logo_url || '',
      }]).select().single();

      if (error) throw error;
      const url = `https://www.kipri.app/pay.html?id=${data.id}`;
      setLinkGenerato(url);
    } catch (err) {
      alert(t('Errore nella generazione del link. Riprova.', 'Error generating link. Please try again.'));
      console.error(err);
    }
    setLoadingLink(false);
  };

  const copiaLink = () => {
    navigator.clipboard.writeText(linkGenerato);
    setCopiato(true);
    setTimeout(() => setCopiato(false), 2000);
  };

  const registraIncasso = async () => {
    if (!importo || parseFloat(importo) <= 0) return;
    await supabase.from('movimenti').insert([{
      user_id: user.id,
      tipo: 'entrata',
      importo: parseFloat(importo),
      categoria: 'Pagamento QR',
      descrizione: descrizione || t('Pagamento via QR', 'QR Payment'),
      data: new Date().toLocaleDateString('en-CA'),
    }]);
    setSalvato(true);
    setTimeout(() => {
      setSalvato(false);
      setImporto('');
      setDescrizione('');
      setLinkGenerato('');
    }, 2500);
  };

  const resetTutto = () => {
    setImporto('');
    setDescrizione('');
    setLinkGenerato('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Baloo 2', sans-serif" }}>

      <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1E293B', margin: 0 }}>
        {t('Pagamenti QR', 'QR Payments')}
      </h2>

      {/* AVVISO SE NON HA METODI */}
      {!hasMetodi && (
        <div style={{ background: '#FFFBEB', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #FDE68A' }}>
          <Link size={20} color="#D97706" />
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#92400E' }}>
              {t('Aggiungi un metodo di pagamento', 'Add a payment method')}
            </div>
            <div style={{ fontSize: '12px', color: '#B45309', marginTop: '2px' }}>
              {t('Vai su Impostazioni → Metodi di pagamento rapido', 'Go to Settings → Quick payment methods')}
            </div>
          </div>
        </div>
      )}

      {/* FORM IMPORTO */}
      {!linkGenerato && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}><QrCode size={16} color="#5D5C9E" /> {t('Nuovo pagamento', 'New payment')}</div>

          <label style={labelStyle}>{t('Importo da richiedere', 'Amount to request')}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#5D5C9E' }}>{currency}</span>
            <input
              type="number" min="0" step="0.01"
              style={{ ...inputStyle, fontSize: '24px', fontWeight: '800', color: '#1E293B', width: '100%' }}
              placeholder="0.00"
              value={importo}
              onChange={e => setImporto(e.target.value)}
            />
          </div>

          <label style={{ ...labelStyle, marginTop: '12px' }}>{t('Descrizione (opzionale)', 'Description (optional)')}</label>
          <input
            style={inputStyle}
            placeholder={t('Es: Taglio + piega', 'E.g: Haircut + blow dry')}
            value={descrizione}
            onChange={e => setDescrizione(e.target.value)}
          />

          <button
            onClick={generaLink}
            disabled={!importo || parseFloat(importo) <= 0 || !hasMetodi || loadingLink}
            style={{
              marginTop: '8px', padding: '14px', borderRadius: '14px', border: 'none',
              background: (!importo || parseFloat(importo) <= 0 || !hasMetodi) ? '#E2E8F0' : 'linear-gradient(135deg, #5D5C9E 0%, #3d3b7a 100%)',
              color: (!importo || parseFloat(importo) <= 0 || !hasMetodi) ? '#94A3B8' : 'white',
              fontWeight: '800', fontSize: '15px', cursor: (!importo || parseFloat(importo) <= 0 || !hasMetodi) ? 'not-allowed' : 'pointer',
              fontFamily: "'Baloo 2', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <QrCode size={18} />
            {loadingLink ? t('Generazione...', 'Generating...') : t('Genera link di pagamento', 'Generate payment link')}
          </button>
        </div>
      )}

      {/* QR + LINK GENERATO */}
      {linkGenerato && (
        <div style={{ ...sectionStyle, alignItems: 'center', textAlign: 'center' }}>

          {/* Importo in evidenza */}
          <div style={{ background: 'linear-gradient(135deg, #5D5C9E 0%, #3d3b7a 100%)', borderRadius: '16px', padding: '16px 24px', width: '100%', boxSizing: 'border-box', marginBottom: '4px' }}>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>{t('Importo richiesto', 'Amount requested')}</div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: 'white', marginTop: '4px' }}>{currency}{parseFloat(importo).toFixed(2)}</div>
            {descrizione && <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>{descrizione}</div>}
          </div>

          {/* QR */}
          <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '12px', fontWeight: '600', marginTop: '8px' }}>
            {t('Fai scansionare al cliente', 'Let your client scan this')}
          </div>
          <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 24px rgba(93,92,158,0.15)', border: '2px solid #EEEEF8', display: 'inline-block' }}>
            <QRCodeSVG value={linkGenerato} size={200} fgColor="#5D5C9E" level="H" />
          </div>

          {/* COPIA LINK */}
          <button
            onClick={copiaLink}
            style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', border: '1.5px solid #EEEEF8', background: copiato ? '#EEF8F2' : 'white', color: copiato ? '#15803D' : '#5D5C9E', fontWeight: '700', fontSize: '13px', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif" }}
          >
            {copiato ? <CheckCircle size={16} /> : <Copy size={16} />}
            {copiato ? t('Link copiato!', 'Link copied!') : t('Copia link', 'Copy link')}
          </button>

          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>
            {t('Link valido 24 ore', 'Link valid for 24 hours')}
          </div>

          {/* METODI VISIBILI AL PROFESSIONISTA */}
          <div style={{ width: '100%', marginTop: '16px', background: '#F8F9FF', borderRadius: '14px', padding: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              {t('Il cliente vedrà questi metodi', 'Your client will see these methods')}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {metodi.map((m, i) => (
                <span key={i} style={{ padding: '6px 14px', borderRadius: '20px', background: 'white', border: '1.5px solid #EEEEF8', fontSize: '13px', fontWeight: '700', color: '#5D5C9E' }}>
                  {m.label || `Link ${i + 1}`}
                </span>
              ))}
            </div>
          </div>

          {/* AZIONI */}
          <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '8px' }}>
            <button onClick={resetTutto} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#F1F5F9', color: '#64748B', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif" }}>
              {t('Nuovo', 'New')}
            </button>
            <button
              onClick={registraIncasso}
              style={{
                flex: 2, padding: '12px', borderRadius: '12px', border: 'none',
                background: salvato ? '#22C55E' : 'linear-gradient(135deg, #5D5C9E 0%, #3d3b7a 100%)',
                color: 'white', fontWeight: '800', fontSize: '14px',
                cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <CheckCircle size={16} />
              {salvato ? t('Registrato! ✓', 'Recorded! ✓') : t('Registra incasso', 'Record payment')}
            </button>
          </div>
        </div>
      )}

      {/* ISTRUZIONI */}
      <div style={{ ...sectionStyle, background: '#F8F9FF' }}>
        <div style={sectionTitleStyle}>💡 {t('Come funziona', 'How it works')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
          {[
            t('Inserisci importo e descrizione', 'Enter amount and description'),
            t('Genera il link — ottieni un QR univoco', 'Generate the link — get a unique QR code'),
            t('Il cliente scansiona e sceglie come pagare', 'Client scans and chooses how to pay'),
            t('Registra l\'incasso per aggiornare le Finanze', 'Record the payment to update your Finances'),
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#5D5C9E', color: 'white', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                {i + 1}
              </div>
              <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>{step}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

const sectionStyle = { background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '8px' };
const sectionTitleStyle = { fontSize: '15px', fontWeight: '800', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' };
const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#64748B' };
const inputStyle = { padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: '500', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: "'Baloo 2', sans-serif", color: '#1E293B' };
