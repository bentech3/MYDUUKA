/* ============================================================
   MYDUUKA — HOME SCREEN / OVERVIEW
   ============================================================ */

window.SCREENS = window.SCREENS || {};

window.SCREENS['home'] = function() {
  const today = Store.getToday();
  const alerts = Store.getAlerts();
  const recentSales = Store.todaySales.slice(0, 5);

  return `
    <div class="screen">
      <!-- Top Bar Header -->
      <div class="dashboard-header">
        <div class="flex items-center justify-between">
          <div>
            <div class="dashboard-greeting">${Utils.getGreeting()},</div>
            <div class="dashboard-shop-name">Bentech Mini Mart</div>
            <div class="dashboard-date">${Utils.formatDateShort(new Date())}</div>
          </div>
          <div class="flex items-center gap-3">
            <div class="online-indicator">
              <div class="online-dot"></div> Online
            </div>
            <div class="relative cursor-pointer" onclick="App.navigate('alerts')">
              <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                <i data-lucide="bell" style="width:20px;height:20px"></i>
              </div>
              <span class="absolute -top-1 -right-1 w-5 h-5 bg-danger-600 rounded-full text-white text-xs font-bold flex items-center justify-center border-2 border-primary-700">3</span>
            </div>
          </div>
        </div>

        <div class="dashboard-kpi-main">
          <div class="dashboard-kpi-label">Today's Sales</div>
          <div class="dashboard-kpi-value">${Utils.formatCurrency(today.totalSales)}</div>
          <div class="text-xs opacity-80 mt-1 flex items-center gap-2">
            <span>${today.transactions} transactions recorded</span>
            <span>·</span>
            <span class="text-success-100 font-semibold">▲ 15% vs yesterday</span>
          </div>
        </div>
      </div>

      <!-- Floating Sub-KPI Cards -->
      <div class="dashboard-float-cards">
        <div class="float-cards-grid">
          <div class="float-card" onclick="App.navigate('money')">
            <div class="float-card-icon">💵</div>
            <div class="float-card-label">Cash</div>
            <div class="float-card-value">${Utils.formatCurrency(today.cashSales)}</div>
          </div>
          
          <div class="float-card" onclick="App.navigate('money')">
            <div class="float-card-icon">📱</div>
            <div class="float-card-label">Mobile Money</div>
            <div class="float-card-value">${Utils.formatCurrency(today.mmSales)}</div>
          </div>

          <div class="float-card" onclick="App.navigate('customers')">
            <div class="float-card-icon">📝</div>
            <div class="float-card-label">Credit (Owed)</div>
            <div class="float-card-value text-accent">${Utils.formatCurrency(today.creditSales)}</div>
          </div>

          <div class="float-card" onclick="App.navigate('reports')">
            <div class="float-card-icon">📈</div>
            <div class="float-card-label">Est. Profit</div>
            <div class="float-card-value text-success">${Utils.formatCurrency(today.estProfit)}</div>
          </div>
        </div>
      </div>

      <div class="screen-body page-gap">
        <!-- Quick Actions Grid -->
        <div class="section-header">
          <div class="section-title">Quick Actions</div>
        </div>
        
        <div class="quick-actions mb-6">
          <div class="quick-action-btn border-2 border-primary-500 bg-primary-50" onclick="App.navigate('sell')">
            <div class="quick-action-icon bg-primary-700 text-white shadow-primary">
              <i data-lucide="shopping-cart" style="width:24px;height:24px"></i>
            </div>
            <div class="quick-action-label text-primary font-bold">🛒 SELL</div>
          </div>

          <div class="quick-action-btn" onclick="App.navigate('add-stock')">
            <div class="quick-action-icon bg-info-100 text-info-600">
              <i data-lucide="package-plus" style="width:22px;height:22px"></i>
            </div>
            <div class="quick-action-label">📦 Add Stock</div>
          </div>

          <div class="quick-action-btn" onclick="App.navigate('receive-payment')">
            <div class="quick-action-icon bg-accent-100 text-accent-700">
              <i data-lucide="hand-coins" style="width:22px;height:22px"></i>
            </div>
            <div class="quick-action-label">💰 Receive Money</div>
          </div>

          <div class="quick-action-btn" onclick="App.navigate('add-expense')">
            <div class="quick-action-icon bg-danger-100 text-danger-600">
              <i data-lucide="receipt" style="width:22px;height:22px"></i>
            </div>
            <div class="quick-action-label">📝 Add Expense</div>
          </div>
        </div>

        <!-- Business Warnings / Alerts -->
        <div class="section-header">
          <div class="section-title">Requires Attention</div>
          <div class="section-link" onclick="App.navigate('alerts')">View All (${alerts.length})</div>
        </div>

        <div class="flex flex-col gap-3 mb-6">
          ${alerts.map(a => `
            <div class="alert-card ${a.type}" onclick="App.navigate('${a.screen}')">
              <div class="alert-icon-wrap">${a.icon}</div>
              <div class="flex-1">
                <div class="alert-card-title">${a.title}</div>
                <div class="alert-card-desc">${a.desc}</div>
              </div>
              <i data-lucide="chevron-right" class="list-chevron"></i>
            </div>
          `).join('')}
        </div>

        <!-- Recent Sales -->
        <div class="section-header">
          <div class="section-title">Today's Recent Sales</div>
          <div class="section-link" onclick="App.navigate('reports')">Full Report</div>
        </div>

        <div class="card overflow-hidden">
          ${recentSales.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">🧾</div>
              <div class="empty-title">No sales yet today</div>
              <div class="empty-desc">Start selling by adding products and making sales</div>
              <button class="btn btn-primary mt-4" onclick="App.navigate('sell')">Start Selling</button>
            </div>
          ` : recentSales.map(s => App.buildSaleListItem(s)).join('')}
        </div>
      </div>
    </div>
  `;
};
