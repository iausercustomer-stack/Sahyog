import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
const ref=process.argv[2];if(!/^[a-z]{20}$/.test(ref||'')){console.error('Usage: npm run deploy:backend -- YOUR_20_LETTER_PROJECT_REF');process.exit(1)}
const cli=process.platform==='win32'?'node_modules\\.bin\\supabase.cmd':'node_modules/.bin/supabase';
function run(args){const r=spawnSync(cli,args,{stdio:'inherit',shell:process.platform==='win32'});if(r.status!==0){console.error('Deployment stopped. Fix the error above, then run the command again.');process.exit(r.status||1)}}
run(['login']);
run(['functions','deploy','sahyog-api','--project-ref',ref,'--use-api']);
console.log('Function deployed. Run supabase/setup.sql in SQL Editor if not done, and set js/config.js.');
