/* ============================================================
   MYDUUKA — CLOSE DAY & CASH RECONCILIATION
   ============================================================ */

window.SCREENS = window.SCREENS || {};

// 1. Close Day Overview
window.SCREENS['close-day'] = function() {
  const today = Store.getToday();

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-title">Close Day 🌙</div>
      </div>

      <div class="screen-body max-w-xl mx-auto">
        <div class="reconcile-header mb-5">
          <div class="reconcile-expected">Today Total Sales</div>
          <div class="reconcile-amount">${Utils.formatCurrency(today.totalSales)}</div>
          <div class="text-xs opacity-80 mt-1">${today.transactions} sales completed today</div>
        </div>

        <div class="card card-padded mb-6">
          <div class="font-bold text-base mb-3">Daily Closing Checklist</div>

          <div class="summary-row">
            <span class="summary-row-label">1. Sales Recorded</span>
            <span class="summary-row-value text-success font-bold">✓ Complete (${Utils.formatCurrency(today.totalSales)})</span>
          </div>

          <div class="summary-row">
            <span class="summary-row-label">2. Expenses Recorded</span>
            <span class="summary-row-value text-success font-bold">✓ Complete (-${Utils.formatCurrency(today.expenses)})</span>
          </div>

          <div class="summary-row">
            <span class="summary-row-label">3. Count Cash Drawer</span>
            <span class="summary-row-value text-warning font-bold">Pending Count</span>
          </div>
        </div>

        <button class="btn btn-primary btn-full btn-xl mb-4" onclick="App.navigate('cash-reconciliation')">
          💵 Count Cash in Drawer
        </button>

        <button class="btn btn-secondary btn-full btn-lg" onclick="App.navigate('daily-report')">
          📊 Generate Daily Summary Report
        </button>
      </div>
    </div>
  `;
};

// 2. Cash Reconciliation Screen (Denomination Counter)
window.SCREENS['cash-reconciliation'] = function() {
  const expected = 235000;

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back
        </div>
        <div class="topbar-title">Count Cash Drawer 💵</div>
      </div>

      <div class="screen-body max-w-xl mx-auto">
        <div class="alert-banner alert-banner-info mb-5">
          <div>
            <div class="font-bold text-base">Expected Cash in Drawer: ${Utils.formatCurrency(expected)}</div>
            <div class="text-xs">Count your notes and coins by denomination below:</div>
          </div>
        </div>

        <div class="card card-padded mb-6">
          <div class="denomination-table">
            ${[
              { note: 'UGX 50,000', val: 50000 },
              { note: 'UGX 20,000', val: 20000 },
              { note: 'UGX 10,000', val: 10000 },
              { note: 'UGX 5,000',  val: 5000 },
              { note: 'UGX 2,000',  val: 2000 },
              { note: 'UGX 1,000',  val: 1000 },
              { note: 'UGX 500',    val: 500 },
              { note: 'Coins',      val: 100 },
            ].map(d => `
              <div class="denomination-row">
                <div class="denomination-note">${d.note}</div>
                <input type="number" class="denomination-input" id="denom-${d.val}" placeholder="0" min="0" oninput="App.handleAction('update-denom-total')">
                <div class="denomination-total" id="denom-total-${d.val}">UGX 0</div>
              </div>
            `).join('')}
          </div>

          <div class="divider my-4"></div>

          <div class="summary-row">
            <span class="summary-row-label font-bold text-base">Total Counted Cash</span>
            <span class="summary-row-value total" id="total-counted">UGX 0</span>
          </div>

          <div class="summary-row">
            <span class="summary-row-label">Difference (Expected vs Counted)</span>
            <span class="summary-row-value font-bold" id="cash-difference">UGX 0</span>
          </div>

          <button class="btn btn-primary btn-full btn-lg mt-6" onclick="
            App.showToast('✓ Cash count saved successfully', 'success');
            App.navigate('daily-report');
          ">
            Save Cash Count & Finish
          </button>
        </div>
      </div>
    </div>
  `;
};
