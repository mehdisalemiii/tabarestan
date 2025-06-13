document.addEventListener('DOMContentLoaded', function() {
  fetch('/navbar.html')
    .then(function(res) { return res.text(); })
    .then(function(html) {
      document.getElementById('navbar-container').innerHTML = html;

      // منتظر آماده شدن Bootstrap و jQuery باش
      (function initNavbar() {
        if (typeof $ !== 'undefined' && typeof $.fn.collapse !== 'undefined') {
          // همبرگر موبایل
          $('.navbar-toggle').off('click').on('click', function() {
            $('#main-navbar-collapse').collapse('toggle');
          });
          // نشانه‌گذاری لینک فعال
          var page = window.location.pathname.split('/').pop() || 'index.html';
          $('#main-navbar-collapse a').each(function() {
            if ($(this).attr('href').split('/').pop() === page) {
              $(this).parent().addClass('active');
            }
          });
        } else {
          setTimeout(initNavbar, 100);
        }
      })();
    });
});
