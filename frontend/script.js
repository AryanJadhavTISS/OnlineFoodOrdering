const state = { customers: [], restaurants: [], menuItems: [], orders: [], orderMenu: [], editing: null };
const statuses = ['Pending', 'Confirmed', 'Preparing', 'Delivered', 'Cancelled'];
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}
function money(value) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value || 0)); }
function date(value) { return value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; }
function statusBadge(status) { return `<span class="status-pill status-${escapeHtml(String(status).toLowerCase())}">${escapeHtml(status)}</span>`; }

async function api(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'The request could not be completed.');
  return body;
}
function notify(message, kind = 'success') {
  const el = $('#notice'); el.textContent = message; el.className = `notice show ${kind}`;
  clearTimeout(notify.timer); notify.timer = setTimeout(() => el.className = 'notice', 4200);
}
function showSection(name) {
  $$('.page-section').forEach(section => section.classList.toggle('active', section.id === `section-${name}`));
  $$('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.section === name));
  const active = $(`.nav-item[data-section="${name}"]`);
  $('#current-crumb').textContent = active ? active.textContent.trim() : 'Dashboard';
  if (name === 'orders') loadOrders();
  if (name === 'dashboard') loadDashboard();
}

async function loadDashboard() {
  try {
    const { stats, recentOrders } = await api('/api/dashboard');
    for (const key of ['customers', 'restaurants', 'menuItems', 'orders']) $(`#stat-${key}`).textContent = Number(stats[key]).toLocaleString('en-IN');
    $('#stat-revenue').textContent = money(stats.revenue);
    $('#recent-orders').innerHTML = recentOrders.length ? recentOrders.map(order => `<tr>
      <td class="primary-cell">#${order.order_id}</td><td>${escapeHtml(order.customer_name)}</td><td>${escapeHtml(order.restaurant_name)}</td>
      <td>${date(order.order_date)}</td><td class="amount">${money(order.total_amount)}</td><td>${statusBadge(order.status)}</td></tr>`).join('') : '<tr><td colspan="6" class="empty-row">No orders in the database yet.</td></tr>';
  } catch (error) { notify(error.message, 'error'); }
}
async function loadCustomers(search = '') {
  try { state.customers = await api(`/api/customers?search=${encodeURIComponent(search)}`); renderCustomers(); fillCustomerSelect(); }
  catch (error) { notify(error.message, 'error'); }
}
function renderCustomers() {
  $('#customers-table').innerHTML = state.customers.length ? state.customers.map(c => `<tr>
    <td><div class="customer-cell"><span class="mini-avatar">${escapeHtml(c.name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase())}</span><span class="primary-cell">${escapeHtml(c.name)}</span></div></td>
    <td>${escapeHtml(c.email)}</td><td>${escapeHtml(c.phone || '—')}</td><td>${escapeHtml(c.address || '—')}</td>
    <td><div class="row-actions"><button class="small-button" data-edit="customer" data-id="${c.customer_id}">Edit</button><button class="small-button delete-button" data-delete="customer" data-id="${c.customer_id}">Delete</button></div></td></tr>`).join('') : '<tr><td colspan="5" class="empty-row">No customers found.</td></tr>';
}
async function loadRestaurants() {
  try { state.restaurants = await api('/api/restaurants'); renderRestaurants(); fillRestaurantSelects(); }
  catch (error) { notify(error.message, 'error'); }
}
function renderRestaurants() {
  $('#restaurants-table').innerHTML = state.restaurants.length ? state.restaurants.map(r => `<tr>
    <td class="primary-cell">${escapeHtml(r.name)}</td><td>${escapeHtml(r.location || [r.city,r.state].filter(Boolean).join(', ') || '—')}</td>
    <td>${escapeHtml(r.phone || '—')}</td><td>${escapeHtml(r.email)}</td><td><div class="row-actions"><button class="small-button" data-edit="restaurant" data-id="${r.restaurant_id}">Edit</button><button class="small-button delete-button" data-delete="restaurant" data-id="${r.restaurant_id}">Delete</button></div></td></tr>`).join('') : '<tr><td colspan="5" class="empty-row">No restaurants in the database yet.</td></tr>';
}
async function loadMenuItems() {
  try {
    const restaurantId = $('#menu-restaurant-filter').value;
    state.menuItems = await api(`/api/menu-items${restaurantId ? `?restaurant_id=${encodeURIComponent(restaurantId)}` : ''}`);
    renderMenuItems();
  } catch (error) { notify(error.message, 'error'); }
}
function renderMenuItems() {
  $('#menu-table').innerHTML = state.menuItems.length ? state.menuItems.map(item => `<tr>
    <td><span class="primary-cell">${escapeHtml(item.item_name)}</span><div class="sub-cell">${escapeHtml(item.description || '')}</div></td>
    <td>${escapeHtml(item.restaurant_name)}</td><td>${escapeHtml(item.category || '—')}</td><td class="amount">${money(item.price)}</td>
    <td><button class="small-button" data-toggle-menu="${item.item_id}">${item.availability ? '● Available' : '○ Unavailable'}</button></td>
    <td><div class="row-actions"><button class="small-button" data-edit="menu" data-id="${item.item_id}">Edit</button><button class="small-button delete-button" data-delete="menu" data-id="${item.item_id}">Delete</button></div></td></tr>`).join('') : '<tr><td colspan="6" class="empty-row">No menu items found.</td></tr>';
}
async function loadOrders() {
  try {
    state.orders = await api('/api/orders');
    const filter = $('#order-status-filter').value;
    const visible = filter ? state.orders.filter(order => order.status === filter) : state.orders;
    $('#orders-table').innerHTML = visible.length ? visible.map(order => `<tr>
      <td class="primary-cell">#${order.order_id}</td><td>${escapeHtml(order.customer_name)}</td><td>${escapeHtml(order.restaurant_name)}</td>
      <td>${escapeHtml(order.ordered_items || '—')}</td><td>${date(order.order_date)}</td><td class="amount">${money(order.total_amount)}</td>
      <td>${statusBadge(order.status)}</td><td><button class="small-button" data-order-details="${order.order_id}">Details</button></td></tr>`).join('') : '<tr><td colspan="8" class="empty-row">No orders to show.</td></tr>';
  } catch (error) { notify(error.message, 'error'); }
}

function fillCustomerSelect() {
  const select = $('#order-customer'); const current = select.value;
  select.innerHTML = '<option value="">Choose a customer</option>' + state.customers.map(c => `<option value="${c.customer_id}">${escapeHtml(c.name)} · ${escapeHtml(c.email)}</option>`).join('');
  if (current) select.value = current;
}
function fillRestaurantSelects() {
  const menuFilter = $('#menu-restaurant-filter'); const currentFilter = menuFilter.value;
  menuFilter.innerHTML = '<option value="">All restaurants</option>' + state.restaurants.map(r => `<option value="${r.restaurant_id}">${escapeHtml(r.name)}</option>`).join('');
  if (currentFilter) menuFilter.value = currentFilter;
  const orderSelect = $('#order-restaurant'); const currentOrderRestaurant = orderSelect.value;
  orderSelect.innerHTML = '<option value="">Choose a restaurant</option>' + state.restaurants.map(r => `<option value="${r.restaurant_id}">${escapeHtml(r.name)}</option>`).join('');
  if (currentOrderRestaurant) orderSelect.value = currentOrderRestaurant;
}
async function loadOrderMenu(restaurantId) {
  const list = $('#order-menu-list');
  state.orderMenu = [];
  if (!restaurantId) { list.textContent = 'Choose a restaurant to load its menu.'; list.className = 'order-menu-list empty-state'; renderOrderSummary(); return; }
  try {
    const rows = await api(`/api/menu-items?restaurant_id=${encodeURIComponent(restaurantId)}`);
    state.orderMenu = rows.filter(item => item.availability);
    list.className = 'order-menu-list';
    list.innerHTML = state.orderMenu.length ? state.orderMenu.map(item => `<div class="order-menu-row"><div><strong>${escapeHtml(item.item_name)}</strong><small>${escapeHtml(item.category || 'Menu item')} · ${escapeHtml(item.description || '')}</small></div><span class="menu-price">${money(item.price)}</span><input class="quantity-input" type="number" min="0" max="99" value="0" aria-label="Quantity for ${escapeHtml(item.item_name)}" data-quantity="${item.item_id}"></div>`).join('') : '<div class="empty-state">This restaurant has no available menu items.</div>';
    renderOrderSummary();
  } catch (error) { notify(error.message, 'error'); }
}
function renderOrderSummary() {
  const selected = state.orderMenu.map(item => ({ ...item, quantity: Number($(`[data-quantity="${item.item_id}"]`)?.value || 0) })).filter(item => item.quantity > 0);
  $('#order-summary-lines').innerHTML = selected.length ? selected.map(item => `<div class="summary-line"><span>${escapeHtml(item.item_name)} × ${item.quantity}</span><strong>${money(item.price * item.quantity)}</strong></div>`).join('') : '<p class="empty-summary">Your selected items will appear here.</p>';
  $('#order-total').textContent = money(selected.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0));
}

function customerFields(record = {}) {
  return `<label class="field full-field">Full name<input name="name" required maxlength="100" value="${escapeHtml(record.name || '')}"></label>
    <label class="field">Email<input name="email" type="email" required maxlength="100" value="${escapeHtml(record.email || '')}"></label>
    <label class="field">Phone number<input name="phone" required maxlength="15" value="${escapeHtml(record.phone || '')}"></label>
    <label class="field full-field">Address<textarea name="address" required>${escapeHtml(record.address || '')}</textarea></label>`;
}
function restaurantFields(record = {}) {
  return `<label class="field full-field">Restaurant name<input name="name" required maxlength="100" value="${escapeHtml(record.name || '')}"></label>
    <label class="field full-field">Location<input name="location" required value="${escapeHtml(record.location || '')}"></label>
    <label class="field">Phone<input name="phone" required maxlength="15" value="${escapeHtml(record.phone || '')}"></label>
    <label class="field">Email<input name="email" type="email" required maxlength="100" value="${escapeHtml(record.email || '')}"></label>`;
}
function menuFields(record = {}) {
  const isAvailable = record.availability === true || Number(record.availability) === 1;
  return `<label class="field full-field">Item name<input name="item_name" required maxlength="100" value="${escapeHtml(record.item_name || '')}"></label>
    <label class="field full-field">Description<textarea name="description">${escapeHtml(record.description || '')}</textarea></label>
    <label class="field full-field">Restaurant<select name="restaurant_id" required><option value="">Choose a restaurant</option>${state.restaurants.map(r => `<option value="${r.restaurant_id}" ${Number(record.restaurant_id) === r.restaurant_id ? 'selected' : ''}>${escapeHtml(r.name)}</option>`).join('')}</select></label>
    <label class="field">Price (₹)<input name="price" type="number" step="0.01" min="0.01" required value="${escapeHtml(record.price ?? '')}"></label>
    <label class="field">Category<input name="category" required maxlength="50" value="${escapeHtml(record.category || '')}"></label>
    <label class="field full-field">Availability<select name="availability"><option value="true" ${isAvailable ? 'selected' : ''}>Available</option><option value="false" ${!isAvailable ? 'selected' : ''}>Unavailable</option></select></label>`;
}
function openRecordDialog(type, record = null) {
  const recordId = type === 'customer' ? record?.customer_id : type === 'restaurant' ? record?.restaurant_id : record?.item_id;
  state.editing = { type, id: recordId || null };
  const names = { customer: 'customer', restaurant: 'restaurant', menu: 'menu item' };
  $('#dialog-eyebrow').textContent = record ? 'EDIT RECORD' : 'NEW RECORD';
  $('#dialog-title').textContent = `${record ? 'Edit' : 'Add'} ${names[type]}`;
  $('#dialog-fields').innerHTML = type === 'customer' ? customerFields(record || {}) : type === 'restaurant' ? restaurantFields(record || {}) : menuFields(record || {});
  $('#record-dialog').showModal();
}
async function saveRecord(event) {
  event.preventDefault();
  if (!state.editing) return;
  const { type, id } = state.editing;
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  if (type === 'menu') { payload.restaurant_id = Number(payload.restaurant_id); payload.price = Number(payload.price); payload.availability = payload.availability === 'true'; }
  const resource = type === 'menu' ? 'menu-items' : type === 'customer' ? 'customers' : 'restaurants';
  try {
    const result = await api(`/api/${resource}${id ? `/${id}` : ''}`, { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
    $('#record-dialog').close(); notify(result.message);
    if (type === 'customer') await loadCustomers($('#customer-search').value);
    if (type === 'restaurant') { await loadRestaurants(); await loadMenuItems(); }
    if (type === 'menu') await loadMenuItems();
    await loadDashboard();
  } catch (error) { notify(error.message, 'error'); }
}

async function deleteRecord(type, id) {
  if (!window.confirm('Delete this record? Records used by orders or other rows are protected by the database.')) return;
  const resource = type === 'menu' ? 'menu-items' : `${type}s`;
  try {
    const result = await api(`/api/${resource}/${id}`, { method: 'DELETE' }); notify(result.message);
    if (type === 'customer') await loadCustomers($('#customer-search').value);
    if (type === 'restaurant') { await loadRestaurants(); await loadMenuItems(); }
    if (type === 'menu') await loadMenuItems();
    await loadDashboard();
  } catch (error) { notify(error.message, 'error'); }
}

async function showOrderDetails(id) {
  try {
    const order = await api(`/api/orders/${id}`);
    $('#order-detail').classList.remove('hidden');
    $('#order-detail').innerHTML = `<div class="detail-head"><div><p class="eyebrow">ORDER DETAILS</p><h2>Order #${order.order_id}</h2><p class="muted">Placed ${date(order.order_date)}</p></div><div class="detail-status">${statusBadge(order.status)}<select class="select-compact" id="detail-status-select" aria-label="Update order status">${statuses.map(status => `<option ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select><button class="small-button" id="save-status" data-id="${order.order_id}">Update</button></div></div>
      <div class="detail-grid"><div class="detail-block"><small>CUSTOMER</small><strong>${escapeHtml(order.customer_name)}</strong><div class="sub-cell">${escapeHtml(order.customer_email)} · ${escapeHtml(order.customer_phone || '—')}</div><div class="sub-cell">${escapeHtml(order.customer_address || '')}</div></div><div class="detail-block"><small>RESTAURANT · FROM ORDERED MENU ITEMS</small><strong>${escapeHtml(order.restaurant_name)}</strong><div class="sub-cell">${escapeHtml(order.restaurant_location || '')}</div><div class="sub-cell">${escapeHtml(order.restaurant_email)} · ${escapeHtml(order.restaurant_phone || '')}</div></div></div>
      <div class="table-wrap"><table class="detail-items"><thead><tr><th>ITEM</th><th>UNIT PRICE</th><th>QUANTITY</th><th>SUBTOTAL</th></tr></thead><tbody>${order.items.map(item => `<tr><td>${escapeHtml(item.item_name)}</td><td>${money(item.unit_price)}</td><td>${item.quantity}</td><td class="amount">${money(item.subtotal)}</td></tr>`).join('')}</tbody><tfoot><tr><td colspan="3" class="amount">Order total</td><td class="amount">${money(order.total_amount)}</td></tr></tfoot></table></div>`;
    $('#order-detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) { notify(error.message, 'error'); }
}

async function placeOrder() {
  const customerId = Number($('#order-customer').value);
  const restaurantId = Number($('#order-restaurant').value);
  const items = state.orderMenu.map(item => ({ item_id: item.item_id, quantity: Number($(`[data-quantity="${item.item_id}"]`)?.value || 0) })).filter(item => item.quantity > 0);
  if (!customerId || !restaurantId || !items.length) return notify('Choose a customer, restaurant and at least one menu item.', 'error');
  const button = $('#place-order-button'); button.disabled = true; button.textContent = 'Placing order…';
  try {
    const result = await api('/api/orders', { method: 'POST', body: JSON.stringify({ customer_id: customerId, restaurant_id: restaurantId, items }) });
    notify(`Order #${result.order_id} placed for ${money(result.total_amount)}.`);
    $('#order-customer').value = ''; $('#order-restaurant').value = ''; await loadOrderMenu(''); await loadOrders(); await loadDashboard();
  } catch (error) { notify(error.message, 'error'); }
  finally { button.disabled = false; button.innerHTML = 'Place order <span>→</span>'; }
}

async function checkConnection() {
  try { const result = await api('/api/health'); $('#connection-label').textContent = result.database === 'connected' ? 'MySQL connected' : 'Database unavailable'; }
  catch { $('#connection-label').textContent = 'Database unavailable'; }
}

$('#main-nav').addEventListener('click', event => {
  const button = event.target.closest('[data-section]'); if (button) showSection(button.dataset.section);
});
document.addEventListener('click', event => {
  const go = event.target.closest('[data-go]'); if (go) return showSection(go.dataset.go);
  const edit = event.target.closest('[data-edit]');
  if (edit) {
    const list = edit.dataset.edit === 'customer' ? state.customers : edit.dataset.edit === 'restaurant' ? state.restaurants : state.menuItems;
    const key = edit.dataset.edit === 'customer' ? 'customer_id' : edit.dataset.edit === 'restaurant' ? 'restaurant_id' : 'item_id';
    return openRecordDialog(edit.dataset.edit, list.find(record => record[key] === Number(edit.dataset.id)));
  }
  const del = event.target.closest('[data-delete]'); if (del) return deleteRecord(del.dataset.delete, del.dataset.id);
  const detail = event.target.closest('[data-order-details]'); if (detail) return showOrderDetails(detail.dataset.orderDetails);
  const toggle = event.target.closest('[data-toggle-menu]');
  if (toggle) {
    const item = state.menuItems.find(row => row.item_id === Number(toggle.dataset.toggleMenu));
    if (item) api(`/api/menu-items/${item.item_id}`, { method: 'PUT', body: JSON.stringify({ item_name: item.item_name, description: item.description,
      restaurant_id: item.restaurant_id, price: item.price, category: item.category, availability: !item.availability }) })
      .then(async result => { notify(result.message); await loadMenuItems(); })
      .catch(error => notify(error.message, 'error'));
  }
  if (event.target.id === 'save-status') {
    const id = event.target.dataset.id;
    api(`/api/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status: $('#detail-status-select').value }) })
      .then(async result => { notify(result.message); await showOrderDetails(id); await loadOrders(); await loadDashboard(); })
      .catch(error => notify(error.message, 'error'));
  }
});
$('#customer-search').addEventListener('input', event => { clearTimeout(loadCustomers.timer); loadCustomers.timer = setTimeout(() => loadCustomers(event.target.value), 220); });
$('#menu-restaurant-filter').addEventListener('change', loadMenuItems);
$('#order-status-filter').addEventListener('change', loadOrders);
$('#order-restaurant').addEventListener('change', event => loadOrderMenu(event.target.value));
$('#order-menu-list').addEventListener('input', event => { if (event.target.matches('[data-quantity]')) renderOrderSummary(); });
$('#place-order-button').addEventListener('click', placeOrder);
$('#record-form').addEventListener('submit', saveRecord);
$('#dialog-close').addEventListener('click', () => $('#record-dialog').close());
$('#dialog-cancel').addEventListener('click', () => $('#record-dialog').close());
$('#add-customer-button').addEventListener('click', () => openRecordDialog('customer'));
$('#add-restaurant-button').addEventListener('click', () => openRecordDialog('restaurant'));
$('#add-menu-button').addEventListener('click', () => openRecordDialog('menu'));

async function start() {
  await Promise.all([loadCustomers(), loadRestaurants(), loadDashboard(), checkConnection()]);
  await loadMenuItems();
}
start();
