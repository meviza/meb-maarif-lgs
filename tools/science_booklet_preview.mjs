import {loadBookletBank,mixForGrade} from '../packages/science-booklet/bank.mjs';
import {createBookletServer} from '../packages/science-booklet/server.mjs';
const args=process.argv.slice(2);
if(args.length!==1||!['6','7','8','--report','--all'].includes(args[0])){
  process.stderr.write('Usage: node tools/science_booklet_preview.mjs 6|7|8|--all|--report\n');process.exitCode=1;
}else{
  const bank=await loadBookletBank();
  if(args[0]==='--report'){const {questions,...report}=bank;process.stdout.write(JSON.stringify(report)+'\n');}
  else{
    const grades=args[0]==='--all'?[6,7,8]:[Number(args[0])];const servers=[];
    for(const grade of grades){const items=mixForGrade(bank.questions,grade);const server=await createBookletServer({grade,items});servers.push(server);process.stdout.write(JSON.stringify({grade,url:server.url,questions:items.length,state:'local_synthetic_student_preview'})+'\n');}
    const stop=async()=>{await Promise.all(servers.map(s=>s.close()));};process.once('SIGINT',stop);process.once('SIGTERM',stop);
  }
}
