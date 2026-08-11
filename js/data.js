/* ============================================================
   MYDUUKA — DATA STORE
   Supabase-backed with offline-first fallback
   ============================================================ */

const Store = (() => {
  const demoProducts = [
    { id: 'p1', name: 'Soda (Coca-Cola)', category: 'Drinks', emoji: '🥤', buyingUnit: 'Crate', sellingUnit: 'Bottle', conversion: 24, buyingPrice: 24000, sellingPrice: 1500, stock: 41, minStock: 12, status: 'good', brand: 'Coca-Cola', barcode: '501234567890' },
    { id: 'p2', name: 'Eggs', category: 'Food', emoji: '🥚', buyingUnit: 'Tray', sellingUnit: 'Egg', conversion: 30, buyingPrice: 12000, sellingPrice: 500, stock: 60, minStock: 15, status: 'good', brand: '', barcode: '' },
    { id: 'p3', name: 'Bread', category: 'Food', emoji: '🍞', buyingUnit: 'Loaf', sellingUnit: 'Loaf', conversion: 1, buyingPrice: 2800, sellingPrice: 3500, stock: 8, minStock: 5, status: 'caution', brand: 'Kampala Bakery', barcode: '' },
    { id: 'p4', name: 'Sugar', category: 'Groceries', emoji: '🍬', buyingUnit: 'Sack (50kg)', sellingUnit: 'Kg', conversion: 50, buyingPrice: 150000, sellingPrice: 4200, stock: 15, minStock: 5, status: 'good', brand: 'Kakira', barcode: '' },
    { id: 'p5', name: 'Cooking Oil', category: 'Cooking Ingredients', emoji: '🫙', buyingUnit: '5L Bottle', sellingUnit: '500ml', conversion: 10, buyingPrice: 22000, sellingPrice: 2500, stock: 12, minStock: 5, status: 'caution', brand: 'Rina', barcode: '' },
    { id: 'p6', name: 'Pens (Blue)', category: 'Stationery', emoji: '✏️', buyingUnit: 'Box', sellingUnit: 'Piece', conversion: 50, buyingPrice: 25000, sellingPrice: 700, stock: 43, minStock: 10, status: 'good', brand: 'Bic', barcode: '' },
    { id: 'p7', name: 'Exercise Books', category: 'School Supplies', emoji: '📓', buyingUnit: 'Bundle (10)', sellingUnit: 'Piece', conversion: 10, buyingPrice: 10000, sellingPrice: 1200, stock: 35, minStock: 10, status: 'good', brand: '', barcode: '' },
    { id: 'p8', name: 'Soap (Bar)', category: 'Personal Care', emoji: '🧼', buyingUnit: 'Carton (72)', sellingUnit: 'Bar', conversion: 72, buyingPrice: 144000, sellingPrice: 2500, stock: 4, minStock: 10, status: 'low', brand: 'Geisha', barcode: '' },
    { id: 'p9', name: 'Biscuits (Nice)', category: 'Snacks', emoji: '🍪', buyingUnit: 'Carton (12)', sellingUnit: 'Packet', conversion: 12, buyingPrice: 12000, sellingPrice: 1000, stock: 18, minStock: 6, status: 'good', brand: 'Britania', barcode: '' },
    { id: 'p10', name: 'Water (500ml)', category: 'Drinks', emoji: '💧', buyingUnit: 'Crate (24)', sellingUnit: 'Bottle', conversion: 24, buyingPrice: 18000, sellingPrice: 1000, stock: 24, minStock: 12, status: 'good', brand: 'Rwenzori', barcode: '' },
    { id: 'p11', name: 'Sweets', category: 'Snacks', emoji: '🍭', buyingUnit: 'Jar (100)', sellingUnit: 'Piece', conversion: 100, buyingPrice: 10000, sellingPrice: 200, stock: 45, minStock: 20, status: 'good', brand: 'Orbit', barcode: '' },
    { id: 'p12', name: 'Batteries (AA)', category: 'Electronics & Accessories', emoji: '🔋', buyingUnit: 'Box (20 packs)', sellingUnit: 'Pack of 2', conversion: 20, buyingPrice: 50000, sellingPrice: 3500, stock: 2, minStock: 5, status: 'low', brand: 'Eveready', barcode: '' },
    { id: 'p13', name: 'Maize Flour', category: 'Groceries', emoji: '🌽', buyingUnit: 'Sack (25kg)', sellingUnit: 'Kg', conversion: 25, buyingPrice: 45000, sellingPrice: 2200, stock: 20, minStock: 5, status: 'good', brand: 'Nile', barcode: '' },
    { id: 'p14', name: 'Milk (500ml)', category: 'Food', emoji: '🥛', buyingUnit: 'Crate (20)', sellingUnit: 'Packet', conversion: 20, buyingPrice: 30000, sellingPrice: 1800, stock: 0, minStock: 5, status: 'out', brand: 'Pearl', barcode: '' },
    { id: 'p15', name: 'Airtime (MTN)', category: 'Airtime/Data', emoji: '📱', buyingUnit: 'Bundle', sellingUnit: 'Unit', conversion: 1, buyingPrice: 5000, sellingPrice: 5000, stock: 999, minStock: 1, status: 'good', brand: 'MTN', barcode: '' },
  ];

  const demoCustomers = [
    { id: 'c1', name: 'John Okello', phone: '0761 214 808', balance: 15000, lastTx: new Date(Date.now() - 86400000*2), notes: 'Regular customer. Pays at end of month.', transactions: [
      { date: new Date(Date.now() - 86400000*5), type: 'credit', amount: 25000, description: 'Soda, Bread, Sugar' },
      { date: new Date(Date.now() - 86400000*3), type: 'payment', amount: 10000, description: 'Cash payment' },
    ]},
    { id: 'c2', name: 'Sarah Namuli', phone: '0794 979 060', balance: 8500, lastTx: new Date(Date.now() - 3600000), notes: 'Buys school supplies for her kids.', transactions: [
      { date: new Date(Date.now() - 86400000*2), type: 'credit', amount: 8500, description: 'Exercise books, Pens' },
    ]},
    { id: 'c3', name: 'Peter Ssekandi', phone: '0751 248 098', balance: 0, lastTx: new Date(Date.now() - 86400000*7), notes: '', transactions: [
      { date: new Date(Date.now() - 86400000*10), type: 'credit', amount: 12000, description: 'Groceries' },
      { date: new Date(Date.now() - 86400000*7), type: 'payment', amount: 12000, description: 'Mobile money' },
    ]},
    { id: 'c4', name: 'Grace Apio', phone: '0782 111 222', balance: 22000, lastTx: new Date(Date.now() - 86400000), notes: 'Neighbor. Buys household items.', transactions: [
      { date: new Date(Date.now() - 86400000*4), type: 'credit', amount: 15000, description: 'Cooking oil, soap, eggs' },
      { date: new Date(Date.now() - 86400000*1), type: 'credit', amount: 7000, description: 'Sugar, water' },
    ]},
    { id: 'c5', name: 'David Muwonge', phone: '0775 334 455', balance: 3500, lastTx: new Date(Date.now() - 86400000*3), notes: '', transactions: [
      { date: new Date(Date.now() - 86400000*3), type: 'credit', amount: 3500, description: 'Batteries, sweets' },
    ]},
  ];

  const demoSuppliers = [
    { id: 's1', name: 'Kampala Wholesale Ltd', phone: '0414 256 789', location: 'Owino Market, Kampala', contact: 'James Mutebi', products: ['Soda', 'Water', 'Biscuits', 'Sweets'], balance: 0, rating: 5, lastOrder: new Date(Date.now() - 86400000*3), purchases: [
      { id: 'pu1', date: new Date(Date.now() - 86400000*3), items: 'Soda (5 crates), Water (3 crates)', amount: 174000 },
      { id: 'pu2', date: new Date(Date.now() - 86400000*10), items: 'Soda (3 crates)', amount: 72000 },
    ]},
    { id: 's2', name: 'Nakawa Eggs Supply', phone: '0772 445 677', location: 'Nakawa Market, Kampala', contact: 'Susan Kyomugisha', products: ['Eggs'], balance: 0, rating: 4, lastOrder: new Date(Date.now() - 86400000*2), purchases: [
      { id: 'pu3', date: new Date(Date.now() - 86400000*2), items: 'Eggs (5 trays)', amount: 60000 },
    ]},
    { id: 's3', name: 'City Stationery Hub', phone: '0700 112 233', location: 'Kampala Road, Kampala', contact: 'Robert Onen', products: ['Pens', 'Exercise Books'], balance: 0, rating: 4, lastOrder: new Date(Date.now() - 86400000*7), purchases: [
      { id: 'pu4', date: new Date(Date.now() - 86400000*7), items: 'Pens (2 boxes), Exercise Books (3 bundles)', amount: 80000 },
    ]},
    { id: 's4', name: 'Mukwano Industries', phone: '0414 300 400', location: 'Industrial Area, Kampala', contact: 'Sales Team', products: ['Soap', 'Cooking Oil'], balance: 0, rating: 5, lastOrder: new Date(Date.now() - 86400000*5), purchases: [
      { id: 'pu5', date: new Date(Date.now() - 86400000*5), items: 'Soap (1 carton), Cooking Oil (4 bottles)', amount: 232000 },
    ]},
    { id: 's5', name: 'Kakira Sugar Works', phone: '0454 123 456', location: 'Kakira, Jinja', contact: 'Delivery Team', products: ['Sugar'], balance: 0, rating: 5, lastOrder: new Date(Date.now() - 86400000*14), purchases: [
      { id: 'pu6', date: new Date(Date.now() - 86400000*14), items: 'Sugar (2 sacks)', amount: 300000 },
    ]},
  ];

  const demoExpenses = [
    { id: 'e1', category: 'Electricity', amount: 8000, date: new Date(), payment: 'Cash', description: 'UMEME token' },
    { id: 'e2', category: 'Airtime', amount: 5000, date: new Date(Date.now() - 3600000*2), payment: 'Mobile Money', description: 'Shop phone top-up' },
    { id: 'e3', category: 'Transport', amount: 10000, date: new Date(Date.now() - 86400000), payment: 'Cash', description: 'Stock collection from Owino' },
    { id: 'e4', category: 'Packaging', amount: 3000, date: new Date(Date.now() - 86400000*2), payment: 'Cash', description: 'Plastic bags' },
    { id: 'e5', category: 'Wages', amount: 50000, date: new Date(Date.now() - 86400000*7), payment: 'Cash', description: 'Weekly wage for Sarah' },
    { id: 'e6', category: 'Rent', amount: 200000, date: new Date(Date.now() - 86400000*11), payment: 'Mobile Money', description: 'August rent' },
    { id: 'e7', category: 'Water', amount: 5000, date: new Date(Date.now() - 86400000*3), payment: 'Cash', description: 'Water delivery' },
    { id: 'e8', category: 'Internet', amount: 30000, date: new Date(Date.now() - 86400000*9), payment: 'Mobile Money', description: 'Monthly data bundle' },
  ];

  const now = new Date();
  const demoTodaySales = [
    { id: 'sl1', receiptNo: 'RCP000121', time: new Date(now.setHours(8,15,0,0)), items: [{ product: 'Bread', qty: 2, price: 3500, total: 7000 }, { product: 'Eggs', qty: 6, price: 500, total: 3000 }], total: 10000, payment: 'Cash', attendant: 'Sarah N.' },
    { id: 'sl2', receiptNo: 'RCP000122', time: new Date(now.setHours(9,32,0,0)), items: [{ product: 'Soda (Coca-Cola)', qty: 4, price: 1500, total: 6000 }], total: 6000, payment: 'Cash', attendant: 'Sarah N.' },
    { id: 'sl3', receiptNo: 'RCP000123', time: new Date(now.setHours(10,5,0,0)), items: [{ product: 'Sugar', qty: 2, price: 4200, total: 8400 }, { product: 'Cooking Oil', qty: 1, price: 2500, total: 2500 }, { product: 'Soap (Bar)', qty: 2, price: 2500, total: 5000 }], total: 15900, payment: 'Mobile Money', attendant: 'Benedict O.' },
    { id: 'sl4', receiptNo: 'RCP000124', time: new Date(now.setHours(11,45,0,0)), items: [{ product: 'Pens (Blue)', qty: 5, price: 700, total: 3500 }, { product: 'Exercise Books', qty: 3, price: 1200, total: 3600 }], total: 7100, payment: 'Cash', attendant: 'Sarah N.' },
    { id: 'sl5', receiptNo: 'RCP000125', time: new Date(now.setHours(12,20,0,0)), items: [{ product: 'Bread', qty: 1, price: 3500, total: 3500 }, { product: 'Water (500ml)', qty: 2, price: 1000, total: 2000 }, { product: 'Biscuits (Nice)', qty: 3, price: 1000, total: 3000 }], total: 8500, payment: 'Cash', attendant: 'Sarah N.' },
    { id: 'sl6', receiptNo: 'RCP000126', time: new Date(now.setHours(13,0,0,0)), items: [{ product: 'Maize Flour', qty: 3, price: 2200, total: 6600 }, { product: 'Cooking Oil', qty: 2, price: 2500, total: 5000 }], total: 11600, payment: 'Mobile Money', attendant: 'Benedict O.' },
    { id: 'sl7', receiptNo: 'RCP000127', time: new Date(now.setHours(14,35,0,0)), items: [{ product: 'Soda (Coca-Cola)', qty: 6, price: 1500, total: 9000 }, { product: 'Water (500ml)', qty: 4, price: 1000, total: 4000 }, { product: 'Biscuits (Nice)', qty: 5, price: 1000, total: 5000 }], total: 18000, payment: 'Cash', attendant: 'Sarah N.' },
    { id: 'sl8', receiptNo: 'RCP000128', time: new Date(now.setHours(15,10,0,0)), items: [{ product: 'Sugar', qty: 1, price: 4200, total: 4200 }, { product: 'Eggs', qty: 12, price: 500, total: 6000 }, { product: 'Bread', qty: 2, price: 3500, total: 7000 }], total: 17200, payment: 'Cash', attendant: 'Sarah N.' },
    { id: 'sl9', receiptNo: 'RCP000129', time: new Date(now.setHours(15,55,0,0)), items: [{ product: 'Exercise Books', qty: 5, price: 1200, total: 6000 }, { product: 'Pens (Blue)', qty: 10, price: 700, total: 7000 }], total: 13000, payment: 'Credit', customer: 'Grace Apio', attendant: 'Benedict O.' },
    { id: 'sl10', receiptNo: 'RCP000130', time: new Date(now.setHours(16,40,0,0)), items: [{ product: 'Sweets', qty: 20, price: 200, total: 4000 }, { product: 'Biscuits (Nice)', qty: 4, price: 1000, total: 4000 }, { product: 'Water (500ml)', qty: 6, price: 1000, total: 6000 }, { product: 'Batteries (AA)', qty: 1, price: 3500, total: 3500 }], total: 17500, payment: 'Mobile Money', attendant: 'Sarah N.' },
    { id: 'sl11', receiptNo: 'RCP000131', time: new Date(now.setHours(17,15,0,0)), items: [{ product: 'Airtime (MTN)', qty: 2, price: 5000, total: 10000 }, { product: 'Bread', qty: 1, price: 3500, total: 3500 }], total: 13500, payment: 'Cash', attendant: 'Sarah N.' },
    { id: 'sl12', receiptNo: 'RCP000132', time: new Date(now.setHours(17,45,0,0)), items: [{ product: 'Soda (Coca-Cola)', qty: 8, price: 1500, total: 12000 }, { product: 'Water (500ml)', qty: 4, price: 1000, total: 4000 }], total: 16000, payment: 'Cash', attendant: 'Benedict O.' },
    { id: 'sl13', receiptNo: 'RCP000133', time: new Date(now.setHours(18,10,0,0)), items: [{ product: 'Airtime (MTN)', qty: 1, price: 5000, total: 5000 }], total: 5000, payment: 'Mobile Money', attendant: 'Sarah N.' },
    { id: 'sl14', receiptNo: 'RCP000134', time: new Date(now.setHours(18,40,0,0)), items: [{ product: 'Sugar', qty: 2, price: 4200, total: 8400 }, { product: 'Maize Flour', qty: 2, price: 2200, total: 4400 }], total: 12700, payment: 'Cash', attendant: 'Benedict O.' },
  ];

  const demoActivityLog = [
    { id: 'a1', user: 'Sarah N.', action: 'Recorded a sale', detail: 'UGX 17,500', time: new Date(now.setHours(17,15,0,0)), type: 'sale' },
    { id: 'a2', user: 'Benedict O.', action: 'Added 5 crates of Soda', detail: 'Stock updated', time: new Date(now.setHours(16,0,0,0)), type: 'stock' },
    { id: 'a3', user: 'Sarah N.', action: 'Recorded a sale', detail: 'UGX 13,000', time: new Date(now.setHours(15,55,0,0)), type: 'sale' },
    { id: 'a4', user: 'Benedict O.', action: 'Added expense', detail: 'UGX 8,000 — Electricity', time: new Date(now.setHours(14,0,0,0)), type: 'expense' },
    { id: 'a5', user: 'Sarah N.', action: 'Received payment', detail: 'John Okello paid UGX 10,000', time: new Date(now.setHours(12,30,0,0)), type: 'payment' },
    { id: 'a6', user: 'Sarah N.', action: 'Adjusted stock', detail: 'Soap: -1 bar (Damaged)', time: new Date(now.setHours(11,0,0,0)), type: 'adjustment' },
    { id: 'a7', user: 'Benedict O.', action: 'Added new product', detail: 'Maize Flour', time: new Date(now.setHours(8,0,0,0)), type: 'product' },
  ];

  let products = [...demoProducts];
  let customers = [...demoCustomers];
  let suppliers = [...demoSuppliers];
  let expenses = [...demoExpenses];
  let todaySales = [...demoTodaySales];
  let activityLog = [...demoActivityLog];
  let cart = [];

  const SYNC_QUEUE_KEY = 'MYDUUKA_SYNC_QUEUE';
  function getSyncQueue() { try { return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]'); } catch { return []; } }
  function addToSyncQueue(action, payload) { const q = getSyncQueue(); q.push({ action, payload, timestamp: Date.now() }); localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(q)); }
  async function flushSyncQueue() { if (!window.Supabase) return; const q = getSyncQueue(); if (!q.length) return; for (const item of q) { try { await window.Supabase.from('sync_queue').insert({ action: item.action, payload: item.payload, shop_id: App.state.user?.shopId || null, created_at: new Date(item.timestamp).toISOString() }); } catch (e) { console.warn('Sync queue item failed:', e); } } localStorage.removeItem(SYNC_QUEUE_KEY); }

  const STORAGE_KEY = 'MYDUUKA_STORE_DATA';
  function saveToStorage() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ products, customers, suppliers, expenses, todaySales, activityLog })); } catch (e) { console.warn('LocalStorage save failed:', e); } }
  function loadFromStorage() { try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) { const data = JSON.parse(saved); if (data.products) products = data.products; if (data.customers) customers = data.customers; if (data.suppliers) suppliers = data.suppliers; if (data.expenses) expenses = data.expenses; if (data.todaySales) todaySales = data.todaySales; if (data.activityLog) activityLog = data.activityLog; return true; } } catch (e) { console.warn('LocalStorage load failed:', e); } return false; }

  async function syncToSupabase() { if (!window.Supabase) return; try { const shopId = App.state.user?.shopId; if (!shopId) return; for (const p of products) await window.Supabase.from('products').upsert({ ...p, shop_id: shopId }); for (const c of customers) await window.Supabase.from('customers').upsert({ ...c, shop_id: shopId }); for (const s of suppliers) await window.Supabase.from('suppliers').upsert({ ...s, shop_id: shopId }); for (const e of expenses) await window.Supabase.from('expenses').upsert({ ...e, shop_id: shopId }); for (const sale of todaySales) { const { data: existing } = await window.Supabase.from('sales').select('id').eq('receipt_no', sale.receiptNo).single(); const saleId = existing?.id || sale.id; await window.Supabase.from('sales').upsert({ id: saleId, shop_id: shopId, receipt_no: sale.receiptNo, time: sale.time, total: sale.total, payment: sale.payment, customer_name: sale.customer || null, attendant: sale.attendant }); if (sale.items) for (const item of sale.items) await window.Supabase.from('sale_items').upsert({ sale_id: saleId, shop_id: shopId, product: item.product, qty: item.qty, price: item.price, total: item.total }); } await flushSyncQueue(); } catch (err) { console.warn('Supabase sync failed:', err); } }
  async function loadFromSupabase() { if (!window.Supabase) return false; try { const shopId = App.state.user?.shopId; if (!shopId) return false; const { data: prods } = await window.Supabase.from('products').select('*').eq('shop_id', shopId); if (prods && prods.length) { products = prods; const { data: custs } = await window.Supabase.from('customers').select('*').eq('shop_id', shopId); if (custs) customers = custs; const { data: sups } = await window.Supabase.from('suppliers').select('*').eq('shop_id', shopId); if (sups) suppliers = sups; const { data: exps } = await window.Supabase.from('expenses').select('*').eq('shop_id', shopId).order('date', { ascending: false }); if (exps) expenses = exps.map(e => ({ ...e, date: new Date(e.date) })); const { data: sales } = await window.Supabase.from('sales').select('*').eq('shop_id', shopId).order('time', { ascending: false }); if (sales && sales.length) { todaySales = sales.map(s => ({ ...s, time: new Date(s.time), items: [] })); for (const sale of todaySales) { const { data: items } = await window.Supabase.from('sale_items').select('*').eq('sale_id', sale.id); if (items) sale.items = items.map(i => ({ product: i.product, qty: i.qty, price: i.price, total: i.total })); } } return true; } } catch (err) { console.warn('Supabase load failed:', err); } return false; }

  const weeklySales = [
    { day: 'Mon', sales: 142000, profit: 31000 }, { day: 'Tue', sales: 168000, profit: 38000 },
    { day: 'Wed', sales: 155000, profit: 34000 }, { day: 'Thu', sales: 190000, profit: 44000 },
    { day: 'Fri', sales: 220000, profit: 52000 }, { day: 'Sat', sales: 280000, profit: 65000 },
    { day: 'Sun', sales: 185000, profit: 42000 },
  ];

  const monthlySales = [
    { month: 'Mar', sales: 3800000, expenses: 1200000 }, { month: 'Apr', sales: 4100000, expenses: 1300000 },
    { month: 'May', sales: 4400000, expenses: 1250000 }, { month: 'Jun', sales: 4200000, expenses: 1400000 },
    { month: 'Jul', sales: 4800000, expenses: 1350000 }, { month: 'Aug', sales: 5800000, expenses: 1450000 },
  ];

  const topProducts = [
    { name: 'Soda (Coca-Cola)', units: 183, revenue: 274500, emoji: '🥤' },
    { name: 'Eggs', units: 360, revenue: 180000, emoji: '🥚' },
    { name: 'Sugar', units: 95, revenue: 399000, emoji: '🍬' },
    { name: 'Bread', units: 142, revenue: 497000, emoji: '🍞' },
    { name: 'Water (500ml)', units: 220, revenue: 220000, emoji: '💧' },
    { name: 'Pens (Blue)', units: 410, revenue: 287000, emoji: '✏️' },
    { name: 'Airtime (MTN)', units: 85, revenue: 425000, emoji: '📱' },
    { name: 'Cooking Oil', units: 45, revenue: 112500, emoji: '🫙' },
  ];

  const users = [
    { id: 'u1', name: 'Benedict Okello', role: 'Owner', phone: '0761 214 808', pin: '1234', active: true, lastLogin: new Date(Date.now() - 3600000), color: '#1A6B4A' },
    { id: 'u2', name: 'Sarah Namuli', role: 'Attendant', phone: '0794 979 060', pin: '5678', active: true, lastLogin: new Date(Date.now() - 1800000), color: '#7C3AED' },
    { id: 'u3', name: 'Moses Kato', role: 'Manager', phone: '0751 248 098', pin: '9012', active: false, lastLogin: new Date(Date.now() - 86400000*2), color: '#2563EB' },
  ];

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
      const sale = { id: Utils.uid(), receiptNo, time: new Date(), items: [...cart.map(i => ({ product: i.name, qty: i.qty, price: i.price, total: i.price * i.qty }))], total, payment: paymentMethod, customer: customerId ? (customers.find(c => c.id === customerId)?.name || '') : null, attendant: 'Sarah N.' };
      cart.forEach(item => { const p = products.find(pr => pr.id === item.productId); if (p) { p.stock = Math.max(0, p.stock - item.qty); p.status = Utils.stockStatus(p.stock, p.minStock); } });
      if (paymentMethod === 'Credit' && customerId) { const cust = customers.find(c => c.id === customerId); if (cust) cust.balance += total; }
      todaySales.unshift(sale);
      activityLog.unshift({ id: Utils.uid(), user: 'Sarah N.', action: 'Recorded a sale', detail: Utils.formatCurrency(total), time: new Date(), type: 'sale' });
      this.clearCart(); saveToStorage(); addToSyncQueue('sale', sale);
      return sale;
    },

    addStock(productId, qty, unit, price, supplierId) { const product = products.find(p => p.id === productId); if (!product) return; const newQty = product.conversion === 1 ? qty : qty * product.conversion; product.stock += newQty; product.status = Utils.stockStatus(product.stock, product.minStock); activityLog.unshift({ id: Utils.uid(), user: 'Benedict O.', action: `Added ${qty} ${unit} of ${product.name}`, detail: `Stock: ${product.stock} ${product.sellingUnit}s`, time: new Date(), type: 'stock' }); saveToStorage(); addToSyncQueue('stock', { productId, qty, unit, price, supplierId }); },

    addExpense(category, amount, payment, description) { const exp = { id: Utils.uid(), category, amount, payment, description, date: new Date() }; expenses.unshift(exp); activityLog.unshift({ id: Utils.uid(), user: 'Benedict O.', action: 'Added expense', detail: `${Utils.formatCurrency(amount)} — ${category}`, time: new Date(), type: 'expense' }); saveToStorage(); addToSyncQueue('expense', exp); return exp; },

    receiveCreditPayment(customerId, amount, method) { const cust = customers.find(c => c.id === customerId); if (!cust) return; cust.balance = Math.max(0, cust.balance - amount); cust.lastTx = new Date(); cust.transactions.push({ date: new Date(), type: 'payment', amount, description: method }); activityLog.unshift({ id: Utils.uid(), user: 'Benedict O.', action: 'Received payment', detail: `${cust.name} paid ${Utils.formatCurrency(amount)}`, time: new Date(), type: 'payment' }); saveToStorage(); addToSyncQueue('payment', { customerId, amount, method }); },

    addCustomer(name, phone, notes = '') { const cust = { id: Utils.uid(), name, phone, balance: 0, lastTx: new Date(), notes, transactions: [] }; customers.push(cust); return cust; },

    addProduct(data) { const product = { id: Utils.uid(), ...data, status: Utils.stockStatus(data.stock || 0, data.minStock || 0) }; products.push(product); return product; },

    adjustStock(productId, newQty, reason) { const product = products.find(p => p.id === productId); if (!product) return; const prev = product.stock; product.stock = newQty; product.status = Utils.stockStatus(product.stock, product.minStock); activityLog.unshift({ id: Utils.uid(), user: 'Benedict O.', action: 'Adjusted stock', detail: `${product.name}: ${prev} → ${newQty} (${reason})`, time: new Date(), type: 'adjustment' }); saveToStorage(); addToSyncQueue('adjustment', { productId, newQty, reason }); },

    getAlerts() {
      const alerts = [];
      const lowProducts = products.filter(p => p.status === 'low' || p.status === 'out');
      if (lowProducts.length) alerts.push({ type: 'critical', icon: '📦', title: 'Low Stock', description: `${lowProducts.length} products need restocking`, screen: 'stock' });
      const credit = this.getCreditSummary();
      if (credit.owing > 0) alerts.push({ type: 'warning', icon: '💳', title: 'Customers Owe You', description: `${credit.owing} customers owe ${Utils.formatCurrency(credit.total)}`, screen: 'customers' });
      const slowProducts = products.filter(p => p.stock > p.minStock * 4);
      if (slowProducts.length) alerts.push({ type: 'caution', icon: '📉', title: 'Slow Moving Stock', description: `${slowProducts.length} products may be overstocked`, screen: 'stock' });
      const today = this.getToday();
      if (today.totalSales > 150000) alerts.push({ type: 'good', icon: '📈', title: 'Strong Sales Today', description: `Today's sales are ${Utils.formatCurrency(today.totalSales)} — great day!`, screen: 'reports' });
      return alerts;
    },

    getNotifications() {
      return [
        { id: 'n1', title: 'Soap is running low', body: 'Only 4 bars left. Consider restocking soon.', time: new Date(Date.now() - 1800000), unread: true, type: 'warning' },
        { id: 'n2', title: 'Batteries almost out', body: '2 packs remaining. Restock before they run out.', time: new Date(Date.now() - 3600000), unread: true, type: 'warning' },
        { id: 'n3', title: 'John Okello owes UGX 15,000', body: 'It has been 2 days since his last purchase.', time: new Date(Date.now() - 86400000*2), unread: false, type: 'info' },
        { id: 'n4', title: 'Great week!', body: 'Your sales this week are 18% higher than last week.', time: new Date(Date.now() - 86400000), unread: false, type: 'success' },
        { id: 'n5', title: 'Milk is out of stock', body: 'Milk has been out of stock. Customers may be looking for it.', time: new Date(Date.now() - 86400000*2), unread: false, type: 'danger' },
      ];
    },
  };
})();

window.Store = Store;
