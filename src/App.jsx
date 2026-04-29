import React, { useState, useEffect } from 'react';
import { supabase } from "./supabaseClient";
import Rubrica from './components/Rubrica';
import Calendario from './components/Calendario';
import Dashboard from './components/Dashboard';
import TodoList from './components/TodoList';
import Impostazioni from './components/Impostazioni';
import BusinessCard from './components/BusinessCard';
import Fatture from './components/Fatture';
import Finanze from './components/Finanze';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import { Home, LogOut } from 'lucide-react';
import { useLang } from './LanguageContext';
import logo from './assets/logo.png';
import quokka from './assets/quokka.png';

export default function App() {
  const { lang, switchLang, t } = useLang();
  const [user, setUser] = useState(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [config, setConfig] = useState({});
  const [clienti, setClienti] = useState([]);
  const [appuntamenti, setAppuntamenti] = useState([]);
  const [vista, setVista] = useState('DASHBOARD');
  const [mostraModuloCliente, setMostraModuloCliente] = useState(false);
  const [mostraModuloApp, setMostraModuloApp] = useState(false);
  const [clienteInModifica, setClienteInModifica] = useState(null);
  const [formCliente, setFormCliente] = useState({ nome: '', tel: '', email: '', note: '' });
  const [formApp, setFormApp] = useState({ titolo: '', data: '', ora: '' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (_event === 'PASSWORD_RECOVERY') setIsResettingPassword(true);
    });
  }, []);

  useEffect(() => {
    if (user) fetchDati();
  }, [user]);

  const fetchDati = async () => {
    const { data: configData } = await supabase
      .from('impostazioni').select('*').eq('user_id', user.id).single();
    setConfig(configData || {});
    const { data: clientiData } = await supabase
      .from('clienti').select('*')
      .eq('user_id', user.id).order('nome');
    setClienti(clientiData || []);
    const { data: appData } = await supabase
      .from('appuntamenti').select('*').eq('user_id', user.id);
    setAppuntamenti(appData || []);
  };

  const handleElimina = async (id) => {
    const { error } = await supabase.from('clienti').delete().eq('id', id);
    if (!error) setClienti(prev => prev.filter(c => c.id !== id));
    else alert(t('error') + ': ' + error.message);
  };

  const handleSalvaCliente = async () => {
    if (!formCliente.nome.trim()) return alert(t('rubrica_name') + ' obbligatorio');
    const action = clienteInModifica
      ? supabase.from('clienti').update(formCliente).eq('id', clienteInModifica.id)
      : supabase.from('clienti').insert([{ ...formCliente, user_id: user.id }]);
    const { error } = await action;
    if (!error) {
      setMostraModuloCliente(false);
      setClienteInModifica(null);
      setFormCliente({ nome: '', tel: '', email: '', note: '' });
      fetchDati();
    } else {
      alert(t('error') + ': ' + error.message);
    }
  };

  const handleSalvaAppuntamento = async () => {
    if (!formApp.titolo.trim() || !formApp.data || !formApp.ora)
      return alert(t('appt_fillAll'));
    const { error } = await supabase
      .from('appuntamenti')
      .insert([{ ...formApp, user_id: user.id }]);
    if (!error) {
      setMostraModuloApp(false);
      setFormApp({ titolo: '', data: '', ora: '' });
      fetchDati();
    } else {
      alert(t('error') + ': ' + error.message);
    }
  };

  if (!user) return <Login supabase={supabase} logo={logo} />;
  if (isResettingPassword) return <ResetPassword supabase={supabase} setIsResettingPassword={setIsResettingPassword} logo={logo} />;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F1F5F9', fontFamily: "'Baloo 2', sans-serif" }}>

      {/* HEADER */}
      <div style={headerKipyStyle}>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            setUser(null);
            setVista('DASHBOARD');
          }}
          style={logoutBtnStyle}
          title={t('logout')}
        >
          <LogOut size={18} color="#94A3B8" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="Kipy" style={{ height: '30px', width: 'auto' }}
            onError={e => { e.target.style.display = 'none'; }} />
        </div>

        <div style={langSwitcherStyle}>
          <button onClick={() => switchLang('it')} style={langBtnStyle(lang === 'it')}>🇮🇹</button>
          <button onClick={() => switchLang('en')} style={langBtnStyle(lang === 'en')}>🇬🇧</button>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px 20px 40px' }}>

        {/* CARD HERO VIOLA — solo dashboard */}
        {vista === 'DASHBOARD' && (
          <div style={heroCardStyle}>
            {/* Quokka corner */}
            <img src={quokka} alt=""
              style={{
                position: 'absolute', bottom: '-8px', right: '12px',
                height: '90px', width: 'auto', zIndex: 2,
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
              }}
              onError={e => { e.target.style.display = 'none'; }}
            />
            {/* Cerchi decorativi sfondo */}
            <div style={{
              position: 'absolute', top: '-30px', right: '-30px',
              width: '120px', height: '120px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)', zIndex: 0,
            }} />
            <div style={{
              position: 'absolute', bottom: '-20px', left: '-20px',
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(112,193,142,0.15)', zIndex: 0,
            }} />

            {/* Logo + nome + settore */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1, position: 'relative' }}>
              {config.logo_url ? (
                <img src={config.logo_url} alt="Logo"
                  style={{
                    height: '44px', width: '44px', borderRadius: '12px',
                    objectFit: 'contain', background: 'rgba(255,255,255,0.15)',
                    border: '1.5px solid rgba(255,255,255,0.25)', padding: '5px', flexShrink: 0
                  }}
                />
              ) : (
                <div style={{
                  height: '44px', width: '44px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.15)',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', flexShrink: 0,
                }}>
                  🏢
                </div>
              )}
              <div>
                <div style={{ fontWeight: '800', fontSize: '18px', color: 'white', lineHeight: 1.2, fontFamily: "'Baloo 2', sans-serif" }}>
                  {config.nome_azienda || 'La tua Azienda'}
                </div>
                {config.settore && (
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px', fontWeight: '500' }}>
                    {config.settore}
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.12)', margin: '16px 0', position: 'relative', zIndex: 1 }} />

            {/* Ciao + data */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: 'white', lineHeight: 1.1, fontFamily: "'Baloo 2', sans-serif" }}>
                {t('dashboard_hello')} 👋
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '4px', fontWeight: '500' }}>
                {new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'it-IT', {
                  weekday: 'long', day: 'numeric', month: 'long'
                })}
              </div>
            </div>
          </div>
        )}

        {/* BOTTONE HOME */}
        {vista !== 'DASHBOARD' && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <button onClick={() => setVista('DASHBOARD')}
              style={{ background: 'white', border: 'none', borderRadius: '14px', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', touchAction: 'manipulation' }}>
              <Home size={20} color="#5D5C9E" />
            </button>
          </div>
        )}

        {/* VISTE */}
        {vista === 'DASHBOARD' && <Dashboard setView={setVista} config={config} appuntamenti={appuntamenti} />}
        {vista === 'RUBRICA' && (
          <Rubrica clienti={clienti} setMostraModuloApp={setMostraModuloApp} setFormApp={setFormApp}
            setClienteInModifica={setClienteInModifica} setFormCliente={setFormCliente}
            setMostraModuloCliente={setMostraModuloCliente} onEliminaCliente={handleElimina} />
        )}
        {vista === 'CALENDARIO' && (
          <Calendario appuntamenti={appuntamenti} setMostraModuloApp={setMostraModuloApp}
            supabase={supabase} fetchDati={fetchDati} config={config} clienti={clienti} />
        )}
        {vista === 'TODO' && <TodoList supabase={supabase} user={user} />}
        {vista === 'BUSINESS_CARD' && <BusinessCard config={config} user={user} supabase={supabase} fetchDati={fetchDati} />}
        {vista === 'FATTURE' && <Fatture supabase={supabase} user={user} clienti={clienti} config={config} />}
        {vista === 'FINANZE' && <Finanze supabase={supabase} user={user} />}
        {vista === 'IMPOSTAZIONI' && (
          <Impostazioni config={config} setConfig={setConfig} supabase={supabase} user={user} fetchDati={fetchDati} />
        )}

        {/* MODALE CLIENTE */}
        {mostraModuloCliente && (
          <div style={overlayStyle}>
            <div style={modalStyle}>
              <h3 style={{ marginTop: 0, fontFamily: "'Baloo 2', sans-serif", fontSize: '18px', fontWeight: '800', color: '#1E293B' }}>
                {clienteInModifica ? t('rubrica_editClient') : t('rubrica_newClient')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input style={inputStyle} placeholder={t('rubrica_name')} value={formCliente.nome}
                  onChange={e => setFormCliente({ ...formCliente, nome: e.target.value })} />
                <input style={inputStyle} placeholder={t('rubrica_phone')} value={formCliente.tel}
                  onChange={e => setFormCliente({ ...formCliente, tel: e.target.value })} />
                <input style={inputStyle} placeholder={t('rubrica_email')} value={formCliente.email}
                  onChange={e => setFormCliente({ ...formCliente, email: e.target.value })} />
                <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                  placeholder={t('rubrica_notes')} value={formCliente.note}
                  onChange={e => setFormCliente({ ...formCliente, note: e.target.value })} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => { setMostraModuloCliente(false); setClienteInModifica(null); }} style={cancelBtn}>
                    {t('cancel')}
                  </button>
                  <button onClick={handleSalvaCliente} style={saveBtn}>{t('save')}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODALE APPUNTAMENTO */}
        {mostraModuloApp && (
          <div style={overlayStyle}>
            <div style={modalStyle}>
              <h3 style={{ marginTop: 0, fontFamily: "'Baloo 2', sans-serif", fontSize: '18px', fontWeight: '800', color: '#1E293B' }}>
                {t('appt_title')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input style={inputStyle} placeholder={t('appt_titleField')} value={formApp.titolo}
                  onChange={e => setFormApp({ ...formApp, titolo: e.target.value })} />
                <input style={inputStyle} type="date" value={formApp.data}
                  onChange={e => setFormApp({ ...formApp, data: e.target.value })} />
                <input style={inputStyle} type="time" value={formApp.ora}
                  onChange={e => setFormApp({ ...formApp, ora: e.target.value })} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => { setMostraModuloApp(false); setFormApp({ titolo: '', data: '', ora: '' }); }} style={cancelBtn}>
                    {t('cancel')}
                  </button>
                  <button onClick={handleSalvaAppuntamento} style={saveBtn}>{t('save')}</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const headerKipyStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0 20px', height: '60px', background: 'white',
  boxShadow: '0 1px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 50,
};
const logoutBtnStyle = {
  background: '#F1F5F9', border: 'none', borderRadius: '12px', padding: '8px',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  touchAction: 'manipulation',
};
const heroCardStyle = {
  background: 'linear-gradient(135deg, #5D5C9E 0%, #4a4980 100%)',
  borderRadius: '24px', padding: '22px 20px 28px',
  marginBottom: '20px', position: 'relative', overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(93,92,158,0.35)',
};
const langSwitcherStyle = {
  display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '10px',
};
const langBtnStyle = (active) => ({
  border: 'none', background: active ? 'white' : 'transparent',
  borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', fontSize: '16px',
  boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s',
});
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
};
const modalStyle = {
  background: 'white', padding: '24px', borderRadius: '24px',
  width: '100%', maxWidth: '400px', boxSizing: 'border-box',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
};
const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: '12px',
  border: '1.5px solid #E2E8F0', boxSizing: 'border-box',
  fontFamily: "'Baloo 2', sans-serif", fontSize: '14px', color: '#1E293B', outline: 'none',
};
const saveBtn = {
  flex: 1, background: '#5D5C9E', color: 'white', border: 'none',
  padding: '12px', borderRadius: '12px', fontWeight: '800',
  cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '15px',
};
const cancelBtn = {
  flex: 1, background: '#F1F5F9', color: '#64748B', border: 'none',
  padding: '12px', borderRadius: '12px', fontWeight: '800',
  cursor: 'pointer', fontFamily: "'Baloo 2', sans-serif", fontSize: '15px',
};