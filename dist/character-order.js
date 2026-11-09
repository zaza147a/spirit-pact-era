import {CHARACTER_SLOT_COUNT} from './character-slots.js';
export const CHARACTER_ORDER_KEY='icarus-character-display-order-v1';
export const defaultCharacterOrder=()=>Array.from({length:CHARACTER_SLOT_COUNT},(_,index)=>index);
export function normalizeCharacterOrder(candidate){
 const valid=Array.isArray(candidate)?candidate.filter(index=>Number.isInteger(index)&&index>=0&&index<CHARACTER_SLOT_COUNT):[];
 const unique=[...new Set(valid)];return [...unique,...defaultCharacterOrder().filter(index=>!unique.includes(index))];
}
export function readCharacterOrder(storage){try{return normalizeCharacterOrder(JSON.parse(storage.getItem(CHARACTER_ORDER_KEY)));}catch{return defaultCharacterOrder();}}
export function moveCharacterOrder(order,index,direction){const next=normalizeCharacterOrder(order),from=next.indexOf(index),to=from+direction;if(Math.abs(direction)!==1||to<0||to>=next.length)return next;[next[from],next[to]]=[next[to],next[from]];return next;}
export function saveCharacterOrder(storage,order){const next=normalizeCharacterOrder(order);storage.setItem(CHARACTER_ORDER_KEY,JSON.stringify(next));return next;}
