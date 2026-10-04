import test from 'node:test';
import assert from 'node:assert/strict';
import {PILOT_QUESTIONS} from '../packages/school-portal/pilot_questions.mjs';

// Independent reviewer hand-solutions, not copied from the author's builder or computed by it.
// These protect selected answer meaning when the author, options or future catalog ordering change.
const solutions={
  1:['12','5','19','Kare','Çiçekleri sulamak için.','Yemek yemiştir.','Küçük','Öğretmene haber vermek.','Yemekten önce ellerini yıkamak.','Yaya geçidinde yeşil ışığı beklemek.'],
  2:['42','23','12','Birlikte çalışmak işleri kolaylaştırır.','Misafir','Rüzgâr çıktığı için.','112','Mont ve kapalı ayakkabı.','Blue','Seven'],
  3:['424','9','9','16 cm','Kalem','Kitapların yolculuğu','Soru işareti (?)','Tohumları toprağa ekmiştir.','İtme','El feneri','Kulak','Güvendiği bir yetişkine haber vermek.','Güney','It can swim.','Good morning!'],
  4:['5/8','24','10.25','24 cm²','Okunanı anlamak, yalnızca sayfa sayısından önemlidir.','Kitabım çantamda kaldı.','II – I – III','Hareket yönü değişmiştir.','Süzme','Anahtarı kapatmak.','Geçmişte kullanılan eşyalar hakkında bilgi verir.','Gerekli defteri almak.','Doctor','Swimming','Yardımı kişinin onurunu koruyarak yapmak.'],
  5:['2,4','1/2','1/4','55°','19','Bir plan, zamanı daha verimli kullanmayı sağlar.','Kuşları ürkütmemek için.','Düzenli denemeler sonunda ilerleme sağlamıştır.','Gözlem → Karşılaştırma → Sonuç','Tırtıklı tabanlı ayakkabı.','Dolunay','Hücre duvarı','Dinamometre','Meteoroloji Genel Müdürlüğünün güncel tahmini.','Batı','Görevleri paylaşarak birlikte çalışmak.','Maths','It is cold.','Şükür','Herkese söz hakkı tanımak.'],
  6:['30','3','65°','15 cm²','7','Bir sonuca varmadan önce gözlemleri karşılaştırmak gerekir.','Tatlı sözleriyle hepimizi rahatlattı.','Düzenli tekrar yaparsa konuyu daha iyi hatırlar.','Bütün öğrenciler aynı tür kitapları sever.','Alınan yol sıfırdan büyüktür, yer değiştirme sıfırdır.','K: Bakır tel, L: Plastik çubuk','L, K ve M','Tozlaşma','Vergilerle ortak hizmetlerin giderlerinin karşılanması.','Adayları dinleyip gizli oy kullanmak.','Kütüphane hafta içi saat 17.00’de kapanıyor.','Always','The train is faster than the bus.','İftar','Emaneti özenle koruyup zamanında geri vermek.'],
  7:['−1/4','7','160 TL','192 TL','65°','Çünkü düzenli bakım yapılmamıştı.','Bu, kasabanın en güzel sokağıdır.','Olayları önceden fark edip hazırlıklı olmayı.','Grafik, görüşü sayısal bir veriye dayandırır.','Yalnız II','İkisinde de toz şeker kullanmak','İnce bağırsak','K uygulamasında öğrenci başına günlük kullanım azalmıştır.','Haberi farklı güvenilir kaynaklardan doğrulamak.','Farklı toplumlar arasında kültürel etkileşim gerçekleşmesi.','İş olanaklarının nüfusu kendine çekmesi.','She moved to Ankara in 2015.','Sorry, I cannot. I have a dentist appointment.','Tavaf','Aynı durumda olanlara aynı kuralları uygulamak.']
};
for(const [grade,expected] of Object.entries(solutions))
  test(`Independent lower-grade review: all grade${grade} choices retain their hand-solved answer meaning`,()=>{
    const selected=PILOT_QUESTIONS.filter(q=>q.grade===Number(grade));
    assert.equal(selected.length,expected.length);
    for(let i=0;i<expected.length;i++){
      const id=`P${grade}-${String(i+1).padStart(2,'0')}`;
      const q=selected.find(row=>row.id===id);
      assert.ok(q,`Missing ${id}`);
      assert.equal(q.options[q.answer],expected[i],id);
    }
  });

test('Grade1 shape information states right angles without revealing the shape name in alternative text',()=>{
  const q=PILOT_QUESTIONS.find(row=>row.id==='P1-04');
  // Four equal sides alone also describes a non-square rhombus; the condition must reach the listener too.
  assert.match(q.stimulus,/dik|90°/iu);
  assert.match(q.figure.alt,/dik|90°/iu);
  assert.doesNotMatch(q.figure.alt,/(?:^|\P{L})kare(?:$|\P{L})/iu);
  assert.equal(q.options[q.answer],'Kare');
});

test('Grade2 subtraction metadata does not misidentify the known starting quantity as the unknown minuend',()=>{
  const q=PILOT_QUESTIONS.find(row=>row.id==='P2-02');
  assert.equal(q.options[q.answer],'23');
  assert.doesNotMatch(q.topic,/eksilen/iu);
  assert.match(q.topic,/çıkan|kullanılan/iu);
});

test('Grades1–2 stay adult-assisted untimed drafts, not an autonomous reading-readiness measure',()=>{
  const selected=PILOT_QUESTIONS.filter(q=>q.grade<=2);
  assert.equal(selected.length,20);
  for(const q of selected){
    assert.equal(q.adultAssisted,true,q.id);
    assert.equal(q.timeLimitSeconds,null,q.id);
    assert.equal(q.publicationStatus,'draft',q.id);
    assert.equal(q.source.alignmentStatus,'draft',q.id);
  }
});
