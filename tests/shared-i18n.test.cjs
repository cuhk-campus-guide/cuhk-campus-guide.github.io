const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),guide=require('../data/campus_guide.js'),OpenCC=require('../assets/vendor/opencc-full.js');
const original=JSON.stringify(guide);
function harness(lang='zh-Hans',stored=null,storageThrows=false){
  const writes=[],navigation=[];
  const context={OpenCC,URL,URLSearchParams,queueMicrotask,console,CUHK_CAMPUS_GUIDE:guide,
    location:{search:'?style=a&lang='+encodeURIComponent(lang),href:'https://cuhk-campus-guide.github.io/?style=a&lang='+encodeURIComponent(lang)+'#map',assign:url=>navigation.push(url)},
    localStorage:{getItem(){if(storageThrows)throw Error('denied');return stored;},setItem:(k,v)=>writes.push([k,v])}};
  context.window=context;vm.createContext(context);
  for(const file of ['assets/i18n.js','assets/place-names.js','assets/content-i18n.js','assets/map-i18n.js','assets/campus_guide_core.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
  return {I:context.CUHK_I18N,C:context.CUHK_GUIDE_CORE,context,writes,navigation};
}
test('actual shared runtime covers all languages and Hong Kong proper-name spelling',()=>{
  const en=harness('en').I,trad=harness('zh-Hant').I,simp=harness().I;
  assert.equal(en.t('校园地图'),'Campus map');assert.equal(en.t('找到 1 个地点'),'1 place found');
  assert.equal(en.t('找到 12 个地点'),'12 places found');
  assert.equal(en.t('中大校巴路线图 · 道路骨架版'),'CUHK bus map · Road network diagram');
  assert.equal(trad.t('图书馆'),'圖書館');assert.equal(simp.t('圖書館'),'图书馆');
  assert.equal(trad.name({name:'范克廉楼'}),'范克廉樓');
  assert.equal(trad.t('Zoom out'),'縮小');assert.equal(simp.t('Zoom in'),'放大');
});
test('English names use existing fields and never partially translate unknown names',()=>{
  const {I}=harness('en');
  assert.equal(I.name({name:'大学行政楼 University Administration Building'}),'University Administration Building');
  assert.equal(I.name({name:'香港沙田凱悅酒店'}),'Hyatt Regency Hong Kong, Sha Tin');
  assert.equal(I.name({name:'某校内未核实地点甲'}),'某校内未核实地点甲');
  assert.equal(I.name({name:'大学站'}),'University Station');
  assert.equal(I.t('MINI-S'),'MINI-S');
});
test('search accepts English and Traditional Chinese without changing the data',()=>{
  const {C}=harness('en');
  assert(C.search('Administration','building').some(item=>item.shortName==='UAB'));
  assert(C.search('圖書館','building').some(item=>item.shortName==='UL'));
  assert.equal(C.displayNames(C.search('UAB','building')[0]).primary,'University Administration Building');
  assert.equal(JSON.stringify(guide),original);
});
test('all current shuttle stops and routes translate with real runtime; source data stays unchanged',()=>{
  const {I,context}=harness('en');
  vm.runInContext(fs.readFileSync(path.join(root,'data/cuhk_bus_routes.js'),'utf8'),context);
  for(const file of ['data/transport_route_schemes.js','data/campus_updates.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
  context.CUHK_TRANSPORT_ROUTE_SCHEMES.applyTransportRouteScheme(context.CUHK_BUS_DATA,context.CUHK_TRANSPORT_ROUTE_SCHEMES.normalizeSchemeId(null));
  context.CUHK_CAMPUS_UPDATES.applyTemporaryStops(context.CUHK_BUS_DATA);
  const data=context.CUHK_BUS_DATA, before=JSON.stringify(data);
  const stops=Object.values(data.stops).filter(stop=>stop.kind!=='waypoint');
  assert(stops.length>=30);
  for(const item of [...stops,...data.routes])assert(!/[\u3400-\u9fff]/u.test(I.name(item)),item.name);
  assert.equal(I.name({name:'伍宜孙书院 / 三、四苑'}),'Wu Yee Sun College / Residences 3 & 4');
  assert.equal(I.name({name:'10苑 / 11苑'}),'Residences 10 / 11');
  assert.equal(I.name({name:'大学图书馆 / 文物馆'}),'University Library / Art Museum');
  assert.equal(I.t('即将到达'),'Due');assert.equal(I.t('即将出发'),'Departing');
  assert.equal(JSON.stringify(data),before);
});
test('explicit language overrides saved choice and switch preserves query/hash',()=>{
  const {I,writes,navigation}=harness('zh-Hant','en');assert.equal(I.language(),'zh-Hant');
  I.setLanguage('en');assert.deepEqual(writes,[['cuhk-web-language-v1','en']]);
  const url=new URL(navigation[0]);assert.equal(url.searchParams.get('style'),'a');assert.equal(url.searchParams.get('lang'),'en');assert.equal(url.hash,'#map');
  I.setLanguage('not-a-language');assert.equal(navigation.length,1);
});
test('invalid preferences and blocked storage do not prevent map startup',()=>{
  assert.equal(harness('bad','en').I.language(),'en');
  assert.equal(harness('bad',null,true).I.language(),'zh-Hans');
  assert.equal(harness('en',null,true).I.language(),'en');
});
test('published data, ETA inputs and private endpoint settings stay unchanged',()=>{
  assert.equal(JSON.stringify(guide),original);
  const config=fs.readFileSync(path.join(root,'web-gps/config.js'),'utf8');
  assert(config.includes("enabled: true"));assert(config.includes('/web-gps-upload'));
  assert(!config.includes('secret')||config.includes('Never put a secret'));
});
