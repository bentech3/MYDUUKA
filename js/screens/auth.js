/* ============================================================
   MYDUUKA — AUTH & ONBOARDING SCREENS
   Email OTP login via Supabase Auth
   ============================================================ */

window.SCREENS = window.SCREENS || {};

// 1. Splash / Welcome Screen
window.SCREENS['splash'] = function() {
  return `
    <div class="splash-screen">
      <div class="splash-bg-circle-1"></div>
      <div class="splash-bg-circle-2"></div>
      <div class="splash-bg-circle-3"></div>
      
      <div class="splash-content">
        <img src="assets/logo.svg" alt="MYDUUKA logo" style="width: 260px; max-width: 78vw; display: block; margin: 0 auto 12px; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.18));">
        <div class="splash-tagline splash-subtitle" style="margin-top: 10px;">Your simple digital shop assistant</div>

        <div class="splash-loader" style="margin-top:var(--space-8)">
          <button class="btn btn-surface btn-full" style="background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.3)" onclick="App.navigate('login')">
            Log In
          </button>
          <button class="btn btn-primary btn-full" onclick="App.navigate('onboarding-1')">
            Set Up New Shop
          </button>
        </div>
      </div>
      
      <div class="splash-version">v1.0.0 · Designed for Uganda</div>
    </div>
  `;
};

// 2. Email Login Screen
window.SCREENS['login'] = function() {
  let email = '';
  let code = '';
  let phase = 'email'; // email | code | loading

  window.sendOtp = async function() {
    const raw = document.getElementById('login-email').value.trim();
    if (!raw || !raw.includes('@')) {
      App.showToast('Please enter a valid email address', 'error');
      return;
    }
    email = raw;
    phase = 'loading';
    render();

    try {
      const { error } = await window.Supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      App.showToast('OTP sent to ' + email, 'success');
      phase = 'code';
    } catch (err) {
      App.showToast(err.message || 'Failed to send OTP', 'error');
      phase = 'email';
    }
    render();
  };

  window.verifyOtp = async function() {
    const raw = document.getElementById('login-code').value.trim();
    if (raw.length < 4) {
      App.showToast('Please enter the 6-digit code', 'error');
      return;
    }
    phase = 'loading';
    render();

    try {
      const { data, error } = await window.Supabase.auth.verifyOtp({ email, token: raw, type: 'email' });
      if (error) throw error;
      await App.onLoginSuccess(data.session);
    } catch (err) {
      App.showToast(err.message || 'Invalid code', 'error');
      phase = 'code';
      render();
    }
  };

  function render() {
    const container = document.getElementById('login-form-area');
    if (!container) return;

    if (phase === 'email') {
      container.innerHTML = `
        <div class="login-form-title">Enter your email address</div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" id="login-email" class="form-input" placeholder="e.g. ben@bentech.co.ug" value="${email}" autocomplete="email">
          <div class="text-xs text-muted mt-1">We will send you a 6-digit code via email</div>
        </div>
        <button class="btn btn-primary btn-full btn-lg" onclick="sendOtp()">Send Code</button>
      `;
    } else if (phase === 'code') {
      container.innerHTML = `
        <div class="login-form-title">Enter verification code</div>
        <div class="form-group">
          <label class="form-label">6-Digit Code</label>
          <input type="text" id="login-code" class="form-input text-center text-2xl tracking-widest" placeholder="000000" maxlength="6" value="${code}" autocomplete="one-time-code">
          <div class="text-xs text-muted mt-1">Sent to ${email}</div>
        </div>
        <button class="btn btn-primary btn-full btn-lg" onclick="verifyOtp()">Verify & Log In</button>
        <button class="btn btn-surface btn-full mt-3" onclick="phase='email';render()">Change Email</button>
      `;
    } else if (phase === 'loading') {
      container.innerHTML = `
        <div class="text-center py-8">
          <div class="inline-block w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <div class="text-sm text-white opacity-80">Sending code...</div>
        </div>
      `;
    }
  }

  return `
    <div class="auth-screen">
      <div class="auth-decoration">
        <div class="splash-logo-mark">
          <span style="font-size:36px;font-weight:800;color:white">M</span>
        </div>
        <div class="text-center text-white">
          <h1 class="text-2xl font-extrabold mb-1">MYDUUKA</h1>
          <p class="text-sm opacity-80">Simple Digital Shop Assistant</p>
        </div>
      </div>

      <div class="auth-card">
        <div id="login-form-area"></div>
      </div>
    </div>
  `;
};

// 3. Onboarding Step 1
window.SCREENS['onboarding-1'] = function() {
  return `
    <div class="onboarding-screen">
      <div class="onboarding-header">
        <div class="onboarding-progress">
          <div class="onboarding-step-dot active"></div>
          <div class="onboarding-step-dot"></div>
          <div class="onboarding-step-dot"></div>
          <div class="onboarding-step-dot"></div>
        </div>
        <h1 class="text-2xl font-extrabold text-white">Welcome to MYDUUKA</h1>
        <p class="text-sm opacity-80 text-white mt-1">Your simple digital shop assistant</p>
      </div>

      <div class="onboarding-body text-center flex flex-col items-center justify-center py-8">
        <div class="w-24 h-24 rounded-2xl bg-primary-100 flex items-center justify-center text-4xl mb-6 shadow-md">
          🏪
        </div>
        <h2 class="text-xl font-bold mb-2">Record sales in seconds</h2>
        <p class="text-sm text-muted max-w-xs leading-relaxed mb-6">
          You record simple daily sales, stock, and expenses. MYDUUKA monitors profit, debts, and inventory automatically.
        </p>

        <div class="alert-banner alert-banner-success text-left max-w-xs mb-6">
          <i data-lucide="check-circle" style="width:20px;height:20px"></i>
          <div>
            <div class="font-semibold">Works Offline</div>
            <div class="text-xs">No internet needed to record daily sales!</div>
          </div>
        </div>
      </div>

      <div class="onboarding-footer">
        <button class="btn btn-primary btn-full btn-lg" onclick="App.navigate('onboarding-2')">
          Get Started <i data-lucide="arrow-right" style="width:20px;height:20px"></i>
        </button>
      </div>
    </div>
  `;
};

// 4. Onboarding Step 2: Shop Info
window.SCREENS['onboarding-2'] = function() {
  return `
    <div class="onboarding-screen">
      <div class="onboarding-header">
        <div class="onboarding-progress">
          <div class="onboarding-step-dot done"></div>
          <div class="onboarding-step-dot active"></div>
          <div class="onboarding-step-dot"></div>
          <div class="onboarding-step-dot"></div>
        </div>
        <h1 class="text-xl font-bold text-white">Shop Details</h1>
        <p class="text-xs opacity-80 text-white">Tell us about your business</p>
      </div>

      <div class="onboarding-body">
        <div class="form-group">
          <label class="form-label">Shop Name</label>
          <input type="text" class="form-input" id="ob-shop-name" value="">
        </div>

        <div class="form-group">
          <label class="form-label">Owner Name</label>
          <input type="text" class="form-input" id="ob-owner-name" value="">
        </div>

        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input type="text" class="form-input" id="ob-phone" value="">
        </div>

        <div class="form-group">
          <label class="form-label">Location</label>
          <input type="text" class="form-input" id="ob-location" value="">
        </div>

        <div class="form-group">
          <label class="form-label">Shop Type</label>
          <select class="form-select" id="ob-shop-type">
            <option selected>Retail Shop</option>
            <option>Kiosk</option>
            <option>Grocery</option>
            <option>Stationery</option>
            <option>Mini Supermarket</option>
            <option>Household Shop</option>
            <option>Hardware</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div class="onboarding-footer">
        <button class="btn btn-surface" onclick="App.navigate('onboarding-1')">Back</button>
        <button class="btn btn-primary flex-1 btn-lg" onclick="App.navigate('onboarding-3')">Continue</button>
      </div>
    </div>
  `;
};

// 5. Onboarding Step 3: Currency
window.SCREENS['onboarding-3'] = function() {
  return `
    <div class="onboarding-screen">
      <div class="onboarding-header">
        <div class="onboarding-progress">
          <div class="onboarding-step-dot done"></div>
          <div class="onboarding-step-dot done"></div>
          <div class="onboarding-step-dot active"></div>
          <div class="onboarding-step-dot"></div>
        </div>
        <h1 class="text-xl font-bold text-white">Select Currency</h1>
        <p class="text-xs opacity-80 text-white">Default currency for your shop</p>
      </div>

      <div class="onboarding-body">
        <div class="card card-padded mb-4 border-2 border-primary-500 bg-primary-50 flex items-center justify-between cursor-pointer">
          <div class="flex items-center gap-3">
            <span style="font-size:28px">🇺🇬</span>
            <div>
              <div class="font-bold text-lg text-primary">Ugandan Shilling — UGX</div>
              <div class="text-xs text-muted">Example: UGX 25,000</div>
            </div>
          </div>
          <i data-lucide="check-circle-2" style="width:24px;height:24px;color:var(--color-primary-700)"></i>
        </div>

        <div class="text-xs text-muted mb-4">MYDUUKA is optimized for Uganda with automatic UGX formatting.</div>
      </div>

      <div class="onboarding-footer">
        <button class="btn btn-surface" onclick="App.navigate('onboarding-2')">Back</button>
        <button class="btn btn-primary flex-1 btn-lg" onclick="App.navigate('onboarding-4')">Continue</button>
      </div>
    </div>
  `;
};

// 6. Onboarding Step 4: Complete
window.SCREENS['onboarding-4'] = function() {
  return `
    <div class="onboarding-screen">
      <div class="onboarding-header">
        <div class="onboarding-progress">
          <div class="onboarding-step-dot done"></div>
          <div class="onboarding-step-dot done"></div>
          <div class="onboarding-step-dot done"></div>
          <div class="onboarding-step-dot active"></div>
        </div>
        <h1 class="text-xl font-bold text-white">Setup Complete!</h1>
        <p class="text-xs opacity-80 text-white">Your shop is ready to go</p>
      </div>

      <div class="onboarding-body text-center flex flex-col items-center justify-center py-8">
        <div class="success-icon-wrap">
          <i data-lucide="check" class="success-icon"></i>
        </div>
        <h2 class="text-2xl font-extrabold mb-2">Your Shop is Ready!</h2>
        <p class="text-sm text-muted max-w-xs mb-6">
          Your shop is ready. Add your own products, suppliers, customers, and sales records from here.
        </p>

        <button class="btn btn-primary btn-full btn-xl shadow-lg" onclick="App.navigate('home')">
          Go to My Shop 🚀
        </button>
      </div>
    </div>
  `;
};

// 7. Onboarding Step 5: Quick Tips
window.SCREENS['onboarding-5'] = function() {
  return `
    <div class="onboarding-screen">
      <div class="onboarding-header">
        <div class="onboarding-progress">
          <div class="onboarding-step-dot done"></div>
          <div class="onboarding-step-dot done"></div>
          <div class="onboarding-step-dot done"></div>
          <div class="onboarding-step-dot done"></div>
          <div class="onboarding-step-dot active"></div>
        </div>
        <h1 class="text-xl font-bold text-white">Quick Tips 💡</h1>
        <p class="text-xs opacity-80 text-white">Get the most out of MYDUUKA</p>
      </div>

      <div class="onboarding-body">
        <div class="flex flex-col gap-3 mb-6">
          <div class="card card-padded flex items-start gap-3">
            <div class="text-2xl">🛒</div>
            <div>
              <div class="font-bold text-sm">Record Sales Fast</div>
              <div class="text-xs text-muted">Tap products to add to cart, choose payment, and complete the sale in seconds.</div>
            </div>
          </div>
          <div class="card card-padded flex items-start gap-3">
            <div class="text-2xl">📦</div>
            <div>
              <div class="font-bold text-sm">Track Stock Live</div>
              <div class="text-xs text-muted">Know what is running low before customers ask. Add stock with one tap.</div>
            </div>
          </div>
          <div class="card card-padded flex items-start gap-3">
            <div class="text-2xl">📊</div>
            <div>
              <div class="font-bold text-sm">Review Daily Performance</div>
              <div class="text-xs text-muted">Use the Money and Reports screens to see profit, expenses, and top sellers.</div>
            </div>
          </div>
          <div class="card card-padded flex items-start gap-3">
            <div class="text-2xl">🔔</div>
            <div>
              <div class="font-bold text-sm">Act on Alerts</div>
              <div class="text-xs text-muted">Low stock, overdue debts, and slow movers appear here automatically.</div>
            </div>
          </div>
        </div>
      </div>

      <div class="onboarding-footer">
        <button class="btn btn-surface" onclick="App.navigate('onboarding-4')">Back</button>
        <button class="btn btn-primary flex-1 btn-lg" onclick="App.navigate('home')">Start Selling 🚀</button>
      </div>
    </div>
  `;
};
