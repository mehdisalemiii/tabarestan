document.addEventListener('DOMContentLoaded', () => {
  fetch('/navbar.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('navbar-container').innerHTML = html;

      // همبرگر موبایل
      $('.navbar-toggle').off('click').on('click', () => {
        $('#main-navbar-collapse').collapse('toggle');
      });

      // نشانه‌گذاری لینک فعال
      const page = window.location.pathname.split('/').pop() || 'index.html';
      $('#main-navbar-collapse a').each(function() {
        const href = $(this).attr('href').split('/').pop();
        if (href === page) $(this).parent().addClass('active');
      });
    });
});
