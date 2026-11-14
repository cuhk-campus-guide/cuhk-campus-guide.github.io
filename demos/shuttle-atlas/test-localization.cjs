const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const context = vm.createContext({window:{}, document:{querySelector:()=>({})}});
context.window = context;
let lang = 'en', dictionary = {};
const opencc = path.join(root,'assets/vendor/opencc-full.js');
const traditional = fs.existsSync(opencc) ? require(opencc).Converter({from:'cn',to:'hk'}) : s=>s.replaceAll('学','學').replaceAll('线','線');
context.window.CUHK_I18N = {
  language:()=>lang, traditional,
  register:entries=>Object.assign(dictionary, entries), t:s=>dictionary[s]?.en || s,
  mountSwitcher:()=>{},
};
for (const file of ['data/cuhk_bus_routes.js','data/transport_route_schemes.js','demos/shuttle-atlas/topology.js','demos/shuttle-atlas/atlas-i18n.js']) {
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
}
vm.runInContext('CUHK_TRANSPORT_ROUTE_SCHEMES.applyTransportRouteScheme(CUHK_BUS_DATA,"2026-09")',context);
const before = vm.runInContext('JSON.stringify([CUHK_BUS_DATA,ShuttleAtlas.stations])',context);
vm.runInContext('window.AtlasI18n.init(CUHK_BUS_DATA,ShuttleAtlas.stations)',context);
const t = context.window.AtlasI18n.text;
assert.equal(t('大学站'), 'University Station');
assert.equal(t('伍宜孙书院'), 'Wu Yee Sun College');
assert.equal(t('三、四苑'), 'Wu Yee Sun College');
assert.equal(t('第 3 站'), 'Stop 3');
assert.equal(t('12 条线路 · 23 站'), '12 routes · 23 stops');
assert.equal(t('大学站，途经1、2S号线'), 'University Station, Served by Route 1, 2S');
assert.equal(t('往 大学站'), 'Towards University Station');
for (const route of vm.runInContext('ShuttleAtlas.build(CUHK_BUS_DATA,{includeMeetClass:true})',context)) {
  assert.doesNotMatch(t(route.label), /[\u3400-\u9fff]/u);
  assert.doesNotMatch(t(route.source.schedule.summary), /[\u3400-\u9fff]/u);
  for (let i=0;i<route.source.stops.length;i++) {
    assert.doesNotMatch(t(context.ShuttleAtlas.conditional(route.source,i)), /[\u3400-\u9fff]/u);
  }
}
lang = 'zh-Hant'; assert.equal(t('大学站'), '大學站');
assert.equal(t('伍宜孙书院'), traditional('伍宜孙书院'));
lang = 'zh-Hans'; assert.equal(t('大学站'), '大学站');
assert.equal(vm.runInContext('JSON.stringify([CUHK_BUS_DATA,ShuttleAtlas.stations])',context), before);
for (const file of ['index.html','road-map.html','single-line.html','compare.html','compare-a.html']) {
  const html = fs.readFileSync(path.join(__dirname,file),'utf8');
  assert(html.indexOf('../../assets/i18n.js') < html.indexOf('atlas-i18n.js'));
  assert(html.indexOf('atlas-i18n.js') < html.indexOf('src="topology.js'));
}
console.log('PASS: official names, all 12 route/service summaries, conditions, counts, three languages, synchronous loading and immutable model inputs.');

// Optional real-browser checks: PLAYWRIGHT_MODULE=/path/to/playwright node test-localization.cjs --browser
if (process.argv.includes('--browser')) browserTest().catch(error=>{console.error(error);process.exitCode=1;});
async function browserTest() {
  const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
  const http = require('node:http');
  const server = http.createServer((req,res)=>{
    const file = path.join(root, decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    const resolved = fs.existsSync(file) && fs.statSync(file).isDirectory() ? path.join(file,'index.html') : file;
    if (!resolved.startsWith(root+path.sep)) {res.writeHead(403).end();return;}
    fs.readFile(resolved,(error,bytes)=>{
      if(error){res.writeHead(404).end();return;}
      const type = {'.html':'text/html','.css':'text/css','.js':'text/javascript'}[path.extname(resolved)];
      res.setHeader('Content-Type',type||'application/octet-stream');res.end(bytes);
    });
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;
  try {
    browser = await chromium.launch({headless:true, channel:'chrome'});
    const page = await browser.newPage();
    const errors = []; page.on('pageerror',error=>errors.push(error.message));
    const shared = fs.existsSync(path.join(root,'assets/i18n.js'));
    if (!shared) {
      // Test the agreed contract without writing or replacing the parent's shared files.
      await page.route('**/assets/i18n.js',route=>route.fulfill({contentType:'text/javascript',body:`
        const dictionary={};const language=()=>new URLSearchParams(location.search).get('lang')||'zh-Hans';
        window.CUHK_I18N={language,traditional:s=>s.replaceAll('学','學').replaceAll('线','線'),
        t:s=>dictionary[s]?.[language()]||s,register:d=>Object.assign(dictionary,d),
        mountSwitcher:container=>{const select=document.createElement('select');select.ariaLabel='Language';
        for(const lang of ['zh-Hans','zh-Hant','en'])select.add(new Option(lang,lang));select.value=language();
        select.onchange=()=>{const url=new URL(location.href);url.searchParams.set('lang',select.value);location.href=url;};
        container.append(select);return select;}};document.documentElement.lang=language();`}));
      await page.route('**/assets/i18n.css',route=>route.fulfill({contentType:'text/css',body:''}));
    }
    const base = `http://127.0.0.1:${server.address().port}/demos/shuttle-atlas/`;
    for (const file of ['index.html','road-map.html','single-line.html']) {
      for (const width of [1440,390,320]) {
        await page.setViewportSize({width,height:900});
        for (const language of ['en','zh-Hant','zh-Hans']) {
          await page.goto(`${base}${file}?lang=${language}&layout=horizontal&style=a`);
          await page.locator('#drawing [data-station]').first().waitFor();
          assert.equal(await page.locator('[data-atlas-language] select').count(),1);
          assert(await page.locator('#drawing path').count()>0);
          const labels=await page.locator('.station-name,.station-title,.road-cn').allTextContents();
          assert.equal(labels.length,23);
          if(language==='en') {
            assert(labels.includes('University Station'));
            assert.doesNotMatch(labels.join(' '),/[\u3400-\u9fff]/u);
          }
          if(language==='zh-Hant' && shared)assert(labels.includes('大學站'));
          assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
          await page.locator(file==='index.html'?'#route-list [data-route="2"]':'#routes [data-route="2"]').click();
          await page.locator('#detail:not([hidden])').waitFor();
          if(language==='en')assert.doesNotMatch(await page.locator('#detail').innerText(),/[\u3400-\u9fff]/u);
          const overlapping = await page.evaluate(()=>{
            const a=document.querySelector('.identity').getBoundingClientRect(),b=document.querySelector('[data-atlas-language]').getBoundingClientRect();
            return a.right>b.left && a.left<b.right && a.top<b.bottom && a.bottom>b.top;
          });
          assert(!overlapping, `${file} ${width} ${language}: switcher overlaps identity`);
          assert(await page.evaluate(()=>[...document.querySelectorAll('header select,header button')].every(el=>{
            const box=el.getBoundingClientRect();return box.left>=0 && box.right<=innerWidth;
          })),`${file} ${width} ${language}: header control clipped`);
          if(process.env.ATLAS_SCREENSHOTS && language==='en' && width!==320) {
            fs.mkdirSync(process.env.ATLAS_SCREENSHOTS,{recursive:true});
            await page.screenshot({path:path.join(process.env.ATLAS_SCREENSHOTS,`${file}-${width}.png`)});
          }
        }
      }
    }
    await page.goto(`${base}?lang=en&layout=horizontal&style=a`);
    const downloadEvent = page.waitForEvent('download');
    await page.locator('#export').click();
    const download = await downloadEvent;
    const stream = await download.createReadStream();
    let exported = '';for await(const chunk of stream)exported+=chunk;
    assert(exported.includes('CUHK · Shuttle bus map'));
    assert(exported.includes('September 2026 routes'));
    assert(exported.includes('Wu Yee Sun'));
    for(const layout of ['geographic','semi-topology']) {
      await page.goto(`${base}?lang=en&layout=${layout}&style=a`);
      await page.locator('.station-name').first().waitFor();
      assert.equal(await page.locator('.station-name').count(),23);
      assert((await page.locator('.station-name').allTextContents()).includes('Wu Yee Sun College'));
    }
    for(const file of ['compare.html','compare-a.html']) {
      await page.goto(`${base}${file}?lang=en`);
      await page.locator('.design-card').first().waitFor();
      assert.equal(await page.locator('[data-atlas-language] select').count(),1);
      assert((await page.locator('.station-name').allTextContents()).includes('Wu Yee Sun College'));
    }
    await page.goto(`${base}?lang=en&layout=horizontal&style=a`);
    await page.locator('[data-atlas-language] select').selectOption('zh-Hant');
    await page.waitForURL('**/*lang=zh-Hant*');
    assert.equal(new URL(page.url()).searchParams.get('style'),'a');
    assert.equal(new URL(page.url()).searchParams.get('layout'),'horizontal');
    assert.deepEqual(errors,[]);
    console.log(`PASS: 27 browser view/language/width combinations, geographic/comparison views, SVG export, route selection, switcher and query preservation (${shared?'shared runtime':'contract stub; shared runtime absent'}).`);
  } finally {await browser?.close();await new Promise(resolve=>server.close(resolve));}
}
