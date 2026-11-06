// The combat HUD is replaced frequently while fighting. A button can disappear
// between pointerdown and click; capture the action before that DOM replacement.
export function bindHeroRename(document,{character,pet,activePet}){
 const targetOf=event=>event.target?.closest?.('#renameCharacterBtn, #renamePetBtn, [data-rename-active-pet]');
 const dispatch=button=>{
  if(button.id==='renameCharacterBtn')character();
  else if(button.hasAttribute('data-rename-active-pet'))pet(button.dataset.renameActivePet);
  else activePet();
 };
 document.addEventListener('pointerdown',event=>{
  const button=targetOf(event);
  if(!button||event.button!==0)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  dispatch(button);
 },true);
 document.addEventListener('click',event=>{
  const button=targetOf(event);
  if(!button)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  // A pointer already opened the modal on pointerdown; keyboard click has detail 0.
  if(event.detail===0)dispatch(button);
 },true);
}
