/* ============================================================
   MYDUUKA — MONEY & EXPENSES SCREENS
   ============================================================ */

window.SCREENS = window.SCREENS || {};

// Money overview screen
window.SCREENS['money'] = function() {
  const today = Store.getToday();
  const credit = Store.getCreditSummary();

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-title">Money 💰</div>
        <div class="topbar-actions">
          <button class="btn btn-sm btn-primary" onclick="App.navigate('close-day')">
            <i data-lucide="moon" style="width:16px;height:16px"></i> Close Day
          </button>
        </div>
      </div>

      <div class="screen-body">
        <!-- Sales Total Banner -->
        <div class="kpi-card kpi-primary mb-5">
          <div class="kpi-label">Today's Total Cash In flow</div>
          <div class="kpi-value large">${Utils.formatCurrency(today.totalSales)}</div>
          <div class="kpi-sub">${today.transactions} completed transactions today</div>
        </div>

        <!-- Breakdown Card -->
        <div class="section-header">
          <div class="section-title">Money Breakdown</div>
        </div>

        <div class="money-breakdown mb-6">
          <div class="money-row">
            <div class="money-row-icon bg-success-100 text-success-700">💵</div>
            <div class="money-row-label">Cash Received Today</div>
            <div class="money-row-value positive">${Utils.formatCurrency(today.cashSales)}</div>
          </div>

          <div class="money-row">
            <div class="money-row-icon bg-info-100 text-info-600">📱</div>
            <div class="money-row-label">Mobile Money Received</div>
            <div class="money-row-value positive">${Utils.formatCurrency(today.mmSales)}</div>
          </div>

          <div class="money-row" onclick="App.navigate('customers')">
            <div class="money-row-icon bg-warning-100 text-warning-700">📝</div>
            <div class="money-row-label">Credit Given (Customers Owe)</div>
            <div class="money-row-value negative">${Utils.formatCurrency(today.creditSales)}</div>
          </div>

          <div class="money-row" onclick="App.navigate('expenses')">
            <div class="money-row-icon bg-danger-100 text-danger-600">🧾</div>
            <div class="money-row-label">Expenses Paid Today</div>
            <div class="money-row-value negative">-${Utils.formatCurrency(today.expenses)}</div>
          </div>
        </div>

        <!-- Cash Drawer Reconciliation Box -->
        <div class="card card-padded mb-6 border-2 border-primary-200">
          <div class="flex items-center justify-between mb-3">
            <div>
              <div class="font-bold text-lg">Expected Cash in Drawer</div>
              <div class="text-xs text-muted">Sales cash + opening float (UGX 125,000)</div>
            </div>
            <div class="text-2xl font-extrabold text-primary">${Utils.formatCurrency(today.expectedCash)}</div>
          </div>
          <button class="btn btn-secondary btn-full" onclick="App.navigate('cash-reconciliation')">
            <i data-lucide="calculator" style="width:18px;height:18px"></i> Count & Reconcile Cash Drawer
          </button>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-2 gap-3 mb-6">
          <button class="btn btn-surface p-4 flex flex-col items-center gap-2" onclick="App.navigate('add-expense')">
            <div class="w-10 h-10 rounded-lg bg-danger-100 text-danger-600 flex items-center justify-center text-xl">📝</div>
            <div class="font-semibold text-sm">Add Expense</div>
          </button>

          <button class="btn btn-surface p-4 flex flex-col items-center gap-2" onclick="App.navigate('receive-payment')">
            <div class="w-10 h-10 rounded-lg bg-accent-100 text-accent-700 flex items-center justify-center text-xl">🤝</div>
            <div class="font-semibold text-sm">Collect Debt</div>
          </button>
        </div>
      </div>
    </div>
  `;
};

// Expenses Screen
window.SCREENS['expenses'] = function() {
  const expenses = Store.expenses;
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back
        </div>
        <div class="topbar-title">Expenses 📝</div>
        <div class="topbar-actions">
          <button class="btn btn-sm btn-primary" onclick="App.navigate('add-expense')">+ Add</button>
        </div>
      </div>

      <div class="screen-body">
        <div class="kpi-card kpi-accent mb-5">
          <div class="kpi-label">Total Expenses Recorded</div>
          <div class="kpi-value large">${Utils.formatCurrency(total)}</div>
          <div class="kpi-sub">${expenses.length} expense items</div>
        </div>

        <div class="section-header">
          <div class="section-title">Expense Log</div>
        </div>

        <div class="card overflow-hidden">
          ${expenses.map(e => `
            <div class="list-item">
              <div class="list-item-avatar" style="background:var(--color-danger-100);color:var(--color-danger-700)">
                💸
              </div>
              <div class="list-item-content">
                <div class="list-item-title">${Utils.escapeHtml(e.category)}</div>
                <div class="list-item-sub">${Utils.escapeHtml(e.desc || 'No description')} · ${Utils.formatDateShort(e.date)}</div>
              </div>
              <div class="list-item-right">
                <div class="list-item-value text-danger">-${Utils.formatCurrency(e.amount)}</div>
                <span class="badge badge-neutral">${e.payment}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
};

// Add Expense Screen
window.SCREENS['add-expense'] = function() {
  let selectedCategory = 'Electricity';

  window.selectExpenseCat = function(cat) {
    selectedCategory = cat;
    document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
    const btn = document.getElementById(`cat-${cat}`);
    if (btn) btn.classList.add('active');
  };

  window.saveExpenseForm = function() {
    const amount = parseInt(document.getElementById('exp-amount').value || 0);
    const desc = document.getElementById('exp-desc').value;
    const payment = document.getElementById('exp-payment').value;

    if (amount <= 0) {
      App.showToast('Please enter a valid expense amount', 'error');
      return;
    }

    App.handleAction('add-expense-save', { category: selectedCategory, amount, payment, desc });
  };

  const categories = ['Electricity', 'Water', 'Transport', 'Airtime', 'Internet', 'Rent', 'Wages', 'Packaging', 'Repairs', 'Other'];

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back
        </div>
        <div class="topbar-title">Add Expense 📝</div>
      </div>

      <div class="screen-body">
        <div class="card card-padded mb-6">
          <div class="form-group">
            <label class="form-label">Category</label>
            <div class="filter-tabs flex-wrap gap-2">
              ${categories.map(c => `
                <div class="filter-tab cat-chip ${c === 'Electricity' ? 'active' : ''}" 
                     id="cat-${c}" 
                     onclick="selectExpenseCat('${c}')">
                  ${c}
                </div>
              `).join('')}
            </div>
          </div>

          <div class="form-group mt-4">
            <label class="form-label">Amount (UGX)</label>
            <input type="number" class="form-input text-2xl font-bold text-primary" id="exp-amount" placeholder="e.g. 10000">
          </div>

          <div class="form-group">
            <label class="form-label">Payment Method</label>
            <select class="form-select" id="exp-payment">
              <option>Cash</option>
              <option>Mobile Money</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Description / Note</label>
            <input type="text" class="form-input" id="exp-desc" placeholder="e.g. UMEME Token for August">
          </div>

          <button class="btn btn-primary btn-full btn-lg mt-4" onclick="saveExpenseForm()">
            Save Expense
          </button>
        </div>
      </div>
    </div>
  `;
};
