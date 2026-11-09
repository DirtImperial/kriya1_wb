// node --test tests/environment.test.js  — checks public/environment.js exactly as the browser loads it.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function load(now, layouts = 'file') {
  const RealDate = Date;
  class FakeDate extends RealDate {
    constructor(...args) { super(...(args.length ? args : [now.getTime()])); }
  }
  const node = (attrs) => Object.assign({ setAttribute(k, v) { this[k] = v; }, getAttribute(k) { return this[k]; } }, attrs);
  const images = [node({ href: 'assets/environments/grove/night.png' })];
  const stage = node({});
  const context = {
    Date: FakeDate,
    document: { documentElement: { dataset: {} }, querySelectorAll: (sel) => (sel === '[data-environment-stage]' ? [stage] : images) },
    window: {}
  };
  if (layouts === 'file') {
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/environment-layouts.js'), 'utf8'), context);
  } else if (layouts) {
    context.window.WaveEnvironmentLayouts = layouts;
  }
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/environment.js'), 'utf8'), context);
  const inside = (h, m = 0) => new FakeDate(2026, 10, 2, h, m);
  return { env: context.window.WaveEnvironment, local: inside, images, stage, root: context.document.documentElement, at: (h, m = 0) => { now.setHours(h, m, 0, 0); } };
}

const local = (h, m = 0) => new Date(2026, 10, 2, h, m);

test('local-hour boundaries and overrides', () => {
  const { env, local } = load(new Date(2026, 10, 2, 12));
  assert.equal(env.chooseTimeVariant({ date: local(6, 59) }), 'night');
  assert.equal(env.chooseTimeVariant({ date: local(7) }), 'day');
  assert.equal(env.chooseTimeVariant({ date: local(18, 59) }), 'day');
  assert.equal(env.chooseTimeVariant({ date: local(19) }), 'night');
  assert.equal(env.chooseTimeVariant({ date: local(0) }), 'night');
  assert.equal(env.chooseTimeVariant({ date: local(22), override: 'day' }), 'day');
  assert.equal(env.chooseTimeVariant({ date: local(12), override: 'night' }), 'night');
  assert.equal(env.chooseTimeVariant({ date: local(8), dayStartsAt: 9, nightStartsAt: 21 }), 'night');
  assert.throws(() => env.chooseTimeVariant({ override: 'system' }), { name: "TypeError" });
  assert.throws(() => env.chooseTimeVariant({ date: local(Number.NaN) }), { name: "TypeError" });
  assert.throws(() => env.chooseTimeVariant({ dayStartsAt: 20, nightStartsAt: 7 }), { name: "RangeError" });
  assert.throws(() => env.chooseEnvironmentAsset('unknown'), { name: "TypeError" });
});

test('every scene has both variants at the shared path layout', () => {
  const { env } = load(local(12));
  for (const [scene, item] of Object.entries(env.ENVIRONMENTS)) {
    for (const variant of ['day', 'night']) {
      assert.equal(item.variants[variant], `assets/environments/${scene}/${variant}.png`);
      assert.ok(fs.existsSync(path.join(__dirname, '../public', item.variants[variant])), `${scene}/${variant} missing`);
    }
  }
});

test('generated placement data preserves the frame and editable saved anchors', () => {
  const { env } = load(local(12));
  const layouts = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/environment-layouts.js'), 'utf8'), { window: layouts });
  const data = layouts.WaveEnvironmentLayouts;
  assert.deepEqual(Array.from(data.frame.viewBox), [0, 210, 1536, 814]);
  assert.deepEqual({ ...data.frame.avatar }, { x: 438, y: 160, size: 660 });
  assert.equal(env.ENVIRONMENTS.grove.locked, false);
  assert.equal(env.ENVIRONMENTS.grove.stage.scale, 1.09);
  assert.equal(env.ENVIRONMENTS.grove.stage.x, -74.223);
  assert.equal(env.ENVIRONMENTS.grove.stage.y, -91.93);
  assert.equal(env.ENVIRONMENTS.mountain.locked, false);
  assert.equal(env.ENVIRONMENTS.mountain.stage.scale, 1.035);
  assert.equal(env.ENVIRONMENTS.mountain.stage.x, -27.208);
  assert.equal(env.ENVIRONMENTS.mountain.stage.y, -18.989);
  assert.equal(env.ENVIRONMENTS.office.locked, false);
  assert.deepEqual({ ...data.environments.office.stage }, { scale: 1.345, x: -237.477, y: -354.986 });
  assert.equal(env.ENVIRONMENTS.office.stage.scale, 1.34666602);
  assert.equal(env.ENVIRONMENTS.office.stage.x, -237.477);
  assert.equal(env.ENVIRONMENTS.office.stage.y, -354.986);
  assert.equal(typeof env.renderStage, 'function');
  assert.equal(typeof env.coverStage, 'function');
});

test('missing or invalid generated placement data falls back safely', () => {
  const missing = load(local(12), null).env;
  assert.equal(missing.ENVIRONMENTS.office.stage.y, -107.312);
  const invalid = load(local(12), {
    schema: 1,
    environments: {
      office: { label: 'Broken office', stage: { scale: 0, x: Number.NaN, y: 99999 } },
      extra: { label: '', stage: { scale: 1, x: 0, y: 0 } }
    }
  }).env;
  assert.equal(invalid.ENVIRONMENTS.office.label, 'Sunlit Office');
  assert.equal(invalid.ENVIRONMENTS.office.stage.y, -107.312);
  assert.equal(invalid.ENVIRONMENTS.extra, undefined);
  assert.equal(invalid.ENVIRONMENTS.grove.label, 'Luminous Grove');
});

test('scene availability is limited to the configured avatars', () => {
  const layouts = {
    schema: 1,
    environments: {
      'girls-room': { label: "Young girl's room", avatars: ['girl'], stage: { scale: 1, x: 0, y: 0 } }
    }
  };
  const { env } = load(local(12), layouts);
  assert.deepEqual(Array.from(env.ENVIRONMENTS['girls-room'].avatars), ['girl']);
  assert.equal(env.supportsAvatar('girls-room', 'girl'), true);
  assert.equal(env.supportsAvatar('girls-room', 'boy'), false);
  assert.throws(() => env.chooseEnvironmentAsset('girls-room', { avatar: 'man' }), { name: 'TypeError' });
  assert.equal(env.chooseEnvironmentAsset('girls-room', { avatar: 'girl', override: 'day' }).scene, 'girls-room');
  assert.equal(env.ENVIRONMENTS.grove.avatars, null);
  assert.equal(env.supportsAvatar('grove', 'studio-new-avatar'), true);
});

test('available avatars share one placement independently of the scene', () => {
  const layouts = {
    schema: 1,
    frame: { avatarStage: { scale: 0.82, x: 14, y: -22 } },
    environments: {
      'girls-room': {
        label: "Young girl's room",
        avatars: ['girl'],
        stage: { scale: 1, x: 0, y: 0 }
      },
      studio: {
        label: 'Studio',
        stage: { scale: 1.1, x: -30, y: -50 },
        avatarStages: { man: { scale: 1.3, x: 200, y: 200 } }
      }
    }
  };
  const { env } = load(local(12), layouts);
  assert.deepEqual({ ...env.avatarStage('girls-room', 'girl') }, { scale: 0.82, x: 14, y: -22 });
  assert.deepEqual({ ...env.avatarStage('girls-room', 'boy') }, { scale: 0.82, x: 14, y: -22 });
  assert.deepEqual({ ...env.avatarStage('studio', 'man') }, { scale: 0.82, x: 14, y: -22 });
  assert.equal(env.updatePlacement(
    'girls-room',
    { scale: 1, x: 0, y: 0 },
    ['girl'],
    "Young girl's room",
    { scale: 0.9, x: -8, y: 11 }
  ), true);
  assert.deepEqual({ ...env.avatarStage('girls-room', 'girl') }, { scale: 0.9, x: -8, y: 11 });
  assert.deepEqual({ ...env.avatarStage('studio', 'woman') }, { scale: 0.9, x: -8, y: 11 });
});

test('switching avatars cannot change the environment placement', () => {
  const layouts = {
    schema: 1,
    environments: {
      bedroom: {
        label: 'Bedroom',
        avatars: ['man', 'woman'],
        stage: { scale: 1.2, x: -120, y: -80 },
        avatarStages: {
          man: { scale: 1.1, x: 20, y: 35 },
          woman: { scale: 0.9, x: -10, y: -15 }
        }
      }
    }
  };
  const { env, stage } = load(local(12), layouts);
  env.apply('bedroom', 'day', 'man');
  const manBackground = stage.transform;
  env.apply('bedroom', 'day', 'woman');
  assert.equal(stage.transform, manBackground);
  assert.equal(stage.transform, 'matrix(1.2 0 0 1.2 -120 -80)');
});

test('a live placement update also renames the scene', () => {
  const { env } = load(local(12));
  assert.equal(env.updatePlacement('grove', { scale: 1, x: 0, y: 0 }, null, 'Moonlit Garden'), true);
  assert.equal(env.ENVIRONMENTS.grove.label, 'Moonlit Garden');
});

test('automatic choice is frozen for the session; manual choice wins', () => {
  const now = local(18, 59);
  const { env, images, root, at } = load(now);
  env.beginSession('auto');
  at(19, 30); // the evening arrives mid-practice
  assert.equal(env.apply('grove', 'auto').variant, 'day');
  assert.equal(images[0].href, 'assets/environments/grove/day.png');
  assert.equal(root.dataset.time, 'day');
  assert.equal(env.apply('mountain', 'auto').path, 'assets/environments/mountain/day.png');
  assert.equal(env.apply('mountain', 'night').variant, 'night');
  env.beginSession('auto'); // next practice re-evaluates
  assert.equal(env.apply('grove', 'auto').variant, 'night');
});

test('before the first practice, auto follows the current hour', () => {
  const { env } = load(local(9));
  assert.equal(env.resolve('auto'), 'day');
});

test('the figure stays put: only the background moves, and the same way day and night', () => {
  const { env, images, stage } = load(local(12));
  env.apply('grove', 'day');
  assert.equal(stage.transform, 'matrix(1.09 0 0 1.09 -74.223 -91.93)');
  env.apply('mountain', 'day');
  const mountain = stage.transform;
  env.apply('mountain', 'night');
  assert.equal(stage.transform, mountain);
  assert.ok(images.every((el) => el.href === 'assets/environments/mountain/night.png'));
  const m = env.ENVIRONMENTS.mountain.stage;
  assert.deepEqual({ ...m }, { scale: 1.035, x: -27.208, y: -18.989 });
  assert.equal(env.ENVIRONMENTS.office.label, 'Sunlit Office');
  assert.equal(env.ENVIRONMENTS.office.stage.scale, 1.34666602);
  assert.equal(env.ENVIRONMENTS.office.stage.x, -237.477);
  assert.equal(env.ENVIRONMENTS.office.stage.y, -354.986);
});

test('the opening chooser can keep auto, day, or night', () => {
  const chooser = fs.readFileSync(path.join(__dirname, '../public/chooser.js'), 'utf8');
  assert.match(chooser, /time: 'auto'/);
  assert.match(chooser, /class="skin-time" data-time="' \+ id \+ '"/);
  assert.match(chooser, /ENV\.resolve\(choice\.time\)/);
  assert.match(chooser, /ENV\.apply\(choice\.environment, choice\.time, choice\.avatar\)/);
  assert.match(chooser, /ENV\.beginSession\(choice\.time\)/);
  assert.doesNotMatch(chooser, /delete choice\.time/);
});

test('the opening chooser hides scenes that are unavailable to the selected avatar', () => {
  const chooser = fs.readFileSync(path.join(__dirname, '../public/chooser.js'), 'utf8');
  const chooserCss = fs.readFileSync(path.join(__dirname, '../public/chooser.css'), 'utf8');
  assert.match(chooser, /ENV\.supportsAvatar\(choice\.environment, choice\.avatar\)/);
  assert.match(chooser, /const samePlace = available\.find/);
  assert.match(chooser, /choice\.environment = samePlace \|\| available\[0\]/);
  assert.match(chooser, /button\.hidden = !available/);
  assert.match(chooser, /ENV\.apply\(choice\.environment, choice\.time, choice\.avatar\)/);
  assert.match(chooserCss, /\.skin-place\[hidden\]\s*\{\s*display:\s*none/);
  assert.match(chooser, /ENV\.avatarStage\(choice\.environment, choice\.avatar\)/);
  assert.match(chooser, /stage:\s*splitStage\(env\.stage\)/);
  assert.match(chooserCss, /transform:\s*translateX\(-23%\)/);
  assert.doesNotMatch(chooser, /skin-preview-scene/);
  assert.doesNotMatch(chooserCss, /skin-preview-scene/);
});

test('a reload starts the opening chooser on the first option of each row', () => {
  const chooser = fs.readFileSync(path.join(__dirname, '../public/chooser.js'), 'utf8');
  assert.match(chooser, /let choice = \{ avatar: 'man', environment: 'grove', time: 'auto' \};/);
  assert.doesNotMatch(chooser, /localStorage/);
});

test('the opening chooser uses the shared renderer instead of drawing its own mirrored floor', () => {
  const chooser = fs.readFileSync(path.join(__dirname, '../public/chooser.js'), 'utf8');
  assert.match(chooser, /ENV\.renderStage\(stage,/);
  assert.doesNotMatch(chooser, /data-skin-stage[^\n]+setAttribute\('transform'/);
  assert.doesNotMatch(chooser, /matrix\(-1/);
});

test('out-of-bounds placements are covered by upright zoom instead of mirrored copies', () => {
  const { env } = load(local(12));
  assert.deepEqual({ ...env.coverStage({ scale: 0.8, x: 140, y: 56 }) }, { scale: 1, x: 0, y: 56 });
  assert.deepEqual({ ...env.coverStage({ scale: 1, x: -12, y: -48 }) }, { scale: 1.046875, x: -12, y: -48 });
  const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  assert.equal((html.match(/data-environment-image/g) || []).length, 1);
  assert.doesNotMatch(html, /data-environment-image[^>]+matrix\(-1/);
  assert.match(html, /--wave-avatar-scale/);
  assert.match(html, /--wave-avatar-x/);
  assert.match(html, /--wave-avatar-y/);
});
