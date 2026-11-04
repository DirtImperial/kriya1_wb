// Day/night environment selection, from the Wave Breathing style pack 1.2.0 runtime helper.
// Device-local time only (no location). The variant is chosen once when a practice
// begins and kept until the next one; changing art never touches practice state.
// The figure never moves or resizes between scenes or times: each background is moved
// under it instead (stage transforms from the asset studio's export), and the uncovered
// edges show mirrored copies of the same image.
(() => {
  const ENVIRONMENTS = {
    grove: {
      label: 'Luminous Grove',
      variants: { day: 'assets/environments/grove/day.png', night: 'assets/environments/grove/night.png' },
      stage: { scale: 1, x: 0, y: 0 }
    },
    mountain: {
      label: 'Mountain Sky',
      variants: { day: 'assets/environments/mountain/day.png', night: 'assets/environments/mountain/night.png' },
      stage: { scale: 0.81453634, x: 150.771, y: 75.414 } // peak on the third eye, horizon through the navel
    },
    office: {
      label: 'Sunlit Office',
      variants: { day: 'assets/environments/office/day.png', night: 'assets/environments/office/night.png' },
      stage: { scale: 1, x: -140, y: 0 } // chair centered under the seated figure
    }
  };
  const DEFAULTS = Object.freeze({ dayStartsAt: 7, nightStartsAt: 19 });
  const TIMES = ['auto', 'day', 'night'];

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
    const variant = chooseTimeVariant(options);
    const item = ENVIRONMENTS[scene];
    return { scene: scene, variant: variant, path: item.variants[variant], stage: item.stage };
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

  function apply(scene, override) {
    const variant = resolve(override);
    const asset = chooseEnvironmentAsset(scene, { override: variant });
    const root = document.documentElement;
    root.dataset.environment = scene;
    root.dataset.time = variant;
    const s = asset.stage;
    const matrix = `matrix(${s.scale} 0 0 ${s.scale} ${s.x} ${s.y})`;
    document.querySelectorAll('[data-environment-stage]').forEach((el) => {
      if (el.getAttribute('transform') !== matrix) el.setAttribute('transform', matrix);
    });
    document.querySelectorAll('[data-environment-image]').forEach((el) => {
      if (el.getAttribute('href') !== asset.path) el.setAttribute('href', asset.path);
    });
    return asset;
  }

  window.WaveEnvironment = Object.freeze({
    ENVIRONMENTS: ENVIRONMENTS,
    DEFAULTS: DEFAULTS,
    TIMES: TIMES,
    chooseTimeVariant: chooseTimeVariant,
    chooseEnvironmentAsset: chooseEnvironmentAsset,
    beginSession: beginSession,
    resolve: resolve,
    apply: apply
  });
})();
