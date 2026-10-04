import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';

export const closedScienceObject = (value, keys) => value !== null && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value,key));
export const canonicalScienceData = value => Array.isArray(value) ? value.map(canonicalScienceData)
  : value !== null && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonicalScienceData(value[key])])) : value;
export const freezeScienceData = value => {
  if(value && typeof value === 'object' && !Object.isFrozen(value)){Object.values(value).forEach(freezeScienceData);Object.freeze(value);}return value;
};
export const scienceDigest = (prefix,value) => createHash('sha256').update(`${prefix}:${JSON.stringify(canonicalScienceData(value))}`).digest('hex');
export function inertScienceData(input) {
  const active = new WeakSet(); let nodes=0,bytes=0;
  const fail=()=>{throw new Error('invalid_science_data');};
  function copy(value,depth=0) {
    if(++nodes>100000||depth>24)fail();
    if(value===null||typeof value==='boolean')return value;
    if(typeof value==='number'){if(!Number.isFinite(value)||Math.abs(value)>1e9)fail();return value;}
    if(typeof value==='string'){bytes+=Buffer.byteLength(value);if(value.length>65536||bytes>3145728||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value))fail();return value;}
    if(!value||typeof value!=='object'||isProxy(value)||active.has(value))fail();
    const array=Array.isArray(value),prototype=Object.getPrototypeOf(value);
    if(array?prototype!==Array.prototype:![Object.prototype,null].includes(prototype))fail();
    const keys=Reflect.ownKeys(value),descriptors=Object.getOwnPropertyDescriptors(value);
    if(keys.length>4097||keys.some(key=>typeof key!=='string'||key.length>256||/[\u0000-\u001f]/u.test(key)
      ||!Object.hasOwn(descriptors[key],'value')||((key!=='length'||!array)&&!descriptors[key].enumerable)))fail();
    for(const key of keys){bytes+=Buffer.byteLength(key);if(bytes>3145728)fail();}
    active.add(value);let result;
    if(array){const length=descriptors.length.value;
      if(length>4096||keys.length!==length+1||keys.some(key=>key!=='length'&&!/^(0|[1-9][0-9]*)$/u.test(key)))fail();
      result=Array.from({length},(_,index)=>{if(!Object.hasOwn(descriptors,String(index)))fail();return copy(descriptors[String(index)].value,depth+1);});
    }else result=Object.fromEntries(keys.sort().map(key=>[key,copy(descriptors[key].value,depth+1)]));
    active.delete(value);return result;
  }return copy(input);
}
