import test from 'node:test';
import assert from 'node:assert/strict';
import {panelIsEditing} from '../dist/ui-patch.js';
test('defer side panel changes throughout native select and text editing, resume outside it',()=>{
 const document={activeElement:null};
 const side={ownerDocument:document,contains:node=>node.inside};
 for(const tagName of ['SELECT','INPUT','TEXTAREA']){document.activeElement={tagName,inside:true};assert.equal(panelIsEditing(side),true);}
 document.activeElement={tagName:'SELECT',inside:false};assert.equal(panelIsEditing(side),false);
 document.activeElement={tagName:'BUTTON',inside:true};assert.equal(panelIsEditing(side),false);
 document.activeElement=null;assert.equal(panelIsEditing(side),false);
});
