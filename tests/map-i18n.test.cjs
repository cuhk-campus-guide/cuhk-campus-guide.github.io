const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const helper = fs.readFileSync(path.join(root, 'assets/map-i18n.js'), 'utf8');
const inline = [...page.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
  .filter(([, attributes]) => !attributes.includes('src=') && !attributes.includes('application/ld+json'))
  .map(([, , body]) => body).join('\n');

// Keep these tests runnable while the shared runtime is being authored separately.
function harness(language = 'en') {
  const phrases = {};
  const traditional = value => value.replaceAll('约', '約').replaceAll('钟', '鐘')
    .replaceAll('发', '發').replaceAll('车', '車').replaceAll('时', '時').replaceAll('线', '線');
  const I18N = {
    language: () => language,
    register: entries => Object.assign(phrases, entries),
    t: value => language === 'en' ? phrases[value]?.en || value : language === 'zh-Hant' ? traditional(value) : value,
    name: entity => language === 'en' && entity.english ? entity.english : I18N.t(entity.name),
    traditional,
  };
  const context = vm.createContext({ window: { CUHK_I18N: I18N }, CUHK_I18N: I18N, console });
  vm.runInContext(helper, context);
  context.mapText = context.window.CUHK_MAP_I18N.text;
  context.mapName = I18N.name;
  context.mapHtml = value => value;
  return context;
}

function loadFunction(context, name) {
  const start = inline.indexOf(`    function ${name}(`);
  assert.notEqual(start, -1, name);
  const next = inline.indexOf('\n    function ', start + 1);
  vm.runInContext(inline.slice(start, next < 0 ? undefined : next), context);
}

test('all executable inline scripts and helper parse', () => {
  new vm.Script(inline);
  new vm.Script(helper);
});

test('head dependencies are synchronous, ordered, and precede data', () => {
  const files = ['assets/vendor/opencc-full.js', 'assets/i18n.js', 'assets/content-i18n.js', 'assets/map-i18n.js'];
  let previous = -1;
  for (const file of files) {
    const tag = `<script src="${file}`;
    const index = page.indexOf(tag);
    assert.ok(index > previous && index < page.indexOf('</head>'), file);
    previous = index;
  }
  assert.ok(previous < page.indexOf('src="data/'));
  assert.ok(page.includes('<link rel="stylesheet" href="assets/i18n.css'));
});

test('ETA, arrival, direction and evidence display strings translate without changing values', () => {
  const { mapText } = harness();
  const cases = [
    ['约 7 分钟', 'About 7 min'],
    ['即将出发', 'Departing'],
    ['即将到达', 'Due'],
    ['暂无 ETA', 'No ETA available'],
    ['当前估算 1,234 辆', '1,234 estimated running'],
    ['预计经过：12 条线路', 'Upcoming routes: 12'],
    ['预计下一班 09:18（约 7 分钟 · 上行）', 'Next arrival 09:18 (About 7 min · Uphill)'],
    ['预计下一班 23:00（即将到达）', 'Next arrival 23:00 (Due)'],
    ['时刻表估算 · 0/5站段', 'Timetable estimate · 0/5 segments'],
    ['GPS校准 · 5/5站段 · 19样本', 'GPS-calibrated · 5/5 segments · 19 samples'],
    ['部分GPS校准 · 2/5站段 · 3样本', 'Partially GPS-calibrated · 2/5 segments · 3 samples'],
    ['GPS样本较多 · 6/8站段 · 27个样本', 'More GPS samples · 6/8 segments · 27 samples'],
    ['GPS样本少 · 1/8站段 · 需继续校准', 'Few GPS samples · 1/8 segments · Further calibration needed'],
  ];
  for (const [source, expected] of cases) assert.equal(mapText(source), expected);
});

test('Simplified Chinese output is unchanged; Traditional delegates conversion', () => {
  const source = '预计下一班 09:18（约 7 分钟 · 上行）';
  assert.equal(harness('zh-Hans').mapText(source), source);
  assert.equal(harness('zh-Hant').mapText('约 7 分钟'), '約 7 分鐘');
});

test('unknown names and identifiers are not guessed or rewritten', () => {
  const { mapText } = harness();
  for (const value of ['MINI-UP', 'schedule-2S-123', '22.4194,114.2072', '新站（待核对）', '<b>&"']) {
    assert.equal(mapText(value), value);
  }
});

test('vehicle ETA adapter retains shared rounding and origin-departure behavior', () => {
  const context = harness();
  vm.runInContext(fs.readFileSync(path.join(root, 'data/cuhk_bus_routes.js'), 'utf8'), context);
  context.CUHK_BUS_UTILS = context.window.CUHK_BUS_UTILS;
  context.busVehicleNextStopEtaMinutes = vehicle => vehicle.testEta;
  loadFunction(context, 'isOriginDepartureVehicle');
  loadFunction(context, 'busVehicleEtaText');
  assert.equal(context.busVehicleEtaText({ route: {}, elapsedMinutes: 0.2, progress: 0 }), 'Departing');
  assert.equal(context.busVehicleEtaText({ route: {}, elapsedMinutes: 2, testEta: 6.1 }), 'About 7 min');
  assert.equal(context.busVehicleEtaText({ route: {}, elapsedMinutes: 2, testEta: 0.5 }), 'Due');
  assert.equal(context.busVehicleEtaText({ route: {}, elapsedMinutes: 2, testEta: NaN }), 'No ETA available');
});

test('LCD uses complete English names and preserves stop order, indexes and motion values', () => {
  const context = harness();
  context.CUHK_BUS_DATA = { stops: {
    a: { name: '中文甲 / 简称', english: 'Official Stop A / Annex' },
    waypoint: { kind: 'waypoint', name: 'waypoint' },
    b: { name: '中文乙', english: 'Official Stop B' },
  } };
  context.lcdBusSegmentProgress = () => ({ value: 25, label: '25%' });
  loadFunction(context, 'lcdSegmentState');
  loadFunction(context, 'buildLcdStops');
  const route = { stops: ['a', 'waypoint', 'b'] };
  const before = JSON.stringify(route);
  const stops = context.buildLcdStops(route, 2, 0.5);
  assert.equal(stops.length, 2);
  assert.equal(stops[0].shortName, 'Official Stop A / Annex');
  assert.equal(stops[1].shortName, 'Official Stop B');
  assert.equal(stops[1].routeStopIndex, 2);
  assert.equal(stops[0].busLeft, '75%');
  assert.equal(stops[0].busHere, true);
  assert.equal(JSON.stringify(route), before);
});

test('arrival card escaping retains IDs and does not inject translated names as HTML', () => {
  const context = harness();
  loadFunction(context, 'escapeHtml');
  loadFunction(context, 'metroItemHtml');
  const html = context.metroItemHtml({ id: 'schedule-2S-123', label: '2S', expanded: false,
    color: '#123456', textColor: '#fff', routeName: '<img src=x>', nextStopName: 'A & B', etaText: 'About 7 min' });
  assert.ok(html.includes('data-id="schedule-2S-123"'));
  assert.ok(html.includes('&lt;img src=x&gt;'));
  assert.ok(html.includes('A &amp; B'));
  assert.ok(!html.includes('<img src=x>'));
});

test('legacy collection remains disabled and marker names are accessible', () => {
  assert.match(inline, /const ENABLE_WEB_GPS_COLLECTION = false;/);
  assert.match(inline, /const ENABLE_WEB_PASSENGER_REPORTS = false;/);
  assert.match(inline, /title: mapName\(entry.stop\),\s+alt: mapName\(entry.stop\)/);
  assert.match(inline, /title: readableName\(tags\), alt: readableName\(tags\)/);
  assert.match(inline, /title: mapName\(venue\), alt: mapName\(venue\)/);
});
