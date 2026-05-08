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

      {/* Icona lock */}
      <div style={{
        width: '64px', height: '64px', borderRadius: '20px',
        background: 'linear-gradient(135deg, #5D5C9E 0%, #3d3b7a 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(93,92,158,0.3)',
      }}>
        <Lock size={28} color="white" />
      </div>

      {/* Titolo */}
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

      {/* Feature list */}
      <div style={{
        background: '#F8F8FC', borderRadius: '16px', padding: '16px',
        marginBottom: '24px', textAlign: 'left',
      }}>
        {[
          { it: '✓ Fatture PDF illimitate', en: '✓ Unlimited PDF invoices' },
          { it: '✓ Clienti illimitati', en: '✓ Unlimited clients' },
          { it: '✓ Analytics avanzate', en: '✓ Advanced analytics' },
          { it: '✓ Funzioni in anteprima', en: '✓ Early access features' },
          { it: '✓ Supporto prioritario', en: '✓ Priority support' },
        ].map((f, i) => (
          <div key={i} style={{
            fontSize: '13px', fontWeight: '700', color: '#5D5C9E',
            fontFamily: "'Baloo 2', sans-serif", padding: '4px 0',
          }}>
            {lang === 'it' ? f.it : f.en}
          </div>
        ))}
      </div>

      {/* Bottone upgrade */}
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
