/* ===== سبد خرید طبرستان — درخواست سفارش (بدون قیمت‌گذاری آنلاین) ===== */
(function () {
  var STORAGE_KEY = 'tpc_cart_v1';
  var WHATSAPP_NUMBER = '989192389894';

  function readCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function writeCart(items) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) {}
  }

  var cart = readCart();

  function findIndex(id) {
    for (var i = 0; i < cart.length; i++) if (cart[i].id === id) return i;
    return -1;
  }

  function addItem(item) {
    var idx = findIndex(item.id);
    if (idx > -1) {
      cart[idx].qty += 1;
    } else {
      item.qty = 1;
      cart.push(item);
    }
    writeCart(cart);
    renderBadge();
    renderDrawerItems();
    openDrawer();
    pulseCartIcon();
  }

  function updateQty(id, delta) {
    var idx = findIndex(id);
    if (idx === -1) return;
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    writeCart(cart);
    renderBadge();
    renderDrawerItems();
  }

  function removeItem(id) {
    var idx = findIndex(id);
    if (idx > -1) { cart.splice(idx, 1); writeCart(cart); renderBadge(); renderDrawerItems(); }
  }

  function totalCount() {
    var n = 0;
    for (var i = 0; i < cart.length; i++) n += cart[i].qty;
    return n;
  }

  function renderBadge() {
    var badge = document.getElementById('tpc-cart-badge');
    if (!badge) return;
    var n = totalCount();
    badge.textContent = n;
    badge.style.display = n > 0 ? 'flex' : 'none';
  }

  function pulseCartIcon() {
    var btn = document.getElementById('tpc-cart-btn');
    if (!btn) return;
    btn.classList.remove('tpc-cart-pulse');
    void btn.offsetWidth;
    btn.classList.add('tpc-cart-pulse');
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderDrawerItems() {
    var list = document.getElementById('tpc-cart-list');
    var emptyMsg = document.getElementById('tpc-cart-empty');
    var footer = document.getElementById('tpc-cart-footer');
    if (!list) return;
    list.innerHTML = '';
    if (cart.length === 0) {
      if (emptyMsg) emptyMsg.style.display = 'block';
      if (footer) footer.style.display = 'none';
      return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';
    if (footer) footer.style.display = 'block';
    cart.forEach(function (item) {
      var row = document.createElement('div');
      row.className = 'tpc-cart-item';
      row.innerHTML =
        '<div class="tpc-cart-item-info">' +
          '<div class="tpc-cart-item-title">' + escapeHtml(item.title) + '</div>' +
          '<div class="tpc-cart-item-meta">' + escapeHtml(item.specs || '') + (item.code ? ' | کد: ' + escapeHtml(item.code) : '') + '</div>' +
        '</div>' +
        '<div class="tpc-cart-item-qty">' +
          '<button type="button" class="tpc-qty-btn" data-action="dec">−</button>' +
          '<span>' + item.qty + '</span>' +
          '<button type="button" class="tpc-qty-btn" data-action="inc">+</button>' +
        '</div>' +
        '<button type="button" class="tpc-cart-remove" title="حذف">✕</button>';
      row.querySelector('[data-action="inc"]').addEventListener('click', function () { updateQty(item.id, 1); });
      row.querySelector('[data-action="dec"]').addEventListener('click', function () { updateQty(item.id, -1); });
      row.querySelector('.tpc-cart-remove').addEventListener('click', function () { removeItem(item.id); });
      list.appendChild(row);
    });
  }

  function openDrawer() {
    var overlay = document.getElementById('tpc-cart-overlay');
    var drawer = document.getElementById('tpc-cart-drawer');
    if (overlay) overlay.classList.add('is-open');
    if (drawer) drawer.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    var overlay = document.getElementById('tpc-cart-overlay');
    var drawer = document.getElementById('tpc-cart-drawer');
    if (overlay) overlay.classList.remove('is-open');
    if (drawer) drawer.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function buildWhatsAppMessage(name, phone, city, notes) {
    var lines = ['سلام، درخواست سفارش زیر رو دارم:', ''];
    cart.forEach(function (item, i) {
      lines.push((i + 1) + '. ' + item.title + (item.specs ? ' (' + item.specs + ')' : '') + (item.code ? ' - کد ' + item.code : '') + ' × ' + item.qty);
    });
    lines.push('');
    if (name) lines.push('نام: ' + name);
    if (phone) lines.push('تلفن: ' + phone);
    if (city) lines.push('شهر: ' + city);
    if (notes) lines.push('توضیحات: ' + notes);
    return lines.join('\n');
  }

  async function submitToSupabase(name, phone, city, notes) {
    try {
      var supabase = window.supabaseClient;
      if (!supabase) return { ok: false, reason: 'no-client' };
      var items = cart.map(function (i) { return { title: i.title, specs: i.specs, code: i.code, qty: i.qty }; });
      var { error } = await supabase.from('orders').insert([{
        full_name: name || null,
        phone: phone || null,
        city: city || null,
        notes: notes || null,
        items: items
      }]);
      if (error) return { ok: false, reason: error.message };
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: 'exception' };
    }
  }

  function initDrawerMarkup() {
    if (document.getElementById('tpc-cart-drawer')) return;

    var overlay = document.createElement('div');
    overlay.id = 'tpc-cart-overlay';
    overlay.className = 'tpc-cart-overlay';
    overlay.addEventListener('click', closeDrawer);

    var drawer = document.createElement('aside');
    drawer.id = 'tpc-cart-drawer';
    drawer.className = 'tpc-cart-drawer';
    drawer.innerHTML =
      '<div class="tpc-cart-header">' +
        '<h3>سبد سفارش شما</h3>' +
        '<button type="button" id="tpc-cart-close" class="tpc-cart-close" aria-label="بستن">✕</button>' +
      '</div>' +
      '<div id="tpc-cart-empty" class="tpc-cart-empty">سبد شما خالیه. از صفحات محصولات، مدل مورد نظرتون رو اضافه کنید.</div>' +
      '<div id="tpc-cart-list" class="tpc-cart-list"></div>' +
      '<div id="tpc-cart-footer" class="tpc-cart-footer" style="display:none;">' +
        '<div class="tpc-cart-form">' +
          '<input type="text" id="tpc-cart-name" placeholder="نام و نام خانوادگی" />' +
          '<input type="tel" id="tpc-cart-phone" placeholder="شماره تماس" />' +
          '<select id="tpc-cart-city">' +
            '<option value="">شهر را انتخاب کنید</option>' +
            '<option value="پرند">پرند</option>' +
            '<option value="رباط کریم">رباط کریم</option>' +
            '<option value="تهران">تهران</option>' +
            '<option value="سایر">سایر (تماس می‌گیریم)</option>' +
          '</select>' +
          '<textarea id="tpc-cart-notes" placeholder="توضیحات (اختیاری)" rows="2"></textarea>' +
        '</div>' +
        '<button type="button" id="tpc-cart-submit" class="tpc-cart-submit-btn">ثبت سفارش و ارسال به واتساپ</button>' +
        '<div id="tpc-cart-status" class="tpc-cart-status"></div>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    document.getElementById('tpc-cart-close').addEventListener('click', closeDrawer);
    document.getElementById('tpc-cart-submit').addEventListener('click', async function () {
      var name = document.getElementById('tpc-cart-name').value.trim();
      var phone = document.getElementById('tpc-cart-phone').value.trim();
      var city = document.getElementById('tpc-cart-city').value;
      var notes = document.getElementById('tpc-cart-notes').value.trim();
      var statusEl = document.getElementById('tpc-cart-status');

      if (!phone) {
        statusEl.textContent = 'لطفاً شماره تماس رو وارد کنید.';
        statusEl.className = 'tpc-cart-status tpc-cart-status-error';
        return;
      }
      if (cart.length === 0) return;

      statusEl.textContent = 'در حال ثبت سفارش...';
      statusEl.className = 'tpc-cart-status';

      var result = await submitToSupabase(name, phone, city, notes);

      var msg = buildWhatsAppMessage(name, phone, city, notes);
      var waUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
      window.open(waUrl, '_blank', 'noopener');

      if (result.ok) {
        statusEl.textContent = 'سفارش ثبت شد و به واتساپ منتقل شدید.';
      } else {
        statusEl.textContent = 'سفارش به واتساپ ارسال شد (ثبت آنلاین با مشکل مواجه شد، نگران نباشید، پیام واتساپ کافیه).';
      }
      statusEl.className = 'tpc-cart-status tpc-cart-status-ok';

      cart = [];
      writeCart(cart);
      renderBadge();
      renderDrawerItems();
    });
  }

  function initCartButton() {
    var btn = document.getElementById('tpc-cart-btn');
    if (btn) {
      btn.addEventListener('click', openDrawer);
    }
  }

  function bindAddButtons() {
    document.querySelectorAll('.add-to-cart-btn').forEach(function (btn) {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        addItem({
          id: btn.dataset.id,
          title: btn.dataset.title,
          specs: btn.dataset.specs || '',
          code: btn.dataset.code || ''
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initDrawerMarkup();
    renderDrawerItems();
    // navbar loads asynchronously (fetched), so poll briefly for the cart button
    var tries = 0;
    var poll = setInterval(function () {
      tries++;
      initCartButton();
      renderBadge();
      if (document.getElementById('tpc-cart-btn') || tries > 40) clearInterval(poll);
    }, 100);
    bindAddButtons();
    // in case add-to-cart buttons are inside the fetched navbar or added later
    var tries2 = 0;
    var poll2 = setInterval(function () {
      tries2++;
      bindAddButtons();
      if (tries2 > 40) clearInterval(poll2);
    }, 150);
  });
})();
