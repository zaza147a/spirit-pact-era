// Reuse live controls across combat updates: open selects, focus, caret and scroll survive.
const key=node=>node.nodeType===1?(node.id?`id:${node.id}`:node.getAttribute('data-ui-key')||[...node.attributes].filter(a=>a.name.startsWith('data-')).map(a=>a.name+':'+a.value).join('|')):'';
function syncNode(current,next){
 if(current.nodeType!==next.nodeType||current.nodeName!==next.nodeName){current.replaceWith(next.cloneNode(true));return;}
 if(current.nodeType===3){if(current.nodeValue!==next.nodeValue)current.nodeValue=next.nodeValue;return;}
 if(current.nodeType!==1)return;
 const focused=current===current.ownerDocument.activeElement;
 // Native dropdown state is owned by the user until focus moves away.
 if(focused&&['SELECT','INPUT','TEXTAREA'].includes(current.tagName))return;
 for(const a of [...current.attributes])if(!next.hasAttribute(a.name)&&!(a.name==='open'&&current.tagName==='DETAILS'))current.removeAttribute(a.name);
 for(const a of [...next.attributes])if(a.name!=='open'&&current.getAttribute(a.name)!==a.value)current.setAttribute(a.name,a.value);
 if(current.tagName==='INPUT'){current.checked=next.checked;if(current.value!==next.value)current.value=next.value;}
 syncChildren(current,next);
 if(current.tagName==='SELECT'&&current.value!==next.value)current.value=next.value;
}
function syncChildren(current,next){
 const old=[...current.childNodes],keyed=new Map(old.map(n=>[key(n),n]).filter(([k])=>k)),used=new Set();
 for(const [index,wanted] of [...next.childNodes].entries()){
  let found=key(wanted)?keyed.get(key(wanted)):old[index];
  if(found&&(used.has(found)||found.nodeType!==wanted.nodeType||found.nodeName!==wanted.nodeName||key(found)!==key(wanted)))found=null;
  if(!found){found=wanted.cloneNode(true);current.insertBefore(found,current.childNodes[index]||null);}else{
   if(current.childNodes[index]!==found)current.insertBefore(found,current.childNodes[index]||null);
   syncNode(found,wanted);
  }
  used.add(found);
 }
 for(const n of old)if(!used.has(n)&&n.parentNode===current)current.removeChild(n);
}
export function patchHtml(container,html){const template=container.ownerDocument.createElement('template');template.innerHTML=html;syncChildren(container,template.content);}
