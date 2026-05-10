/**
 * formatOra — converte un orario HH:MM in base al formato scelto dall'utente
 * @param {string} ora — es. "14:30" o "14:30:00"
 * @param {string} formato — '24h' (default) o '12h'
 * @returns {string} — es. "14:30" oppure "2:30 PM"
 */
export function formatOra(ora, formato = '24h') {
  if (!ora) return '';
  const parts = ora.slice(0, 5).split(':');
  const hh = parseInt(parts[0], 10);
  const mm = parts[1] || '00';
  if (formato === '12h') {
    const period = hh >= 12 ? 'PM' : 'AM';
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${h12}:${mm} ${period}`;
  }
  return `${String(hh).padStart(2, '0')}:${mm}`;
}
