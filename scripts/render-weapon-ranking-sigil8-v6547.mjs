import {readFileSync,writeFileSync} from 'node:fs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {GEAR_BASE} from '../dist/loot.js';

const file='docs/weapon-fusion-audit-sigil8-v6547.json';
const primary=JSON.parse(readFileSync(file));
const second=JSON.parse(readFileSync('docs/weapon-fusion-audit-sigil8-bosscards-v6547.json'));
if(primary.completed!==138||second.completed!==138||primary.conditions.sigil!==8||second.conditions.sigil!==8)throw Error('Expected two complete sigil-8 searches');
const key=r=>r.job+':'+r.weapon+':'+r.offhand+':'+r.pair;
const prior=new Map(primary.rows.map(r=>[key(r),r]));
const merged=second.rows.map(r=>{const p=prior.get(key(r));if(!p)throw Error('Unmatched candidate '+key(r));return r.dps>p.dps?{...r,cardCandidate:'pre-210 boss card slot search'}:{...p,cardCandidate:'weighted card search'};});
const data={conditions:{...primary.conditions,cardCandidates:['built-in weighted selection','previous pre-210 boss-card trigger optimization'],search:'Two bounded coordinate searches per weapon/fusion with 20 three-skill combinations each. Not an exhaustive global search for all legal gear/stat/card products.'},completed:138,total:138,candidatesEvaluated:[...primary.rows,...second.rows].reduce((n,r)=>n+r.count,0),rows:merged};
writeFileSync('docs/weapon-fusion-audit-sigil8-best-v6547.json',JSON.stringify(data,null,2)+'\n');
const pairs={'attack-magic':'攻擊＋魔法','attack-defense':'攻擊＋防禦','attack-support':'攻擊＋輔助','magic-defense':'魔法＋防禦','magic-support':'魔法＋輔助','defense-support':'防禦＋輔助'};
const name=r=>`${SECOND_JOBS[r.job]?.name||r.job}／${GEAR_BASE[r.weapon]?.name||r.weapon}${r.offhand?'＋'+GEAR_BASE[r.offhand]?.name:''}`;
const m=x=>(x/1e6).toFixed(2);
const rows=[...data.rows].sort((a,b)=>b.dps-a.dps);
const weaponBest=Object.values(Object.groupBy(rows,r=>r.job+':'+r.weapon+':'+r.offhand)).map(rs=>rs[0]).sort((a,b)=>b.dps-a.dps);
const jobBest=Object.values(Object.groupBy(rows,r=>r.job)).map(rs=>rs[0]).sort((a,b)=>b.dps-a.dps);
const lines=['# 《靈契紀元》契印 8 · 十職全武器／六融合 DPS 排名','','## 搜尋與限制','','- 基準：Lv210、角色素質基礎 6 點＋438 可分配點（單項上限150）、Lv200 SSS 人物與夥伴、契印 **8**、201 區域一般怪物、pre-210 王卡允許觸發、融合寵技能配置。',`- 覆蓋：10 職業、23 種合法武器持法、六種無序融合，共 138 個配置。**實際模擬 ${data.candidatesEvaluated.toLocaleString('en-US')} 個候選**，採一般卡片權重與先前優化的 pre-210 王卡插槽兩種起始方案；每個選中配置再以三個種子（42／137／731）各跑 60 秒取平均。`,'- 搜尋方式：每一配置兩輪搜尋，各完整枚舉 20 種三技能組合，對配點順序、詞條偏好、卡片評分模式及夥伴裝備做有限座標搜尋。**不是全部合法配點／裝備詞條／卡片插槽的全域數學窮舉**，因此標示為「目前找到的最高候選」。','- 純 DPS 不代表固定首領加小怪、存活率、自然刷新或長時間掛機效率；詳細原始 `cfg`、卡片與裝備、三種種子都保存在 JSON。','','## 各職業最高候選（十職）','','| 排名 | 職業／武器 | 融合 | 總 DPS (M) | 人物 (M) | 夥伴＋共鳴 (M) |','|---:|---|---|---:|---:|---:|'];
jobBest.forEach((r,i)=>lines.push(`| ${i+1} | ${name(r)} | ${pairs[r.pair]} | ${m(r.dps)} | ${m(r.ownerDps)} | ${m(r.petDps)} |`));
lines.push('','## 各合法武器配置最高候選（23 種）','','| 排名 | 職業／武器 | 融合 | 總 DPS (M) | 人物 (M) | 夥伴＋共鳴 (M) |','|---:|---|---|---:|---:|---:|');
weaponBest.forEach((r,i)=>lines.push(`| ${i+1} | ${name(r)} | ${pairs[r.pair]} | ${m(r.dps)} | ${m(r.ownerDps)} | ${m(r.petDps)} |`));
lines.push('','## 全部 138 組排名（依總 DPS 遞減）','','| 排名 | 職業／武器 | 無序融合 | 總 DPS (M) | 人物 (M) | 夥伴＋共鳴 (M) |','|---:|---|---|---:|---:|---:|');
rows.forEach((r,i)=>lines.push(`| ${i+1} | ${name(r)} | ${pairs[r.pair]} | ${m(r.dps)} | ${m(r.ownerDps)} | ${m(r.petDps)} |`));
lines.push('','## 最佳候選詳細資訊','','以下只列每職最高候選的配點、詞條偏好及融合技能；全部 138 組的卡片實際插槽、逐件 SSS 裝備、人物／夥伴數值及三種種子請見原始 JSON。','');
for(const r of jobBest){lines.push(`### ${name(r)} · ${pairs[r.pair]} · ${m(r.dps)}M`,'',`- 配點：${Object.entries(r.cfg.attrs).map(([k,v])=>k+' '+v).join('／')}`,`- 人物詞條優先：${r.cfg.gearStats.join('、')}；特殊詞條：${r.cfg.special}`,`- 夥伴詞條：${r.cfg.petStats.join('、')}；頭部類型：${r.cfg.head}`,`- 融合技能 ID：${r.cfg.skills.join('、')}`,`- 卡片：${Object.entries(r.equipment.sockets).map(([k,v])=>k+':'+(v||'無')).join('／')}`,'');}
writeFileSync('docs/WEAPON_DPS_RANKING_SIGIL8_2026-11-05.md',lines.join('\n')+'\n');
console.log(JSON.stringify({rows:rows.length,jobBest:jobBest.length,weaponBest:weaponBest.length,candidates:data.candidatesEvaluated,top:rows.slice(0,5).map(r=>({job:r.job,weapon:r.weapon,pair:r.pair,dps:m(r.dps)}))}));
