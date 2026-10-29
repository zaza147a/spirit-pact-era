import {createHash} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
export function balanceFingerprint(){const root=new URL('../dist/',import.meta.url),hash=createHash('sha256');for(const name of readdirSync(root).filter(n=>n.endsWith('.js')).sort()){hash.update(name);hash.update(readFileSync(new URL(name,root)));}for(const name of ['balance-v24.mjs','audit-balance-v24.mjs','audit-balance-v40.mjs']){hash.update(name);hash.update(readFileSync(new URL(name,import.meta.url)));}return hash.digest('hex');}
