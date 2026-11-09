import test from 'node:test';import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';import {JOB_SKILLS} from '../dist/job-skills.js';import {SECOND_JOBS} from '../dist/jobs.js';
for(const job of Object.keys(SECOND_JOBS))test(`${job}: all five third skills preserve identity, stage and queue order`,async()=>{
 const {api:a}=await runtime(),p=a.normalize(a.fresh('技能測試',job));Object.assign(p,{thirdJob:true,reborn:true,jobLevel:70,secondJobLevel:70,firstJobLevel:50});
 for(const s of JOB_SKILLS[job])p.jobSkills[s.id]=s.maxRank;p.autoSkills={version:2,order:[],disabled:[]};a.setup(p,null);
 const skills=JOB_SKILLS[job].filter(s=>s.thirdOnly&&s.kind!=='passive');assert.equal(skills.length,5);
 for(const skill of skills){assert.equal(a.skillStageLabel(skill),'三轉');a.selectAutoSkill(skill.id);for(let tick=0;tick<3;tick++){const html=a.renderAutoSkillSettings();assert.ok(html.includes(`value="${skill.id}" selected`),skill.id);assert.ok(html.includes(`${skill.name} · 三轉`));}a.changeAutoSkill(skill.id,true);assert.ok(p.autoSkills.order.includes(skill.id));assert.ok(a.renderAutoSkillSettings().includes(`<b>${p.autoSkills.order.indexOf(skill.id)+1}. ${skill.name}</b><small>三轉`));a.changeAutoSkill(skill.id,false);assert.ok(!p.autoSkills.order.includes(skill.id));}
 for(const skill of skills)a.changeAutoSkill(skill.id,true);const order=[...p.autoSkills.order];a.reorderAutoSkill(order[1],-1);assert.equal(p.autoSkills.order[0],order[1]);a.normalize(p);assert.equal(p.autoSkills.order[0],order[1]);
 for(const s of JOB_SKILLS[job].filter(s=>!s.thirdOnly))assert.equal(a.skillStageLabel(s),s.rebornOnly?'轉生二轉':s.branch==='second'?'二轉':'一轉');
});
