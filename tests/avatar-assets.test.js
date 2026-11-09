const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const publicRoot = path.join(root, 'public');
const chooser = fs.readFileSync(path.join(publicRoot, 'chooser.js'), 'utf8');
const html = fs.readFileSync(path.join(publicRoot, 'index.html'), 'utf8');

const maleAssets = [
  'assets/avatars/man/breathing/frame-0.png',
  'assets/avatars/man/breathing/frame-1.png',
  'assets/avatars/man/breathing/frame-2.png',
  'assets/avatars/man/breathing/frame-3.png',
  'assets/avatars/man/breathing/frame-4.png',
  'assets/avatars/man/poses/front-palms-down.png',
  'assets/avatars/man/poses/front-palms-up.png',
  'assets/avatars/man/poses/front-hands-lap.png',
  'assets/avatars/man/poses/side-upright.png',
  'assets/avatars/man/poses/side-cushion.png'
];

const womanBreathingAssets = [
  'assets/avatars/woman/breathing/frame-0.png',
  'assets/avatars/woman/breathing/frame-1.png',
  'assets/avatars/woman/breathing/frame-2.png',
  'assets/avatars/woman/breathing/frame-3.png',
  'assets/avatars/woman/breathing/frame-4.png'
];

const spineUprightAssets = [
  'assets/animations/spine-upright-man-v4/frame-01-rounded.png',
  'assets/animations/spine-upright-man-v4/frame-02-lengthening.png',
  'assets/animations/spine-upright-man-v4/frame-03-upright.png'
];

const shoulderReleaseAssets = [
  'assets/animations/shoulders-relaxed-man-v2-approved/frame-01-raised.png',
  'assets/animations/shoulders-relaxed-man-v2-approved/frame-02-release.png',
  'assets/animations/shoulders-relaxed-man-v2-approved/frame-03-relaxed.png'
];

const headPositionAssets = [
  'assets/animations/head-position-chin-down-man-v1/frame-01-head-high.png',
  'assets/animations/head-position-chin-down-man-v1/frame-02-lower-1.png',
  'assets/animations/head-position-chin-down-man-v1/frame-03-lower-2.png',
  'assets/animations/head-position-chin-down-man-v1/frame-04-near-rest.png',
  'assets/animations/head-position-chin-down-man-v1/frame-05-rest.png',
  'assets/animations/head-position-chin-down-man-v1/frame-06-hold-1.png',
  'assets/animations/head-position-chin-down-man-v1/frame-07-hold-2.png',
  'assets/animations/head-position-chin-down-man-v1/frame-08-rest-final.png'
];

const emptyVesselAssets = [
  'assets/animations/empty-vessel-smooth-loop-trace-man-v10/empty-vessel-single-trace-preview.webp',
  'assets/animations/empty-vessel-smooth-loop-trace-woman-v4/empty-vessel-single-trace-preview.webp',
  'assets/animations/empty-vessel-smooth-loop-trace-boy-v4/empty-vessel-single-trace-preview.webp',
  'assets/animations/empty-vessel-smooth-loop-trace-girl-v4/empty-vessel-single-trace-preview.webp'
];

function pngSize(filename) {
  const data = fs.readFileSync(filename);
  assert.equal(data.toString('ascii', 1, 4), 'PNG');
  return [data.readUInt32BE(16), data.readUInt32BE(20)];
}

test('every installed male frame exists on the shared 1024 canvas', () => {
  for (const asset of maleAssets) {
    const filename = path.join(publicRoot, asset);
    assert.ok(fs.existsSync(filename), `${asset} is missing`);
    assert.deepEqual(pngSize(filename), [1024, 1024], `${asset} changed canvas`);
  }
});

test('the male avatar uses the approved posture and five-stage breathing slots', () => {
  for (const asset of [...maleAssets, ...spineUprightAssets].filter((name) => !name.endsWith('front-palms-down.png'))) {
    assert.ok(chooser.includes(asset.replace('assets/', '')), `${asset} is not wired into chooser.js`);
  }
  assert.match(chooser, /'female-pose-0\.svg': 'avatars\/man\/poses\/side-cushion\.png'/);
  assert.match(chooser, /'female-pose-1\.svg': 'avatars\/man\/poses\/side-upright\.png'/);
  assert.match(chooser, /'female-pose-2\.svg': 'avatars\/man\/poses\/front-palms-up\.png'/);
  assert.match(chooser, /'female-pose-3\.svg': 'avatars\/man\/poses\/front-hands-lap\.png'/);
  assert.ok(html.includes('data-vfig="4"'));
  // Both SO HUM stages and the integration stages reuse the Fill & empty breathing figure.
  assert.ok(html.includes("return S.graphic === 'vessel' || S.graphic === 'mantra' || S.graphic === 'mantra-cycle' || !!S.breath;"));
  for (const title of ["'Rest in the expanse'", "'Bring the four together'", "'Build familiarity'", "'Let it become natural'"]) {
    assert.match(html, new RegExp("title: " + title + "[^}]*breath: true"), title + ' should breathe');
  }
  assert.match(html, /'Roots, trunk, branches'\), accent: '#ffd27a', bg: 'finale', breath: true/);
  assert.ok(html.includes("set('vessel', this.breathes(S) ? 1 : 0);"));
  assert.ok(!html.includes('data-layer="mantra-body"'));
  assert.ok(chooser.includes("src.startsWith('female-') ? 'assets/' + src : src"));
});

test('the woman uses the exact five-stage male breathing effect transfer', () => {
  for (const asset of womanBreathingAssets) {
    const filename = path.join(publicRoot, asset);
    assert.ok(fs.existsSync(filename), `${asset} is missing`);
    assert.deepEqual(pngSize(filename), [1400, 1400], `${asset} changed the woman canvas`);
    assert.ok(chooser.includes(asset.replace('assets/', '')), `${asset} is not wired into chooser.js`);
  }
  for (let index = 0; index < 5; index += 1) {
    assert.match(chooser, new RegExp(`'female-cloud-${index}\\.svg': 'avatars/woman/breathing/frame-${index}\\.png\\?v=clean-flow-v2'`));
  }
  for (let index = 0; index < 5; index += 1) {
    const continuous = path.join(publicRoot, `assets/avatars/woman/breathing/continuous-pixel/frame-${index}.png`);
    assert.ok(fs.existsSync(continuous), `continuous woman frame ${index} is missing`);
    assert.deepEqual(pngSize(continuous), [1400, 1400], `continuous woman frame ${index} changed canvas`);
  }
  assert.ok(html.includes('data-vessel-woman-continuous'));
  assert.ok(html.includes('continuous-pixel/frame-4.png?v=clean-flow-v5'));
  assert.ok(html.includes('context.imageSmoothingEnabled = false'));
  assert.ok(html.includes("querySelector('[data-vessel-' + avatar + '-continuous]')"));
  assert.match(html, /const level = \(1 - Math\.cos\(phase \* Math\.PI \* 2\)\) \* 2;/);
});

test('the male vessel uses one continuous anatomical breath loop', () => {
  const loop = path.join(publicRoot, 'assets/avatars/man/breathing/continuous-anatomical-breath-v1.webm');
  const poster = path.join(publicRoot, 'assets/avatars/man/breathing/continuous-anatomical-breath-v1-poster.png');
  assert.ok(fs.existsSync(loop), 'the anatomical male breathing loop is missing');
  assert.ok(fs.statSync(loop).size > 100000, 'the anatomical male breathing loop is empty');
  assert.ok(fs.existsSync(poster), 'the anatomical male breathing poster is missing');
  assert.ok(html.includes('data-vessel-man-continuous'));
  assert.ok(html.includes('continuous-anatomical-breath-v1.webm?v=anatomical-breath-v1'));
  assert.ok(html.includes('continuous-anatomical-breath-v1-poster.png?v=anatomical-breath-v1'));
  assert.ok(html.includes('continuous.loop = true'));
  assert.ok(html.includes('continuous.muted = true'));
});

test('the second SO HUM does not wrap its word clock before the video restarts', () => {
  assert.ok(html.includes('show(Math.min(video.currentTime / video.duration, 1));'));
  assert.ok(!html.includes('show((video.currentTime % video.duration) / video.duration);'));
});

test('finding your seat alternates front then side master, side registered for lift hips', () => {
  assert.match(html, /\.seat-front\{opacity:1\}/);
  assert.match(html, /\.seat-side\{opacity:0\}/);
  assert.match(html, /@keyframes seat-front-view\{0%,40%,100%\{opacity:1\}50%,90%\{opacity:0\}\}/);
  assert.ok(html.includes('freezeSeatViewForExit(view)'));
  assert.ok(html.includes('getComputedStyle(image).opacity'));
  assert.ok(html.includes("image.style.animation = 'none'"));
  assert.match(html, /im\.classList\.toggle\('seat-cycle-active', on\)/);
  assert.ok(!html.includes('animation:front-view'));
  assert.ok(!html.includes('animation:side-view'));
  assert.match(html, /html\[data-wave-avatar="man"\] \.seat-side\{transform:translate\(-\.05%,-\.108%\) scale\(1\.00256\)\}/);
  assert.match(html, /html\[data-wave-avatar="man"\] \[data-seat="1"\]\{transform:translateX\(-1\.935%\)/);
});

test('the shoulder instruction replaces one full frame at a time without stacking outlines', () => {
  for (const asset of shoulderReleaseAssets) {
    const filename = path.join(publicRoot, asset);
    assert.ok(fs.existsSync(filename), `${asset} is missing`);
    assert.deepEqual(pngSize(filename), [1254, 1254], `${asset} changed the approved still-frame canvas`);
    assert.ok(chooser.includes(asset.replace('assets/', '')), `${asset} is not wired into chooser.js`);
  }
  assert.ok(html.includes('class="shoulder-release-sequence"'));
  assert.equal((html.match(/data-shoulder-release-frame/g) || []).length, 2, 'one markup node plus one script lookup expected');
  assert.equal((html.match(/<img[^>]+data-shoulder-release-frame/g) || []).length, 1, 'the sequence must render through one image element');
  assert.ok(html.includes('startShoulderRelease()'));
  assert.ok(html.includes('const frameOrder = [0, 1, 2]'));
  assert.ok(html.includes('const durations = [900, 700, 1500]'));
  assert.ok(html.includes("image.dataset.avatarSlot = 'female-shoulders-relaxed-' + frame + '.png'"));
  assert.ok(html.includes('const nextOrderIndex = (orderIndex + 1) % frameOrder.length'));
  assert.ok(html.includes('setTimeout(() => show(nextOrderIndex), durations[frame])'));
  assert.ok(html.includes('clearTimeout(this._shoulderReleaseTimer)'));
  assert.ok(!html.includes('shoulder-sequence-active'));
  assert.ok(!html.includes('shoulder-frame-raised'));
  assert.equal((html.match(/<img class="seat-cue-arrow shoulder-cue-arrow [^"]+" src="assets\/animations\/seat-cue-arrows-v1\/arrow-down\.png"/g) || []).length, 2, 'one down arrow above each shoulder');
  assert.ok(fs.existsSync(path.join(publicRoot, 'assets/animations/seat-cue-arrows-v1/arrow-down.png')));
  for (let index = 0; index < 3; index += 1) {
    assert.ok(chooser.includes(`'female-shoulders-relaxed-${index}.png'`));
  }
  assert.ok(chooser.includes("'female-shoulders-relaxed-0.png': 'animations/shoulders-relaxed-man-v2-approved/frame-01-raised.png'"));
  assert.ok(chooser.includes("'female-shoulders-relaxed-1.png': 'animations/shoulders-relaxed-man-v2-approved/frame-03-relaxed.png'"));
  assert.ok(chooser.includes("'female-shoulders-relaxed-2.png': 'animations/shoulders-relaxed-man-v2-approved/frame-02-release.png'"));
});

test('the spine instruction restarts a three-frame avatar-aware lengthening sequence', () => {
  for (const asset of spineUprightAssets) {
    const filename = path.join(publicRoot, asset);
    assert.ok(fs.existsSync(filename), `${asset} is missing`);
    assert.deepEqual(pngSize(filename), [1254, 1254], `${asset} changed the approved still-frame canvas`);
    assert.ok(chooser.includes(asset.replace('assets/', '')), `${asset} is not wired into chooser.js`);
  }
  assert.ok(html.includes("if (window.location.protocol === 'file:')"));
  assert.ok(html.includes("window.location.replace('http://127.0.0.1:8766/app/' + window.location.search + window.location.hash)"));
  assert.ok(html.includes('class="spine-upright-sequence"'));
  assert.equal((html.match(/data-avatar-slot="female-spine-upright-[0-2]\.png"/g) || []).length, 3);
  assert.equal((html.match(/<img class="seat-cue-arrow spine-cue-arrow [^"]+" src="assets\/animations\/seat-cue-arrows-v1\/arrow-up\.png"/g) || []).length, 2, 'one up arrow on each side of the head');
  assert.ok(fs.existsSync(path.join(publicRoot, 'assets/animations/seat-cue-arrows-v1/arrow-up.png')));
  assert.equal((html.match(/animation:spine-(?:rounded|lengthening|upright) 3\.8s steps\(1,end\) infinite/g) || []).length, 3);
  assert.ok(html.includes("classList.toggle('spine-sequence-active'"));
  assert.ok(html.includes('@keyframes spine-rounded'));
  assert.ok(html.includes('@keyframes spine-lengthening'));
  assert.ok(html.includes('@keyframes spine-upright'));
  assert.ok(html.includes('width:min(var(--grove-box),150vw)!important;height:min(var(--grove-box),150vw)!important'));
  for (let index = 0; index < 3; index += 1) {
    assert.ok(chooser.includes(`'female-spine-upright-${index}.png'`));
  }
});

test('the head instruction replaces one full frame at a time without stacking outlines', () => {
  for (const asset of headPositionAssets) {
    const filename = path.join(publicRoot, asset);
    assert.ok(fs.existsSync(filename), `${asset} is missing`);
    assert.deepEqual(pngSize(filename), [1254, 1254], `${asset} changed the approved master canvas`);
    assert.ok(chooser.includes(asset.replace('assets/', '')), `${asset} is not wired into chooser.js`);
  }
  assert.ok(html.includes('class="head-position-sequence"'));
  assert.ok((html.match(/data-head-position-frame/g) || []).length >= 2, 'one markup node and one script lookup expected');
  assert.equal((html.match(/<img[^>]+data-head-position-frame/g) || []).length, 1, 'the sequence must render through one image element');
  assert.ok(html.includes('startHeadPosition()'));
  assert.ok(html.includes("image.dataset.avatarSlot = 'female-head-position-' + frame + '.png'"));
  assert.ok(html.includes('const nextFrame = frame === finalFrame ? 0 : frame + 1'));
  assert.ok(html.includes('setTimeout(() => show(nextFrame), durations[frame])'));
  assert.ok(html.includes("clearTimeout(this._headPositionTimer)"));
  assert.ok(html.includes("im.style.transition = 'opacity .9s ease'"));
  assert.ok(!html.includes('head-position-frame-0'));
});

test('the empty vessel instruction restarts a breath-paced contour trace for every avatar', () => {
  for (const asset of emptyVesselAssets) {
    const filename = path.join(publicRoot, asset);
    assert.ok(fs.existsSync(filename), `${asset} is missing`);
    assert.ok(fs.statSync(filename).size > 1000, `${asset} is empty`);
    assert.ok(chooser.includes(asset.replace('assets/', '')), `${asset} is not wired into chooser.js`);
  }
  assert.ok(html.includes('data-avatar-slot="female-empty-vessel-outline.webp"'));
  assert.ok(html.includes('data-empty-vessel-frame'));
  assert.ok(html.includes('class="empty-vessel-hollow"'));
  assert.ok(html.includes('@keyframes empty-vessel-hollow'));
  assert.ok(html.includes("emptyOutline.classList.toggle('empty-vessel-active'"));
  assert.ok(html.includes('animation:empty-vessel-hollow 10s linear infinite'));
  assert.ok(html.includes('80%,91.25%{opacity:.78}'));
  assert.ok(html.includes("S.graphic === 'empty-outline'"));
  assert.ok(html.includes("outline.removeAttribute('src')"));
  const sequence = JSON.parse(fs.readFileSync(path.join(
    publicRoot,
    'assets/animations/empty-vessel-smooth-loop-trace-man-v10/sequence.json'
  ), 'utf8'));
  assert.equal(sequence.frames.length, 72);
  assert.equal(sequence.totalDurationMs, 10000);
  assert.equal(sequence.loop, true);
  assert.equal(sequence.effect.breathPacing, 'ten-second-loop');
  assert.equal(sequence.effect.releaseFrames, 8);
});

test('the spine scene keeps the same full registered figure canvas', () => {
  const column = html.match(/<div data-layer="column"[\s\S]*?<\/div>/)?.[0];
  assert.ok(column, 'column layer is missing');
  assert.ok(column.includes('<image href="assets/female-cloud-0.svg" x="0" y="0" width="1024" height="1024"/>'));
  assert.ok(column.includes('data-registration-master="assets/avatars/man/poses/side-upright.png"'));
  assert.match(html, /transform:\s*translate\(-1\.054%,\s*2\.807%\)\s*scale\(\.9383\)/);
  assert.ok(!column.includes('width="844"'));
});

test('every live body layer uses the avatar-registered frame family', () => {
  const vessel = html.match(/<div data-layer="vessel"[\s\S]*?<\/div>/)?.[0];
  assert.ok(vessel, 'vessel layer is missing');
  for (let index = 0; index < 4; index += 1) {
    assert.ok(vessel.includes(`data-avatar-slot="female-cloud-${index}.svg"`));
  }
  assert.ok(!vessel.includes('assets/figures/breath-'));
  assert.match(html, /data-seat="6"[\s\S]*?data-avatar-slot="female-cloud-0\.svg"/);
  assert.ok(html.includes('image-rendering:pixelated'));
});
