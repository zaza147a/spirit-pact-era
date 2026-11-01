// Visual-only projection of the live combat state. No damage, loot, or save writes.
export function battlefieldPositions(count){
 const offsets=[[76,39],[83,61],[64,25],[88,43],[70,69],[92,24]];
 return Array.from({length:count},(_,i)=>({x:offsets[i%offsets.length][0],y:offsets[i%offsets.length][1]}));
}

export function syncBattlefield({location,player,pet,enemies,targetId,heroHtml,petHtml,monsterHtml,onTarget}){
 const anchor=document.getElementById('encounter');
 if(!anchor)return;
 let stage=document.getElementById('battlefield25d');
 if(location!=='dawnrift'||!player){if(stage)stage.remove();return;}
 if(!stage){
  stage=document.createElement('section');stage.id='battlefield25d';stage.className='battlefield-25d';
  stage.setAttribute('aria-label','黎明斷層 2.5D 戰鬥測試場景');
  stage.innerHTML='<div class="battlefield-sky"></div><div class="battlefield-ground"></div><div class="battlefield-actors"></div><div class="battlefield-caption">2.5D 戰場測試 · 傷害與掉寶沿用正式戰鬥系統</div>';
  anchor.before(stage);
  stage.addEventListener('click',event=>{const foe=event.target.closest('[data-battle-target]');if(foe)onTarget(foe.dataset.battleTarget);});
 }
 const layer=stage.querySelector('.battlefield-actors');
 const characters=[{key:'hero',x:32,y:53,html:heroHtml,label:player.name,dead:player.hp<=0},...(pet?[{key:'pet',x:22,y:70,html:petHtml,label:pet.nickname,dead:pet.hp<=0}]:[])];
 const placements=battlefieldPositions(enemies.length);
 for(const [i,foe] of enemies.entries())characters.push({key:'foe-'+foe.instanceId,...placements[i],html:monsterHtml(foe.id),label:foe.name||foe.id,foe,dead:foe.hp<=0});
 const alive=new Set(characters.map(c=>c.key));
 for(const node of [...layer.children])if(!alive.has(node.dataset.entity))node.remove();
 for(const actor of characters){
  let node=[...layer.children].find(el=>el.dataset.entity===actor.key);
  if(!node){node=document.createElement(actor.foe?'button':'div');node.dataset.entity=actor.key;node.className='battlefield-unit';node.innerHTML='<span class="battlefield-shadow"></span><span class="battlefield-sprite"></span><span class="battlefield-name"></span><span class="battlefield-health"><i></i></span>';layer.append(node);}
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
