import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Missing content is an observable empty pilot, not a swallowed implementation error.
let PILOT_QUESTIONS=[];
try { ({PILOT_QUESTIONS}=await import('../packages/school-portal/pilot_questions.mjs')); }
catch(error) { if(error.code!=='ERR_MODULE_NOT_FOUND'||!error.message.includes('pilot_questions.mjs')) throw error; }

test('Each grade receives its complete small diagnostic, never another grade’s quota',()=>{
  assert.equal(PILOT_QUESTIONS.length,110);
  for(const [grade,count] of [[1,10],[2,10],[3,15],[4,15],[5,20],[6,20],[7,20]])
    assert.equal(PILOT_QUESTIONS.filter(q=>q.grade===grade).length,count,`Grade ${grade}`);
  assert.equal(new Set(PILOT_QUESTIONS.map(q=>q.id)).size,110);
});

test('Student choices, explanation and draft provenance remain usable without false approval',()=>{
  assert.equal(PILOT_QUESTIONS.length,110);
  const registry=JSON.parse(readFileSync(new URL('../sources/meb-reference-registry.json',import.meta.url)));
  const ids=new Set(registry.sources.map(s=>s.id));
  for(const q of PILOT_QUESTIONS){
    assert.equal(q.options.length,q.grade<=4?3:4,q.id);
    assert.equal(new Set(q.options).size,q.options.length,q.id);
    assert.ok(q.options.every(x=>typeof x==='string'&&x.trim()),q.id);
    assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length,q.id);
    for(const field of ['topic','familyId','stimulus','stem']) assert.ok(q[field]?.trim(),`${q.id}:${field}`);
    for(const field of ['given','wanted','strategy','check','tip']) assert.ok(q.explanation[field]?.trim(),`${q.id}:${field}`);
    assert.ok(q.explanation.steps.length>0&&q.explanation.steps.every(x=>x.trim()),q.id);
    assert.ok(ids.has(q.source.programId),q.id);
    assert.equal(q.source.alignmentStatus,'draft',q.id);
    assert.equal(q.publicationStatus,'draft',q.id);
    assert.equal(q.timeLimitSeconds,null,q.id);
    assert.equal(q.adultAssisted,q.grade<=2,q.id);
    if(q.figure){
      assert.ok(q.figure.alt.trim(),q.id);
      assert.match(q.figure.svg,/<svg[^>]*viewBox=/u,q.id);
      assert.doesNotMatch(q.figure.svg,/<(?:script|foreignObject|image|use)|onload=|https?:\/\/(?!www\.w3\.org\/2000\/svg)/iu,q.id);
    }
  }
});

test('Subjects follow age boundaries; upper grades are not disguised science-only pilots',()=>{
  for(let grade=1;grade<=7;grade++){
    const qs=PILOT_QUESTIONS.filter(q=>q.grade===grade);
    const subjects=new Set(qs.map(q=>q.subject));
    assert.ok(subjects.has('mathematics')&&subjects.has('turkish'),`Grade ${grade}`);
    if(grade<=2) assert.ok(!subjects.has('science'));
    if(grade<=3) assert.ok(subjects.has('life_studies')&&!subjects.has('social')&&!subjects.has('religion'));
    if(grade>=4) for(const subject of ['science','social','english','religion']) assert.ok(subjects.has(subject),`${grade}:${subject}`);
    if(grade===1) assert.ok(!subjects.has('english'));
    assert.equal(new Set(qs.map(q=>q.familyId)).size,qs.length,`Near-duplicate task families in ${grade}`);
  }
});

test('Rectangle drawings preserve the stated side ratios, not a reused generic 2:1 shape',()=>{
  for(const [id,ratio] of [['P3-04',5/3],['P4-04',6/4]]){
    const q=PILOT_QUESTIONS.find(q=>q.id===id);
    const rects=[...q.figure.svg.matchAll(/<rect[^>]*width="([\d.]+)"[^>]*height="([\d.]+)"/gu)];
    const rect=rects.at(-1);
    assert.ok(Math.abs(Number(rect[1])/Number(rect[2])-ratio)<0.001,id);
  }
});

// Independent hand-solutions, not values recomputed through the authoring helper.
const expected={
  1:['12','5','19','Kare','Çiçekleri sulamak için.','Yemek yemiştir.','Küçük','Öğretmene haber vermek.','Yemekten önce ellerini yıkamak.','Yaya geçidinde yeşil ışığı beklemek.'],
  2:['42','23','12','Birlikte çalışmak işleri kolaylaştırır.','Misafir','Rüzgâr çıktığı için.','112','Mont ve kapalı ayakkabı.','Blue','Seven'],
  3:['424','9','9','16 cm','Kalem','Kitapların yolculuğu','Soru işareti (?)','Tohumları toprağa ekmiştir.','İtme','El feneri','Kulak','Güvendiği bir yetişkine haber vermek.','Güney','It can swim.','Good morning!'],
  4:['5/8','24','10.25','24 cm²','Okunanı anlamak, yalnızca sayfa sayısından önemlidir.','Kitabım çantamda kaldı.','II – I – III','Hareket yönü değişmiştir.','Süzme','Anahtarı kapatmak.','Geçmişte kullanılan eşyalar hakkında bilgi verir.','Gerekli defteri almak.','Doctor','Swimming','Yardımı kişinin onurunu koruyarak yapmak.'],
  5:['2,4','1/2','1/4','55°','19','Bir plan, zamanı daha verimli kullanmayı sağlar.','Kuşları ürkütmemek için.','Düzenli denemeler sonunda ilerleme sağlamıştır.','Gözlem → Karşılaştırma → Sonuç','Tırtıklı tabanlı ayakkabı.','Dolunay','Hücre duvarı','Dinamometre','Meteoroloji Genel Müdürlüğünün güncel tahmini.','Batı','Görevleri paylaşarak birlikte çalışmak.','Maths','It is cold.','Şükür','Herkese söz hakkı tanımak.'],
  6:['30','3','65°','15 cm²','7','Bir sonuca varmadan önce gözlemleri karşılaştırmak gerekir.','Tatlı sözleriyle hepimizi rahatlattı.','Düzenli tekrar yaparsa konuyu daha iyi hatırlar.','Bütün öğrenciler aynı tür kitapları sever.','Alınan yol sıfırdan büyüktür, yer değiştirme sıfırdır.','K: Bakır tel, L: Plastik çubuk','L, K ve M','Tozlaşma','Vergilerle ortak hizmetlerin giderlerinin karşılanması.','Adayları dinleyip gizli oy kullanmak.','Kütüphane hafta içi saat 17.00’de kapanıyor.','Always','The train is faster than the bus.','İftar','Emaneti özenle koruyup zamanında geri vermek.'],
  7:['−1/4','7','160 TL','192 TL','65°','Çünkü düzenli bakım yapılmamıştı.','Bu, kasabanın en güzel sokağıdır.','Olayları önceden fark edip hazırlıklı olmayı.','Grafik, görüşü sayısal bir veriye dayandırır.','Yalnız II','İkisinde de toz şeker kullanmak','İnce bağırsak','K uygulamasında öğrenci başına günlük kullanım azalmıştır.','Haberi farklı güvenilir kaynaklardan doğrulamak.','Farklı toplumlar arasında kültürel etkileşim gerçekleşmesi.','İş olanaklarının nüfusu kendine çekmesi.','She moved to Ankara in 2015.','Sorry, I cannot. I have a dentist appointment.','Tavaf','Aynı durumda olanlara aynı kuralları uygulamak.']
};
for(const [grade,answers] of Object.entries(expected)) test(`Grade ${grade}: keys match separately worked language, numerical and concept answers`,()=>{
  for(let i=0;i<answers.length;i++){
    const id=`P${grade}-${String(i+1).padStart(2,'0')}`;
    const q=PILOT_QUESTIONS.find(x=>x.id===id);
    assert.ok(q,`Missing ${id}`);
    assert.equal(q.options[q.answer],answers[i],id);
  }
});
