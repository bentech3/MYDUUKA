/* ============================================================
   MYDUUKA — REPORTS MODULE
   ============================================================ */

window.SCREENS = window.SCREENS || {};

window.SCREENS['reports'] = function(params) {
  const tab = (params && params.tab) || 'today';
  const today = Store.getToday();

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-title">Business Reports 📊</div>
        <div class="topbar-actions">
          <button class="btn btn-sm btn-surface" onclick="window.print()">
            <i data-lucide="printer" style="width:16px;height:16px"></i> Print
          </button>
        </div>
      </div>

      <div class="screen-body">
        <!-- Period Selector -->
        <div class="report-period-selector">
          <div class="report-period-btn ${tab==='today'?'active':''}" onclick="App.navigate('reports',{tab:'today'})">Today</div>
          <div class="report-period-btn ${tab==='daily'?'active':''}" onclick="App.navigate('daily-report')">Daily</div>
          <div class="report-period-btn ${tab==='weekly'?'active':''}" onclick="App.navigate('weekly-report')">Weekly</div>
          <div class="report-period-btn ${tab==='monthly'?'active':''}" onclick="App.navigate('monthly-report')">Monthly</div>
        </div>

        ${tab === 'today' ? `
          <!-- Today Report Summary -->
          <div class="card card-padded mb-6">
            <div class="text-xs text-muted font-bold uppercase tracking-wider mb-2">Today Summary · ${Utils.formatDate(new Date())}</div>
            
            <div class="stats-row mb-4">
              <div class="stat-item">
                <div class="stat-value text-primary">${Utils.formatCurrency(today.totalSales)}</div>
                <div class="stat-label">Total Sales</div>
              </div>

              <div class="stat-item">
                <div class="stat-value text-success">${Utils.formatCurrency(today.estProfit)}</div>
                <div class="stat-label">Est. Gross Profit</div>
              </div>

              <div class="stat-item">
                <div class="stat-value text-danger">${Utils.formatCurrency(today.expenses)}</div>
                <div class="stat-label">Expenses</div>
              </div>

              <div class="stat-item">
                <div class="stat-value text-accent">${Utils.formatCurrency(today.estProfit - today.expenses)}</div>
                <div class="stat-label">Est. Net Profit</div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="report-section-title">Sales by Payment Method</div>
            <div class="flex flex-col gap-2 mb-4">
              <div class="summary-row">
                <span class="summary-row-label">💵 Cash</span>
                <span class="summary-row-value">${Utils.formatCurrency(today.cashSales)}</span>
              </div>
              <div class="summary-row">
                <span class="summary-row-label">📱 Mobile Money</span>
                <span class="summary-row-value">${Utils.formatCurrency(today.mmSales)}</span>
              </div>
              <div class="summary-row">
                <span class="summary-row-label">📝 Credit</span>
                <span class="summary-row-value text-accent">${Utils.formatCurrency(today.creditSales)}</span>
              </div>
            </div>
          </div>

          <!-- Top Selling Products -->
          <div class="section-header">
            <div class="section-title">Top Selling Products Today</div>
          </div>

          <div class="card overflow-hidden mb-6">
            ${Store.topProducts.slice(0, 5).map((p, idx) => `
              <div class="top-product-item px-4">
                <div class="top-product-rank ${idx===0?'gold':idx===1?'silver':idx===2?'bronze':''}">${idx+1}</div>
                <div class="top-product-info">
                  <div class="top-product-name">${p.emoji} ${p.name}</div>
                  <div class="top-product-units">${p.units} units sold</div>
                </div>
                <div class="top-product-value">${Utils.formatCurrency(p.revenue)}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
};

// Daily Report Printable
window.SCREENS['daily-report'] = function() {
  const today = Store.getToday();

  return `
    <div class="screen">
      <div class="topbar no-print">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back
        </div>
        <div class="topbar-title">Daily Summary Report</div>
        <div class="topbar-actions">
          <button class="btn btn-sm btn-primary" onclick="window.print()">Print Report</button>
        </div>
      </div>

      <div class="screen-body max-w-xl mx-auto">
        <div class="card card-padded">
          <div class="text-center border-b pb-4 mb-4">
            <div class="text-2xl font-extrabold text-primary">MYDUUKA DAILY REPORT</div>
            <div class="font-bold text-lg">BENTECH MINI MART</div>
            <div class="text-xs text-muted">Date: ${Utils.formatDate(new Date())}</div>
          </div>

          <div class="report-section-title">Financial Summary</div>
          <div class="summary-row"><span class="summary-row-label">Total Sales</span><span class="summary-row-value total">${Utils.formatCurrency(today.totalSales)}</span></div>
          <div class="summary-row"><span class="summary-row-label">Cash Received</span><span class="summary-row-value">${Utils.formatCurrency(today.cashSales)}</span></div>
          <div class="summary-row"><span class="summary-row-label">Mobile Money</span><span class="summary-row-value">${Utils.formatCurrency(today.mmSales)}</span></div>
          <div class="summary-row"><span class="summary-row-label">Credit Sales</span><span class="summary-row-value">${Utils.formatCurrency(today.creditSales)}</span></div>
          <div class="summary-row"><span class="summary-row-label">Cost of Goods Sold (Est.)</span><span class="summary-row-value">-${Utils.formatCurrency(today.totalSales - today.estProfit)}</span></div>
          <div class="summary-row"><span class="summary-row-label">Gross Profit (Est.)</span><span class="summary-row-value text-success font-bold">${Utils.formatCurrency(today.estProfit)}</span></div>
          <div class="summary-row"><span class="summary-row-label">Operating Expenses</span><span class="summary-row-value text-danger">-${Utils.formatCurrency(today.expenses)}</span></div>
          <div class="summary-row"><span class="summary-row-label">Net Profit (Est.)</span><span class="summary-row-value text-success font-extrabold">${Utils.formatCurrency(today.estProfit - today.expenses)}</span></div>

          <div class="report-section-title mt-6">Cash Drawer Reconciliation</div>
          <div class="summary-row"><span class="summary-row-label">Opening Float</span><span class="summary-row-value">UGX 125,000</span></div>
          <div class="summary-row"><span class="summary-row-label">Expected Cash</span><span class="summary-row-value font-bold">${Utils.formatCurrency(today.expectedCash)}</span></div>
          <div class="summary-row"><span class="summary-row-label">Status</span><span class="summary-row-value text-success">✓ Balanced</span></div>
        </div>
      </div>
    </div>
  `;
};

// Weekly Report
window.SCREENS['weekly-report'] = function() {
  const weekly = Store.weeklySales;
  const totalSales = weekly.reduce((s, w) => s + w.sales, 0);

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back
        </div>
        <div class="topbar-title">Weekly Performance Report</div>
      </div>

      <div class="screen-body">
        <div class="card card-padded mb-6">
          <div class="text-xs text-muted font-bold uppercase tracking-wider mb-1">This Week Total Sales</div>
          <div class="text-3xl font-extrabold text-primary mb-4">${Utils.formatCurrency(totalSales)}</div>

          <div class="report-section-title">Daily Sales Trend</div>
          <div class="flex flex-col gap-2">
            ${weekly.map(w => `
              <div class="flex items-center gap-3">
                <span class="w-12 text-sm font-semibold">${w.day}</span>
                <div class="flex-1 progress-bar">
                  <div class="progress-fill success" style="width:${Math.round((w.sales/280000)*100)}%"></div>
                </div>
                <span class="text-sm font-bold w-24 text-right">${Utils.formatCurrency(w.sales).replace('UGX ','')}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
};

// Monthly Report
window.SCREENS['monthly-report'] = function() {
  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back
        </div>
        <div class="topbar-title">Monthly Performance Report</div>
      </div>

      <div class="screen-body">
        <div class="card card-padded mb-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="text-xs text-muted font-bold uppercase">August 2026 Sales</div>
              <div class="text-3xl font-extrabold text-primary">UGX 5,800,000</div>
            </div>
            <div class="text-right">
              <div class="badge badge-success" style="font-size:14px">▲ 20.8% Growth</div>
              <div class="text-xs text-muted mt-1">vs July (UGX 4.8M)</div>
            </div>
          </div>

          <div class="report-section-title">Monthly Comparison (Last 6 Months)</div>
          <div class="flex flex-col gap-3">
            ${Store.monthlySales.map(m => `
              <div class="flex items-center gap-3">
                <span class="w-12 text-sm font-semibold">${m.month}</span>
                <div class="flex-1 progress-bar">
                  <div class="progress-fill" style="width:${Math.round((m.sales/6000000)*100)}%"></div>
                </div>
                <span class="text-sm font-bold w-24 text-right">${Utils.formatCompact(m.sales)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
};
