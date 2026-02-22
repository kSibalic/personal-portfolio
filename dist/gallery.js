var STORAGE_BASE = 'https://kxajkfpdkxptxfyfippv.supabase.co/storage/v1/object/public';
var IMG_BUCKET   = 'imgs';
var VID_BUCKET   = 'vids';

var BATCH_INITIAL = 9;
var BATCH_SCROLL  = 6;

var IMAGE_FILES = Array.from({ length: 25 }, function (_, i) {
  return 'im' + String(i + 1).padStart(5, '0') + '.jpg';
});
var VIDEO_FILES = Array.from({ length: 5 }, function (_, i) {
  return 'vid' + String(i + 1).padStart(3, '0') + '.mp4';
});

var allItems      = [];
var filteredItems = [];
var displayedCount = 0;
var currentFilter  = 'all';
var scrollObserver = null;
var galleryEl      = null;
var sentinelEl     = null;

function publicUrl(bucket, file) {
  return STORAGE_BASE + '/' + bucket + '/' + file;
}

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

var HEIGHT_CLASSES = ['gallery-item--short', 'gallery-item--medium', 'gallery-item--tall'];
function randomHeightClass() {
  return HEIGHT_CLASSES[Math.floor(Math.random() * HEIGHT_CLASSES.length)];
}

function createImageItem(url, name, index) {
  var wrapper = document.createElement('div');
  wrapper.className = 'gallery-item gallery-item--loading ' + randomHeightClass();
  wrapper.setAttribute('data-type', 'image');
  wrapper.style.animationDelay = (index * 60) + 'ms';

  var link = document.createElement('a');
  link.href = url;
  link.setAttribute('data-fancybox', 'gallery');

  var img = document.createElement('img');
  img.alt = 'Portfolio photo ' + name.replace(/\.\w+$/, '');
  img.loading = 'lazy';
  img.decoding = 'async';

  img.onload = function () {
    wrapper.classList.remove('gallery-item--loading');
    img.classList.add('gallery-img--loaded');
  };
  img.onerror = function () {
    wrapper.classList.remove('gallery-item--loading');
    wrapper.classList.add('gallery-item--error');
  };

  img.src = url;

  link.appendChild(img);
  wrapper.appendChild(link);
  return wrapper;
}

function createVideoItem(url, name, index) {
  var wrapper = document.createElement('div');
  wrapper.className = 'gallery-item gallery-video-item gallery-item--loading gallery-item--tall';
  wrapper.setAttribute('data-type', 'video');
  wrapper.style.animationDelay = (index * 60) + 'ms';

  var link = document.createElement('a');
  link.href = url;
  link.setAttribute('data-fancybox', 'gallery');

  var thumb = document.createElement('video');
  thumb.preload = 'metadata';
  thumb.muted = true;
  thumb.playsInline = true;
  thumb.setAttribute('tabindex', '-1');
  thumb.setAttribute('aria-hidden', 'true');

  thumb.onloadeddata = function () {
    wrapper.classList.remove('gallery-item--loading');
    thumb.classList.add('gallery-img--loaded');
  };

  thumb.src = url + '#t=0.5';

  var overlay = document.createElement('div');
  overlay.className = 'play-overlay';
  overlay.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>';

  link.appendChild(thumb);
  link.appendChild(overlay);
  wrapper.appendChild(link);
  return wrapper;
}

function renderBatch(count) {
  var end = Math.min(displayedCount + count, filteredItems.length);

  for (var i = displayedCount; i < end; i++) {
    var item = filteredItems[i];
    var delayIndex = i - displayedCount;
    var el;

    if (item.type === 'image') {
      el = createImageItem(item.url, item.name, delayIndex);
    } else {
      el = createVideoItem(item.url, item.name, delayIndex);
    }

    galleryEl.appendChild(el);
  }

  displayedCount = end;

  if (typeof Fancybox !== 'undefined') {
    Fancybox.unbind('[data-fancybox]');
    Fancybox.bind('[data-fancybox]', {
      idle: false,
      Thumbs: false,
      Toolbar: {
        display: {
          left: [],
          middle: [],
          right: ['close'],
        },
      },
    });
  }

  if (sentinelEl) {
    sentinelEl.style.display =
      displayedCount >= filteredItems.length ? 'none' : 'flex';
  }
}

function setupInfiniteScroll() {
  if (!sentinelEl) return;

  scrollObserver = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && displayedCount < filteredItems.length) {
      renderBatch(BATCH_SCROLL);
    }
  }, { rootMargin: '400px' });

  scrollObserver.observe(sentinelEl);
}

function applyFilter(filter) {
  currentFilter = filter;
  var buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(function (btn) {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
  });

  if (filter === 'all') {
    filteredItems = allItems;
  } else if (filter === 'photo') {
    filteredItems = allItems.filter(function (i) { return i.type === 'image'; });
  } else {
    filteredItems = allItems.filter(function (i) { return i.type === 'video'; });
  }

  galleryEl.innerHTML = '';
  displayedCount = 0;
  renderBatch(BATCH_INITIAL);
  if (scrollObserver && sentinelEl) {
    scrollObserver.unobserve(sentinelEl);
  }
  setupInfiniteScroll();
}

function setupFilters() {
  var buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyFilter(btn.getAttribute('data-filter'));
    });
  });
}

function initGallery() {
  galleryEl  = document.getElementById('gallery');
  sentinelEl = document.getElementById('scroll-sentinel');
  if (!galleryEl) return;
  var images = IMAGE_FILES.map(function (n) {
    return { type: 'image', url: publicUrl(IMG_BUCKET, n), name: n };
  });
  var videos = VIDEO_FILES.map(function (n) {
    return { type: 'video', url: publicUrl(VID_BUCKET, n), name: n };
  });

  allItems = shuffle(images.concat(videos));
  filteredItems = allItems;

  galleryEl.innerHTML = '';
  galleryEl.className = 'gallery-grid';
  renderBatch(BATCH_INITIAL);

  setupInfiniteScroll();
  setupFilters();
}

document.addEventListener('DOMContentLoaded', initGallery);
