/* ============================================================
   MYDUUKA — SELL MODULE & RECEIPTS
   ============================================================ */

window.SCREENS = window.SCREENS || {};

// 1. Sell Screen
window.SCREENS['sell'] = function() {
  const products = Store.products;
  const categories = ['All', 'Drinks', 'Food', 'Groceries', 'Snacks', 'Stationery', 'School Supplies', 'Personal Care'];
  const cartCount = Store.getCartCount();

  return `
    <div class="screen sell-screen">
      <!-- Products List Panel -->
      <div class="sell-products-panel">
        <div class="topbar px-0 bg-transparent border-0 mb-3">
          <div class="topbar-title">New Sale 🛒</div>
          <div class="topbar-actions lg:hidden">
            <button class="btn btn-sm btn-primary" onclick="document.getElementById('sell-cart-panel').scrollIntoView({behavior:'smooth'})">
              Cart (<span class="cart-badge">${cartCount}</span>)
            </button>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="search-bar mb-4">
          <i data-lucide="search" class="search-icon"></i>
          <input type="text" id="sell-search" placeholder="Search product by name or scan..." oninput="App.filterProducts()">
        </div>

        <!-- Categories Filter -->
        <div class="filter-tabs mb-4">
          ${categories.map(c => `
            <div class="filter-tab ${c === 'All' ? 'active' : ''}" onclick="document.querySelectorAll('.filter-tab').forEach(t=>t.classList.remove('active'));this.classList.add('active');App.filterProducts('${c}')">
              ${c}
            </div>
          `).join('')}
        </div>

        <!-- Product Cards Grid -->
        <div class="product-grid" id="product-grid">
          ${products.map(p => App.buildProductCard(p)).join('')}
        </div>
      </div>

      <!-- Cart Sidebar Panel -->
      <div class="sell-cart-panel" id="sell-cart-panel">
        <!-- Rendered dynamically by App.refreshCartPanel() -->
      </div>
    </div>
  `;
};

// Register hook to refresh cart panel right after render
window.SCREEN_HOOKS['sell'] = function() {
  App.refreshCartPanel();
};

// 2. Payment Screen
window.SCREENS['payment'] = function() {
  const cart = Store.cart;
  const total = Store.getCartTotal();
  let selectedMethod = 'Cash';
  let selectedCustomer = null;

  if (cart.length === 0) {
    setTimeout(() => App.navigate('sell'), 0);
    return '';
  }

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back to Cart
        </div>
        <div class="topbar-title">Payment 💳</div>
      </div>

      <div class="screen-body max-w-xl mx-auto">
        <!-- Order Summary Card -->
        <div class="card card-padded mb-5">
          <div class="text-xs font-bold text-muted uppercase tracking-wider mb-2">Order Summary (${cart.length} items)</div>
          <div class="flex flex-col gap-2 mb-3">
            ${cart.map(i => `
              <div class="flex justify-between text-sm">
                <span>${i.qty} × ${Utils.escapeHtml(i.name)}</span>
                <span class="font-bold">${Utils.formatCurrency(i.price * i.qty)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="divider"></div>

          <div class="flex justify-between items-center">
            <span class="text-base font-semibold">Total Amount</span>
            <span class="text-3xl font-extrabold text-primary" id="cart-total-val" data-total="${total}">${Utils.formatCurrency(total)}</span>
          </div>
        </div>

        <!-- Payment Method Selection -->
        <div class="card card-padded mb-6">
          <label class="form-label mb-3">Select Payment Method</label>
          <div class="payment-methods mb-4">
            <div class="payment-method-btn selected" id="pm-Cash" onclick="App.handleAction('select-payment-method','Cash')">
              <div class="payment-method-icon">💵</div>
              <span>Cash</span>
            </div>

            <div class="payment-method-btn" id="pm-MobileMoney" onclick="App.handleAction('select-payment-method','MobileMoney')">
              <div class="payment-method-icon">📱</div>
              <span>Mobile Money</span>
            </div>

            <div class="payment-method-btn" id="pm-Credit" onclick="App.handleAction('select-payment-method','Credit')">
              <div class="payment-method-icon">📝</div>
              <span>Credit (Owe)</span>
            </div>

            <div class="payment-method-btn" id="pm-Card" onclick="App.handleAction('select-payment-method','Card')">
              <div class="payment-method-icon">💳</div>
              <span>Card / Bank</span>
            </div>
          </div>

          <!-- Cash Calculator Extra -->
          <div class="payment-extra p-4 bg-primary-50 rounded-lg border border-primary-200" id="pm-extra-Cash">
            <div class="form-group mb-2">
              <label class="form-label">Customer Cash Given (UGX)</label>
              <input type="number" class="form-input text-xl font-bold text-primary" id="cash-given" placeholder="e.g. 20000" oninput="App.handleAction('calc-change')">
            </div>

            <div class="flex justify-between items-center mt-3">
              <span class="font-semibold text-sm">Change to return:</span>
              <span class="text-2xl font-extrabold text-success" id="change-amount">UGX 0</span>
            </div>
          </div>

          <!-- Credit Extra -->
          <div class="payment-extra p-4 bg-warning-50 rounded-lg border border-warning-200" id="pm-extra-Credit" style="display:none">
            <div class="form-group mb-2">
              <label class="form-label">Select Customer Who Owes</label>
              <select class="form-select" id="credit-customer-select">
                ${Store.customers.map(c => `
                  <option value="${c.id}">${c.name} (${c.phone}) — Currently Owes: ${Utils.formatCurrency(c.balance)}</option>
                `).join('')}
              </select>
            </div>
            <div class="text-xs text-muted">This sale will be added to the customer's balance.</div>
          </div>

          <button class="btn btn-primary btn-full btn-xl mt-6 shadow-lg" onclick="
            const pm = document.querySelector('.payment-method-btn.selected').id.replace('pm-','');
            const cust = pm === 'Credit' ? document.getElementById('credit-customer-select').value : null;
            const given = document.getElementById('cash-given') ? document.getElementById('cash-given').value : null;
            App.handleAction('complete-sale', { payment: pm === 'MobileMoney' ? 'Mobile Money' : pm, customerId: cust, amountReceived: given });
          ">
            Complete Sale (${Utils.formatCurrency(total)})
          </button>
        </div>
      </div>
    </div>
  `;
};

// 3. Sale Success Screen
window.SCREENS['sale-success'] = function(params) {
  const sale = (params && params.sale) || App.state.lastSale || { receiptNo: 'RCP000123', total: 10500, payment: 'Cash' };

  return `
    <div class="screen min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <div class="success-icon-wrap">
        <i data-lucide="check" class="success-icon"></i>
      </div>

      <h1 class="text-3xl font-extrabold text-text mb-1">Sale Complete!</h1>
      <p class="text-sm text-muted mb-4">Receipt #${sale.receiptNo}</p>

      <div class="card card-padded w-full max-w-sm mb-6 bg-neutral-50">
        <div class="summary-row">
          <span class="summary-row-label">Total Amount Paid</span>
          <span class="summary-row-value total">${Utils.formatCurrency(sale.total)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-row-label">Payment Method</span>
          <span class="summary-row-value">${sale.payment}</span>
        </div>
        ${sale.payment === 'Cash' ? `
          <div class="summary-row">
            <span class="summary-row-label">Status</span>
            <span class="summary-row-value text-success font-bold">Completed</span>
          </div>
        ` : ''}
      </div>

      <div class="grid grid-2 gap-3 w-full max-w-sm mb-4">
        <button class="btn btn-primary btn-lg" onclick="App.navigate('sell')">
          <i data-lucide="plus-circle" style="width:20px;height:20px"></i> New Sale
        </button>

        <button class="btn btn-secondary btn-lg" onclick="App.navigate('receipt', {saleId:'${sale.id}'})">
          <i data-lucide="receipt" style="width:20px;height:20px"></i> View Receipt
        </button>
      </div>

      <button class="btn btn-ghost text-sm" onclick="App.navigate('home')">Go to Home Dashboard</button>
    </div>
  `;
};

// 4. Receipt Screen
window.SCREENS['receipt'] = function(params) {
  const sale = Store.todaySales.find(s => s.id === (params && params.saleId)) || Store.todaySales[0];

  return `
    <div class="screen">
      <div class="topbar no-print">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back
        </div>
        <div class="topbar-title">Receipt #${sale.receiptNo}</div>
        <div class="topbar-actions">
          <button class="btn btn-sm btn-surface" onclick="window.print()">
            <i data-lucide="printer" style="width:16px;height:16px"></i> Print
          </button>
        </div>
      </div>

      <div class="screen-body">
        <div class="receipt">
          <div class="receipt-header">
            <div class="receipt-logo">MYDUUKA</div>
            <div class="receipt-shop">BENTECH MINI MART</div>
            <div class="receipt-meta">
              Nakawa Market, Kampala<br>
              Tel: 0761 214 808 / 0794 979 060<br>
              Date: ${Utils.formatDate(sale.time)} ${Utils.formatTime(sale.time)}
            </div>
            <div class="receipt-meta font-bold mt-2">Receipt #${sale.receiptNo}</div>
            <div class="receipt-meta">Attendant: ${sale.attendant || 'Sarah N.'}</div>
          </div>

          <div class="receipt-items">
            ${sale.items.map(item => `
              <div class="receipt-item">
                <span>${Utils.escapeHtml(item.product)} (${item.qty}x)</span>
                <span>${Utils.formatCurrency(item.total).replace('UGX ','')}</span>
              </div>
            `).join('')}
          </div>

          <div class="receipt-total">
            <span>TOTAL</span>
            <span>${Utils.formatCurrency(sale.total)}</span>
          </div>

          <div class="receipt-meta text-right">
            Payment: ${sale.payment}
          </div>

          <div class="receipt-footer">
            Thank you for shopping with us!<br>
            Powered by MYDUUKA · Uganda
          </div>
        </div>
      </div>
    </div>
  `;
};
