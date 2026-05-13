import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useLang } from '../LanguageContext';
import { CheckCircle, Link, QrCode, CreditCard } from 'lucide-react';

export default function PagamentiQR({ config, supabase, user }) {
  const { lang } = useLang();
  const [importo, setImporto] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [salvato, setSalvato] = useState(false);

  const t = (it, en) => lang === 'it' ? it : en;
  const currency = lang === 'it' ? '€' : '£';

  // Raccoglie tutti i metodi di pagamento configurati
  const metodi = [
    { label: config?.label_pagamento_1 || 'Revolut / PayPal', link: config?.link_pagamento || '' },
    { label: config?.label_pagamento_2 || '', link: config?.link_pagamento_2 || '' },
    { label: config?.label_pagamento_3 || '', link: config?.link_pagamento_3 || '' },
  ].filter(m => m.link.trim().length > 0);

  const linkPrincipale = metodi.length > 0 ? metodi[0].link : '';
  const linkConImporto = importo && linkPrincipale
    ? `${linkPrincipale}${linkPrincipale.includes('?') ? '&' : '?'}amount=${importo}`
    : linkPrincipale;

  const hasMetodi = metodi.length > 0;

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
    }, 2500);
  };

  // Emoji per i metodi più comuni
  const getEmoji = (label) => {
    const l = label.toLowerCase();
    if (l.includes('revolut')) return '🟣';
    if (l.includes('paypal')) return '🔵';
    if (l.includes('monzo')) return '🟠';
    if (l.includes('sumup')) return '🟢';
    if (l.includes('stripe')) return '🔷';
    return '💳';
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
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}><QrCode size={16} color="#5D5C9E" /> {t('Genera QR di pagamento', 'Generate payment QR')}</div>

        <label style={labelStyle}>{t('Importo da richiedere', 'Amount to request')}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#5D5C9E' }}>{currency}</span>
          <input
            type="number"
            min="0"
            step="0.01"
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
      </div>

      {/* QR CODE */}
      {hasMetodi && (
        <div style={{ ...sectionStyle, alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px', fontWeight: '600' }}>
            {t('Mostra questo QR al cliente', 'Show this QR to your client')}
          </div>
          <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 24px rgba(93,92,158,0.15)', border: '2px solid #EEEEF8', display: 'inline-block' }}>
            <QRCodeSVG
              value={linkConImporto || linkPrincipale}
              size={200}
              fgColor="#5D5C9E"
              level="H"
            />
          </div>
          {importo && parseFloat(importo) > 0 && (
            <div style={{ marginTop: '16px', fontSize: '28px', fontWeight: '900', color: '#5D5C9E' }}>
              {currency}{parseFloat(importo).toFixed(2)}
            </div>
          )}
          {descrizione && (
            <div style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>{descrizione}</div>
          )}

          {/* METODI DI PAGAMENTO */}
          <div style={{ width: '100%', marginTop: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              {t('Metodi accettati', 'Accepted methods')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {metodi.map((m, i) => (
                <a
                  key={i}
                  href={importo && parseFloat(importo) > 0
                    ? `${m.link}${m.link.includes('?') ? '&' : '?'}amount=${importo}`
                    : m.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', borderRadius: '14px',
                    background: i === 0 ? 'linear-gradient(135deg, #5D5C9E 0%, #3d3b7a 100%)' : '#F8F9FF',
                    color: i === 0 ? 'white' : '#1E293B',
                    textDecoration: 'none', fontWeight: '700', fontSize: '14px',
                    border: i === 0 ? 'none' : '1.5px solid #EEEEF8',
                    boxShadow: i === 0 ? '0 4px 14px rgba(93,92,158,0.3)' : 'none',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{getEmoji(m.label)}</span>
                    <span>{m.label || `Link ${i + 1}`}</span>
                  </span>
                  <span style={{ fontSize: '12px', opacity: 0.7 }}>→</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BOTTONE REGISTRA INCASSO */}
      {importo && parseFloat(importo) > 0 && (
        <button
          onClick={registraIncasso}
          style={{
            padding: '16px', borderRadius: '16px', border: 'none',
            background: salvato ? '#22C55E' : 'linear-gradient(135deg, #5D5C9E 0%, #3d3b7a 100%)',
            color: 'white', fontWeight: '800', fontSize: '16px',
            cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.3s', boxShadow: '0 4px 16px rgba(93,92,158,0.3)',
          }}
        >
          <CheckCircle size={20} />
          {salvato
            ? t('Incasso registrato! ✓', 'Payment recorded! ✓')
            : t('Registra incasso nelle Finanze', 'Record payment in Finances')}
        </button>
      )}

      {/* ISTRUZIONI */}
      <div style={{ ...sectionStyle, background: '#F8F9FF' }}>
        <div style={sectionTitleStyle}>💡 {t('Come funziona', 'How it works')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
          {[
            t('Inserisci l\'importo da richiedere', 'Enter the amount to request'),
            t('Mostra il QR al cliente — lo scansiona con la fotocamera', 'Show the QR to your client — they scan it with their camera'),
            t('Il cliente sceglie il metodo e paga direttamente', 'Client chooses their preferred method and pays directly'),
            t('Clicca "Registra incasso" per aggiornare le tue Finanze', 'Tap "Record payment" to update your Finances'),
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
