const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createHash,webcrypto}=require('node:crypto');
const read=name=>fs.readFileSync(path.join(__dirname,name),'utf8');
function runtime(language){
  const dictionary={};
  return {dictionary,language:()=>language,register:entries=>Object.assign(dictionary,entries),
    t:source=>dictionary[source]?.[language]||source};
}
function load(language){
  const i18n=runtime(language),context=vm.createContext({CUHK_I18N:i18n});
  vm.runInContext(read('core.js'),context);
  return {core:context.CUHK_WEB_GPS,i18n,context};
}
const hash=value=>createHash('sha256').update(value).digest('hex');
test('all page copy and generated phrases have explicit Traditional Chinese and English',()=>{
  const {i18n}=load('en');
  const html=read('index.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
  const sources=[...html.matchAll(/>([^<>]+)</g)].map(match=>match[1].trim())
    .filter(text=>/[\u3400-\u9fff]/u.test(text));
  for(const file of ['core.js','app.js','transport.js']){
    for(const match of read(file).matchAll(/\bt\('([^']+)'\)/g))sources.push(match[1]);
  }
  for(const source of sources){
    assert.ok(i18n.dictionary[source],`Missing phrase: ${source}`);
    assert.ok(i18n.dictionary[source]['zh-Hant']);
    assert.doesNotMatch(i18n.t(source),/[\u3400-\u9fff]/u);
  }
  assert.match(i18n.t('结束后由上传函数写入本项目腾讯云的独立网页轨迹集合。原始轨迹不公开，不直接参与模型训练，也不自动获得小程序积分。'),/do not automatically earn/);
  assert.equal(load('zh-Hant').core.t('请先同意采集与上传说明'),'請先同意採集與上傳說明');
});
test('consent gates location; localized trips have identical coordinates, schema, manifest and upload bodies',async()=>{
  const payloads=[];
  for(const language of ['zh-Hans','zh-Hant','en']){
    const {core}=load(language);let watches=0,clears=0,receive;
    const now=Date.parse('2026-11-13T08:00:00Z'),saved=[];
    const collector=new core.Collector({geo:{watchPosition:fn=>{watches++;receive=fn;return 7;},clearWatch:()=>clears++},
      store:{put:async row=>saved.push(row)},now:()=>now,uuid:()=> 'fixed-id',timers:{setTimeout:()=>1,clearTimeout:()=>{}}});
    await assert.rejects(collector.start('MINI-N','up',false));
    assert.equal(watches,0);assert.equal(saved.length,0);
    await collector.start('MINI-N','up',true);
    receive({timestamp:now,coords:{longitude:114.2051234,latitude:22.4201234,accuracy:8}});
    const row=await collector.stop('user_alight');
    assert.equal(clears,1);assert.equal(collector.saving,0);
    assert.equal(row.schema,'web_gps_session_v1');assert.equal(row.source,'web_browser');
    assert.equal(row.coordinateSystem,'browser_wgs84_unverified');
    assert.equal(row.consentVersion,'web-gps-consent-20261113-v1');
    assert.equal(row.routeId,'MINI-N');assert.equal(row.direction,'up');
    assert.equal(row.gpsSamples[0].lon,114.2051234);assert.equal(row.gpsSamples[0].lat,22.4201234);
    const calls=[];
    await core.upload(row,async data=>{calls.push(data);return {ok:true,completed:data.action==='complete',digest:data.digest};},hash);
    assert.deepEqual(calls.map(data=>data.action),['init','chunk','complete']);
    payloads.push(JSON.stringify(calls));
    await assert.rejects(core.upload(row,async()=>({ok:false,message:'未知云端错误'}),hash),language==='en'?/server has not confirmed saving/:/未知云端错误/);
  }
  assert.equal(payloads[0],payloads[1]);assert.equal(payloads[0],payloads[2]);
});
test('saving remains observable until final persistence resolves',async()=>{
  const {core}=load('en');let release,block=false;
  const collector=new core.Collector({geo:{watchPosition:()=>1,clearWatch:()=>{}},store:{put:()=>block?new Promise(resolve=>{release=resolve;}):Promise.resolve()},
    now:()=>0,uuid:()=> 'id',timers:{setTimeout:()=>1,clearTimeout:()=>{}}});
  await collector.start('1','unknown',true);block=true;
  const stopping=collector.stop('page_hidden');
  assert.equal(collector.current,null);assert.equal(collector.saving,1);
  await Promise.resolve();await Promise.resolve();release();await stopping;
  assert.equal(collector.saving,0);
});
test('transport translates cloud errors without changing credentials or protocol',async()=>{
  const {context,core}=load('en');const requests=[];
  Object.assign(context,{window:context,CUHK_WEB_GPS_CONFIG:{enabled:true,endpoint:'https://example.invalid/collector'},
    localStorage:{getItem:()=> 'original-token'},AbortController,TextEncoder,crypto:webcrypto,
    setTimeout:(fn,ms)=>ms===35000?1:setTimeout(fn,0),clearTimeout,
    fetch:async(url,options)=>{requests.push({url,options});return {ok:false,status:429,json:async()=>({message:'未知云端错误'})};}});
  vm.runInContext(read('transport.js'),context);
  const data={action:'chunk',id:'original-id',digest:'abc',index:0,points:[{lon:114.2,lat:22.42}]};
  const result=await context.CUHK_GPS_TRANSPORT.call(data);
  assert.equal(result.message,core.t('上传请求较多，请稍后重试，轨迹仍在本机'));
  assert.equal(result.code,'daily_limit');
  assert.equal(requests[0].url,'https://example.invalid/collector');
  assert.equal(requests[0].options.headers.Authorization,'Bearer original-token');
  assert.equal(requests[0].options.body,JSON.stringify(data));
  assert.equal(requests[0].options.credentials,'omit');
  assert.equal(await context.CUHK_GPS_TRANSPORT.hash('literal protocol'),hash('literal protocol'));
});
test('OpenCC and shared runtime load before collector scripts',()=>{
  const html=read('index.html');
  const scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(match=>match[1].split('?')[0]);
  assert.ok(scripts.indexOf('../assets/vendor/opencc-full.js')<scripts.indexOf('../assets/i18n.js'));
  for(const script of ['core.js','transport.js','app.js'])assert.ok(scripts.indexOf('../assets/i18n.js')<scripts.indexOf(script));
});

// Optional real-browser contract checks: PLAYWRIGHT_MODULE=/path/to/playwright node --test this-file.
test('320px browser: consent, direction labels, language lock and local-save reload safety',
  {skip:!process.env.PLAYWRIGHT_MODULE},async()=>{
    const {chromium}=require(process.env.PLAYWRIGHT_MODULE);
    const {createServer}=require('node:http');
    const root=path.resolve(__dirname,'..');
    const server=createServer((req,res)=>{
      const filename=path.resolve(root,'.'+new URL(req.url,'http://local').pathname);
      if(!filename.startsWith(root+path.sep)){res.writeHead(403).end();return;}
      fs.readFile(filename,(error,body)=>{
        if(error){res.writeHead(404).end();return;}
        res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.html':'text/html','.png':'image/png'})[path.extname(filename)]||'text/plain');res.end(body);
      });
    });
    const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE}:{})});
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    try{
      const context=await browser.newContext({viewport:{width:320,height:700}});
      // Stub only the documented shared API when the parent asset is not available.
      await context.route('**/assets/i18n.js',route=>route.fulfill({contentType:'application/javascript',body:`
        const dictionary={};const language=new URL(location.href).searchParams.get('lang')||'en';
        window.CUHK_I18N={language:()=>language,register:entries=>Object.assign(dictionary,entries),t:source=>dictionary[source]?.[language]||source,
          mountSwitcher(container){const select=document.createElement('select');select.setAttribute('aria-label','Language');
            for(const [value,label] of [['zh-Hans','简体'],['zh-Hant','繁體'],['en','English']])select.add(new Option(label,value));
            select.value=language;select.onchange=()=>this.setLanguage(select.value);container.append(select);return select;},
          setLanguage(lang){localStorage.setItem('test-language',lang);const url=new URL(location.href);url.searchParams.set('lang',lang);location.href=url;}};`}));
      await context.route('**/assets/i18n.css',route=>route.fulfill({contentType:'text/css',body:''}));
      const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
      await page.addInitScript(()=>{
        window.geoCalls=0;window.networkCalls=0;
        Object.defineProperty(navigator,'geolocation',{value:{watchPosition(){window.geoCalls++;return 1;},clearWatch(){}}});
        window.fetch=()=>{window.networkCalls++;throw Error('Unexpected upload');};
      });
      const url=`http://127.0.0.1:${server.address().port}/web-gps/index.html`;
      await page.goto(url+'?lang=en');
      await page.locator('#action:not([disabled])').waitFor();
      await page.locator('#action').click();await page.locator('.line-choice').first().click();
      assert.deepEqual(await page.locator('#direction option').allTextContents(),['Unknown','Uphill','Downhill']);
      await page.locator('#start').click();
      await page.locator('#picker-status').filter({hasText:'Please consent'}).waitFor();
      assert.equal(await page.evaluate(()=>geoCalls),0);
      await page.locator('#ride-privacy').click();
      assert.equal(await page.locator('#privacy-dialog').evaluate(el=>el.scrollTop),0);
      assert.match(await page.locator('#privacy-dialog').innerText(),/do not automatically earn mini-program points/);
      for(const id of ['privacy-dialog','ride-dialog']){
        const dimensions=await page.locator('#'+id).evaluate(el=>[el.scrollWidth,el.clientWidth]);assert.ok(dimensions[0]<=dimensions[1]);
      }
      if(process.env.GPS_SCREENSHOTS)await page.screenshot({path:path.join(process.env.GPS_SCREENSHOTS,'gps-english-privacy-320.png')});
      await page.locator('#privacy-dialog button').click();
      await page.locator('#consent').check();await page.locator('#start').click();
      await page.locator('#recording-badge').waitFor();await page.locator('#menu').click();
      assert.equal(await page.locator('#gps-language-switcher select').isDisabled(),true);
      assert.equal(await page.evaluate(()=>geoCalls),1);
      await page.evaluate(()=>document.querySelector('#menu-dialog').close());
      await page.locator('#action').click();await page.locator('#menu').click();
      assert.equal(await page.locator('#gps-language-switcher select').isDisabled(),false);
      const dimensions=await page.locator('#menu-dialog').evaluate(el=>[el.scrollWidth,el.clientWidth]);assert.ok(dimensions[0]<=dimensions[1]);
      if(process.env.GPS_SCREENSHOTS)await page.screenshot({path:path.join(process.env.GPS_SCREENSHOTS,'gps-english-menu-320.png')});
      await page.setViewportSize({width:1280,height:800});
      const desktopDimensions=await page.locator('#menu-dialog').evaluate(el=>[el.scrollWidth,el.clientWidth]);assert.ok(desktopDimensions[0]<=desktopDimensions[1]);
      if(process.env.GPS_SCREENSHOTS)await page.screenshot({path:path.join(process.env.GPS_SCREENSHOTS,'gps-english-menu-desktop.png')});
      await page.locator('#gps-language-switcher select').selectOption('zh-Hant');await page.waitForURL('**lang=zh-Hant');
      await page.locator('#action:not([disabled])').waitFor();
      assert.equal(await page.evaluate(()=>geoCalls),0);assert.equal(await page.evaluate(()=>networkCalls),0);
      assert.equal(await page.locator('#action').innerText(),'上車');
      await page.locator('#menu').click();await page.locator('#open-queue').click();
      await page.locator('.queue-row').waitFor();assert.match(await page.locator('.queue-row').innerText(),/手動結束/);
      assert.deepEqual(errors,[]);await context.close();
    }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
  });
