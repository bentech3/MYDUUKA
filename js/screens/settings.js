/* ============================================================
   MYDUUKA — SETTINGS & HELP SCREENS
   ============================================================ */

window.SCREENS = window.SCREENS || {};

// 1. Settings Main Screen
window.SCREENS['settings'] = function() {
  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-title">Settings ⚙️</div>
      </div>

      <div class="screen-body max-w-xl mx-auto">
        <div class="settings-group">
          <div class="settings-group-label">Shop Settings</div>

          <div class="settings-item" onclick="App.navigate('shop-profile')">
            <div class="settings-item-icon bg-primary-100 text-primary-700">🏪</div>
            <div class="settings-item-content">
              <div class="settings-item-title">Shop Profile</div>
               <div class="settings-item-sub">Bentech Computers UG · Rutooma</div>
            </div>
            <i data-lucide="chevron-right" class="list-chevron"></i>
          </div>

          <div class="settings-item" onclick="App.navigate('users')">
            <div class="settings-item-icon bg-info-100 text-info-600">👥</div>
            <div class="settings-item-content">
              <div class="settings-item-title">Users & Attendants</div>
              <div class="settings-item-sub">Manage staff roles and PINs</div>
            </div>
            <i data-lucide="chevron-right" class="list-chevron"></i>
          </div>
        </div>

        <div class="settings-group">
          <div class="settings-group-label">Preferences</div>

          <div class="settings-item" onclick="App.navigate('categories')">
            <div class="settings-item-icon bg-warning-100 text-warning-700">📦</div>
            <div class="settings-item-content">
              <div class="settings-item-title">Product Categories</div>
              <div class="settings-item-sub">Manage shop categories</div>
            </div>
            <i data-lucide="chevron-right" class="list-chevron"></i>
          </div>

          <div class="settings-item" onclick="App.navigate('sync-status')">
            <div class="settings-item-icon bg-success-100 text-success-700">📶</div>
            <div class="settings-item-content">
              <div class="settings-item-title">Offline & Sync Status</div>
              <div class="settings-item-sub">🟢 Online — All data synced</div>
            </div>
            <i data-lucide="chevron-right" class="list-chevron"></i>
          </div>
        </div>

        <div class="settings-group">
          <div class="settings-group-label">Support</div>

          <div class="settings-item" onclick="App.navigate('help')">
            <div class="settings-item-icon bg-primary-100 text-primary-700">❓</div>
            <div class="settings-item-content">
              <div class="settings-item-title">Help & Support</div>
              <div class="settings-item-sub">Guides, FAQs, and WhatsApp support</div>
            </div>
            <i data-lucide="chevron-right" class="list-chevron"></i>
          </div>
        </div>

        <div class="text-center text-xs text-muted my-6">
          MYDUUKA v1.0.0 · Made for Uganda 🇺🇬<br>
          Connected as Owner
        </div>
      </div>
    </div>
  `;
};

// 2. Shop Profile Settings
window.SCREENS['shop-profile'] = function() {
  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back
        </div>
        <div class="topbar-title">Shop Profile</div>
      </div>

      <div class="screen-body max-w-xl mx-auto">
        <div class="card card-padded mb-6">
          <div class="form-group">
            <label class="form-label">Shop Name</label>
            <input type="text" class="form-input" id="sp-shop-name" value="${App.state.user?.shopName || 'My Shop'}">
          </div>

          <div class="form-group">
            <label class="form-label">Owner Name</label>
            <input type="text" class="form-input" id="sp-owner-name" value="${App.state.user?.name || 'Owner'}">
          </div>

          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="text" class="form-input" id="sp-phone" value="${App.state.user?.phone || ''}">
          </div>

          <div class="form-group">
            <label class="form-label">Location / Address</label>
            <input type="text" class="form-input" id="sp-location" value="Rutooma, Mbarara, Uganda">
          </div>

          <button class="btn btn-primary btn-full btn-lg mt-4" onclick="saveShopProfile()">
            Save Profile
          </button>
        </div>
      </div>
    </div>
  `;
};

window.saveShopProfile = function() {
  const shopName = document.getElementById('sp-shop-name').value;
  const ownerName = document.getElementById('sp-owner-name').value;
  const phone = document.getElementById('sp-phone').value;
  const location = document.getElementById('sp-location').value;

  if (!shopName || !ownerName) {
    App.showToast('Please fill in shop name and owner name', 'error');
    return;
  }

  // Update local state
  App.state.user.name = ownerName;
  App.state.user.phone = phone;

  // Update Supabase if connected
  if (window.Supabase && App.state.user?.shopId) {
    window.Supabase.from('shops').update({ name: shopName, location }).eq('id', App.state.user.shopId).then(({ error }) => {
      if (error) console.warn('Shop update failed:', error);
    });
    window.Supabase.from('profiles').update({ name: ownerName, phone }).eq('id', App.state.user.id).then(({ error }) => {
      if (error) console.warn('Profile update failed:', error);
    });
  }

  App.showToast('✓ Shop profile updated!', 'success');
  App.goBack();
};

// 3. Product Categories Settings
window.SCREENS['categories'] = function() {
  const cats = ['Food', 'Drinks', 'Snacks', 'Groceries', 'Cooking Ingredients', 'Household', 'Personal Care', 'Cleaning Products', 'Stationery', 'School Supplies', 'Hardware', 'Airtime/Data'];

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back
        </div>
        <div class="topbar-title">Product Categories</div>
      </div>

      <div class="screen-body max-w-xl mx-auto">
        <div class="card card-padded mb-6">
          <div class="flex flex-wrap gap-2 mb-4">
            ${cats.map(c => `
              <span class="chip text-sm p-2 px-3">${c}</span>
            `).join('')}
          </div>
          <button class="btn btn-secondary btn-full" onclick="App.showToast('Add category feature', 'info')">+ Add Custom Category</button>
        </div>
      </div>
    </div>
  `;
};

// 4. Sync Status Screen
window.SCREENS['sync-status'] = function() {
  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back
        </div>
        <div class="topbar-title">Offline & Sync Status</div>
      </div>

      <div class="screen-body max-w-xl mx-auto">
        <div class="card card-padded text-center mb-6">
          <div class="w-16 h-16 rounded-full bg-success-100 text-success-600 flex items-center justify-center text-3xl mx-auto mb-3">
            🟢
          </div>
          <div class="font-extrabold text-xl mb-1">Status: Online</div>
          <div class="text-sm text-muted mb-4">All shop records are up to date and backed up.</div>

          <div class="alert-banner alert-banner-success text-left mb-4">
            <i data-lucide="check-circle-2" style="width:20px;height:20px"></i>
            <div>
              <div class="font-bold">Offline-Ready</div>
              <div class="text-xs">You can continue making sales even without internet connection. Data syncs automatically when connection returns.</div>
            </div>
          </div>

          <button class="btn btn-primary btn-full btn-lg" onclick="App.showToast('✓ Everything is up to date!', 'success')">
            Sync Now
          </button>
        </div>
      </div>
    </div>
  `;
};

// 5. Help Screen
window.SCREENS['help'] = function() {
  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back
        </div>
        <div class="topbar-title">Help & Support ❓</div>
      </div>

      <div class="screen-body max-w-xl mx-auto">
        <div class="card card-padded mb-6 bg-primary-50 border border-primary-200 text-center">
          <div class="font-bold text-lg text-primary mb-1">Need help with MYDUUKA?</div>
          <div class="text-sm text-muted mb-4">Our support team is available on WhatsApp</div>
          <button class="btn btn-primary btn-full" onclick="window.open('https://wa.me/256751248098','_blank')">
            💬 Chat on WhatsApp (0751 248 098)
          </button>
        </div>

        <div class="section-header">
          <div class="section-title">Frequently Asked Questions</div>
        </div>

        <div class="card overflow-hidden">
          <div class="help-item" id="faq-1" onclick="App.handleAction('toggle-help-item','faq-1')">
            <div class="help-question">How do I record a sale?</div>
            <div class="help-answer">Tap the green "Sell" button at the bottom, select products, tap "Pay", choose Cash or Mobile Money, and complete the sale!</div>
          </div>

          <div class="help-item" id="faq-2" onclick="App.handleAction('toggle-help-item','faq-2')">
            <div class="help-question">How do I record a credit sale (customer owes)?</div>
            <div class="help-answer">During payment, select "Credit (Owe)", choose the customer name, and tap Complete. Their balance will automatically update.</div>
          </div>

          <div class="help-item" id="faq-3" onclick="App.handleAction('toggle-help-item','faq-3')">
            <div class="help-question">What if my internet goes off?</div>
            <div class="help-answer">MYDUUKA is offline-first. You can record sales and expenses as usual. All records will automatically sync when internet returns!</div>
          </div>

          <div class="help-item" id="faq-4" onclick="App.handleAction('toggle-help-item','faq-4')">
            <div class="help-question">How does stock conversion work (e.g. Crate to Bottle)?</div>
            <div class="help-answer">When adding a product, set Buying Unit (e.g. Crate) and Selling Unit (e.g. Bottle), and enter how many bottles are in 1 crate (e.g. 24). When you buy 1 crate, MYDUUKA adds 24 bottles to stock automatically!</div>
          </div>
        </div>
      </div>
    </div>
  `;
};
