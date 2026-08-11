/* ============================================================
   MYDUUKA — APP CORE / ROUTER
   Central state management and screen rendering
   ============================================================ */

const App = (() => {
  // ── App State ─────────────────────────────────────────────
  const state = {
    currentScreen: 'splash',
    params: {},
    previousScreen: null,
    isOnline: true,
    user: { id: 'u1', name: 'Benedict Okello', role: 'Owner', initials: 'BO', color: '#1A6B4A' },
    shopName: 'Bentech Mini Mart',
    lastSale: null,
    screenHistory: [],
  };

  // ── Sidebar nav items ─────────────────────────────────────
  const navItems = [
    { screen: 'home',     icon: 'home',          label: 'Home',     section: null },
    { screen: 'sell',     icon: 'shopping-cart',  label: 'Sell',     section: null },
    { screen: 'stock',    icon: 'package',        label: 'My Stock', section: null },
    { screen: 'money',    icon: 'dollar-sign',    label: 'Money',    section: null },
    { screen: 'customers',icon: 'users',          label: 'Customers',section: null },
    { screen: 'suppliers',icon: 'truck',          label: 'Suppliers',section: null },
    { screen: 'reports',  icon: 'bar-chart-2',    label: 'Reports',  section: null },
    { screen: 'monitor',  icon: 'activity',       label: 'Monitor',  section: null },
    { screen: 'alerts',   icon: 'bell',           label: 'Alerts',   section: null, badge: 3 },
    { screen: 'settings', icon: 'settings',       label: 'Settings', section: null },
  ];

  // Screens that should hide the main navigation
  const hideNavScreens = ['splash','login','pin-login',
    'onboarding-1','onboarding-2','onboarding-3','onboarding-4','onboarding-5',
    'sale-success'];

  // Screens where we use app-layout (sidebar + content)
  const mainScreens = ['home','sell','stock','products','money','customers',
    'suppliers','reports','monitor','alerts','settings','users','activity-log',
    'expenses','close-day','purchases','notifications'];

  // ── DOM Refs ──────────────────────────────────────────────
  let appEl, sidebarEl, bottomNavEl, screenContainerEl, toastContainerEl, modalOverlayEl;

  // ── Init ──────────────────────────────────────────────────
  function init() {
    appEl = document.getElementById('app');

    // Build initial shell
    appEl.innerHTML = buildAppShell();

    sidebarEl        = document.getElementById('app-sidebar');
    bottomNavEl      = document.getElementById('app-bottom-nav');
    screenContainerEl= document.getElementById('app-screen');
    toastContainerEl = document.getElementById('toast-container');
    modalOverlayEl   = document.getElementById('modal-overlay');

    // Online/offline monitoring
    window.addEventListener('online',  () => setOnline(true));
    window.addEventListener('offline', () => setOnline(false));

    // Handle back navigation via browser
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.screen) navigate(e.state.screen, e.state.params, true);
    });

    // Navigate to splash
    navigate('splash');
  }

  // ── Build App Shell ───────────────────────────────────────
  function buildAppShell() {
    return `
      <!-- Sidebar (Desktop) -->
      <nav class="sidebar" id="app-sidebar">
        <div class="sidebar-brand">
          <div class="sidebar-logo">M</div>
          <div class="sidebar-brand-text">
            <div class="app-name">MYDUUKA</div>
            <div class="app-tagline">Simple Shop Assistant</div>
          </div>
        </div>
        <div class="sidebar-shop" id="sidebar-shop-info">
          <div class="sidebar-shop-name">Bentech Mini Mart</div>
          <div class="sidebar-shop-type">Retail Shop · Kampala</div>
        </div>
        <nav class="sidebar-nav" id="sidebar-nav">
          ${buildSidebarNav()}
        </nav>
        <div class="sidebar-footer">
          <div class="sidebar-user" onclick="App.navigate('settings')">
            <div class="sidebar-avatar" style="background: #1A6B4A">BO</div>
            <div>
              <div class="sidebar-user-name">Benedict Okello</div>
              <div class="sidebar-user-role">Owner</div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="main-content" id="app-main">
        <div id="app-screen" class="flex-1 overflow-y-auto"></div>
      </div>

      <!-- Bottom Nav (Mobile) -->
      <nav class="bottom-nav" id="app-bottom-nav">
        <div class="bottom-nav-item" id="bnav-home" onclick="App.navigate('home')">
          <i data-lucide="home" style="width:22px;height:22px"></i>
          <span class="bottom-nav-label">Home</span>
        </div>
        <div class="bottom-nav-item" id="bnav-stock" onclick="App.navigate('stock')">
          <i data-lucide="package" style="width:22px;height:22px"></i>
          <span class="bottom-nav-label">Stock</span>
        </div>
        <div class="bottom-nav-item sell-btn" onclick="App.navigate('sell')">
          <div class="bottom-nav-sell anim-glow">
            <i data-lucide="shopping-cart" style="width:24px;height:24px;color:white"></i>
          </div>
          <span class="bottom-nav-label text-primary font-semibold">Sell</span>
        </div>
        <div class="bottom-nav-item" id="bnav-reports" onclick="App.navigate('reports')">
          <i data-lucide="bar-chart-2" style="width:22px;height:22px"></i>
          <span class="bottom-nav-label">Reports</span>
        </div>
        <div class="bottom-nav-item" id="bnav-more" onclick="App.showMoreMenu()">
          <i data-lucide="grid" style="width:22px;height:22px"></i>
          <span class="bottom-nav-label">More</span>
          <span class="bottom-nav-badge">3</span>
        </div>
      </nav>

      <!-- Toast Container -->
      <div class="toast-container" id="toast-container"></div>

      <!-- Modal Overlay -->
      <div id="modal-overlay" style="display:none"></div>
    `;
  }

  // ── Build Sidebar Nav ─────────────────────────────────────
  function buildSidebarNav() {
    return navItems.map(item => `
      <div class="sidebar-link ${state.currentScreen === item.screen ? 'active' : ''}"
           id="sidebar-link-${item.screen}"
           onclick="App.navigate('${item.screen}')">
        <i data-lucide="${item.icon}" style="width:18px;height:18px"></i>
        <span>${item.label}</span>
        ${item.badge ? `<span class="sidebar-badge">${item.badge}</span>` : ''}
      </div>
    `).join('');
  }

  // ── Navigate ──────────────────────────────────────────────
  function navigate(screen, params = {}, fromHistory = false) {
    if (!window.SCREENS) {
      console.warn('SCREENS not loaded yet');
      return;
    }

    const screenFn = window.SCREENS[screen];
    if (!screenFn) {
      console.warn(`Screen not found: ${screen}`);
      // Show 404-like screen
      renderRaw(`
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-title">Screen not found</div>
          <div class="empty-desc">"${screen}" screen is not available yet.</div>
          <button class="btn btn-primary mt-4" onclick="App.navigate('home')">Go Home</button>
        </div>
      `);
      return;
    }

    // Save history
    if (!fromHistory && state.currentScreen !== screen) {
      state.screenHistory.push({ screen: state.currentScreen, params: state.params });
      if (!fromHistory) {
        history.pushState({ screen, params }, '', `#${screen}`);
      }
    }

    state.previousScreen = state.currentScreen;
    state.currentScreen = screen;
    state.params = params;

    // Update nav state
    updateNavState(screen);

    // Show/hide nav based on screen
    const hideNav = hideNavScreens.includes(screen);
    if (sidebarEl)   sidebarEl.style.display   = hideNav ? 'none' : '';
    if (bottomNavEl) bottomNavEl.style.display  = hideNav ? 'none' : '';
    if (appEl) {
      appEl.className = hideNav ? '' : 'app-layout';
    }

    // Update main content margin
    const mainEl = document.getElementById('app-main');
    if (mainEl) {
      mainEl.style.marginLeft = (hideNav || window.innerWidth < 1024) ? '0' : 'var(--sidebar-width)';
    }

    // Render screen
    try {
      const html = screenFn(params);
      renderRaw(html);
    } catch (err) {
      console.error(`Error rendering screen "${screen}":`, err);
      renderRaw(`
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <div class="empty-title">Something went wrong</div>
          <div class="empty-desc">${err.message}</div>
          <button class="btn btn-primary mt-4" onclick="App.navigate('home')">Go Home</button>
        </div>
      `);
    }

    // Reinitialize Lucide icons
    if (window.lucide) {
      setTimeout(() => {
        window.lucide.createIcons();
      }, 0);
    }

    // Initialize charts if needed
    if (window.initCharts) {
      setTimeout(() => {
        window.initCharts(screen);
      }, 100);
    }

    // Run screen-specific post-render hooks
    if (window.SCREEN_HOOKS && window.SCREEN_HOOKS[screen]) {
      setTimeout(() => window.SCREEN_HOOKS[screen](params), 0);
    }

    // Scroll to top
    if (screenContainerEl) screenContainerEl.scrollTop = 0;
  }

  // ── Render Raw HTML ───────────────────────────────────────
  function renderRaw(html) {
    if (!screenContainerEl) {
      screenContainerEl = document.getElementById('app-screen');
    }
    if (screenContainerEl) {
      screenContainerEl.innerHTML = html;
    }
  }

  // ── Update Nav Highlight State ────────────────────────────
  function updateNavState(screen) {
    // Sidebar links
    navItems.forEach(item => {
      const el = document.getElementById(`sidebar-link-${item.screen}`);
      if (el) {
        el.classList.toggle('active', item.screen === screen);
      }
    });

    // Bottom nav
    ['home','stock','reports'].forEach(s => {
      const el = document.getElementById(`bnav-${s}`);
      if (el) {
        el.classList.toggle('active', s === screen);
      }
    });
  }

  // ── Go Back ───────────────────────────────────────────────
  function goBack() {
    if (state.screenHistory.length > 0) {
      const prev = state.screenHistory.pop();
      navigate(prev.screen, prev.params, true);
    } else {
      navigate('home');
    }
  }

  // ── Handle Actions ────────────────────────────────────────
  function handleAction(action, data) {
    switch(action) {
      case 'add-to-cart':
        Store.addToCart(data);
        updateCartBadge();
        showToast(`Added to cart`, 'success');
        // Animate the button
        const btn = document.querySelector(`[data-product-id="${data}"] .add-to-cart-btn`);
        if (btn) {
          btn.classList.add('anim-bounce-in');
          setTimeout(() => btn.classList.remove('anim-bounce-in'), 500);
        }
        refreshCartPanel();
        break;

      case 'remove-from-cart':
        Store.removeFromCart(data);
        updateCartBadge();
        refreshCartPanel();
        break;

      case 'update-cart-qty':
        const [productId, qty] = data.split(':');
        Store.updateCartQty(productId, parseInt(qty));
        updateCartBadge();
        refreshCartPanel();
        break;

      case 'clear-cart':
        Store.clearCart();
        updateCartBadge();
        refreshCartPanel();
        break;

      case 'complete-sale':
        // data = { payment, customerId, amountReceived }
        const saleData = typeof data === 'string' ? JSON.parse(data) : data;
        const sale = Store.completeSale(saleData.payment, saleData.customerId, saleData.amountReceived);
        state.lastSale = sale;
        navigate('sale-success', { sale });
        break;

      case 'toggle-help-item':
        const helpEl = document.getElementById(data);
        if (helpEl) helpEl.classList.toggle('open');
        break;

      case 'select-payment-method':
        // Highlight selected payment method
        document.querySelectorAll('.payment-method-btn').forEach(b => b.classList.remove('selected'));
        const pmBtn = document.getElementById(`pm-${data}`);
        if (pmBtn) pmBtn.classList.add('selected');
        // Show relevant input
        document.querySelectorAll('.payment-extra').forEach(e => e.style.display = 'none');
        const extra = document.getElementById(`pm-extra-${data}`);
        if (extra) extra.style.display = 'block';
        break;

      case 'calc-change':
        const givenEl = document.getElementById('cash-given');
        const changeEl = document.getElementById('change-amount');
        const totalEl = document.getElementById('cart-total-val');
        if (givenEl && changeEl && totalEl) {
          const total   = parseInt(totalEl.dataset.total || 0);
          const given   = parseInt(givenEl.value.replace(/,/g,'') || 0);
          const change  = given - total;
          changeEl.textContent = change >= 0 ? Utils.formatCurrency(change) : 'Not enough';
          changeEl.style.color = change >= 0 ? 'var(--color-success-600)' : 'var(--color-danger-600)';
        }
        break;

      case 'update-denom-total':
        updateDenomTotal();
        break;

      case 'add-expense-save':
        const form = typeof data === 'string' ? JSON.parse(data) : data;
        Store.addExpense(form.category, form.amount, form.payment, form.description);
        showToast('✓ Expense saved', 'success');
        navigate('expenses');
        break;

      case 'filter-products':
        filterProducts(data);
        break;

      case 'filter-stock':
        filterStock(data);
        break;

      case 'filter-sales':
        filterSales(data);
        break;

      case 'receive-payment-save':
        const pd = typeof data === 'string' ? JSON.parse(data) : data;
        Store.receiveCreditPayment(pd.customerId, pd.amount, pd.method);
        showToast('✓ Payment recorded', 'success');
        navigate('customer-detail', { id: pd.customerId });
        break;

      default:
        console.log('Unhandled action:', action, data);
    }
  }

  // ── Cart Badge ────────────────────────────────────────────
  function updateCartBadge() {
    const count = Store.getCartCount();
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  // ── Refresh Cart Panel (in sell screen) ───────────────────
  function refreshCartPanel() {
    const panelEl = document.getElementById('sell-cart-panel');
    if (!panelEl) return;

    const cart = Store.cart;
    const total = Store.getCartTotal();

    if (cart.length === 0) {
      panelEl.innerHTML = `
        <div class="cart-header">
          <div class="font-semibold text-lg">Cart</div>
          <span class="badge badge-neutral">${Store.getCartCount()} items</span>
        </div>
        <div class="cart-empty">
          <i data-lucide="shopping-cart" style="width:48px;height:48px;opacity:0.25;margin-bottom:12px"></i>
          <div class="font-semibold text-muted">Cart is empty</div>
          <div class="text-sm text-faint mt-1">Select products to start a sale</div>
        </div>
      `;
    } else {
      panelEl.innerHTML = `
        <div class="cart-header">
          <div class="font-semibold text-lg">Cart</div>
          <div class="flex items-center gap-2">
            <span class="badge badge-primary">${cart.length} items</span>
            <span onclick="App.handleAction('clear-cart')" class="text-sm text-danger cursor-pointer font-semibold">Clear</span>
          </div>
        </div>
        <div class="cart-items-list">
          ${cart.map(item => `
            <div class="cart-item">
              <div class="cart-item-thumb">${item.emoji || '📦'}</div>
              <div class="cart-item-info">
                <div class="cart-item-name">${Utils.escapeHtml(item.name)}</div>
                <div class="cart-item-unit-price">${Utils.formatCurrency(item.price)} each</div>
              </div>
              <div class="flex items-center gap-2">
                <div class="qty-control">
                  <div class="qty-btn" onclick="App.handleAction('update-cart-qty','${item.productId}:${item.qty-1}')">−</div>
                  <div class="qty-value">${item.qty}</div>
                  <div class="qty-btn" onclick="App.handleAction('update-cart-qty','${item.productId}:${item.qty+1}')">+</div>
                </div>
                <div class="cart-item-subtotal">${Utils.formatCurrency(item.price * item.qty)}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="cart-footer">
          <div class="cart-total-bar mb-3">
            <div class="cart-total-label">TOTAL</div>
            <div class="cart-total-value">${Utils.formatCurrency(total)}</div>
          </div>
          <button class="btn btn-primary btn-full btn-lg" onclick="App.navigate('payment')">
            <i data-lucide="credit-card" style="width:20px;height:20px"></i>
            Pay ${Utils.formatCurrency(total)}
          </button>
        </div>
      `;
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // ── Filter Products (sell screen) ────────────────────────
  function filterProducts(category) {
    const gridEl = document.getElementById('product-grid');
    if (!gridEl) return;

    let products = Store.products;
    if (category && category !== 'All') {
      products = products.filter(p => p.category === category);
    }

    // Re-render product cards
    const searchEl = document.getElementById('sell-search');
    const searchTerm = searchEl ? searchEl.value.toLowerCase() : '';
    if (searchTerm) {
      products = products.filter(p => p.name.toLowerCase().includes(searchTerm));
    }

    gridEl.innerHTML = products.map(p => buildProductCard(p)).join('');
    if (window.lucide) window.lucide.createIcons();
  }

  // ── Filter Stock ──────────────────────────────────────────
  function filterStock(filter) {
    const listEl = document.getElementById('stock-list');
    if (!listEl) return;

    let products = Store.products;
    if (filter === 'low')    products = products.filter(p => p.status === 'low' || p.status === 'caution');
    if (filter === 'out')    products = products.filter(p => p.status === 'out');
    if (filter === 'in')     products = products.filter(p => p.status === 'good');

    listEl.innerHTML = products.map(p => buildStockCard(p)).join('');
    if (window.lucide) window.lucide.createIcons();
  }

  // ── Filter Sales ──────────────────────────────────────────
  function filterSales(type) {
    const listEl = document.getElementById('sales-list');
    if (!listEl) return;
    let sales = Store.todaySales;
    if (type !== 'all') sales = sales.filter(s => s.payment.toLowerCase().replace(' ', '-') === type);
    listEl.innerHTML = sales.map(s => buildSaleListItem(s)).join('');
  }

  // ── Build Product Card ────────────────────────────────────
  function buildProductCard(product) {
    const status = product.status;
    const isOut  = status === 'out';
    const badgeMap = {
      good:    '<span class="badge badge-success" style="font-size:9px">✓ In Stock</span>',
      caution: '<span class="badge badge-warning" style="font-size:9px">⚠ Low</span>',
      low:     '<span class="badge badge-danger"  style="font-size:9px">⚠ Low</span>',
      out:     '<span class="badge badge-danger"  style="font-size:9px">Out</span>',
    };
    return `
      <div class="product-card ${isOut ? 'opacity-50' : ''}" 
           data-product-id="${product.id}"
           onclick="${isOut ? '' : `App.handleAction('add-to-cart','${product.id}')`}"
           style="${isOut ? 'cursor:not-allowed' : ''}">
        <div class="product-thumb">
          <span style="font-size:40px">${product.emoji || '📦'}</span>
          <div class="product-stock-badge">${badgeMap[status] || ''}</div>
        </div>
        <div class="product-info">
          <div class="product-name">${Utils.escapeHtml(product.name)}</div>
          <div class="product-price">${Utils.formatCurrency(product.sellingPrice)}</div>
          <div class="product-stock-text">${product.stock} ${product.sellingUnit}s</div>
        </div>
      </div>
    `;
  }

  // ── Build Stock Card ──────────────────────────────────────
  function buildStockCard(product) {
    const maxStock = Math.max(product.minStock * 3, product.stock, 1);
    const pct      = Math.min(100, Math.round((product.stock / maxStock) * 100));
    const fillClass= product.status === 'good' ? 'success' :
                     product.status === 'out'  ? 'danger'  : 'warning';
    return `
      <div class="stock-card ${product.status === 'out' ? 'critical' : product.status === 'low' ? 'low' : product.status === 'caution' ? 'low' : 'good'}"
           onclick="App.navigate('product-detail', {id:'${product.id}'})">
        <div class="stock-card-emoji">${product.emoji || '📦'}</div>
        <div class="stock-card-info">
          <div class="stock-card-name">${Utils.escapeHtml(product.name)}</div>
          <div class="stock-card-qty">${product.stock} ${product.sellingUnit}s</div>
          <div class="progress-bar mt-1" style="width:120px">
            <div class="progress-fill ${fillClass}" style="width:${pct}%"></div>
          </div>
        </div>
        <div class="stock-card-right">
          ${Utils.stockBadge(product.status)}
          <div class="stock-card-value mt-1">${Utils.formatCurrency(product.stock * product.sellingPrice)}</div>
        </div>
      </div>
    `;
  }

  // ── Build Sale List Item ──────────────────────────────────
  function buildSaleListItem(sale) {
    const pmColor = sale.payment === 'Cash' ? 'badge-success' :
                    sale.payment === 'Mobile Money' ? 'badge-info' :
                    sale.payment === 'Credit' ? 'badge-warning' : 'badge-neutral';
    return `
      <div class="list-item" onclick="App.navigate('receipt', {saleId:'${sale.id}'})">
        <div class="list-item-avatar" style="font-size:18px">🧾</div>
        <div class="list-item-content">
          <div class="list-item-title">${sale.receiptNo}</div>
          <div class="list-item-sub">${sale.items.length} items · ${Utils.formatTime12(sale.time)}</div>
        </div>
        <div class="list-item-right">
          <div class="list-item-value">${Utils.formatCurrency(sale.total)}</div>
          <span class="badge ${pmColor}">${sale.payment}</span>
        </div>
      </div>
    `;
  }

  // ── Denomination Counter ──────────────────────────────────
  function updateDenomTotal() {
    const denoms = [50000, 20000, 10000, 5000, 2000, 1000, 500, 100];
    let total = 0;

    denoms.forEach(d => {
      const countEl = document.getElementById(`denom-${d}`);
      const totalEl = document.getElementById(`denom-total-${d}`);
      if (countEl) {
        const count  = parseInt(countEl.value || 0);
        const amount = count * d;
        total += amount;
        if (totalEl) totalEl.textContent = Utils.formatCurrency(amount);
      }
    });

    const countedEl = document.getElementById('total-counted');
    const diffEl    = document.getElementById('cash-difference');
    const expected  = 235000; // Demo expected cash

    if (countedEl) countedEl.textContent = Utils.formatCurrency(total);
    if (diffEl) {
      const diff = total - expected;
      diffEl.textContent = diff >= 0 ? `+${Utils.formatCurrency(diff)}` : `-${Utils.formatCurrency(Math.abs(diff))}`;
      diffEl.style.color = diff === 0 ? 'var(--color-success-600)' :
                           diff  > 0  ? 'var(--color-info-600)' : 'var(--color-danger-600)';
    }
  }

  // ── Toast Notifications ───────────────────────────────────
  function showToast(message, type = 'success', duration = 3000) {
    if (!toastContainerEl) {
      toastContainerEl = document.getElementById('toast-container');
      if (!toastContainerEl) return;
    }

    const icons = {
      success: 'check-circle',
      error:   'alert-circle',
      warning: 'alert-triangle',
      info:    'info',
    };

    const id   = Utils.uid();
    const toast= document.createElement('div');
    toast.id   = id;
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i data-lucide="${icons[type] || 'info'}" style="width:18px;height:18px;flex-shrink:0"></i>
      <span>${Utils.escapeHtml(message)}</span>
    `;

    toastContainerEl.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.animation = 'fadeOut 300ms ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ── Modal ─────────────────────────────────────────────────
  function showModal(html) {
    if (!modalOverlayEl) {
      modalOverlayEl = document.getElementById('modal-overlay');
    }
    if (!modalOverlayEl) return;

    modalOverlayEl.innerHTML = `
      <div class="modal-overlay" onclick="if(event.target===this)App.closeModal()">
        <div class="modal">
          ${html}
        </div>
      </div>
    `;
    modalOverlayEl.style.display = 'block';

    if (window.lucide) window.lucide.createIcons();
  }

  function closeModal() {
    if (!modalOverlayEl) {
      modalOverlayEl = document.getElementById('modal-overlay');
    }
    if (modalOverlayEl) {
      modalOverlayEl.style.display = 'none';
      modalOverlayEl.innerHTML = '';
    }
  }

  // ── More Menu ─────────────────────────────────────────────
  function showMoreMenu() {
    showModal(`
      <div class="modal-header">
        <div class="modal-title">More</div>
        <div class="modal-close" onclick="App.closeModal()">
          <i data-lucide="x" style="width:18px;height:18px"></i>
        </div>
      </div>
      <div class="modal-body" style="padding:0">
        ${[
          { icon: 'users',       label: 'Customers',      screen: 'customers' },
          { icon: 'truck',       label: 'Suppliers',      screen: 'suppliers' },
          { icon: 'dollar-sign', label: 'Money',          screen: 'money' },
          { icon: 'receipt',     label: 'Expenses',       screen: 'expenses' },
          { icon: 'activity',    label: 'Business Monitor',screen: 'monitor' },
          { icon: 'bell',        label: 'Alerts (3)',     screen: 'alerts' },
          { icon: 'clock',       label: 'Activity Log',   screen: 'activity-log' },
          { icon: 'moon',        label: 'Close Day',      screen: 'close-day' },
          { icon: 'user-check',  label: 'Users & Access', screen: 'users' },
          { icon: 'settings',    label: 'Settings',       screen: 'settings' },
          { icon: 'help-circle', label: 'Help',           screen: 'help' },
        ].map(item => `
          <div class="list-item" onclick="App.closeModal();App.navigate('${item.screen}')">
            <div class="list-item-avatar" style="background:var(--color-primary-50);color:var(--color-primary-700)">
              <i data-lucide="${item.icon}" style="width:20px;height:20px"></i>
            </div>
            <div class="list-item-content">
              <div class="list-item-title">${item.label}</div>
            </div>
            <i data-lucide="chevron-right" style="width:16px;height:16px;color:var(--color-text-faint)"></i>
          </div>
        `).join('')}
      </div>
    `);
  }

  // ── Online/Offline ────────────────────────────────────────
  function setOnline(online) {
    state.isOnline = online;
    const indicators = document.querySelectorAll('.online-indicator');
    indicators.forEach(el => {
      if (online) {
        el.classList.remove('offline');
        el.innerHTML = `<div class="online-dot"></div> Online`;
      } else {
        el.classList.add('offline');
        el.innerHTML = `<div class="online-dot"></div> Offline`;
      }
    });

    if (!online) {
      showToast('You are offline. Your data will sync when connected.', 'warning', 5000);
    } else {
      showToast('Back online! Syncing your data...', 'info', 3000);
    }
  }

  // ── Confirm Dialog ────────────────────────────────────────
  function confirm(message, onConfirm, onCancel) {
    showModal(`
      <div class="modal-header">
        <div class="modal-title">Confirm</div>
      </div>
      <div class="modal-body text-center">
        <p class="text-base">${Utils.escapeHtml(message)}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-surface flex-1" onclick="App.closeModal();${onCancel ? onCancel + '()' : ''}">Cancel</button>
        <button class="btn btn-primary flex-1" onclick="App.closeModal();(${onConfirm})()">Confirm</button>
      </div>
    `);
  }

  function confirmDeleteProduct(productId, productName) {
    confirm(`Delete "${productName}"? This cannot be undone.`, () => {
      Store.deleteProduct(productId);
      showToast('✓ Product deleted', 'success');
      navigate('products');
    });
  }

  function confirmDeleteExpense(expenseId, category) {
    confirm(`Delete "${category}" expense? This cannot be undone.`, () => {
      Store.deleteExpense(expenseId);
      showToast('✓ Expense deleted', 'success');
      navigate('expenses');
    });
  }

  function confirmDeleteSale(saleId) {
    confirm('Delete this sale? Stock will be restored.', () => {
      Store.deleteSale(saleId);
      showToast('✓ Sale deleted', 'success');
      navigate('home');
    });
  }

  function confirmDeleteCustomer(customerId, customerName) {
    confirm(`Delete customer "${customerName}"? This cannot be undone.`, () => {
      Store.deleteCustomer(customerId);
      showToast('✓ Customer deleted', 'success');
      navigate('customers');
    });
  }

  function confirmDeleteSupplier(supplierId, supplierName) {
    confirm(`Delete supplier "${supplierName}"? This cannot be undone.`, () => {
      Store.deleteSupplier(supplierId);
      showToast('✓ Supplier deleted', 'success');
      navigate('suppliers');
    });
  }

  // ── Search Handler ────────────────────────────────────────
  function setupSearch(inputId, onSearch) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.addEventListener('input', Utils.debounce(e => onSearch(e.target.value), 200));
  }

  // ── Login Success ─────────────────────────────────────────
  async function onLoginSuccess(session) {
    state.user = {
      id: session.user.id,
      email: session.user.email,
      phone: session.user.phone,
    };

    if (window.Supabase) {
      const { data: profile } = await window.Supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        state.user.name = profile.name;
        state.user.role = profile.role;
        state.user.shopId = profile.shop_id;
      }
    }

    App.showToast('Welcome, ' + (state.user.name || 'User'), 'success');

    if (state.user.shopId) {
      const loaded = await Store.loadFromSupabase();
      if (!loaded) {
        await Store.syncToSupabase();
      }
    }

    navigate('home');
  }

  // ── Public API ─────────────────────────────────────────────
  return {
    state,
    init,
    navigate,
    goBack,
    handleAction,
    showToast,
    showModal,
    closeModal,
    showMoreMenu,
    setOnline,
    confirm,
    buildProductCard,
    buildStockCard,
    buildSaleListItem,
    setupSearch,
    filterProducts,
    filterStock,
    filterSales,
    updateCartBadge,
    refreshCartPanel,
    updateDenomTotal,
    onLoginSuccess,
  };
})();

// Expose globally
window.App = App;

// Register window.SCREEN_HOOKS
window.SCREEN_HOOKS = window.SCREEN_HOOKS || {};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
