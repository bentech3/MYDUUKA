/* ============================================================
   MYDUUKA — SUPPLIERS MODULE
   ============================================================ */

window.SCREENS = window.SCREENS || {};

window.SCREENS['suppliers'] = function() {
  const suppliers = Store.suppliers;

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-title">Suppliers 🏭</div>
        <div class="topbar-actions">
          <button class="btn btn-sm btn-primary" onclick="App.showToast('Supplier add modal', 'info')">+ Supplier</button>
        </div>
      </div>

      <div class="screen-body">
        <div class="stats-row mb-5">
          <div class="stat-item">
            <div class="stat-value text-primary">${suppliers.length}</div>
            <div class="stat-label">Active Suppliers</div>
          </div>
          <div class="stat-item">
            <div class="stat-value text-success">UGX 846K</div>
            <div class="stat-label">Stock Purchased (Aug)</div>
          </div>
        </div>

        <div class="card overflow-hidden">
          ${suppliers.map((s, idx) => `
            <div class="list-item" onclick="App.navigate('supplier-detail', {id:'${s.id}'})">
              <div class="list-item-avatar" style="background:${Utils.avatarColor(idx)};color:white">
                🏭
              </div>
              <div class="list-item-content">
                <div class="list-item-title">${Utils.escapeHtml(s.name)}</div>
                <div class="list-item-sub">${s.location} · ${s.phone}</div>
                <div class="flex gap-1 mt-1">
                  ${s.products.map(p => `<span class="chip">${p}</span>`).join('')}
                </div>
              </div>
              <div class="list-item-right">
                <i data-lucide="chevron-right" class="list-chevron"></i>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
};

window.SCREENS['supplier-detail'] = function(params) {
  const supplier = Store.suppliers.find(s => s.id === (params && params.id)) || Store.suppliers[0];

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back
        </div>
        <div class="topbar-title">${Utils.escapeHtml(supplier.name)}</div>
      </div>

      <div class="screen-body max-w-xl mx-auto">
        <div class="supplier-hero card text-center mb-5">
          <div class="supplier-avatar-lg mx-auto">🏭</div>
          <div class="font-extrabold text-2xl text-white">${Utils.escapeHtml(supplier.name)}</div>
          <div class="text-sm opacity-80 text-white">${supplier.location}</div>
        </div>

        <div class="card card-padded mb-5">
          <div class="info-row">
            <span class="info-key">Contact Person</span>
            <span class="info-val">${supplier.contact}</span>
          </div>

          <div class="info-row">
            <span class="info-key">Phone Number</span>
            <span class="info-val text-primary font-bold">${supplier.phone}</span>
          </div>

          <div class="info-row">
            <span class="info-key">Supplied Products</span>
            <span class="info-val">${supplier.products.join(', ')}</span>
          </div>
        </div>

        <div class="section-header">
          <div class="section-title">Purchase History</div>
        </div>

        <div class="card overflow-hidden">
          ${(supplier.purchases || []).map(p => `
            <div class="list-item">
              <div class="list-item-avatar bg-primary-100 text-primary-700">📦</div>
              <div class="list-item-content">
                <div class="list-item-title">${p.items}</div>
                <div class="list-item-sub">${Utils.formatDate(p.date)}</div>
              </div>
              <div class="list-item-right">
                <div class="list-item-value">${Utils.formatCurrency(p.amount)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
};

// 3. Purchases Screen
window.SCREENS['purchases'] = function() {
  const allPurchases = Store.suppliers.flatMap(s =>
    (s.purchases || []).map(p => ({ ...p, supplierName: s.name, supplierId: s.id }))
  ).sort((a, b) => b.date - a.date);

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back
        </div>
        <div class="topbar-title">Purchases 🛍️</div>
        <div class="topbar-actions">
          <button class="btn btn-sm btn-primary" onclick="App.navigate('add-stock')">
            <i data-lucide="plus" style="width:16px;height:16px"></i> New Purchase
          </button>
        </div>
      </div>

      <div class="screen-body">
        <div class="stats-row mb-5">
          <div class="stat-item">
            <div class="stat-value text-primary">${allPurchases.length}</div>
            <div class="stat-label">Total Purchases</div>
          </div>
          <div class="stat-item">
            <div class="stat-value text-success">${Utils.formatCurrency(allPurchases.reduce((s, p) => s + p.amount, 0))}</div>
            <div class="stat-label">Total Spent</div>
          </div>
        </div>

        <div class="section-header">
          <div class="section-title">Recent Purchases</div>
        </div>

        <div class="flex flex-col gap-3">
          ${allPurchases.map(p => `
            <div class="list-item" onclick="App.navigate('supplier-detail', {id:'${p.supplierId}'})">
              <div class="list-item-avatar" style="background:var(--color-primary-50);color:var(--color-primary-700)">
                🏭
              </div>
              <div class="list-item-content">
                <div class="list-item-title">${Utils.escapeHtml(p.supplierName)}</div>
                <div class="list-item-sub">${Utils.escapeHtml(p.items)}</div>
              </div>
              <div class="list-item-right">
                <div class="list-item-value">${Utils.formatCurrency(p.amount)}</div>
                <div class="text-xs text-muted">${Utils.formatDate(p.date)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
};
