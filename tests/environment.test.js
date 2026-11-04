// node --test tests/environment.test.js  — checks public/environment.js exactly as the browser loads it.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function load(now) {
  const RealDate = Date;
  class FakeDate extends RealDate {
    constructor(...args) { super(...(args.length ? args : [now.getTime()])); }
  }
  const node = (attrs) => Object.assign({ setAttribute(k, v) { this[k] = v; }, getAttribute(k) { return this[k]; } }, attrs);
  const images = Array.from({ length: 9 }, () => node({ href: 'assets/environments/grove/night.png' }));
  const stage = node({});
  const context = {
    Date: FakeDate,
    document: { documentElement: { dataset: {} }, querySelectorAll: (sel) => (sel === '[data-environment-stage]' ? [stage] : images) },
    window: {}
  };
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
  assert.equal(stage.transform, 'matrix(1 0 0 1 0 0)');
  env.apply('mountain', 'day');
  const mountain = stage.transform;
  env.apply('mountain', 'night');
  assert.equal(stage.transform, mountain);
  assert.ok(images.every((el) => el.href === 'assets/environments/mountain/night.png'));
  // Grove figure transform from the style pack; the mountain peak (772.5, 288) must land on its third eye.
  const fig = { scale: 0.6140350877192983, x: 396.84210526315786, y: 125.78947368421052 };
  const eye = [fig.x + fig.scale * 624, fig.y + fig.scale * 300];
  const m = env.ENVIRONMENTS.mountain.stage;
  assert.ok(Math.abs(m.x + m.scale * 772.5 - eye[0]) < 0.01 && Math.abs(m.y + m.scale * 288 - eye[1]) < 0.01);
  assert.ok(Math.abs(m.y + m.scale * 680 - (fig.y + fig.scale * 820)) < 0.01, 'horizon through the navel');
  assert.equal(env.ENVIRONMENTS.office.label, 'Sunlit Office');
  assert.equal(env.ENVIRONMENTS.office.stage.x, -140);
});
