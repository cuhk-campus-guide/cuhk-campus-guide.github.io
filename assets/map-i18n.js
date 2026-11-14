(function (root) {
  "use strict";
  const I18N = root.CUHK_I18N;
  const phrases = {
    "视图切换": "Switch view", "地图": "Map", "线路图": "Route map",
    "预计到下一站": "Estimated arrival at next stop", "线路消息": "Route notices",
    "车辆到站": "Bus arrivals", "时刻表估算 · 预计到下一站": "Timetable estimates · Next stop arrivals",
    "返回地图": "Back to map", "香港中文大学地图": "CUHK campus map",
    "暂无运行中的校巴": "No buses currently running", "始发站": "Origin",
    "下一站": "Next stop", "接近终点": "Approaching terminus",
    "即将出发": "Departing soon", "即将到达": "Arriving soon", "暂无 ETA": "No ETA available",
    "校巴": "Shuttle", "站": "B", "上": "↑", "下": "↓", "双": "↕", "环": "↻",
    "上行": "Uphill", "下行": "Downhill", "环线": "Circular",
    "上行 / 下行": "Uphill / Downhill", "按线路方向": "In route direction",
    "站点方向：": "Stop direction: ", "方向：": "Direction: ", "校巴站点": "Shuttle stop",
    "提示：": "Note: ", "可信度：": "Confidence: ", "站段依据：": "Segment evidence: ",
    "时刻：": "Timetable: ", "估算运行：": "Estimated journey: ", "分钟": "min", "未知": "Unknown",
    "当前没有预计会经过本站的班次": "No upcoming services expected at this stop",
    "临时站精确坐标待确认，请按现场站牌候车。": "The temporary stop's exact location is unconfirmed. Please wait at the posted stop sign.",
    "交通处原公告": "Transport Office notice", "官方时刻表": "Official timetable",
    "时刻表估算 · 非实时 GPS": "Timetable estimate · Not live GPS",
    "班次详情": "Trip details", "发车": "Departure",
    "样本较多": "More samples", "GPS校准": "GPS-calibrated", "样本少": "Few samples",
    "时刻表估算": "Timetable estimate", "全段校准": "All segments calibrated", "部分校准": "Partially calibrated",
    "按时刻表和路线估算": "Estimated from timetable and route",
    "周末样本少，ETA仅供参考": "Limited weekend samples; ETAs are indicative only",
    "暑期/假期班次和客流会变，ETA仅供参考": "Summer/holiday schedules and demand may vary; ETAs are indicative only",
    "假期前后班次和客流会变，ETA仅供参考": "Schedules and demand may vary around holidays; ETAs are indicative only",
    "暂无预计到站": "No arrival estimate", "临时暂停服务": "Service temporarily suspended",
    "今日无常规班次": "No regular service today", "今日班次已结束": "Service has ended for today",
    "暂无官方时刻表": "No official timetable available",
    "常规穿梭校巴": "Regular shuttle", "晚间穿梭校巴": "Night shuttle",
    "星期日及公众假期穿梭校巴": "Sunday and public holiday shuttle", "转堂校巴": "Meet-class shuttle",
    "收费穿梭小巴": "Paid minibus",
    "餐厅/饭堂": "Restaurants / Canteens", "快餐/小食": "Fast food / Snacks", "咖啡": "Coffee",
    "奶茶茶饮": "Milk tea / Tea", "其他饮品": "Other drinks", "医疗": "Medical", "住宿": "Accommodation", "码头": "Pier",
    "食": "F", "快": "F", "咖": "C", "茶": "T", "医": "+", "宿": "H",
    "营业时间：": "Opening hours: ", "未命名地点": "Unnamed place",
    "近期活动": "Upcoming events", "活动": "Events", "官方详情": "Official details",
    "核对日期：": "Checked: ", "；入场安排以主办方为准。": "; admission is subject to the organiser's arrangements.",
    "约 {n} 分钟": "About {n} min", "当前估算 {n} 辆": "{n} estimated running",
    "预计经过：{n} 条线路": "Upcoming routes: {n}",
    "预计下一班 {time}（{eta}{direction}）": "Next arrival {time} ({eta}{direction})",
    "时刻表估算 · {coverage}站段": "Timetable estimate · {coverage} segments",
    "GPS校准 · {coverage}站段 · {samples}样本": "GPS-calibrated · {coverage} segments · {samples} samples",
    "部分GPS校准 · {coverage}站段 · {samples}样本": "Partially GPS-calibrated · {coverage} segments · {samples} samples",
    "GPS样本较多 · {coverage} · {samples}个样本": "More GPS samples · {coverage} · {samples} samples",
    "GPS校准 · {coverage} · {samples}个样本": "GPS-calibrated · {coverage} · {samples} samples",
    "GPS样本少 · {coverage} · 需继续校准": "Few GPS samples · {coverage} · Further calibration needed",
    "{n}站段": "{n} segments",
  };
  I18N.register(Object.fromEntries(Object.entries(phrases).map(([source, en]) => [source, { en }])));

  // Exact short labels shared with demos/shuttle-atlas/atlas-i18n.js.
  const routeNames = {
    "本部线": "Main campus", "新联线": "New Asia / United",
    "新联线 S": "New Asia / United S", "新联线（S）": "New Asia / United S",
    "逸夫线": "Shaw", "环迴线": "Circular", "西部线": "Western campus",
    "晚间线": "Evening", "假日线": "Holiday", "上行线": "Uphill",
    "敬文下行": "C.W. Chu downhill", "下行线": "C.W. Chu downhill",
    "新联下行": "New Asia / United downhill", "下行短线": "New Asia / United downhill",
    "逸夫下行": "Shaw downhill", "逸夫下行线": "Shaw downhill",
    "收费小巴上行": "Paid minibus uphill", "收费小巴下行": "Paid minibus downhill",
  };
  // ShuttleAtlas.stations: current bus stop names and the atlas's verified aliases.
  // Register at head-load time: the main map does not load the atlas model itself.
  const stopNames = [
    ["University Station", ["大学站"]],
    ["Station Piazza", ["大学站广场"]],
    ["Yasumoto International Academic Park", ["康本国际学术园 / 康本园", "康本国际学术园", "康本园"]],
    ["Chung Chi Teaching Buildings", ["崇基学院教学楼", "崇基教学楼"]],
    ["University Sports Centre", ["大学体育中心"]],
    ["Sir Run Run Shaw Hall", ["邵逸夫堂"]],
    ["Science Centre", ["科学馆"]],
    ["Fung King Hey Building", ["冯景禧楼"]],
    ["University Administration", ["大学行政楼"]],
    ["S.H. Ho College", ["善衡书院"]],
    ["United College", ["联合书院"]],
    ["New Asia College", ["新亚书院"]],
    ["New Asia Circle", ["新亚坊"]],
    ["Shaw College", ["逸夫书院"]],
    ["Postgraduate Hall", ["赛马会研究生宿舍", "研究生宿舍"]],
    ["C.W. Chu College", ["敬文书院"]],
    ["Area 39", ["39区"]],
    ["Residence 15", ["15苑"]],
    ["United Residence", ["联合苑"]],
    ["Chan Chun Ha Hostel", ["陈震夏宿舍"]],
    ["Campus Circuit East", ["环迴东路"]],
    ["Campus Circuit North", ["环迴北站"]],
    // Additional exact bilingual data.buildings and item.building.english names.
    ["Wong Foo Yuan Building", ["王福元楼"]],
    ["Academic Building I", ["教研楼一座"]],
    ["Ho Tim Building", ["何添楼"]],
    ["Ho Sin-Hang Engineering Building", ["何善衡工程学大楼"]],
    ["Lee Woo Sing College", ["和声书院"]],
    ["Wu Yee Sun College", ["伍宜孙书院"]],
    ["University Library", ["大学图书馆"]],
    ["University Health Centre", ["大学保健医疗中心"]],
    ["University Residence No. 11", ["第十一苑", "11苑"]],
  ];
  // These full names have no exact bilingual counterpart in the allowed sources.
  // Identity entries also prevent t() from translating only a known substring.
  const unverifiedStopNames = [
    "崇基C、D座", "伍宜孙书院 / 三、四苑", "三、四苑",
    "10苑 / 11苑", "10苑", "大学保健处", "大学图书馆 / 文物馆", "文物馆",
  ];
  I18N.register(Object.fromEntries([
    ...Object.entries(routeNames),
    ...stopNames.flatMap(([en, sources]) => sources.map(source => [source, en])),
    ...unverifiedStopNames.map(source => [source, source]),
  ].map(([source, en]) => [source, { en }])));

  const formats = [
    [/^约 (\d+) 分钟$/, "约 {n} 分钟", ["n"]],
    [/^当前估算 ([\d,]+) 辆$/, "当前估算 {n} 辆", ["n"]],
    [/^预计经过：([\d,]+) 条线路$/, "预计经过：{n} 条线路", ["n"]],
    [/^预计下一班 (\d{2}:\d{2})（(.+?)( · (?:上行|下行))?）$/, "预计下一班 {time}（{eta}{direction}）", ["time", "eta", "direction"]],
    [/^时刻表估算 · (\d+\/\d+)站段$/, "时刻表估算 · {coverage}站段", ["coverage"]],
    [/^GPS校准 · (\d+\/\d+)站段 · (\d+)样本$/, "GPS校准 · {coverage}站段 · {samples}样本", ["coverage", "samples"]],
    [/^部分GPS校准 · (\d+\/\d+)站段 · (\d+)样本$/, "部分GPS校准 · {coverage}站段 · {samples}样本", ["coverage", "samples"]],
    [/^GPS样本较多 · (.+站段) · (\d+)个样本$/, "GPS样本较多 · {coverage} · {samples}个样本", ["coverage", "samples"]],
    [/^GPS校准 · (.+站段) · (\d+)个样本$/, "GPS校准 · {coverage} · {samples}个样本", ["coverage", "samples"]],
    [/^GPS样本少 · (.+站段) · 需继续校准$/, "GPS样本少 · {coverage} · 需继续校准", ["coverage"]],
    [/^([\d/]+)站段$/, "{n}站段", ["n"]],
  ];

  // Adapt only formatted display strings; the shared ETA/calendar utilities remain untouched.
  function text(value) {
    const source = String(value ?? "");
    for (const [pattern, phrase, keys] of formats) {
      const match = source.match(pattern);
      if (!match) continue;
      const values = Object.fromEntries(keys.map((key, index) => {
        const part = match[index + 1] || "";
        return [key, key === "direction" && part ? ` · ${text(part.slice(3))}` : text(part)];
      }));
      return I18N.t(phrase).replace(/\{(\w+)\}/g, (_, key) => values[key]);
    }
    return I18N.t(source);
  }

  function html(markup) {
    const template = document.createElement("template");
    template.innerHTML = markup;
    const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      node.nodeValue = node.nodeValue.replace(/\S(?:[\s\S]*\S)?/, (value) => text(value));
    }
    I18N.translateDOM(template.content);
    return template.innerHTML;
  }
  root.CUHK_MAP_I18N = { text, html };
})(window);
