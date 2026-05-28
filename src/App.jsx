import React, { useState, useEffect } from 'react';
import { supabase } from "./supabaseClient";
import Rubrica from './components/Rubrica';
import Calendario from './components/Calendario';
import Dashboard from './components/Dashboard';
import TodoList from "./components/TodoList";
import Impostazioni from './components/Impostazioni';
import BusinessCard from './components/BusinessCard';
import Fatture from './components/Fatture';
import Finanze from './components/Finanze';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import { Home, LogOut, Settings } from 'lucide-react';
import { useLang } from './LanguageContext';
import './app.css';
import logo from './assets/logo.png';
import quokka from './assets/quokka.png';
import ModaleCliente from './components/ModaleCliente';
import ModaleAppuntamento from './components/ModaleAppuntamento';
import ProGate from './components/ProGate';
import Statistiche from './components/Statistiche';
import PagamentiQR from './components/PagamentiQR';

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
  const [loadingPro, setLoadingPro] = useState(false);

  const isPro = config?.is_pro === true;

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
      else alert('Errore nel creare la sessione di pagamento.');
    } catch (err) {
      alert('Errore di rete. Riprova.');
    }
    setLoadingPro(false);
  };

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
      .from('clienti').select('*').eq('user_id', user.id).order('nome');
    setClienti(clientiData || []);
    const { data: appData } = await supabase
      .from('appuntamenti').select('*').eq('user_id', user.id);
    setAppuntamenti(appData || []);
    await verificaIncassiAutomatici(appData);
  };

  const verificaIncassiAutomatici = async (appData) => {
    const oggi = new Date().toLocaleDateString('en-CA');
    const daIncassare = (appData || []).filter(a =>
      a.importo && !a.completato && a.data < oggi
    );
    for (const app of daIncassare) {
      const { error: errUpdate } = await supabase
        .from('appuntamenti').update({ completato: true }).eq('id', app.id).eq('completato', false);
      if (!errUpdate) {
        await supabase.from('movimenti').insert([{
          user_id: user.id,
          tipo: 'entrata',
          importo: parseFloat(app.importo),
          categoria: app.categoria || 'Appuntamento',
          descrizione: app.titolo,
          data: app.data,
        }]);
      }
    }
  };

  const handleElimina = async (id) => {
    const { error } = await supabase.from('clienti').delete().eq('id', id);
    if (!error) setClienti(prev => prev.filter(c => c.id !== id));
    else alert(t('error') + ': ' + error.message);
  };

  const handleSalvaCliente = async () => {
    if (!formCliente.nome.trim()) return alert(t('rubrica_name') + ' obbligatorio');

    // Gate: max 20 clienti per utenti free
    if (!isPro && !clienteInModifica && clienti.length >= 20) {
      alert(lang === 'it'
        ? 'Hai raggiunto il limite di 20 clienti del piano Free. Passa a Pro per clienti illimitati!'
        : 'You have reached the 20 client limit of the Free plan. Upgrade to Pro for unlimited clients!');
      return;
    }

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

  const confermaAppuntamento = async (app) => {
    if (!app.importo) return;
    const { error } = await supabase.from('movimenti').insert([{
      user_id: user.id,
      tipo: 'entrata',
      importo: parseFloat(app.importo),
      categoria: app.categoria || (lang === 'it' ? 'Appuntamento' : 'Appointment'),
      descrizione: app.titolo,
      data: app.data,
    }]);
    if (!error) {
      await supabase.from('appuntamenti').update({ completato: true }).eq('id', app.id);
      fetchDati();
      alert(lang === 'it' ? `✓ Incasso di €${app.importo} aggiunto alle Entrate!` : `✓ Income of £${app.importo} added to Finances!`);
    }
  };

  const handleSalvaAppuntamento = async (dateExtra = []) => {
    if (!formApp.titolo.trim() || !formApp.data || !formApp.ora)
      return alert(t('appt_fillAll'));
    const { error } = await supabase
      .from('appuntamenti')
      .insert([{ ...formApp, user_id: user.id }]);
    // Inserisce appuntamenti extra se presenti
    if (dateExtra.length > 0) {
      const extra = dateExtra.filter(d => d.data && d.ora).map(d => ({ ...formApp, data: d.data, data_fine: d.data, ora: d.ora, ora_fine: d.ora_fine || null, user_id: user.id }));
      if (extra.length > 0) await supabase.from('appuntamenti').insert(extra);
    }
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
    <div className="app-wrapper" style={{ fontFamily: "'Baloo 2', sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={headerStyle}>
        <button
          onClick={async () => {
            if (!window.confirm(t('logout') + '?')) return;
            await supabase.auth.signOut();
            setUser(null);
            setVista('DASHBOARD');
          }}
          style={logoutBtnStyle}
          title={t('logout')}
        >
          <LogOut size={18} color="#94A3B8" />
        </button>

        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="Kipri" style={{ height: '30px', width: 'auto' }}
            onError={e => { e.target.style.display = 'none'; }} />
        </div>

        <div style={langSwitcherStyle}>
          <button onClick={() => switchLang('it')} style={langBtnStyle(lang === 'it')}>🇮🇹</button>
          <button onClick={() => switchLang('en')} style={langBtnStyle(lang === 'en')}>🇬🇧</button>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px 20px 40px' }}>

        {/* ── CARD HERO ── */}
        {vista === 'DASHBOARD' && (
          <div
            style={{ ...heroCardStyle, cursor: 'pointer' }}
            onClick={() => setVista('IMPOSTAZIONI')}
            title="Apri Impostazioni"
          >
            <img src={quokka} alt=""
              style={{ position: 'absolute', bottom: '-8px', right: '12px', height: '90px', width: 'auto', zIndex: 2, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(112,193,142,0.15)', zIndex: 0 }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1, position: 'relative' }}>
              {config.logo_url ? (
                <img src={config.logo_url} alt="Logo" style={{ height: '44px', width: '44px', borderRadius: '12px', objectFit: 'contain', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)', padding: '5px', flexShrink: 0 }} />
              ) : (
                <div style={{ height: '44px', width: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '800', fontSize: '18px', color: 'white', lineHeight: 1.2, fontFamily: "'Baloo 2', sans-serif" }}>
                  {config.nome_azienda || 'La tua Azienda'}
                </div>
                {config.settore && (
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px', fontWeight: '500' }}>{config.settore}</div>
                )}
              </div>
              <div style={{ opacity: 0.5 }}><Settings size={16} color="white" /></div>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.12)', margin: '16px 0', position: 'relative', zIndex: 1 }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: 'white', lineHeight: 1.1, fontFamily: "'Baloo 2', sans-serif" }}>
                {t('dashboard_hello')} 👋
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '4px', fontWeight: '500' }}>
                {new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            </div>
          </div>
        )}

        {/* ── HOME BUTTON ── */}
        {vista !== 'DASHBOARD' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => setVista('DASHBOARD')} style={homeBtnStyle}>
              <Home size={18} color="#5D5C9E" />
              <span style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '13px', fontWeight: '700', color: '#5D5C9E' }}>Home</span>
            </button>
          </div>
        )}

        {/* ── VISTE ── */}
        {vista === 'DASHBOARD' && <Dashboard setView={setVista} config={config} appuntamenti={appuntamenti} supabase={supabase} user={user} />}

        {vista === 'RUBRICA' && (
          <Rubrica
            clienti={clienti}
            setMostraModuloApp={setMostraModuloApp}
            setFormApp={setFormApp}
            setClienteInModifica={setClienteInModifica}
            setFormCliente={setFormCliente}
            setMostraModuloCliente={setMostraModuloCliente}
            onEliminaCliente={handleElimina}
            isPro={isPro}
            onUpgradePro={handleUpgradePro}
            loadingPro={loadingPro}
          />
        )}

        {vista === 'CALENDARIO' && (
          <Calendario appuntamenti={appuntamenti} setMostraModuloApp={setMostraModuloApp} mostraModuloApp={mostraModuloApp}
            supabase={supabase} fetchDati={fetchDati} config={config} clienti={clienti} onConferma={confermaAppuntamento} />
        )}

        {vista === 'TODO' && <TodoList supabase={supabase} user={user} />}

        {vista === 'BUSINESS_CARD' && <BusinessCard config={config} user={user} supabase={supabase} fetchDati={fetchDati} isPro={isPro} />}

        {vista === 'FATTURE' && (
          isPro
            ? <Fatture supabase={supabase} user={user} clienti={clienti} config={config} />
            : <ProGate onUpgrade={handleUpgradePro} loading={loadingPro} />
        )}

        {vista === 'FINANZE' && (
          isPro
            ? <Finanze supabase={supabase} user={user} isPro={isPro} />
            : <ProGate onUpgrade={handleUpgradePro} loading={loadingPro} />
        )}

        {vista === 'PAGAMENTI_QR' && (
          isPro
            ? <PagamentiQR config={config} supabase={supabase} user={user} />
            : <ProGate onUpgrade={handleUpgradePro} loading={loadingPro} />
        )}

        {vista === 'STATISTICHE' && (
          isPro
            ? <Statistiche supabase={supabase} user={user} clienti={clienti} appuntamenti={appuntamenti} />
            : <ProGate onUpgrade={handleUpgradePro} loading={loadingPro} />
        )}

        {vista === 'IMPOSTAZIONI' && (
          <Impostazioni config={config} setConfig={setConfig} supabase={supabase} user={user} fetchDati={fetchDati} isPro={isPro} />
        )}

      </div>

      {/* MODALE CLIENTE */}
      {mostraModuloCliente && (
        <ModaleCliente
          clienteInModifica={clienteInModifica}
          formCliente={formCliente}
          setFormCliente={setFormCliente}
          onSalva={handleSalvaCliente}
          onAnnulla={() => { setMostraModuloCliente(false); setClienteInModifica(null); }}
        />
      )}

      {/* MODALE APPUNTAMENTO */}
      {mostraModuloApp && (
        <ModaleAppuntamento
          formApp={formApp}
          setFormApp={setFormApp}
          onSalva={handleSalvaAppuntamento}
          onAnnulla={() => { setMostraModuloApp(false); setFormApp({ titolo: '', data: '', ora: '' }); }}
        />
      )}

    </div>
  );
}

const headerStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0 16px', height: '60px', background: 'white',
  boxShadow: '0 1px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 50,
};
const logoutBtnStyle = {
  background: '#FEF2F2', border: '1.5px solid #FECACA',
  borderRadius: '12px', padding: '8px 10px',
  cursor: 'pointer', display: 'flex', alignItems: 'center',
  justifyContent: 'center', gap: '6px', touchAction: 'manipulation',
};
const homeBtnStyle = {
  background: 'white', border: 'none', borderRadius: '14px',
  padding: '10px 16px', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)', touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',
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
