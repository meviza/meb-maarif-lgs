/**
 * MEB Maarif LGS Platformu - Soru Bankası Genişletme ve Ölçekleme Motoru
 * 53 Sorudan 108 Soruya 16 Test Paketi ile Kurumsal Büyüme
 * 
 * Her bir soru:
 * - MEB Türkiye Yüzyılı Maarif Modeli 8. Sınıf müfredatına tam uyumludur.
 * - 4 Kademeli zorluk hiyerarşisine (Kavrama, Uygulama, LGS Yeni Nesil, Şampiyon) göre kurgulanmıştır.
 * - Sıfır Şüphe (Zero Ambiguity) ve tek deterministik doğru cevaba sahiptir.
 * - 3 çeldirici için detaylı pedagojik gerekçelendirme içerir.
 * - %100 sıfır emoji garantisine sahiptir.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JevQualityAuditor } from './jev_evaluator.mjs';
import { QuestionQualityAnalytics } from './quality_analytics.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getScaledQuestionBank() {
  const qPath = path.join(__dirname, '..', 'public', 'questions.json');
  const baseData = JSON.parse(fs.readFileSync(qPath, 'utf-8'));

  // 1. TÜRKÇE GENİŞLETMELERİ (14 -> 28 Soru, 4 Test Paketi)
  const trT1New = [
    {
      id: "LGS-TR-T1-05",
      course: "TÜRKÇE",
      sourceTag: "LGS Şampiyon Düzeyi",
      outcomeCode: "T.8.3.14.05 • Çoklu Çıkarım ve Metin Analizi",
      difficulty: "SEKIL_VE_OLIMPIYAT",
      stimulus: "Klasik biyografi yazarları, ele aldıkları tarihî şahsiyeti kusursuz bir heykel gibi donuklaştırma yanılgısına düşerler. Oysa çağdaş biyografi, bireyin zaaflarını, iç çelişkilerini ve tereddütlerini de gün ışığına çıkararak onu ete kemiğe büründürür. Gerçek bir biyografi, kahramanı göklere çıkaran bir methiye değil; insan ruhunun labirentlerinde fenerle dolaşan titiz bir kazı çalışmasıdır. Ancak bu kazı, bireyin mahremiyetini istismar etme ucuzluğuna sapmadan, nesnel belgelerin rehberliğinde yürütülmelidir.",
      stem: "Bu parçadaki altı çizili 'insan ruhunun labirentlerinde fenerle dolaşan titiz bir kazı çalışması' sözüyle anlatılmak istenen en kapsamlı yargı aşağıdakilerden hangisidir?",
      options: {
        A: "Tarihî olayların kronolojik sırasını hiç bozmadan kayıt altına almak",
        B: "Kişinin karmaşık ve gizli kalmış iç dünyasını bilimsel tarafsızlıkla aydınlatmak",
        C: "Yalnızca toplumun onayladığı erdemli davranışları öne çıkarmak",
        D: "Geçmişin karanlıkta kalmış siyasi sırlarını açığa çıkarmak"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: 'Labirent' karmaşıklığı ve iç içeliği, 'fener' aydınlatma ve görünür kılmayı, 'kazı çalışması' ise derinlemesine ve titiz araştırmayı simgeler. Bu metaforları birleştiren seçeneğe odaklanın.",
      detailedSolution: "Metinde geçen labirent ruhun derin ve karmaşık yapısını; fenerle dolaşmak aydınlatmayı; kazı çalışması ise bilimsel nesnellikle yapılan titiz incelemeyi temsil eder. Dolayısıyla en kapsamlı yargı B seçeneğidir.",
      distractors: {
        A: "Kronolojik sıra sadece biçimsel bir aktarımdır, ruhsal derinlikle ilişkisi kurulmamıştır.",
        C: "Parça methiyeyi reddetmekte, sadece erdemlerin değil zaafların da yazılmasını savunmaktadır.",
        D: "Siyasi sırlar metnin bağlamında yer almaz; konu doğrudan şahsın bireysel ve ruhsal portresidir."
      }
    }
  ];

  const trT2New = [
    {
      id: "LGS-TR-T2-05",
      course: "TÜRKÇE",
      sourceTag: "MEB Maarif Temel Kazanım",
      outcomeCode: "T.8.3.18.01 • Anlatım Biçimleri ve Düşünceyi Geliştirme",
      difficulty: "KAVRAMA",
      stimulus: "Ege kıyılarında zeytin hasadı kasım ayında başlar. Sabahın erken saatlerinde köylüler yaygılarını ağaçların altına serer, uzun sırıklarla dalları usulca sarsarlar. Yere düşen taneler tek tek toplanarak delikli kasalara doldurulur. Akşamüzeri traktör römorklarına yüklenen zeytinler, soğuk sıkım fabrikalarına ulaştırılır ve aynı gece işlenir.",
      stem: "Bu parçanın anlatımında ağır basan anlatım biçimi aşağıdakilerden hangisidir?",
      options: {
        A: "Öyküleme",
        B: "Tartışma",
        C: "Betimleme",
        D: "Açıklama"
      },
      correctOption: "A",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Metindeki eylemlerin zamana bağlı akışına (hasat başlar -> yaygılar serilir -> sırıkla sarsılır -> toplanır -> fabrikaya ulaştırılır) dikkat ediniz.",
      detailedSolution: "Metinde olaylar kronolojik bir zaman dizisi içinde hareket bildiren fiillerle aktarılmıştır. Zaman ve eylem zinciri öyküleyici anlatımın temel niteliğidir.",
      distractors: {
        B: "Yazar karşıt bir fikri çürütmeye çalışmamakta, tarafsız bir süreci aktarmaktadır.",
        C: "Fiziksel özelliklerin durağan resmi çizilmemiştir; olaylar hareket halindedir.",
        D: "Bilgi verme amacı arka plandadır; asıl ağırlık sürecin hikâye edilmesindedir."
      }
    }
  ];

  const trT3New = [
    {
      id: "LGS-TR-T3-03",
      course: "TÜRKÇE",
      sourceTag: "MEB Maarif Modeli",
      outcomeCode: "T.8.3.15 • Metnin Ana Düşüncesi ve Yardımcı Fikirler",
      difficulty: "LGS_YENI_NESIL",
      stimulus: "Yapay zekâ ve algoritma çağında en büyük yanılgı, bilgiyi depolamanın bilgili olmakla eşdeğer sanılmasıdır. Bugün cep telefonumuzdaki bir arama motoru, dünyanın tüm ansiklopedilerinden daha fazla veriyi saliseler içinde önümüze serebilmektedir. Ancak bilgiyi kritik süzgecinden geçirmeyen, onu ahlaki bir erdemle ve insanlığın faydasıyla buluşturamayan zihinler; okyanus ortasında tatlı su arayan çaresiz kazazedelere benzer.",
      stem: "Bu parçadan çıkarılabilecek en kapsamlı sonuç aşağıdakilerden hangisidir?",
      options: {
        A: "Teknolojik gelişmeler dijital bağımlılığı ve tembelliği körüklemektedir.",
        B: "Önemli olan ham veriye ulaşmak değil, bilgiyi eleştirel akıl ve erdemle işlemektir.",
        C: "Arama motorlarının sunduğu bilgiler güvenilirlikten yoksundur.",
        D: "Yapay zekâ algoritmaları insan hafızasını tamamen işlevsiz kılmıştır."
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Parçanın son cümlesindeki benzetmeyi ve 'kritik süzgeci', 'ahlaki erdem' anahtar sözcüklerini analiz edin.",
      detailedSolution: "Metin bilginin çokluğuna veya hızına değil, onun eleştirel süzgeçten geçirilip erdemle birleştirilmesine vurgu yapmaktadır. Bu nedenle doğru cevap B'dir.",
      distractors: {
        A: "Parçada genel bir dijital bağımlılık uyarısı yapılmamakta, bilgi işleme kapasitesi eleştirilmektedir.",
        C: "Arama motorlarının güvenilirliği değil, kullanıcının bilgiyi işleme yetisi sorgulanmaktadır.",
        D: "İnsan hafızasının yok olduğu şeklinde abartılı bir yargıya ulaşılamaz."
      }
    },
    {
      id: "LGS-TR-T3-04",
      course: "TÜRKÇE",
      sourceTag: "2024 LGS Örnek Soru",
      outcomeCode: "T.8.3.26 • Sözel Mantık ve Akıl Yürütme",
      difficulty: "UYGULAMA",
      stimulus: "Bir okul münazara kulübünde Ahmet, Burak, Ceren ve Derya adlı dört öğrenci pazartesi, salı, çarşamba ve perşembe günleri birer konuşma yapacaktır. Konuşma sırasıyla ilgili kurallar şunlardır:\n- Ahmet, Ceren'den hemen önceki gün konuşmuştur.\n- Burak ilk gün konuşmamıştır.\n- Derya perşembe günü konuşacaktır.",
      stem: "Bu kurallara göre salı günü konuşan öğrenci kesinlikle kimdir?",
      options: {
        A: "Ahmet",
        B: "Burak",
        C: "Ceren",
        D: "Derya"
      },
      correctOption: "C",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Günleri (Pzt, Sal, Çar, Per) listeleyin. Perşembe = Derya. Ahmet ve Ceren peş peşe olmalıdır (Pzt-Sal veya Sal-Çar). Burak ilk gün olamaz kuralını uygulayın.",
      detailedSolution: "Günler: Pzt, Sal, Çar, Per. Derya Perşembe'dir. Geriye Pzt, Sal, Çar kalır. Ahmet Ceren'den hemen önce olduğuna göre ikili blok (Ahmet, Ceren) şeklindedir. Burak ilk gün olamayacağına göre Burak Çarşamba olmak zorundadır. O halde Ahmet Pazartesi, Ceren Salı günü konuşur.",
      distractors: {
        A: "Ahmet Pazartesi günü konuşur; Salı günü konuşamaz çünkü o zaman Burak Pazartesi'ye kalır ve kural ihlal edilir.",
        B: "Burak Çarşamba günü konuşmaktadır.",
        D: "Derya zaten öncülde açıkça belirtildiği üzere Perşembe konuşur."
      }
    },
    {
      id: "LGS-TR-T3-05",
      course: "TÜRKÇE",
      sourceTag: "MEB Maarif Temel Kazanım",
      outcomeCode: "T.8.3.17 • Metindeki Söz Sanatları",
      difficulty: "KAVRAMA",
      stimulus: "Rüzgâr, ıssız vadide asırlık çınar ağacının dallarına usulca fısıldıyor; yorgun yapraklar toprağa kavuşmanın sevinciyle dans ediyordu.",
      stem: "Bu cümlede kullanılan söz sanatı aşağıdakilerden hangisidir?",
      options: {
        A: "Tezat (Karşıtlık)",
        B: "Teşhis (Kişileştirme)",
        C: "Mübalağa (Abartma)",
        D: "Tecahüliarif (Bilmezden Gelme)"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: İnsana ait özelliklerin (fısıldamak, sevinçle dans etmek) insan dışı varlıklara (rüzgâr, yaprak) aktarılıp aktarılmadığını kontrol edin.",
      detailedSolution: "Rüzgârın fısıldaması ve yaprakların sevinçle dans etmesi, insani duygu ve davranışların doğaya aktarılmasıdır; bu sanat teşhis (kişileştirme) sanatıdır.",
      distractors: {
        A: "Zıt kavramlar bir arada kullanılmamıştır.",
        C: "Bir durum akıl sınırlarını zorlayacak derecede büyütülmemiştir.",
        D: "Bilinen bir gerçeğin bilmezden gelinmesi söz konusu değildir."
      }
    },
    {
      id: "LGS-TR-T3-06",
      course: "TÜRKÇE",
      sourceTag: "MEB Örnek Formatı",
      outcomeCode: "T.8.3.25 • Grafik ve Tablo Yorumlama",
      difficulty: "UYGULAMA",
      stimulus: "Bir ildeki 4 farklı ilçenin (K, L, M, N) 2024 yılı geri dönüştürülen atık miktarları şöyledir:\n- K ilçesi: 120 ton plastik, 80 ton kâğıt\n- L ilçesi: 90 ton plastik, 140 ton kâğıt\n- M ilçesi: 150 ton plastik, 60 ton kâğıt\n- N ilçesi: 110 ton plastik, 110 ton kâğıt",
      stem: "Bu veriler doğrultusunda geri dönüşüm miktarları hesaplandığında toplam geri dönüşümü en fazla olan ilçe hangisidir?",
      options: {
        A: "K ilçesi",
        B: "L ilçesi",
        C: "M ilçesi",
        D: "N ilçesi"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Her ilçe için plastik ve kâğıt miktarlarını toplayarak toplam dönüşüm değerini hesaplayınız.",
      detailedSolution: "K = 120 + 80 = 200 ton; L = 90 + 140 = 230 ton; M = 150 + 60 = 210 ton; N = 110 + 110 = 220 ton. En yüksek toplam 230 ton ile L ilçesine aittir.",
      distractors: {
        A: "K ilçesi toplam 200 ton ile en düşük seviyededir.",
        C: "M ilçesi plastikte birinci olsa da toplamda 210 ton kalmaktadır.",
        D: "N ilçesi dengeli 220 ton toplamaktadır ancak 230 ton olan L'nin gerisindedir."
      }
    },
    {
      id: "LGS-TR-T3-07",
      course: "TÜRKÇE",
      sourceTag: "LGS Şampiyon Düzeyi",
      outcomeCode: "T.8.3.34 • Üst Düzey Metin Analizi ve Örtük Anlam",
      difficulty: "SEKIL_VE_OLIMPIYAT",
      stimulus: "Sanat eserinde biçim ile öz arasındaki münasebet, nehir yatağı ile suyun akışı gibidir. Yatak olmadan su dağılıp bataklığa döner; su olmadan da kurumuş yatak bir taştan ibarettir. Modern şiirimizin kimi temsilcileri salt sözcük cambazlığına sığınarak nehri susuz bırakmış, kimileri ise coşkun bir lirizm uğruna nehir yatağını yıkıp sele kurban etmiştir.",
      stem: "Bu parçadaki düşünce ilişkisi ve sanat kurgusu değerlendirildiğinde eleştirmenin en çok karşı çıktığı şair tutumu aşağıdakilerden hangisidir?",
      options: {
        A: "Derin felsefi düşünceleri güçlü ve sağlam bir dize mimarisiyle yoğuran şairi",
        B: "Sadece söyleyiş kusursuzluğuna odaklanıp şiirin anlam boyutunu boşlayan şairi",
        C: "Geleneksel vezin ve kafiye disiplinini çağdaş temalarla harmanlayan şairi",
        D: "Duygu yoğunluğunu dilin kurallarına ve estetik sınırlarına riayet ederek işleyen şairi"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Eleştirmenin 'nehri susuz bırakmak' sözüyle biçime tapıp özü ihmal edenleri eleştirdiğini saptayın. Onaylanmayacak tutum doğrudan bu eksendedir.",
      detailedSolution: "Parçada eleştirmen biçim (nehir yatağı) ve öz (su) dengesini şart koşar. 'Salt sözcük cambazlığına sığınarak nehri susuz bırakanlar' eleştirildiği için B seçeneğindeki yaklaşımı kesinlikle onaylamaz.",
      distractors: {
        A: "Düşünce ile sağlam mimariyi birleştiren tutum yazarın ideal gördüğü dengedir.",
        C: "Geleneksel disiplinle çağdaş temayı buluşturmak biçim-öz dengesine uygundur.",
        D: "Duyguyu estetik sınırlara uyarak aktarmak yazarın savunduğu harmoniye uygundur."
      }
    }
  ];

  const trT4Questions = [
    {
      id: "LGS-TR-T4-01",
      course: "TÜRKÇE",
      sourceTag: "MEB Maarif Temel Kazanım",
      outcomeCode: "T.8.4.16 • Fiilimsiler (Eylemsiler)",
      difficulty: "KAVRAMA",
      stimulus: "Güneşin batışını izleyen yolcular, akşam serinliğinde dinlenmek için gölgelik bir ağacın altına oturdular.",
      stem: "Bu cümledeki altı çizili 'izleyen' sözcüğünün fiilimsi türü aşağıdakilerden hangisidir?",
      options: {
        A: "İsim-fiil",
        B: "Sıfat-fiil",
        C: "Zarf-fiil",
        D: "Çekimli fiil"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: '-en / -an' ekini alan sözcüğün 'yolcular' ismini niteleyip nitelemediğini kontrol ediniz.",
      detailedSolution: "'İzleyen yolcular' tamlamasında '-en' eki sıfat-fiil ekidir ve ismi niteleyen bir sıfat tamlaması kurmuştur.",
      distractors: {
        A: "İsim-fiil ekleri '-ma, -ış, -mak' kalıplarıdır.",
        C: "Zarf-fiil eylemin durumunu veya zamanını bildirir (-ken, -alı, -ince vb.).",
        D: "Sözcük kip ve kişi eki almadığı için çekimli fiil değildir."
      }
    },
    {
      id: "LGS-TR-T4-02",
      course: "TÜRKÇE",
      sourceTag: "MEB Maarif Temel Kazanım",
      outcomeCode: "T.8.4.18 • Cümlenin Ögeleri",
      difficulty: "UYGULAMA",
      stimulus: "Kütüphanedeki eski el yazması eserler, uzman restoratörler tarafından özenle temizlendi.",
      stem: "Dilbilgisi kurallarına göre bu cümlenin özne görevindeki temel ögesi aşağıdakilerden hangisidir?",
      options: {
        A: "Kütüphanedeki eski el yazması eserler",
        B: "Uzman restoratörler",
        C: "Eski el yazmaları",
        D: "Özenle"
      },
      correctOption: "A",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Yükleme (temizlendi) 'Temizlenen ne / kim?' sorusunu yöneltiniz. Sıfat tamlamasının bölünemeyeceğine dikkat ediniz.",
      detailedSolution: "Temizlenen ne? Sorusunun cevabı sıfat tamlaması olan 'Kütüphanedeki eski el yazması eserler' öbeğidir; sözde öznedir.",
      distractors: {
        B: "'Uzman restoratörler tarafından' örtülü özne/zarf tümlecidir, doğrudan gramatikal özne değildir.",
        C: "Tamlamanın başındaki 'Kütüphanedeki' sıfatı dışarıda bırakılamaz.",
        D: "'Özenle' sözcüğü eylemin yapılış biçimini belirten zarf tümlecidir."
      }
    },
    {
      id: "LGS-TR-T4-03",
      course: "TÜRKÇE",
      sourceTag: "MEB Maarif Modeli",
      outcomeCode: "T.8.4.19 • Cümle Vurgusu",
      difficulty: "UYGULAMA",
      stimulus: "Fiil cümlelerinde vurgu yüklemden hemen önceki ögededir. 'Deniz, dün akşam yarışma sonuçlarını arkadaşlarına heyecanla anlattı.'",
      stem: "Bu cümlenin kuralına göre vurgulanan ögesi aşağıdakilerden hangisidir?",
      options: {
        A: "Özne",
        B: "Nesne",
        C: "Zarf Tümleci",
        D: "Yer Tamlayıcısı"
      },
      correctOption: "C",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Yüklem 'anlattı' fiilidir. Yüklemin hemen solundaki 'heyecanla' sözcüğünün öge türünü bulunuz.",
      detailedSolution: "Yüklemden önceki sözcük 'heyecanla'dır. Eyleme 'Nasıl anlattı?' diye sorulduğunda 'heyecanla' cevabı alınır; bu zarf tümlecidir.",
      distractors: {
        A: "'Deniz' cümlenin başında yer alan öznedir, vurgulanmamıştır.",
        B: "'Yarışma sonuçlarını' belirtili nesnedir ancak yüklemin hemen bitişiğinde değildir.",
        D: "'Arkadaşlarına' yer tamlayıcısıdır ancak araya zarf tümleci girmiştir."
      }
    },
    {
      id: "LGS-TR-T4-04",
      course: "TÜRKÇE",
      sourceTag: "2024 LGS Çıkmış Soru Formatı",
      outcomeCode: "T.8.3.28 • Metin Türleri (Makale, Deneme, Fıkra)",
      difficulty: "LGS_YENI_NESIL",
      stimulus: "Bana göre dostluk, insanın kendi eksikliklerini bir başkasının aynasında sevgiyle tamir edebilme sanatıdır. Dost dediğin, insanın kusurunu örtbas eden değil; o kusurun nasıl onarılacağını kırmadan dökmeden fısıldayandır. Belki yanılıyorumdur ama ömrüm boyunca edindiğim tecrübe bana dostluğun hesap kitap kaldırmayan bir teslimiyet olduğunu öğretti.",
      stem: "Bu parçanın metin türü aşağıdakilerden hangisidir?",
      options: {
        A: "Makale",
        B: "Deneme",
        C: "Biyografi",
        D: "Röportaj"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Yazarın 'Bana göre', 'Belki yanılıyorumdur' gibi ifadelerle kanıtlama kaygısı gütmeden içten bir üslupla yazdığına dikkat edin.",
      detailedSolution: "Yazar kendi kişisel görüşlerini samimi ve serbest bir üslupla, kesin kanıtlara başvurmadan kaleme almıştır. Bu özellikler deneme türünün belirleyicisidir.",
      distractors: {
        A: "Makalede bilimsel nesnellik, istatistiki veri ve kanıtlama zorunluluğu vardır.",
        C: "Biyografi tanınmış bir şahsın yaşam öyküsünü üçüncü ağızdan belgelerle sunar.",
        D: "Röportaj karşılıklı soru-cevap veya yerinde araştırma gerektirir."
      }
    },
    {
      id: "LGS-TR-T4-05",
      course: "TÜRKÇE",
      sourceTag: "2024 LGS Formatı",
      outcomeCode: "T.8.3.16 • Paragrafın Yapısı ve Cümle İlişkileri",
      difficulty: "LGS_YENI_NESIL",
      stimulus: "(I) Şehir hayatının gürültüsü ve koşturmacası, bireylerin kendi iç seslerini duymalarını engellemektedir. (II) Sürekli bir yerlere yetişme telaşı, insanı anın getirdiği estetik güzellikleri fark etmekten alıkoyar. (III) İşte tam bu noktada doğaya kaçış, insanın yıpranan ruhunu dinginleştiren bir sığınak işlevi görür. (IV) Oysa doğada geçirilen bir hafta sonu bile zihinsel yenilenme için eşsiz bir fırsat sunar.",
      stem: "Bu parçadaki numaralanmış cümlelerin hangisinden sonra 'Yeşilin tonları ve kuş sesleri, şehirde yorulan zihne adeta şifa dağıtır.' cümlesi getirilmelidir?",
      options: {
        A: "I",
        B: "II",
        C: "III",
        D: "IV"
      },
      correctOption: "C",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Eklenecek cümledeki 'Yeşilin tonları ve kuş sesleri' ile 'zihne şifa dağıtır' ifadelerinin III. cümledeki 'doğaya kaçış' ve 'sığınak işlevi görür' ile organik bağını yakalayın.",
      detailedSolution: "III. cümlede doğaya kaçışın bir sığınak olduğu belirtildikten sonra doğanın bu şifa verici özellikleri sıralanmalıdır; ardından IV. cümledeki özet fırsat yargısına geçilmelidir.",
      distractors: {
        A: "I. cümleden sonra şehir koşturmacasının olumsuzlukları devam etmektedir.",
        B: "II. cümleden sonra henüz doğa kavramı metne dâhil edilmemiştir.",
        D: "IV. cümle metnin kapanış cümlesidir; araya sokulamaz."
      }
    },
    {
      id: "LGS-TR-T4-06",
      course: "TÜRKÇE",
      sourceTag: "MEB Maarif Temel Kazanım",
      outcomeCode: "T.8.4.20 • Yazım Kuralları ve Büyük Harflerin Kullanımı",
      difficulty: "KAVRAMA",
      stimulus: "Aşağıdaki cümlelerin hangisinde yazım yanlışı yapılmıştır?",
      stem: "Aşağıdaki cümlelerin hangisinde büyük harflerin veya kısaltmaların yazımıyla ilgili bir yanlışlık yapılmıştır?",
      options: {
        A: "Bu yıl LGS sınavı haziran ayının ilk pazar günü yapılacaktır.",
        B: "Toplantı için gelen heyet, Dicle Nehri kıyısındaki tarihî konakta ağırlandı.",
        C: "Türk Dil Kurumu Başkanı, yeni sözlüğün tanıtımında konuştu.",
        D: "Güneydoğu Anadolu'nun güney kesimlerinde sıcaklık rekorları kırıldı."
      },
      correctOption: "A",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Belirli bir tarih (gün/yıl rakamı) bildirmeyen ay ve gün adlarının küçük harfle başlaması kuralını kontrol ediniz. 'haziran' doğru ancak 'LGS sınavı' ifadesindeki anlatım bozukluğundan ziyade 'haziran ayı' belirli bir tarih olmadığı için küçük yazılırken, dikkat edilmesi gereken kuralı inceleyin.",
      detailedSolution: "'LGS' zaten 'Liselere Geçiş Sistemi' kısaltmasıdır; 'LGS sınavı' gereksiz sözcük kullanımı ve 'haziran ayının ilk pazar günü' ifadesinde belirli bir gün sayısı olmadığı için küçük yazım doğrudur ancak A şıkkında kısaltma açılımı ve kural gereği hata barındırır.",
      distractors: {
        B: "'Dicle Nehri' özel ad ve nehir tür adı büyük harfle yazılır, doğrudur.",
        C: "'Türk Dil Kurumu Başkanı' makam bildirdiği için büyük harfle yazılır.",
        D: "'Güneydoğu Anadolu' ve yön bildiren 'güney' sözcüğünün doğru yazımı kurallara uygundur."
      }
    },
    {
      id: "LGS-TR-T4-07",
      course: "TÜRKÇE",
      sourceTag: "LGS Şampiyon Düzeyi",
      outcomeCode: "T.8.3.35 • Üst Düzey Anlam İlişkileri ve Argümantasyon",
      difficulty: "SEKIL_VE_OLIMPIYAT",
      stimulus: "Bir toplumda bilimsel düşüncenin kök salması, salt laboratuvar binalarının inşa edilmesine veya teknik cihazların ithal edilmesine bağlı değildir. Eğer bireyler olaylar arasında sebep-sonuç ilişkisi kurma zahmetine katlanmıyor, sorgulanmamış dogmaları mutlak hakikat sayıyorsa; en gelişmiş mikroskoplar dahi o zihniyetin körlüğüne çare olamaz. Gerçek bilimsel tutum, şüphe duymayı bir erdem saymakla ve dogmalar karşısında aklın bağımsızlığını cesaretle savunma stratejisiyle başlar.",
      stem: "Bu parçanın yazarına göre bilimsel gelişmenin önündeki en fazla engel oluşturan zihniyet aşağıdakilerden hangisidir?",
      options: {
        A: "Yeterli teknolojik altyapı ve finansal kaynağın bulunmaması",
        B: "Eğitim kurumlarında pratik deneylerin az yapılması",
        C: "Zihinsel tembellik ve sorgulamadan kabullenilen peşin yargılar",
        D: "Uluslararası bilimsel yayınların yeterince takip edilmemesi"
      },
      correctOption: "C",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Parçada teknik imkânların yetersizliği değil, 'sebep-sonuç kurmama zahmeti' ve 'sorgulanmamış dogmalar' eleştirilmiştir. Buradan 'zihinsel tembellik ve peşin yargı' sonucuna ulaşın.",
      detailedSolution: "Yazar laboratuvar ve mikroskop gibi fiziksel donanımların düşünce dönüşümü olmadan anlamsız kalacağını; asıl engelin dogmaları mutlak saymak ve sebep-sonuç ilişkisi kurmaktan kaçınmak (zihinsel tembellik) olduğunu vurgular.",
      distractors: {
        A: "Teknolojik altyapı yazarın ikincil gördüğü, asıl çözümün zihniyette yattığını belirttiği unsurdur.",
        B: "Deney sayısından değil, genel eleştirel düşünme tutumundan söz edilmiştir.",
        D: "Uluslararası yayınlar metnin bağlamında hiç geçmemektedir."
      }
    }
  ];

  // 2. MATEMATİK GENİŞLETMELERİ (14 -> 28 Soru, 4 Test Paketi)
  const matT1New = [
    {
      id: "LGS-MAT-T1-05",
      course: "MATEMATİK",
      sourceTag: "LGS Şampiyon Düzeyi",
      outcomeCode: "M.8.1.1.3 • Asal Çarpanlar ve Modüler EBOB",
      difficulty: "SEKIL_VE_OLIMPIYAT",
      stimulus: "Kenar uzunlukları metre cinsinden birer tam sayı olan dikdörtgen biçimindeki bir parkın alanı 360 metrekaredir. Bu parkın etrafına köşelere de dikilmek şartıyla eşit aralıklarla aydınlatma direkleri dikilecektir. Parkın kenar uzunlukları aralarında asaldır.",
      stem: "Buna göre parkın etrafına dikilecek direk sayısı en az kaçtır?",
      options: {
        A: "76",
        B: "82",
        C: "98",
        D: "124"
      },
      correctOption: "C",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: 360'ın aralarında asal çarpan çiftlerini listeleyin: (1, 360), (5, 72), (8, 45), (9, 40). Direk sayısının en az olması için çevrenin en küçük olması gerekir. Çevresi en küçük olan çift (9, 40)'tır. EBOB(9, 40)=1 olduğuna göre aralık 1 m'dir. Çevre = 2*(9+40) = 98 m. Direk = 98 / 1 = 98.",
      detailedSolution: "360 = 2^3 * 3^2 * 5. Aralarında asal kenar çiftleri: (1, 360), (5, 72), (8, 45), (9, 40). En küçük çevre için kenarlar birbirine en yakın seçilir: 9 m ve 40 m. EBOB(9, 40) = 1 m aralık. Çevre = 2 * (9 + 40) = 98 metre. Direk sayısı = Çevre / Aralık = 98 / 1 = 98 direk gerekir.",
      distractors: {
        A: "76 sayısı çarpanların hatalı toplanması sonucudur.",
        B: "82 sayısı (18, 20) çiftinden gelir ancak 18 ile 20 aralarında asal değildir (ortak bölen 2'dir).",
        D: "124 sayısı (8, 45) çiftinin yanlış hesaplanmasıdır."
      }
    }
  ];

  const matT2New = [
    {
      id: "LGS-MAT-T2-05",
      course: "MATEMATİK",
      sourceTag: "MEB Maarif Temel Kazanım",
      outcomeCode: "M.8.2.1.2 • Cebirsel İfadelerde Katsayılar ve Terimler",
      difficulty: "KAVRAMA",
      stimulus: "Verilen cebirsel ifade: 3x² - 5x + 7",
      stem: "Bu cebirsel ifadenin katsayılar toplamı kaçtır?",
      options: {
        A: "3",
        B: "5",
        C: "7",
        D: "15"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Katsayıları işaretleriyle birlikte toplayınız: 3 + (-5) + 7 = 5.",
      detailedSolution: "Katsayılar 3, -5 ve +7'dir. Toplam = 3 - 5 + 7 = 5'tir.",
      distractors: {
        A: "-5 ve +7 toplanıp 3 ihmal edilirse veya işaret hatası yapılırsa bulunur.",
        C: "Sadece sabit terim alınırsa bulunur.",
        D: "Tüm katsayılar mutlak değerce toplanırsa (3+5+7=15) bulunur."
      }
    }
  ];

  const matT3New = [
    {
      id: "LGS-MAT-T3-03",
      course: "MATEMATİK",
      sourceTag: "2024 LGS Formatı",
      outcomeCode: "M.8.1.3.1 • Kareköklü İfadelerin Yaklaşık Değeri",
      difficulty: "KAVRAMA",
      stimulus: "Bir marangoz elindeki çıtayı ölçtüğünde uzunluğunun √75 desimetre olduğunu tespit ediyor.",
      stem: "Buna göre bu çıtanın uzunluğu hangi iki ardışık tam sayı arasındadır?",
      options: {
        A: "6 ile 7",
        B: "7 ile 8",
        C: "8 ile 9",
        D: "9 ile 10"
      },
      correctOption: "C",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: 75 sayısının hangi iki tam kare sayı arasında olduğunu bulunuz: 64 < 75 < 81.",
      detailedSolution: "√64 = 8 ve √81 = 9 olduğundan √75 sayısı 8 ile 9 arasındadır (9'a daha yakındır).",
      distractors: {
        A: "6 ile 7 aralığı √36 ile √49 arasındadır.",
        B: "7 ile 8 aralığı √49 ile √64 arasındadır.",
        D: "9 ile 10 aralığı √81 ile √100 arasındadır."
      }
    },
    {
      id: "LGS-MAT-T3-04",
      course: "MATEMATİK",
      sourceTag: "MEB Örnek Formatı",
      outcomeCode: "M.8.1.3.5 • Kareköklü İfadelerle Çarpma ve Bölme",
      difficulty: "UYGULAMA",
      stimulus: "Bir kenar uzunluğu √48 cm olan karenin alanı ile kısa kenarı √12 cm olan bir dikdörtgenin alanı birbirine eşittir.",
      stem: "Buna göre bu dikdörtgenin uzun kenarı kaç santimetredir?",
      options: {
        A: "4√3",
        B: "8√3",
        C: "12",
        D: "16"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Karenin alanı = (√48)² = 48. Dikdörtgenin alanı = Kısa * Uzun -> 48 = √12 * x. √12 = 2√3. x = 48 / (2√3) = 24 / √3 = 8√3 cm.",
      detailedSolution: "Karenin alanı = (√48)² = 48 cm². Dikdörtgenin alanı = √12 * x = 48. 2√3 * x = 48 -> x = 48 / 2√3 = 24 / √3 = 8√3 cm.",
      distractors: {
        A: "4√3 kısa kenarın iki katıdır.",
        C: "12 köksüz hatalı bölme sonucudur.",
        D: "16 kök üçe bölmeyi unutan işlemdir."
      }
    },
    {
      id: "LGS-MAT-T3-05",
      course: "MATEMATİK",
      sourceTag: "2024 LGS Formatı",
      outcomeCode: "M.8.5.1.5 • Olayların Olasılığı ve Torba Modeli",
      difficulty: "UYGULAMA",
      stimulus: "Bir torbada özdeş 6 kırmızı, 8 mavi ve bir miktar sarı bilye vardır. Bu torbadan rastgele çekilen bir bilyenin sarı olma olasılığı 1/3'tür.",
      stem: "Buna göre torbada kaç adet sarı bilye vardır?",
      options: {
        A: "5",
        B: "7",
        C: "9",
        D: "14"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Sarı bilye sayısı s olsun. Kırmızı + Mavi = 14. Toplam bilye = 14 + s. Olasılık: s / (14 + s) = 1/3 -> 3s = 14 + s -> 2s = 14 -> s = 7.",
      detailedSolution: "Kırmızı + Mavi = 6 + 8 = 14 bilye. Sarı bilye = s. Sarı olma olasılığı = s / (14 + s) = 1/3. 3s = 14 + s => 2s = 14 => s = 7 adet sarı bilye vardır.",
      distractors: {
        A: "5 sayısı 14'ün 1/3'ü sanılarak yapılan yaklaşımdır.",
        C: "9 sayısı toplamı 27 varsayarak yapılan hatadır.",
        D: "14 kırmızı ve mavi bilyelerin toplamıdır."
      }
    },
    {
      id: "LGS-MAT-T3-06",
      course: "MATEMATİK",
      sourceTag: "2024 LGS Çıkmış Soru Formatı",
      outcomeCode: "M.8.2.2.1 • Doğrusal İlişki ve Grafik Analizi",
      difficulty: "LGS_YENI_NESIL",
      stimulus: "Bir su deposunda başlangıçta 120 litre su bulunmaktadır. Deponun altındaki vanadan her saatte sabit 8 litre su akmaktadır.",
      stem: "Buna göre depoda kalan su miktarı (y) ile geçen süre (x, saat) arasındaki doğrusal ilişkinin denklemi aşağıdakilerden hangisidir?",
      options: {
        A: "y = 120 + 8x",
        B: "y = 120 - 8x",
        C: "y = 8x - 120",
        D: "y = 120 / 8x"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Başlangıç değeri sabit terimdir (120). Su boşaldığı için her saatte miktar azalacaktır, bu yüzden eğim negatiftir (-8x).",
      detailedSolution: "Başlangıçta x = 0 iken y = 120'dir. Her saat 8 litre eksildiği için x saat sonra boşalan su 8x'tir. Kalan su y = 120 - 8x olur.",
      distractors: {
        A: "y = 120 + 8x depoya su doldurulduğunda geçerlidir.",
        C: "y = 8x - 120 negatif su miktarı üretir.",
        D: "Ters orantı denklemi değildir, doğrusal ilişkidir."
      }
    },
    {
      id: "LGS-MAT-T3-07",
      course: "MATEMATİK",
      sourceTag: "LGS Şampiyon Düzeyi",
      outcomeCode: "M.8.2.1.4 • Cebirsel Modelleme ve Alan Optimizasyonu",
      difficulty: "SEKIL_VE_OLIMPIYAT",
      stimulus: "Kenar uzunluğu (3x + 4) cm olan kare şeklindeki bir mukavvanın dört köşesinden, kenar uzunluğu (x - 1) cm olan özdeş kareler kesilip atılıyor. Kalan parça katlanarak üstü açık bir kutu oluşturulacaktır.",
      stem: "Buna göre kutunun taban alanını santimetrekare cinsinden veren cebirsel modelleme ifadesi aşağıdakilerden hangisidir?",
      options: {
        A: "(x + 6)²",
        B: "(x + 2)²",
        C: "(2x + 5)²",
        D: "(x + 5)²"
      },
      correctOption: "A",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Bir kenardan iki adet köşe kesilir. Yeni taban kenarı = (3x + 4) - 2*(x - 1) = 3x + 4 - 2x + 2 = x + 6 cm. Taban kare olduğundan alan = (x + 6)².",
      detailedSolution: "Büyük karenin bir kenarı 3x + 4'tür. İki köşeden de (x - 1) uzunluğunda parçalar kesilince tabanın bir kenarı: (3x + 4) - 2(x - 1) = 3x + 4 - 2x + 2 = x + 6 cm olur. Taban alanı kare olduğundan (x + 6)² cm²'dir.",
      distractors: {
        B: "-2 dağıtılırken işaret hatası yapılıp 4 - 2 = 2 bulunursa (x + 2)² çıkar.",
        C: "Sadece tek bir köşe çıkarılırsa (2x + 5) bulunur.",
        D: "Köşedeki 1 ihmal edilirse (x + 5)² yanılgısı oluşur."
      }
    }
  ];

  const matT4Questions = [
    {
      id: "LGS-MAT-T4-01",
      course: "MATEMATİK",
      sourceTag: "MEB Maarif Temel Kazanım",
      outcomeCode: "M.8.1.3.2 • a√b Gösterimi",
      difficulty: "KAVRAMA",
      stimulus: "√108 sayısı a√b şeklinde yazılacaktır.",
      stem: "Buna göre a ve b pozitif tam sayılar olmak üzere a'nın en büyük değeri için b kaçtır?",
      options: {
        A: "2",
        B: "3",
        C: "6",
        D: "12"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: 108 sayısının en büyük tam kare çarpanını bulunuz: 108 = 36 * 3. Buradan a = 6, b = 3 olur.",
      detailedSolution: "108 = 36 * 3 = 6² * 3. √108 = 6√3. a'nın en büyük değeri 6'dır; bu durumda b = 3 olur.",
      distractors: {
        A: "2 çarpanı 108'in kök içi çarpanı olamaz (108 / 4 = 27 = 3√3).",
        C: "6 katsayı a'dır, kök içi b değildir.",
        D: "12 alınırsa a = 3 olur (3√12), ancak soru a'nın en büyük değerini istemektedir."
      }
    },
    {
      id: "LGS-MAT-T4-02",
      course: "MATEMATİK",
      sourceTag: "MEB Maarif Temel Kazanım",
      outcomeCode: "M.8.1.4.1 • Daire Grafiği ve Açı Hesabı",
      difficulty: "UYGULAMA",
      stimulus: "Bir çiftlikteki 720 hayvanın 180'i koyun, 240'ı inek ve geri kalanı keçidir.",
      stem: "Bu hayvanların dağılımı bir daire grafiğinde gösterildiğinde keçileri temsil eden merkez açı kaç derece olur?",
      options: {
        A: "90°",
        B: "120°",
        C: "150°",
        D: "160°"
      },
      correctOption: "C",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Keçi sayısı = 720 - (180 + 240) = 300. Orantı: 720 hayvana 360° düşerse (yarısı kadar derece), 300 keçiye 300 / 2 = 150° düşer.",
      detailedSolution: "Koyun + İnek = 180 + 240 = 420. Keçi sayısı = 720 - 420 = 300. Daire grafiğinde 720 hayvan 360°'ye karşılık gelmektedir (her 2 hayvana 1°). Dolayısıyla 300 keçi 300 / 2 = 150° merkez açıya sahip olur.",
      distractors: {
        A: "90° 180 koyunun merkez açısıdır.",
        B: "120° 240 ineğin merkez açısıdır.",
        D: "160° hatalı toplama ve çıkarma işlemidir."
      }
    },
    {
      id: "LGS-MAT-T4-03",
      course: "MATEMATİK",
      sourceTag: "MEB Örnek Formatı",
      outcomeCode: "M.8.1.3.3 • Kareköklü İfadelerde Toplama ve Çıkarma",
      difficulty: "UYGULAMA",
      stimulus: "Bir kenarı √72 cm olan bir tel bükülerek √18 cm'lik parçası kesilip atılıyor.",
      stem: "Kalan telin uzunluğu kaç santimetredir?",
      options: {
        A: "3√2",
        B: "4√2",
        C: "5√2",
        D: "√54"
      },
      correctOption: "A",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: √72 = 6√2 ve √18 = 3√2 olarak yazınız. Çıkarma işlemi: 6√2 - 3√2 = 3√2 cm.",
      detailedSolution: "√72 = √(36 * 2) = 6√2 cm. √18 = √(9 * 2) = 3√2 cm. Kalan parça = 6√2 - 3√2 = 3√2 cm.",
      distractors: {
        B: "4√2 işlem hatasıdır.",
        C: "5√2 toplama hatasıdır.",
        D: "√54 kök içlerinin birbirinden doğrudan çıkarılması (72 - 18 = 54) şeklindeki klasik kavram yanılgısıdır."
      }
    },
    {
      id: "LGS-MAT-T4-04",
      course: "MATEMATİK",
      sourceTag: "2024 LGS Formatı",
      outcomeCode: "M.8.1.4.2 • Çizgi ve Sütun Grafiği Dönüşümü",
      difficulty: "LGS_YENI_NESIL",
      stimulus: "Bir teknoloji mağazasında haftalık satılan tablet sayıları şöyledir: Pazartesi 20, Salı 35, Çarşamba 25, Perşembe 40, Cuma 60. Satış grafiği dikkatle incelenmektedir.",
      stem: "Buna göre satışların bir önceki güne göre en fazla artış gösterdiği gün hangisidir?",
      options: {
        A: "Salı",
        B: "Çarşamba",
        C: "Perşembe",
        D: "Cuma"
      },
      correctOption: "D",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Günlük artışları hesaplayın: Salı (35 - 20 = +15), Çarşamba (düşüş), Perşembe (40 - 25 = +15), Cuma (60 - 40 = +20). En büyük artış +20 ile Cuma'dır.",
      detailedSolution: "Salı artışı: 35 - 20 = 15. Çarşamba: 25 - 35 = -10 (azalış). Perşembe: 40 - 25 = 15. Cuma: 60 - 40 = 20. En yüksek artış miktarı 20 adet ile Cuma günüdür.",
      distractors: {
        A: "Salı 15 adet artmıştır.",
        B: "Çarşamba günü satış azalmıştır.",
        C: "Perşembe 15 adet artmıştır, Cuma'nın (20) gerisindedir."
      }
    },
    {
      id: "LGS-MAT-T4-05",
      course: "MATEMATİK",
      sourceTag: "2024 LGS Formatı",
      outcomeCode: "M.8.2.1.3 • Özdeşlikler ve İki Kare Farkı",
      difficulty: "LGS_YENI_NESIL",
      stimulus: "Bir mimari projede kenar uzunluğu 2025 metre olan kare şeklindeki bir arazinin tam merkezine, kenar uzunluğu 2023 metre olan kare biçiminde bir su havuzu inşa ediliyor. Arazinin havuz dışında kalan peyzaj yeşil alanı ise çimlendirilecektir.",
      stem: "Buna göre çimlendirilecek yeşil peyzaj alanının metrekare cinsinden değeri (2025² - 2023²) kaçtır?",
      options: {
        A: "4048",
        B: "8096",
        C: "8092",
        D: "16192"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: İki kare farkı özdeşliği: a² - b² = (a - b)(a + b). Burada (2025 - 2023)(2025 + 2023) = 2 * 4048 = 8096.",
      detailedSolution: "a² - b² = (a - b)(a + b). 2025 - 2023 = 2. 2025 + 2023 = 4048. Sonuç = 2 * 4048 = 8096.",
      distractors: {
        A: "4048 sadece toplamdır, fark olan 2 ile çarpmayı unutan yanılgıdır.",
        C: "8092 işlem hatasıdır.",
        D: "16192 gereksiz bir 2 katı almadır."
      }
    },
    {
      id: "LGS-MAT-T4-06",
      course: "MATEMATİK",
      sourceTag: "MEB Maarif Temel Kazanım",
      outcomeCode: "M.8.1.1.2 • Asal Sayılar ve Çarpan Ağacı",
      difficulty: "KAVRAMA",
      stimulus: "A sayısı iki basamaklı en küçük asal sayı, B sayısı ise rakamları farklı iki basamaklı en büyük asal sayıdır.",
      stem: "Buna göre B - A farkı kaçtır?",
      options: {
        A: "86",
        B: "87",
        C: "88",
        D: "89"
      },
      correctOption: "A",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: İki basamaklı en küçük asal sayı A = 11'dir. Rakamları farklı iki basamaklı en büyük asal sayı B = 97'dir. Fark = 97 - 11 = 86.",
      detailedSolution: "İki basamaklı en küçük asal sayı 11'dir (A = 11). İki basamaklı en büyük asal sayı 97'dir ve rakamları (9 ve 7) birbirinden farklıdır (B = 97). Fark = 97 - 11 = 86.",
      distractors: {
        B: "87 sayısı 97 - 10 yanılgısıdır.",
        C: "88 sayısı 99 asal sayı sanıldığında ortaya çıkar.",
        D: "89 asal sayılarla yapılan hatalı çıkarma işlemidir."
      }
    },
    {
      id: "LGS-MAT-T4-07",
      course: "MATEMATİK",
      sourceTag: "LGS Şampiyon Düzeyi",
      outcomeCode: "M.8.2.2.6 • Çok Adımlı Eğim ve Koordinat Optimizasyonu",
      difficulty: "SEKIL_VE_OLIMPIYAT",
      stimulus: "Koordinat düzleminde bir robotik sistemin hareket yörüngesi A(2, 4) ve B(8, 12) noktalarından geçen d doğrusu olarak modellenmiştir. Bu yörüngeye paralel hareket eden ve orijinden (0, 0) geçen d₂ doğrusu üzerinde apsisi 9 olan bir C hedef noktası bulunmaktadır.",
      stem: "Bu geometrik modelleme kısıtına göre C noktasının ordinat değeri kaçtır?",
      options: {
        A: "10",
        B: "12",
        C: "14",
        D: "16"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: d doğrusunun eğimi m = (12 - 4) / (8 - 2) = 8 / 6 = 4/3. Paralel doğruların eğimleri eşittir; d₂ doğrusunun denklemi y = (4/3)x'tir. x = 9 için y = (4/3) * 9 = 12.",
      detailedSolution: "d doğrusunun eğimi: m = (y₂ - y₁) / (x₂ - x₁) = (12 - 4) / (8 - 2) = 8 / 6 = 4/3. Paralel doğruların eğimleri eşit olduğundan d₂ doğrusunun eğimi de 4/3'tür. Orijinden geçtiği için denklemi y = (4/3)x'tir. x = 9 için y = (4/3) * 9 = 12 olur.",
      distractors: {
        A: "10 eğimin 1 alındığı yanılgıdır.",
        C: "14 işlem hatasıdır.",
        D: "16 eğimin ters (3/4 yerine 4/3 yerine başka oran) alınmasıdır."
      }
    }
  ];

  // 3. FEN BİLİMLERİ GENİŞLETMELERİ (13 -> 28 Soru, 4 Test Paketi)
  const fenT1New = [
    {
      id: "LGS-FEN-T1-05",
      course: "FEN BİLİMLERİ",
      sourceTag: "MEB Maarif Temel Kazanım",
      outcomeCode: "F.8.1.2.2 • Hava Olayları ve İklim Farkı",
      difficulty: "KAVRAMA",
      stimulus: "Bir bölgenin 40 yıllık sıcaklık ve yağış ortalamaları incelenerek o bölgede yazların sıcak ve kurak, kışların ılık ve yağışlı geçtiği belirlenmiştir.",
      stem: "Bu çalışma ve ulaşılan sonuç doğrudan hangi bilim dalının alanına girer?",
      options: {
        A: "Meteoroloji",
        B: "Klimatoloji",
        C: "Jeoloji",
        D: "Astronomi"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: 35-40 yıllık uzun süreli atmosferik ortalamaları inceleyen bilim dalının Klimatoloji (iklim bilimi) olduğunu hatırlayınız.",
      detailedSolution: "Geniş bir bölgede uzun yıllar boyunca devam eden hava olaylarının ortalamasını inceleyen bilim dalı Klimatolojidir (İklim bilimi). Meteoroloji ise anlık ve dar alanlı hava tahminleriyle ilgilenir.",
      distractors: {
        A: "Meteoroloji günlük ve anlık hava tahminlerini yapar.",
        C: "Jeoloji yer kabuğunun yapısını ve kayaçları inceler.",
        D: "Astronomi gök cisimlerini ve uzayı inceler."
      }
    },
    {
      id: "LGS-FEN-T1-06",
      course: "FEN BİLİMLERİ",
      sourceTag: "LGS Şampiyon Düzeyi",
      outcomeCode: "F.8.1.1.2 • Eksen Eğikliği ve Gölge Boyu Optimizasyonu",
      difficulty: "SEKIL_VE_OLIMPIYAT",
      stimulus: "Yengeç Dönencesi üzerinde dik konumlandırılmış özdeş bir cismin öğle vaktindeki (12.00) gölge boyu yıl boyunca hassas cihazlarla ölçülmüştür. 21 Haziran tarihinde cismin gölge boyunun sıfır olduğu gözlenmiştir.",
      stem: "Buna göre aynı cismin gölge boyunun yıl içindeki en fazla uzunluk değerine ulaştığı tarih aşağıdakilerden hangisidir?",
      options: {
        A: "21 Mart",
        B: "23 Eylül",
        C: "21 Aralık",
        D: "4 Ocak"
      },
      correctOption: "C",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Gölge boyu Güneş ışınlarının geliş açısıyla ters orantılıdır. Işık ne kadar eğik gelirse gölge o kadar uzun olur. Kuzey Yarım Küre'deki Yengeç Dönencesi'ne Güneş ışınlarının en eğik açıyla geldiği kış gündönümü tarihi 21 Aralık'tır.",
      detailedSolution: "Yengeç Dönencesi Kuzey Yarım Küre'dedir. 21 Haziran'da dik açı (90°) ile geldiği için gölge sıfırdır. En eğik açıyla geldiği tarih ise kış başlangıcı olan 21 Aralık'tır; dolayısıyla gölge boyu en uzun 21 Aralık'ta olur.",
      distractors: {
        A: "21 Mart ekinoksunda ışınlar dönenceye 66.5° açıyla gelir, en eğik değildir.",
        B: "23 Eylül de ekinokstur, gölge en uzun olmaz.",
        D: "4 Ocak günberi (Güneş'e en yakın) tarihidir ancak mevsimsel açıya etkisi yok denecek kadar azdır."
      }
    }
  ];

  const fenT2New = [
    {
      id: "LGS-FEN-T2-05",
      course: "FEN BİLİMLERİ",
      sourceTag: "LGS Şampiyon Düzeyi",
      outcomeCode: "F.8.3.1.2 • U Borusu Sıvı Basıncı ve Yoğunluk Optimizasyonu",
      difficulty: "SEKIL_VE_OLIMPIYAT",
      stimulus: "Birbirine karışmayan d₁ ve d₂ yoğunluklu sıvılar özdeş kollara sahip bir U borusu düzeneğinde dengelenmiştir. U borusunun sol kolundaki d₁ sıvısının yüksekliği 15 cm, sağ kolundaki d₂ sıvısının denge çizgisi üzerindeki yüksekliği ise 10 cm olarak ölçülmüştür.",
      stem: "Bu denge modellemesine göre sıvıların yoğunlukları oranı (d₁ / d₂) en fazla kaçtır?",
      options: {
        A: "2/3",
        B: "3/2",
        C: "1/2",
        D: "4/5"
      },
      correctOption: "A",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Denge seviyesindeki sıvı basınçları eşittir: P₁ = P₂ -> h₁ * d₁ * g = h₂ * d₂ * g -> 15 * d₁ = 10 * d₂ -> d₁ / d₂ = 10 / 15 = 2/3.",
      detailedSolution: "Tabandaki denge çizgisinde basınçlar eşittir. h₁ * d₁ = h₂ * d₂ bağıntısından 15 * d₁ = 10 * d₂ yazılır. Buradan d₁ / d₂ = 10 / 15 = 2/3 bulunur.",
      distractors: {
        B: "3/2 ters oran hatasıdır (d₂ / d₁).",
        C: "1/2 yüksekliklerin yarı yarıya sanılmasıdır.",
        D: "4/5 işlem hatasıdır."
      }
    }
  ];

  const fenT3New = [
    {
      id: "LGS-FEN-T3-03",
      course: "FEN BİLİMLERİ",
      sourceTag: "MEB Maarif Temel Kazanım",
      outcomeCode: "F.8.2.1.3 • Nükleotid Eşleşmesi ve DNA Kuralları",
      difficulty: "KAVRAMA",
      stimulus: "Sağlıklı bir DNA molekülünün tek zincirinde 400 Adenin, 600 Guanin, 300 Sitozin ve 500 Timin nükleotidi bulunmaktadır.",
      stem: "Bu DNA molekülünün çift zincirindeki toplam nükleotid sayısı kaçtır?",
      options: {
        A: "1800",
        B: "2400",
        C: "3600",
        D: "7200"
      },
      correctOption: "C",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: 1. zincirdeki nükleotidleri toplayın: 400 + 600 + 300 + 500 = 1800. Çift zincir olduğu için toplam = 1800 * 2 = 3600 nükleotid.",
      detailedSolution: "Birinci zincirdeki toplam nükleotid sayısı = 400 + 600 + 300 + 500 = 1800'dür. DNA çift zincirli olduğundan karşı zincirde de tam 1800 nükleotid yer alır. Toplam = 1800 + 1800 = 3600 nükleotiddir.",
      distractors: {
        A: "1800 sadece tek zincirdeki nükleotid sayısıdır, çift zinciri ihmal eden yanılgıdır.",
        B: "2400 Guanin ve Sitozin odaklı yanlış hesaplamadır.",
        D: "7200 gereksiz bir kez daha 2 ile çarpmadır."
      }
    },
    {
      id: "LGS-FEN-T3-04",
      course: "FEN BİLİMLERİ",
      sourceTag: "2024 LGS Formatı",
      outcomeCode: "F.8.2.2.2 • Akraba Evliliği ve Genetik Hastalıklar",
      difficulty: "UYGULAMA",
      stimulus: "Otozomal çekinik (a) genle taşınan bir hastalığın taşıyıcısı olan (Aa) iki birey evlenmiştir.",
      stem: "Kalıtım kurallarına göre bu çiftin doğacak ilk çocuklarının bu hastalığı fenotipinde gösterme (hasta olma) oranı yüzde kaçtır?",
      options: {
        A: "%25",
        B: "%50",
        C: "%75",
        D: "%100"
      },
      correctOption: "A",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Çaprazlama yapınız: Aa x Aa -> AA (%25), Aa (%50), aa (%25). Hasta birey çekinik homozigot (aa) genotiplidir, yani %25 olasılıktır.",
      detailedSolution: "Taşıyıcı ebeveynler: Aa x Aa. Çaprazlama sonucu: AA, Aa, Aa, aa. Hasta birey homozigot çekinik 'aa' olan bireydir. Olasılık 1/4 yani %25'tir.",
      distractors: {
        B: "%50 taşıyıcı (Aa) olma olasılığıdır.",
        C: "%75 sağlıklı görünme (AA + Aa) fenotip olasılığıdır.",
        D: "%100 ebeveynlerden birinin homozigot hasta sanılmasıdır."
      }
    },
    {
      id: "LGS-FEN-T3-05",
      course: "FEN BİLİMLERİ",
      sourceTag: "MEB Örnek Formatı",
      outcomeCode: "F.8.3.1.1 • Katı Basıncı ve Yüzey Alanı İlişkisi",
      difficulty: "UYGULAMA",
      stimulus: "Özdeş tuğlalar kullanılarak yapılan bir deneyde, tuğla önce geniş yüzeyi üzerine, ardından dar yüzeyi üzerine süngere bırakılmıştır.",
      stem: "Katı basıncı kuralları uygulandığında tuğla dar yüzeyi üzerine konulduğunda süngerdeki batma miktarının artmasının temel sebebi aşağıdakilerden hangisidir?",
      options: {
        A: "Tuğlanın ağırlığının artması",
        B: "Tuğlanın yerçekimi ivmesinin artması",
        C: "Temas yüzey alanı azaldığı için katı basıncının artması",
        D: "Süngerin esneklik katsayısının değişmesi"
      },
      correctOption: "C",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Katı basıncı formülü P = G / S'dir. Tuğlanın ağırlığı (G) değişmemiştir; yüzey alanı (S) azaldığı için basınç (P) artmıştır.",
      detailedSolution: "Katı basıncı ağırlıkla doğru, temas yüzey alanıyla ters orantılıdır. Tuğla dik çevrildiğinde ağırlığı sabit kalır fakat temas yüzey alanı küçülür; bu da zemine uygulanan basıncı artırarak batma miktarını yükseltir.",
      distractors: {
        A: "Aynı tuğla kullanıldığı için ağırlık kesinlikle değişmemiştir.",
        B: "Yerçekimi ivmesi aynı laboratuvarda sabittir.",
        D: "Süngerin malzeme özelliği değişmez, değişen uygulanan kuvvettir/basınçtır."
      }
    },
    {
      id: "LGS-FEN-T3-06",
      course: "FEN BİLİMLERİ",
      sourceTag: "2024 LGS Formatı",
      outcomeCode: "F.8.4.2.1 • Fiziksel ve Kimyasal Değişimlerin Ayırt Edilmesi",
      difficulty: "LGS_YENI_NESIL",
      stimulus: "Öğrenciler fen laboratuvarında 4 farklı deney gerçekleştirmiştir:\n1. Mumun erimesi\n2. Demirin paslanması\n3. Suyun kaynaması\n4. Sütten yoğurt mayalanması",
      stem: "Bu deneylerden hangilerinde maddenin kimlik özelliği değişmiş, yani kimyasal değişim gerçekleşmiştir?",
      options: {
        A: "1 ve 3",
        B: "2 ve 4",
        C: "1, 2 ve 4",
        D: "Yalnızca 2"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Hal değişimleri (erime, kaynama) fizikseldir. Paslanma (oksitlenme) ve mayalanma ise yeni maddeler oluşturan kimyasal değişimlerdir.",
      detailedSolution: "1 (mumun erimesi) ve 3 (suyun kaynaması) fiziksel hal değişimleridir. 2 (demirin paslanması) kimyasal yanma/oksitlenmedir; 4 (yoğurt mayalanması) bakteriyel kimyasal dönüşümdür. Dolayısıyla 2 ve 4 kimyasaldır.",
      distractors: {
        A: "1 ve 3 fiziksel değişim örnekleridir.",
        C: "1 erime olduğu için fizikseldir, kimyasal listesine dâhil edilemez.",
        D: "Yoğurt mayalanması da kimyasal olduğundan yalnızca 2 eksik kalır."
      }
    },
    {
      id: "LGS-FEN-T3-07",
      course: "FEN BİLİMLERİ",
      sourceTag: "LGS Şampiyon Düzeyi",
      outcomeCode: "F.8.5.1.2 • Makaralar ve Kuvvet Kazancı Optimizasyonu",
      difficulty: "SEKIL_VE_OLIMPIYAT",
      stimulus: "Sürtünmelerin ve makara ağırlıklarının ihmal edildiği özdeş makaralardan oluşan bir palanga sisteminde, 240 N ağırlığındaki bir yük, tavana bağlı 2 sabit ve yüke bağlı 2 hareketli makara kullanılarak dengelenmiştir. İpi çeken kuvvet yukarı yönlüdür.",
      stem: "Buna göre yükü dengede tutmak için uygulanması gereken minimum F kuvveti kaç Newton'dur?",
      options: {
        A: "48 N",
        B: "60 N",
        C: "80 N",
        D: "120 N"
      },
      correctOption: "A",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Yükü taşıyan ip sayısını belirleyin. 2 hareketli makara vardır ve ip çekiş yönü yukarı doğru olduğundan yükü taşıyan ip kolu sayısı n = 2 * 2 + 1 = 5'tir. F = G / n = 240 / 5 = 48 N.",
      detailedSolution: "Palangada 2 hareketli makara varken ve çekilen son ip yukarı yönlü olduğunda, son ip de yükü yukarı çeker. Toplam taşıyıcı ip sayısı 5 olur. F = G / 5 = 240 / 5 = 48 N.",
      distractors: {
        B: "60 N ip aşağı doğru çekildiğinde (n = 4) bulunan değerdir.",
        C: "80 N 3 ipli sistem sonucudur.",
        D: "120 N sadece tek bir hareketli makara varsayıldığında bulunur."
      }
    }
  ];

  const fenT4Questions = [
    {
      id: "LGS-FEN-T4-01",
      course: "FEN BİLİMLERİ",
      sourceTag: "MEB Maarif Temel Kazanım",
      outcomeCode: "F.8.4.4.1 • Asitler ve Bazların Genel Özellikleri",
      difficulty: "KAVRAMA",
      stimulus: "Bir çözeltiye mavi turnusol kâğıdı batırıldığında kâğıdın rengi kırmızıya dönmektedir. Çözeltinin tadı ekşidir ve sulu çözeltisinde H+ iyonu verir.",
      stem: "Bu çözelti aşağıdakilerden hangisi olabilir?",
      options: {
        A: "Sabunlu su",
        B: "Limon suyu",
        C: "Çamaşır suyu",
        D: "Diş macunu"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Mavi turnusolu kırmızıya çeviren, tadı ekşi olan ve H+ iyonu veren maddeler asitlerdir. Şıklardaki tek asit limon suyudur (sitrik asit).",
      detailedSolution: "Mavi turnusolü kırmızıya çeviren çözeltiler asitlerdir. Limon suyu pH < 7 olan asidik bir çözeltidir. Sabunlu su, çamaşır suyu ve diş macunu baziktir.",
      distractors: {
        A: "Sabunlu su baziktir, turnusolu maviye çevirir.",
        C: "Çamaşır suyu bazik özellik gösterir.",
        D: "Diş macunu bazik özelliktedir."
      }
    },
    {
      id: "LGS-FEN-T4-02",
      course: "FEN BİLİMLERİ",
      sourceTag: "MEB Maarif Temel Kazanım",
      outcomeCode: "F.8.4.4.2 • pH Cetveli ve Nötrleşme",
      difficulty: "UYGULAMA",
      stimulus: "Oda koşullarında bulunan 4 farklı sıvının pH ölçüm değerleri şöyledir:\nK sıvısı: pH = 2\nL sıvısı: pH = 7\nM sıvısı: pH = 9\nN sıvısı: pH = 13",
      stem: "Asitlik ve bazlık kuralları uygulandığında bu sıvıların pH değerleri ile ilgili aşağıdaki ifadelerden hangisi doğrudur?",
      options: {
        A: "K sıvısı zayıf bazik özellik gösterir.",
        B: "L sıvısı nötrdür; saf su örnektir.",
        C: "M sıvısının asitliği K sıvısından fazladır.",
        D: "N sıvısı metallerle tepkimeye girip hidrojen gazı açığa çıkarır."
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: pH = 7 nötrdür. pH < 7 asit, pH > 7 bazdır. L sıvısı pH = 7 ile nötrdür.",
      detailedSolution: "pH cetvelinde 7 değeri nötr noktadır ve saf su buna örnektir. K asittir (pH 2), M zayıf bazdır (pH 9), N kuvvetli bazdır (pH 13).",
      distractors: {
        A: "K sıvısı pH 2 ile kuvvetli asittir.",
        C: "M sıvısı bazdır, asitliği yoktur.",
        D: "Genel olarak asitler metallerle tepkimeye girip H₂ gazı çıkarır, kuvvetli bazlar sadece amfoter metallerle tepkime verir."
      }
    },
    {
      id: "LGS-FEN-T4-03",
      course: "FEN BİLİMLERİ",
      sourceTag: "MEB Örnek Formatı",
      outcomeCode: "F.8.4.3.2 • Periyodik Tabloda Grup ve Periyot Özellikleri",
      difficulty: "UYGULAMA",
      stimulus: "Nötr haldeki X atomunun katman elektron dağılımı 2 - 8 - 7 şeklindedir.",
      stem: "Buna göre periyodik tablo kuralları uygulandığında X elementi hangi grupta yer alır ve hangi sınıfa aittir?",
      options: {
        A: "2. periyot 7A grubu - Ametal",
        B: "3. periyot 7A grubu - Ametal",
        C: "3. periyot 2A grubu - Metal",
        D: "7. periyot 3A grubu - Yarı metal"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Katman sayısı periyot numarasını verir (3 katman -> 3. periyot). Son katmandaki elektron sayısı grup numarasını verir (7 elektron -> 7A grubu). 7A grubu ametaldir (halojendir).",
      detailedSolution: "3 adet katmanı olduğu için 3. periyotta yer alır. Son katmanında 7 elektron bulunduğu için 7A grubundadır (klor elementi). 7A grubu elementleri ametaldir.",
      distractors: {
        A: "2. periyot değil, 3 katman olduğu için 3. periyottur.",
        C: "2A değil, son katmanda 7 elektron olduğu için 7A'dır.",
        D: "Katman ve değerlik elektronları ters çevrilmemelidir."
      }
    },
    {
      id: "LGS-FEN-T4-04",
      course: "FEN BİLİMLERİ",
      sourceTag: "2024 LGS Formatı",
      outcomeCode: "F.8.5.1.3 • Eğik Düzlemde Kuvvet Kazancı",
      difficulty: "LGS_YENI_NESIL",
      stimulus: "Aynı yüksekliğe (h = 2 m) sahip iki farklı rampadan birincisinin uzunluğu L₁ = 6 metre, ikincisinin uzunluğu L₂ = 10 metredir. Özdeş yükler sürtünmesiz bu rampalar üzerinden yukarı çıkarılmaktadır.",
      stem: "Bu düzeneklerle ilgili aşağıdaki yargılardan hangisi doğrudur?",
      options: {
        A: "İkinci rampada uygulanan kuvvet daha büyüktür.",
        B: "İkinci rampada yapılan iş daha fazladır.",
        C: "İkinci rampanın kuvvet kazancı birinci rampadan fazladır.",
        D: "Birinci rampada yoldan kazanç sağlanmıştır."
      },
      correctOption: "C",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Eğik düzlemde kuvvet kazancı = Yol / Yükseklik (L / h). L arttıkça kuvvet kazancı artar (kuvvet küçülür). Basit makinelerde işten kazanç olmaz.",
      detailedSolution: "Kuvvet kazancı L / h oranıdır. Rampanın boyu (L) arttıkça kuvvet kazancı artar (daha küçük kuvvetle çekilir). İkinci rampa 10/2 = 5 kat kazanç sağlarken birinci rampa 6/2 = 3 kat kazanç sağlar. Dolayısıyla C doğrudur.",
      distractors: {
        A: "İkinci rampada rampa boyu uzun olduğu için kuvvet daha küçüktür.",
        B: "Sürtünmesiz ortamda aynı yüksekliğe çıkarılan özdeş yüklerde yapılan işler birbirine eşittir (işten kazanç olmaz).",
        D: "Eğik düzlemde hiçbir zaman yoldan kazanç olmaz; yoldan kayıp, kuvvetten kazanç vardır."
      }
    },
    {
      id: "LGS-FEN-T4-05",
      course: "FEN BİLİMLERİ",
      sourceTag: "2024 LGS Formatı",
      outcomeCode: "F.8.4.1.2 • Kimyasal Tepkimelerde Kütlenin Korunumu",
      difficulty: "LGS_YENI_NESIL",
      stimulus: "Kapalı bir kapta gerçekleşen kimyasal tepkimenin denklemi: A + B -> C + D şeklindedir.\nBaşlangıçta 40 gram A ve bir miktar B maddesi tepkimeye girmiş; tepkime sonunda A tamamen tükenirken 28 gram C ve 32 gram D maddesi oluşmuştur.",
      stem: "Buna göre tepkimeye giren B maddesi kaç gramdır?",
      options: {
        A: "10",
        B: "20",
        C: "30",
        D: "60"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Kapalı kapta kütle korunur: Girenlerin toplam kütlesi = Ürünlerin toplam kütlesi. 40 + B = 28 + 32 -> 40 + B = 60 -> B = 20 gram.",
      detailedSolution: "Kütlenin korunumu kanununa göre tepkimeye girenlerin kütleleri toplamı ürünlerin kütleleri toplamına eşittir. Ürünler = 28 + 32 = 60 gram. Girenler = 40 + B = 60 gram. Buradan B = 60 - 40 = 20 gram bulunur.",
      distractors: {
        A: "10 gram işlem hatasıdır.",
        C: "30 gram 60'ın yarısıdır.",
        D: "60 gram ürünlerin toplam kütlesidir."
      }
    },
    {
      id: "LGS-FEN-T4-06",
      course: "FEN BİLİMLERİ",
      sourceTag: "MEB Maarif Temel Kazanım",
      outcomeCode: "F.8.5.1.4 • Çıkrık ve Dişli Çark Sistemleri",
      difficulty: "KAVRAMA",
      stimulus: "Eski tip su kuyularında kullanılan çıkrık düzeneğinde, dönme kolunun uzunluğu (R) silindirin yarıçapından (r) daima büyüktür.",
      stem: "Çıkrık sistemiyle ilgili aşağıdaki ifadelerden hangisi daima doğrudur?",
      options: {
        A: "İşten kazanç sağlar.",
        B: "Kuvvetten kazanç sağlar.",
        C: "Yoldan kazanç sağlar.",
        D: "Enerjiden kazanç sağlar."
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Kuvvet kolu (R) yük kolundan (r) büyük olduğu için çıkrık daima kuvvetten kazanç sağlar. Hiçbir basit makine işten veya enerjiden kazanç sağlayamaz.",
      detailedSolution: "Çıkrıkta R > r olduğundan kuvvet kazancı R / r > 1'dir. Bu daima kuvvetten kazanç sağlandığı anlamına gelir. Basit makinelerde iş ve enerji kazancı kesinlikle olamaz.",
      distractors: {
        A: "Hiçbir basit makine işten kazanç sağlamaz.",
        C: "Kuvvetten kazanç olan yerde yoldan kayıp vardır.",
        D: "Enerjiden kazanç sağlamak fiziğin temel yasalarına aykırıdır."
      }
    },
    {
      id: "LGS-FEN-T4-07",
      course: "FEN BİLİMLERİ",
      sourceTag: "LGS Şampiyon Düzeyi",
      outcomeCode: "F.8.6.1.2 • Besin Zincirinde Enerji Piramidi ve Biyolojik Birikim",
      difficulty: "SEKIL_VE_OLIMPIYAT",
      stimulus: "Bir ekosistemde yer alan besin piramidi şöyledir:\nFitoplankton -> Zooplankton -> Küçük Balık -> Büyük Balık -> Balık Kartalı",
      stem: "Bu besin piramidinde üreticiden son tüketiciye doğru gidildikçe meydana gelen değişimlerle ilgili aşağıdaki yargılardan hangisi kesinlikle doğrudur?",
      options: {
        A: "Aktarılan enerji miktarı her basamakta artar.",
        B: "Birey sayısı her basamakta katlanarak çoğalır.",
        C: "Vücut dokularında biriken zehirli madde (biyolojik birikim) miktarı en fazla balık kartalında olur.",
        D: "Biyokütle üreticiden tüketiciye doğru genişler."
      },
      correctOption: "C",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Besin zincirinde yukarı çıkıldıkça: Enerji azalır (%10 kuralı), birey sayısı azalır, biyokütle azalır; ancak dokularda atılamayan zehirli madde birikimi (biyolojik birikim) piramidin zirvesinde en yüksek düzeye ulaşır.",
      detailedSolution: "Zehirli kimyasallar vücuttan atılamadığı için besin zincirinin en üst basamağındaki canlıda (balık kartalı) en yüksek derişime (biyolojik birikim) ulaşır. Enerji, biyokütle ve birey sayısı ise yukarı çıkıldıkça azalır.",
      distractors: {
        A: "Aktarılan enerji %10 yasası gereği her basamakta %90 oranında azalır.",
        B: "Birey sayısı piramidin tabanında en fazladır, yukarı çıkıldıkça azalır.",
        D: "Biyokütle tabanda (üreticilerde) en geniştir, yukarı doğru daralır."
      }
    }
  ];

  // 4. T.C. İNKILAP TARİHİ GENİŞLETMELERİ (12 -> 24 Soru, 4 Test Paketi)
  const sosT1New = [
    {
      id: "LGS-SOS-T1-05",
      course: "T.C. İNKILAP TARİHİ",
      sourceTag: "MEB Maarif Temel Kazanım",
      outcomeCode: "İTA.8.1.2 • Mustafa Kemal'in Öğrenim Hayatı",
      difficulty: "KAVRAMA",
      stimulus: "Mustafa Kemal, Selanik Mülkiye Rüştiyesinde okurken komşusu olan Binbaşı Kadri Bey'in asker oğlunun üniformasından etkilenmiş ve gizlice Selanik Askerî Rüştiyesinin sınavlarına girerek başarılı olmuştur.",
      stem: "Mustafa Kemal'in bu davranışı onun hangi kişisel özelliğini doğrudan yansıtır?",
      options: {
        A: "Kararlılık ve idealistlik",
        B: "İnkılapçılık",
        C: "Birleştiricilik",
        D: "Yöneticilik"
      },
      correctOption: "A",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Annesinin karşı çıkmasına rağmen hedefinden vazgeçmeyip kendi isteğiyle gizlice sınava girmesi kararlılık ve askerlik idealini gösterir.",
      detailedSolution: "Mustafa Kemal'in hayalindeki meslek olan askerliğe ulaşmak için engellere rağmen kararlı adımlar atması ve gizlice sınava girerek amacına ulaşması onun kararlı ve idealist yapısının göstergesidir.",
      distractors: {
        B: "İnkılapçılık köklü reform ve yenilik yapma yeteneğidir.",
        C: "Birleştiricilik dağınık güçleri ortak gaye etrafında toplama yeteneğidir.",
        D: "Yöneticilik idari ve sevk kabiliyetidir."
      }
    },
    {
      id: "LGS-SOS-T1-06",
      course: "T.C. İNKILAP TARİHİ",
      sourceTag: "LGS Şampiyon Düzeyi",
      outcomeCode: "İTA.8.2.3 • Havza ve Amasya Genelgesi Analizi",
      difficulty: "SEKIL_VE_OLIMPIYAT",
      stimulus: "Amasya Genelgesi'nde yer alan 'Milletin bağımsızlığını yine milletin azim ve kararı kurtaracaktır.' maddesi, Millî Mücadele'nin en temel kurtuluş stratejisi olmuştur.",
      stem: "Bu maddeyle ilgili aşağıdaki çıkarımlardan hangisi hem Millî Mücadele'nin yöntemini hem de ileride kurulacak yeni devletin rejim stratejisini işaret eden en kapsamlı yargıdır?",
      options: {
        A: "Yalnızca düzenli ordu kurulması gerektiğini belirtmiştir.",
        B: "Manda ve himaye fikrinin ilk kez resmen reddedildiğini gösterir.",
        C: "Millet egemenliğine dayalı cumhuriyet rejiminin ilk sinyalini vermiş ve kurtuluşun millete dayanacağını belirtmiştir.",
        D: "İstanbul Hükûmeti'nin otoritesini tamamen pekiştirmiştir."
      },
      correctOption: "C",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: 'Milletin azim ve kararı' ifadesindeki 'milletin kararı' ilerde halk iradesi ve cumhuriyete işaret eder; 'kurtaracaktır' ise yöntemi açıklar.",
      detailedSolution: "Bu tarihi madde Millî Mücadele'nin gerekçe ve amacının yanı sıra yöntemini (milletin azmi) belirlemiş; 'milletin kararı' vurgusuyla da egemenliğin şahıstan alınıp millete verileceğini (Cumhuriyet) haber vermiştir.",
      distractors: {
        A: "Düzenli ordu maddesi değildir, genel ilke kararıdır.",
        B: "Manda ve himaye ilk kez Erzurum Kongresi'nde reddedilmiştir.",
        D: "İstanbul Hükûmeti'ni pekiştirmemiş, aksine onun görevini yapamadığını ilan etmiştir."
      }
    }
  ];

  const sosT2New = [
    {
      id: "LGS-SOS-T2-05",
      course: "T.C. İNKILAP TARİHİ",
      sourceTag: "MEB Maarif Temel Kazanım",
      outcomeCode: "İTA.8.3.2 • Birinci İnönü Zaferi ve Sonuçları",
      difficulty: "UYGULAMA",
      stimulus: "I. İnönü Zaferi'nin ardından İtilaf Devletleri Londra Konferansı'nı toplamış; Sovyet Rusya ile Moskova Antlaşması, Afganistan ile Dostluk Antlaşması imzalanmıştır.",
      stem: "Tarihsel sıralanış ve diplomasi kuralları uygulandığında bu gelişmeler aşağıdaki yargılardan hangisini doğrudan kanıtlar?",
      options: {
        A: "Askerî zaferlerin diplomatik ve siyasi başarıları beraberinde getirdiğini",
        B: "Millî Mücadele'nin askerî safhasının tamamen sona erdiğini",
        C: "İtilaf Devletleri arasındaki tüm görüş ayrılıklarının bittiğini",
        D: "Kurtuluş Savaşı'nın tek cephede cereyan ettiğini"
      },
      correctOption: "A",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Muharebe meydanındaki askerî zafer (I. İnönü), uluslararası alanda diplomatik anlaşmaları ve tanınmayı (Londra, Moskova, Afganistan) doğurmuştur.",
      detailedSolution: "Düzenli ordunun I. İnönü Zaferi, TBMM'nin saygınlığını artırmış; İtilaf Devletleri ve diğer ülkeler TBMM ile antlaşmalar imzalamak zorunda kalmıştır. Askerî başarı siyasi başarıyı getirmiştir.",
      distractors: {
        B: "Askerî safha Sakarya ve Başkomutanlık Meydan Muharebesi'yle devam etmiştir, bitmemiştir.",
        C: "Görüş ayrılıkları bitmemiş, aksine İtilaf bloğu çatlamaya başlamıştır.",
        D: "Savaş Doğu, Güney ve Batı olmak üzere üç ana cephede sürmüştür."
      }
    },
    {
      id: "LGS-SOS-T2-06",
      course: "T.C. İNKILAP TARİHİ",
      sourceTag: "LGS Şampiyon Düzeyi",
      outcomeCode: "İTA.8.3.6 • Başkomutanlık Kanunu ve Meclis İradesi",
      difficulty: "SEKIL_VE_OLIMPIYAT",
      stimulus: "Kütahya-Eskişehir Savaşları'nın ardından TBMM, 5 Ağustos 1921'de Mustafa Kemal Paşa'ya meclisin tüm yetkilerini üç ay süreyle devreden olağanüstü Başkomutanlık Kanunu'nu kabul etmiştir. Bu stratejik kararda meclis yetkiyi istediğinde geri alma hakkını saklı tutmuştur.",
      stem: "Mustafa Kemal Paşa'ya bu yetkilerin üçer aylık sürelerle devredilmesi meclisin en çok hangi ilkeyi koruma stratejisini benimsediğini kanıtlar?",
      options: {
        A: "Kişisel diktatörlük özlemlerinin",
        B: "TBMM'nin üstünlüğü ve millî irade ilkesinin",
        C: "Saltanat makamının meşruiyetinin",
        D: "İtilaf Devletleri ile olan ateşkes şartlarının"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Yetkinin süreli verilmesi ve meclisin denetim hakkını elinde tutması, nihai iradenin halkın temsilcisi olan TBMM'de olduğunu kanıtlar.",
      detailedSolution: "Meclisin yetkiyi süresiz değil üçer aylık periyotlarla devretmesi ve uzatma kararını oylaması, olağanüstü harp şartlarında dahi millî iradenin ve parlamenter üstünlüğün tavizsiz korunduğunun göstergesidir.",
      distractors: {
        A: "Süreli yetki tam tersine kişisel otoriterleşmeyi engellemek için konulmuştur.",
        C: "TBMM saltanatın meşruiyetini değil, ulusal egemenliği savunmaktadır.",
        D: "İtilaf Devletleri ile o tarihte henüz ateşkes yapılmamıştır."
      }
    }
  ];

  const sosT3New = [
    {
      id: "LGS-SOS-T3-05",
      course: "T.C. İNKILAP TARİHİ",
      sourceTag: "MEB Maarif Temel Kazanım",
      outcomeCode: "İTA.8.2.8 • Mudanya Ateşkes Antlaşması'nın Önemi",
      difficulty: "UYGULAMA",
      stimulus: "Mudanya Ateşkes Antlaşması'nın kuralları gereğince Doğu Trakya, İstanbul ve Boğazlar savaş yapılmadan diplomatik yolla TBMM idaresine devredilmiştir. Antlaşmada İstanbul Hükûmeti tamamen yok sayılmıştır.",
      stem: "Uluslararası antlaşma kuralları uygulandığında bu durum Osmanlı Devleti açısından aşağıdaki hukuki sonuçlardan hangisini doğurmuştur?",
      options: {
        A: "Osmanlı Devleti'nin resmen sona ermesi",
        B: "Osmanlı Devleti'nin hukuken sona ermesi",
        C: "Osmanlı Devleti'nin fiilen sona ermesi",
        D: "Osmanlı Devleti'nin cumhuriyete dönüşmesi"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Osmanlı Devleti Mondros'la fiilen, Mudanya'da başkenti TBMM'ye bırakılarak hukuken, Saltanatın kaldırılmasıyla resmen sona ermiştir.",
      detailedSolution: "Mudanya'da İtilaf Devletlerinin İstanbul'u TBMM yönetimine bırakması ve İstanbul Hükûmeti'ni masaya dahi çağırmaması Osmanlı'nın hukuken sona erdiğinin kanıtıdır.",
      distractors: {
        A: "Resmen sona eriş 1 Kasım 1922'de Saltanatın kaldırılmasıyladır.",
        C: "Fiilen sona eriş Mondros Ateşkesi iledir.",
        D: "Osmanlı cumhuriyete dönüşmemiş, yerine yeni Türk devleti kurulmuştur."
      }
    },
    {
      id: "LGS-SOS-T3-06",
      course: "T.C. İNKILAP TARİHİ",
      sourceTag: "LGS Şampiyon Düzeyi",
      outcomeCode: "İTA.8.2.8 • Lozan'da Kapitülasyonlar ve İktisadi Bağımsızlık",
      difficulty: "SEKIL_VE_OLIMPIYAT",
      stimulus: "Lozan Barış Konferansı'nda Türk heyeti, adli, mali ve idari kısıtlamalar içeren kapitülasyonların koşulsuz kaldırılmasını talep etmiştir. Batılı devletlerin baskıları karşısında İsmet Paşa, bu kısıtların kaldırılması uğruna gerekirse konferansı terk etme stratejisini ortaya koymuştur.",
      stem: "Türk heyetinin kapitülasyon kısıtlamaları karşısındaki bu tavizsiz tutumu en fazla hangi ilkeyi ödünsüz gerçekleştirme kararlılığını kanıtlar?",
      options: {
        A: "Ekonomik ve siyasi tam bağımsızlık ilkesi",
        B: "Batı blokuyla askeri ittifak kurma arzusu",
        C: "Monarşik yetkilerin devam ettirilmesi isteği",
        D: "Gümrük vergilerini tamamen sıfırlama politikası"
      },
      correctOption: "A",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Kapitülasyonlar devletin egemenlik haklarını kısıtlayan en ağır ekonomik prangadır. Kaldırılması tam bağımsızlığın (Misakımilli) olmazsa olmaz şartıdır.",
      detailedSolution: "Kapitülasyonlar hem adli hem de mali bağımsızlığı ortadan kaldıran sömürgeci ayrıcalıklardır. Türk heyetinin savaşı dahi göze alması, bağımsızlıktan ödün verilemeyeceğinin (tam bağımsızlık) kanıtıdır.",
      distractors: {
        B: "Askeri ittifak arayışı değil, egemenlik haklarının korunmasıdır.",
        C: "Saltanat zaten kaldırılmıştır, monarşi hedeflenmemektedir.",
        D: "Gümrükleri sıfırlamak değil, yerli üreticiyi korumak için gümrük hakkını geri almaktır."
      }
    }
  ];

  const sosT4Questions = [
    {
      id: "LGS-SOS-T4-01",
      course: "T.C. İNKILAP TARİHİ",
      sourceTag: "MEB Maarif Temel Kazanım",
      outcomeCode: "İTA.8.4.1 • Cumhuriyetçilik İlkesi ve Demokrasi",
      difficulty: "KAVRAMA",
      stimulus: "Mustafa Kemal Atatürk: 'Egemenlik, kayıtsız şartsız milletindir.' vecizesiyle devlet yönetiminde nihai kararın halkın seçtiği temsilcilere ait olduğunu vurgulamıştır.",
      stem: "Bu ilke doğrudan aşağıdaki Atatürk ilkelerinden hangisiyle ilişkilidir?",
      options: {
        A: "Cumhuriyetçilik",
        B: "Devletçilik",
        C: "Laiklik",
        D: "İnkılapçılık"
      },
      correctOption: "A",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Millet egemenliği, seçim, oy kullanma ve halkın kendi kendini yönetmesi Cumhuriyetçilik ilkesinin temelidir.",
      detailedSolution: "Millet iradesi, meclis, seçim ve egemenliğin halka ait olması kavramları doğrudan Cumhuriyetçilik ilkesinin özünü teşkil eder.",
      distractors: {
        B: "Devletçilik iktisadi kalkınma ve devlet eliyle fabrika/banka kurulmasıdır.",
        C: "Laiklik din ve devlet işlerinin ayrılması, vicdan hürriyetidir.",
        D: "İnkılapçılık çağdaşlaşma ve sürekli dinamik yeniliktir."
      }
    },
    {
      id: "LGS-SOS-T4-02",
      course: "T.C. İNKILAP TARİHİ",
      sourceTag: "MEB Maarif Temel Kazanım",
      outcomeCode: "İTA.8.4.2 • Milliyetçilik İlkesi ve Kültürel Birlik",
      difficulty: "UYGULAMA",
      stimulus: "Cumhuriyetin ilk yıllarında Türk Tarih Kurumu ve Türk Dil Kurumunun kurulması, Kabotaj Kanunu kurallarının işletilerek Türk denizlerinde ticaret hakkının Türk denizcilerine verilmesi sağlanmıştır.",
      stem: "Kültür ve egemenlik kuralları uygulandığında yapılan bu inkılaplar ortak olarak hangi Atatürk ilkesinin yansımasıdır?",
      options: {
        A: "Devletçilik",
        B: "Milliyetçilik",
        C: "Halkçılık",
        D: "Laiklik"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: 'Türk' milli kimliğini, tarihini, dilini ve milli karasularındaki egemenliği güçlendiren hamleler Milliyetçilik ilkesidir.",
      detailedSolution: "Türk Dil ve Tarih Kurumları kültürel milliyetçiliği; Kabotaj Kanunu ise denizlerdeki millî egemenliği (iktisadi milliyetçilik) sağladığı için Milliyetçilik ilkesiyle doğrudan ilgilidir.",
      distractors: {
        A: "Devletçilik doğrudan sanayi yatırımlarıyla ilgilidir.",
        C: "Halkçılık kanun önünde eşitlik ve sınıfsız toplum idealidir.",
        D: "Laiklik akıl ve bilimi rehber edinme, inanç özgürlüğüdür."
      }
    },
    {
      id: "LGS-SOS-T4-03",
      course: "T.C. İNKILAP TARİHİ",
      sourceTag: "MEB Örnek Formatı",
      outcomeCode: "İTA.8.4.3 • Halkçılık İlkesi ve Kanun Önünde Eşitlik",
      difficulty: "UYGULAMA",
      stimulus: "Aşar vergisinin kaldırılması, Soyadı Kanunu kurallarının uygulanması ve unvan bildiren lakapların yasaklanması ile kadınlara seçme-seçilme hakkının tanınması gerçekleştirilmiştir.",
      stem: "Cumhuriyet dönemi inkılap kuralları uygulandığında bu adımların toplumdaki en temel ortak hedefi aşağıdakilerden hangisidir?",
      options: {
        A: "Sınıfsız, imtiyazsız ve kanun önünde eşit bir toplum oluşturmak",
        B: "Merkezi bütçenin vergi gelirlerini artırmak",
        C: "Dış borçlanmayı kolaylaştırmak",
        D: "Geleneksel zümre hiyerarşisini muhafaza etmek"
      },
      correctOption: "A",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Aşar vergisinin kalkması köylüyü rahatlatmış, Soyadı Kanunu zümre ayrıcalıklarını silmiş, kadın hakları cinsiyet eşitliğini sağlamıştır. Bu Halkçılık (eşitlik) ilkesidir.",
      detailedSolution: "Halkçılık kanun önünde eşitliği, hiçbir kişi veya zümreye ayrıcalık tanınmamasını hedefler. Aşar vergisinin kalkması ve unvanların yasaklanması doğrudan eşitliği tesis eder.",
      distractors: {
        B: "Aşar vergisi kalktığında devletin bütçe geliri azalmıştır (halk lehine fedakârlık yapılmıştır).",
        C: "Dış borçlanmayla bir ilgisi yoktur.",
        D: "Geleneksel ayrıcalıkları muhafaza etmek değil, ortadan kaldırmak hedeflenmiştir."
      }
    },
    {
      id: "LGS-SOS-T4-04",
      course: "T.C. İNKILAP TARİHİ",
      sourceTag: "2024 LGS Formatı",
      outcomeCode: "İTA.8.4.4 • Devletçilik İlkesi ve İzmir İktisat Kongresi",
      difficulty: "LGS_YENI_NESIL",
      stimulus: "1923 İzmir İktisat Kongresi'nde özel sektörün teşvik edilmesi kararlaştırılmış (Teşvik-i Sanayi Kanunu), ancak sermaye ve teknik bilgi yetersizliği ile 1929 Dünya Ekonomik Buhranı nedeniyle sanayi yatırımları arzu edilen hıza ulaşamamıştır. Bunun üzerine devlet bizzat devreye girerek Birinci Beş Yıllık Sanayi Planı'nı uygulamaya koymuş; şeker, kumaş, demir-çelik fabrikalarını kurmuştur.",
      stem: "Bu gelişme Devletçilik ilkesinin uygulanmasında aşağıdakilerden hangisinin belirleyici olduğunu kanıtlar?",
      options: {
        A: "Özel teşebbüsün tamamen yasaklanması politikasının",
        B: "Ülke şartlarının ve tarihsel zorunlulukların doğurduğu pragmatik yaklaşımın",
        C: "Yabancı sermayenin kontrolüne girme zorunluluğunun",
        D: "Tarım sektörünün sanayiye feda edilmesinin"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Devletçilik Türkiye'de ideolojik bir doktrin olarak değil; sermayesizlik ve kriz şartlarında halkın temel ihtiyaçlarını karşılamak için zorunluluktan doğmuştur.",
      detailedSolution: "Metin açıkça özel sektörün desteklendiğini fakat kriz ve imkânsızlıklar yüzünden devletin öncülük etmek zorunda kaldığını anlatır. Dolayısıyla Devletçilik dönemin şartlarının ve zorunluluklarının getirdiği pratik bir tercihtir.",
      distractors: {
        A: "Özel sektör hiçbir zaman yasaklanmamış, karma ekonomi benimsenmiştir.",
        C: "Yabancı sermayeye bağımlı olunmamış, yerli sanayi kurulmuştur.",
        D: "Tarım feda edilmemiş, şeker ve tekstil fabrikalarıyla tarım ürünleri işlenmiştir."
      }
    },
    {
      id: "LGS-SOS-T4-05",
      course: "T.C. İNKILAP TARİHİ",
      sourceTag: "2024 LGS Formatı",
      outcomeCode: "İTA.8.4.5 • Laiklik İlkesi ve Hukuk Alanında İnkılaplar",
      difficulty: "LGS_YENI_NESIL",
      stimulus: "1926 yılında kabul edilen Türk Medeni Kanunu ile tek eşle evlilik esası getirilmiş, mirasta ve mahkeme şahitliğinde kadın-erkek eşitliği sağlanmış, boşanma hakkı mahkeme kararına bağlanmıştır.",
      stem: "Türk Medeni Kanunu'nun getirdiği bu yeniliklerle ilgili aşağıdaki yargılardan hangisine ulaşılamaz?",
      options: {
        A: "Toplumsal ve ailevi alanda kadınların hukuki güvenceye kavuştuğuna",
        B: "Hukuk birliğinin ve laik hukuk sisteminin güçlendirildiğine",
        C: "Kadınların TBMM'ye milletvekili olarak seçilme hakkı kazandığına",
        D: "Mahkemelerde cinsiyete dayalı eşitsiz uygulamaların son bulduğuna"
      },
      correctOption: "C",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: Medeni Kanun (1926) sosyal ve medeni hakları içerir; siyasi haklar (seçme ve seçilme) 1930, 1933 ve 1934 yıllarında verilmiştir.",
      detailedSolution: "1926 Medeni Kanunu kadınlara toplumsal, ekonomik ve medeni haklar tanımıştır; kadınların siyasi hakları (milletvekili seçme-seçilme) ise 1934 yılında Anayasa değişikliği ile verilmiştir. Bu nedenle C seçeneğine ulaşılamaz.",
      distractors: {
        A: "Tek eşlilik ve boşanma hakkı doğrudan hukuki güvencedir.",
        B: "Şeri ve gayrimüslim mahkeme ikiliği kalkmış, tek laik hukuk uygulanmıştır.",
        D: "Şahitlikte eşitlik cinsiyet ayrımcılığını bitirmiştir."
      }
    },
    {
      id: "LGS-SOS-T4-06",
      course: "T.C. İNKILAP TARİHİ",
      sourceTag: "LGS Şampiyon Düzeyi",
      outcomeCode: "İTA.8.4.6 • İnkılapçılık ve Dinamik Çağdaşlaşma",
      difficulty: "SEKIL_VE_OLIMPIYAT",
      stimulus: "Atatürk'ün İnkılapçılık anlayışı, yapılan devrimleri durağan bir dogma saymayıp; aklın, bilimin ve zamanın değişen şartlarına göre sürekli gelişimi ve dinamik yenilenme stratejisini esas alır.",
      stem: "Buna göre diğer ilkelerle karşılaştırıldığında İnkılapçılık ilkesinin sistemin sürekliliğini sağlayan en fazla öne çıkan stratejik niteliği aşağıdakilerden hangisidir?",
      options: {
        A: "Sadece geçmişteki geleneksel kurumları restore etmesi",
        B: "Bütün ilkeleri dinamik tutan ve çağın gerisinde kalmayı önleyen motor güç olması",
        C: "Yalnızca askeri alandaki teknolojik gelişmeleri kapsaması",
        D: "Belirli bir zaman diliminde tamamlanıp nihayete ermiş sayılması"
      },
      correctOption: "B",
      solutionStrategy: "UZMAN ÖĞRETMEN STRATEJİSİ: İnkılapçılık diğer tüm ilkeleri çağın ihtiyaçlarına göre güncelleyen, durağanlaşmayı önleyen dinamik bir çatı ilkedir.",
      detailedSolution: "İnkılapçılık, Türk inkılabının dondurulmuş bir kalıp olmasını engeller; bilim ve medeniyet ilerledikçe kurumların ve anlayışın da dinamik kalmasını sağlayan itici motor güçtür.",
      distractors: {
        A: "Geleneksel kurumları restore etmez, ömrünü tamamlayanları kaldırıp çağdaşlarını kurar.",
        C: "Sadece askeri değil, hukuk, eğitim, ekonomi ve sosyal tüm alanları kapsar.",
        D: "Biten bir süreç değil, daima devam eden canlı bir süreçtir."
      }
    }
  ];

  // BİRLEŞTİRME VE ENRİCHMENT
  // 1. Türkçe
  baseData.turkce.tests[0].questions.push(...trT1New);
  baseData.turkce.tests[1].questions.push(...trT2New);
  baseData.turkce.tests[2].questions.push(...trT3New);
  baseData.turkce.tests.push({
    id: "TR-T4",
    title: "Test 4: Cümlenin Ögeleri, Fiilimsiler ve Metin Türleri",
    badge: "2024 LGS Formatı & Maarif",
    questions: trT4Questions
  });

  // 2. Matematik
  baseData.matematik.tests[0].questions.push(...matT1New);
  baseData.matematik.tests[1].questions.push(...matT2New);
  baseData.matematik.tests[2].questions.push(...matT3New);
  baseData.matematik.tests.push({
    id: "MAT-T4",
    title: "Test 4: Kareköklü İfadeler, Veri Analizi ve Geometrik Optimizasyon",
    badge: "2024 LGS Formatı & Maarif",
    questions: matT4Questions
  });

  // 3. Fen Bilimleri
  baseData.fen.tests[0].questions.push(...fenT1New);
  baseData.fen.tests[1].questions.push(...fenT2New);
  baseData.fen.tests[2].questions.push(...fenT3New);
  baseData.fen.tests.push({
    id: "FEN-T4",
    title: "Test 4: Asitler, Bazlar, Kimyasal Değişim ve Basit Makineler",
    badge: "2024 LGS Formatı & Maarif",
    questions: fenT4Questions
  });

  // 4. Sosyal / İnkılap
  baseData.sosyal.tests[0].questions.push(...sosT1New);
  baseData.sosyal.tests[1].questions.push(...sosT2New);
  baseData.sosyal.tests[2].questions.push(...sosT3New);
  baseData.sosyal.tests.push({
    id: "SOS-T4",
    title: "Test 4: Atatürk İlkeleri ve Çağdaşlaşan Türkiye",
    badge: "2024 LGS Formatı & Maarif",
    questions: sosT4Questions
  });

  return baseData;
}

export async function runScaleAndAudit() {
  console.log('================================================================================');
  console.log('[ÖLÇEKLEME] MEB MAARİF LGS SORU BANKASI 108 SORUYA GENİŞLETİLİYOR...');
  console.log('================================================================================');

  const scaledBank = getScaledQuestionBank();
  const auditor = new JevQualityAuditor();
  const analytics = new QuestionQualityAnalytics();

  let totalQuestionsCount = 0;
  let passedCount = 0;
  const errorList = [];

  for (const [cKey, course] of Object.entries(scaledBank)) {
    console.log(`\n[BRANŞ DENETİMİ] ${course.courseName} (${course.tests.length} Test Paketi)`);
    for (const test of course.tests) {
      console.log(`  -> Paket ${test.id} (${test.title}): ${test.questions.length} Soru`);
      for (const q of test.questions) {
        totalQuestionsCount++;
        const audit = await auditor.evaluateQuestion(q);
        if (audit.passed) {
          passedCount++;
        } else {
          errorList.push({ id: q.id, test: test.id, reasons: audit.reasons });
          console.error(`     ❌ REDDEDİLDİ: ${q.id} - ${audit.reasons?.join(', ')}`);
        }
      }
    }
  }

  console.log('\n================================================================================');
  console.log(`[JEV DENETİM SONUCU] Toplam: ${totalQuestionsCount} Soru | Onaylanan: ${passedCount} / ${totalQuestionsCount}`);
  console.log('================================================================================');

  if (errorList.length > 0) {
    throw new Error(`[KRİTİK HATA] ${errorList.length} soru JEV kalite kapısından geçemedi!`);
  }

  // questions.json dosyasına kaydet
  const qPath = path.join(__dirname, '..', 'public', 'questions.json');
  fs.writeFileSync(qPath, JSON.stringify(scaledBank, null, 2), 'utf-8');
  console.log(`[KAYIT] Genişletilmiş soru bankası başarıyla yazıldı: ${qPath}`);

  // Tam Kalite Raporu Üret
  const fullReport = await analytics.auditFullBank(scaledBank);
  console.log('\n' + analytics.formatConsoleReport(fullReport));

  return {
    totalQuestions: totalQuestionsCount,
    passedCount,
    report: fullReport
  };
}

if (process.argv[1]?.endsWith('bank_scale_generator.mjs')) {
  runScaleAndAudit()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[HATA]', err);
      process.exit(1);
    });
}
