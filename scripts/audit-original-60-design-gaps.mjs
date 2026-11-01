import {ORIGINAL_60_MECHANICS} from '../dist/original-60-mechanics.js';
import {THIRD_FUSION_RULES} from '../dist/fusion-resonance.js';

// Design-to-runtime gap report. A wired payload is NOT behavioral acceptance.
// This report intentionally does not mark any route complete based on mapping alone.
const generic=new Set(['skill','buff','heal','shield','combo','damageTaken','crit','falcon','autospell','castComplete','block','dodge','overheal','skillRefresh']);
const rows=Object.entries(ORIGINAL_60_MECHANICS).map(([key,design])=>{
  const [job,pair]=key.split('/');
  const runtime=THIRD_FUSION_RULES[job]?.[pair];
  const event=runtime?.originalEvent?.event;
  const payload=runtime?.originalEvent?.payload;
  return {key,description:design.description,declaredEvent:design.event,runtimeEvent:event,
    payload,connected:!!runtime&&!!event&&runtime.events.includes(event),
    genericEvent:generic.has(event),
    behavioralAcceptance:'pending-individual-review'};
});
const missing=rows.filter(r=>!r.connected);
const genericRoutes=rows.filter(r=>r.genericEvent);
const report={version:'v6.4.1',scope:'original six ordered fusions × ten third jobs',
  note:'Connectivity is not proof of distinct multi-stage behavior. Pending does not imply absent implementation.',
  total:rows.length,connected:rows.length-missing.length,genericEventRoutes:genericRoutes.length,
  missing:missing.map(r=>r.key),genericRoutes:genericRoutes.map(r=>r.key),routes:rows};
if(process.argv.includes('--json'))console.log(JSON.stringify(report,null,2));
else{
  console.log('Original 60: '+report.connected+'/'+report.total+' wired; '+report.genericEventRoutes+' generic-event routes need individual event-source review.');
  for(const r of genericRoutes)console.log(r.key+' | '+r.description+' | '+r.runtimeEvent);
}
if(missing.length)process.exitCode=1;
