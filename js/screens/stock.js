/* ============================================================
   MYDUUKA — STOCK MODULE & ADJUSTMENTS
   ============================================================ */

window.SCREENS = window.SCREENS || {};

// 1. Stock Overview Screen
window.SCREENS['stock'] = function() {
  const summary = Store.getStockSummary();
  const products = Store.products;

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-title">My Stock 📦</div>
        <div class="topbar-actions">
          <button class="btn btn-sm btn-primary" onclick="App.navigate('add-stock')">+ Add Stock</button>
        </div>
      </div>

      <div class="screen-body">
        <!-- Stock Banner -->
        <div class="stock-summary-banner">
          <div class="text-xs uppercase tracking-wider opacity-80">Total Stock Value</div>
          <div class="text-3xl font-extrabold mt-1">${Utils.formatCurrency(summary.totalValue)}</div>
          
          <div class="stock-summary-grid">
            <div class="stock-summary-stat">
              <div class="stock-summary-stat-value">${summary.total}</div>
              <div class="stock-summary-stat-label">Total Items</div>
            </div>
            <div class="stock-summary-stat">
              <div class="stock-summary-stat-value text-warning">${summary.lowStock}</div>
              <div class="stock-summary-stat-label">Low Stock</div>
            </div>
            <div class="stock-summary-stat">
              <div class="stock-summary-stat-value text-danger">${summary.outOfStock}</div>
              <div class="stock-summary-stat-label">Out of Stock</div>
            </div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="filter-tabs mb-4">
          <div class="filter-tab active" onclick="App.filterStock('all')">All Products</div>
          <div class="filter-tab" onclick="App.filterStock('low')">🔴 Low / Critical</div>
          <div class="filter-tab" onclick="App.filterStock('out')">⛔ Out of Stock</div>
          <div class="filter-tab" onclick="App.filterStock('in')">🟢 Good Stock</div>
        </div>

        <!-- Stock Cards List -->
        <div class="flex flex-col gap-3" id="stock-list">
          ${products.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">📦</div>
              <div class="empty-title">No stock yet</div>
              <div class="empty-desc">Add products first, then add stock to start selling</div>
              <button class="btn btn-primary mt-4" onclick="App.navigate('add-product')">+ Add Product</button>
            </div>
          ` : products.map(p => App.buildStockCard(p)).join('')}
        </div>
      </div>
    </div>
  `;
};

// 2. Add Stock Screen
window.SCREENS['add-stock'] = function() {
  window.updateStockCalc = function() {
    const pId = document.getElementById('stk-product-select').value;
    const qty = parseInt(document.getElementById('stk-qty').value || 0);
    const product = Store.products.find(p => p.id === pId);
    
    if (product) {
      const unitAdd = product.conversion === 1 ? qty : qty * product.conversion;
      const newTotal = product.stock + unitAdd;
      document.getElementById('stk-calc-preview').textContent = `New total will be: ${newTotal} ${product.sellingUnit}s (Current: ${product.stock})`;
    }
  };

  window.saveAddStockForm = function() {
    const pId = document.getElementById('stk-product-select').value;
    const qty = parseInt(document.getElementById('stk-qty').value || 0);
    const price = parseFloat(document.getElementById('stk-price').value || 0);
    const supplierId = document.getElementById('stk-supplier').value;

    if (qty <= 0) {
      App.showToast('Please enter quantity purchased', 'error');
      return;
    }

    const product = Store.products.find(p => p.id === pId);
    if (product) {
      Store.addStock(pId, qty, product.buyingUnit, price, supplierId);
      App.showToast(`✓ Added stock for ${product.name}`, 'success');
      App.navigate('stock');
    }
  };

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back
        </div>
        <div class="topbar-title">Add / Buy Stock 📦</div>
      </div>

      <div class="screen-body max-w-xl mx-auto">
        <div class="card card-padded mb-6">
          <div class="form-group">
            <label class="form-label">Select Product</label>
            <select class="form-select" id="stk-product-select" onchange="updateStockCalc()">
              ${Store.products.map(p => `
                <option value="${p.id}">${p.emoji} ${p.name} (Current: ${p.stock} ${p.sellingUnit}s)</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Quantity Purchased</label>
            <input type="number" class="form-input text-xl font-bold text-primary" id="stk-qty" placeholder="e.g. 2" oninput="updateStockCalc()">
          </div>

          <div class="alert-banner alert-banner-info mb-4" id="stk-calc-preview">
            Select quantity to see stock calculation.
          </div>

          <div class="form-group">
            <label class="form-label">Total Purchase Price (UGX)</label>
            <input type="number" class="form-input" id="stk-price" placeholder="e.g. 48000">
          </div>

          <div class="form-group">
            <label class="form-label">Supplier</label>
            <select class="form-select" id="stk-supplier">
              ${Store.suppliers.map(s => `
                <option value="${s.id}">${s.name} (${s.location})</option>
              `).join('')}
            </select>
          </div>

          <button class="btn btn-primary btn-full btn-lg mt-4" onclick="saveAddStockForm()">
            Save & Update Stock
          </button>
        </div>
      </div>
    </div>
  `;
};

// 3. Stock Adjustment Screen
window.SCREENS['stock-adjustment'] = function(params) {
  const pId = params && params.productId;
  const product = Store.products.find(p => p.id === pId) || Store.products[0];

  window.saveAdjustment = function() {
    const newQty = parseInt(document.getElementById('adj-new-qty').value || 0);
    const reason = document.getElementById('adj-reason').value;

    Store.adjustStock(product.id, newQty, reason);
    App.showToast(`✓ Stock adjusted for ${product.name}`, 'success');
    App.navigate('stock');
  };

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back
        </div>
        <div class="topbar-title">Adjust Stock Quantity</div>
      </div>

      <div class="screen-body max-w-xl mx-auto">
        <div class="card card-padded mb-6">
          <div class="font-bold text-lg mb-1">${product.emoji} ${Utils.escapeHtml(product.name)}</div>
          <div class="text-sm text-muted mb-4">Current Stock: <span class="font-bold text-primary">${product.stock} ${product.sellingUnit}s</span></div>

          <div class="form-group">
            <label class="form-label">New Stock Quantity</label>
            <input type="number" class="form-input text-xl font-bold text-primary" id="adj-new-qty" value="${product.stock}">
          </div>

          <div class="form-group">
            <label class="form-label">Reason for Adjustment</label>
            <select class="form-select" id="adj-reason">
              <option>Damaged Item</option>
              <option>Expired Item</option>
              <option>Lost / Stolen</option>
              <option>Counting Error</option>
              <option>Personal / Shop Use</option>
              <option>Other</option>
            </select>
          </div>

          <div class="alert-banner alert-banner-warning mb-4">
            <i data-lucide="alert-triangle" style="width:20px;height:20px"></i>
            <div>All stock adjustments are logged for business accountability.</div>
          </div>

          <button class="btn btn-primary btn-full btn-lg" onclick="saveAdjustment()">
            Save Adjustment
          </button>
        </div>
      </div>
    </div>
  `;
};
