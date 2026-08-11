/* ============================================================
   MYDUUKA — ALERTS & NOTIFICATIONS
   ============================================================ */

window.SCREENS = window.SCREENS || {};

window.SCREENS['alerts'] = function() {
  const alerts = Store.getAlerts();

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-title">Alerts & Notifications 🔔</div>
      </div>

      <div class="screen-body">
        <div class="section-header">
          <div class="section-title">Active System Alerts</div>
          <div class="section-link" onclick="App.showToast('All alerts marked read', 'success')">Mark Read</div>
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

          <div class="alert-card critical" onclick="App.navigate('stock')">
            <div class="alert-icon-wrap">🥛</div>
            <div class="flex-1">
              <div class="alert-card-title">Milk is Out of Stock</div>
              <div class="alert-card-desc">0 packets remaining. Restock from Pearl Dairy.</div>
            </div>
            <i data-lucide="chevron-right" class="list-chevron"></i>
          </div>

          <div class="alert-card warning" onclick="App.navigate('customers')">
            <div class="alert-icon-wrap">👤</div>
            <div class="flex-1">
              <div class="alert-card-title">Grace Apio Debt Overdue</div>
              <div class="alert-card-desc">Owes UGX 22,000 for 4 days. Consider sending a gentle reminder.</div>
            </div>
            <i data-lucide="chevron-right" class="list-chevron"></i>
          </div>
        </div>
      </div>
    </div>
  `;
};

window.SCREENS['notifications'] = function() {
  const notifications = Store.getNotifications();

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back
        </div>
        <div class="topbar-title">Notifications 🔔</div>
        <div class="topbar-actions">
          <div class="section-link" onclick="App.showToast('All notifications marked read', 'success')">Mark Read</div>
        </div>
      </div>

      <div class="screen-body">
        <div class="flex flex-col gap-3">
          ${notifications.map(n => `
            <div class="card card-padded ${n.unread ? 'border-l-4 border-l-primary-500' : ''}">
              <div class="flex items-start gap-3">
                <div class="text-2xl flex-shrink-0">${n.type === 'warning' ? '⚠️' : n.type === 'success' ? '✅' : n.type === 'danger' ? '🚨' : 'ℹ️'}</div>
                <div class="flex-1">
                  <div class="font-bold text-sm mb-1">${Utils.escapeHtml(n.title)}</div>
                  <div class="text-sm text-muted mb-2">${Utils.escapeHtml(n.body)}</div>
                  <div class="text-xs text-muted">${Utils.timeAgo(n.time)}</div>
                </div>
                ${n.unread ? '<span class="badge badge-primary flex-shrink-0">New</span>' : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
};
