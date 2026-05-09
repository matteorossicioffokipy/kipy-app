import React, { useEffect, useState } from 'react';
import { CheckCircle, Circle, Trash2, Plus, ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react';
import { useLang } from '../LanguageContext';

export default function TodoList({ supabase, user }) {
  const { t, lang } = useLang();
  const [todos, setTodos] = useState([]);
  const [nuovoImpegno, setNuovoImpegno] = useState('');
  const [nuovoOrario, setNuovoOrario] = useState('');

  const oggi = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };

  const [dataSelezionata, setDataSelezionata] = useState(oggi());

  const fetchDatiGiornata = async () => {
    const { data: todosData } = await supabase
      .from('todo').select('*')
      .eq('user_id', user.id)
      .eq('data_scadenza', dataSelezionata);
    const { data: appuntamentiData } = await supabase
      .from('appuntamenti').select('*')
      .eq('user_id', user.id)
      .eq('data', dataSelezionata);
    const appuntamentiComeTodo = (appuntamentiData || []).map(app => ({
      id: app.id, testo: app.titolo, orario: app.ora,
      completato: app.completato || false, isAppuntamento: true
    }));
    const listaCompleta = [...appuntamentiComeTodo, ...(todosData || [])].sort((a, b) =>
      (a.orario || '99:99').localeCompare(b.orario || '99:99')
    );
    setTodos(listaCompleta);
  };

  useEffect(() => { fetchDatiGiornata(); }, [dataSelezionata, user.id]);

  const aggiungiTask = async () => {
    if (!nuovoImpegno.trim()) return;
    const { error } = await supabase.from('todo').insert([{
      testo: nuovoImpegno, orario: nuovoOrario || null,
      user_id: user.id, completato: false, data_scadenza: dataSelezionata
    }]);
    if (!error) { setNuovoImpegno(''); setNuovoOrario(''); fetchDatiGiornata(); }
  };

  const cambiaGiorno = (offset) => {
    const pezzi = dataSelezionata.split('-');
    const d = new Date(pezzi[0], pezzi[1] - 1, pezzi[2]);
    d.setDate(d.getDate() + offset);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setDataSelezionata(`${y}-${m}-${dd}`);
  };

  const toggleCompletato = async (item) => {
    const tabella = item.isAppuntamento ? 'appuntamenti' : 'todo';
    const { error } = await supabase.from(tabella).update({ completato: !item.completato }).eq('id', item.id);
    if (!error) fetchDatiGiornata();
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', fontFamily: "'Baloo 2', sans-serif" }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <ChevronLeft onClick={() => cambiaGiorno(-1)} style={{ cursor: 'pointer', color: '#5D5C9E' }} size={24} />
        <h2 style={{ fontWeight: '800', margin: 0, fontSize: '18px', color: '#1E293B', textTransform: 'lowercase' }}>
          {(() => {
            const pezzi = dataSelezionata.split('-');
            return new Date(pezzi[0], pezzi[1] - 1, pezzi[2])
              .toLocaleDateString(lang === 'en' ? 'en-GB' : 'it-IT', {
                weekday: 'long', day: 'numeric', month: 'long'
              });
          })()}
        </h2>
        <ChevronRight onClick={() => cambiaGiorno(1)} style={{ cursor: 'pointer', color: '#5D5C9E' }} size={24} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px', background: 'white', padding: '20px', borderRadius: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <input
          type="text"
          placeholder={t('todo_placeholder')}
          value={nuovoImpegno}
          onChange={(e) => setNuovoImpegno(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && aggiungiTask()}
          style={{ border: 'none', outline: 'none', fontSize: '18px', fontWeight: '800', fontFamily: "'Baloo 2', sans-serif", width: '100%', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8' }}>
            <Clock size={18} />
            <input type="time" value={nuovoOrario} onChange={(e) => setNuovoOrario(e.target.value)}
              style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '4px 8px', outline: 'none', color: '#64748B', background: 'white', fontFamily: "'Baloo 2', sans-serif", fontSize: '14px' }} />
          </div>
          <button onClick={aggiungiTask} style={{ background: '#88C999', color: 'white', border: 'none', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {todos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px', color: '#CBD5E1', background: 'white', borderRadius: '22px', border: '2px dashed #F1F5F9', fontSize: '13px' }}>
            {t('todo_noTasks')}
          </div>
        )}
        {todos.map((todo) => (
          <div key={todo.id} style={todoCardStyle(todo.isAppuntamento)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
              <div onClick={() => toggleCompletato(todo)} style={{ cursor: 'pointer', flexShrink: 0 }}>
                {todo.completato ? <CheckCircle color="#88C999" size={26} /> : <Circle color="#CBD5E1" size={26} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ textDecoration: todo.completato ? 'line-through' : 'none', color: todo.completato ? '#94A3B8' : '#1E293B', fontWeight: '800', fontSize: '16px' }}>
                  {todo.testo}
                </span>
                {todo.orario && (
                  <span style={{ fontSize: '13px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                    <Clock size={14} /> {todo.orario.substring(0, 5)}
                  </span>
                )}
              </div>
            </div>
            {!todo.isAppuntamento && (
              <Trash2 size={20} color="#FFB3B3"
                onClick={async () => { await supabase.from('todo').delete().eq('id', todo.id); fetchDatiGiornata(); }}
                style={{ cursor: 'pointer', flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const todoCardStyle = (isApp) => ({
  background: 'white', padding: '20px', borderRadius: '25px',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
  borderLeft: isApp ? '6px solid #88C999' : '1px solid #F1F5F9'
});