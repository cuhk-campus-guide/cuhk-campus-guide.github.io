/* Presentation-only localization: never rewrite station IDs or model inputs. */
(() => {
  const runtime = () => window.CUHK_I18N;
  const language = () => runtime()?.language() || 'zh-Hans';
  const phrases = {
    '本部线':'Main campus', '新联线 S':'New Asia / United S', '新联线':'New Asia / United',
    '逸夫线':'Shaw', '环迴线':'Circular', '西部线':'Western campus', '晚间线':'Evening',
    '假日线':'Holiday', '上行线':'Uphill', '敬文下行':'C.W. Chu downhill',
    '新联下行':'New Asia / United downhill', '逸夫下行':'Shaw downhill',
    '全部校巴线路':'All bus routes', '全部穿梭线路':'All shuttle routes',
    '转堂校巴 · 仅教学日':'Class buses · teaching days only',
    '穿梭与转堂校巴':'Shuttle and class buses', '穿梭校巴':'Shuttle buses', '转堂校巴':'Class buses',
    '日间穿梭线路':'Daytime shuttles', '晚间与假日线路':'Evening and holiday routes',
    '非教学日':'Non-teaching days', '教学日':'Teaching days', '上行':'Uphill', '下行':'Downhill',
    '45 分班次':':45 departures', '00 分班次':':00 departures', '部分班次停靠':'Selected departures only',
    '部分班次':'Selected departures', '起点':'Start', '终点':'Terminus',
    '标准双语':'Standard bilingual', '精简中文':'Compact', '白底站牌':'White signs', '紫金强调':'Purple and gold',
    '纸本手绘':'Hand-drawn', '夜行信号':'Night signals', '校园路牌':'Campus signs',
    '2026 年 9 月线路方案':'September 2026 routes',
    '香港中文大学 · 校巴线路图':'CUHK · Shuttle bus map',
    '北向上，线路作平行偏移':'North up; routes offset in parallel',
    '北向上，线路简化，非导航地图':'North up; simplified routes, not for navigation',
    '线路示意，非地理比例':'Schematic, not to scale', '线路示意 · 非地理比例':'Schematic · not to scale',
    '北向上 · 线路示意':'North up · schematic', '北向上 · 地理位置版':'North up · geographic',
    '资料：中大交通处':'Source: CUHK Transport Office',
    '校巴线路图':'Shuttle bus map', '中大校巴路线图':'CUHK bus map', '香港中文大学':'The Chinese University of Hong Kong',
    '站点索引':'Stop index', '校巴线路':'Bus routes', '停靠站':'Stops', '校巴站':'Bus stops',
    '途经线路':'Routes', '全部':'All', '穿梭':'Shuttle', '转堂':'Class',
    '中大交通处':'CUHK Transport Office', '关闭详情':'Close details', '放大':'Zoom in', '缩小':'Zoom out',
    '查看全图':'Fit map', '下载线路图':'Download map', '下载 SVG':'Download SVG',
    '显示全部线路':'Show all routes', '全部线路':'All routes', '选择线路':'Select route',
    '选择校巴线路':'Select bus route', '服务类别':'Service type', '地图工具':'Map tools',
    '样式方案':'Map style', '并排比较四版':'Compare four styles', '并排比较':'Compare styles',
    '查看 A1 并线版':'View A1 map', 'A1 并线版':'A1 map',
    '校巴总线路图':'Bus network map', '可缩放校巴线路图':'Zoomable bus map',
    '可缩放校巴路线图':'Zoomable bus map', '可缩放穿梭校巴拓扑图':'Zoomable shuttle diagram',
    '中大校巴网络':'CUHK bus network', '校巴道路、方向与站牌':'Bus roads, directions and stops',
    '站点与途经线路':'Stops and routes',
    '穿梭校巴线路图':'Shuttle bus map', 'A 系列 · 交通导视':'A series · wayfinding',
    '四种样式比较':'Compare four styles', 'A系列四种样式比较':'Compare A-series styles',
    '线路颜色':'Route colours', '查看方案':'View style', '打开方案':'Open style',
    '完整线路图':'Full route map', '线路图':'Route map', '打开':'Open',
    '中大校巴线路图 · 四版比较':'CUHK bus map · style comparison',
    '中大校巴线路图 · A 系列比较':'CUHK bus map · A-series comparison',
    '周一至周六':'Monday–Saturday', '教学日周一至五':'Teaching days: Monday–Friday', '周六':'Saturday',
    '（星期日及公众假期除外）':' (except Sundays and public holidays) ',
    '（公众假期除外）':' (except public holidays) ', '星期日及公众假期':'Sundays and public holidays',
    '周六不服务':'No Saturday service', '公众假期停驶':'No service on public holidays',
    '只限教学日；非教学日、阅读周及大学假期暂停':'Teaching days only; no service on non-teaching days, reading weeks or University holidays',
    '只限教学日；周六、非教学日、阅读周及大学假期暂停':'Teaching days only; no service on Saturdays, non-teaching days, reading weeks or University holidays',
    '只限教学日；非教学日、阅读周及大学假期停驶':'Teaching days only; no service on non-teaching days, reading weeks or University holidays',
    '只限教学日':'Teaching days only', '不停逸夫书院':'Does not stop at Shaw College',
    '非教学日停大学站广场及崇基教学楼，不停大学站':'On non-teaching days, stops at Station Piazza and Chung Chi Teaching Buildings, not University Station',
    '每小时 45 分班次停邵逸夫堂':'The :45 departure stops at Sir Run Run Shaw Hall',
    '逢 00 分班次停研究生宿舍一座':'The :00 departure stops at 研究生宿舍一座',
    '每小时 00 分班次停研究生宿舍一座及 39 区':'The :00 departure stops at 研究生宿舍一座 and Area 39',
  };
  // Unverified proper-name extensions remain Chinese; only existing English fields are used below.
  let names = new Map();
  function init(data, stations) {
    names = new Map();
    for (const [id, s] of Object.entries(stations)) {
      const stop = data.stops[id] || {};
      const official = [stop.nameEn, stop.name_en, stop.en, id === 'residences_3_4' ? 'Wu Yee Sun College' : s.en].find(v => v && !/[\u3400-\u9fff]/u.test(v));
      for (const source of [s.name, stop.name, s.en]) {
        if (source) names.set(source, official || s.name);
      }
    }
    const dictionary = Object.fromEntries([...Object.entries(phrases), ...names].map(([source, en]) =>
      [source, {'zh-Hant':runtime()?.traditional(source) || source, en}]));
    runtime()?.register(dictionary);
    let container = document.querySelector('[data-atlas-language]');
    if (!container) {
      container = document.createElement('div');
      container.setAttribute('data-atlas-language', '');
      (document.querySelector('.header-actions') || document.querySelector('body > .app > header,.comparison-header'))?.append(container);
    }
    if (container) runtime()?.mountSwitcher(container);
  }
  function text(source) {
    if (language() === 'zh-Hans') return source;
    if (language() === 'zh-Hant') return runtime()?.traditional(source) || source;
    if (names.has(source)) return names.get(source);
    if (phrases[source]) return phrases[source];
    // Match only source tokens, once: replacements cannot translate parts of English names again.
    const entries = [...names, ...Object.entries(phrases)].sort((a,b) => b[0].length-a[0].length);
    const pattern = entries.map(([key]) => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const lookup = new Map(entries);
    const result = source.replace(new RegExp(pattern, 'g'), key => lookup.get(key))
      .replace(/([\dA-Z]+(?:、[\dA-Z]+)*)号线/g, (_, id) => `Route ${id.replaceAll('、', ', ')}`)
      .replace(/第 (\d+) 站/g, 'Stop $1')
      .replace(/(\d+) 条线路/g, '$1 routes').replace(/(\d+) 站/g, '$1 stops')
      .replace(/每小时 ([\d、]+) 分开出/g, (_, minutes) => `Departures at ${minutes.replaceAll('、', ', ')} minutes past each hour`)
      .replace(/查看(?=Route)/g, 'View ').replace(/途经(?=Route)/g, 'Served by ')
      .replace(/往 /g, 'Towards ').replace(/方案 /g, 'Style ').replace(/[；，、]/g, ', ');
    return runtime()?.t(result) || result;
  }
  const sources = new WeakMap();
  function apply(root = document.body) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node; (node = walker.nextNode());) {
      if (node.parentElement.closest('script,style,select,option,[data-atlas-wrapped]')) continue;
      const previous = sources.get(node);
      const source = previous && previous.result === node.nodeValue ? previous.source : node.nodeValue;
      const result = text(source);
      sources.set(node, {source, result});
      if (result !== node.nodeValue) node.nodeValue = result;
    }
    for (const el of root.querySelectorAll('[aria-label],[data-tooltip]')) {
      for (const attr of ['aria-label', 'data-tooltip']) {
        if (el.hasAttribute(attr)) el.setAttribute(attr, text(el.getAttribute(attr)));
      }
    }
    for (const label of root.querySelectorAll('.station-name,.station-title,.road-cn')) {
      if (label.dataset.atlasWrapped) continue;
      const group = label.closest('[data-station]');
      const secondary = group?.querySelector('.station-english,.station-subtitle,.road-en');
      if (language() !== 'en') {
        if (secondary) secondary.textContent = text(secondary.textContent);
        continue;
      }
      const full = label.textContent, x = label.getAttribute('x');
      const plate = group?.querySelector('.station-nameplate,.label-back,.road-panel');
      const width = Math.min(240, plate ? Number(plate.getAttribute('width'))-12 : 176);
      const words = full.split(/\s+/);
      let lines = [full, ''];
      for (let i = 1; i < words.length; i++) {
        const candidate = [words.slice(0,i).join(' '), words.slice(i).join(' ')];
        if (Math.max(...candidate.map(s=>s.length)) < Math.max(...lines.map(s=>s.length))) lines = candidate;
      }
      const road = label.classList.contains('road-cn');
      const y = Number(label.getAttribute('y')) - (road && lines[1] ? 27 : plate?.classList.contains('station-nameplate') && lines[1] ? 14 : 0);
      label.replaceChildren();
      label.dataset.atlasWrapped = 'true';
      const font = Math.min(22, width/(Math.max(...lines.map(line=>line.length))*.58));
      label.style.fontSize = `${font}px`;
      lines.filter(Boolean).forEach((line, i) => {
        const span = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        span.setAttribute('x', x); span.setAttribute('y', y+i*(road?27:22));
        span.textContent = line + (i === 0 && lines[1] ? ' ' : ''); label.append(span);
        if (span.getComputedTextLength?.() > width) {
          span.setAttribute('textLength', width); span.setAttribute('lengthAdjust', 'spacingAndGlyphs');
        }
      });
      if (secondary) secondary.textContent = '';
    }
  }
  window.AtlasI18n = {init, text, apply};
})();
