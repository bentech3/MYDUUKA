/* ============================================================
   MYDUUKA — USERS & ACTIVITY LOG
   ============================================================ */

window.SCREENS = window.SCREENS || {};

// Users Screen
window.SCREENS['users'] = function() {
  const users = Store.users;

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-title">Users & Attendants 👥</div>
        <div class="topbar-actions">
          <button class="btn btn-sm btn-primary" onclick="App.showToast('Add user dialog', 'info')">+ User</button>
        </div>
      </div>

      <div class="screen-body">
        <div class="flex flex-col gap-4 mb-6">
          ${users.map(u => `
            <div class="user-card" onclick="App.navigate('activity-log')">
              <div class="user-card-avatar" style="background:${u.color}">${Utils.initials(u.name)}</div>
              <div class="user-card-info">
                <div class="user-card-name">${Utils.escapeHtml(u.name)}</div>
                <div class="user-card-role">${u.role} · ${u.phone}</div>
                <div class="user-card-status">PIN: ${u.pin} · Active</div>
              </div>
              <span class="badge ${u.role==='Owner'?'badge-primary':u.role==='Manager'?'badge-info':'badge-neutral'}">${u.role}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
};

// Activity Log Screen
window.SCREENS['activity-log'] = function() {
  const logs = Store.activityLog;

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back
        </div>
        <div class="topbar-title">Activity Audit Log 🕒</div>
      </div>

      <div class="screen-body">
        <div class="card card-padded mb-6">
          <div class="text-xs text-muted font-bold uppercase tracking-wider mb-4">Real-time Shop Activity</div>

          ${logs.map(l => `
            <div class="activity-item">
              <div class="activity-dot-col">
                <div class="activity-dot"></div>
                <div class="activity-line"></div>
              </div>
              <div class="activity-content">
                <div class="activity-text">
                  <strong>${l.user}</strong> — ${l.action}
                </div>
                <div class="activity-amount">${l.detail}</div>
                <div class="activity-time">${Utils.formatTime12(l.time)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
};
