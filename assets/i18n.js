(function(root) {
  'use strict';
  const KEY='cuhk-web-language-v1', supported=['zh-Hans','zh-Hant','en'];
  const aliases={'zh-CN':'zh-Hans','zh-SG':'zh-Hans','zh-HK':'zh-Hant','zh-TW':'zh-Hant','en-HK':'en','en-US':'en'};
  const normalizeLanguage=value=>supported.includes(value)?value:aliases[value]||null;
  let current='zh-Hans';
  try{current=normalizeLanguage(new URLSearchParams(root.location.search).get('lang'))||normalizeLanguage(root.localStorage.getItem(KEY))||current;}catch{}
  const phrases=new Map(), names=new Map(), cache=new Map(), nativeTraditional=new Map(), ambiguousNames=new Set();
  let toHant,toHans,phraseOrder=null,nameOrder=null,guideSeen=null,busSeen=null,placesSeen=null,domReady=false;
  const chinese=/[\u3400-\u9fff]/;
  function traditional(value){
    if(!root.OpenCC)return String(value||'');
    toHant=toHant||root.OpenCC.Converter({from:'cn',to:'hk'});
    const source=String(value||''),exact=nativeTraditional.get(simplified(source));
    if(exact)return exact;
    // Preserve published proper-name spellings where a generic converter differs.
    return toHant(source).replace(/範克廉/g,'范克廉');
  }
  function simplified(value){if(!root.OpenCC)return String(value||'');toHans=toHans||root.OpenCC.Converter({from:'hk',to:'cn'});return toHans(String(value||''));}
  function register(dictionary){
    for(const [source,value] of Object.entries(dictionary||{}))phrases.set(simplified(source),typeof value==='string'?{en:value}:value);
    phraseOrder=null;cache.clear();
    if(domReady&&root.document?.body)schedule(root.document.body);
  }
  function bilingual(value){
    const text=String(value||'').trim(), match=text.match(/^(.+[\u3400-\u9fff）)])\s+([A-Za-zÀ-ž].*)$/);
    return match?{zh:match[1].trim(),en:match[2].trim()}:{zh:chinese.test(text)?text:'',en:chinese.test(text)?'':text};
  }
  function englishOf(item){
    if(!item)return '';
    const explicit=[item.english,item.nameEn,item.name_en,item.en].find(v=>typeof v==='string'&&/[A-Za-z]/.test(v)&&!chinese.test(v));
    return explicit||bilingual(item.name||item.title||'').en;
  }
  function addName(source,en){
    if(!source||!en||chinese.test(en))return;
    const parsed=bilingual(source),key=simplified(parsed.zh||source);
    if(chinese.test(key))for(const candidate of new Set([key,simplified(source)])){
      if(ambiguousNames.has(candidate))continue;
      if(names.has(candidate)&&names.get(candidate)!==en){names.delete(candidate);ambiguousNames.add(candidate);}
      else names.set(candidate,en);
      nameOrder=null;
    }
  }
  function learnNames(){
    if(root.CUHK_PLACE_NAMES&&root.CUHK_PLACE_NAMES!==placesSeen){placesSeen=root.CUHK_PLACE_NAMES;for(const [source,en]of Object.entries(placesSeen))addName(source,en);cache.clear();}
    const data=root.CUHK_CAMPUS_GUIDE;
    if(data&&data!==guideSeen){
      guideSeen=data;
      for(const label of data.basemap?.labels||[])nativeTraditional.set(simplified(label.name),label.name);
      [...(data.buildings||[]),...(data.dining||[])].forEach(item=>{
        const en=englishOf(item);addName(item.name,en);
        for(const alias of item.aliases||[])if(chinese.test(alias))addName(alias,en);
      });
      for(const item of data.items||[]){
        addName(item.name||item.title,englishOf(item));
        if(item.building)addName(item.building.name,englishOf(item.building));
      }
      cache.clear();
    }
    const bus=root.CUHK_BUS_DATA;
    if(bus&&bus!==busSeen){busSeen=bus;for(const stop of Object.values(bus.stops||{}))addName(stop.name,englishOf(stop));}
  }
  function englishText(value){
    const source=simplified(value);
    const exact=phrases.get(source)?.en||names.get(source);
    if(exact)return exact;
    if(source.includes('\n'))return source.split('\n').map(t).join('\n');
    let match;
    if((match=source.match(/^找到 (\d+) 个地点$/)))return `${match[1]} ${Number(match[1])===1?'place':'places'} found`;
    if((match=source.match(/^(\d+) 分钟$/)))return `${match[1]} min`;
    if((match=source.match(/^(\d+) 秒$/)))return `${match[1]} sec`;
    if((match=source.match(/^往\s*(.+)$/)))return `To ${t(match[1])}`;
    if((match=source.match(/^(\d+)号月台$/)))return `Platform ${match[1]}`;
    if((match=source.match(/^第\s*(\d+)\s*站$/)))return `Stop ${match[1]}`;
    if((match=source.match(/^(\d+) 条线路 \/ (\d+) 站$/)))return `${match[1]} routes / ${match[2]} stops`;
    if((match=source.match(/^正在上传 (\d+)\/(\d+)$/)))return `Uploading ${match[1]}/${match[2]}`;
    if((match=source.match(/^另有 (\d+) 项线路方向$/)))return `${match[1]} more route directions`;
    // Translate authoritative names before generic UI fragments. Never change source data.
    let result=source;
    nameOrder=nameOrder||[...names.keys()].filter(s=>s.length>1).sort((a,b)=>b.length-a.length);
    for(const key of nameOrder)if(result.includes(key))result=result.split(key).join(names.get(key));
    phraseOrder=phraseOrder||[...phrases.keys()].filter(s=>chinese.test(s)&&s.length>1).sort((a,b)=>b.length-a.length);
    for(const key of phraseOrder)if(result.includes(key)&&phrases.get(key).en)result=result.split(key).join(phrases.get(key).en);
    result=result.replace(/星期([一二三四五六日天])/g,(_,d)=>({一:'Mon',二:'Tue',三:'Wed',四:'Thu',五:'Fri',六:'Sat',日:'Sun',天:'Sun'})[d]);
    result=result.replace(/周([一二三四五六日天])/g,(_,d)=>({一:'Mon',二:'Tue',三:'Wed',四:'Thu',五:'Fri',六:'Sat',日:'Sun',天:'Sun'})[d]);
    result=result.replace(/(\d+(?:\.\d+)?)\s*分钟/g,'$1 min').replace(/(\d+(?:\.\d+)?)\s*公里/g,'$1 km').replace(/(\d+(?:\.\d+)?)\s*米/g,'$1 m');
    result=result.replace(/(\d+)\s*号线/g,'Route $1').replace(/(\d+)\s*个点/g,'$1 points').replace(/(\d+)\s*年\s*(\d+)\s*月/g,'$1-$2');
    return result;
  }
  function t(value){
    const text=String(value??'');if(!chinese.test(text)){const entry=phrases.get(text);return entry?.[current]||(current==='en'?entry?.en:null)||text;}
    learnNames();
    if(cache.has(text))return cache.get(text);
    const result=current==='en'?englishText(text):current==='zh-Hant'?(phrases.get(simplified(text))?.['zh-Hant']||traditional(text)):simplified(text);
    if(cache.size>5000)cache.clear();cache.set(text,result);return result;
  }
  function name(item){
    if(typeof item==='string')item={name:item};
    const source=String(item?.name||item?.title||'');
    learnNames();
    if(current==='en')return englishOf(item)||phrases.get(simplified(source))?.en||names.get(simplified(source))||source;
    const zh=bilingual(source).zh||source;
    return current==='zh-Hant'?traditional(zh):simplified(zh);
  }
  function setLanguage(value){
    const next=normalizeLanguage(value);if(!next||next===current)return;
    try{root.localStorage.setItem(KEY,next);}catch{}
    const url=new URL(root.location.href);url.searchParams.set('lang',next);root.location.assign(url.href);
  }
  function mountSwitcher(container){
    const label=document.createElement('label');label.className='cuhk-language-picker';label.dataset.noI18n='';
    const title=document.createElement('span');title.textContent=t('语言');
    const select=document.createElement('select');select.className='cuhk-language-select';select.setAttribute('aria-label',t('语言'));
    for(const [value,text] of [['zh-Hans','简体中文'],['zh-Hant','繁體中文'],['en','English']]){const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option);}
    select.value=current;select.addEventListener('change',()=>setLanguage(select.value));label.append(title,select);container.append(label);return select;
  }
  const excluded='script,style,noscript,code,pre,textarea,option,svg,.guide-map-label,[data-no-i18n]';
  function translateDOM(node){
    if(!node)return;
    if(node.nodeType===11){for(const child of node.childNodes)translateDOM(child);return;}
    if(node.nodeType===3){if(!node.parentElement?.closest(excluded)){const value=t(node.nodeValue);if(value!==node.nodeValue)node.nodeValue=value;}return;}
    if(node.nodeType!==1||node.matches(excluded))return;
    for(const attr of ['aria-label','aria-description','title','placeholder','alt'])if(node.hasAttribute(attr)){const value=t(node.getAttribute(attr));if(value!==node.getAttribute(attr))node.setAttribute(attr,value);}
    for(const child of node.childNodes)translateDOM(child);
  }
  const pending=new Set();let queued=false;
  function schedule(node){
    pending.add(node);if(queued)return;queued=true;
    queueMicrotask(()=>{queued=false;const work=[...pending];pending.clear();for(const item of work)if(item.isConnected)translateDOM(item);});
  }
  function localizeMetadata(){
    document.documentElement.lang=current==='zh-Hant'?'zh-HK':current==='zh-Hans'?'zh-CN':'en';
    document.title=t(document.title);
    for(const meta of document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"],meta[property="og:site_name"],meta[property="og:image:alt"],meta[name="twitter:title"],meta[name="twitter:description"],meta[name="twitter:image:alt"]'))meta.content=t(meta.content);
    const locale=document.querySelector('meta[property="og:locale"]');if(locale)locale.content=current==='en'?'en_HK':current==='zh-Hant'?'zh_HK':'zh_CN';
    const canonical=document.querySelector('link[rel="canonical"]');
    if(canonical){
      const base=new URL(canonical.href);base.searchParams.delete('lang');
      for(const lang of supported){const existing=document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`),link=existing||document.createElement('link'),url=new URL(base);if(lang!=='zh-Hans')url.searchParams.set('lang',lang);link.rel='alternate';link.hreflang=lang;link.href=url.href;if(!existing)document.head.append(link);}
      const url=new URL(base);if(current!=='zh-Hans')url.searchParams.set('lang',current);canonical.href=url.href;
      const ogUrl=document.querySelector('meta[property="og:url"]');if(ogUrl)ogUrl.content=url.href;
      for(const script of document.querySelectorAll('script[type="application/ld+json"]')){
        try{const value=JSON.parse(script.textContent);const visit=obj=>{if(!obj||typeof obj!=='object')return;for(const [key,item] of Object.entries(obj)){if(key==='name'&&typeof item==='string')obj[key]=name({name:item});else if(key==='description'&&typeof item==='string')obj[key]=t(item);else if(key==='inLanguage')obj[key]=document.documentElement.lang;else if(typeof item==='object')visit(item);}if(obj['@type']==='WebPage')obj.url=url.href;};visit(value);script.textContent=JSON.stringify(value);}catch{}
      }
    }
  }
  register({
    '语言':{en:'Language'},'校园地图菜单':{en:'Campus map menu','zh-Hant':'校園地圖選單'},'中大校园':{en:'CUHK Campus'},
    'Zoom in':{en:'Zoom in','zh-Hant':'放大','zh-Hans':'放大'},'Zoom out':{en:'Zoom out','zh-Hant':'縮小','zh-Hans':'缩小'},
    '校园地图':{en:'Campus map'},'车辆到站':{en:'Bus arrivals'},'线路总览':{en:'Route atlas'},'地图显示':{en:'Map layers'},'校园设施':{en:'Campus facilities'},'贡献轨迹':{en:'Contribute GPS'},
    '返回主菜单':{en:'Back to menu'},'外观':{en:'Appearance'},'浅色':{en:'Light'},'深色':{en:'Dark'},'校巴':{en:'Shuttle bus'},'站点':{en:'Stops'},'餐厅':{en:'Dining'},'常用设施':{en:'Facilities'},'步行道':{en:'Walkways'},
    '关闭弹层':{en:'Close panel'},'查看校园全图':{en:'Fit campus map'},'地点搜索':{en:'Place search'},'搜索地点':{en:'Search places'},'搜索起点':{en:'Search start point'},'地点名称、楼宇缩写':{en:'Place name or building code'},
    '返回地图':{en:'Back to map'},'清空搜索':{en:'Clear search'},'终点：':{en:'Destination: '},'当前位置':{en:'Current location'},'搜索类别':{en:'Search categories'},'选择导航起点':{en:'Choose a starting point'},
    '全部':{en:'All'},'建筑':{en:'Buildings'},'设施':{en:'Facilities'},'常用地点':{en:'Common places'},'没有找到匹配地点':{en:'No matching places'},'公共巴士站':{en:'Public bus stop'},'全部线路':{en:'All routes'},
    '详情':{en:'Details'},'完整资料':{en:'More details'},'地点资料':{en:'Place details'},'返回搜索':{en:'Back to search'},'地图位置':{en:'Show on map'},'导航至建筑':{en:'Directions to building'},'官方来源':{en:'Official source'},'官方资料':{en:'Official information'},'联系电话':{en:'Contact phone'},
    '港铁':{en:'MTR'},'大学站港铁':{en:'University Station (MTR)'},'大学站 · 东铁线':{en:'University Station · East Rail Line'},'大学站':{en:'University Station'},'东铁线':{en:'East Rail Line'},'九巴':{en:'KMB'},'小巴':{en:'Minibus'},
    '金钟':{en:'Admiralty'},'会展':{en:'Exhibition Centre'},'红磡':{en:'Hung Hom'},'旺角东':{en:'Mong Kok East'},'九龙塘':{en:'Kowloon Tong'},'大围':{en:'Tai Wai'},'沙田':{en:'Sha Tin'},'火炭':{en:'Fo Tan'},'马场':{en:'Racecourse'},'大埔墟':{en:'Tai Po Market'},'太和':{en:'Tai Wo'},'粉岭':{en:'Fanling'},'上水':{en:'Sheung Shui'},'罗湖':{en:'Lo Wu'},'落马洲':{en:'Lok Ma Chau'},
    '往罗湖 / 落马洲方向':{en:'Towards Lo Wu / Lok Ma Chau'},'往金钟方向':{en:'Towards Admiralty'},'北行':{en:'Northbound'},'南行':{en:'Southbound'},'经马场':{en:'Via Racecourse'},
    '预计到站':{en:'Expected arrival'},'预计开出':{en:'Expected departure'},'预计时间':{en:'Expected time'},'即将到站':{en:'Arriving'},'即将开出':{en:'Departing'},'即将出发':{en:'Departing soon'},'即将到达':{en:'Arriving'},'即将':{en:'Due'},'下一站':{en:'Next stop'},'暂无时间':{en:'No time available'},'暂无列车时间':{en:'No train times available'},'港铁提示列车延误':{en:'MTR reports a service delay'},
    '正在读取列车时间':{en:'Loading train times'},'暂时无法读取港铁资料，请稍后重试':{en:'MTR information is temporarily unavailable. Try again later.'},'列车资料已过期，请刷新':{en:'Train information is out of date. Refresh to try again.'},'港铁正在实施特别服务安排':{en:'Special MTR service arrangements are in effect'},'港铁暂未提供大学站资料':{en:'University Station information is unavailable'},'港铁暂未提供列车时间':{en:'Train times are unavailable'},'暂无列车时间，不代表已停运':{en:'No train times available; this does not confirm service suspension'},
    '刷新列车时间':{en:'Refresh train times'},'车站资料':{en:'Station information'},'港铁特别安排':{en:'MTR service notices'},'目的地':{en:'Destination'},'月台':{en:'Platform'},'首末班与开放时间':{en:'First / last trains and opening hours'},'车站开放':{en:'Station open'},'首班':{en:'First'},'末班':{en:'Last'},'出口与无障碍设施':{en:'Exits and accessibility'},'常用目的地票价':{en:'Fares to common destinations'},'成人八达通':{en:'Adult Octopus'},'学生八达通':{en:'Student Octopus'},'官方车站平面图':{en:'Official station layout'},'官方街道图':{en:'Official street map'},
    '饮水机':{en:'Water dispenser'},'打印设施':{en:'Printing'},'学习空间':{en:'Study space'},'小卖部':{en:'Convenience shop'},'售货机':{en:'Vending machine'},'无障碍洗手间':{en:'Accessible toilet'},'升降机':{en:'Lift'},'坡道':{en:'Ramp'},'医疗服务':{en:'Medical services'},'身心支援':{en:'Wellbeing support'},'运动设施':{en:'Sports facilities'},'哺乳室':{en:'Baby care room'},'回收设施':{en:'Recycling'},'IT 服务':{en:'IT services'},'学生服务':{en:'Student services'},'保安求助':{en:'Security assistance'},'步行路线':{en:'Walking route'},'连廊天桥':{en:'Covered link / footbridge'},'校园提示':{en:'Campus notice'},'洗衣设施':{en:'Laundry'},'储物柜':{en:'Lockers'},'淋浴设施':{en:'Showers'},'步行拍卡':{en:'Walking scheme tap point'},'九巴优惠站':{en:'KMB fare saver'},'教室':{en:'Classroom'},'公共交通站':{en:'Public transport stop'},'港铁出口':{en:'MTR exit'},'校园地标':{en:'Campus landmark'},
    '校巴站':{en:'Shuttle bus stop'},'坐标待核实':{en:'Location unverified'},'暂停营业':{en:'Temporarily closed'},'仅供查阅，暂不提供导航':{en:'Information only; directions unavailable'},'校外地点，不提供校园导航':{en:'Off campus; campus directions unavailable'},'导航至所在建筑':{en:'Directions to building'},'线路目录，非实时班次':{en:'Route directory, not live arrivals'},'位置为所在建筑，非设备或室内入口精确坐标。':{en:'The pin marks the building, not the exact facility or indoor entrance.'},
    '资料来源：':{en:'Source: '},'核对日期：':{en:'Checked: '},'更新 ': {en:'Updated '},'静态资料核对':{en:'Static information checked'},'开放时段待核实':{en:'Opening hours unverified'},'公众假期':{en:'Public holidays'},'休息':{en:'Closed'},'关闭':{en:'Closed'},'营业时间':{en:'Opening hours'},
    'CUHK 校园指南｜香港中文大学校巴、餐厅与校园地图':{en:'CUHK Campus Guide | Shuttle buses, dining and campus map'},'CUHK 校园指南｜中大校巴与校园地图':{en:'CUHK Campus Guide | Shuttle buses and campus map'},'CUHK 校园指南':{en:'CUHK Campus Guide'},'中大校巴线路图｜CUHK 校园指南':{en:'Shuttle route atlas | CUHK Campus Guide'},'中大校巴线路图':{en:'CUHK Shuttle Route Atlas'},'贡献轨迹 · 中大校巴':{en:'Contribute GPS · CUHK Shuttle'},
    '独立维护的香港中文大学（CUHK）校园指南，提供中大校巴线路与预计到站时间、餐厅营业时间、设施地点搜索及校巴总线路图。非校方官方服务，运营安排以学校最新公告为准。':{en:'An independent CUHK campus guide with shuttle routes and estimated arrivals, dining hours, place search and a route atlas. Not an official University service; refer to the latest University announcements.'},
    '校巴线路、预计到站、餐厅营业时间与校园设施查询。独立维护，非校方官方服务。':{en:'Shuttle routes, estimated arrivals, dining hours and campus facilities. Independently maintained; not an official University service.'},'校巴线路、预计到站、餐厅营业时间与校园设施查询。非校方官方服务。':{en:'Shuttle routes, estimated arrivals, dining hours and campus facilities. Not an official University service.'},
    '独立维护的中大校巴、餐厅与校园设施地图，非校方官方服务。':{en:'An independent CUHK shuttle, dining and campus facilities map; not an official University service.'},'CUHK Campus Guide 独立项目':{en:'CUHK Campus Guide independent project'},'CUHK 校园指南的紫金色校园地图与校巴位置示意':{en:'The CUHK Campus Guide map with purple-and-gold estimated shuttle markers'},'CUHK 校园指南的校园地图画面':{en:'The CUHK Campus Guide map'},'CUHK 校园指南校园地图':{en:'CUHK Campus Guide map'},
    '香港中文大学校巴总线路图，查看穿梭校巴、转堂校巴及各站途经线路。此图为非地理比例示意，实际运营安排以中大交通处最新公告为准。':{en:'CUHK shuttle and meet-class bus route atlas with stops and routes. Schematic, not to geographic scale. Actual service follows the latest CUHK Transport Office notices.'},'查看中大穿梭校巴、转堂校巴与站点线路总览。独立项目，运营安排以交通处公告为准。':{en:'Explore CUHK shuttle and meet-class routes and stops. Independent project; actual service follows Transport Office notices.'},'中大穿梭校巴、转堂校巴与站点线路总览，非校方官方服务。':{en:'CUHK shuttle and meet-class routes and stops. Not an official University service.'}
  });
  const api={language:()=>current,t,traditional,simplified,name,englishOf,bilingual,setLanguage,mountSwitcher,register,translateDOM};
  root.CUHK_I18N=api;
  if(typeof module!=='undefined')module.exports=api;
  if(root.document){
    const ready=()=>{
      domReady=true;
      learnNames();localizeMetadata();translateDOM(document.body);
      const observer=new MutationObserver(records=>{for(const record of records){if(record.type==='childList')for(const node of record.addedNodes)schedule(node);else schedule(record.target);}});
      observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','aria-description','title','placeholder','alt']});
      document.addEventListener('click',event=>{
        const link=event.target.closest?.('a[href]');if(!link||link.hasAttribute('download')||link.getAttribute('href').startsWith('#'))return;
        try{const url=new URL(link.href);if(url.origin!==location.origin||(!url.pathname.endsWith('/')&&!url.pathname.endsWith('.html')))return;if(current==='zh-Hans')url.searchParams.delete('lang');else url.searchParams.set('lang',current);link.href=url.href;}catch{}
      },true);
    };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
  }
})(typeof globalThis==='undefined'?window:globalThis);
