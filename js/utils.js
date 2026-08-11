/* ============================================================
   MYDUUKA — UTILITY FUNCTIONS
   ============================================================ */

const Utils = {
  /** Format number as UGX currency */
  formatCurrency(amount) {
    if (amount === null || amount === undefined) return 'UGX 0';
    const num = Math.round(Number(amount));
    return 'UGX ' + num.toLocaleString('en-UG');
  },

  /** Format compact (e.g., 1.2M, 45K) */
  formatCompact(amount) {
    const num = Number(amount);
    if (num >= 1_000_000) return 'UGX ' + (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000)     return 'UGX ' + (num / 1_000).toFixed(0) + 'K';
    return 'UGX ' + num.toLocaleString();
  },

  /** Format date as "11 Aug 2026" */
  formatDate(date) {
    const d = date instanceof Date ? date : new Date(date);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  },

  /** Format date as "Mon, 11 Aug" */
  formatDateShort(date) {
    const d = date instanceof Date ? date : new Date(date);
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
  },

  /** Format time as "14:35" */
  formatTime(date) {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' });
  },

  /** Format time as "2:35 PM" */
  formatTime12(date) {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleTimeString('en-UG', { hour: 'numeric', minute: '2-digit', hour12: true });
  },

  /** Format time ago */
  timeAgo(date) {
    const d = date instanceof Date ? date : new Date(date);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)   return 'just now';
    if (mins < 60)  return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  },

  /** Get today's day greeting */
  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  },

  /** Get initials from a name */
  initials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  },

  /** Parse integer from string safely */
  parseInt(val) {
    const n = parseInt(val, 10);
    return isNaN(n) ? 0 : n;
  },

  /** Parse float from string safely */
  parseFloat(val) {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  },

  /** Generate a random receipt number */
  receiptNumber() {
    return 'RCP' + String(Math.floor(Math.random() * 900000) + 100000);
  },

  /** Debounce a function */
  debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  /** Get stock status */
  stockStatus(stock, minStock) {
    if (stock <= 0)          return 'out';
    if (stock <= minStock)   return 'low';
    if (stock <= minStock*2) return 'caution';
    return 'good';
  },

  /** Get stock badge HTML */
  stockBadge(status) {
    const map = {
      good:    ['badge-success', '🟢 In Stock'],
      caution: ['badge-warning', '🟡 Low'],
      low:     ['badge-danger',  '🔴 Low Stock'],
      out:     ['badge-danger',  '⛔ Out of Stock'],
    };
    const [cls, label] = map[status] || map.good;
    return `<span class="badge ${cls}">${label}</span>`;
  },

  /** Avatar color based on index */
  avatarColor(index) {
    const colors = [
      '#1A6B4A','#2563EB','#7C3AED','#DB2777','#EA580C',
      '#059669','#D97706','#DC2626','#0891B2','#65A30D',
    ];
    return colors[index % colors.length];
  },

  /** Escape HTML */
  escapeHtml(str) {
    return String(str)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  },

  /** Simple ID generator */
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  },

  /** Percentage change */
  pctChange(current, previous) {
    if (!previous) return 0;
    return Math.round(((current - previous) / previous) * 100);
  },

  /** Trend indicator HTML */
  trendBadge(pct) {
    if (pct > 0) return `<span class="trend-indicator trend-up">▲ ${pct}%</span>`;
    if (pct < 0) return `<span class="trend-indicator trend-down">▼ ${Math.abs(pct)}%</span>`;
    return `<span class="trend-indicator badge-neutral">— 0%</span>`;
  },

  /** Generate random id for demo */
  nextId(prefix = 'id') {
    return prefix + '_' + Math.random().toString(36).slice(2,8);
  }
};

// Make globally available
window.Utils = Utils;
