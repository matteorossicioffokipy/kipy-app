import React from 'react';
import { Crown, Lock } from 'lucide-react';
import { useLang } from '../LanguageContext';

export default function ProGate({ onUpgrade, loading }) {
  const { lang } = useLang();

  return (
    <div style={{
      background: 'white', borderRadius: '24px', padding: '32px 24px',
      textAlign: 'center', boxShadow: '0 4px 20px rgba(93,92,158,0.1)',
      border: '2px solid #EEEEF8',
    }}>

      <div style={{
        width: '64px', height: '64px', borderRadius: '20px',
        background: 'linear-gradient(135deg, #5D5C9E 0%, #3d3b7a 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(93,92,158,0.3)',
      }}>
        <Lock size={28} color="white" />
      </div>

      <h2 style={{
        fontSize: '22px', fontWeight: '900', color: '#1E293B',
        margin: '0 0 8px', fontFamily: "'Baloo 2', sans-serif",
      }}>
        {lang === 'it' ? 'Funzione Pro' : 'Pro Feature'}
      </h2>

      <p style={{
        fontSize: '14px', color: '#64748B', lineHeight: '1.6',
        margin: '0 0 24px', fontFamily: "'Baloo 2', sans-serif",
      }}>
        {lang === 'it'
          ? 'Questa funzione è disponibile solo nel piano Pro. Passa a Pro per sbloccarla insieme a tante altre funzionalità.'
          : 'This feature is only available on the Pro plan. Upgrade to Pro to unlock it along with many other features.'}
      </p>

      {/* FREE vs PRO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px', textAlign: 'left' }}>
        {/* FREE */}
        <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Free</div>
          {[
            { it: 'Calendario', en: 'Calendar' },
            { it: 'Promemoria WhatsApp', en: 'WhatsApp reminders' },
            { it: 'Fino a 20 clienti', en: 'Up to 20 clients' },
            { it: 'Business card base', en: 'Basic business card' },
          ].map((f, i) => (
            <div key={i} style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', fontFamily: "'Baloo 2', sans-serif", padding: '3px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#15803D' }}>✓</span> {lang === 'it' ? f.it : f.en}
            </div>
          ))}
        </div>
        {/* PRO */}
        <div style={{ background: 'linear-gradient(135deg, #EEEEF8 0%, #f0f0fa 100%)', borderRadius: '14px', padding: '14px', border: '1.5px solid #5D5C9E22' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#5D5C9E', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Pro ✨</div>
          {[
            { it: 'Rubrica illimitata', en: 'Unlimited contacts' },
            { it: 'Fatture PDF', en: 'PDF invoices' },
            { it: 'Finanze', en: 'Finances' },
            { it: 'Business card completa', en: 'Full business card' },
            { it: 'Statistiche', en: 'Statistics' },
            { it: 'Pagamenti QR', en: 'QR payments' },
          ].map((f, i) => (
            <div key={i} style={{ fontSize: '12px', fontWeight: '700', color: '#5D5C9E', fontFamily: "'Baloo 2', sans-serif", padding: '3px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>★</span> {lang === 'it' ? f.it : f.en}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onUpgrade}
        disabled={loading}
        style={{
          width: '100%', padding: '16px',
          background: loading ? '#94A3B8' : 'linear-gradient(135deg, #5D5C9E 0%, #3d3b7a 100%)',
          color: 'white', border: 'none', borderRadius: '16px',
          fontSize: '16px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: "'Baloo 2', sans-serif",
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: '0 4px 16px rgba(93,92,158,0.3)',
        }}
      >
        <Crown size={20} />
        {loading
          ? (lang === 'it' ? 'Reindirizzamento...' : 'Redirecting...')
          : (lang === 'it' ? 'Passa a Pro — €5.99/mese' : 'Upgrade to Pro — £5.99/month')}
      </button>

      <p style={{
        fontSize: '11px', color: '#94A3B8', marginTop: '10px',
        fontFamily: "'Baloo 2', sans-serif",
      }}>
        {lang === 'it'
          ? 'Pagamento sicuro via Stripe · Annulla quando vuoi'
          : 'Secure payment via Stripe · Cancel anytime'}
      </p>
    </div>
  );
}
