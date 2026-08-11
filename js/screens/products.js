/* ============================================================
   MYDUUKA — PRODUCTS MODULE
   ============================================================ */

window.SCREENS = window.SCREENS || {};

// 1. Products List
window.SCREENS['products'] = function() {
  const products = Store.products;
  const categories = ['All', 'Drinks', 'Food', 'Groceries', 'Snacks', 'Personal Care', 'Stationery', 'School Supplies'];

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-title">My Products 📦</div>
        <div class="topbar-actions">
          <button class="btn btn-sm btn-primary" onclick="App.navigate('add-product')">
            <i data-lucide="plus" style="width:16px;height:16px"></i> Add Product
          </button>
        </div>
      </div>

      <div class="screen-body">
        <!-- Stats Row -->
        <div class="stats-row mb-5">
          <div class="stat-item">
            <div class="stat-value text-primary">${products.length}</div>
            <div class="stat-label">Total Products</div>
          </div>
          <div class="stat-item">
            <div class="stat-value text-success">${products.filter(p => p.status === 'good').length}</div>
            <div class="stat-label">In Stock</div>
          </div>
          <div class="stat-item">
            <div class="stat-value text-warning">${products.filter(p => p.status === 'low' || p.status === 'caution').length}</div>
            <div class="stat-label">Low Stock</div>
          </div>
          <div class="stat-item">
            <div class="stat-value text-danger">${products.filter(p => p.status === 'out').length}</div>
            <div class="stat-label">Out of Stock</div>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="search-bar mb-4">
          <i data-lucide="search" class="search-icon"></i>
          <input type="text" id="product-search" placeholder="Search product name..." oninput="
            const query = this.value.toLowerCase();
            document.querySelectorAll('.product-list-item').forEach(item => {
              const name = item.dataset.name.toLowerCase();
              item.style.display = name.includes(query) ? 'flex' : 'none';
            });
          ">
        </div>

        <!-- Category Filters -->
        <div class="filter-tabs mb-4">
          ${categories.map(c => `
            <div class="filter-tab ${c === 'All' ? 'active' : ''}" onclick="
              document.querySelectorAll('.filter-tab').forEach(t=>t.classList.remove('active'));
              this.classList.add('active');
              const cat = '${c}';
              document.querySelectorAll('.product-list-item').forEach(item => {
                const itemCat = item.dataset.category;
                item.style.display = (cat === 'All' || itemCat === cat) ? 'flex' : 'none';
              });
            ">
              ${c}
            </div>
          `).join('')}
        </div>

        <!-- Products List -->
        <div class="card overflow-hidden" id="products-list-container">
          ${products.map(p => `
            <div class="product-list-item" 
                 data-name="${Utils.escapeHtml(p.name)}" 
                 data-category="${p.category}"
                 onclick="App.navigate('product-detail', {id:'${p.id}'})">
              <div class="product-list-emoji">${p.emoji || '📦'}</div>
              <div class="list-item-content">
                <div class="list-item-title">${Utils.escapeHtml(p.name)}</div>
                <div class="flex items-center gap-2 mt-1">
                  <span class="chip">${p.category}</span>
                  <span class="text-xs text-muted">Stock: ${p.stock} ${p.sellingUnit}s</span>
                </div>
              </div>
              <div class="list-item-right">
                <div class="list-item-value text-primary">${Utils.formatCurrency(p.sellingPrice)}</div>
                <div class="text-xs text-muted">per ${p.sellingUnit}</div>
                ${Utils.stockBadge(p.status)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
};

// 2. Add Product Form
window.SCREENS['add-product'] = function() {
  window.calcProfitMargin = function() {
    const buyPrice = parseFloat(document.getElementById('p-buying-price').value || 0);
    const sellPrice = parseFloat(document.getElementById('p-selling-price').value || 0);
    const conv = parseFloat(document.getElementById('p-conversion').value || 1);
    
    // Cost per selling unit = buying price / conversion
    const costPerUnit = conv > 0 ? buyPrice / conv : buyPrice;
    const profit = sellPrice - costPerUnit;

    const el = document.getElementById('profit-preview-val');
    if (el) {
      el.textContent = Utils.formatCurrency(profit);
      el.style.color = profit >= 0 ? 'var(--color-success-600)' : 'var(--color-danger-600)';
    }
  };

  window.saveNewProduct = function() {
    const name = document.getElementById('p-name').value;
    const category = document.getElementById('p-category').value;
    const buyingUnit = document.getElementById('p-buying-unit').value || 'Unit';
    const sellingUnit = document.getElementById('p-selling-unit').value || 'Unit';
    const conversion = parseInt(document.getElementById('p-conversion').value || 1);
    const buyingPrice = parseFloat(document.getElementById('p-buying-price').value || 0);
    const sellingPrice = parseFloat(document.getElementById('p-selling-price').value || 0);
    const stock = parseInt(document.getElementById('p-stock').value || 0);
    const minStock = parseInt(document.getElementById('p-min-stock').value || 5);

    if (!name) {
      App.showToast('Please enter product name', 'error');
      return;
    }

    Store.addProduct({
      name, category, emoji: '📦',
      buyingUnit, sellingUnit, conversion,
      buyingPrice, sellingPrice, stock, minStock,
    });

    App.showToast('✓ Product added successfully!', 'success');
    App.navigate('products');
  };

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back
        </div>
        <div class="topbar-title">Add Product 📦</div>
      </div>

      <div class="screen-body max-w-xl mx-auto">
        <div class="card card-padded mb-6">
          <div class="form-group">
            <label class="form-label">Product Name</label>
            <input type="text" class="form-input" id="p-name" placeholder="e.g. Soda (Coca-Cola)">
          </div>

          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-select" id="p-category">
              <option>Food</option>
              <option>Drinks</option>
              <option>Groceries</option>
              <option>Snacks</option>

              <option>Personal Care</option>
              <option>Stationery</option>
              <option>School Supplies</option>
              <option>Household</option>
              <option>Hardware</option>
              <option>Other</option>
            </select>
          </div>

          <div class="divider-label my-4">Product Units & Conversions</div>

          <div class="grid grid-2 gap-3">
            <div class="form-group">
              <label class="form-label">Buying Unit</label>
              <input type="text" class="form-input" id="p-buying-unit" placeholder="e.g. Crate, Tray, Box">
            </div>

            <div class="form-group">
              <label class="form-label">Selling Unit</label>
              <input type="text" class="form-input" id="p-selling-unit" placeholder="e.g. Bottle, Egg, Piece">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">How many [Selling Units] in 1 [Buying Unit]?</label>
            <input type="number" class="form-input" id="p-conversion" value="1" oninput="calcProfitMargin()">
            <div class="form-hint">Example: 1 Crate = 24 Bottles</div>
          </div>

          <div class="divider-label my-4">Pricing</div>

          <div class="grid grid-2 gap-3">
            <div class="form-group">
              <label class="form-label">Buying Price (UGX)</label>
              <input type="number" class="form-input" id="p-buying-price" placeholder="e.g. 24000" oninput="calcProfitMargin()">
            </div>

            <div class="form-group">
              <label class="form-label">Selling Price (UGX)</label>
              <input type="number" class="form-input font-bold text-primary" id="p-selling-price" placeholder="e.g. 1500" oninput="calcProfitMargin()">
            </div>
          </div>

          <!-- Live Profit Calculator -->
          <div class="profit-preview mb-4">
            <span class="profit-preview-label">Estimated profit per selling unit:</span>
            <span class="profit-preview-value text-success" id="profit-preview-val">UGX 0</span>
          </div>

          <div class="divider-label my-4">Initial Inventory</div>

          <div class="grid grid-2 gap-3">
            <div class="form-group">
              <label class="form-label">Current Stock Quantity</label>
              <input type="number" class="form-input" id="p-stock" value="0">
            </div>

            <div class="form-group">
              <label class="form-label">Minimum Stock Alert Level</label>
              <input type="number" class="form-input" id="p-min-stock" value="5">
            </div>
          </div>

          <button class="btn btn-primary btn-full btn-lg mt-4" onclick="saveNewProduct()">
            Save Product
          </button>
        </div>
      </div>
    </div>
  `;
};

// 3. Product Details Screen
window.SCREENS['product-detail'] = function(params) {
  const product = Store.products.find(p => p.id === (params && params.id)) || Store.products[0];

  return `
    <div class="screen">
      <div class="topbar">
        <div class="topbar-back" onclick="App.goBack()">
          <i data-lucide="arrow-left" style="width:20px;height:20px"></i> Back
        </div>
        <div class="topbar-title">${Utils.escapeHtml(product.name)}</div>
      </div>

      <div class="screen-body max-w-xl mx-auto">
        <div class="product-detail-hero">
          <div class="product-detail-emoji">${product.emoji || '📦'}</div>
          <div class="product-detail-name">${Utils.escapeHtml(product.name)}</div>
          <div class="product-detail-price">${Utils.formatCurrency(product.sellingPrice)}</div>
          <div class="text-xs text-muted">per ${product.sellingUnit}</div>
          <div class="mt-3">${Utils.stockBadge(product.status)}</div>
        </div>

        <div class="card card-padded mb-5">
          <div class="info-row">
            <span class="info-key">Category</span>
            <span class="info-val">${product.category}</span>
          </div>

          <div class="info-row">
            <span class="info-key">Stock Available</span>
            <span class="info-val font-bold text-primary">${product.stock} ${product.sellingUnit}s</span>
          </div>

          <div class="info-row">
            <span class="info-key">Buying Price</span>
            <span class="info-val">${Utils.formatCurrency(product.buyingPrice)} per ${product.buyingUnit}</span>
          </div>

          <div class="info-row">
            <span class="info-key">Unit Conversion</span>
            <span class="info-val">1 ${product.buyingUnit} = ${product.conversion} ${product.sellingUnit}s</span>
          </div>

          <div class="info-row">
            <span class="info-key">Est. Profit per Unit</span>
            <span class="info-val text-success font-bold">${Utils.formatCurrency(product.sellingPrice - (product.buyingPrice / product.conversion))}</span>
          </div>
        </div>

        <div class="grid grid-2 gap-3 mb-6">
          <button class="btn btn-primary btn-lg" onclick="App.navigate('add-stock', {productId:'${product.id}'})">
            📦 Add Stock
          </button>
          <button class="btn btn-secondary btn-lg" onclick="App.navigate('stock-adjustment', {productId:'${product.id}'})">
            ⚙ Adjust Stock
          </button>
        </div>
      </div>
    </div>
  `;
};
