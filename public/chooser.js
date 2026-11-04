(() => {
  // Avatars. index.html is authored with the original female breath sequence; each
  // character maps those base files to its own seated portrait. A full frame set
  // can replace that still later without changing the chooser.
  const FRAME_FILES = [
    'female-cloud-0.svg', 'female-cloud-1.svg', 'female-cloud-2.svg', 'female-cloud-3.svg',
    'female-pose-0.svg', 'female-pose-1.svg', 'female-pose-2.svg', 'female-pose-3.svg'
  ];
  const stillSlots = (file) => Object.fromEntries(FRAME_FILES.map((name) => [name, file]));
  const CHARACTERS = {
    man: { label: 'Man', slots: stillSlots('avatars/man.png') },
    woman: { label: 'Woman', slots: stillSlots('avatars/woman.png') },
    boy: { label: 'Boy', slots: stillSlots('avatars/boy.png') },
    girl: { label: 'Girl', slots: stillSlots('avatars/girl.png') }
  };
  const thumbFor = (id) => 'assets/avatars/thumbs/' + id + '.png';
  const placeThumb = (id, variant) => 'assets/environments/' + id + '/thumb-' + variant + '.jpg';
  const LEGACY_AVATARS = { female: 'woman', male: 'man' };
  const ENV = window.WaveEnvironment;

  let choice = { avatar: 'woman', environment: 'grove' };
  try { Object.assign(choice, JSON.parse(localStorage.getItem('wave-skin') || '{}')); } catch (err) {}
  if (LEGACY_AVATARS[choice.avatar]) choice.avatar = LEGACY_AVATARS[choice.avatar];
  if (!CHARACTERS[choice.avatar]) choice.avatar = 'woman';
  if (!ENV.ENVIRONMENTS[choice.environment]) choice.environment = 'grove';
  delete choice.time; // Time of day is always automatic now.

  const copyChoice = (from) => ({ avatar: from.avatar, environment: from.environment });
  // The intro draws the scene and figure with the practice's own geometry (the
  // .grove-world crop and the graphic zone box), so Begin doesn't move anything.
  const STAGE_FRAME = 'assets/female-cloud-0.svg';
  const TILES = ['-1 0 0 -1 0 0', '1 0 0 -1 0 0', '-1 0 0 -1 3072 0', '-1 0 0 1 0 0', '1 0 0 1 0 0',
    '-1 0 0 1 3072 0', '-1 0 0 -1 0 2048', '1 0 0 -1 0 2048', '-1 0 0 -1 3072 2048'];
  const worldMarkup = () =>
    '<div class="skin-world" aria-hidden="true">' +
      '<svg viewBox="0 210 1536 814" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><g data-skin-stage="">' +
      TILES.map((m) => '<image data-skin-image="" width="1536" height="1024" transform="matrix(' + m + ')"/>').join('') +
      '</g><rect y="0" width="1536" height="1024" fill="#071321" opacity=".42"/></svg>' +
    '</div>';
  const placeButtons = () => Object.entries(ENV.ENVIRONMENTS).map(([id, env]) =>
    '<button type="button" class="skin-place" data-environment="' + id + '">' +
      '<img src="' + placeThumb(id, ENV.resolve('auto')) + '" alt="">' +
      '<span>' + env.label + '</span>' +
    '</button>').join('');
  const avatarButtons = () => Object.entries(CHARACTERS).map(([id, character]) =>
    '<button type="button" class="skin-avatar" data-avatar="' + id + '">' +
      '<span class="skin-avatar-disc"><img src="' + thumbFor(id) + '" alt=""></span>' +
      '<span class="skin-avatar-label">' + character.label + '</span>' +
    '</button>').join('');
  // Time of day is automatic, so the greeting follows the device clock too.
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning.';
    if (hour >= 12 && hour < 17) return 'Good afternoon.';
    return 'Good evening.';
  };

  let snapshot = copyChoice(choice);
  let mode = 'welcome';
  let practiceReady = false;
  let pendingBegin = false;

  const picker = document.createElement('section');
  picker.id = 'skin-picker';
  picker.setAttribute('role', 'dialog');
  picker.setAttribute('aria-modal', 'true');
  picker.setAttribute('aria-labelledby', 'skin-title');
  picker.innerHTML = [
    worldMarkup(),
    '<div class="skin-stage">',
    '<span class="skin-halo" aria-hidden="true"></span>',
    '<img class="skin-figure" alt="">',
    '</div>',
    '<div class="skin-options"><div class="skin-panel">',
    '<header class="skin-head">',
    '<small>Wave breathing</small>',
    '<h1 id="skin-title">Make space for your practice.</h1>',
    '<p class="skin-intro"><span class="skin-greeting"></span> Choose a place, and who sits with you.</p>',
    '<p class="skin-settings-note" hidden>Apply keeps you on this step. Cancel leaves the current appearance.</p>',
    '</header>',
    '<div class="skin-sheet">',
    '<fieldset><legend>Place</legend><div class="skin-places">',
    placeButtons(),
    '</div></fieldset>',
    '<fieldset><legend>Sit with</legend><div class="skin-avatars">',
    avatarButtons(),
    '</div></fieldset>',
    '<div class="skin-actions">',
    '<button type="button" class="wb-button wb-button-secondary" id="skin-cancel" hidden>Cancel</button>',
    '<button type="button" class="wb-button wb-button-primary" id="skin-apply" hidden>Apply</button>',
    '<button type="button" class="wb-button wb-button-primary wb-button-block" id="skin-begin">Begin practice</button>',
    '</div></div></div></div>'
  ].join('');
  document.body.append(picker);

  const reopen = document.createElement('button');
  reopen.type = 'button';
  reopen.id = 'skin-reopen';
  reopen.className = 'wb-button wb-button-quiet';
  reopen.textContent = 'Appearance';
  reopen.setAttribute('aria-haspopup', 'dialog');
  reopen.hidden = true;
  document.body.append(reopen);

  const title = picker.querySelector('#skin-title');
  const intro = picker.querySelector('.skin-intro');
  const note = picker.querySelector('.skin-settings-note');
  const beginBtn = picker.querySelector('#skin-begin');
  const cancelBtn = picker.querySelector('#skin-cancel');
  const applyBtn = picker.querySelector('#skin-apply');
  const figure = picker.querySelector('.skin-figure');

  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // A changed scene or figure rises out of a dim instead of snapping in.
  const soften = (el) => {
    if (!reducedMotion() && el.animate) el.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 500, easing: 'ease-out' });
  };

  function paint() {
    const variant = ENV.resolve('auto');
    const env = ENV.ENVIRONMENTS[choice.environment];
    const character = CHARACTERS[choice.avatar];
    const s = env.stage;
    picker.querySelector('[data-skin-stage]').setAttribute('transform', 'matrix(' + [s.scale, 0, 0, s.scale, s.x, s.y].join(' ') + ')');
    let sceneChanged = false;
    picker.querySelectorAll('[data-skin-image]').forEach((el) => {
      if (el.getAttribute('href') !== env.variants[variant]) {
        if (el.getAttribute('href')) sceneChanged = true;
        el.setAttribute('href', env.variants[variant]);
      }
    });
    if (sceneChanged) soften(picker.querySelector('.skin-world'));
    picker.dataset.time = variant;
    picker.querySelectorAll('.skin-place').forEach((button) => {
      const src = placeThumb(button.dataset.environment, variant);
      const img = button.querySelector('img');
      if (img.getAttribute('src') !== src) img.src = src;
    });
    const figureSrc = characterSource(STAGE_FRAME);
    if (figure.getAttribute('src') !== figureSrc) {
      if (figure.getAttribute('src')) soften(figure);
      figure.src = figureSrc;
    }
    figure.alt = character.label + ', seated in meditation';
    picker.querySelectorAll('[data-avatar],[data-environment]').forEach((button) => {
      const key = button.dataset.avatar ? 'avatar' : 'environment';
      button.setAttribute('aria-pressed', String(button.dataset[key] === choice[key]));
    });
  }

  function syncMode() {
    const settings = mode === 'settings';
    title.textContent = settings ? 'Appearance' : 'Make space for your practice.';
    intro.hidden = settings;
    intro.querySelector('.skin-greeting').textContent = greeting();
    note.hidden = !settings;
    beginBtn.hidden = settings;
    cancelBtn.hidden = !settings;
    applyBtn.hidden = !settings;
  }

  function characterSource(src) {
    const slots = CHARACTERS[choice.avatar].slots;
    return src.replace(/female-(?:cloud|pose)-[0-3]\.svg/g, (file) => slots[file] || file);
  }

  function applyToPage() {
    ENV.apply(choice.environment, 'auto');
    window.waveEnvironment = choice.environment;
    document.querySelectorAll('.sc-host img,.sc-host image').forEach((el) => {
      if (el.hasAttribute('data-environment-image')) return;
      const attr = el.tagName.toLowerCase() === 'image' ? 'href' : 'src';
      const base = el.dataset.femaleSource || el.getAttribute(attr);
      if (!base) return;
      el.dataset.femaleSource = base;
      const src = characterSource(base);
      if (el.getAttribute(attr) !== src) el.setAttribute(attr, src);
    });
    try { localStorage.setItem('wave-skin', JSON.stringify(choice)); } catch (err) {}
  }

  function commit() {
    snapshot = copyChoice(choice);
    window.waveSkinCommitted = true;
    applyToPage();
  }

  function lockPractice(on) {
    const root = document.getElementById('dc-root');
    if (!root) return;
    if (on) {
      root.setAttribute('inert', '');
      root.setAttribute('aria-hidden', 'true');
    } else {
      root.removeAttribute('inert');
      root.removeAttribute('aria-hidden');
    }
  }

  function focusables() {
    return [...picker.querySelectorAll('button')].filter((button) => !button.hidden && !button.disabled);
  }

  function focusSelected() {
    const current = picker.querySelector('[data-avatar][aria-pressed="true"]') || focusables()[0];
    if (current) current.focus();
  }

  // The choices sink away and the scene dissolves into the practice beneath, where
  // the same figure is already sitting in the same place.
  let leaveTimer = null;
  function closePicker(returnFocus) {
    reopen.hidden = false;
    lockPractice(false);
    const finish = () => {
      leaveTimer = null;
      picker.classList.remove('is-leaving');
      picker.hidden = true;
      picker.setAttribute('aria-hidden', 'true');
      if (returnFocus) reopen.focus();
    };
    if (reducedMotion()) {
      finish();
      return;
    }
    picker.classList.add('is-leaving');
    leaveTimer = setTimeout(finish, 900);
  }

  function openSettings() {
    if (leaveTimer) {
      clearTimeout(leaveTimer);
      leaveTimer = null;
      picker.classList.remove('is-leaving');
    }
    choice = copyChoice(snapshot);
    mode = 'settings';
    syncMode();
    paint();
    picker.hidden = false;
    picker.removeAttribute('aria-hidden');
    reopen.hidden = true;
    lockPractice(true);
    focusSelected();
  }

  picker.addEventListener('click', (e) => {
    e.stopPropagation();
    const button = e.target.closest('button');
    if (!button || button.hidden) return;
    if (button.dataset.avatar) choice.avatar = button.dataset.avatar;
    if (button.dataset.environment) choice.environment = button.dataset.environment;
    if (button.dataset.avatar || button.dataset.environment) paint();
  });

  beginBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    ENV.beginSession('auto');
    commit();
    closePicker(false);
    if (practiceReady) document.dispatchEvent(new CustomEvent('wave-practice-begin'));
    else pendingBegin = true;
  });

  applyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    commit();
    closePicker(true);
    document.dispatchEvent(new CustomEvent('wave-appearance-applied'));
  });

  cancelBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    choice = copyChoice(snapshot);
    paint();
    closePicker(true);
  });

  reopen.addEventListener('click', (e) => {
    e.stopPropagation();
    openSettings();
  });

  window.addEventListener('keydown', (e) => {
    if (picker.hidden) return;
    if (e.key === 'Escape') {
      if (mode === 'settings') {
        e.preventDefault();
        e.stopPropagation();
        choice = copyChoice(snapshot);
        paint();
        closePicker(true);
      }
      return;
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = focusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, true);

  window.waveApplySkin = applyToPage;
  const watchPractice = new MutationObserver(() => {
    if (!picker.hidden && document.getElementById('dc-root')) lockPractice(true);
  });
  watchPractice.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('wave-practice-ready', () => {
    watchPractice.disconnect();
    practiceReady = true;
    if (window.waveSkinCommitted) applyToPage();
    if (!picker.hidden) {
      lockPractice(true);
      if (!picker.contains(document.activeElement)) title.focus({ preventScroll: true });
    }
    if (pendingBegin) {
      pendingBegin = false;
      document.dispatchEvent(new CustomEvent('wave-practice-begin'));
    }
  });

  syncMode();
  paint();
  title.tabIndex = -1;
  title.focus({ preventScroll: true });
})();
