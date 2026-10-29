import fs from 'node:fs';
let source=fs.readFileSync('js/demo-store.js','utf8');
source=source.replace("import {catalog} from './catalog.js';",'');
const begin=source.indexOf('let state;'),end=source.indexOf('function actor(s)');
source=source.slice(0,begin)+`let state=structuredClone(initial); let storageWarning='';
const get=()=>state;
const user=()=>state.users.find(u=>u.id===state.session);
const must=(test,msg)=>{if(!test)throw Error(msg)};
function change(fn){const draft=structuredClone(state);const result=fn(draft);draft.revision++;state=draft;return result;}
`+source.slice(end);
source=source.slice(0,source.indexOf('export function reset()'));
source=source.replaceAll('export ','').replace("r?.ownerId,'admin'","r?.ownerId,...s.users.filter(p=>p.role==='admin').map(p=>p.id)");
fs.writeFileSync('supabase/functions/sahyog-api/domain.js',`import {catalog} from './catalog.js';\nexport function createDomain(initial){\n${source}\nreturn {get,user,change,event,request,saveResource,decide,reportIncident,incidentStatus,setPolicy,seed,dayAfter};\n}\n`);
fs.copyFileSync('js/catalog.js','supabase/functions/sahyog-api/catalog.js');
