// Original drafts constrained by the active grade8 (2018) programme.
// No copied official question body, artwork or answer key is included.
const esc = (v) => String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const text = (x, y, value, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}">${esc(value)}</text>`;
const line = (x1,y1,x2,y2, extra='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#333" stroke-width="1.4" ${extra}/>`;
const box = (x,y,w,h,fill='white') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#333" stroke-width="1.3"/>`;
const circle = (x,y,r,fill='white') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="#333" stroke-width="1.2"/>`;
const arrow = (x1,y1,x2,y2) => { const a=Math.atan2(y2-y1,x2-x1), s=5; return line(x1,y1,x2,y2)+`<path d="M${x2-s*Math.cos(a-.5)} ${y2-s*Math.sin(a-.5)} L${x2} ${y2} L${x2-s*Math.cos(a+.5)} ${y2-s*Math.sin(a+.5)}" fill="none" stroke="#333" stroke-width="1.4"/>`; };
const figure=(body,alt,height=150)=>({svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 ${height}" role="img"><g font-family="Arial, sans-serif" font-size="12" fill="#161616">${body}</g></svg>`,alt});
const table=(headers,rows,widths=[100,100,100])=>{const start=30,top=10,rh=26,total=widths.reduce((a,b)=>a+b,0);let s=box(start,top,total,rh*(rows.length+1));[headers,...rows].forEach((row,r)=>{if(r)s+=line(start,top+r*rh,start+total,top+r*rh);let x=start;row.forEach((v,c)=>{s+=text(x+widths[c]/2,top+r*rh+18,v);x+=widths[c];});});let x=start;for(const w of widths.slice(0,-1)){x+=w;s+=line(x,top,x,top+rh*(rows.length+1));}return s;};
const ex=(given,wanted,strategy,steps,check,tip)=>({given,wanted,strategy,steps,check,tip});
const q=(n,branch,topic,outcomeCode,page,stimulus,stem,options,answer,fig,explanation,difficulty='medium',bloom='apply',layout='regular')=>({id:`YF8-${String(n).padStart(2,'0')}`,grade:8,branch,topic,outcomeCode,source:{programId:'legacy-2018-fen-bilimleri',physicalPage:page,styleReference:'lgs-2024-numerical:p19'},difficulty,bloom,stimulus,stem,options,answer,figure:fig,explanation,layout});

export const grade8Questions=[
 q(1,'physics','Mevsimlerin oluşumu','F.8.1.1.1',49,
  '21 Aralık tarihinde K ve L şehirlerinin konumları şekilde verilmiştir. K, Güney Yarım Küre’de; L, Kuzey Yarım Küre’dedir.',
  'Bu tarihte K ve L’de hangi mevsimler yaşanır?',
  ['K: Yaz, L: Kış','K: Kış, L: Yaz','İkisinde de yaz','İkisinde de kış'],0,
  figure(circle(206,78,56,'#f3f3f3')+line(176,143,236,13)+line(155,56,257,100,'stroke-dasharray="4 3"')+text(249,18,'Kuzey')+text(146,145,'Güney')+circle(186,99,3,'#222')+text(174,113,'K')+circle(227,56,3,'#222')+text(242,59,'L')+[41,70,99].map(y=>arrow(38,y,143,y)).join('')+text(62,128,'Güneş ışınları')+text(305,105,'Ekvator')+line(278,101,256,99), 'Güneş ışınları soldan gelir. Dünya ekseninin kuzey ucu Güneş’ten uzağa eğiktir. K ekvatorun güneyinde, L kuzeyindedir.'),
  ex('Tarih 21 Aralık; K güneyde, L kuzeydedir.','Aynı tarihte karşıt yarım kürelerin mevsimlerini belirlemek.','Eksen eğikliğinin hangi yarım küreyi Güneş’e yönelttiğini düşün.',['21 Aralık’ta Güney Yarım Küre Güneş’e dönüktür; yaz başlar.','Kuzey Yarım Küre’de aynı tarihte kış başlar.'],'Dünya genelinde aynı anda tek bir mevsim yaşanmaz.','Mevsimleri Dünya’nın Güneş’e uzaklığıyla değil eksen eğikliği ve dolanma hareketiyle açıkla.'),'easy','apply'),

 q(2,'physics','Katı basıncında kontrollü deney','F.8.3.1.1',51,
  'Özdeş tuğlalar aynı tür kum üzerine şekildeki gibi yerleştiriliyor. Tuğlaların kuma batma miktarı karşılaştırılacaktır. K ve L’de birer, M ve N’de ikişer tuğla vardır.',
  'Yalnız temas yüzeyi alanının basınca etkisini araştırmak için hangi iki düzenek karşılaştırılmalıdır?',
  ['K ve M','K ve N','K ve L','L ve M'],2,
  figure(line(8,115,350,115)+box(20,95,50,20,'#ddd')+box(114,65,20,50,'#ddd')+box(187,95,50,20,'#ddd')+box(187,75,50,20,'#ddd')+box(292,65,20,50,'#ddd')+box(292,15,20,50,'#ddd')+text(45,12,'K')+text(124,12,'L')+text(212,12,'M')+text(302,12,'N')+text(45,140,'50 cm²')+text(124,140,'20 cm²')+text(212,140,'50 cm²')+text(302,140,'20 cm²'), 'K ve L bir tuğladan, M ve N iki tuğladan oluşur. Temas alanları K ve M’de 50, L ve N’de 20 santimetrekaredir.'),
  ex('Araştırılan değişken temas alanıdır; ağırlık aynı tutulmalıdır.','Tek değişkeni alan olan çifti seçmek.','Önce tuğla sayısını eşitle, sonra temas alanını karşılaştır.',['K ve L’de birer özdeş tuğla olduğundan ağırlıklar eşittir.','K ve L’nin temas alanları farklıdır.'],'K-M’de ağırlık, K-N ve L-M’de hem ağırlık hem alan değişir.','Araştırdığın değişken dışındaki koşulları aynı tut.'),'hard','analyze'),

 q(3,'physics','Sıvı basıncı deneyini tasarlama','F.8.3.1.2',51,
  'Bir öğrenci sıvının cinsinin basınca etkisini araştıracaktır. K kabında su yüzeyinin 10 cm altında ölçüm yapılıyor. L için özdeş bir kap ve aynı ölçüm aracı kullanılacaktır. Sıcaklıklar aynıdır. Su ile sıvı yağın yoğunlukları farklıdır.',
  'L kabında hangi sıvı ve ölçüm derinliği seçilirse yalnız sıvı cinsinin etkisi araştırılır?',
  ['Su, 10 cm derinlik','Su, 20 cm derinlik','Sıvı yağ, 20 cm derinlik','Sıvı yağ, 10 cm derinlik'],3,
  figure(`<path d="M74 22 V120 H150 V22 M238 22 V120 H314 V22" fill="none" stroke="#333" stroke-width="1.5"/>${box(75,43,74,76,'#edf1f4')}${circle(130,93,3,'#222')}${line(134,93,173,93)}${text(187,107,'Ölçüm')}${text(187,122,'noktası')}${line(56,43,56,93)}${line(51,43,61,43)}${line(51,93,61,93)}${text(30,72,'10 cm')}${text(110,76,'Su')}${text(276,78,'?')}${text(112,141,'K: Hazır')}${text(276,141,'L: Kurulacak')}`, 'Hazır K kabında su yüzeyinden 10 santimetre aşağıda ölçüm noktası vardır. Özdeş L kabının sıvısı ve ölçüm derinliği henüz seçilmemiştir.'),
  ex('Araştırılan değişken sıvının cinsi; K’de su ve 10 cm derinlik var.','L düzeneğinde yalnız sıvı cinsini değiştirmek.','Sıvıyı değiştirirken ölçüm derinliğini aynı tut.',['L’ye sıvı yağ konursa sıvının cinsi değişir.','Ölçüm yine yüzeyden 10 cm aşağıda yapılırsa derinlik değişmez.'],'Yağ ve 20 cm seçeneği iki değişkeni birden değiştirir. Su ve 10 cm seçeneği ise araştırılan değişkeni değiştirmez.','Deney kurarken önce değiştireceğin koşulu, sonra aynı tutacağın koşulları belirle.'),'hard','analyze'),

 q(4,'physics','Kaldıraçta iş kolaylığı','F.8.5.1.1',53,
  'Ağırlığı ihmal edilen bir çubukla yük kaldırılacaktır. Yükün ve kuvvetin uygulandığı noktalar değiştirilmiyor; yalnız destek noktası taşınabiliyor. Sürtünme ihmal ediliyor.',
  'Aynı yükü daha küçük kuvvetle kaldırmak için ne yapılmalıdır?',
  ['Desteği kuvvete yaklaştırmak','Desteği yüke yaklaştırmak','Yükü ağırlaştırmak','Kuvvetin yönünü yukarı çevirmek'],1,
  figure(line(35,79,320,79)+box(45,49,34,30,'#ddd')+`<path d="M124 80 L109 105 H139 Z" fill="#eee" stroke="#333"/>`+arrow(305,34,305,75)+text(62,35,'Yük')+text(125,126,'Destek')+text(300,22,'Kuvvet')+line(25,107,333,107), 'Yük çubuğun sol ucuna, aşağı yönlü kuvvet sağ ucuna uygulanır. Destek iki nokta arasındadır ve yüke daha yakındır.'),
  ex('Yük ve kuvvet noktaları sabit, destek hareketlidir.','Daha küçük kuvvet gerektiren destek konumunu bulmak.','Destek yüke yaklaşırken kuvvetin etki kolunun nasıl değiştiğini düşün.',['Desteği yüke yaklaştırmak yük kolunu kısaltır.','Aynı anda kuvvet kolu uzar; yük daha küçük kuvvetle kaldırılabilir.'],'Kuvvetten sağlanan kolaylık işten kazanç değildir; kuvvetin uygulandığı uç daha fazla yol alır.','Kaldıraçta küçük kuvvet için destek yük tarafına yaklaşır.')),

 q(5,'physics','Elektrik enerjisinin dönüşümü','F.8.7.3.1',56,
  'Pille çalışan bir modelde anahtar kapatıldığında motorun ucundaki pervane dönüyor.',
  'Modelin amaçlanan işlevinde hangi enerji dönüşümünden yararlanılır?',
  ['Hareket enerjisinden elektrik enerjisine','Işık enerjisinden elektrik enerjisine','Elektrik enerjisinden hareket enerjisine','Çekim potansiyel enerjisinden ışık enerjisine'],2,
  figure(`<path d="M67 44 H142 M170 44 H269 V59 M269 99 V111 H67 V81" fill="none" stroke="#333" stroke-width="1.5"/>${line(58,68,77,68)}${line(61,78,74,78)}${line(67,44,67,68)}${line(67,78,67,111)}${circle(145,44,3)}${circle(168,44,3)}${line(145,44,168,44)}${circle(269,79,20)}${text(269,84,'M')}${text(68,138,'Pil')}${text(157,25,'Kapalı anahtar')}${text(273,138,'Motor ve pervane')}${line(289,79,317,79)}${line(318,59,318,99)}${line(302,64,334,94)}${line(302,94,334,64)}`, 'Pil, kapalı anahtar ve motor kapalı bir devre oluşturur. Motorun miline bir pervane bağlıdır.'),
  ex('Pil elektrik sağlar; motor pervaneyi döndürür.','Düzeneğin yaptığı işe göre enerji dönüşümünü seçmek.','Giriş enerjisini ve gözlenen çıkışı belirle.',['Motora elektrik enerjisi verilir.','Pervanenin dönmesi hareket enerjisinin oluştuğunu gösterir.'],'Gerçek motorda bir miktar enerji ısıya da dönüşebilir; burada amaç pervanenin hareketidir.','Dönüşümü bulurken önce “Ne veriliyor?”, sonra “Ne oluyor?” diye sor.'),'easy','understand'),

 q(6,'physics','Elektrik tasarrufunu değerlendirme','F.8.7.3.5',56,
  'Aynı aydınlık düzeyini sağlayan iki lamba için günlük kullanım verileri verilmiştir. I. K yerine L kullanmak tüketimi azaltır. II. K’nin kullanım süresini azaltmak tüketimi azaltır. III. Aynı süre kullanılırsa iki lamba eşit enerji tüketir.',
  'Bu bilgilerden hangileri doğrudur?',
  ['Yalnız I','Yalnız III','II ve III','I ve II'],3,
  figure(table(['Lamba','Süre (saat)','Enerji (Wh)'],[['K','5','50'],['L','5','30']])+text(180,116,'İki lamba aynı aydınlığı sağlar.'), 'Her iki lamba günde beş saat çalışır. K 50 watt-saat, L 30 watt-saat enerji tüketir ve aynı aydınlığı sağlar.'),
  ex('Süre ve sağlanan aydınlık aynı; tüketimler farklı.','Üç yargıyı verilenlerle ayrı ayrı değerlendirmek.','Eşit hizmet için tüketimi ve çalışma süresini dikkate al.',['L aynı aydınlık için daha az enerji tüketir; I doğrudur.','K daha kısa süre çalışırsa daha az tüketir; II doğrudur.','50 Wh ile 30 Wh eşit olmadığından III yanlıştır.'],'Doğru yargılar I ve II’dir; parlaklıkta azalma gerekmemektedir.','Tasarruf yalnız lambayı kısmak değildir; aynı işi daha verimli yapmak da tasarruftur.'),'medium','analyze','extended'),

 q(7,'chemistry','Periyodik sistemde sınıflandırma','F.8.4.1.2',52,
  'Periyodik sistemin ilk üç periyodu gösterilmiştir. Bir öğrenci alüminyumu (Al) metal, silisyumu (Si) ametal, argonu (Ar) soygaz olarak sınıflandırmıştır.',
  'Öğrencinin sınıflandırması için hangi düzeltme yapılmalıdır?',
  ['Al, yarı metal olarak değiştirilmelidir.','Si, yarı metal olarak değiştirilmelidir.','Ar, metal olarak değiştirilmelidir.','Üç sınıflandırma da doğrudur.'],1,
  figure([1,2,13,14,15,16,17,18].map((v,i)=>text(47.5+i*37,14,v)).join('')+[['H','','','','','','','He'],['Li','Be','B','C','N','O','F','Ne'],['Na','Mg','Al','Si','P','S','Cl','Ar']].map((row,r)=>text(15,44+r*33,r+1)+row.map((v,c)=>v?box(30+c*37,25+r*33,35,28)+text(47.5+c*37,44+r*33,v):'').join('')).join('')+text(180,143,'Üstte grup, solda periyot numaraları'), 'İlk üç periyot verilmiştir. Al ve Si üçüncü periyotta yan yanadır; Ar aynı periyodun 18. grubundadır. Sınıflar renklerle belirtilmemiştir.'),
  ex('Al metal, Si ametal, Ar soygaz olarak yazılmış.','Hatalı sınıflandırmayı bulup düzeltmek.','Her elementin sınıfını ayrı kontrol et; aynı periyotta olmak aynı sınıfta olmak değildir.',['Alüminyum metaldir; bu eşleştirme doğrudur.','Silisyum yarı metaldir; ametal etiketi değiştirilmelidir.','Argon soygazdır; bu eşleştirme doğrudur.'],'Yalnız Si için düzeltme gerekir. Soygazlar ametallerin özel bir grubudur.','Bir periyotta metal, yarı metal ve ametal elementler birlikte bulunabilir.'),'medium','apply'),

 q(8,'chemistry','Fiziksel ve kimyasal değişim','F.8.4.2.1',52,
  'Demir bir çivinin nemli ortamda zamanla kahverengi bir tabakayla kaplandığı gözleniyor. İncelemede bu tabakanın demirden farklı özellikte bir madde olduğu belirleniyor.',
  'Değişimin kimyasal olduğunu gösteren temel kanıt hangisidir?',
  ['Çivinin yer değiştirmesi','Yeni özellikte bir madde oluşması','Çivinin yalnız biçiminin değişmesi','Ortamın nemli olması'],1,
  figure(box(42,58,100,10,'#eee')+box(37,47,5,32,'#ddd')+`<path d="M142 58 L161 63 L142 68Z" fill="#eee" stroke="#333"/>`+arrow(176,62,202,62)+box(236,58,86,10,'#bcbcbc')+box(231,47,5,32,'#bcbcbc')+`<path d="M322 58 L340 63 L322 68Z" fill="#bcbcbc" stroke="#333"/>`+[246,263,278,298,315].map(x=>circle(x,62,2,'#777')).join('')+text(95,107,'Başlangıç')+text(280,107,'Bir süre sonra')+text(282,134,'Yeni tabaka'), 'Başlangıçtaki temiz çivi ile üzerinde yeni tabaka oluşmuş çivi gösterilmektedir.'),
  ex('İnceleme, yüzey tabakasının demirden farklı bir madde olduğunu gösteriyor.','Kimyasal değişimi ayırt eden kanıtı bulmak.','Şekil veya ortam koşulundan çok madde kimliğinin değişimine bak.',['Kimyasal değişimde yeni özellikte madde oluşur.','Çivideki tabakanın farklı madde olduğu incelemeyle belirlenmiştir.'],'Tek başına nemli ortam veya görünüm değişimi aynı güçlü kanıtı sağlamaz.','Kimyasal değişimde temel soru: Yeni madde oluştu mu?')),

 q(9,'chemistry','Ayraçla asit-baz ayrımı','F.8.4.4.3',52,
  'Bir ayraç asitlerde pembe, nötr sıvılarda mor, bazlarda yeşil renk vermektedir. Öğretmen gözetiminde K ve L sıvılarına bu ayraç eklenince gözlenen renkler verilmiştir.',
  'K ve L için hangi sınıflandırma yapılır?',
  ['K baz, L asittir.','İkisi de nötrdür.','K asit, L bazdır.','İkisi de asittir.'],2,
  figure(`<path d="M58 30 V98 Q83 120 108 98 V30 M236 30 V98 Q261 120 286 98 V30" fill="none" stroke="#333" stroke-width="1.5"/>${line(59,70,107,70)}${line(237,70,285,70)}${text(83,90,'Pembe')}${text(261,90,'Yeşil')}${text(83,140,'K')}${text(261,140,'L')}`, 'K kabında pembe, L kabında yeşil renk gözlenir. Renkler yazıyla da belirtilmiştir.'),
  ex('Ayracın renk anahtarı ve iki gözlem verilmiş.','Renkleri sıvıların sınıflarıyla eşlemek.','Renklerin gündelik çağrışımına değil verilen ayraç anahtarına bak.',['Pembe asidi gösterdiği için K asittir.','Yeşil bazı gösterdiği için L bazdır.'],'Nötr sıvı mor olmalıydı; iki gözlemden hiçbiri mor değildir.','Bir sıvıyı tanımak için tatma veya dokunma; verilen ayraç sonucunu kullan.'),'easy','apply'),

 q(10,'chemistry','Isınmada kütlenin etkisi','F.8.4.5.1',53,
  'Özdeş kaplardaki saf suların başlangıç sıcaklıkları aynıdır. Özdeş ısıtıcılar eşit süre çalıştırılıyor. Isı kayıpları ihmal ediliyor ve son sıcaklıklar ölçülüyor.',
  'Bu deneyde etkisi araştırılan değişken hangisidir?',
  ['Suyun cinsi','Isıtma süresi','Başlangıç sıcaklığı','Suyun kütlesi'],3,
  figure(`<path d="M48 29 V103 H137 V29 M219 29 V103 H308 V29" fill="none" stroke="#333" stroke-width="1.5"/>${box(49,75,87,27,'#edf1f4')}${box(220,48,87,54,'#edf1f4')}${box(48,112,89,8,'#ddd')}${box(219,112,89,8,'#ddd')}${text(92,21,'100 g su')}${text(263,21,'200 g su')}${text(92,140,'20 °C başlangıç')}${text(263,140,'20 °C başlangıç')}`, 'İki özdeş kapta 20 derecede 100 gram ve 200 gram saf su vardır. Altlarında özdeş ısıtıcılar bulunur.'),
  ex('Madde, başlangıç sıcaklığı, ısıtıcı ve süre aynı; kütle farklı.','Bilerek değiştirilen değişkeni belirlemek.','Aynı tutulanları ele, geriye kalan farkı bul.',['Bir kapta 100 g, diğerinde 200 g su vardır.','Bu farkın son sıcaklığa etkisi araştırılmaktadır.'],'Son sıcaklık ölçülen sonuçtur; kütle araştırılan değişkendir.','“Neyi değiştirdim?” bağımsız değişkeni, “Neyi ölçtüm?” bağımlı değişkeni gösterir.')),

 q(11,'chemistry','Isınma grafiği','F.8.4.5.3',53,
  'Başlangıçta katı olan saf bir madde sabit basınçta, sabit güçte bir ısıtıcıyla ısıtılıyor. Maddenin sıcaklık-zaman grafiği verilmiştir. 2–5. dakikalar arasında kapta katı ve sıvı birlikte gözleniyor.',
  '2–5. dakikalar arasında madde için hangisi doğrudur?',
  ['Isı almaya devam ederken hâl değiştirmektedir.','Isıtıcı çalışmadığından sıcaklığı sabittir.','Maddenin aldığı ısı sıfırdır.','Madde tamamen gaz hâlindedir.'],0,
  figure(arrow(47,121,328,121)+arrow(47,121,47,15)+text(58,15,'Sıcaklık (°C)','start')+text(282,146,'Zaman (dk)')+line(47,91,117,71)+line(117,71,222,71)+line(222,71,292,31)+[0,2,5,7].map(v=>text(47+v*35,138,v)).join('')+[[-20,91],[0,71],[40,31]].map(([v,y])=>line(43,y,47,y)+text(35,y+4,v,'end')).join('')+line(117,71,117,121,'stroke-dasharray="3 3"')+line(222,71,222,121,'stroke-dasharray="3 3"'), 'Grafik 0. dakikada eksi 20 dereceden 2. dakikada sıfıra yükselir, 5. dakikaya kadar sıfırda sabit kalır, sonra yükselir.'),
  ex('Isıtıcı çalışıyor; sıcaklık sabit ve katı-sıvı birlikte bulunuyor.','Yatay bölümün hangi olayı gösterdiğini açıklamak.','Isı almak ile sıcaklığın artmasını aynı şey sayma.',['Saf madde erirken aldığı ısı hâl değişimi için kullanılır.','Bu süreçte sıcaklık sabit kalabilir.'],'Katı ve sıvının birlikte bulunması erime açıklamasını destekler.','Grafikte yatay çizgi her zaman ısı alınmadığı anlamına gelmez.'),'hard','analyze'),

 q(12,'chemistry','Kimyasal değişimde kütlenin korunumu','F.8.4.3.1',52,
  'Şişedeki sıvı ile balondaki katı karıştığında gaz oluşuyor ve balon şişiyor. Şişe-balon sistemi kapalıdır; dışarıya madde çıkmıyor. Başlangıçta tüm düzeneğin kütlesi 170 g ölçülüyor.',
  'Tepkime sonunda aynı düzeneğin kütlesi kaç gram olur?',
  ['170 g’dan az','170 g','170 g’dan fazla','Balonun hacmi verilmeden bulunamaz.'],1,
  figure(`<path d="M58 55 V86 L46 99 V121 H112 V99 L100 86 V55Z M240 55 V86 L228 99 V121 H294 V99 L282 86 V55Z" fill="none" stroke="#333" stroke-width="1.4"/><path d="M58 55 Q60 24 79 34 Q99 24 100 55Z" fill="#eee" stroke="#333"/><ellipse cx="261" cy="30" rx="32" ry="25" fill="#eee" stroke="#333"/>${line(61,110,106,110)}${line(234,110,288,110)}${box(33,125,94,14)}${text(80,136,'170 g')}${box(214,125,94,14)}${text(261,136,'?')}${arrow(147,80,196,80)}`, 'Başlangıçta küçük balonlu, sonda şişmiş balonlu şişeler ayrı terazilerde gösterilmiştir. İlk okuma 170 gram, son okuma bilinmiyor.'),
  ex('Tüm düzenek başlangıçta 170 g; dışarı madde çıkmıyor.','Gaz oluşunca toplam kütlenin değişip değişmediğini bulmak.','Gazın sistemin içinde kaldığına dikkat et.',['Maddeler tepkimeyle farklı maddelere dönüşür; toplam kütle korunur.','Oluşan gaz balonda kalır ve terazinin ölçtüğü düzeneğe dâhildir.'],'Son kütle 170 g olur; hacmin artması kütlenin artması değildir.','Kütle sorusunda önce sistem açık mı kapalı mı kontrol et.')),

 q(13,'biology','DNA’da baz eşleşmesi','F.8.2.1.2',50,
  'DNA’nın bir bölümünde karşılıklı eşleşen bazlardan bir zincirdekiler verilmiştir. A adenin, T timin, G guanin, C sitozini göstermektedir.',
  'Boş kutulara üstten alta sırasıyla hangi bazlar gelmelidir?',
  ['A – C – T','G – T – C','T – G – A','C – A – G'],2,
  figure(line(103,20,103,127)+line(253,20,253,127)+['A','C','T'].map((v,i)=>box(105,27+i*33,42,24)+text(126,44+i*33,v)+line(148,39+i*33,209,39+i*33)+box(211,27+i*33,40,24)+text(231,44+i*33,'?')).join(''), 'DNA’nın sol zincirinde üstten alta A, C ve T bulunur. Karşılarındaki üç baz boştur.'),
  ex('Bir zincirde A, C ve T var.','Karşılıklı eşleşen bazları yerleştirmek.','Her basamağı A-T ve G-C eşleşmesine göre tamamla.',['A’nın karşısına T gelir.','C’nin karşısına G, T’nin karşısına A gelir.'],'Üç basamakta da doğru eşleşme oluşur: A-T, C-G, T-A.','Eşleşmeleri iki sabit çift olarak düşün: A-T ve G-C.'),'easy','apply'),

 q(14,'biology','Tek karakter kalıtımı','F.8.2.2.2',50,
  'Bezelyelerde sarı tohum rengi A, yeşil tohum rengi a aleliyle gösteriliyor; A baskındır. Aa genotipli bezelye ile aa genotipli bezelye çaprazlanıyor. Olası birleşmeler tabloda verilmiştir.',
  'Bir yavrunun sarı tohumlu olma olasılığı kaçtır?',
  ['Yüzde 0','Yüzde 25','Yüzde 100','Yüzde 50'],3,
  figure(table(['','A','a'],[['a','Aa','aa'],['a','Aa','aa']]), 'Çaprazlama tablosunda iki Aa ve iki aa birleşmesi vardır.'),
  ex('A baskın; dört eş olasılıklı birleşmenin ikisi Aa, ikisi aa.','Sarı fenotipin olasılığını bulmak.','En az bir A içeren birleşmeleri say.',['Aa olan iki birleşme sarı tohum verir.','İki sarı olasılık, dört olasılığın yarısıdır; yüzde 50.'],'Bu, olasılıktır; her dört yavrunun kesin ikisinin sarı olacağı anlamına gelmez.','Baskın fenotip için bir baskın alel yeterlidir.'),'medium','apply'),

 q(15,'biology','Modifikasyon','F.8.2.3.3',50,
  'Aynı bitkiden alınan genetik olarak özdeş iki çelik farklı ışık koşullarında yetiştiriliyor. Yaprak büyüklükleri farklılaşıyor. Yeni çelikler aynı ışık koşulunda yetiştirildiğinde bu fark gözlenmiyor.',
  'Gözlenen değişim en uygun nasıl açıklanır?',
  ['Çevre koşullarına bağlı modifikasyon','DNA yapısını değiştiren kalıcı mutasyon','Yeni bir bitki türünün oluşması','Canlının istediği özelliği yavrularına aktarması'],0,
  figure(text(81,18,'Daha çok ışık')+text(269,18,'Daha az ışık')+line(81,109,81,47)+line(269,109,269,47)+`<ellipse cx="67" cy="66" rx="12" ry="6" fill="#eee" stroke="#333"/><ellipse cx="94" cy="84" rx="12" ry="6" fill="#eee" stroke="#333"/><ellipse cx="247" cy="66" rx="22" ry="9" fill="#eee" stroke="#333"/><ellipse cx="290" cy="86" rx="22" ry="9" fill="#eee" stroke="#333"/>${box(53,110,56,19)}${box(241,110,56,19)}${text(176,141,'Başlangıçta genetik olarak özdeş bitkiler')}`, 'Aynı kökenden iki bitki, farklı ışık koşullarında farklı yaprak büyüklükleri gösterir.'),
  ex('Başlangıç genetik yapısı aynı; fark çevreye bağlı ve aynı koşullarda sürmüyor.','Mutasyon ile modifikasyonu ayırmak.','Farkın DNA değişikliğine mi çevre etkisine mi dayandığına bak.',['Farklı ışık koşulları bitkinin görünümünü etkiliyor.','Aynı koşullarda farkın ortadan kalkması modifikasyonu destekliyor.'],'Veriler kalıcı DNA değişikliği veya yeni tür oluştuğunu göstermiyor.','Her görünüm değişikliği mutasyon değildir.'),'medium','analyze','extended'),

 q(16,'biology','Doğal seçilim','F.8.2.4.1',51,
  'Bir kelebek topluluğunda başlangıçtan beri açık ve koyu renkli bireyler vardır. Ağaç gövdelerinin koyulaştığı ortamda kuşların açık renkli kelebekleri daha kolay avladığı gözleniyor. Birkaç kuşak sonra koyu renkli bireylerin oranı artıyor.',
  'Bu değişimin en uygun açıklaması hangisidir?',
  ['Bütün açık kelebekler isteyerek koyulaşmıştır.','Kuşlar kelebeklerin DNA’sını aynı biçimde değiştirmiştir.','Başlangıçta var olan koyu renkli bireylerin yaşama şansı artmıştır.','Koyu renk sonradan bütün yavrulara çevreden geçmiştir.'],2,
  figure(box(41,18,97,104,'#777')+box(222,18,97,104,'#777')+[51,81,106].map(y=>circle(72,y,6,'white')+circle(103,y,6,'#444')).join('')+[43,66,89,111].map(y=>circle(245,y,6,'#444')).join('')+circle(284,45,6,'white')+circle(284,81,6,'#444')+text(90,144,'Başlangıç')+text(271,144,'Birkaç kuşak sonra')+arrow(151,70,205,70), 'Koyu zemin üzerindeki ilk toplulukta açık ve koyu bireyler birlikte bulunur. Sonraki kuşaklarda koyu bireylerin oranı artmıştır.'),
  ex('İki renk baştan var; görünürlüğe bağlı avlanma farklı.', 'Koyu bireylerin neden daha yaygınlaştığını açıklamak.','Bireyin renk değiştirmesi ile toplulukta oran değişmesini ayır.',['Koyu kelebekler koyu gövdede daha az fark edilir.','Daha fazla hayatta kalıp üreyebilirler; birkaç kuşakta oranları artar.'],'Gözlem tüm açık bireylerin koyulaştığını söylemiyor; var olan çeşitler farklı başarı gösteriyor.','Doğal seçilim var olan kalıtsal çeşitlilik üzerinde etkili olur.'),'hard','analyze','extended'),

 q(17,'biology','Fotosentez hızında kontrollü deney','F.8.6.2.2',54,
  'Özdeş su bitkileri aynı sıcaklık, su ve karbondioksit koşullarında, aynı lambaya farklı uzaklıklarda tutuluyor. Bu deneyde dakikadaki oksijen kabarcığı sayısı fotosentez hızının göstergesi kabul ediliyor.',
  'Tablodan hangi sonuca ulaşılır?',
  ['Fotosentez yalnız Güneş ışığında gerçekleşir.','Bu koşullarda ışık kaynağına yakın olan bitkide fotosentez daha hızlıdır.','Sıcaklık artışı fotosentezi hızlandırmıştır.','İki bitkinin fotosentez hızı aynıdır.'],1,
  figure(table(['Bitki','Lambaya uzaklık','Kabarcık / dk'],[['K','20 cm','24'],['L','60 cm','8']])+text(180,115,'Diğer koşullar aynıdır.'), 'K 20 santimetre uzakta ve dakikada 24 kabarcık; L 60 santimetre uzakta ve dakikada 8 kabarcık oluşturur.'),
  ex('Yalnız uzaklık farklı; kabarcık sayısı hız göstergesi.', 'Deneyin desteklediği sonucu seçmek.','Değiştirilen koşulu ölçülen sonuçla ilişkilendir.',['Yakın K bitkisi dakikada daha çok kabarcık oluşturuyor.','Verilen göstergeye göre K’nin fotosentezi daha hızlıdır.'],'Sıcaklık sabittir; bu deney sıcaklık etkisini göstermez.','Deneyde değiştirmediğin bir faktör hakkında sonuç çıkarma.'),'hard','analyze'),

 q(18,'biology','Su döngüsü','F.8.6.3.1',54,
  'Şemada su döngüsünün bir bölümü verilmiştir. X, göldeki sıvı suyun atmosfere geçişini; Y, atmosferdeki su buharından küçük su damlacıkları oluşmasını gösteriyor.',
  'X ve Y olayları sırasıyla hangileridir?',
  ['X: Yoğuşma, Y: Buharlaşma','X: Donma, Y: Erime','X: Erime, Y: Donma','X: Buharlaşma, Y: Yoğuşma'],3,
  figure(`<path d="M22 121 Q61 109 98 122 T170 121" fill="none" stroke="#333" stroke-width="2"/>${text(75,144,'Göl')}${arrow(83,106,127,43)}${text(87,68,'X')}${text(160,28,'Su buharı')}${arrow(207,31,255,31)}${text(231,19,'Y')}<path d="M262 58 C238 56 243 30 260 32 C267 11 290 18 290 29 C311 16 328 34 320 47 C342 58 310 67 299 58 Z" fill="#eee" stroke="#333"/>${line(281,80,276,96)}${line(303,85,298,101)}${line(315,108,310,124)}${text(259,138,'Yağış')}`, 'Gölden su buharına X oku, su buharından damlacıklı buluta Y oku; buluttan yağış çizilmiştir.'),
  ex('X sıvıdan gaza geçiş; Y gazdan sıvı damlacık oluşumu.', 'Hâl değişimlerini su döngüsündeki görevleriyle eşlemek.','Başlangıç ve son hâli belirle.',['Sıvı suyun buhar olarak atmosfere geçmesi buharlaşmadır.','Su buharının damlacık oluşturması yoğuşmadır.'],'Yağış ayrı bir basamaktır; Y, damlacıkların oluşumudur.','Bulutları oluşturan damlacıklar sıvıdır; su buharı gözle görülmez.'),'easy','apply'),
];
