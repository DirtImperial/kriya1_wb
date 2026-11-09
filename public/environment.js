// Day/night environment selection, from the Wave Breathing style pack 1.2.0 runtime helper.
// Device-local time only (no location). The variant is chosen once when a practice
// begins and kept until the next one; changing art never touches practice state.
// Background and avatar transforms are independent. Every avatar uses one shared global
// registration, while each environment keeps its own Studio placement behind that figure.
// A requested background placement is enlarged and clamped just enough to cover the
// frame, so scenery stays upright with no mirrored tiles or repeated floor strips.
(() => {
  const SCENE_WIDTH = 1536;
  const SCENE_HEIGHT = 1024;
  const VIEW_TOP = 210;
  const VIEW_BOTTOM = 1024;
  const AVATARS = Object.freeze(['man', 'woman', 'boy', 'girl']);
  const FALLBACK_LAYOUTS = {
    grove: {
      label: 'Luminous Grove',
      locked: false,
      stage: { scale: 1.04565723, x: -11.565, y: -46.753 }
    },
    mountain: {
      label: 'Mountain Sky',
      locked: false,
      stage: { scale: 1, x: 0, y: 56.472 }
    },
    office: {
      label: 'Sunlit Office',
      locked: false,
      stage: { scale: 1.10479688, x: 0, y: -107.312 }
    }
  };
  const source = window.WaveEnvironmentLayouts;
  const supplied = source && source.schema === 1 && source.environments && typeof source.environments === 'object'
    ? source.environments : FALLBACK_LAYOUTS;

  function validStage(stage) {
    return stage && ['scale', 'x', 'y'].every((key) => Number.isFinite(stage[key])) &&
      stage.scale >= 0.5 && stage.scale <= 1.5 && Math.abs(stage.x) <= 1536 && Math.abs(stage.y) <= 1024;
  }

  function validAvatars(avatars) {
    return Array.isArray(avatars) && avatars.length > 0 && avatars.every((avatar) => typeof avatar === 'string' && /^[a-z0-9-]+$/.test(avatar));
  }

  function validAvatarStage(stage) {
    return stage && ['scale', 'x', 'y'].every((key) => Number.isFinite(stage[key])) &&
      stage.scale >= 0.5 && stage.scale <= 1.5 && Math.abs(stage.x) <= 660 && Math.abs(stage.y) <= 660;
  }

  let sharedAvatarStage = validAvatarStage(source && source.frame && source.frame.avatarStage)
    ? { ...source.frame.avatarStage }
    : { scale: 1, x: 0, y: 0 };

  function environmentEntry(scene, item) {
    const fallback = FALLBACK_LAYOUTS[scene];
    if (!item || typeof item.label !== 'string' || !item.label.trim() || !validStage(item.stage)) {
      item = fallback;
    }
    if (!item) return null;
    return {
      label: item.label.trim(),
      locked: Boolean(item.locked),
      avatars: validAvatars(item.avatars) ? [...new Set(item.avatars)] : null,
      variants: { day: `assets/environments/${scene}/day.png`, night: `assets/environments/${scene}/night.png` },
      stage: coverStage(item.stage)
    };
  }

  const ENVIRONMENTS = Object.fromEntries(Object.keys(supplied).map((scene) => [scene, environmentEntry(scene, supplied[scene])]).filter(([, item]) => item));
  // A corrupt generated file must not leave the chooser without its built-in scenes.
  Object.keys(FALLBACK_LAYOUTS).forEach((scene) => {
    if (!ENVIRONMENTS[scene]) ENVIRONMENTS[scene] = environmentEntry(scene, FALLBACK_LAYOUTS[scene]);
  });
  const DEFAULTS = Object.freeze({ dayStartsAt: 7, nightStartsAt: 19 });
  const TIMES = ['auto', 'day', 'night'];

  function coverStage(stage) {
    // Keep the requested upper-left placement where possible, then add only the zoom
    // needed to cover the visible frame. Positive x/y values are clamped only when
    // they would expose the left or top edge.
    const x = Math.min(0, stage.x);
    const y = Math.min(VIEW_TOP, stage.y);
    const scale = Math.min(1.5, Math.max(
      1,
      stage.scale,
      (SCENE_WIDTH - x) / SCENE_WIDTH,
      (VIEW_BOTTOM - y) / SCENE_HEIGHT
    ));
    return {
      scale: Number(scale.toFixed(8)),
      x: Number(Math.max(SCENE_WIDTH - SCENE_WIDTH * scale, x).toFixed(3)),
      y: Number(Math.max(VIEW_BOTTOM - SCENE_HEIGHT * scale, y).toFixed(3))
    };
  }

  function chooseTimeVariant(options) {
    const opts = Object.assign({ date: new Date(), override: 'auto' }, DEFAULTS, options || {});
    if (!TIMES.includes(opts.override)) throw new TypeError('Unknown time override');
    if (opts.override !== 'auto') return opts.override;
    if (!(opts.date instanceof Date) || !Number.isFinite(opts.date.getTime())) throw new TypeError('Invalid date');
    const hours = [opts.dayStartsAt, opts.nightStartsAt];
    if (!hours.every((h) => Number.isInteger(h) && h >= 0 && h <= 23) || opts.dayStartsAt >= opts.nightStartsAt) {
      throw new RangeError('Use ordered local hours from 0 through 23');
    }
    const hour = opts.date.getHours(); // device-local, with its timezone and DST rules
    return hour >= opts.dayStartsAt && hour < opts.nightStartsAt ? 'day' : 'night';
  }

  function chooseEnvironmentAsset(scene, options) {
    if (!ENVIRONMENTS[scene]) throw new TypeError('Unknown environment');
    if (options && options.avatar && !supportsAvatar(scene, options.avatar)) throw new TypeError('Environment is not available to this avatar');
    const variant = chooseTimeVariant(options);
    const item = ENVIRONMENTS[scene];
    return { scene: scene, variant: variant, path: item.variants[variant], stage: item.stage };
  }

  function supportsAvatar(scene, avatar) {
    const item = ENVIRONMENTS[scene];
    return Boolean(item && typeof avatar === 'string' && (!item.avatars || item.avatars.includes(avatar)));
  }

  function avatarStage() {
    return { ...sharedAvatarStage };
  }

  function renderStage(stage, asset) {
    const s = asset.stage;
    const matrix = `matrix(${s.scale} 0 0 ${s.scale} ${s.x} ${s.y})`;
    if (stage.getAttribute('transform') !== matrix) stage.setAttribute('transform', matrix);
    const images = stage.querySelectorAll
      ? stage.querySelectorAll('[data-environment-image],[data-skin-image]')
      : document.querySelectorAll('[data-environment-image]');
    images.forEach((image) => {
      if (image.getAttribute('href') !== asset.path) image.setAttribute('href', asset.path);
    });
    // Remove a legacy floor-fill group if this page was hot-reloaded from the old
    // mirrored renderer. Fresh markup no longer creates one.
    const fill = stage.parentNode && stage.parentNode.querySelector
      ? stage.parentNode.querySelector('[data-environment-edge-fill]') : null;
    if (fill) fill.remove();
    return asset;
  }

  // The automatic variant frozen for the current session; null until a practice begins.
  let sessionVariant = null;

  function beginSession(override) {
    sessionVariant = chooseTimeVariant({ override: 'auto' });
    return resolve(override);
  }

  // A manual Day/Night choice always wins; Auto uses the frozen session variant
  // (or the current hour before the first practice of this page load).
  function resolve(override) {
    if (override === 'day' || override === 'night') return override;
    return sessionVariant || chooseTimeVariant({ override: 'auto' });
  }

  function apply(scene, override, avatar) {
    const variant = resolve(override);
    const asset = chooseEnvironmentAsset(scene, { override: variant, avatar: avatar });
    const root = document.documentElement;
    root.dataset.environment = scene;
    root.dataset.time = variant;
    const figure = avatarStage(scene, avatar);
    if (root.style && typeof root.style.setProperty === 'function') {
      root.style.setProperty('--wave-avatar-scale', figure.scale);
      root.style.setProperty('--wave-avatar-x', figure.x);
      root.style.setProperty('--wave-avatar-y', figure.y);
    }
    document.querySelectorAll('[data-environment-stage]').forEach((stage) => renderStage(stage, asset));
    return asset;
  }

  function updatePlacement(scene, stage, avatars, label, savedAvatarStage) {
    if (!ENVIRONMENTS[scene] || !validStage(stage)) return false;
    ENVIRONMENTS[scene].stage = coverStage(stage);
    if (typeof label === 'string' && label.trim()) ENVIRONMENTS[scene].label = label.trim();
    if (avatars === null) ENVIRONMENTS[scene].avatars = null;
    else if (validAvatars(avatars)) ENVIRONMENTS[scene].avatars = [...new Set(avatars)];
    if (validAvatarStage(savedAvatarStage)) sharedAvatarStage = { ...savedAvatarStage };
    const root = document.documentElement;
    if (root.dataset.environment === scene) apply(scene, root.dataset.time || 'auto');
    if (typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent('wave-placement-updated', { detail: { scene: scene, label: ENVIRONMENTS[scene].label, stage: ENVIRONMENTS[scene].stage, avatars: ENVIRONMENTS[scene].avatars, avatarStage: avatarStage() } }));
    }
    return true;
  }

  function receivePlacement(event) {
    const detail = event && event.data ? event.data : event;
    if (!detail || detail.type !== 'wave-placement-saved') return;
    updatePlacement(detail.scene, detail.stage, detail.avatars, detail.label, detail.avatarStage);
  }

  if (typeof BroadcastChannel === 'function') {
    const placementChannel = new BroadcastChannel('wave-environment-layouts');
    placementChannel.addEventListener('message', receivePlacement);
  }
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('storage', (event) => {
      if (event.key !== 'wave-environment-layout-updated' || !event.newValue) return;
      try { receivePlacement(JSON.parse(event.newValue)); } catch { /* Ignore malformed cross-tab data. */ }
    });
  }

  window.WaveEnvironment = Object.freeze({
    ENVIRONMENTS: ENVIRONMENTS,
    AVATARS: AVATARS,
    DEFAULTS: DEFAULTS,
    TIMES: TIMES,
    chooseTimeVariant: chooseTimeVariant,
    chooseEnvironmentAsset: chooseEnvironmentAsset,
    beginSession: beginSession,
    resolve: resolve,
    apply: apply,
    renderStage: renderStage,
    coverStage: coverStage,
    supportsAvatar: supportsAvatar,
    avatarStage: avatarStage,
    updatePlacement: updatePlacement
  });
})();
