// A UI identity transition invalidates every response dispatched in the previous
// identity. Both success and failure must be checked before either affects UI.
export function createRequestScope(){
 let epoch=0;
 const isCurrent=ticket=>ticket?.epoch===epoch;
 const assertCurrent=ticket=>{
  if(isCurrent(ticket))return;
  const error=new Error('stale_request');error.code='stale_request';error.silent=true;throw error;
 };
 return {
  invalidate(){epoch++;},
  capture(actorId=null){return Object.freeze({epoch,actorId});},
  isCurrent,
  assertCurrent,
  async resolve(ticket,pending){
   try{const value=await pending;assertCurrent(ticket);return value;}
   catch(error){assertCurrent(ticket);throw error;}
  },
 };
}
