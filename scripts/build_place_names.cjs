// Reuse published English names only; no coordinate matching or inferred names.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const OpenCC=require('../assets/vendor/opencc-full.js');
const normalize=OpenCC.Converter({from:'hk',to:'cn'});
const guide=require('../data/campus_guide.js');
const geo=JSON.parse(fs.readFileSync(path.join(root,'data/cuhk_roads_poi_coffee_tea_clipped.geojson'),'utf8'));
const candidates=new Map();
const hasChinese=s=>/[\u3400-\u9fff]/.test(s);
function bilingual(s){return String(s||'').match(/^(.+[\u3400-\u9fff）)])\s+([A-Za-zÀ-ž].*)$/);}
function add(zh,en,priority){
  if(!zh||!en||!hasChinese(zh)||hasChinese(en))return;
  const key=normalize(bilingual(zh)?.[1]||zh).trim();
  const old=candidates.get(key);
  if(!old||old.priority<priority)candidates.set(key,{priority,names:new Set([en.trim()])});
  else if(old.priority===priority)old.names.add(en.trim());
}
for(const item of guide.buildings.concat(guide.dining)){
  const pair=bilingual(item.name),en=item.english||pair?.[2];
  add(pair?.[1]||item.name,en,2);
  for(const alias of item.aliases||[])add(alias,en,2);
}
for(const item of guide.items){
  add(item.building?.name,item.building?.english,2);
  add(item.name||item.title,item.english,2);
}
for(const feature of geo.features){
  const p=feature.properties?.tags||feature.properties||{},en=p['name:en'];
  add(p['name:zh']||bilingual(p.name)?.[1]||p.name,en,1);
}
const names=Object.fromEntries([...candidates].filter(([,v])=>v.names.size===1).sort(([a],[b])=>a.localeCompare(b)).map(([key,v])=>[key,[...v.names][0]]));
fs.writeFileSync(path.join(root,'assets/place-names.js'),'// Generated from existing published English names; no coordinates or new POIs.\n(function(root){root.CUHK_PLACE_NAMES='+JSON.stringify(names)+';})(globalThis);\n');
console.log(`Published ${Object.keys(names).length} existing English place names; ambiguous names retained in Chinese.`);
