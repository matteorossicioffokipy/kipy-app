import React, { useState } from 'react';
import { Mail, Lock, LogIn, KeyRound } from 'lucide-react';
import { useLang } from '../LanguageContext';

export default function Login({ supabase, logo }) {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rimaniConnesso, setRimaniConnesso] = useState(true);

  const fontStyle = { fontFamily: "'Baloo 2'", fontWeight: '800' };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email, password,
      options: { persistSession: rimaniConnesso }
    });
    if (error) alert(t('error') + ': ' + error.message);
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email) { alert(t('login_resetEmail')); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) alert(t('error') + ': ' + error.message);
    else alert(t('login_resetSent'));
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <img src={logo} alt="Logo" style={{ height: '60px', marginBottom: '20px' }} />
        <h2 style={{ ...titleStyle, ...fontStyle }}>{t('login_welcome')}</h2>
        <p style={{ ...subtitleStyle, ...fontStyle, fontWeight: '600' }}>{t('login_subtitle')}</p>

        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <div style={inputGroupStyle}>
            <Mail size={20} color="#94A3B8" />
            <input type="email" placeholder={t('login_email')} value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ ...inputStyle, ...fontStyle }} required />
          </div>
          <div style={inputGroupStyle}>
            <Lock size={20} color="#94A3B8" />
            <input type="password" placeholder={t('login_password')} value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...inputStyle, ...fontStyle }} required />
          </div>

          <div style={rimaniStyle} onClick={() => setRimaniConnesso(!rimaniConnesso)}>
            <div style={{ ...checkboxStyle, backgroundColor: rimaniConnesso ? '#5D5C9E' : 'transparent', borderColor: rimaniConnesso ? '#5D5C9E' : '#E2E8F0' }}>
              {rimaniConnesso && <div style={checkInnerStyle} />}
            </div>
            <span style={{ ...rimaniTextStyle, ...fontStyle, fontWeight: '700' }}>
              {t('login_stayConnected')}
            </span>
          </div>

          <button type="submit" disabled={loading} style={{ ...loginBtnStyle, ...fontStyle }}>
            {loading ? t('login_loading') : t('login_button')}
            {!loading && <LogIn size={22} style={{ marginLeft: '10px' }} />}
          </button>
        </form>

        <button onClick={handleResetPassword} style={{ ...forgotBtnStyle, ...fontStyle, fontWeight: '600' }}>
          <KeyRound size={16} />
          {t('login_forgot')}
        </button>
      </div>
    </div>
  );
}

const containerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#F0F2F5', padding: '20px' };
const cardStyle = { background: 'white', padding: '40px 30px', borderRadius: '35px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.05)' };
const titleStyle = { color: '#1E293B', marginBottom: '5px', fontSize: '32px' };
const subtitleStyle = { color: '#94A3B8', marginBottom: '30px', fontSize: '18px' };
const inputGroupStyle = { display: 'flex', alignItems: 'center', gap: '15px', background: '#F8FAFC', padding: '16px 20px', borderRadius: '20px', marginBottom: '15px', border: '2px solid #E2E8F0' };
const inputStyle = { border: 'none', background: 'transparent', outline: 'none', fontSize: '18px', width: '100%', color: '#1E293B' };
const rimaniStyle = { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', cursor: 'pointer' };
const checkboxStyle = { width: '24px', height: '24px', borderRadius: '8px', border: '2px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const checkInnerStyle = { width: '12px', height: '12px', backgroundColor: 'white', borderRadius: '3px' };
const rimaniTextStyle = { fontSize: '17px', color: '#64748B' };
const loginBtnStyle = { width: '100%', padding: '18px', borderRadius: '22px', background: '#5D5C9E', color: 'white', border: 'none', fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const forgotBtnStyle = { marginTop: '25px', background: 'none', border: 'none', color: '#94A3B8', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };