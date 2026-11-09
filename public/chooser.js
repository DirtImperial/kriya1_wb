(() => {
  // Avatars. index.html is authored with the original female breath sequence; each
  // character maps those base files to its own seated portrait. A full frame set
  // can replace that still later without changing the chooser.
  const FRAME_FILES = [
    'female-cloud-0.svg', 'female-cloud-1.svg', 'female-cloud-2.svg', 'female-cloud-3.svg', 'female-cloud-4.svg',
    'female-pose-0.svg', 'female-pose-1.svg', 'female-pose-2.svg', 'female-pose-3.svg',
    'female-shoulders-relaxed-0.png', 'female-shoulders-relaxed-1.png', 'female-shoulders-relaxed-2.png',
    'female-spine-upright-0.png', 'female-spine-upright-1.png', 'female-spine-upright-2.png',
    'female-head-position-0.png', 'female-head-position-1.png', 'female-head-position-2.png', 'female-head-position-3.png',
    'female-head-position-4.png', 'female-head-position-5.png', 'female-head-position-6.png', 'female-head-position-7.png',
    'female-empty-vessel-outline.webp'
  ];
  const stillSlots = (file) => Object.fromEntries(FRAME_FILES.map((name) => [name, file]));
  const maleSlots = {
    'female-cloud-0.svg': 'avatars/man/breathing/frame-0.png?v=natural-center-locked-clean-v5',
    'female-cloud-1.svg': 'avatars/man/breathing/frame-1.png?v=natural-center-locked-clean-v5',
    'female-cloud-2.svg': 'avatars/man/breathing/frame-2.png?v=natural-center-locked-clean-v5',
    'female-cloud-3.svg': 'avatars/man/breathing/frame-3.png?v=natural-center-locked-clean-v5',
    'female-cloud-4.svg': 'avatars/man/breathing/frame-4.png?v=natural-center-locked-clean-v5',
    'female-pose-0.svg': 'avatars/man/poses/side-cushion.png',
    'female-pose-1.svg': 'avatars/man/poses/side-upright.png',
    'female-pose-2.svg': 'avatars/man/poses/front-palms-up.png',
    'female-pose-3.svg': 'avatars/man/poses/front-hands-lap.png',
    'female-shoulders-relaxed-0.png': 'animations/shoulders-relaxed-man-v2-approved/frame-01-raised.png',
    // The approved files' 02/03 names are reversed relative to their visible poses.
    // Keep the semantic app slots anatomical: raised, halfway, fully relaxed.
    'female-shoulders-relaxed-1.png': 'animations/shoulders-relaxed-man-v2-approved/frame-03-relaxed.png',
    'female-shoulders-relaxed-2.png': 'animations/shoulders-relaxed-man-v2-approved/frame-02-release.png',
    'female-spine-upright-0.png': 'animations/spine-upright-man-v4/frame-01-rounded.png',
    'female-spine-upright-1.png': 'animations/spine-upright-man-v4/frame-02-lengthening.png',
    'female-spine-upright-2.png': 'animations/spine-upright-man-v4/frame-03-upright.png',
    'female-head-position-0.png': 'animations/head-position-chin-down-man-v1/frame-01-head-high.png?v=2026.11.06.1',
    'female-head-position-1.png': 'animations/head-position-chin-down-man-v1/frame-02-lower-1.png?v=2026.11.06.1',
    'female-head-position-2.png': 'animations/head-position-chin-down-man-v1/frame-03-lower-2.png?v=2026.11.06.1',
    'female-head-position-3.png': 'animations/head-position-chin-down-man-v1/frame-04-near-rest.png?v=2026.11.06.1',
    'female-head-position-4.png': 'animations/head-position-chin-down-man-v1/frame-05-rest.png?v=2026.11.06.1',
    'female-head-position-5.png': 'animations/head-position-chin-down-man-v1/frame-06-hold-1.png?v=2026.11.06.1',
    'female-head-position-6.png': 'animations/head-position-chin-down-man-v1/frame-07-hold-2.png?v=2026.11.06.1',
    'female-head-position-7.png': 'animations/head-position-chin-down-man-v1/frame-08-rest-final.png?v=2026.11.06.1',
    'female-empty-vessel-outline.webp': 'animations/empty-vessel-smooth-loop-trace-man-v10/empty-vessel-single-trace-preview.webp'
  };
  const avatarSlots = (file, emptyVessel) => ({
    ...stillSlots(file),
    'female-empty-vessel-outline.webp': emptyVessel
  });
  const womanSlots = {
    ...avatarSlots('avatars/woman.png', 'animations/empty-vessel-smooth-loop-trace-woman-v4/empty-vessel-single-trace-preview.webp'),
    'female-cloud-0.svg': 'avatars/woman/breathing/frame-0.png?v=clean-flow-v2',
    'female-cloud-1.svg': 'avatars/woman/breathing/frame-1.png?v=clean-flow-v2',
    'female-cloud-2.svg': 'avatars/woman/breathing/frame-2.png?v=clean-flow-v2',
    'female-cloud-3.svg': 'avatars/woman/breathing/frame-3.png?v=clean-flow-v2',
    'female-cloud-4.svg': 'avatars/woman/breathing/frame-4.png?v=clean-flow-v2'
  };
  const builtInCharacters = {
    man: { label: 'Man', slots: maleSlots },
    woman: { label: 'Woman', slots: womanSlots },
    boy: { label: 'Boy', slots: avatarSlots('avatars/boy.png', 'animations/empty-vessel-smooth-loop-trace-boy-v4/empty-vessel-single-trace-preview.webp') },
    girl: { label: 'Girl', slots: avatarSlots('avatars/girl.png', 'animations/empty-vessel-smooth-loop-trace-girl-v4/empty-vessel-single-trace-preview.webp') }
  };
  const studioAssets = window.WaveStudioAssets || {};
  const animationSlotsByAvatar = {};
  (studioAssets.animations || []).forEach((animation) => {
    if (!animation || typeof animation.avatar_id !== 'string' || !animation.slots || typeof animation.slots !== 'object') return;
    animationSlotsByAvatar[animation.avatar_id] = { ...(animationSlotsByAvatar[animation.avatar_id] || {}), ...animation.slots };
  });
  Object.entries(builtInCharacters).forEach(([id, character]) => {
    character.slots = { ...character.slots, ...(animationSlotsByAvatar[id] || {}) };
  });
  const studioCharacters = Object.fromEntries((studioAssets.avatars || []).filter((item) =>
    item && typeof item.id === 'string' && /^[a-z0-9-]+$/.test(item.id) && typeof item.path === 'string'
  ).map((item) => [item.id, {
    label: String(item.label || item.id),
    slots: { ...avatarSlots(item.path, item.path), ...(animationSlotsByAvatar[item.id] || {}) }
  }]));
  const CHARACTERS = { ...builtInCharacters, ...studioCharacters };
  const thumbFor = (id) => 'assets/avatars/thumbs/' + id + '.png';
  const placeThumb = (id, variant) => 'assets/environments/' + id + '/thumb-' + variant + '.jpg';
  const ENV = window.WaveEnvironment;

  // Every page load starts on the first option of each row; choices are not remembered.
  let choice = { avatar: 'man', environment: 'grove', time: 'auto' };

  const copyChoice = (from) => ({ avatar: from.avatar, environment: from.environment, time: from.time });
  // The intro draws the scene and figure with the practice's own geometry (the
  // .grove-world crop and the graphic zone box), so Begin doesn't move anything.
  const STAGE_FRAME = 'assets/female-cloud-0.svg';
  // The split chooser uses the same saved stage as the practice. Its full-width
  // composition is translated into the left panel by CSS, preserving the exact
  // relationship between the figure and the scenery.
  const worldMarkup = () =>
    '<div class="skin-world" aria-hidden="true">' +
      '<svg viewBox="0 210 1536 814" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><g data-skin-stage="">' +
      '<image data-skin-image="" width="1536" height="1024"/>' +
      '</g><rect y="0" width="1536" height="1024" fill="#071321" opacity=".42"/></svg>' +
    '</div>';
  const placeButtons = () => Object.entries(ENV.ENVIRONMENTS).map(([id, env]) =>
    '<button type="button" class="skin-place" data-environment="' + id + '">' +
      '<img src="' + placeThumb(id, ENV.resolve(choice.time)) + '" alt="">' +
      '<span>' + env.label + '</span>' +
    '</button>').join('');
  const avatarButtons = () => Object.entries(CHARACTERS).map(([id, character]) =>
    '<button type="button" class="skin-avatar" data-avatar="' + id + '">' +
      '<span class="skin-avatar-disc"><img src="' + thumbFor(id) + '" alt=""></span>' +
      '<span class="skin-avatar-label">' + character.label + '</span>' +
    '</button>').join('');
  const timeButtons = () => ENV.TIMES.map((id) =>
    '<button type="button" class="skin-time" data-time="' + id + '">' +
      (id === 'auto' ? 'Auto' : id === 'day' ? 'Day' : 'Night') +
    '</button>').join('');
  // The greeting follows the device clock. The scene can follow it, or stay on Day or Night.
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
    '<div class="skin-veil" aria-hidden="true"></div>',
    '<button type="button" class="wb-button wb-button-quiet" id="skin-close" aria-label="Close settings" hidden>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    '</button>',
    '<div class="skin-options"><div class="skin-panel">',
    '<header class="skin-head">',
    '<small>Wave breathing</small>',
    '<h1 id="skin-title">Make space for your practice.</h1>',
    '<p class="skin-intro">Choose a time, a place, and a figure to guide your breath.</p>',
    '<p class="skin-settings-note" hidden>Apply keeps you on this step. Cancel leaves the current appearance.</p>',
    '</header>',
    '<div class="skin-sheet">',
    '<fieldset><legend>Time</legend><div class="skin-times">',
    timeButtons(),
    '</div></fieldset>',
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
  reopen.setAttribute('aria-label', 'Settings');
  reopen.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
  reopen.setAttribute('aria-haspopup', 'dialog');
  reopen.hidden = true;
  document.body.append(reopen);

  const title = picker.querySelector('#skin-title');
  const intro = picker.querySelector('.skin-intro');
  const note = picker.querySelector('.skin-settings-note');
  const beginBtn = picker.querySelector('#skin-begin');
  const cancelBtn = picker.querySelector('#skin-cancel');
  const applyBtn = picker.querySelector('#skin-apply');
  const closeBtn = picker.querySelector('#skin-close');
  const figure = picker.querySelector('.skin-figure');

  function placeAvatar() {
    const placement = ENV.avatarStage(choice.environment, choice.avatar);
    figure.style.setProperty('--skin-avatar-x', `${placement.x / 6.6}%`);
    figure.style.setProperty('--skin-avatar-y', `${placement.y / 6.6}%`);
    figure.style.setProperty('--skin-avatar-scale', placement.scale);
  }

  function splitStage(stage) {
    const stageBox = picker.querySelector('.skin-stage').getBoundingClientRect();
    const previewCenter = stageBox.top + stageBox.height / 2;
    const groveUnit = Math.max(window.innerWidth / 1536, window.innerHeight / 814);
    const practiceCenter = (window.innerHeight - groveUnit * 814) / 2 + groveUnit * 280;
    return { scale: stage.scale, x: stage.x, y: stage.y + (previewCenter - practiceCenter) / groveUnit };
  }

  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // A changed scene or figure rises out of a dim instead of snapping in.
  const soften = (el) => {
    if (!reducedMotion() && el.animate) el.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 500, easing: 'ease-out' });
  };

  function ensureCompatibleEnvironment() {
    if (ENV.supportsAvatar(choice.environment, choice.avatar)) return;
    const current = ENV.ENVIRONMENTS[choice.environment];
    const currentLabel = current && current.label.trim().toLocaleLowerCase();
    const available = Object.keys(ENV.ENVIRONMENTS).filter((scene) => ENV.supportsAvatar(scene, choice.avatar));
    const samePlace = available.find((scene) => ENV.ENVIRONMENTS[scene].label.trim().toLocaleLowerCase() === currentLabel);
    if (samePlace || available[0]) choice.environment = samePlace || available[0];
  }

  function paint() {
    ensureCompatibleEnvironment();
    const variant = ENV.resolve(choice.time);
    const env = ENV.ENVIRONMENTS[choice.environment];
    const character = CHARACTERS[choice.avatar];
    const stage = picker.querySelector('[data-skin-stage]');
    const firstImage = stage.querySelector('[data-skin-image]');
    const sceneChanged = Boolean(firstImage.getAttribute('href') && firstImage.getAttribute('href') !== env.variants[variant]);
    // While Begin is settling the scene into the introduction, leave that motion alone.
    if (!picker.classList.contains('is-entering')) {
      ENV.renderStage(stage, { path: env.variants[variant], stage: splitStage(env.stage) });
    }
    if (sceneChanged) soften(picker.querySelector('.skin-world'));
    picker.dataset.time = variant;
    picker.dataset.environment = choice.environment;
    picker.querySelectorAll('.skin-place').forEach((button) => {
      const available = ENV.supportsAvatar(button.dataset.environment, choice.avatar);
      button.hidden = !available;
      button.disabled = !available;
      const label = button.querySelector('span');
      if (label) label.textContent = ENV.ENVIRONMENTS[button.dataset.environment].label;
      const src = placeThumb(button.dataset.environment, variant);
      const img = button.querySelector('img');
      if (img.getAttribute('src') !== src) img.src = src;
    });
    const figureSrc = characterSource(STAGE_FRAME);
    if (figure.getAttribute('src') !== figureSrc) {
      if (figure.getAttribute('src')) soften(figure);
      figure.src = figureSrc;
    }
    placeAvatar();
    figure.alt = character.label + ', seated in meditation';
    picker.querySelectorAll('[data-avatar],[data-environment]').forEach((button) => {
      const key = button.dataset.avatar ? 'avatar' : 'environment';
      button.setAttribute('aria-pressed', String(button.dataset[key] === choice[key]));
    });
    picker.querySelectorAll('.skin-time').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.time === choice.time));
    });
  }

  window.addEventListener('wave-placement-updated', () => paint());
  window.addEventListener('resize', () => {
    if (!picker.classList.contains('is-entering')) paint();
  });

  function syncMode() {
    const settings = mode === 'settings';
    title.textContent = settings ? 'Appearance' : 'Make space for your practice.';
    intro.hidden = settings;
    note.hidden = !settings;
    beginBtn.hidden = settings;
    cancelBtn.hidden = !settings;
    applyBtn.hidden = !settings;
    closeBtn.hidden = !settings;
  }

  function characterSource(src) {
    const slots = CHARACTERS[choice.avatar].slots;
    const normalized = src.startsWith('female-') ? 'assets/' + src : src;
    return normalized.replace(/female-(?:(?:cloud-[0-4]|pose-[0-3])\.svg|(?:shoulders-relaxed|spine-upright)-[0-2]\.png|head-position-[0-7]\.png|empty-vessel-outline\.webp)/g, (file) => slots[file] || file);
  }

  function applyToPage() {
    ENV.apply(choice.environment, choice.time, choice.avatar);
    window.waveEnvironment = choice.environment;
    document.documentElement.dataset.waveAvatar = choice.avatar;
    document.querySelectorAll('.sc-host img,.sc-host image').forEach((el) => {
      if (el.hasAttribute('data-environment-image')) return;
      const attr = el.tagName.toLowerCase() === 'image' ? 'href' : 'src';
      const base = el.dataset.avatarSlot || el.dataset.femaleSource || el.getAttribute(attr);
      if (!base) return;
      el.dataset.femaleSource = base;
      const src = characterSource(base);
      if (el.getAttribute(attr) !== src) el.setAttribute(attr, src);
    });
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

  // Begin eases the opening scene into the introduction. Apply and Cancel
  // still dissolve, because the practice underneath may be on another step.
  let leaveTimer = null;
  // The introduction's words and controls keep arriving after the sheet is gone,
  // so their cue lives on the document rather than on the picker.
  let arriveTimer = null;
  function endArrival() {
    if (arriveTimer) clearTimeout(arriveTimer);
    arriveTimer = null;
    document.documentElement.classList.remove('wave-arriving');
  }
  let settleTimer = null;
  let stageFrame = null;
  function stopStageMove() {
    if (stageFrame) cancelAnimationFrame(stageFrame);
    stageFrame = null;
  }
  function cancelClose() {
    endArrival();
    if (leaveTimer) clearTimeout(leaveTimer);
    if (settleTimer) clearTimeout(settleTimer);
    leaveTimer = null;
    settleTimer = null;
    stopStageMove();
    picker.classList.remove('is-leaving', 'is-entering');
  }
  // Keep the saved scene placement stable while the split view widens into the
  // full practice composition.
  function settleScene(duration) {
    const stage = picker.querySelector('[data-skin-stage]');
    const practice = ENV.ENVIRONMENTS[choice.environment].stage;
    const from = splitStage(practice);
    const to = practice;
    const path = ENV.ENVIRONMENTS[choice.environment].variants[ENV.resolve(choice.time)];
    const start = performance.now();
    // Sine in-out: the same curve as --skin-settle-ease in chooser.css.
    const ease = (t) => (1 - Math.cos(Math.PI * t)) / 2;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const e = ease(t);
      const mix = (a, b) => a + (b - a) * e;
      ENV.renderStage(stage, {
        path: path,
        stage: { scale: mix(from.scale, to.scale), x: mix(from.x, to.x), y: mix(from.y, to.y) }
      });
      stageFrame = t < 1 && picker.classList.contains('is-entering') ? requestAnimationFrame(step) : null;
    };
    stopStageMove();
    stageFrame = requestAnimationFrame(step);
  }
  function closePicker(returnFocus) {
    const entering = mode === 'welcome' && !returnFocus;
    cancelClose();
    reopen.hidden = false;
    if (!entering) lockPractice(false);
    const finish = () => {
      leaveTimer = null;
      settleTimer = null;
      stopStageMove();
      picker.hidden = true;
      picker.setAttribute('aria-hidden', 'true');
      picker.classList.remove('is-leaving', 'is-entering');
      if (entering) lockPractice(false);
      if (returnFocus) reopen.focus();
    };
    if (reducedMotion()) {
      finish();
      return;
    }
    if (entering) {
      picker.classList.add('is-entering');
      document.documentElement.classList.add('wave-arriving');
      arriveTimer = setTimeout(endArrival, 2100);
      settleTimer = setTimeout(() => {
        settleTimer = null;
        if (picker.classList.contains('is-entering')) settleScene(950);
      }, 50);
      leaveTimer = setTimeout(finish, 1450);
      return;
    }
    picker.classList.add('is-leaving');
    leaveTimer = setTimeout(finish, 1250);
  }

  function openSettings() {
    cancelClose();
    choice = copyChoice(snapshot);
    mode = 'settings';
    syncMode();
    paint();
    picker.hidden = false;
    picker.removeAttribute('aria-hidden');
    reopen.hidden = true;
    lockPractice(true);
    // Fade over the practice rather than covering it at once.
    if (!reducedMotion() && picker.animate) picker.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, easing: 'cubic-bezier(0.37, 0, 0.63, 1)' });
    focusSelected();
  }

  // Finish session brings back the welcome page, keeping the last choices.
  function openWelcome() {
    cancelClose();
    choice = copyChoice(snapshot);
    mode = 'welcome';
    syncMode();
    paint();
    picker.hidden = false;
    picker.removeAttribute('aria-hidden');
    reopen.hidden = true;
    lockPractice(true);
    if (!reducedMotion() && picker.animate) picker.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, easing: 'ease-out' });
    title.focus({ preventScroll: true });
  }

  document.addEventListener('wave-practice-finished', openWelcome);

  picker.addEventListener('click', (e) => {
    e.stopPropagation();
    const button = e.target.closest('button');
    if (!button || button.hidden) return;
    if (button.dataset.avatar) choice.avatar = button.dataset.avatar;
    if (button.dataset.environment) choice.environment = button.dataset.environment;
    if (button.classList.contains('skin-time') && ENV.TIMES.includes(button.dataset.time)) choice.time = button.dataset.time;
    if (button.dataset.avatar || button.dataset.environment || button.classList.contains('skin-time')) paint();
  });

  beginBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    ENV.beginSession(choice.time);
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

  const cancelSettings = (e) => {
    e.stopPropagation();
    choice = copyChoice(snapshot);
    paint();
    closePicker(true);
  };
  cancelBtn.addEventListener('click', cancelSettings);
  closeBtn.addEventListener('click', cancelSettings);

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
