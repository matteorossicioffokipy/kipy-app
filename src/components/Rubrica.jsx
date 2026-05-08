import React from 'react';
import { Plus, Phone, Mail, Pencil, MessageCircle, UserPlus, Trash2, BookUser } from 'lucide-react';
import { useLang } from '../LanguageContext';

export default function Rubrica({
  clienti, setMostraModuloApp, setFormApp, setClienteInModifica,
  setFormCliente, setMostraModuloCliente, onEliminaCliente
}) {
  const { t } = useLang();

  const importaDaContatti = async () => {
    if (!('contacts' in navigator && 'ContactsManager' in window)) {
      alert('L\'importazione contatti è disponibile solo su Android con Chrome. Su iPhone inserisci il contatto manualmente.');
      return;
    }
    try {
      const contatti = await navigator.contacts.select(['name', 'tel', 'email'], { multiple: false });
      if (contatti && contatti.length > 0) {
        const c = contatti[0];
        setClienteInModifica(null);
        setFormCliente({
          nome: c.name?.[0] || '',
          tel: c.tel?.[0] || '',
          email: c.email?.[0] || '',
          note: '',
        });
        setMostraModuloCliente(true);
      }
    } catch (err) {
      console.error('Importazione annullata', err);
    }
  };

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>

      <div style={headerStyle}>
        <div>
          <h2 style={{ fontWeight: '800', color: '#1E293B', margin: 0, fontSize: '20px' }}>
            {t('rubrica_title')}
          </h2>
          <p style={{ margin: '2px 0 0', color: '#94A3B8', fontSize: '13px' }}>
            {clienti.length} {clienti.length === 1 ? t('rubrica_contact') : t('rubrica_contacts')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={importaDaContatti}
            style={{ ...addBtnStyle, background: '#F0F0FA', color: '#5D5C9E' }}
            title="Importa da contatti"
          >
            <BookUser size={18} />
          </button>
          <button
            onClick={() => {
              setClienteInModifica(null);
              setFormCliente({ nome: '', tel: '', email: '', note: '' });
              setMostraModuloCliente(true);
            }}
            style={addBtnStyle}
            title={t('rubrica_addClient')}
          >
            <UserPlus size={18} />
          </button>
        </div>
      </div>

      {clienti.length === 0 ? (
        <div style={emptyStateStyle}>
          <UserPlus size={32} style={{ color: '#CBD5E1', marginBottom: '10px' }} />
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '14px' }}>{t('rubrica_empty')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {clienti.map((cliente) => (
            <div key={cliente.id} style={cardStyle}>

              <h4 style={nomeStyle}>{cliente.nome}</h4>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {cliente.tel && (
                    <>
                      <a href={`tel:${cliente.tel}`} style={iconCircleStyle('#E0F2FE', '#0369A1')} title="Chiama">
                        <Phone size={14} />
                      </a>
                      <a href={`https://wa.me/${cliente.tel.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={iconCircleStyle('#DCFCE7', '#15803D')} title="WhatsApp">
                        <MessageCircle size={14} />
                      </a>
                    </>
                  )}
                  {cliente.email && (
                    <a href={`mailto:${cliente.email}`} style={iconCircleStyle('#F1F5F9', '#475569')} title="Email">
                      <Mail size={14} />
                    </a>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => {
                      setFormApp({ titolo: `${t('rubrica_newAppointment')}: ${cliente.nome}`, data: '', ora: '' });
                      setMostraModuloApp(true);
                    }}
                    style={actionBtnStyle('#DCFCE7', '#15803D')}
                    title={t('rubrica_newAppointment')}
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setClienteInModifica(cliente);
                      setFormCliente({ nome: cliente.nome, tel: cliente.tel || '', email: cliente.email || '', note: cliente.note || '' });
                      setMostraModuloCliente(true);
                    }}
                    style={actionBtnStyle('#EFF6FF', '#3B82F6')}
                    title={t('edit')}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(t('rubrica_deleteConfirm'))) {
                        onEliminaCliente?.(cliente.id);
                      }
                    }}
                    style={actionBtnStyle('#FEF2F2', '#EF4444')}
                    title={t('delete')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {cliente.note && (
                <p style={{ margin: '8px 0 0', color: '#94A3B8', fontSize: '12px', wordBreak: 'break-word' }}>
                  {cliente.note}
                </p>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' };
const cardStyle = { background: 'white', padding: '15px', borderRadius: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9', width: '100%', boxSizing: 'border-box' };
const nomeStyle = { margin: 0, fontWeight: '700', color: '#1E293B', fontSize: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const addBtnStyle = { background: '#5D5C9E', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const iconCircleStyle = (bg, color) => ({ background: bg, color: color, width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', flexShrink: 0 });
const actionBtnStyle = (bg, color = 'white') => ({ background: bg, color: color, border: 'none', width: '32px', height: '32px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0 });
const emptyStateStyle = { textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '18px', color: '#94A3B8', border: '2px dashed #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center' };