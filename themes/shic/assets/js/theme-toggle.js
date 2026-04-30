(function () {
  var btn = document.querySelector('[data-theme-toggle]');
  if (!btn) return;
  var root = document.documentElement;

  function syncLabel() {
    var dark = root.getAttribute('data-theme') === 'dark';
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    btn.setAttribute('aria-label', dark ? 'Passa al tema chiaro' : 'Passa al tema scuro');
    btn.setAttribute('title', dark ? 'Tema chiaro' : 'Tema scuro');
  }

  btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('shic-theme', next); } catch (e) {}
    syncLabel();
  });

  // Track OS-level changes only when the user has not made an explicit choice.
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var listener = function (e) {
      try { if (localStorage.getItem('shic-theme')) return; } catch (err) {}
      root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      syncLabel();
    };
    if (mq.addEventListener) mq.addEventListener('change', listener);
    else if (mq.addListener) mq.addListener(listener);
  }

  syncLabel();
})();
