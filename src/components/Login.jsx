import React, { useState, useEffect } from 'react';
import { Mail, Lock, LogIn, KeyRound, ArrowLeft, UserPlus, Eye, EyeOff, User } from 'lucide-react';
import { useLang } from '../LanguageContext';

export default function Login({ supabase, logo }) {
  const { t, lang, switchLang } = useLang();
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nome, setNome]                     = useState('');
  const [cognome, setCognome]               = useState('');
  const [loading, setLoading]               = useState(false);
  const [rimaniConnesso, setRimaniConnesso] = useState(true);
  const [showSplash, setShowSplash]         = useState(true);
  const [showReset, setShowReset]           = useState(false);
  const [showSignup, setShowSignup]         = useState(false);
  const [resetSent, setResetSent]           = useState(false);
  const [signupDone, setSignupDone]         = useState(false);
  const [showPwd, setShowPwd]               = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [showLoginPwd, setShowLoginPwd]     = useState(false);

  // Rileva lingua da URL o localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (urlLang === 'en' || urlLang === 'it') {
      switchLang(urlLang);
    } else {
      const stored = localStorage.getItem('kipri_lang');
      if (stored === 'en' || stored === 'it') switchLang(stored);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const isEn = lang === 'en';
  const font = { fontFamily: "'Baloo 2', sans-serif" };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email, password,
      options: { persistSession: rimaniConnesso },
    });
    if (error) alert(t('error') + ': ' + error.message);
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return alert(isEn ? 'Please enter your first name.' : 'Inserisci il tuo nome.');
    if (!cognome.trim()) return alert(isEn ? 'Please enter your last name.' : 'Inserisci il tuo cognome.');
    if (password.length < 6) return alert(isEn ? 'Password must be at least 6 characters.' : 'La password deve essere di almeno 6 caratteri.');
    if (password !== confirmPassword) return alert(isEn ? 'Passwords do not match.' : 'Le password non coincidono.');
    setLoading(true);
    const fullName = `${nome.trim()} ${cognome.trim()}`;
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: fullName, first_name: nome.trim(), last_name: cognome.trim() },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) alert(t('error') + ': ' + error.message);
    else setSignupDone(true);
  };

  const handleResetPassword = async () => {
    if (!email) { alert(t('login_resetEmail')); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setLoading(false);
    if (error) alert(t('error') + ': ' + error.message);
    else setResetSent(true);
  };

  // ── SPLASH ────────────────────────────────────────────────────────────────
  if (showSplash) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #5D5C9E 0%, #4a4980 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
        <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes popIn{from{transform:scale(0.8);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
        <img src={logo} alt="Kipri" style={{ height: '60px', width: 'auto', filter: 'brightness(0) invert(1)', animation: 'popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both' }} />
        <div style={{ ...font, color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', animation: 'fadeIn 0.5s ease 0.6s both' }}>
          {isEn ? 'your business in your pocket' : 'il tuo business in tasca'}
        </div>
      </div>
    );
  }

  // ── RESET PASSWORD ────────────────────────────────────────────────────────
  if (showReset) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <img src={logo} alt="Kipri" style={{ height: '50px', marginBottom: '24px' }} />
          {resetSent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📬</div>
              <h3 style={{ ...font, fontWeight: '800', color: '#1E293B', fontSize: '20px', margin: '0 0 8px' }}>
                {isEn ? 'Email sent!' : 'Email inviata!'}
              </h3>
              <p style={{ ...font, color: '#64748B', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px' }}>
                {isEn ? 'Check your inbox and click the link to reset your password.' : 'Controlla la tua email e clicca sul link per reimpostare la password.'}
              </p>
              <button onClick={() => { setShowReset(false); setResetSent(false); }} style={{ ...loginBtnStyle, ...font }}>
                {isEn ? 'Back to login' : 'Torna al login'} <LogIn size={20} style={{ marginLeft: '8px' }} />
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => setShowReset(false)} style={backBtnStyle(font)}>
                <ArrowLeft size={16} /> {isEn ? 'Back to login' : 'Torna al login'}
              </button>
              <h2 style={{ ...font, fontWeight: '800', color: '#1E293B', fontSize: '24px', margin: '0 0 8px', alignSelf: 'flex-start' }}>
                {isEn ? 'Forgot password?' : 'Password dimenticata?'}
              </h2>
              <p style={{ ...font, color: '#94A3B8', fontSize: '14px', margin: '0 0 24px', alignSelf: 'flex-start', lineHeight: 1.6 }}>
                {isEn ? "Enter your email and we'll send you a reset link." : 'Inserisci la tua email e ti mandiamo un link per reimpostare la password.'}
              </p>
              <div style={{ ...inputGroupStyle, width: '100%' }}>
                <Mail size={20} color="#94A3B8" />
                <input type="email" placeholder={isEn ? 'Your email' : 'La tua email'} value={email}
                  onChange={e => setEmail(e.target.value)} style={{ ...inputStyle, ...font }} autoFocus />
              </div>
              <button onClick={handleResetPassword} disabled={loading} style={{ ...loginBtnStyle, ...font, marginTop: '8px' }}>
                {loading ? (isEn ? 'Sending...' : 'Invio...') : (isEn ? 'Send reset link' : 'Invia link reset')}
                <KeyRound size={20} style={{ marginLeft: '8px' }} />
              </button>
            </>
          )}
          <VersionBadge font={font} />
        </div>
      </div>
    );
  }

  // ── SIGNUP ────────────────────────────────────────────────────────────────
  if (showSignup) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <img src={logo} alt="Kipri" style={{ height: '50px', marginBottom: '8px' }} />

          {signupDone ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h3 style={{ ...font, fontWeight: '800', color: '#1E293B', fontSize: '22px', margin: '0 0 8px' }}>
                {isEn ? `Welcome to KIPRI, ${nome}!` : `Benvenuto in KIPRI, ${nome}!`}
              </h3>
              <p style={{ ...font, color: '#64748B', fontSize: '14px', lineHeight: 1.7, margin: '0 0 8px' }}>
                {isEn
                  ? <span>We sent a confirmation email to <strong>{email}</strong>.<br />Click the link to activate your account.</span>
                  : <span>Abbiamo inviato una email di conferma a <strong>{email}</strong>.<br />Clicca sul link per attivare l'account.</span>}
              </p>
              <p style={{ ...font, color: '#94A3B8', fontSize: '12px', margin: '0 0 24px' }}>
                {isEn ? '📧 Also check your spam folder.' : '📧 Controlla anche la cartella spam.'}
              </p>
              <button onClick={() => { setShowSignup(false); setSignupDone(false); }} style={{ ...loginBtnStyle, ...font }}>
                {isEn ? 'Go to login' : 'Vai al login'} <LogIn size={20} style={{ marginLeft: '8px' }} />
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => setShowSignup(false)} style={backBtnStyle(font)}>
                <ArrowLeft size={16} /> {isEn ? 'Back to login' : 'Torna al login'}
              </button>
              <h2 style={{ ...font, fontWeight: '800', color: '#1E293B', fontSize: '24px', margin: '4px 0 4px', alignSelf: 'flex-start' }}>
                {isEn ? 'Create your account' : 'Crea il tuo account'}
              </h2>
              <p style={{ ...font, color: '#94A3B8', fontSize: '13px', margin: '0 0 18px', alignSelf: 'flex-start', lineHeight: 1.5 }}>
                {isEn ? 'Free during the beta. No card required.' : 'Gratis durante la beta. Nessuna carta richiesta.'}
              </p>

              <form onSubmit={handleSignup} style={{ width: '100%' }}>
                {/* Nome + Cognome */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ ...inputGroupStyle, flex: 1, marginBottom: 0, padding: '12px 14px' }}>
                    <User size={16} color="#94A3B8" />
                    <input type="text" placeholder={isEn ? 'First name' : 'Nome'} value={nome}
                      onChange={e => setNome(e.target.value)} style={{ ...inputStyle, ...font, fontSize: '15px' }} required autoFocus />
                  </div>
                  <div style={{ ...inputGroupStyle, flex: 1, marginBottom: 0, padding: '12px 14px' }}>
                    <User size={16} color="#94A3B8" />
                    <input type="text" placeholder={isEn ? 'Last name' : 'Cognome'} value={cognome}
                      onChange={e => setCognome(e.target.value)} style={{ ...inputStyle, ...font, fontSize: '15px' }} required />
                  </div>
                </div>

                {/* Email */}
                <div style={inputGroupStyle}>
                  <Mail size={20} color="#94A3B8" />
                  <input type="email" placeholder={isEn ? 'Your email' : 'La tua email'} value={email}
                    onChange={e => setEmail(e.target.value)} style={{ ...inputStyle, ...font }} required />
                </div>

                {/* Password */}
                <div style={inputGroupStyle}>
                  <Lock size={20} color="#94A3B8" />
                  <input type={showPwd ? 'text' : 'password'}
                    placeholder={isEn ? 'Choose a password' : 'Scegli una password'} value={password}
                    onChange={e => setPassword(e.target.value)} style={{ ...inputStyle, ...font }} required minLength={6} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={eyeBtnStyle}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Conferma password */}
                <div style={inputGroupStyle}>
                  <Lock size={20} color="#94A3B8" />
                  <input type={showConfirmPwd ? 'text' : 'password'}
                    placeholder={isEn ? 'Confirm password' : 'Conferma password'} value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)} style={{ ...inputStyle, ...font }} required minLength={6} />
                  <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} style={eyeBtnStyle}>
                    {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <p style={{ ...font, fontSize: '12px', color: '#94A3B8', margin: '-4px 0 16px', lineHeight: 1.5 }}>
                  {isEn ? 'Min. 6 characters. Your data is safe with us.' : 'Min. 6 caratteri. I tuoi dati sono al sicuro.'}
                </p>

                <button type="submit" disabled={loading} style={{ ...loginBtnStyle, ...font }}>
                  {loading ? (isEn ? 'Creating...' : 'Creazione...') : (isEn ? 'Create free account' : 'Crea account gratuito')}
                  {!loading && <UserPlus size={20} style={{ marginLeft: '10px' }} />}
                </button>
              </form>
            </>
          )}
          <VersionBadge font={font} />
        </div>
      </div>
    );
  }

  // ── LOGIN PRINCIPALE ──────────────────────────────────────────────────────
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <img src={logo} alt="Logo" style={{ height: '50px', marginBottom: '8px' }} />
        <h2 style={{ ...font, fontWeight: '800', color: '#1E293B', fontSize: '28px', margin: '12px 0 4px' }}>
          {t('login_welcome')}
        </h2>
        <p style={{ ...font, color: '#94A3B8', fontSize: '15px', margin: '0 0 28px', fontWeight: '600' }}>
          {t('login_subtitle')}
        </p>

        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <div style={inputGroupStyle}>
            <Mail size={20} color="#94A3B8" />
            <input type="email" placeholder={t('login_email')} value={email}
              onChange={e => setEmail(e.target.value)} style={{ ...inputStyle, ...font }} required />
          </div>

          <div style={inputGroupStyle}>
            <Lock size={20} color="#94A3B8" />
            <input type={showLoginPwd ? 'text' : 'password'}
              placeholder={t('login_password')} value={password}
              onChange={e => setPassword(e.target.value)} style={{ ...inputStyle, ...font }} required />
            <button type="button" onClick={() => setShowLoginPwd(!showLoginPwd)} style={eyeBtnStyle}>
              {showLoginPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div style={rimaniStyle} onClick={() => setRimaniConnesso(!rimaniConnesso)}>
            <div style={{ ...checkboxStyle, backgroundColor: rimaniConnesso ? '#5D5C9E' : 'transparent', borderColor: rimaniConnesso ? '#5D5C9E' : '#E2E8F0' }}>
              {rimaniConnesso && <div style={checkInnerStyle} />}
            </div>
            <span style={{ ...font, fontSize: '15px', color: '#64748B', fontWeight: '700' }}>
              {t('login_stayConnected')}
            </span>
          </div>

          <button type="submit" disabled={loading} style={{ ...loginBtnStyle, ...font }}>
            {loading ? t('login_loading') : t('login_button')}
            {!loading && <LogIn size={20} style={{ marginLeft: '10px' }} />}
          </button>
        </form>

        <button onClick={() => setShowReset(true)} style={{ ...forgotBtnStyle, ...font }}>
          <KeyRound size={15} /> {t('login_forgot')}
        </button>

        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0 4px' }}>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          <span style={{ ...font, fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>
            {isEn ? 'or' : 'oppure'}
          </span>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
        </div>

        <div style={{ width: '100%', background: '#F8F9FF', borderRadius: '18px', padding: '16px', border: '1.5px solid #EEEEF8', marginTop: '8px', textAlign: 'center' }}>
          <p style={{ ...font, fontSize: '14px', color: '#64748B', margin: '0 0 10px', fontWeight: '600' }}>
            {isEn ? "Don't have an account yet?" : 'Non hai ancora un account?'}
          </p>
          <button onClick={() => setShowSignup(true)}
            style={{ ...font, width: '100%', padding: '13px', borderRadius: '14px', background: 'transparent', border: '2px solid #5D5C9E', color: '#5D5C9E', fontSize: '16px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <UserPlus size={18} />
            {isEn ? 'Start free — no card needed' : 'Inizia gratis — è gratuito'}
          </button>
        </div>

        <VersionBadge font={font} />
      </div>
    </div>
  );
}

function VersionBadge({ font }) {
  return (
    <div style={{ marginTop: '20px', fontSize: '11px', color: '#CBD5E1', fontWeight: '600', letterSpacing: '0.5px', ...font }}>
      KIPRI v1.1.0
    </div>
  );
}

const backBtnStyle = (font) => ({
  alignSelf: 'flex-start', background: 'none', border: 'none', color: '#94A3B8',
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
  ...font, fontSize: '14px', marginBottom: '16px', padding: 0,
});

const eyeBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
  display: 'flex', alignItems: 'center', color: '#94A3B8', flexShrink: 0,
};

const containerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#F0F2F5', padding: '20px' };
const cardStyle = { background: 'white', padding: '36px 28px', borderRadius: '32px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.07)' };
const inputGroupStyle = { display: 'flex', alignItems: 'center', gap: '14px', background: '#F8FAFC', padding: '14px 18px', borderRadius: '18px', marginBottom: '12px', border: '2px solid #E2E8F0', width: '100%', boxSizing: 'border-box' };
const inputStyle = { border: 'none', background: 'transparent', outline: 'none', fontSize: '16px', width: '100%', color: '#1E293B' };
const rimaniStyle = { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', cursor: 'pointer', userSelect: 'none' };
const checkboxStyle = { width: '22px', height: '22px', borderRadius: '7px', border: '2px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' };
const checkInnerStyle = { width: '11px', height: '11px', backgroundColor: 'white', borderRadius: '3px' };
const loginBtnStyle = { width: '100%', padding: '16px', borderRadius: '18px', background: 'linear-gradient(135deg, #5D5C9E 0%, #4a4980 100%)', color: 'white', border: 'none', fontSize: '18px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(93,92,158,0.3)' };
const forgotBtnStyle = { marginTop: '16px', background: 'none', border: 'none', color: '#94A3B8', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' };
