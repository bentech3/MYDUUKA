/* ============================================================
   MYDUUKA — CUSTOMERS & CREDIT MODULE
   ============================================================ */

window.SCREENS = window.SCREENS || {};

// 1. Customers List Screen
window.SCREENS['customers'] = function() {
  const summary = Store.getCreditSummary();
  const customers = Store.customers;

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-title">Customers & Debt 👥</div>
        <div class="topbar-actions">
          <button class="btn btn-sm btn-primary" onclick="App.navigate('add-customer')">+ Add Customer</button>
        </div>
      </div>

      <div class="screen-body">
        <!-- Banner -->
        <div class="customer-balance-banner">
          <div class="customer-balance-label">Total Debt Owed by Customers</div>
          <div class="customer-balance-value">${Utils.formatCurrency(summary.total)}</div>
          <div class="customer-count">${summary.owing} customers currently owe money</div>
        </div>

        <div class="filter-tabs mb-4">
          <div class="filter-tab active" onclick="
            document.querySelectorAll('.filter-tab').forEach(t=>t.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.cust-item').forEach(i=>i.style.display='flex');
          ">All Customers (${customers.length})</div>

          <div class="filter-tab" onclick="
            document.querySelectorAll('.filter-tab').forEach(t=>t.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.cust-item').forEach(i=>{
              i.style.display = parseInt(i.dataset.balance) > 0 ? 'flex' : 'none';
            });
          ">Owing Money (${summary.owing})</div>
        </div>

        <!-- Customer List -->
        <div class="card overflow-hidden">
          ${customers.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">👥</div>
              <div class="empty-title">No customers yet</div>
              <div class="empty-desc">Add your first customer to start tracking credit</div>
              <button class="btn btn-primary mt-4" onclick="App.navigate('add-customer')">+ Add Customer</button>
            </div>
          ` : customers.map((c, idx) => `
            <div class="list-item cust-item" data-balance="${c.balance}" onclick="App.navigate('customer-detail', {id:'${c.id}'})">
              <div class="list-item-avatar" style="background:${Utils.avatarColor(idx)};color:white">
                ${Utils.initials(c.name)}
              </div>
              <div class="list-item-content">
                <div class="list-item-title">${Utils.escapeHtml(c.name)}</div>
                <div class="list-item-sub">${c.phone} · ${Utils.timeAgo(c.lastTx)}</div>
              </div>
              <div class="list-item-right">
                <div class="list-item-value ${c.balance > 0 ? 'text-danger' : 'text-success'}">
                  ${c.balance > 0 ? `Owes ${Utils.formatCurrency(c.balance)}` : '✓ Cleared'}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
};

// 2. Customer Details Screen
window.SCREENS['customer-detail'] = function(params) {
  const customer = Store.customers.find(c => c.id === (params && params.id)) || Store.customers[0];

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back
        </div>
        <div class="topbar-title">${Utils.escapeHtml(customer.name)}</div>
      </div>

      <div class="screen-body max-w-xl mx-auto">
        <div class="card card-padded mb-5 text-center">
          <div class="w-16 h-16 rounded-full bg-primary-700 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-3">
            ${Utils.initials(customer.name)}
          </div>
          <div class="font-extrabold text-xl mb-1">${Utils.escapeHtml(customer.name)}</div>
          <div class="text-sm text-muted mb-4">${customer.phone}</div>

          <div class="p-4 bg-neutral-100 rounded-xl mb-4">
            <div class="text-xs text-muted uppercase tracking-wider font-semibold">Current Balance</div>
            <div class="text-3xl font-extrabold ${customer.balance > 0 ? 'text-danger' : 'text-success'} mt-1">
              ${customer.balance > 0 ? `Owes ${Utils.formatCurrency(customer.balance)}` : 'UGX 0 (No Debt)'}
            </div>
          </div>

          <button class="btn btn-success btn-full btn-lg" onclick="App.navigate('receive-payment', {customerId:'${customer.id}'})">
            💰 Collect Debt Payment
          </button>
        </div>

        <div class="section-header">
          <div class="section-title">Credit History</div>
        </div>

        <div class="card overflow-hidden">
          ${(customer.transactions || []).map(t => `
            <div class="list-item">
              <div class="list-item-avatar" style="background:${t.type==='credit'?'var(--color-danger-100)':'var(--color-success-100)'}">
                ${t.type === 'credit' ? '📝' : '💵'}
              </div>
              <div class="list-item-content">
                <div class="list-item-title">${t.desc}</div>
                <div class="list-item-sub">${Utils.formatDate(t.date)}</div>
              </div>
              <div class="list-item-right">
                <div class="list-item-value ${t.type==='credit'?'text-danger':'text-success'}">
                  ${t.type==='credit'?'+':'-'}${Utils.formatCurrency(t.amount)}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
};

// 3. Receive Credit Payment Screen
window.SCREENS['receive-payment'] = function(params) {
  const customerId = params && params.customerId;
  const customer = Store.customers.find(c => c.id === customerId) || Store.customers[0];

  window.savePaymentForm = function() {
    const custId = document.getElementById('pay-cust-select').value;
    const amount = parseFloat(document.getElementById('pay-amount').value || 0);
    const method = document.getElementById('pay-method').value;

    if (amount <= 0) {
      App.showToast('Please enter payment amount', 'error');
      return;
    }

    Store.receiveCreditPayment(custId, amount, method);
    App.showToast('✓ Payment recorded successfully!', 'success');
    App.navigate('customers');
  };

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back
        </div>
        <div class="topbar-title">Receive Payment 💰</div>
      </div>

      <div class="screen-body max-w-xl mx-auto">
        <div class="card card-padded mb-6">
          <div class="form-group">
            <label class="form-label">Select Customer</label>
            <select class="form-select" id="pay-cust-select">
              ${Store.customers.map(c => `
                <option value="${c.id}" ${c.id === customer.id ? 'selected' : ''}>
                  ${c.name} — Owes: ${Utils.formatCurrency(c.balance)}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Amount Received (UGX)</label>
            <input type="number" class="form-input text-xl font-bold text-success" id="pay-amount" placeholder="e.g. 10000" value="${customer.balance}">
          </div>

          <div class="form-group">
            <label class="form-label">Payment Method</label>
            <select class="form-select" id="pay-method">
              <option>Cash</option>
              <option>Mobile Money</option>
            </select>
          </div>

          <button class="btn btn-success btn-full btn-lg mt-4" onclick="savePaymentForm()">
            Save Payment & Update Balance
          </button>
        </div>
      </div>
    </div>
  `;
};

// 4. Add Customer Form
window.SCREENS['add-customer'] = function() {
  window.saveCustomerForm = function() {
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const notes = document.getElementById('cust-notes').value;

    if (!name) {
      App.showToast('Please enter customer name', 'error');
      return;
    }

    const c = Store.addCustomer(name, phone, notes);
    App.showToast('✓ Customer added!', 'success');
    App.navigate('customer-detail', { id: c.id });
  };

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back
        </div>
        <div class="topbar-title">Add Customer 👤</div>
      </div>

      <div class="screen-body max-w-xl mx-auto">
        <div class="card card-padded mb-6">
          <div class="form-group">
            <label class="form-label">Customer Name</label>
            <input type="text" class="form-input" id="cust-name" placeholder="e.g. John Okello">
          </div>

          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="text" class="form-input" id="cust-phone" placeholder="e.g. 0772 123 456">
          </div>

          <div class="form-group">
            <label class="form-label">Notes (Optional)</label>
            <textarea class="form-textarea" id="cust-notes" placeholder="e.g. Pays at end of every month"></textarea>
          </div>

          <button class="btn btn-primary btn-full btn-lg mt-4" onclick="saveCustomerForm()">
            Save Customer
          </button>
        </div>
      </div>
    </div>
  `;
};
