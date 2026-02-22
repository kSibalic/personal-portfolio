document.addEventListener('DOMContentLoaded', function () {
  var body = document.body;
  body.style.opacity = '1';

  var photos = document.querySelectorAll('img');
  var delay = 0;
  photos.forEach(function (photo) {
    photo.style.opacity = '0';
    photo.style.transition = 'opacity 0.5s ease';
    setTimeout(function () {
      photo.style.opacity = '1';
    }, delay);
    delay += 100;
  });

  var yearEl = document.getElementById('copyright-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
