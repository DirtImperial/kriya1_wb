// node --test tests/progress.test.js  — checks the practice's progress rules in the Component script
// exactly as public/index.html ships it (no DOM; setState applies synchronously).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
const source = html.match(/<script type="text\/x-dc" data-dc-script[^>]*>([\s\S]*?)<\/script>/)[1];

function practice(environment = 'grove') {
  class DCLogic {
    constructor() { this.state = {}; }
    setState(update) { this.state = { ...this.state, ...update }; }
    forceUpdate() {}
  }
  const context = { DCLogic, window: { waveEnvironment: environment }, document: { getElementById: () => null }, console };
  const Component = vm.runInNewContext(source + '\n;Component', context);
  const app = new Component();
  app.beginPractice();
  return app;
}

const view = (app) => app.renderVals();
// Values cross the vm boundary, so compare plain copies.
const plain = (value) => JSON.parse(JSON.stringify(value));
const fills = (app) => plain(view(app).segments.map((s) => s.fill));
const doneParts = (app) => plain(view(app).segments.map((s) => s.done === 'true'));
const click = { stopPropagation() {} };
const stageOf = (app, title) => app.STAGES.findIndex((s) => s.title === title);

test('six parts hold the 20 instructions; the intro is separate', () => {
  const app = practice();
  assert.equal(app.STAGES.length, 21);
  assert.equal(app.placeFor(0), null);
  assert.deepEqual(plain(app.partGroups(app.STAGES).map((g) => g.indexes.length)), [8, 3, 2, 3, 3, 1]);
  assert.equal(view(app).segments.length, app.chapterNames.length);
});

test('begin: first instruction current with zero fill and a visible local count', () => {
  const app = practice();
  const v = view(app);
  assert.equal(app.state.stage, 1);
  assert.deepEqual(fills(app), Array(6).fill('width:0%'));
  assert.equal(v.segments[0].current, 'true');
  assert.equal(v.navStep, 'Step 1 of 8');
  assert.equal(v.navName, 'View session. Posture, part 1 of 6, step 1 of 8.');
  assert.equal(v.eyebrow, '');
});

test('Continue acknowledges once and advances once; Back keeps acknowledgment', () => {
  const app = practice();
  app.advance();
  assert.equal(app.state.stage, 2);
  assert.equal(fills(app)[0], 'width:12.5%');
  app.go(1);
  assert.equal(app.state.stage, 1);
  assert.equal(fills(app)[0], 'width:12.5%');
  assert.equal(view(app).navStep, 'Reviewing · Step 1 of 8');
  app.advance(); // re-acknowledging is a no-op
  assert.equal(fills(app)[0], 'width:12.5%');
});

test('clicking the scene advances; the instruction and the controls do not', () => {
  const app = practice();
  const clickOn = (hit) => ({
    target: { closest: (sel) => (hit && sel.includes(hit) ? {} : null) },
    defaultPrevented: false
  });
  view(app).onSceneClick(clickOn(null));
  assert.equal(app.state.stage, 2);
  assert.equal(fills(app)[0], 'width:12.5%');
  view(app).onSceneClick(clickOn('[data-textzone]'));
  view(app).onSceneClick(clickOn('button'));
  view(app).onSceneClick(clickOn('.wb-bar'));
  assert.equal(app.state.stage, 2, 'reading the instruction or using a control stays on this step');
  app.openOverview();
  view(app).onSceneClick(clickOn(null));
  assert.equal(app.state.stage, 2, 'an open overview keeps the step');
});

test('the forward key shortcut uses the same transition; buttons and open dialogs own their keys', () => {
  const app = practice();
  const key = (k, target = { tagName: 'BODY', closest: () => null }) => app.onKey({ key: k, target, preventDefault() {} });
  key('ArrowRight');
  assert.equal(app.state.stage, 2);
  key(' ', { tagName: 'BUTTON', closest: (s) => (s.includes('button') ? {} : null) });
  assert.equal(app.state.stage, 2, 'Space on a button is left to the button');
  app.openOverview();
  key('ArrowRight');
  assert.equal(app.state.stage, 2, 'shortcuts are suspended while the overview is open');
});

test('opening the map and expanding parts change nothing', () => {
  const app = practice();
  app.advance();
  const before = JSON.stringify([app.state.stage, fills(app)]);
  app.openOverview();
  assert.equal(app.state.mapPart, 0);
  for (const row of view(app).mapRows.filter((r) => r.isPart)) row.onToggle(click);
  assert.equal(JSON.stringify([app.state.stage, fills(app)]), before);
  assert.equal(app.state.partsOpen, true);
});

test('every part expands on its own; headings expand, steps jump', () => {
  const app = practice();
  app.openOverview();
  for (let part = 0; part < 6; part++) {
    app.setState({ mapPart: -1 });
    view(app).mapRows.find((r) => r.id === 'wb-map-part-' + part).onToggle(click);
    const rows = view(app).mapRows;
    const panel = rows.filter((r) => r.isSteps);
    assert.equal(panel.length, 1, 'one part expanded at a time');
    assert.equal(rows.find((r) => r.id === 'wb-map-part-' + part).controls, panel[0].id);
    assert.equal(app.state.stage, 1);
  }
  const mantra = view(app).mapRows.find((r) => r.isSteps);
  assert.ok(mantra.steps.every((s) => s.excerpt === ''), 'unique titles need no excerpt');
  app.setState({ mapPart: 2 });
  const soHum = view(app).mapRows.find((r) => r.isSteps).steps;
  assert.equal(soHum[0].title, soHum[1].title);
  assert.notEqual(soHum[0].excerpt, soHum[1].excerpt);
  soHum[1].onJump(click);
  assert.equal(app.state.stage, stageOf(app, 'SO HUM') + 1);
  assert.equal(app.state.partsOpen, false);
});

test('jumping ahead leaves skipped parts incomplete', () => {
  const app = practice();
  app.advance();
  app.advance();
  app.jumpToStep(stageOf(app, 'Bring the four together'));
  const v = view(app);
  assert.deepEqual(fills(app), ['width:25%', 'width:0%', 'width:0%', 'width:0%', 'width:0%', 'width:0%']);
  assert.equal(v.segments[4].current, 'true');
  assert.deepEqual(doneParts(app), Array(6).fill(false));
});

test('finishing after a jump acknowledges the last instruction, then ends neutrally', () => {
  const app = practice();
  app.jumpToStep(app.STAGES.length - 1);
  assert.equal(view(app).forwardLong, 'Finish session');
  app.advance();
  assert.equal(app.state.done, true);
  assert.equal(app.state.complete, false);
  assert.deepEqual(doneParts(app), [false, false, false, false, false, true]);
  assert.equal(view(app).doneTitle, 'Practice ended.');
  view(app).onRevisit(click);
  assert.equal(app.state.stage, 0);
  assert.equal(app.state.done, false);
  assert.equal(doneParts(app)[5], true, 'Revisit keeps real progress');
  app.openOverview();
  assert.equal(app.state.mapPart, 0, 'the intro opens Posture for a look');
  assert.ok(view(app).mapRows.every((r) => r.current !== 'true'));
});

test('acknowledging every instruction completes the sitting', () => {
  const app = practice();
  const labels = [];
  while (!app.state.done) {
    labels.push(view(app).forwardLong);
    app.advance();
  }
  assert.equal(app.state.complete, true);
  assert.equal(view(app).doneTitle, 'This sitting is complete.');
  assert.deepEqual(doneParts(app), Array(6).fill(true));
  assert.deepEqual(labels.filter((l) => l !== 'Continue'),
    ['Next: Breath', 'Next: Mantra', 'Next: Visualization', 'Next: Integration', 'Next: Compassion and Thanks', 'Finish session']);
  view(app).onStartAgain(click);
  assert.deepEqual(fills(app), Array(6).fill('width:0%'));
});

test('the mountain environment keeps its own Visualization wording', () => {
  const app = practice('mountain');
  assert.ok(app.STAGES.some((s) => s.title === 'Ground, mountain, sky'));
  assert.equal(app.placeFor(stageOf(app, 'Ground, mountain, sky')).name, 'Visualization');
});

test('the office environment keeps its own Visualization wording', () => {
  const app = practice('office');
  assert.ok(app.STAGES.some((s) => s.title === 'Seat, window, lamp'));
  const rest = app.STAGES.find((s) => s.title === 'Rest in the expanse');
  assert.match(rest.body, /chair beneath you/);
  assert.equal(app.placeFor(stageOf(app, 'Seat, window, lamp')).name, 'Visualization');
});
