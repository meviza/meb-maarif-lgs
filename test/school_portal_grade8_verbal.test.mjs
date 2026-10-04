import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

let questions=[];
try { ({GRADE8_VERBAL_QUESTIONS:questions}=await import('../packages/school-portal/grade8_verbal.mjs')); }
catch(error) { if(error.code!=='ERR_MODULE_NOT_FOUND'||!error.message.includes('grade8_verbal.mjs')) throw error; }

test('Grade8 verbal consumer receives10 English,10 religion and10 history drafts with stable distinct IDs',()=>{
  assert.ok(Array.isArray(questions));
  assert.equal(questions.length,30);
  for(const [subject,prefix] of [['english','EN'],['religion','DK'],['history','HI']]){
    const selected=questions.filter(q=>q.subject===subject);
    assert.equal(selected.length,10,subject);
    assert.deepEqual(selected.map(q=>q.id),Array.from({length:10},(_,i)=>`P8-${prefix}${String(i+1).padStart(2,'0')}`));
    assert.equal(new Set(selected.map(q=>q.familyId)).size,10,`${subject}: no repeated family padding`);
  }
  assert.equal(new Set(questions.map(q=>q.id)).size,30);
  assert.equal(new Set(questions.map(q=>q.stimulus+' '+q.stem)).size,30);
});

test('Question shape remains answerable, reasoned and confined to grade8 without invented authority',()=>{
  assert.equal(questions.length,30);
  const expectedKeys=['answer','explanation','familyId','grade','id','layout','options','source','stem','stimulus','subject','topic'].sort();
  for(const q of questions){
    assert.deepEqual(Object.keys(q).sort(),expectedKeys,q.id);
    assert.equal(q.grade,8,q.id);
    assert.equal(q.options.length,4,q.id);
    assert.equal(new Set(q.options).size,4,q.id);
    assert.ok(q.options.every(value=>typeof value==='string'&&value.trim()),q.id);
    assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4,q.id);
    assert.ok(['regular','extended'].includes(q.layout),q.id);
    for(const field of ['topic','stimulus','stem']) assert.match(q[field],/^[\p{Lu}\d]/u,`${q.id}:${field}`);
    assert.deepEqual(Object.keys(q.explanation).sort(),['check','given','steps','strategy','tip','wanted'].sort(),q.id);
    for(const field of ['given','wanted','strategy','check','tip']){
      assert.ok(q.explanation[field].length>=15,`${q.id}:${field}`);
      assert.match(q.explanation[field],/^[\p{Lu}\d]/u,`${q.id}:${field}`);
    }
    assert.ok(q.explanation.steps.length>=2,q.id);
    for(const step of q.explanation.steps) assert.match(step,/^[\p{Lu}\d]/u,q.id);
    assert.ok(q.stimulus.length<=650&&q.stem.length<=200,q.id);
  }
});

test('Source provenance resolves actual historical registry entries while alignment stays draft',()=>{
  assert.equal(questions.length,30);
  const registry=JSON.parse(readFileSync(new URL('../sources/meb-reference-registry.json',import.meta.url)));
  const expected={english:'legacy-2018-ingilizce',religion:'legacy-2018-din-kulturu',history:'legacy-2018-inkilap-tarihi'};
  for(const q of questions){
    assert.deepEqual(Object.keys(q.source).sort(),['alignmentStatus','programId','styleReference']);
    assert.equal(q.source.programId,expected[q.subject],q.id);
    assert.equal(q.source.alignmentStatus,'draft',q.id);
    const entry=registry.sources.find(source=>source.id===q.source.programId);
    assert.ok(entry&&entry.grades.includes(8),q.id);
    const url=new URL(q.source.styleReference);
    assert.equal(url.protocol,'https:',q.id);
    assert.ok(url.hostname==='meb.gov.tr'||url.hostname.endsWith('.meb.gov.tr'),q.id);
    assert.equal(url.search,'',q.id);
    assert.equal(q.source.outcomeCode,undefined,q.id);
    assert.equal(q.publicationReady,undefined,q.id);
  }
});

// Expected answers were hand-worked from the scenario or the stated historical/concept facts.
// Changing a key, swapping a distractor into the answer, or losing a question breaks these consumer answers.
const expected={
  english:[
    'Refusing an invitation and giving a reason.',
    'A quiet reading club on Saturday afternoon.',
    'Slice the banana.',
    'The club will meet at four, not three.',
    'To send her project file to her teacher.',
    'Canoeing',
    'River Tour',
    'Empty the dishwasher at 9.15 and walk the dog at 10.30.',
    'She repeated the test to check the result.',
    'There may be a water shortage because the lake is getting smaller.'
  ],
  religion:[
    'Çalışma biçimini seçmesi ve kendi çabasından sorumlu olması.',
    'Gerekli önlemleri alıp emek verdikten sonra Allah’a güvenmek.',
    'Ekonomik güçlük yaşayan kişilerle dayanışmayı güçlendirmek.',
    'İnsanların uzun süre yararlanacağı bir kütüphane kurulmasına destek vermek.',
    'Malın korunması.',
    'Bireysel bir iyiliğin toplumsal dayanışmayı güçlendirmesi.',
    'Emaneti korumak ve verdiği sözü yerine getirmek.',
    'Karar vermeden önce ilgili kişilerin görüşünü almak.',
    'İnanç – İbadet – Ahlak',
    'Kur’an ve sünnet.'
  ],
  history:[
    'Farklı görüşleri karşılaştırarak düşüncesini geliştirmesi.',
    'Birlikte hareket etmek ve mücadeleyi ortak bir örgüte bağlamak.',
    'Ulusal egemenlik.',
    'Askerî mücadele ile eğitim çalışmalarının birlikte önemsenmesi.',
    'Toplumun imkânlarını Millî Mücadele için seferber etmesi.',
    'Bağımsızlığa aykırı ayrıcalıkların kaldırılması.',
    'Eğitim yönetiminde birliğin sağlanması.',
    'Farklı görüşlerin siyasal temsilini geliştirmek.',
    'Sorunları diplomasi yoluyla ve barışçı yöntemlerle çözmek.',
    'Cumhuriyetin, tek bir kişinin yaşamıyla sınırlı olmayan kalıcı bir kurum olması.'
  ]
};
for(const [subject,prefix] of [['english','EN'],['religion','DK'],['history','HI']])
  test(`${subject}: selected choices match10 independent hand-solutions`,()=>{
    for(let i=0;i<10;i++){
      const id=`P8-${prefix}${String(i+1).padStart(2,'0')}`;
      const q=questions.find(question=>question.id===id);
      assert.ok(q,`Missing ${id}`);
      assert.equal(q.options[q.answer],expected[subject][i],id);
    }
  });

test('EN08 selected plan satisfies both explicit deadlines, not just task order',()=>{
  const q=questions.find(q=>q.id==='P8-EN08');
  const times=[...q.options[q.answer].matchAll(/\b(\d{1,2})\.(\d{2})\b/gu)].map(([,h,m])=>Number(h)*60+Number(m));
  assert.equal(times.length,2,'A sequence without times cannot establish both deadline conditions');
  assert.ok(times[0]>=9*60&&times[0]<9*60+30,'Dishwasher after now, before breakfast');
  assert.ok(times[1]>10*60,'Dog walk strictly after 10.00');
});
