import React, { useState } from 'react';
import { Lock, Save } from 'lucide-react';
import { useLang } from '../LanguageContext';

export default function ResetPassword({ supabase, setIsResettingPassword, logo }) {
  const { t } = useLang();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      alert(t('error') + ': ' + error.message);
    } else {
      alert(t('reset_success'));
      setIsResettingPassword(false);
      await supabase.auth.signOut();
    }
    setLoading(false);
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <img src={logo} alt="Logo" style={{ height: '60px', marginBottom: '20px' }} />
        <h2 style={{ fontWeight: '800', color: '#1E293B', marginBottom: '10px', fontSize: '26px', fontFamily: "'Baloo 2', sans-serif" }}>
          {t('reset_title')}
        </h2>
        <p style={{ color: '#94A3B8', marginBottom: '30px', fontSize: '16px', textAlign: 'center', fontFamily: "'Baloo 2', sans-serif" }}>
          {t('reset_subtitle')}
        </p>
        <form onSubmit={handleUpdatePassword} style={{ width: '100%' }}>
          <div style={inputGroupStyle}>
            <Lock size={20} color="#94A3B8" />
            <input
              type="password"
              placeholder={t('reset_placeholder')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          <button type="submit" disabled={loading} style={btnStyle}>
            <span style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              {loading ? t('reset_loading') : t('reset_button')}
            </span>
            {!loading && <Save size={22} style={{ marginLeft: '10px' }} />}
          </button>
        </form>
      </div>
    </div>
  );
}

const containerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#F0F2F5', padding: '20px' };
const cardStyle = { background: 'white', padding: '40px 30px', borderRadius: '35px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.05)' };
const inputGroupStyle = { display: 'flex', alignItems: 'center', gap: '15px', background: '#F8FAFC', padding: '16px 20px', borderRadius: '20px', marginBottom: '20px', border: '1px solid #E2E8F0' };
const inputStyle = { border: 'none', background: 'transparent', outline: 'none', fontSize: '17px', width: '100%', color: '#1E293B', fontFamily: "'Baloo 2', sans-serif", fontWeight: '500' };
const btnStyle = { width: '100%', padding: '18px', borderRadius: '22px', background: '#5D5C9E', color: 'white', border: 'none', fontWeight: '700', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };