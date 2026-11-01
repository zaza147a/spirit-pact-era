// Visual-only projection of the live combat state. No damage, loot, or save writes.
export function battlefieldPositions(count){
 const offsets=[[76,39],[83,61],[64,25],[88,43],[70,69],[92,24]];
 return Array.from({length:count},(_,i)=>({x:offsets[i%offsets.length][0],y:offsets[i%offsets.length][1]}));
}

const effectsEnabled=()=>typeof document!=='undefined'&&!document.hidden&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches!==true;

// Calls originate after the existing combat engine has calculated the hit.
// Animation never writes player, pet, monster or storage state.
export function battlefieldHit({source,targetId,amount,lethal=false}){
 if(typeof document==='undefined')return;
 const stage=document.getElementById('battlefield25d');
 if(!stage||!Number.isFinite(amount)||amount<=0)return;
 const key=source==='playerDamage'?'hero':source==='petDamage'?'pet':source==='resonanceDamage'?'pet':'hero';
 const actor=[...stage.querySelectorAll('.battlefield-unit')].find(el=>el.dataset.entity===key);
 const target=[...stage.querySelectorAll('.battlefield-unit')].find(el=>el.dataset.battleTarget===targetId);
 if(!target)return;
 if(effectsEnabled()){
  const from=key==='hero'?'translate(-50%,-78%)':'translate(-50%,-78%)';
  const movement=key==='hero'?['0px','28px','-4px','0px']:['0px','-10px','-4px','0px'];
  actor?.animate?.(movement.map((x,i)=>({transform:`${from} translateX(${x})`,offset:i/3})),{duration:390,easing:'ease-out'});
  target.animate?.([{filter:'brightness(1)',transform:'translate(-50%,-78%)'},{filter:'brightness(2.8) sepia(.5)',transform:'translate(-47%,-78%)'},{filter:'brightness(1)',transform:'translate(-50%,-78%)'}],{duration:330});
  if(actor){
   const origin=actor.getBoundingClientRect(),destination=target.getBoundingClientRect(),bounds=stage.getBoundingClientRect();
   const projectile=document.createElement('span');projectile.className=key==='hero'?'battlefield-slash':'battlefield-missile';
   const fromX=origin.left+origin.width/2-bounds.left,fromY=origin.top+origin.height/2-bounds.top;
   const dx=destination.left+destination.width/2-bounds.left-fromX,dy=destination.top+destination.height/2-bounds.top-fromY;
   projectile.style.left=fromX+'px';projectile.style.top=fromY+'px';stage.append(projectile);
   const motion=projectile.animate([{transform:'translate(-50%,-50%) scale(.6)',opacity:0},{transform:`translate(calc(-50% + ${dx*.65}px),calc(-50% + ${dy*.65}px)) scale(1.15)`,opacity:1},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.65)`,opacity:0}],{duration:key==='hero'?310:430,easing:'ease-out'});
   motion.onfinish=()=>projectile.remove();setTimeout(()=>projectile.remove(),600);
  }
 }
 const number=document.createElement('span');number.className='battlefield-damage';number.textContent='−'+Math.round(amount).toLocaleString('zh-TW');
 number.style.left=target.style.left;number.style.top=target.style.top;stage.append(number);
 setTimeout(()=>number.remove(),850);
 if(lethal){target.classList.add('battlefield-dying');setTimeout(()=>target.classList.remove('battlefield-dying'),600);}
}

export function battlefieldEnemySwing(targetId){
 if(typeof document==='undefined')return;
 const stage=document.getElementById('battlefield25d');if(!stage||!effectsEnabled())return;
 const actor=[...stage.querySelectorAll('.battlefield-unit')].find(el=>el.dataset.battleTarget===targetId);
 actor?.animate?.([{transform:'translate(-50%,-78%)'},{transform:'translate(-66%,-78%) scale(1.1)'},{transform:'translate(-50%,-78%)'}],{duration:410,easing:'ease-out'});
}

export function syncBattlefield({location,player,pet,enemies,targetId,heroHtml,petHtml,monsterHtml,onTarget}){
 const anchor=document.getElementById('encounter');
 if(!anchor)return;
 let stage=document.getElementById('battlefield25d');
 if(location!=='dawnrift'||!player){if(stage)stage.remove();return;}
 if(!stage){
  stage=document.createElement('section');stage.id='battlefield25d';stage.className='battlefield-25d';
  stage.setAttribute('aria-label','黎明斷層 2.5D 戰鬥測試場景');
  stage.innerHTML='<div class="battlefield-sky"></div><div class="battlefield-mountains"></div><div class="battlefield-ground"></div><div class="battlefield-rune"></div><div class="battlefield-actors"></div><div class="battlefield-caption">黎明斷層 · 2.5D 戰場測試　｜　點擊敵人鎖定</div>';
  anchor.before(stage);
  stage.addEventListener('click',event=>{const foe=event.target.closest('[data-battle-target]');if(foe)onTarget(foe.dataset.battleTarget);});
 }
 const layer=stage.querySelector('.battlefield-actors');
 const characters=[{key:'hero',x:32,y:53,html:heroHtml,label:player.name,dead:player.hp<=0},...(pet?[{key:'pet',x:22,y:70,html:petHtml,label:pet.nickname,dead:pet.hp<=0}]:[])];
 const placements=battlefieldPositions(enemies.length);
 for(const [i,foe] of enemies.entries())characters.push({key:'foe-'+foe.instanceId,...placements[i],html:monsterHtml(foe.id),label:foe.name||foe.id,foe,dead:foe.hp<=0});
 const alive=new Set(characters.map(c=>c.key));
 for(const node of [...layer.children])if(!alive.has(node.dataset.entity)&&!node.classList.contains('battlefield-exit')){
  node.classList.add('battlefield-exit');setTimeout(()=>node.remove(),450);
 }
 for(const actor of characters){
  let node=[...layer.children].find(el=>el.dataset.entity===actor.key);
  if(!node){node=document.createElement(actor.foe?'button':'div');node.dataset.entity=actor.key;node.className='battlefield-unit battlefield-enter';node.innerHTML='<span class="battlefield-shadow"></span><span class="battlefield-sprite"></span><span class="battlefield-name"></span><span class="battlefield-health"><i></i></span>';layer.append(node);setTimeout(()=>node.classList.remove('battlefield-enter'),550);}
  const art=node.querySelector('.battlefield-sprite');if(art.dataset.art!==actor.html){art.innerHTML=actor.html;art.dataset.art=actor.html;}
  node.style.left=actor.x+'%';node.style.top=actor.y+'%';node.style.zIndex=String(Math.round(actor.y));
  node.classList.toggle('battlefield-boss',!!actor.foe?.boss);node.classList.toggle('battlefield-selected',!!actor.foe&&actor.foe.instanceId===targetId);
  node.classList.toggle('battlefield-dead',actor.dead);
  node.querySelector('.battlefield-name').textContent=actor.label;
  const hp=actor.foe?actor.foe.hp:actor.key==='hero'?player.hp:pet.hp;
  const max=actor.foe?actor.foe.maxHp:actor.key==='hero'?Math.max(1,player.maxHp||player.hp):Math.max(1,pet.maxHp||pet.hp);
  node.querySelector('.battlefield-health i').style.width=Math.max(0,Math.min(100,100*hp/Math.max(1,max)))+'%';
  if(actor.foe){node.dataset.battleTarget=actor.foe.instanceId;node.setAttribute('aria-label','鎖定 '+actor.label);node.type='button';}
 }
}
