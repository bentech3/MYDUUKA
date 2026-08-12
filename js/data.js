/* ============================================================
   MYDUUKA — DATA STORE
   Supabase-backed with offline-first fallback
   ============================================================ */

const Store = (() => {
  let products = [];
  let customers = [];
  let suppliers = [];
  let expenses = [];
  let todaySales = [];
  let activityLog = [];
  let cart = [];

  const weeklySales = [];
  const monthlySales = [];
  const topProducts = [];
  const users = [];

  const SYNC_QUEUE_KEY = 'MYDUUKA_SYNC_QUEUE';
  function getSyncQueue() { try { return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]'); } catch { return []; } }
  function addToSyncQueue(action, payload) { const q = getSyncQueue(); q.push({ action, payload, timestamp: Date.now() }); localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(q)); }
  async function flushSyncQueue() { if (!window.Supabase) return; const q = getSyncQueue(); if (!q.length) return; for (const item of q) { try { await window.Supabase.from('sync_queue').insert({ action: item.action, payload: item.payload, shop_id: App.state.user?.shopId || null, created_at: new Date(item.timestamp).toISOString() }); } catch (e) { console.warn('Sync queue item failed:', e); } } localStorage.removeItem(SYNC_QUEUE_KEY); }

  const STORAGE_KEY = 'MYDUUKA_STORE_DATA';
  function saveToStorage() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ products, customers, suppliers, expenses, todaySales, activityLog })); } catch (e) { console.warn('LocalStorage save failed:', e); } }
  function loadFromStorage() { try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) { const data = JSON.parse(saved); if (data.products) products = data.products; if (data.customers) customers = data.customers; if (data.suppliers) suppliers = data.suppliers; if (data.expenses) expenses = data.expenses; if (data.todaySales) todaySales = data.todaySales; if (data.activityLog) activityLog = data.activityLog; return true; } } catch (e) { console.warn('LocalStorage load failed:', e); } return false; }

  async function syncToSupabase() { if (!window.Supabase) return; try { const shopId = App.state.user?.shopId; if (!shopId) return; for (const p of products) await window.Supabase.from('products').upsert({ ...p, shop_id: shopId }); for (const c of customers) await window.Supabase.from('customers').upsert({ ...c, shop_id: shopId }); for (const s of suppliers) await window.Supabase.from('suppliers').upsert({ ...s, shop_id: shopId }); for (const e of expenses) await window.Supabase.from('expenses').upsert({ ...e, shop_id: shopId }); for (const sale of todaySales) { const { data: existing } = await window.Supabase.from('sales').select('id').eq('receipt_no', sale.receiptNo).single(); const saleId = existing?.id || sale.id; await window.Supabase.from('sales').upsert({ id: saleId, shop_id: shopId, receipt_no: sale.receiptNo, time: sale.time, total: sale.total, payment: sale.payment, customer_name: sale.customer || null, attendant: sale.attendant }); if (sale.items) for (const item of sale.items) await window.Supabase.from('sale_items').upsert({ sale_id: saleId, shop_id: shopId, product: item.product, qty: item.qty, price: item.price, total: item.total }); } await flushSyncQueue(); } catch (err) { console.warn('Supabase sync failed:', err); } }
  async function loadFromSupabase() { if (!window.Supabase) return false; try { const shopId = App.state.user?.shopId; if (!shopId) return false; const { data: prods } = await window.Supabase.from('products').select('*').eq('shop_id', shopId); if (prods) { products = prods; } const { data: custs } = await window.Supabase.from('customers').select('*').eq('shop_id', shopId); if (custs) customers = custs; const { data: sups } = await window.Supabase.from('suppliers').select('*').eq('shop_id', shopId); if (sups) suppliers = sups; const { data: exps } = await window.Supabase.from('expenses').select('*').eq('shop_id', shopId).order('date', { ascending: false }); if (exps) expenses = exps.map(e => ({ ...e, date: new Date(e.date) })); const { data: sales } = await window.Supabase.from('sales').select('*').eq('shop_id', shopId).order('time', { ascending: false }); if (sales) { todaySales = sales.map(s => ({ ...s, time: new Date(s.time), items: [] })); for (const sale of todaySales) { const { data: items } = await window.Supabase.from('sale_items').select('*').eq('sale_id', sale.id); if (items) sale.items = items.map(i => ({ product: i.product, qty: i.qty, price: i.price, total: i.total })); } } if (products.length > 0) return true; return false; } catch (err) { console.warn('Supabase load failed:', err); } return false; }

  loadFromStorage();

  return {
    products, customers, suppliers, expenses, todaySales, activityLog,
    weeklySales, monthlySales, topProducts, users,
    saveToStorage, syncToSupabase, loadFromSupabase, addToSyncQueue,

    get cart() { return cart; },

    getToday() {
      const totalSales = todaySales.reduce((s, sale) => s + sale.total, 0);
      const cashSales = todaySales.filter(s => s.payment === 'Cash').reduce((s, t) => s + t.total, 0);
      const mmSales = todaySales.filter(s => s.payment === 'Mobile Money').reduce((s, t) => s + t.total, 0);
      const creditSales = todaySales.filter(s => s.payment === 'Credit').reduce((s, t) => s + t.total, 0);
      const totalExp = expenses.filter(e => Utils.formatDate(e.date) === Utils.formatDate(new Date())).reduce((s, e) => s + e.amount, 0);
      const estProfit = Math.round(totalSales * 0.228);
      return { totalSales, cashSales, mmSales, creditSales, expenses: totalExp, estProfit, transactions: todaySales.length, expectedCash: cashSales + 125000, itemsSold: todaySales.reduce((s, sl) => s + sl.items.reduce((a, i) => a + i.qty, 0), 0) };
    },

    getStockSummary() {
      const total = products.length; const outOfStock = products.filter(p => p.stock === 0).length; const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length; const inStock = total - outOfStock - lowStock; const totalValue = products.reduce((s, p) => s + (p.stock * p.sellingPrice), 0);
      return { total, outOfStock, lowStock, inStock, totalValue };
    },

    getCreditSummary() { const total = customers.reduce((s, c) => s + c.balance, 0); const owing = customers.filter(c => c.balance > 0).length; return { total, owing }; },

    addToCart(productId, qty = 1) { const product = products.find(p => p.id === productId); if (!product) return; const existing = cart.find(i => i.productId === productId); if (existing) existing.qty += qty; else cart.push({ productId, name: product.name, price: product.sellingPrice, qty, emoji: product.emoji }); },
    updateCartQty(productId, qty) { if (qty <= 0) cart = cart.filter(i => i.productId !== productId); else { const item = cart.find(i => i.productId === productId); if (item) item.qty = qty; } },
    removeFromCart(productId) { cart = cart.filter(i => i.productId !== productId); },
    clearCart() { cart = []; },
    getCartTotal() { return cart.reduce((s, i) => s + (i.price * i.qty), 0); },
    getCartCount() { return cart.reduce((s, i) => s + i.qty, 0); },

    completeSale(paymentMethod, customerId = null, amountReceived = null) {
      const total = this.getCartTotal();
      const receiptNo = 'RCP' + String(todaySales.length + 101).padStart(6, '0');
      const sale = { id: Utils.uid(), receiptNo, time: new Date(), items: [...cart.map(i => ({ product: i.name, qty: i.qty, price: i.price, total: i.price * i.qty }))], total, payment: paymentMethod, customer: customerId ? (customers.find(c => c.id === customerId)?.name || '') : null, attendant: App.state.user?.name || 'Owner' };
      cart.forEach(item => { const p = products.find(pr => pr.id === item.productId); if (p) { p.stock = Math.max(0, p.stock - item.qty); p.status = Utils.stockStatus(p.stock, p.minStock); } });
      if (paymentMethod === 'Credit' && customerId) { const cust = customers.find(c => c.id === customerId); if (cust) cust.balance += total; }
      todaySales.unshift(sale);
      activityLog.unshift({ id: Utils.uid(), user: App.state.user?.name || 'Owner', action: 'Recorded a sale', detail: Utils.formatCurrency(total), time: new Date(), type: 'sale' });
      this.clearCart(); saveToStorage(); addToSyncQueue('sale', sale);
      return sale;
    },

    addStock(productId, qty, unit, price, supplierId) { const product = products.find(p => p.id === productId); if (!product) return; const newQty = product.conversion === 1 ? qty : qty * product.conversion; product.stock += newQty; product.status = Utils.stockStatus(product.stock, product.minStock); activityLog.unshift({ id: Utils.uid(), user: App.state.user?.name || 'Owner', action: `Added ${qty} ${unit} of ${product.name}`, detail: `Stock: ${product.stock} ${product.sellingUnit}s`, time: new Date(), type: 'stock' }); saveToStorage(); addToSyncQueue('stock', { productId, qty, unit, price, supplierId }); },

    addExpense(category, amount, payment, description) { const exp = { id: Utils.uid(), category, amount, payment, description, date: new Date() }; expenses.unshift(exp); activityLog.unshift({ id: Utils.uid(), user: App.state.user?.name || 'Owner', action: 'Added expense', detail: `${Utils.formatCurrency(amount)} — ${category}`, time: new Date(), type: 'expense' }); saveToStorage(); addToSyncQueue('expense', exp); return exp; },

    deleteExpense(expenseId) { const idx = expenses.findIndex(e => e.id === expenseId); if (idx === -1) return; expenses.splice(idx, 1); saveToStorage(); addToSyncQueue('delete_expense', { id: expenseId }); },

    receiveCreditPayment(customerId, amount, method) { const cust = customers.find(c => c.id === customerId); if (!cust) return; cust.balance = Math.max(0, cust.balance - amount); cust.lastTx = new Date(); cust.transactions.push({ date: new Date(), type: 'payment', amount, description: method }); activityLog.unshift({ id: Utils.uid(), user: App.state.user?.name || 'Owner', action: 'Received payment', detail: `${cust.name} paid ${Utils.formatCurrency(amount)}`, time: new Date(), type: 'payment' }); saveToStorage(); addToSyncQueue('payment', { customerId, amount, method }); },

    addCustomer(name, phone, notes = '') { const cust = { id: Utils.uid(), name, phone, balance: 0, lastTx: new Date(), notes, transactions: [] }; customers.push(cust); saveToStorage(); addToSyncQueue('customer', cust); return cust; },

    updateCustomer(customerId, updates) { const idx = customers.findIndex(c => c.id === customerId); if (idx === -1) return null; customers[idx] = { ...customers[idx], ...updates }; saveToStorage(); addToSyncQueue('update_customer', { id: customerId, updates }); return customers[idx]; },

    deleteCustomer(customerId) { const idx = customers.findIndex(c => c.id === customerId); if (idx === -1) return; customers.splice(idx, 1); saveToStorage(); addToSyncQueue('delete_customer', { id: customerId }); },

    updateSupplier(supplierId, updates) { const idx = suppliers.findIndex(s => s.id === supplierId); if (idx === -1) return null; suppliers[idx] = { ...suppliers[idx], ...updates }; saveToStorage(); addToSyncQueue('update_supplier', { id: supplierId, updates }); return suppliers[idx]; },

    deleteSupplier(supplierId) { const idx = suppliers.findIndex(s => s.id === supplierId); if (idx === -1) return; suppliers.splice(idx, 1); saveToStorage(); addToSyncQueue('delete_supplier', { id: supplierId }); },

    addProduct(data) { const product = { id: Utils.uid(), ...data, status: Utils.stockStatus(data.stock || 0, data.minStock || 0) }; products.push(product); saveToStorage(); addToSyncQueue('product', product); return product; },

    updateProduct(productId, updates) { const idx = products.findIndex(p => p.id === productId); if (idx === -1) return null; products[idx] = { ...products[idx], ...updates, status: Utils.stockStatus(updates.stock !== undefined ? updates.stock : products[idx].stock, updates.minStock !== undefined ? updates.minStock : products[idx].minStock) }; saveToStorage(); addToSyncQueue('update_product', { id: productId, updates }); return products[idx]; },

    deleteProduct(productId) { const idx = products.findIndex(p => p.id === productId); if (idx === -1) return; products.splice(idx, 1); saveToStorage(); addToSyncQueue('delete_product', { id: productId }); },

    adjustStock(productId, newQty, reason) { const product = products.find(p => p.id === productId); if (!product) return; const prev = product.stock; product.stock = newQty; product.status = Utils.stockStatus(product.stock, product.minStock); activityLog.unshift({ id: Utils.uid(), user: App.state.user?.name || 'Owner', action: 'Adjusted stock', detail: `${product.name}: ${prev} → ${newQty} (${reason})`, time: new Date(), type: 'adjustment' }); saveToStorage(); addToSyncQueue('adjustment', { productId, newQty, reason }); },

    deleteSale(saleId) { const idx = todaySales.findIndex(s => s.id === saleId); if (idx === -1) return; const sale = todaySales[idx]; sale.items.forEach(item => { const p = products.find(pr => pr.name === item.product); if (p) { p.stock += item.qty; p.status = Utils.stockStatus(p.stock, p.minStock); } }); todaySales.splice(idx, 1); saveToStorage(); addToSyncQueue('delete_sale', { id: saleId }); },

    getAlerts() {
      const alerts = [];
      const lowProducts = products.filter(p => p.status === 'low' || p.status === 'out');
      if (lowProducts.length) alerts.push({ type: 'critical', icon: '📦', title: 'Low Stock', desc: `${lowProducts.length} products need restocking`, screen: 'stock' });
      const credit = this.getCreditSummary();
      if (credit.owing > 0) alerts.push({ type: 'warning', icon: '💳', title: 'Customers Owe You', desc: `${credit.owing} customers owe ${Utils.formatCurrency(credit.total)}`, screen: 'customers' });
      const slowProducts = products.filter(p => p.stock > p.minStock * 4);
      if (slowProducts.length) alerts.push({ type: 'caution', icon: '📉', title: 'Slow Moving Stock', desc: `${slowProducts.length} products may be overstocked`, screen: 'stock' });
      const today = this.getToday();
      if (today.totalSales > 150000) alerts.push({ type: 'good', icon: '📈', title: 'Strong Sales Today', desc: `Today's sales are ${Utils.formatCurrency(today.totalSales)} — great day!`, screen: 'reports' });
      return alerts;
    },

    getNotifications() {
      const notifs = [];
      const lowStock = products.filter(p => p.status === 'low' || p.status === 'out');
      if (lowStock.length) notifs.push({ id: 'low-stock', title: 'Low Stock Alert', body: `${lowStock.length} products need restocking`, time: new Date(), unread: true, type: 'warning' });
      const credit = this.getCreditSummary();
      if (credit.owing > 0) notifs.push({ id: 'credit', title: 'Customers Owe You', body: `${credit.owing} customers owe ${Utils.formatCurrency(credit.total)}`, time: new Date(), unread: true, type: 'warning' });
      if (!notifs.length) notifs.push({ id: 'ok', title: 'All Good!', body: 'No alerts at the moment.', time: new Date(), unread: false, type: 'success' });
      return notifs;
    },
  };
})();

window.Store = Store;
