import React, { useState } from 'react';
import { Save, Upload, Check, MessageCircle, Building2, Image } from 'lucide-react';
import { useLang } from '../LanguageContext';

export default function Impostazioni({ config, setConfig, supabase, user, fetchDati }) {
  const { t, lang, switchLang } = useLang();
  const [loading, setLoading] = useState(false);
  const [salvato, setSalvato] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.from('impostazioni').update({
      nome_azienda: config.nome_azienda,
      settore: config.settore,
      promemoria_attivo: config.promemoria_attivo ?? true,
      promemoria_anticipo: config.promemoria_anticipo ?? '24',
      promemoria_testo: config.promemoria_testo ?? '',
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
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `logos/${fileName}`;
    await supabase.storage.from('azienda-assets').upload(filePath, file);
    const { data: { publicUrl } } = supabase.storage.from('azienda-assets').getPublicUrl(filePath);
    await supabase.from('impostazioni').update({ logo_url: publicUrl }).eq('user_id', user.id);
    fetchDati();
  };

  const testoDefault = `Ciao! 👋\nTi ricordiamo il tuo appuntamento con ${config.nome_azienda || 'noi'} {data} alle {ora}.\nA presto!`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Baloo 2', sans-serif" }}>
      <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1E293B', margin: 0 }}>
        {t('impostazioni_title')}
      </h2>

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
          {config.logo_url && <img src={config.logo_url} alt="Logo" style={{ height: '50px', borderRadius: '10px' }} />}
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
            <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px' }}>
              {t('impostazioni_placeholders')}
            </div>
            <textarea
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
              value={config.promemoria_testo || testoDefault}
              onChange={(e) => setConfig({ ...config, promemoria_testo: e.target.value })}
              placeholder={testoDefault}
            />

            <div style={previewStyle}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#128C7E', marginBottom: '8px' }}>
                {t('impostazioni_preview')}
              </div>
              <div style={bubbleStyle}>
                {(config.promemoria_testo || testoDefault)
                  .replace('{nome}', 'Mario')
                  .replace('{data}', 'domani')
                  .replace('{ora}', '10:30')}
              </div>
            </div>
          </>
        )}
      </div>

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
const previewStyle = { background: '#f0faf4', borderRadius: '14px', padding: '14px', marginTop: '8px' };
const bubbleStyle = { background: '#DCF8C6', borderRadius: '12px', borderBottomLeftRadius: '4px', padding: '10px 14px', fontSize: '13px', color: '#1E293B', lineHeight: '1.5', whiteSpace: 'pre-line' };
const saveBtnStyle = { border: 'none', padding: '16px', borderRadius: '16px', color: 'white', fontWeight: '800', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.3s', fontFamily: "'Baloo 2', sans-serif" };
const langChipStyle = (active) => ({ padding: '10px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', border: 'none', background: active ? '#5D5C9E' : '#F1F5F9', color: active ? 'white' : '#64748B', fontFamily: "'Baloo 2', sans-serif", transition: 'all 0.15s' });