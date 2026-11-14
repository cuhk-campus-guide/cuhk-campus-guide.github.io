const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
test('single-line direction labels and conditional stop notes have complete English',()=>{
  const context={window:{CUHK_I18N:{language:()=> 'en',t:s=>s}}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root,'demos/shuttle-atlas/atlas-i18n.js'),'utf8'),context);
  for(const [source,expected]of Object.entries({'往新亚':'To New Asia','往逸夫':'To Shaw','往本部':'To Main campus','逢 00 分班次停研究生宿舍一座':'The :00 departure stops at Postgraduate Hall 1','每小时 00 分班次停研究生宿舍一座及 39 区':'The :00 departure stops at Postgraduate Hall 1 and Area 39'}))assert.equal(context.window.AtlasI18n.text(source),expected);
});
