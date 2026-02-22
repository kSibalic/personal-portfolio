(function () {
  var nav = document.getElementById('nav');
  var navLinks = document.getElementById('menu');

  window.menuToggle = function () {
    if (nav) nav.classList.toggle('nav-open');
    if (navLinks) navLinks.classList.toggle('menu-visible');
  };

  window.addEventListener('resize', function () {
    if (window.innerWidth > 767) {
      if (nav) nav.classList.remove('nav-open');
      if (navLinks) navLinks.classList.remove('menu-visible');
    }
  });
})();
