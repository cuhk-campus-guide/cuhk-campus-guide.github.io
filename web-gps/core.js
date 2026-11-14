(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CUHK_WEB_GPS = api;
})(globalThis, function() {
  const phrases = [
    ['贡献轨迹 · 中大校巴','貢獻軌跡 · 中大校巴','Contribute a trip · CUHK Shuttle'],
    ['贡献轨迹','貢獻軌跡','Contribute a trip'],
    ['当前采集轨迹地图','目前採集軌跡地圖','Current trip map'],
    ['菜单','選單','Menu'],['打开菜单','開啟選單','Open menu'],
    ['采集状态','採集狀態','Recording status'],['尚未开始','尚未開始','Not started'],
    ['上车','上車','Board'],['下车','下車','Alight'],['采集菜单','採集選單','Trip menu'],
    ['浅深色','淺深色','Appearance'],['切换浅色','切換淺色','Light mode'],['切换深色','切換深色','Dark mode'],
    ['待上传记录','待上傳記錄','Pending uploads'],['采集说明','採集說明','Data & privacy'],
    ['返回校园地图','返回校園地圖','Campus map'],['选择校巴线路','選擇校巴路線','Choose shuttle route'],
    ['校巴线路','校巴路線','Shuttle routes'],['所选线路','所選路線','Selected route'],['选择线路','選擇路線','Choose route'],
    ['方向（可选）','方向（可選）','Direction (optional)'],['方向','方向','Direction'],
    ['未确认','未確認','Unknown'],['上行','上行','Uphill'],['下行','下行','Downhill'],
    ['同意采集并上传本次乘车位置到项目腾讯云，用于校巴研究。','同意採集並上傳本次乘車位置到項目騰訊雲，用於校巴研究。','I consent to collecting and uploading location data for this trip to the project’s Tencent Cloud for shuttle research.'],
    ['详情','詳情','Details'],['请保持页面在前台；切出时停止并本地保存。','請保持頁面在前台；切出時停止並儲存於本機。','Keep this page in the foreground. Leaving it stops recording and saves locally.'],
    ['开始采集','開始採集','Start recording'],['位置数据说明','位置資料說明','Location data & privacy'],
    ['只在你按下开始并允许浏览器定位后采集。记录线路、方向、采样时间、经纬度、定位精度和结束原因，不采集姓名、手机号、照片或通讯录。','只在你按下開始並允許瀏覽器定位後採集。記錄路線、方向、採樣時間、經緯度、定位精度和結束原因，不採集姓名、手機號碼、照片或通訊錄。','Collection begins only after you press Start and allow browser location access. Records include route, direction, sample time, latitude, longitude, location accuracy and the reason recording ended. Names, phone numbers, photos and contacts are not collected.'],
    ['结束后由上传函数写入本项目腾讯云的独立网页轨迹集合。原始轨迹不公开，不直接参与模型训练，也不自动获得小程序积分。','結束後由上傳函數寫入本項目騰訊雲的獨立網頁軌跡集合。原始軌跡不公開，不直接參與模型訓練，也不自動獲得小程式積分。','After recording ends, the upload function writes the trip to a separate web-trip collection in this project’s Tencent Cloud. Raw tracks are not public, are not used directly for model training, and do not automatically earn mini-program points.'],
    ['切出页面会停止定位并保存在本机。关闭或刷新页面后不会自动继续采集。上传失败可重试或导出；只有服务器确认完整保存后，才清理本机该条轨迹。清除浏览器数据可能导致未上传记录丢失。','切出頁面會停止定位並儲存於本機。關閉或重新整理頁面後不會自動繼續採集。上傳失敗可重試或匯出；只有伺服器確認完整儲存後，才清理本機該條軌跡。清除瀏覽器資料可能導致未上傳記錄遺失。','Leaving this page stops location collection and saves locally. Closing or refreshing the page does not resume collection automatically. Failed uploads can be retried or exported. A local trip is removed only after the server confirms it was saved in full. Clearing browser data may erase trips that have not been uploaded.'],
    ['知道了','知道了','Understood'],['语言','語言','Language'],
    ['停止采集并等待保存或上传完成后，才可切换语言。','停止採集並等待儲存或上傳完成後，才可切換語言。','Stop recording and wait for saving or uploading to finish before changing language.'],
    ['本部线','本部線','Main Campus'],['新联线','新聯線','New Asia / United'],['新联线 S','新聯線 S','New Asia / United S'],['逸夫线','逸夫線','Shaw'],['环迴线','環迴線','Circular'],['西部线','西部線','Western Campus'],['晚间线','晚間線','Evening'],['假日线','假日線','Holiday'],['上行线','上行線','Uphill'],['下行线','下行線','Downhill'],['下行短线','下行短線','Short downhill'],['逸夫下行线','逸夫下行線','Shaw downhill'],['收费小巴上行','收費小巴上行','Paid minibus uphill'],['收费小巴下行','收費小巴下行','Paid minibus downhill'],
    ['采集中','採集中','Recording'],['仅记录本次校内乘车轨迹','僅記錄本次校內乘車軌跡','Recording only this on-campus trip'],
    ['手动结束','手動結束','Ended manually'],['切出页面，已停止','切出頁面，已停止','Stopped after leaving page'],['页面关闭','頁面關閉','Page closed'],['上次采集中断','上次採集中斷','Previous recording interrupted'],['已到90分钟上限','已到90分鐘上限','90-minute limit reached'],['已到采样上限','已到採樣上限','Sample limit reached'],['已离开校内采集范围','已離開校內採集範圍','Outside campus collection area'],['定位权限被拒绝','定位權限被拒絕','Location permission denied'],['定位错误','定位錯誤','Location error'],
    ['没有待上传轨迹','沒有待上傳軌跡','No pending trips'],['线路','路線','Route'],['个点','個點','samples'],['本机保存','本機儲存','Saved locally'],['重试上传','重試上傳','Retry upload'],['导出轨迹','匯出軌跡','Export trip'],['删除本机记录','刪除本機記錄','Delete local trip'],
    ['无法读取本机记录，请检查浏览器存储权限','無法讀取本機記錄，請檢查瀏覽器儲存權限','Cannot read local trips. Check browser storage permissions.'],['正在上传','正在上傳','Uploading'],['轨迹已完整上传，感谢您的数据支持','軌跡已完整上傳，感謝您的資料支持','Trip uploaded in full. Thank you for contributing.'],['上传失败，数据仍在本机','上傳失敗，資料仍在本機','Upload failed. Your data is still saved locally.'],
    ['删除这条尚未上传的本机轨迹？删除后无法恢复。','刪除這條尚未上傳的本機軌跡？刪除後無法恢復。','Delete this local trip that has not been uploaded? This cannot be undone.'],['轨迹已保存本机；网页上传未启用，可先导出','軌跡已儲存於本機；網頁上傳未啟用，可先匯出','Trip saved locally. Web uploads are disabled; you can export it.'],['定位需要HTTPS，请通过GitHub Pages打开','定位需要HTTPS，請透過GitHub Pages開啟','Location requires HTTPS. Open this page on GitHub Pages.'],['请先选择校巴线路','請先選擇校巴路線','Choose a shuttle route first.'],['本机已有3条待上传轨迹，请先上传或导出整理','本機已有3條待上傳軌跡，請先上傳或匯出整理','There are already 3 local trips. Upload them or export and remove them first.'],['定位超过20秒未更新，请保持页面打开','定位超過20秒未更新，請保持頁面開啟','Location has not updated for over 20 seconds. Keep this page open.'],['已停止采集并保存在本机，回来后可上传','已停止採集並儲存於本機，回來後可上傳','Recording stopped and saved locally. You can upload when you return.'],
    ['上传至项目腾讯云，原始轨迹不公开','上傳至項目騰訊雲，原始軌跡不公開','Uploads go to the project’s Tencent Cloud. Raw tracks are not public.'],['网页上传尚未启用；目前可本机采集和导出','網頁上傳尚未啟用；目前可本機採集和匯出','Web uploads are not enabled. Local recording and export are available.'],['浏览器存储不可用，请检查隐私设置','瀏覽器儲存不可用，請檢查私隱設定','Browser storage is unavailable. Check privacy settings.'],['云上传待启用；本机采集、保存和导出可用','雲端上傳待啟用；本機採集、儲存和匯出可用','Cloud uploads are not enabled. Local recording, saving and export are available.'],
    ['本地保存失败，请结束采集并导出；不要关闭页面。','本機儲存失敗，請結束採集並匯出；不要關閉頁面。','Local saving failed. Stop recording and export; do not close this page.'],['正在采集中','正在採集中','Already recording'],['请先同意采集与上传说明','請先同意採集與上傳說明','Please consent to collection and upload first.'],['此浏览器不支持定位','此瀏覽器不支援定位','This browser does not support location access.'],['无法保存本地轨迹，未开始采集','無法儲存本機軌跡，未開始採集','Cannot save trips locally. Recording has not started.'],['正在请求定位权限','正在請求定位權限','Requesting location permission'],['收到过期或无效定位，正在等待新位置','收到過期或無效定位，正在等待新位置','Received an outdated or invalid location. Waiting for a new position.'],['定位精度较低，数据会保留供核验','定位精度較低，資料會保留供核驗','Location accuracy is low. Samples will be kept for verification.'],['定位权限被拒绝，可在浏览器设置中允许后重试','定位權限被拒絕，可在瀏覽器設定中允許後重試','Location permission denied. Allow it in browser settings and retry.'],['定位暂未更新，请保持页面打开','定位暫未更新，請保持頁面開啟','Location has not updated. Keep this page open.'],['暂时无法定位，请检查定位服务','暫時無法定位，請檢查定位服務','Location is temporarily unavailable. Check location services.'],
    ['请先结束采集','請先結束採集','Stop recording first.'],['没有定位点，不能上传','沒有定位點，不能上傳','No location samples to upload.'],['服务器未确认保存','伺服器未確認儲存','The server has not confirmed saving.'],['服务器尚未确认完整轨迹','伺服器尚未確認完整軌跡','The server has not confirmed the complete trip.'],['网页上传尚未启用，轨迹仍在本机，可先导出','網頁上傳尚未啟用，軌跡仍在本機，可先匯出','Web uploads are disabled. Your trip is still saved locally and can be exported.'],['上传请求较多，请稍后重试，轨迹仍在本机','上傳請求較多，請稍後重試，軌跡仍在本機','Too many upload requests. Try again later. Your trip is still saved locally.'],['上传服务暂不可用，轨迹仍在本机','上傳服務暫不可用，軌跡仍在本機','Upload service unavailable. Your trip is still saved locally.'],['上传未确认，轨迹仍在本机','上傳未確認，軌跡仍在本機','Upload not confirmed. Your trip is still saved locally.'],['上传超时，轨迹仍在本机，可重试或导出','上傳逾時，軌跡仍在本機，可重試或匯出','Upload timed out. Your trip is still saved locally; retry or export it.'],['无法建立上传身份，请稍后重试','無法建立上傳身份，請稍後重試','Cannot authorize uploads. Try again later.']
  ];
  globalThis.CUHK_I18N?.register(Object.fromEntries(phrases.map(([source,hant,en])=>[source,{'zh-Hant':hant,en}])));
  const t = text => globalThis.CUHK_I18N?.t(text) ?? text;
  function errorMessage(message, fallback='上传失败，数据仍在本机') {
    const translated=t(message || fallback);
    if(globalThis.CUHK_I18N?.language()==='zh-Hant')return globalThis.CUHK_I18N.traditional?.(translated) ?? translated;
    return globalThis.CUHK_I18N?.language()==='en' && /[\u3400-\u9fff]/u.test(translated) ? t(fallback) : translated;
  }
  const MAX_SAMPLES = 5400, MAX_DURATION = 90 * 60 * 1000, CHUNK_SIZE = 180;
  const CONSENT_VERSION = 'web-gps-consent-20261113-v1';
  function inCampus(p) { return p.lon >= 114.18 && p.lon <= 114.24 && p.lat >= 22.39 && p.lat <= 22.45; }
  function point(position, now) {
    const c = position.coords || {}, timestamp = Number(position.timestamp);
    if (![c.longitude,c.latitude,c.accuracy,timestamp].every(Number.isFinite) || c.accuracy < 0 || Math.abs(timestamp-now) > 30000) return null;
    return {timestamp:new Date(timestamp).toISOString(),lon:c.longitude,lat:c.latitude,accuracy:c.accuracy};
  }
  class Collector {
    constructor({geo, store, changed = () => {}, now = Date.now, uuid = () => crypto.randomUUID(), timers = globalThis}) {
      Object.assign(this,{geo,store,changed,now,uuid,timers});
      this.current=null; this.watch=null; this.expiry=null; this.pendingSave=null; this.generation=0;
      this.persistChain=Promise.resolve(); this.warning=''; this.lastSampleAt=0;
    }
    async save(record) {
      this.saving=(this.saving||0)+1;this.changed();
      const copy=JSON.parse(JSON.stringify(record));
      this.persistChain=this.persistChain.catch(()=>{}).then(()=>this.store.put(copy));
      try { await this.persistChain; return true; }
      catch (_) { this.warning=t('本地保存失败，请结束采集并导出；不要关闭页面。'); this.changed(); return false; }
      finally { this.saving--;this.changed(); }
    }
    async start(routeId,direction,consent) {
      if(this.current||this.starting)throw Error(t('正在采集中'));
      if(!consent)throw Error(t('请先同意采集与上传说明'));
      if(!this.geo)throw Error(t('此浏览器不支持定位'));
      const now=this.now();
      const record={schema:'web_gps_session_v1',id:this.uuid(),source:'web_browser',recordPurpose:'research',routeScheme:'2026-09',routeId,direction,
        coordinateSystem:'browser_wgs84_unverified',consentVersion:CONSENT_VERSION,consentedAt:new Date(now).toISOString(),
        startedAt:new Date(now).toISOString(),endedAt:null,endReason:'',status:'recording',gpsSamples:[]};
      this.starting=true;
      if(!await this.save(record)){this.starting=false;throw Error(t('无法保存本地轨迹，未开始采集'));}
      this.starting=false;
      this.current=record; this.warning=t('正在请求定位权限'); this.lastSampleAt=0;
      const generation=++this.generation;
      let handle;
      try{handle=this.geo.watchPosition(p=>this.receive(p,generation),e=>this.failed(e,generation),
        {enableHighAccuracy:true,maximumAge:0,timeout:15000});}
      catch(error){await this.stop('geolocation_error');throw error;}
      if(this.current && generation===this.generation)this.watch=handle;
      else this.geo.clearWatch(handle);
      if(this.current)this.expiry=this.timers.setTimeout(()=>this.stop('duration_limit'),MAX_DURATION);
      this.changed(); return record;
    }
    receive(position,generation) {
      if(!this.current || generation!==this.generation)return;
      const p=point(position,this.now());
      if(!p){this.warning=t('收到过期或无效定位，正在等待新位置');this.changed();return;}
      if(!inCampus(p)){this.stop('outside_campus');return;}
      const at=Date.parse(p.timestamp),last=this.current.gpsSamples.at(-1);
      if(last && at<=Date.parse(last.timestamp))return;
      // Keep native browser coordinates unchanged; never relabel these as GCJ-02.
      this.current.gpsSamples.push(p); this.lastSampleAt=this.now(); this.warning=p.accuracy>50?t('定位精度较低，数据会保留供核验'):'';
      if(!this.pendingSave)this.pendingSave=this.timers.setTimeout(()=>{this.pendingSave=null;if(this.current)this.save(this.current);},5000);
      if(this.current.gpsSamples.length>=MAX_SAMPLES)this.stop('sample_limit');
      this.changed();
    }
    failed(error,generation) {
      if(!this.current || generation!==this.generation)return;
      if(error.code===1){this.warning=t('定位权限被拒绝，可在浏览器设置中允许后重试');this.stop('permission_denied');}
      else {this.warning=error.code===3?t('定位暂未更新，请保持页面打开'):t('暂时无法定位，请检查定位服务');this.changed();}
    }
    async stop(reason='user_alight') {
      if(!this.current)return null;
      ++this.generation;
      if(this.watch!==null)this.geo.clearWatch(this.watch);
      this.watch=null;
      this.timers.clearTimeout(this.expiry);this.timers.clearTimeout(this.pendingSave);
      this.expiry=this.pendingSave=null;
      const record=this.current;this.current=null;
      record.endedAt=new Date(this.now()).toISOString();record.endReason=reason;record.status='ready';
      this.changed();await this.save(record);this.changed();return record;
    }
  }
  function manifest(record,hashes) {
    return {schema:record.schema,id:record.id,source:'web_browser',recordPurpose:record.recordPurpose||'research',routeScheme:record.routeScheme,routeId:record.routeId,direction:record.direction,
      coordinateSystem:record.coordinateSystem,consentVersion:record.consentVersion,consentedAt:record.consentedAt,
      startedAt:record.startedAt,endedAt:record.endedAt,endReason:record.endReason,sampleCount:record.gpsSamples.length,chunkHashes:hashes};
  }
  async function upload(record,call,hash,progress=()=>{}) {
    if(record.status==='recording'||!record.endedAt)throw Error(t('请先结束采集'));
    if(!record.gpsSamples.length)throw Error(t('没有定位点，不能上传'));
    const chunks=[];
    for(let i=0;i<record.gpsSamples.length;i+=CHUNK_SIZE)chunks.push(record.gpsSamples.slice(i,i+CHUNK_SIZE));
    const hashes=await Promise.all(chunks.map(points=>hash(JSON.stringify(points))));
    const value=manifest(record,hashes), digest=await hash(JSON.stringify(value));
    const ack=(r)=>{if(!r||!r.ok)throw Error(errorMessage(r?.message,'服务器未确认保存'));return r;};
    const begin=ack(await call({action:'init',manifest:value,digest}));
    if(begin.completed && begin.digest===digest)return {id:record.id,digest};
    for(let i=0;i<chunks.length;i++) {
      ack(await call({action:'chunk',id:record.id,digest,index:i,points:chunks[i]}));progress(i+1,chunks.length);
    }
    const done=ack(await call({action:'complete',id:record.id,digest}));
    if(!done.completed||done.digest!==digest)throw Error(t('服务器尚未确认完整轨迹'));
    return {id:record.id,digest};
  }
  return {Collector,upload,manifest,point,inCampus,MAX_SAMPLES,MAX_DURATION,CHUNK_SIZE,CONSENT_VERSION,t,errorMessage};
});
