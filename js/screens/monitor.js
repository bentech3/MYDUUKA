/* ============================================================
   MYDUUKA — BUSINESS MONITOR MODULE
   Auto-detects business risks and opportunities
   ============================================================ */

window.SCREENS = window.SCREENS || {};

window.SCREENS['monitor'] = function() {
  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-title">Business Monitor 🔎</div>
      </div>

      <div class="screen-body">
        <!-- Health Score Ring -->
        <div class="card card-padded text-center mb-6">
          <div class="monitor-score-ring mb-3">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-neutral-200)" stroke-width="10"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-primary-600)" stroke-width="10" stroke-dasharray="314" stroke-dashoffset="70" stroke-linecap="round"/>
            </svg>
            <div class="monitor-score-value">
              <span class="monitor-score-number">78</span>
              <span class="monitor-score-label">Health Score</span>
            </div>
          </div>

          <div class="font-extrabold text-lg">Business Status: GOOD 🟢</div>
          <div class="text-sm text-muted max-w-xs mx-auto mt-1">
            Your shop is growing well with strong sales. A few inventory items require attention.
          </div>
        </div>

        <!-- Monitoring Checks -->
        <div class="section-header">
          <div class="section-title">Automated Business Health Checks</div>
        </div>

        <div class="flex flex-col gap-3 mb-6">
          <!-- Critical -->
          <div class="alert-card critical" onclick="App.navigate('money')">
            <div class="alert-icon-wrap">🔴</div>
            <div class="flex-1">
              <div class="alert-card-title text-danger">Possible Cash Shortage Warning</div>
              <div class="alert-card-desc">Expected cash in drawer is UGX 235,000. Reconcile drawer to verify no shortage.</div>
            </div>
            <i data-lucide="chevron-right" class="list-chevron"></i>
          </div>

          <!-- Warning -->
          <div class="alert-card warning" onclick="App.navigate('stock')">
            <div class="alert-icon-wrap">🟠</div>
            <div class="flex-1">
              <div class="alert-card-title text-warning">Low Inventory Alert</div>
              <div class="alert-card-desc">Soap (4 bars) and Batteries (2 packs) are running dangerously low.</div>
            </div>
            <i data-lucide="chevron-right" class="list-chevron"></i>
          </div>

          <!-- Warning -->
          <div class="alert-card caution" onclick="App.navigate('customers')">
            <div class="alert-icon-wrap">🟡</div>
            <div class="flex-1">
              <div class="alert-card-title text-accent">Customer Credit Rising</div>
              <div class="alert-card-desc">Credit given this week increased by 18%. Total owed: UGX 49,000.</div>
            </div>
            <i data-lucide="chevron-right" class="list-chevron"></i>
          </div>

          <!-- Good -->
          <div class="alert-card good" onclick="App.navigate('reports')">
            <div class="alert-icon-wrap">🟢</div>
            <div class="flex-1">
              <div class="alert-card-title text-success">Sales Growth (+20.8%)</div>
              <div class="alert-card-desc">Monthly sales are UGX 5.8M compared to UGX 4.8M last month.</div>
            </div>
            <i data-lucide="chevron-right" class="list-chevron"></i>
          </div>
        </div>
      </div>
    </div>
  `;
};
