import {fileURLToPath} from 'node:url';
import {loadPilotCatalog} from '../packages/school-portal/catalog.mjs';
import {createSchoolPortalServer} from '../packages/school-portal/server.mjs';
const catalog=loadPilotCatalog();
if(process.argv.includes('--report')){
 console.log(JSON.stringify({mode:'synthetic_only',draftQuestions:catalog.questions.length,published:0,byGrade:Object.fromEntries([1,2,3,4,5,6,7,8].map(grade=>[grade,catalog.questions.filter(q=>q.grade===grade).length])),externalCalls:0,realSchoolReady:false},null,2));
}else{
 const port=Number(process.argv.find(a=>a.startsWith('--port='))?.split('=')[1]??64080);
 const server=await createSchoolPortalServer({databasePath:fileURLToPath(new URL('../outputs/school-portal-pilot/demo.sqlite',import.meta.url)),questions:catalog.questions,examBlueprints:catalog.examBlueprints,port});
 console.log(JSON.stringify({url:server.url,mode:'synthetic_only',draftQuestions:catalog.questions.length,realSchoolReady:false}));
 for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await server.close();process.exit(0);});
}
