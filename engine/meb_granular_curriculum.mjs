/**
 * MEB Maarif Modeli - Ayrıntılı Mikro Konu ve Kazanım Hiyerarşisi (Granular Curriculum)
 * T.C. Millî Eğitim Bakanlığı & Talim ve Terbiye Kurulu Başkanlığı (TTKB)
 * 
 * Ana Ünite -> Konu Başlığı -> Mikro Alt Konu -> Resmî Kazanım Kodu -> Bilişsel Düzey
 * 5, 6, 7 ve 8. Sınıfların 4 ana branşında 1.600'den fazla bağımsız mikro konuyu barındırır.
 */

export const MEB_GRANULAR_CURRICULUM_GRADE_8 = {
  "matematik": {
    "courseName": "Matematik",
    "grade": 8,
    "totalUnits": 6,
    "units": [
      {
        "unitId": "MAT-8-U1",
        "unitTitle": "1. Ünite: Çarpanlar ve Katlar & Üslü İfadeler",
        "topics": [
          {
            "topicTitle": "Çarpanlar ve Katlar",
            "subtopics": [
              {
                "id": "MAT-8-1-1",
                "title": "Pozitif Tam Sayıların Çarpanları ve Bölenleri",
                "outcome": "M.8.1.1.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "MAT-8-1-2",
                "title": "Asal Sayılar ve Asal Çarpan Algoritması (Bölen Listesi)",
                "outcome": "M.8.1.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-1-3",
                "title": "Pozitif Tam Sayıları Asal Çarpanların Çarpımı Biçiminde Yazma",
                "outcome": "M.8.1.1.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "MAT-8-1-4",
                "title": "İki Doğal Sayının En Büyük Ortak Böleni (EBOB) Hesabı",
                "outcome": "M.8.1.1.2",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-1-5",
                "title": "EBOB Problemleri (Bütünden Parçaya, Şişeleme, Parselleme, Kesim)",
                "outcome": "M.8.1.1.2",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-8-1-6",
                "title": "İki Doğal Sayının En Küçük Ortak Katı (EKOK) Hesabı",
                "outcome": "M.8.1.1.2",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-1-7",
                "title": "EKOK Problemleri (Parçadan Bütüne, Nöbet, Zil, Sefer, Kaplama)",
                "outcome": "M.8.1.1.2",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-8-1-8",
                "title": "İki Sayının Çarpımı ile EBOB ve EKOK Çarpımı Bağıntısı",
                "outcome": "M.8.1.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-8-1-9",
                "title": "Aralarında Asal Sayıların Tanımı ve Özellikleri",
                "outcome": "M.8.1.1.3",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "MAT-8-1-10",
                "title": "Aralarında Asallık ve Yeni Nesil Kart/Kutu Problemleri",
                "outcome": "M.8.1.1.3",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme"
              }
            ]
          },
          {
            "topicTitle": "Üslü İfadeler",
            "subtopics": [
              {
                "id": "MAT-8-1-11",
                "title": "Tam Sayıların Pozitif ve Sıfırıncı Kuvvetleri",
                "outcome": "M.8.1.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "MAT-8-1-12",
                "title": "Tam Sayıların Negatif Tam Sayı Kuvvetleri (a^-n)",
                "outcome": "M.8.1.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-1-13",
                "title": "Rasyonel Sayıların Negatif Kuvvetleri",
                "outcome": "M.8.1.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-1-14",
                "title": "Üslü İfadelerde Çarpma İşlemi (Tabanları Aynı Olanlar)",
                "outcome": "M.8.1.2.2",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-1-15",
                "title": "Üslü İfadelerde Çarpma İşlemi (Üsleri Aynı Olanlar)",
                "outcome": "M.8.1.2.2",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-1-16",
                "title": "Üslü İfadelerde Bölme İşlemi (Tabanları Aynı Olanlar)",
                "outcome": "M.8.1.2.2",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-1-17",
                "title": "Üslü İfadelerde Bölme İşlemi (Üsleri Aynı Olanlar)",
                "outcome": "M.8.1.2.2",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-1-18",
                "title": "Üssün Üssü (Kuvvetin Kuvveti) ve Ortak Tabana İndirgeme",
                "outcome": "M.8.1.2.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-8-1-19",
                "title": "Ondalık Gösterimleri 10'un Tam Sayı Kuvvetleriyle Çözümleme",
                "outcome": "M.8.1.2.3",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-1-20",
                "title": "Çözümlenmiş Biçimi Verilen Ondalık Sayıyı Yazma",
                "outcome": "M.8.1.2.3",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "MAT-8-1-21",
                "title": "Çok Büyük ve Çok Küçük Sayılar (Katsayı-Üs Dengesi)",
                "outcome": "M.8.1.2.4",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-1-22",
                "title": "Bilimsel Gösterim Standardı (|a| x 10^n)",
                "outcome": "M.8.1.2.5",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "MAT-8-1-23",
                "title": "Birim Dönüşümlü Bilimsel Gösterim Problemleri (LGS Formatı)",
                "outcome": "M.8.1.2.5",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-8-U2",
        "unitTitle": "2. Ünite: Kareköklü İfadeler & Veri Analizi",
        "topics": [
          {
            "topicTitle": "Kareköklü İfadeler",
            "subtopics": [
              {
                "id": "MAT-8-2-1",
                "title": "Tam Kare Pozitif Tam Sayılar ve Karekök Kavramı",
                "outcome": "M.8.1.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "MAT-8-2-2",
                "title": "Alanı Verilen Karenin Kenar Uzunluğunu Bulma",
                "outcome": "M.8.1.3.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-2-3",
                "title": "Tam Kare Olmayan Sayıların Karekökünün Yaklaşık Değeri",
                "outcome": "M.8.1.3.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-8-2-4",
                "title": "Kareköklü Sayıların Sayı Doğrusunda Ardışık İki Sayı Arasında Gösterimi",
                "outcome": "M.8.1.3.2",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-2-5",
                "title": "Kareköklü İfadeyi a√b Şeklinde Yazma",
                "outcome": "M.8.1.3.3",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-2-6",
                "title": "Katsayıyı Karekök İçine Alma (√a²b)",
                "outcome": "M.8.1.3.3",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-2-7",
                "title": "a√b Şeklindeki Sayıları Sıralama ve Karşılaştırma",
                "outcome": "M.8.1.3.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-8-2-8",
                "title": "Kareköklü İfadelerde Çarpma İşlemi",
                "outcome": "M.8.1.3.4",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-2-9",
                "title": "Kareköklü İfadelerde Bölme İşlemi",
                "outcome": "M.8.1.3.4",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-2-10",
                "title": "Kareköklü İfadelerde Toplama ve Çıkarma İşlemleri",
                "outcome": "M.8.1.3.5",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-2-11",
                "title": "Kareköklü İfade ile Çarpıldığında Sonucu Doğal Sayı Yapan Çarpanlar",
                "outcome": "M.8.1.3.6",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-8-2-12",
                "title": "Ondalık İfadelerin Kareköklerini Belirleme",
                "outcome": "M.8.1.3.7",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-2-13",
                "title": "Rasyonel ve İrrasyonel Sayılar Ayrımı",
                "outcome": "M.8.1.3.8",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "MAT-8-2-14",
                "title": "Gerçek (Reel) Sayılar Kümesi ve Sayı Kümeleri Hiyerarşisi",
                "outcome": "M.8.1.3.8",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "MAT-8-2-15",
                "title": "Kareköklü İfadelerle Çok Adımlı Modelleme ve Geometrik Alan Soruları",
                "outcome": "M.8.1.3.5",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              }
            ]
          },
          {
            "topicTitle": "Veri Analizi",
            "subtopics": [
              {
                "id": "MAT-8-2-16",
                "title": "Çizgi Grafiği Oluşturma ve Zamana Bağlı Değişimi Yorumlama",
                "outcome": "M.8.4.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-2-17",
                "title": "Sütun Grafiği ile Farklı Grupları Karşılaştırma",
                "outcome": "M.8.4.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-2-18",
                "title": "Daire Grafiği ve Merkez Açı Orantı Hesabı (360° Dağılımı)",
                "outcome": "M.8.4.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-8-2-19",
                "title": "Sütun Grafiğinden Daire Grafiğine Dönüşüm Problemleri",
                "outcome": "M.8.4.1.2",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              },
              {
                "id": "MAT-8-2-20",
                "title": "Daire Grafiğinden Sütun veya Tabloya Dönüşüm Problemleri",
                "outcome": "M.8.4.1.2",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-8-U3",
        "unitTitle": "3. Ünite: Basit Olayların Olma Olasılığı & Cebirsel İfadeler",
        "topics": [
          {
            "topicTitle": "Basit Olayların Olma Olasılığı",
            "subtopics": [
              {
                "id": "MAT-8-3-1",
                "title": "Olasılık Temel Kavramları: Deney, Çıktı, Olay, Örnek Uzay",
                "outcome": "M.8.5.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "MAT-8-3-2",
                "title": "Eşit Şansa Sahip Olan Olaylar ve Çıktı Sayıları",
                "outcome": "M.8.5.1.2",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "MAT-8-3-3",
                "title": "Daha Fazla, Eşit ve Daha Az Olasılıklı Durumların Karşılaştırılması",
                "outcome": "M.8.5.1.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-8-3-4",
                "title": "İmkânsız Olay (0) ve Kesin Olay (1) Kavramları",
                "outcome": "M.8.5.1.4",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "MAT-8-3-5",
                "title": "Olasılık Değerinin [0, 1] Aralığında Olması Kuralı",
                "outcome": "M.8.5.1.4",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "MAT-8-3-6",
                "title": "Basit Bir Olayın Olma Olasılığı Formülü (İstenen / Tüm Durumlar)",
                "outcome": "M.8.5.1.5",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-3-7",
                "title": "Olayın Olma Olasılığı ile Olmama Olasılığı Toplamı (P(A) + P(A') = 1)",
                "outcome": "M.8.5.1.5",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-8-3-8",
                "title": "Kombinasyonlu ve Çok Aşamalı LGS Olasılık Senaryoları",
                "outcome": "M.8.5.1.5",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme"
              }
            ]
          },
          {
            "topicTitle": "Cebirsel İfadeler ve Özdeşlikler",
            "subtopics": [
              {
                "id": "MAT-8-3-9",
                "title": "Cebirsel İfadelerde Terim, Katsayı, Değişken ve Sabit Terim",
                "outcome": "M.8.2.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "MAT-8-3-10",
                "title": "Benzer Terimler ve Cebirsel İfadelerde Toplama-Çıkarma",
                "outcome": "M.8.2.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-3-11",
                "title": "Bir Doğal Sayı ile Cebirsel İfadeyi Çarpma",
                "outcome": "M.8.2.1.2",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-3-12",
                "title": "İki Cebirsel İfadenin Çarpımı ve Dağılma Özelliği",
                "outcome": "M.8.2.1.2",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-3-13",
                "title": "Cebirsel Çarpmanın Geometrik Karo Modelleri ile Gösterimi",
                "outcome": "M.8.2.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-8-3-14",
                "title": "Denklem ile Özdeşlik Arasındaki Farkı Anlama",
                "outcome": "M.8.2.1.3",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "MAT-8-3-15",
                "title": "İki Terimin Toplamının Karesi Özdeşliği: (a+b)² = a² + 2ab + b²",
                "outcome": "M.8.2.1.3",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-3-16",
                "title": "İki Terimin Farkının Karesi Özdeşliği: (a-b)² = a² - 2ab + b²",
                "outcome": "M.8.2.1.3",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-3-17",
                "title": "İki Kare Farkı Özdeşliği: a² - b² = (a-b)(a+b)",
                "outcome": "M.8.2.1.3",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-3-18",
                "title": "Geometrik Şekiller Üzerinde Özdeşlik Alan Modellemesi (LGS Prototipi)",
                "outcome": "M.8.2.1.3",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              },
              {
                "id": "MAT-8-3-19",
                "title": "Ortak Çarpan Parantezine Alma Yoluyla Çarpanlara Ayırma",
                "outcome": "M.8.2.1.4",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-3-20",
                "title": "Tam Kare Özdeşliklerini Kullanarak Çarpanlara Ayırma",
                "outcome": "M.8.2.1.4",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-8-3-21",
                "title": "İki Kare Farkını Kullanarak Çarpanlara Ayırma",
                "outcome": "M.8.2.1.4",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-8-U4",
        "unitTitle": "4. Ünite: Doğrusal Denklemler & Eşitsizlikler",
        "topics": [
          {
            "topicTitle": "Doğrusal Denklemler",
            "subtopics": [
              {
                "id": "MAT-8-4-1",
                "title": "Birinci Dereceden Bir Bilinmeyenli Rasyonel Katsayılı Denklemler",
                "outcome": "M.8.2.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-4-2",
                "title": "Denklem Kurmayı Gerektiren Gerçek Hayat Problemleri",
                "outcome": "M.8.2.2.1",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-8-4-3",
                "title": "Koordinat Sistemi: Eksenler (x, y), Orijin ve Dört Bölge",
                "outcome": "M.8.2.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "MAT-8-4-4",
                "title": "Sıralı İkililer ve Koordinat Düzleminde Nokta Yerleştirme",
                "outcome": "M.8.2.2.2",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-4-5",
                "title": "Aralarında Doğrusal İlişki Olan Değişkenler (Bağımlı ve Bağımsız)",
                "outcome": "M.8.2.2.3",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "MAT-8-4-6",
                "title": "Doğrusal İlişkiyi Tablo ve Denklem ile İfade Etme (y = ax + b)",
                "outcome": "M.8.2.2.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-8-4-7",
                "title": "Orijinden Geçen Doğruların Grafiğini Çizme (y = mx)",
                "outcome": "M.8.2.2.4",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-4-8",
                "title": "Eksenleri Kesen Doğruların Grafiğini Çizme (x=0 ve y=0 Yöntemi)",
                "outcome": "M.8.2.2.4",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-4-9",
                "title": "Eksenlere Paralel Doğruların Grafikleri (x = a, y = b)",
                "outcome": "M.8.2.2.4",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "MAT-8-4-10",
                "title": "Doğrunun Eğimi Kavramı ve Formülü (Dikey Uzunluk / Yatay Uzunluk)",
                "outcome": "M.8.2.2.5",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "MAT-8-4-11",
                "title": "Grafiği Verilen Doğrunun Eğimini ve İşaretini Bulma (Sağa/Sola Yatık)",
                "outcome": "M.8.2.2.5",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-4-12",
                "title": "Denkleminden Doğrunun Eğimini Belirleme (y = mx + b'de m)",
                "outcome": "M.8.2.2.5",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-8-4-13",
                "title": "Gerçek Yaşam Senaryolarında Eğim (Rampalar, Çatılar, Merdivenler)",
                "outcome": "M.8.2.2.5",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme"
              }
            ]
          },
          {
            "topicTitle": "Eşitsizlikler",
            "subtopics": [
              {
                "id": "MAT-8-4-14",
                "title": "Birinci Dereceden Bir Bilinmeyenli Eşitsizlik Cümleleri (<, >, ≤, ≥)",
                "outcome": "M.8.2.3.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "MAT-8-4-15",
                "title": "Eşitsizliklerin Sayı Doğrusunda Çözüm Kümesi Gösterimi",
                "outcome": "M.8.2.3.2",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-4-16",
                "title": "Birinci Dereceden Bir Bilinmeyenli Eşitsizlikleri Çözme Kuralları",
                "outcome": "M.8.2.3.3",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-4-17",
                "title": "Negatif Sayı ile Çarpma/Bölmede Eşitsizliğin Yön Değiştirmesi İlkesi",
                "outcome": "M.8.2.3.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-8-4-18",
                "title": "Gerçek Hayat Eşitsizlik Problemleri (Kâr-Zarar, Bütçe, Ağırlık Limitleri)",
                "outcome": "M.8.2.3.3",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-8-U5",
        "unitTitle": "5. Ünite: Üçgenler & Eşlik ve Benzerlik",
        "topics": [
          {
            "topicTitle": "Üçgenler",
            "subtopics": [
              {
                "id": "MAT-8-5-1",
                "title": "Üçgende Kenarortay Çizimi ve Özellikleri",
                "outcome": "M.8.3.1.1",
                "cognitive": "Kavrama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-5-2",
                "title": "Üçgende Açıortay Çizimi ve Katlama Metodu",
                "outcome": "M.8.3.1.1",
                "cognitive": "Kavrama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-5-3",
                "title": "Üçgende Yükseklik Çizimi (Dar, Dik ve Geniş Açılı Üçgenlerde)",
                "outcome": "M.8.3.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-5-4",
                "title": "Üçgen Eşitsizliği Bağıntısı (|b-c| < a < b+c)",
                "outcome": "M.8.3.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-8-5-5",
                "title": "Ortak Kenarlı İki Üçgende Kenar Uzunluğu Aralığı Bulma",
                "outcome": "M.8.3.1.2",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-8-5-6",
                "title": "Üçgende Kenar Uzunlukları ile Açı Ölçüleri Arasındaki İlişki",
                "outcome": "M.8.3.1.3",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-5-7",
                "title": "Belirli Bir Üçgen Çizebilme Şartları (3K, 2K1A, 1K2A Cetvel-Pergel)",
                "outcome": "M.8.3.1.4",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-8-5-8",
                "title": "Pisagor Bağıntısı (a² + b² = c²)",
                "outcome": "M.8.3.1.5",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-5-9",
                "title": "Özel Dik Üçgenler (3-4-5, 5-12-13, 8-15-17, 7-24-25 ve Katları)",
                "outcome": "M.8.3.1.5",
                "cognitive": "Uygulama",
                "bloom": "Hatırlama"
              },
              {
                "id": "MAT-8-5-10",
                "title": "Pisagor Bağıntısının Gerçek Hayat Uygulamaları (Merdiven, Tel, Direk)",
                "outcome": "M.8.3.1.5",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              }
            ]
          },
          {
            "topicTitle": "Eşlik ve Benzerlik",
            "subtopics": [
              {
                "id": "MAT-8-5-11",
                "title": "Eş Çokgenler, Karşılıklı Kenar ve Açı Eşlikleri (≅ Sembolü)",
                "outcome": "M.8.3.2.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "MAT-8-5-12",
                "title": "Benzer Çokgenler ve Benzerlik Oranı (k) Kavramı",
                "outcome": "M.8.3.2.2",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "MAT-8-5-13",
                "title": "Üçgenlerde Benzerlik Kuralları (A.A., K.A.K., K.K.K.)",
                "outcome": "M.8.3.2.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-8-5-14",
                "title": "Benzerlik Oranının Çevre ve Alana Etkisi (k ve k²)",
                "outcome": "M.8.3.2.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-8-5-15",
                "title": "Gölge Boyu, Ayna ve Teodolit ile Yükseklik/Mesafe Ölçme Problemleri",
                "outcome": "M.8.3.2.2",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-8-U6",
        "unitTitle": "6. Ünite: Dönüşüm Geometrisi & Geometrik Cisimler",
        "topics": [
          {
            "topicTitle": "Dönüşüm Geometrisi",
            "subtopics": [
              {
                "id": "MAT-8-6-1",
                "title": "Noktanın ve Çokgenlerin Koordinat Düzleminde Ötelemesi",
                "outcome": "M.8.3.3.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-6-2",
                "title": "Yansıma Hareketi ve Simetri Doğrusuna Göre Yansıma",
                "outcome": "M.8.3.3.2",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-6-3",
                "title": "Koordinat Düzleminde x ve y Eksenlerine Göre Yansıma",
                "outcome": "M.8.3.3.2",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-6-4",
                "title": "Ardışık Öteleme ve Yansıma Dönüşümleri (Desen ve Motifler)",
                "outcome": "M.8.3.3.3",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              }
            ]
          },
          {
            "topicTitle": "Geometrik Cisimler",
            "subtopics": [
              {
                "id": "MAT-8-6-5",
                "title": "Dik Prizmaların Temel Elemanları (Taban, Yüz, Ayrıt, Köşe)",
                "outcome": "M.8.3.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "MAT-8-6-6",
                "title": "Kare Prizma, Dikdörtgenler Prizması ve Üçgen Prizma Açınımları",
                "outcome": "M.8.3.4.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-6-7",
                "title": "Dik Dairesel Silindirin Temel Elemanları ve Açınımı",
                "outcome": "M.8.3.4.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "MAT-8-6-8",
                "title": "Dik Dairesel Silindirin Yüzey Alanı Hesabı (2πr² + 2πrh)",
                "outcome": "M.8.3.4.3",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-8-6-9",
                "title": "Dik Dairesel Silindirin Hacim Hesabı (πr²h) ve Sıvı Problemleri",
                "outcome": "M.8.3.4.4",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-8-6-10",
                "title": "Dik Piramidin Temel Elemanları, Yüksekliği ve Açınımı",
                "outcome": "M.8.3.4.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "MAT-8-6-11",
                "title": "Dik Koninin Temel Elemanları, Ana Doğrusu ve Açınımı",
                "outcome": "M.8.3.4.6",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "MAT-8-6-12",
                "title": "Konide Daire Diliminin Merkez Açısı ile Taban Yarıçapı Bağıntısı (r/ℓ = α/360°)",
                "outcome": "M.8.3.4.6",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              }
            ]
          }
        ]
      }
    ]
  },
  "fen": {
    "courseName": "Fen Bilimleri",
    "grade": 8,
    "totalUnits": 7,
    "units": [
      {
        "unitId": "FEN-8-U1",
        "unitTitle": "1. Ünite: Mevsimler ve İklim",
        "topics": [
          {
            "topicTitle": "Mevsimlerin Oluşumu",
            "subtopics": [
              {
                "id": "FEN-8-1-1",
                "title": "Dünyanın Dönme Ekseni Eğikliği (23° 27') ve Sonuçları",
                "outcome": "F.8.1.1.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-1-2",
                "title": "Dünyanın Güneş Etrafında Dolanımı ve Yıllık Hareket",
                "outcome": "F.8.1.1.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-1-3",
                "title": "21 Haziran ve 21 Aralık Gün Dönümü Modellemeleri",
                "outcome": "F.8.1.1.1",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-1-4",
                "title": "21 Mart ve 23 Eylül Ekinoks Tarihleri ve Gece-Gündüz Eşitliği",
                "outcome": "F.8.1.1.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-1-5",
                "title": "Işınların Geliş Açısı ile Birim Yüzeye Düşen Isı Enerjisi İlişkisi",
                "outcome": "F.8.1.1.1",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              },
              {
                "id": "FEN-8-1-6",
                "title": "Güneş Işınlarının Açısı ile Cisimlerin Gölge Boyu Değişimi",
                "outcome": "F.8.1.1.1",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              }
            ]
          },
          {
            "topicTitle": "İklim ve Hava Hareketleri",
            "subtopics": [
              {
                "id": "FEN-8-1-7",
                "title": "Hava Olayları ile İklim Arasındaki Temel Farklar",
                "outcome": "F.8.1.2.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-1-8",
                "title": "Klimatolog ve Meteorolog Meslek Alanları",
                "outcome": "F.8.1.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "FEN-8-1-9",
                "title": "Alçak Basınç ve Yüksek Basınç Alanlarının Oluşum Mekanizması",
                "outcome": "F.8.1.2.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-1-10",
                "title": "Rüzgârın Oluşumu, Yönü (Yüksek Basınçtan Alçak Basınca) ve Mum Deneyleri",
                "outcome": "F.8.1.2.2",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-1-11",
                "title": "Havadaki Nem ve Yağış Çeşitleri (Yağmur, Kar, Dolu, Çiy, Kırağı, Sis)",
                "outcome": "F.8.1.2.2",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-1-12",
                "title": "Küresel İklim Değişikliğinin Nedenleri, Sera Gazları ve İnsan Etkisi",
                "outcome": "F.8.1.2.3",
                "cognitive": "Analiz",
                "bloom": "Değerlendirme"
              },
              {
                "id": "FEN-8-1-13",
                "title": "Küresel İklim Değişikliğinin Sonuçları ve Alınabilecek Sürdürülebilir Tedbirler",
                "outcome": "F.8.1.2.3",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-8-U2",
        "unitTitle": "2. Ünite: DNA ve Genetik Kod",
        "topics": [
          {
            "topicTitle": "DNA ve Genetik Kod",
            "subtopics": [
              {
                "id": "FEN-8-2-1",
                "title": "Kromozom, DNA, Gen ve Nükleotit İlişkisi (Büyüklük Sıralaması)",
                "outcome": "F.8.2.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "FEN-8-2-2",
                "title": "DNA'nın Çift Sarmal Yapısı ve Temel Özellikleri",
                "outcome": "F.8.2.1.2",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-2-3",
                "title": "Nükleotitlerin Yapısı: Fosfat, Deoksiriboz Şekeri ve Organik Bazlar (A, T, G, C)",
                "outcome": "F.8.2.1.3",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-2-4",
                "title": "DNA'da Eşleşme Kuralları (A=T, G≡C) ve Nükleotit Sayı Bağıntıları",
                "outcome": "F.8.2.1.3",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-2-5",
                "title": "DNA'nın Kendini Eşlemesi (Replikasyon) Aşamaları",
                "outcome": "F.8.2.1.4",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-2-6",
                "title": "DNA Eşlenmesinde Hatalar ve Onarılabilirlik Şartları (Tek Kol vs Karşılıklı Boşluk)",
                "outcome": "F.8.2.1.4",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme"
              }
            ]
          },
          {
            "topicTitle": "Kalıtım",
            "subtopics": [
              {
                "id": "FEN-8-2-7",
                "title": "Genotip ve Fenotip Kavramları",
                "outcome": "F.8.2.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "FEN-8-2-8",
                "title": "Saf Döl (Homozigot) ve Melez Döl (Heterozigot) Genotipler",
                "outcome": "F.8.2.2.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-2-9",
                "title": "Baskın (Dominant) ve Çekinik (Resesif) Karakterler",
                "outcome": "F.8.2.2.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-2-10",
                "title": "Mendel İlkeleri ve Bezelyelerde Tek Karakter Çaprazlamaları",
                "outcome": "F.8.2.2.2",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-2-11",
                "title": "Fenotip ve Genotip Oran/Yüzde Hesaplamaları (%75-%25 vb.)",
                "outcome": "F.8.2.2.2",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-2-12",
                "title": "İnsanda Cinsiyet Kalıtımı (XX ve XY) ve Her Doğumda %50 İhtimali",
                "outcome": "F.8.2.2.3",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-2-13",
                "title": "Akraba Evliliği ve Çekinik Genetik Hastalıkların Ortaya Çıkma Riski",
                "outcome": "F.8.2.2.4",
                "cognitive": "Analiz",
                "bloom": "Değerlendirme"
              }
            ]
          },
          {
            "topicTitle": "Mutasyon, Modifikasyon, Adaptasyon ve Biyoteknoloji",
            "subtopics": [
              {
                "id": "FEN-8-2-14",
                "title": "Mutasyon Kavramı, Sebepleri (Radyasyon, Kimyasallar) ve Örnekleri",
                "outcome": "F.8.2.3.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-2-15",
                "title": "Vücut Hücresi vs Üreme Hücresi Mutasyonları ve Kalıtsallık",
                "outcome": "F.8.2.3.1",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-2-16",
                "title": "Modifikasyon Kavramı, Çevresel Faktörler ve Kalıtsal Olmaması",
                "outcome": "F.8.2.3.2",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-2-17",
                "title": "Mutasyon ile Modifikasyon Karşılaştırmalı Deney Soruları",
                "outcome": "F.8.2.3.2",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-2-18",
                "title": "Adaptasyon (Uyum) Kavramı ve Yaşama/Üreme Şansına Etkisi",
                "outcome": "F.8.2.4.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-2-19",
                "title": "Doğal Seçilim ve Varyasyon (Tür İçi Çeşitlilik) Mekanizması",
                "outcome": "F.8.2.4.1",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-2-20",
                "title": "Genetik Mühendisliği ile Biyoteknoloji İlişkisi ve Alanları",
                "outcome": "F.8.2.5.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-2-21",
                "title": "Biyoteknolojik Yöntemler: Gen Aktarımı, Klonlama, Gen Tedavisi, Islah, DNA Parmak İzi",
                "outcome": "F.8.2.5.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-2-22",
                "title": "Biyoteknolojinin Yararları, Zararları ve Biyoetik Tartışmalar",
                "outcome": "F.8.2.5.3",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-8-U3",
        "unitTitle": "3. Ünite: Basınç",
        "topics": [
          {
            "topicTitle": "Katı Basıncı",
            "subtopics": [
              {
                "id": "FEN-8-3-1",
                "title": "Basınç Tanımı ve Birimi (Pascal = N/m²)",
                "outcome": "F.8.3.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "FEN-8-3-2",
                "title": "Katı Basıncının Ağırlık (Kuvvet) ile Doğru Orantılı Olması",
                "outcome": "F.8.3.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-3-3",
                "title": "Katı Basıncının Temas Yüzey Alanı ile Ters Orantılı Olması",
                "outcome": "F.8.3.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-3-4",
                "title": "Özdeş Tuğlalar ve Sünger Çökme Deneyleri (Bağımlı-Bağımsız Değişken)",
                "outcome": "F.8.3.1.1",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-3-5",
                "title": "Katıların Üzerine Uygulanan Kuvveti Aynen İletmesi İlkesi",
                "outcome": "F.8.3.1.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-3-6",
                "title": "Katı Basıncını Artırma ve Azaltma Örnekleri (Krampon, Bıçak, İş Makinesi Paleti)",
                "outcome": "F.8.3.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              }
            ]
          },
          {
            "topicTitle": "Sıvı Basıncı ve Pascal Prensibi",
            "subtopics": [
              {
                "id": "FEN-8-3-7",
                "title": "Sıvı Basıncının Sıvı Derinliği (h) ile Doğru Orantılı Olması",
                "outcome": "F.8.3.1.2",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-3-8",
                "title": "Sıvı Basıncının Sıvı Yoğunluğu (d) ile Doğru Orantılı Olması",
                "outcome": "F.8.3.1.2",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-3-9",
                "title": "Sıvı Basıncının Kabın Şekline ve Sıvı Hacmine Bağlı Olmaması",
                "outcome": "F.8.3.1.2",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-3-10",
                "title": "Farklı Şekilli Kaplarda Musluktan Eşit Debi ile Dolum Basınç-Zaman Grafikleri",
                "outcome": "F.8.3.1.2",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              },
              {
                "id": "FEN-8-3-11",
                "title": "Pascal Prensibi: Sıvıların Basıncı Her Yöne Aynen İletmesi",
                "outcome": "F.8.3.1.3",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-3-12",
                "title": "Pascal Prensibi Uygulamaları: Su Cendereleri, Hidrolik Fren, Vinç, Berber Koltuğu",
                "outcome": "F.8.3.1.3",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              }
            ]
          },
          {
            "topicTitle": "Gaz Basıncı",
            "subtopics": [
              {
                "id": "FEN-8-3-13",
                "title": "Açık Hava (Atmosfer) Basıncının Varlığı ve Magdeburg Deneyi",
                "outcome": "F.8.3.1.4",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-3-14",
                "title": "Torricelli Deneyi ve Deniz Seviyesinde 76 cm-Hg Ölçümü",
                "outcome": "F.8.3.1.4",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-3-15",
                "title": "Açık Hava Basıncının Rakım (Yükseklik) ile Değişimi",
                "outcome": "F.8.3.1.4",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-3-16",
                "title": "Kapalı Kaplardaki Gaz Basıncı ve Sıcaklık/Hacim İlişkisi",
                "outcome": "F.8.3.1.4",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-3-17",
                "title": "Günlük Hayatta Gaz Basıncı: Oto Hava Yastığı, Düdüklü Tencere, Yangın Tüpü",
                "outcome": "F.8.3.1.4",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Uygulama"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-8-U4",
        "unitTitle": "4. Ünite: Madde ve Endüstri",
        "topics": [
          {
            "topicTitle": "Periyodik Sistem",
            "subtopics": [
              {
                "id": "FEN-8-4-1",
                "title": "Periyodik Sistemin Tarihçesi (Döbereiner, Newlands, Mendeleyev, Moseley)",
                "outcome": "F.8.4.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "FEN-8-4-2",
                "title": "Periyotlar (7 Adet) ve Gruplar (8 Adet A Grubu)",
                "outcome": "F.8.4.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "FEN-8-4-3",
                "title": "Katman Elektron Dağılımından Grup ve Periyot Numarası Bulma",
                "outcome": "F.8.4.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-4-4",
                "title": "Aynı Gruptaki Elementlerin Benzer Kimyasal Özellik Göstermesi",
                "outcome": "F.8.4.1.1",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-4-5",
                "title": "Elementlerin Sınıflandırılması: Metallerin Özellikleri",
                "outcome": "F.8.4.1.2",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-4-6",
                "title": "Elementlerin Sınıflandırılması: Ametallerin Özellikleri (Hidrojen İstisnası)",
                "outcome": "F.8.4.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-4-7",
                "title": "Elementlerin Sınıflandırılması: Yarı Metallerin Özellikleri (Bor, Silisyum)",
                "outcome": "F.8.4.1.2",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-4-8",
                "title": "Elementlerin Sınıflandırılması: Soygazların (Asal Gazlar) Kararlı Yapısı (Helyum İstisnası)",
                "outcome": "F.8.4.1.2",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              }
            ]
          },
          {
            "topicTitle": "Fiziksel ve Kimyasal Değişimler & Tepkimeler",
            "subtopics": [
              {
                "id": "FEN-8-4-9",
                "title": "Fiziksel Değişim Kavramı ve Örnekleri (Hâl Değişimi, Kırılma, Çözünme)",
                "outcome": "F.8.4.2.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-4-10",
                "title": "Kimyasal Değişim Kavramı ve Örnekleri (Yanma, Paslanma, Pişme, Mayalanma)",
                "outcome": "F.8.4.2.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-4-11",
                "title": "Atomik Ölçekte Fiziksel ve Kimyasal Değişim Modelleri",
                "outcome": "F.8.4.2.1",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-4-12",
                "title": "Kimyasal Tepkime Tanımı, Girenler ve Ürünler",
                "outcome": "F.8.4.3.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-4-13",
                "title": "Kimyasal Tepkimelerde Kütlenin Korunumu Kanunu (Kapalı Kap Prensibi)",
                "outcome": "F.8.4.3.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-4-14",
                "title": "Kimyasal Tepkimelerde Korunan Özellikler (Atom Sayısı ve Türü, Toplam Kütle)",
                "outcome": "F.8.4.3.1",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-4-15",
                "title": "Kimyasal Tepkimelerde Değişebilen Özellikler (Molekül Sayısı, Hacim)",
                "outcome": "F.8.4.3.1",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-4-16",
                "title": "Tepkime Kütle-Zaman Grafiği Çözümleme ve Artan Madde Problemleri",
                "outcome": "F.8.4.3.1",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              }
            ]
          },
          {
            "topicTitle": "Asitler ve Bazlar",
            "subtopics": [
              {
                "id": "FEN-8-4-17",
                "title": "Asitlerin Genel Özellikleri (Ekşi tat, H+ iyonu, aşındırıcılık)",
                "outcome": "F.8.4.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "FEN-8-4-18",
                "title": "Bazların Genel Özellikleri (Acı tat, OH- iyonu, ele kayganlık hissi)",
                "outcome": "F.8.4.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "FEN-8-4-19",
                "title": "Ayıraçlar (İndikatörler): Turnusol Kağıdı, Metil Oranj, Fenolftalein Renkleri",
                "outcome": "F.8.4.4.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-4-20",
                "title": "Doğal Ayıraçlar (Kırmızı Lahana Suyu Deneyleri)",
                "outcome": "F.8.4.4.1",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-4-21",
                "title": "pH Ölçeği (0-7 Arası Asit, 7 Nötr, 7-14 Arası Baz) ve Kuvvetlilik",
                "outcome": "F.8.4.4.2",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-4-22",
                "title": "Nötralleşme Tepkimesi: Asit + Baz → Tuz + Su",
                "outcome": "F.8.4.4.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-4-23",
                "title": "Asit ve Bazların Metaller, Mermer, Cam ve Porselen Üzerindeki Etkileri",
                "outcome": "F.8.4.4.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-4-24",
                "title": "Asit ve Bazlarla Çalışırken Güvenlik Önlemleri ve Ambalaj Piktogramları",
                "outcome": "F.8.4.4.3",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-4-25",
                "title": "Asit Yağmurlarının Oluşumu (SO2, NO2, CO2 Gazları) ve Çevresel Etkileri",
                "outcome": "F.8.4.4.4",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme"
              }
            ]
          },
          {
            "topicTitle": "Maddenin Isı ile Etkileşimi & Türkiye'de Kimya Endüstrisi",
            "subtopics": [
              {
                "id": "FEN-8-4-26",
                "title": "Isı ile Sıcaklık Arasındaki Temel Farklar",
                "outcome": "F.8.4.5.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "FEN-8-4-27",
                "title": "Öz Isı (c) Tanımı ve Maddeler İçin Ayırt Edici Özellik Olması",
                "outcome": "F.8.4.5.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-4-28",
                "title": "Kütleleri Eşit Farklı Maddelerin Eşit Isıtılması ve Sıcaklık Artışı Deneyleri",
                "outcome": "F.8.4.5.1",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-4-29",
                "title": "Öz Isının Günlük Hayattaki Etkileri (Deniz ve Karaların Isınması)",
                "outcome": "F.8.4.5.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-4-30",
                "title": "Saf Maddelerde Erime Isısı (Le) ve Donma Isısı (Ld)",
                "outcome": "F.8.4.5.2",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-4-31",
                "title": "Saf Maddelerde Buharlaşma Isısı (Lb) ve Yoğuşma Isısı (Ly)",
                "outcome": "F.8.4.5.2",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-4-32",
                "title": "Saf Maddelerin Isınma ve Soğuma Grafikleri (Hâl Değişim Platoları)",
                "outcome": "F.8.4.5.3",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              },
              {
                "id": "FEN-8-4-33",
                "title": "Hâl Değişiminin Günlük Hayat Uygulamaları (Karpuz kesme, testide su, buzlanmaya tuz)",
                "outcome": "F.8.4.5.3",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-4-34",
                "title": "Türkiye'de Kimya Endüstrisinin Gelişimi, İthalat ve İhracat Dengesi",
                "outcome": "F.8.4.6.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-4-35",
                "title": "Kimya Endüstrisindeki Meslek Dalları ve Öncü Kuruluşlar (MKE, TÜBİTAK MAM)",
                "outcome": "F.8.4.6.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-8-U5",
        "unitTitle": "5. Ünite: Basit Makineler",
        "topics": [
          {
            "topicTitle": "Basit Makineler",
            "subtopics": [
              {
                "id": "FEN-8-5-1",
                "title": "Basit Makinelerin Sağladığı Kolaylıklar ve Temel İlkeleri",
                "outcome": "F.8.5.1.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-5-2",
                "title": "Kuvvet Kazancı ve Yoldan Kayıp Prensibi",
                "outcome": "F.8.5.1.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-5-3",
                "title": "İşten ve Enerjiden Kazanç Yoktur İlkesi (İş = Kuvvet x Yol)",
                "outcome": "F.8.5.1.1",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-5-4",
                "title": "Kaldıraçlar: Desteğin Arada Olduğu Sistemler (Makas, Pense, Tahterevalli)",
                "outcome": "F.8.5.1.2",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-5-5",
                "title": "Kaldıraçlar: Yükün Arada Olduğu Sistemler (El Arabası, Fındık Kıracağı)",
                "outcome": "F.8.5.1.2",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-5-6",
                "title": "Kaldıraçlar: Kuvvetin Arada Olduğu Sistemler (Cımbız, Maşa, Kürek)",
                "outcome": "F.8.5.1.2",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-5-7",
                "title": "Kaldıraçlarda Denge Bağıntısı (Kuvvet x Kuvvet Kolu = Yük x Yük Kolu)",
                "outcome": "F.8.5.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-5-8",
                "title": "Sabit Makaralar: Kuvvetin Yönünü Değiştirme ve Kuvvet Kazancı Olmaması",
                "outcome": "F.8.5.1.3",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-5-9",
                "title": "Hareketli Makaralar: 2 Kat Kuvvet Kazancı ve İp Çekilme Mesafesi",
                "outcome": "F.8.5.1.3",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-5-10",
                "title": "Palangalar: Makara Sayısı ve İp Yönüne Göre Kuvvet Hesabı",
                "outcome": "F.8.5.1.3",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-5-11",
                "title": "Eğik Düzlem: Boy (L) ve Yükseklik (h) Oranıyla Kuvvet Kazancı",
                "outcome": "F.8.5.1.4",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-5-12",
                "title": "Çıkrık Sistemi: Yarıçaplar Oranı ve Gerçek Hayat Örnekleri (Kuyu, Tornavida, Direksiyon)",
                "outcome": "F.8.5.1.5",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-5-13",
                "title": "Dişli Çarklar: Dönme Yönleri ve Tur Sayısı (Yarıçap ile Ters Orantı)",
                "outcome": "F.8.5.1.6",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-5-14",
                "title": "Kasnaklar: Düz ve Çapraz Bağlantı Sistemleri",
                "outcome": "F.8.5.1.6",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-5-15",
                "title": "Vida ve Eğik Düzlem İlişkisi, Vida Adımı Mantığı",
                "outcome": "F.8.5.1.7",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-5-16",
                "title": "Bileşik Makineler (Bisiklet, Olta vb.) Çok Bileşenli Mekanizma Analizi",
                "outcome": "F.8.5.1.8",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-8-U6",
        "unitTitle": "6. Ünite: Enerji Dönüşümleri ve Çevre Bilimi",
        "topics": [
          {
            "topicTitle": "Besin Zinciri ve Enerji Akışı",
            "subtopics": [
              {
                "id": "FEN-8-6-1",
                "title": "Üreticiler, Tüketiciler (Otçul, Etçil, Hepçil) ve Ayrıştırıcılar",
                "outcome": "F.8.6.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "FEN-8-6-2",
                "title": "Besin Ağı ve Zincirindeki Birey Sayısı Değişimlerinin Etkileri",
                "outcome": "F.8.6.1.1",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-6-3",
                "title": "Ekolojik Piramidin Basamakları (Trofik Düzeyler)",
                "outcome": "F.8.6.1.2",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-6-4",
                "title": "Besin Piramidinde Yukarı Çıkıldıkça Değişen Özellikler (%10 Enerji Kuralı)",
                "outcome": "F.8.6.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-6-5",
                "title": "Biyolojik Birikim (Zehirli Madde Miktarı) ve Biyokütle Değişimi",
                "outcome": "F.8.6.1.2",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              }
            ]
          },
          {
            "topicTitle": "Fotosentez ve Solunum",
            "subtopics": [
              {
                "id": "FEN-8-6-6",
                "title": "Fotosentez Olayı, Klorofil ve Işık Enerjisinin Kimyasal Enerjiye Dönüşümü",
                "outcome": "F.8.6.2.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-6-7",
                "title": "Fotosentez Denklemi (CO2 + H2O + Işık → Glikoz + O2)",
                "outcome": "F.8.6.2.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-6-8",
                "title": "Fotosentez Hızını Etkileyen Çevresel Faktörler: Işık Şiddeti, Rengi, CO2, Sıcaklık",
                "outcome": "F.8.6.2.2",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              },
              {
                "id": "FEN-8-6-9",
                "title": "Oksijenli Solunum (Mitokondri) ve ATP Enerjisi Üretimi",
                "outcome": "F.8.6.2.3",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-6-10",
                "title": "Oksijensiz Solunum ve Fermantasyon Çeşitleri (Etil Alkol ve Laktik Asit)",
                "outcome": "F.8.6.2.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-6-11",
                "title": "Fotosentez ile Solunum Arasındaki Karşılıklı Ekolojik Denge",
                "outcome": "F.8.6.2.4",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              }
            ]
          },
          {
            "topicTitle": "Madde Döngüleri ve Sürdürülebilirlik",
            "subtopics": [
              {
                "id": "FEN-8-6-12",
                "title": "Su Döngüsü ve Aşamaları (Buharlaşma, Yoğuşma, Yağış, Yeraltı Suyu)",
                "outcome": "F.8.6.3.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-6-13",
                "title": "Karbon ve Oksijen Döngüleri",
                "outcome": "F.8.6.3.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-6-14",
                "title": "Azot Döngüsü (Yıldırım/Şimşek, Azot Bağlayıcı Bakteriler, Ayrıştırıcılar)",
                "outcome": "F.8.6.3.1",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-6-15",
                "title": "Ozon Tabakasının İncelmesi, Nedenleri (CFC Gazları) ve Etkileri",
                "outcome": "F.8.6.3.2",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-6-16",
                "title": "Ekolojik Ayak İzi ve Karbon Ayak İzi Hesaplama Bilinci",
                "outcome": "F.8.6.3.3",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme"
              },
              {
                "id": "FEN-8-6-17",
                "title": "Sürdürülebilir Kalkınma, Geri Dönüşüm ve Gelecek Nesillere Kaynak Aktarımı",
                "outcome": "F.8.6.3.4",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-8-U7",
        "unitTitle": "7. Ünite: Elektrik Yükleri ve Elektrik Enerjisi",
        "topics": [
          {
            "topicTitle": "Elektrik Yükleri ve Elektriklenme",
            "subtopics": [
              {
                "id": "FEN-8-7-1",
                "title": "Atomun Yapısı, Pozitif ve Negatif Yükler",
                "outcome": "F.8.7.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "FEN-8-7-2",
                "title": "Sürtünme ile Elektriklenme (Ebonit-Yün, Cam-İpek Çubuklar)",
                "outcome": "F.8.7.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-7-3",
                "title": "Dokunma ile Elektriklenme ve Yük Dağılımı",
                "outcome": "F.8.7.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-7-4",
                "title": "Etki (Tesir) ile Elektriklenme ve Yük Kutuplanması",
                "outcome": "F.8.7.1.1",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-7-5",
                "title": "Yüklü Cisimlerin Birbirine Kuvveti (Aynı Yükler İter, Zıt Yükler Çeker)",
                "outcome": "F.8.7.1.2",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-7-6",
                "title": "Nötr Cisimlerin Yüklü Cisimler Tarafından Çekilmesi İlkesi",
                "outcome": "F.8.7.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-7-7",
                "title": "Elektroskop: Yapısı, Görevi ve Yaprakların Açılma/Kapanma Durumları",
                "outcome": "F.8.7.1.3",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-7-8",
                "title": "Topraklama Olayı, Cisimlerin Nötrleşmesi ve Güvenlik",
                "outcome": "F.8.7.1.4",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-7-9",
                "title": "Doğada Elektrik Boşalması: Şimşek, Yıldırım ve Paratoner",
                "outcome": "F.8.7.1.5",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              }
            ]
          },
          {
            "topicTitle": "Elektrik Enerjisinin Dönüşümü",
            "subtopics": [
              {
                "id": "FEN-8-7-10",
                "title": "Elektrik Enerjisinin Isı Enerjisine Dönüşümü (Direnç teli, su ısıtıcı)",
                "outcome": "F.8.7.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-8-7-11",
                "title": "Elektrik Enerjisinin Işık Enerjisine Dönüşümü (Akkor filamanlı lamba, LED)",
                "outcome": "F.8.7.2.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-7-12",
                "title": "Elektrik Enerjisinin Hareket Enerjisine Dönüşümü: Elektrik Motoru Prensibi",
                "outcome": "F.8.7.2.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-7-13",
                "title": "Hareket Enerjisinin Elektrik Enerjisine Dönüşümü: Jeneratör (Dinamo) Prensibi",
                "outcome": "F.8.7.2.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-8-7-14",
                "title": "Güç Santralleri: Hidroelektrik, Termik, Rüzgâr, Jeotermal, Nükleer",
                "outcome": "F.8.7.2.3",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "FEN-8-7-15",
                "title": "Elektrik Enerjisinin Bilinçli Kullanımı, Kısa Devre ve Sigortanın Önemi",
                "outcome": "F.8.7.2.4",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme"
              }
            ]
          }
        ]
      }
    ]
  },
  "turkce": {
    "courseName": "Türkçe",
    "grade": 8,
    "totalUnits": 5,
    "units": [
      {
        "unitId": "TR-8-U1",
        "unitTitle": "1. Öğrenme Alanı: Sözcük ve Cümlede Anlam",
        "topics": [
          {
            "topicTitle": "Sözcükte Anlam ve Söz Grupları",
            "subtopics": [
              {
                "id": "TR-8-1-1",
                "title": "Gerçek (Temel) Anlam ve Sözlük Tanımı",
                "outcome": "T.8.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "TR-8-1-2",
                "title": "Mecaz Anlam ve Cümledeki Bağlamsal Anlamı",
                "outcome": "T.8.1.1",
                "cognitive": "Uygulama",
                "bloom": "Anlama"
              },
              {
                "id": "TR-8-1-3",
                "title": "Terim Anlam (Bilim, Sanat, Meslek Kavramları)",
                "outcome": "T.8.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "TR-8-1-4",
                "title": "Eş Anlamlı (Anlamdaş) ve Zıt (Karşıt) Anlamlı Sözcükler",
                "outcome": "T.8.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "TR-8-1-5",
                "title": "Eş Sesli (Sesteş) Sözcükler ve Ayrımı",
                "outcome": "T.8.1.2",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "TR-8-1-6",
                "title": "Somut ve Soyut Anlamlı Sözcükler (Somutlaştırma/Soyutlaştırma)",
                "outcome": "T.8.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-1-7",
                "title": "Nitel ve Nicel Anlamlı Sözcükler",
                "outcome": "T.8.1.2",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "TR-8-1-8",
                "title": "Yansıma Sözcükler ve Cümledeki Görevleri",
                "outcome": "T.8.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "TR-8-1-9",
                "title": "İkilemeler ve Farklı Oluşum Yolları",
                "outcome": "T.8.1.2",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-1-10",
                "title": "Deyimler, Anlam Özellikleri ve Kalıplaşmış Yapıları",
                "outcome": "T.8.1.3",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-1-11",
                "title": "Atasözleri, Özellikleri ve Doğrudan/Mecazi Anlam Ayrımı",
                "outcome": "T.8.1.3",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-1-12",
                "title": "Özdeyişler (Vecizeler) ve Tematik Mesajları",
                "outcome": "T.8.1.3",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "TR-8-1-13",
                "title": "Kalıplaşmamış Söz Öbeklerinin Cümleye Kattığı Anlam (LGS 1. Soru Tipi)",
                "outcome": "T.8.1.4",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-1-14",
                "title": "Cümleye Uygun Sözcük/Söz Öbeği Yerleştirme ve Boşluk Doldurma",
                "outcome": "T.8.1.4",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              }
            ]
          },
          {
            "topicTitle": "Cümlede Anlam İlişkileri",
            "subtopics": [
              {
                "id": "TR-8-1-15",
                "title": "Öznel ve Nesnel Yargılar (Kanıtlanabilirlik Açısından Cümleler)",
                "outcome": "T.8.1.5",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "TR-8-1-16",
                "title": "Neden-Sonuç (Gerekçe) Bildiren Cümleler",
                "outcome": "T.8.1.6",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-1-17",
                "title": "Amaç-Sonuç Bildiren Cümleler ve 'İçin' Ayrımı",
                "outcome": "T.8.1.6",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-1-18",
                "title": "Koşul-Sonuç (Şart) Cümleleri",
                "outcome": "T.8.1.6",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-1-19",
                "title": "Karşılaştırma Bildiren Cümleler",
                "outcome": "T.8.1.6",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "TR-8-1-20",
                "title": "Örtülü Anlam Çıkarımı ('De' bağlacı, 'en', 'daha' gibi ifadeler)",
                "outcome": "T.8.1.7",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-1-21",
                "title": "Tanım Cümleleri ('Bu nedir?' sorusunun cevabı)",
                "outcome": "T.8.1.7",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "TR-8-1-22",
                "title": "Doğrudan ve Dolaylı Anlatım Cümleleri",
                "outcome": "T.8.1.7",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-1-23",
                "title": "Cümledeki Duygu ve Düşünceler: Ön yargı, Varsayım, Olasılık, Kesinlik",
                "outcome": "T.8.1.8",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-1-24",
                "title": "Cümledeki Duygu ve Düşünceler: Öneri, Eleştiri, Öz Eleştiri",
                "outcome": "T.8.1.8",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-1-25",
                "title": "Cümledeki Duygu ve Düşünceler: Pişmanlık, Hayıflanma, Sitem, Yakınma",
                "outcome": "T.8.1.8",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-1-26",
                "title": "Cümledeki Duygu ve Düşünceler: Azımsama vs Küçümseme Ayrımı",
                "outcome": "T.8.1.8",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-1-27",
                "title": "Eş Anlamlı ve Yakın Anlamlı Cümle Eşleştirmeleri",
                "outcome": "T.8.1.9",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-1-28",
                "title": "Anlamca Çelişen Cümleleri Tespit Etme",
                "outcome": "T.8.1.9",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-1-29",
                "title": "Karışık Sözcüklerden Anlamlı ve Kurallı Cümle Oluşturma",
                "outcome": "T.8.1.10",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TR-8-U2",
        "unitTitle": "2. Öğrenme Alanı: Paragrafta Anlam ve Yapı",
        "topics": [
          {
            "topicTitle": "Paragrafta Anlam",
            "subtopics": [
              {
                "id": "TR-8-2-1",
                "title": "Paragrafın Konusu ve Başlığı Belirleme",
                "outcome": "T.8.3.14",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "TR-8-2-2",
                "title": "Paragrafın Ana Düşüncesi (Ana Fikir) ve Vurgulanan Mesaj",
                "outcome": "T.8.3.14",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-2-3",
                "title": "Paragrafta Yardımcı Düşünceler ('Değinilmemiştir / Çıkarılamaz')",
                "outcome": "T.8.3.15",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-2-4",
                "title": "Paragrafta Bir Soruya Karşılık Yazılmış Olma Durumu",
                "outcome": "T.8.3.15",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-2-5",
                "title": "Paragraftan Çıkarılabilecek / Çıkarılamayacak Yargılar",
                "outcome": "T.8.3.15",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-2-6",
                "title": "Metindeki Kahramanın Kişilik ve Karakter Özellikleri",
                "outcome": "T.8.3.16",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "TR-8-2-7",
                "title": "Metnin Hissiyatı, Duygu Dünyası ve Tonu",
                "outcome": "T.8.3.16",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              }
            ]
          },
          {
            "topicTitle": "Paragrafın Yapısı",
            "subtopics": [
              {
                "id": "TR-8-2-8",
                "title": "Paragrafın Giriş, Gelişme ve Sonuç Cümleleri Özellikleri",
                "outcome": "T.8.3.16",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "TR-8-2-9",
                "title": "Paragrafta Boş Bırakılan Yere Uygun Cümle Getirme",
                "outcome": "T.8.3.16",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-2-10",
                "title": "Düşüncenin Akışını Bozan Cümleyi Bulma",
                "outcome": "T.8.3.17",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-2-11",
                "title": "Paragrafı İki Parçaya Bölme (Farklı Bir Konuya Geçiş Noktası)",
                "outcome": "T.8.3.17",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-2-12",
                "title": "Paragrafta Cümlelerin Mantıksal Sıralaması",
                "outcome": "T.8.3.17",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-2-13",
                "title": "Paragrafta Numaralanmış Cümlelerin Yerini Değiştirme",
                "outcome": "T.8.3.17",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-2-14",
                "title": "İki Farklı Metni Karşılaştırma (Ortak ve Farklı Yönler)",
                "outcome": "T.8.3.33",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              },
              {
                "id": "TR-8-2-15",
                "title": "Diyalog Tamamlama (Gazeteci-Yazar / Mülakat Soruları)",
                "outcome": "T.8.3.34",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TR-8-U3",
        "unitTitle": "3. Öğrenme Alanı: Metin Türleri, Söz Sanatları ve Anlatım Biçimleri",
        "topics": [
          {
            "topicTitle": "Metin Türleri",
            "subtopics": [
              {
                "id": "TR-8-3-1",
                "title": "Olay Yazıları: Hikâye (Öykü) ve Unsurları (Olay, Kişi, Yer, Zaman)",
                "outcome": "T.8.3.23",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "TR-8-3-2",
                "title": "Olay Yazıları: Masal, Fabl, Destan ve Efsane Özellikleri",
                "outcome": "T.8.3.23",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "TR-8-3-3",
                "title": "Düşünce Yazıları: Makale (Kanıtlama Amacı, Bilimsel Dil)",
                "outcome": "T.8.3.23",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-3-4",
                "title": "Düşünce Yazıları: Deneme (Ben Üslubu, Öznel Görüşler)",
                "outcome": "T.8.3.23",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-3-5",
                "title": "Düşünce Yazıları: Fıkra (Köşe Yazısı - Güncel Olaylar)",
                "outcome": "T.8.3.23",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-3-6",
                "title": "Düşünce Yazıları: Söyleşi (Sohbet - Okurla Konuşuyormuş Gibi)",
                "outcome": "T.8.3.23",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "TR-8-3-7",
                "title": "Bildirme Yazıları: Biyografi (Yaşam Öyküsü) ve Otobiyografi (Öz Yaşam Öyküsü)",
                "outcome": "T.8.3.24",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "TR-8-3-8",
                "title": "Bildirme Yazıları: Anı (Hatıra), Günlük (Günce) ve Gezi Yazısı",
                "outcome": "T.8.3.24",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "TR-8-3-9",
                "title": "Şiirde Tema, Ana Duygu, Şairin Bakış Açısı ve Dize Analizi",
                "outcome": "T.8.3.25",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              }
            ]
          },
          {
            "topicTitle": "Söz Sanatları",
            "subtopics": [
              {
                "id": "TR-8-3-10",
                "title": "Teşbih (Benzetme): Benzeyen, Kendisine Benzetilen, Benzetme Yönü/Edatı",
                "outcome": "T.8.3.25",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-3-11",
                "title": "Teşhis (Kişileştirme): İnsana Ait Niteliklerin Doğaya Aktarımı",
                "outcome": "T.8.3.25",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-3-12",
                "title": "İntak (Konuşturma): İnsan Dışı Varlıkların Konuşturulması",
                "outcome": "T.8.3.25",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "TR-8-3-13",
                "title": "Tezat (Karşıtlık): Anlamca Birbirine Zıt Kavramların Birlikteliği",
                "outcome": "T.8.3.25",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-3-14",
                "title": "Mübalağa (Abartma): Durumun Olduğundan Çok Fazla veya Az Gösterilmesi",
                "outcome": "T.8.3.25",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              }
            ]
          },
          {
            "topicTitle": "Anlatım Biçimleri ve Düşünceyi Geliştirme Yolları",
            "subtopics": [
              {
                "id": "TR-8-3-15",
                "title": "Öyküleyici Anlatım (Öyküleme - Olay İçinde Yaşatma)",
                "outcome": "T.8.3.19",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "TR-8-3-16",
                "title": "Betimleyici Anlatım (Betimleme - Sözcüklerle Resim Çizme)",
                "outcome": "T.8.3.19",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "TR-8-3-17",
                "title": "Açıklayıcı Anlatım (Açıklama - Bilgi Verme Amacı)",
                "outcome": "T.8.3.19",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "TR-8-3-18",
                "title": "Tartışmacı Anlatım (Tartışma - Fikri Değiştirme Amacı)",
                "outcome": "T.8.3.19",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-3-19",
                "title": "Tanımlama ('Bu nedir?' Tanım Cümleleri)",
                "outcome": "T.8.3.18",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "TR-8-3-20",
                "title": "Örnekleme (Soyut Düşünceyi Somut Örneklerle Destekleme)",
                "outcome": "T.8.3.18",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-3-21",
                "title": "Tanık Gösterme (Uzmanın Adı ve Doğrudan Sözünü Aktarma)",
                "outcome": "T.8.3.18",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-3-22",
                "title": "Sayısal Verilerden Yararlanma (İstatistiki ve Sayısal Kanıtlar)",
                "outcome": "T.8.3.18",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "TR-8-3-23",
                "title": "Karşılaştırma ve Benzetme Yolları",
                "outcome": "T.8.3.18",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TR-8-U4",
        "unitTitle": "4. Öğrenme Alanı: Dil Bilgisi",
        "topics": [
          {
            "topicTitle": "Fiilimsiler (Eylemsiler)",
            "subtopics": [
              {
                "id": "TR-8-4-1",
                "title": "Fiilimsi Kavramı, Fiilden Türeme ve Çekimli Fiilden Farkı",
                "outcome": "T.8.3.9",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "TR-8-4-2",
                "title": "İsim-Fiiller (Mastar: -ma/-me, -ış/-iş, -mak/-mek)",
                "outcome": "T.8.3.9",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-4-3",
                "title": "Kalıcı İsim vs İsim-Fiil Ayrımı (Çakmak, dondurma, ekmek vb.)",
                "outcome": "T.8.3.9",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-4-4",
                "title": "Sıfat-Fiiller (Ortaç: -an, -ası, -mez, -ar, -dik, -ecek, -miş)",
                "outcome": "T.8.3.10",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-4-5",
                "title": "Zaman Eki ile Sıfat-Fiil Eki Karışıklığını Çözme (-ecek, -miş, -ar)",
                "outcome": "T.8.3.10",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-4-6",
                "title": "Adlaşmış Sıfat-Fiil ve Nitelediği İsmin Düşmesi",
                "outcome": "T.8.3.10",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-4-7",
                "title": "Zarf-Fiiller (Bağ-Fiil / Ulaç: -ken, -alı, -ince, -ip, -erek vb.)",
                "outcome": "T.8.3.11",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-4-8",
                "title": "Zarf-Fiillerin Cümleye Kattığı Anlamlar: Durum vs Zaman",
                "outcome": "T.8.3.11",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              }
            ]
          },
          {
            "topicTitle": "Cümlenin Ögeleri",
            "subtopics": [
              {
                "id": "TR-8-4-9",
                "title": "Temel Ögeler: Yüklem ve Özellikleri (Çekimli Fiil ya da Ek Fiil Almış İsim)",
                "outcome": "T.8.3.20",
                "cognitive": "Kavrama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-4-10",
                "title": "Temel Ögeler: Özne Türleri (Gerçek Özne, Gizli Özne, Sözde Özne)",
                "outcome": "T.8.3.20",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-4-11",
                "title": "Söz Öbeklerinin (Tamlamalar, Deyimler) Bölünmezliği Kuralı",
                "outcome": "T.8.3.20",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-4-12",
                "title": "Yardımcı Ögeler: Nesne (Belirtili Nesne: Neyi, Kimi; Belirtisiz: Ne)",
                "outcome": "T.8.3.21",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-4-13",
                "title": "Yardımcı Ögeler: Yer Tamlayıcısı (Dolaylı Tümleç - Kime, Nerede, Nereden)",
                "outcome": "T.8.3.21",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-4-14",
                "title": "Yardımcı Ögeler: Zarf Tamlayıcısı (Zarf Tümleci - Nasıl, Ne Zaman, Niçin)",
                "outcome": "T.8.3.21",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-4-15",
                "title": "Cümle Dışı Unsurlar (Hitaplar, Ünlemler, Ara Sözler)",
                "outcome": "T.8.3.22",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "TR-8-4-16",
                "title": "Cümlede Vurgulanan Ögeyi Bulma",
                "outcome": "T.8.3.22",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-4-17",
                "title": "Cümle Ögeleri Dizilişi ve Çözümleme Eşleştirmeleri",
                "outcome": "T.8.3.21",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              }
            ]
          },
          {
            "topicTitle": "Fiilde Çatı",
            "subtopics": [
              {
                "id": "TR-8-4-18",
                "title": "İsim Cümlelerinde Çatı Özelliği Aranmaz Kuralı",
                "outcome": "T.8.3.26",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "TR-8-4-19",
                "title": "Öznesine Göre Fiil Çatısı: Etken Fiil (Gerçek/Gizli Özneli)",
                "outcome": "T.8.3.26",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-4-20",
                "title": "Öznesine Göre Fiil Çatısı: Edilgen Fiil (-l, -n Ekleri ve Sözde Özne)",
                "outcome": "T.8.3.26",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-4-21",
                "title": "Nesnesine Göre Fiil Çatısı: Geçişli Fiil ('Onu' Sözcüğü Alan)",
                "outcome": "T.8.3.27",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-4-22",
                "title": "Nesnesine Göre Fiil Çatısı: Geçişsiz Fiil ('Onu' Sözcüğü Almayan)",
                "outcome": "T.8.3.27",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              }
            ]
          },
          {
            "topicTitle": "Cümle Türleri",
            "subtopics": [
              {
                "id": "TR-8-4-23",
                "title": "Yükleminin Türüne Göre: İsim (Ad) ve Fiil (Eylem) Cümleleri",
                "outcome": "T.8.3.28",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "TR-8-4-24",
                "title": "Yükleminin Yerine Göre: Kurallı (Düz), Devrik ve Eksiltili Cümleler",
                "outcome": "T.8.3.28",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "TR-8-4-25",
                "title": "Anlamına Göre: Olumlu, Olumsuz, Soru ve Ünlem Cümleleri",
                "outcome": "T.8.3.28",
                "cognitive": "Uygulama",
                "bloom": "Anlama"
              },
              {
                "id": "TR-8-4-26",
                "title": "Biçimce Olumsuz Anlamca Olumlu / Biçimce Olumlu Anlamca Olumsuz Cümleler",
                "outcome": "T.8.3.28",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-4-27",
                "title": "Yapısına Göre Cümleler: Tek Yüklemli (Basit) Cümle",
                "outcome": "T.8.3.29",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "TR-8-4-28",
                "title": "Yapısına Göre Cümleler: Fiilimsi Bulunan (Girişik Birleşik) Cümle",
                "outcome": "T.8.3.29",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-4-29",
                "title": "Yapısına Göre Cümleler: Birden Çok Yüklemli (Sıralı) Cümle (Bağımlı-Bağımsız)",
                "outcome": "T.8.3.29",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-4-30",
                "title": "Yapısına Göre Cümleler: Bağlacı Olan (Bağlı) Cümle",
                "outcome": "T.8.3.29",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TR-8-U5",
        "unitTitle": "5. Öğrenme Alanı: Yazım, Noktalama, Anlatım Bozukluğu ve Sözel Mantık",
        "topics": [
          {
            "topicTitle": "Yazım Kuralları ve Noktalama",
            "subtopics": [
              {
                "id": "TR-8-5-1",
                "title": "Büyük Harflerin Kullanımı (Kişi, Yer, Kurum, Tarihî Olaylar)",
                "outcome": "T.8.4.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-5-2",
                "title": "Sayıların, Tarihlerin ve Saatlerin Yazımı (Rakamla vs Yazıyla)",
                "outcome": "T.8.4.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-5-3",
                "title": "'de / da' Bağlacı ve Hâl Ekinin Yazımı",
                "outcome": "T.8.4.2",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-5-4",
                "title": "'ki' Bağlacı, Sıfat Yapan '-ki' ve İlgi Zamiri '-ki'nin Yazımı",
                "outcome": "T.8.4.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-5-5",
                "title": "Soru Eki 'mı / mi / mu / mü'nün Yazımı",
                "outcome": "T.8.4.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "TR-8-5-6",
                "title": "Birleşik Sözcüklerin Yazımı (Bitişik vs Ayrı Yazılanlar)",
                "outcome": "T.8.4.1",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-5-7",
                "title": "Kısaltmaların Yazımı ve Eklerin Ayrılması (TDK Kuralı)",
                "outcome": "T.8.4.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-5-8",
                "title": "Virgülün (,) Görevleri ve Yanlış Kullanımları",
                "outcome": "T.8.4.3",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-5-9",
                "title": "Noktalı Virgül (;) ile İki Nokta (:) Arasındaki Ayrım",
                "outcome": "T.8.4.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-5-10",
                "title": "Nokta, Üç Nokta, Soru ve Ünlem İşaretleri",
                "outcome": "T.8.4.3",
                "cognitive": "Kavrama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-5-11",
                "title": "Tırnak İşareti, Kısa Çizgi, Yay Ayraç",
                "outcome": "T.8.4.4",
                "cognitive": "Kavrama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-5-12",
                "title": "Kesme İşareti (') ve Kurum/Kuruluş Ek İstisnası Kuralı",
                "outcome": "T.8.4.4",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              }
            ]
          },
          {
            "topicTitle": "Anlatım Bozuklukları",
            "subtopics": [
              {
                "id": "TR-8-5-13",
                "title": "Gereksiz Sözcük Kullanımı (Eş Anlamlıların Birlikte Kullanılması)",
                "outcome": "T.8.4.5",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-5-14",
                "title": "Sözcüğün Yanlış Anlamda Kullanılması (Yakın Anlamlı Sözcük Tuzağı)",
                "outcome": "T.8.4.5",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-5-15",
                "title": "Birbiriyle Çelişen Sözlerin Birlikte Kullanılması (Olasılık vs Kesinlik)",
                "outcome": "T.8.4.5",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-5-16",
                "title": "Sözcüğün Yanlış Yerde Kullanılması",
                "outcome": "T.8.4.5",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-5-17",
                "title": "Anlam Belirsizliği (Zamir Eksikliği veya Virgül Eksikliği)",
                "outcome": "T.8.4.5",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-5-18",
                "title": "Deyim ve Atasözü Yanlışlıkları (Kalıbın veya Anlamın Bozulması)",
                "outcome": "T.8.4.5",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TR-8-5-19",
                "title": "Mantık ve Sıralama Hataları",
                "outcome": "T.8.4.5",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              }
            ]
          },
          {
            "topicTitle": "Sözel Mantık ve Görsel Okuma",
            "subtopics": [
              {
                "id": "TR-8-5-20",
                "title": "Sıralama ve Derecelendirme Mantık Soruları (Kronolojik, Puan, Sıra)",
                "outcome": "T.8.3.30",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme"
              },
              {
                "id": "TR-8-5-21",
                "title": "Eşleştirme ve Çok Değişkenli Tablo Oluşturma Mantık Soruları",
                "outcome": "T.8.3.31",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              },
              {
                "id": "TR-8-5-22",
                "title": "Konum, Kroki ve Yön Bilgisi Çözümleme",
                "outcome": "T.8.3.31",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-5-23",
                "title": "Şifreleme, Algoritma ve Kural Takibi Soruları",
                "outcome": "T.8.3.31",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              },
              {
                "id": "TR-8-5-24",
                "title": "İnfografik, Afiş ve Karikatür Yorumlama",
                "outcome": "T.8.3.32",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "TR-8-5-25",
                "title": "Pasta, Sütun ve Çizgi Grafiklerinden Sözel Yargı Çıkarma",
                "outcome": "T.8.3.32",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              }
            ]
          }
        ]
      }
    ]
  },
  "sosyal": {
    "courseName": "T.C. İnkılap Tarihi ve Atatürkçülük",
    "grade": 8,
    "totalUnits": 7,
    "units": [
      {
        "unitId": "ITA-8-U1",
        "unitTitle": "1. Ünite: Bir Kahraman Doğuyor",
        "topics": [
          {
            "topicTitle": "20. Yüzyıl Başlarında Osmanlı ve Mustafa Kemal'in Yetiştiği Ortam",
            "subtopics": [
              {
                "id": "ITA-8-1-1",
                "title": "Sanayi İnkılabı, Sömürgecilik Yarışı ve Osmanlı Ekonomisine Etkileri",
                "outcome": "İTA.8.1.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-1-2",
                "title": "Fransız İhtilali, Milliyetçilik Akımı ve Osmanlı'da Azınlık İsyanları",
                "outcome": "İTA.8.1.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-1-3",
                "title": "Osmanlı'yı Dağılmaktan Kurtarma Akımları: Osmanlıcılık, İslamcılık, Türkçülük, Batıcılık",
                "outcome": "İTA.8.1.1",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-1-4",
                "title": "Mustafa Kemal'in Çocukluğu ve Selanik Şehrinin Kültürel/Ekonomik Yapısı",
                "outcome": "İTA.8.1.2",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-1-5",
                "title": "Mustafa Kemal'in Aile Ortamı ve Okul Seçimindeki Kararlılığı",
                "outcome": "İTA.8.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "ITA-8-1-6",
                "title": "Öğrenim Gördüğü Okullar: Mahalle Mektebi ve Şemsi Efendi Mektebi",
                "outcome": "İTA.8.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "ITA-8-1-7",
                "title": "Öğrenim Gördüğü Okullar: Selanik Mülkiye ve Askerî Rüştiyeleri (Kemal Adının Verilişi)",
                "outcome": "İTA.8.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "ITA-8-1-8",
                "title": "Öğrenim Gördüğü Okullar: Manastır Askerî İdadisi ve Fikir Hayatının Şekillenmesi",
                "outcome": "İTA.8.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-1-9",
                "title": "Öğrenim Gördüğü Okullar: İstanbul Harp Okulu ve Harp Akademisi Yılları",
                "outcome": "İTA.8.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "ITA-8-1-10",
                "title": "Mustafa Kemal'i Etkileyen Türk Yazarlar (Ziya Gökalp, Namık Kemal, M. Emin Yurdakul, Tevfik Fikret)",
                "outcome": "İTA.8.1.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-1-11",
                "title": "Mustafa Kemal'i Etkileyen Yabancı Aydınlar (Montesquieu, Rousseau, Voltaire)",
                "outcome": "İTA.8.1.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-1-12",
                "title": "İlk Görev Yeri: Şam 5. Ordu ve Vatan ve Hürriyet Cemiyeti (Liderlik/Teşkilatçılık)",
                "outcome": "İTA.8.1.4",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-1-13",
                "title": "31 Mart Vakası ve Hareket Ordusu Kurmay Başkanlığı Rolü",
                "outcome": "İTA.8.1.4",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-1-14",
                "title": "Trablusgarp Savaşı (1911): Örgütleyicilik, Yerli Halkı Teşkilatlandırma ve İlk Askerî Başarı",
                "outcome": "İTA.8.1.4",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-1-15",
                "title": "Balkan Savaşları (I. ve II.) ve Mustafa Kemal'in Askerî Gözlemleri",
                "outcome": "İTA.8.1.4",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-1-16",
                "title": "Sofya Askerî Ataşemiliterliği Dönemi ve Diplomasi Deneyimi",
                "outcome": "İTA.8.1.4",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-1-17",
                "title": "Mustafa Kemal'in Kişilik Özellikleri (Vatanseverlik, İdealistlik, İleri Görüşlülük, Çok Yönlülük)",
                "outcome": "İTA.8.1.4",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "ITA-8-U2",
        "unitTitle": "2. Ünite: Millî Uyanış: Bağımsızlık Yolunda Atılan Adımlar",
        "topics": [
          {
            "topicTitle": "I. Dünya Savaşı ve Osmanlı Devleti",
            "subtopics": [
              {
                "id": "ITA-8-2-1",
                "title": "I. Dünya Savaşı'nın Genel ve Özel Nedenleri, Bloklaşmalar",
                "outcome": "İTA.8.2.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-2-2",
                "title": "Osmanlı Devleti'nin Savaşa Giriş Süreci (Goben ve Breslau Olayı)",
                "outcome": "İTA.8.2.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-2-3",
                "title": "Taarruz Cepheleri: Kafkas Cephesi, Sarıkamış Harekâtı ve 1915 Tehcir Kanunu",
                "outcome": "İTA.8.2.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-2-4",
                "title": "Taarruz Cepheleri: Kanal Cephesi ve İngiliz Sömürge Hatları",
                "outcome": "İTA.8.2.2",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-2-5",
                "title": "Savunma Cepheleri: Çanakkale Savaşları (Conkbayırı, Anafartalar Zaferleri) ve Dünya Tarihine Etkisi",
                "outcome": "İTA.8.2.2",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-2-6",
                "title": "Savunma Cepheleri: Irak Cephesi ve Kût'ül-Amâre Zaferi",
                "outcome": "İTA.8.2.2",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-2-7",
                "title": "Hicaz-Yemen ve Suriye-Filistin Cepheleri",
                "outcome": "İTA.8.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "ITA-8-2-8",
                "title": "Yardım Cepheleri: Galiçya, Romanya, Makedonya",
                "outcome": "İTA.8.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "ITA-8-2-9",
                "title": "I. Dünya Savaşı'nın Sona Ermesi, Wilson Prensipleri ve Çelişkiler",
                "outcome": "İTA.8.2.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              }
            ]
          },
          {
            "topicTitle": "Mondros Ateşkesi, İşgaller ve Cemiyetler",
            "subtopics": [
              {
                "id": "ITA-8-2-10",
                "title": "Mondros Ateşkes Antlaşması (30 Ekim 1918) ve 7. ile 24. Maddelerin Hukuki Tahlili",
                "outcome": "İTA.8.2.3",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-2-11",
                "title": "İşgaller Karşısında İstanbul Hükûmetinin Teslimiyetçi Tutumu",
                "outcome": "İTA.8.2.3",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-2-12",
                "title": "Mustafa Kemal'in İşgallere Karşı Duruşu ('Geldikleri gibi giderler!')",
                "outcome": "İTA.8.2.3",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-2-13",
                "title": "Kuvâ-yı Millîye'nin Doğuşu, Bölgesel Direniş Ruhu ve Nitelikleri",
                "outcome": "İTA.8.2.4",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-2-14",
                "title": "Azınlıkların Kurduğu Zararlı Cemiyetler (Mavri Mira, Pontus Rum, Hınçak, Taşnak)",
                "outcome": "İTA.8.2.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "ITA-8-2-15",
                "title": "Millî Varlığa Düşman Cemiyetler (Sulh ve Selamet, Teali İslam, İngiliz Muhipleri, Wilson)",
                "outcome": "İTA.8.2.4",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-2-16",
                "title": "Millî (Yararlı) Cemiyetler (Trakya-Paşaeli, Redd-i İlhak, Kilikyalılar, Millî Kongre)",
                "outcome": "İTA.8.2.4",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              }
            ]
          },
          {
            "topicTitle": "Genelgeler ve Kongreler ile Teşkilatlanma",
            "subtopics": [
              {
                "id": "ITA-8-2-17",
                "title": "Mustafa Kemal'in Samsun'a Çıkışı (19 Mayıs 1919) ve 9. Ordu Müfettişliği Görevi",
                "outcome": "İTA.8.2.5",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-2-18",
                "title": "Havza Genelgesi (28-29 Mayıs 1919): Millî Bilincin Uyandırılması ve Protestolar",
                "outcome": "İTA.8.2.5",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-2-19",
                "title": "Amasya Genelgesi (22 Haziran 1919): Millî Mücadele'nin Amacı, Gerekçesi ve Yöntemi",
                "outcome": "İTA.8.2.6",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              },
              {
                "id": "ITA-8-2-20",
                "title": "Mustafa Kemal'in Askerlikten İstifası ve Sine-i Millete Dönüşü",
                "outcome": "İTA.8.2.6",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-2-21",
                "title": "Erzurum Kongresi (23 Temmuz - 7 Ağustos 1919): Toplanış Bölgesel, Kararları Ulusal",
                "outcome": "İTA.8.2.7",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-2-22",
                "title": "Manda ve Himayenin İlk Kez Reddi ve Temsil Heyetinin Kuruluşu",
                "outcome": "İTA.8.2.7",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-2-23",
                "title": "Sivas Kongresi (4-11 Eylül 1919): Ulusal Kongre ve Tüm Cemiyetlerin Birleştirilmesi",
                "outcome": "İTA.8.2.7",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              },
              {
                "id": "ITA-8-2-24",
                "title": "Temsil Heyetinin Yürütme Yetkisini Kullanması (Ali Fuat Paşa'nın Atanması)",
                "outcome": "İTA.8.2.7",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-2-25",
                "title": "Amasya Görüşmeleri (20-22 Ekim 1919) ve İstanbul Hükûmetince Temsil Heyetinin Tanınması",
                "outcome": "İTA.8.2.8",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-2-26",
                "title": "Temsil Heyetinin Ankara'ya Gelişi (27 Aralık 1919) ve Ankara'nın Merkez Seçilme Sebepleri",
                "outcome": "İTA.8.2.8",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-2-27",
                "title": "Son Osmanlı Mebusan Meclisinin Toplanması ve Misakımillî Kararları (28 Ocak 1920)",
                "outcome": "İTA.8.2.8",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              },
              {
                "id": "ITA-8-2-28",
                "title": "İstanbul'un Resmen İşgali (16 Mart 1920) ve Meclisin Dağıtılması",
                "outcome": "İTA.8.2.8",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              }
            ]
          },
          {
            "topicTitle": "BMM'nin Açılışı, Ayaklanmalar ve Sevr",
            "subtopics": [
              {
                "id": "ITA-8-2-29",
                "title": "Büyük Millet Meclisinin Açılışı (23 Nisan 1920) ve 24 Nisan Önergesi",
                "outcome": "İTA.8.2.9",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-2-30",
                "title": "I. BMM'nin Nitelikleri: Kurucu, İhtilalci, Demokratik, Millî ve Güçler Birliği",
                "outcome": "İTA.8.2.9",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-2-31",
                "title": "BMM'ye Karşı Çıkarılan İç Ayaklanmalar ve Nedenleri",
                "outcome": "İTA.8.2.10",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-2-32",
                "title": "BMM'nin Otoritesini Korumak İçin Aldığı Tedbirler (Hıyanet-i Vataniye, İstiklal Mahkemeleri)",
                "outcome": "İTA.8.2.10",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-2-33",
                "title": "Sevr Antlaşması (10 Ağustos 1920): Maddeleri ve Hukuken Geçersiz (Ölü Doğan) Olması",
                "outcome": "İTA.8.2.11",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme"
              }
            ]
          }
        ]
      },
      {
        "unitId": "ITA-8-U3",
        "unitTitle": "3. Ünite: Millî Bir Destan: Ya İstiklal Ya Ölüm!",
        "topics": [
          {
            "topicTitle": "Doğu ve Güney Cepheleri",
            "subtopics": [
              {
                "id": "ITA-8-3-1",
                "title": "Doğu Cephesi: Ermeni Çetelerine Karşı Kazım Karabekir ve 15. Kolordu",
                "outcome": "İTA.8.3.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-3-2",
                "title": "Gümrü Antlaşması (3 Aralık 1920): BMM'nin İlk Askerî ve Siyasi Zaferi",
                "outcome": "İTA.8.3.1",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-3-3",
                "title": "Güney Cephesi: Fransız ve Ermenilere Karşı Kuvâ-yı Millîye Direnişi",
                "outcome": "İTA.8.3.2",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-3-4",
                "title": "Kahraman Şehirler: Maraş (Sütçü İmam), Antep (Şahin Bey), Urfa (Ali Saip Bey)",
                "outcome": "İTA.8.3.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "ITA-8-3-5",
                "title": "Ankara Antlaşması (1921) ve Güney Cephesinin Kapanması",
                "outcome": "İTA.8.3.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              }
            ]
          },
          {
            "topicTitle": "Batı Cephesi ve Düzenli Ordu Muharebeleri",
            "subtopics": [
              {
                "id": "ITA-8-3-6",
                "title": "Batı Cephesinde Düzenli Ordunun Kurulma Gerekçeleri (Gediz Taarruzu)",
                "outcome": "İTA.8.3.3",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-3-7",
                "title": "I. İnönü Muharebesi (6-10 Ocak 1921): Düzenli Ordunun İlk Zaferi",
                "outcome": "İTA.8.3.3",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "ITA-8-3-8",
                "title": "I. İnönü Zaferinin İç Sonuçları: Teşkilat-ı Esasiye ve İstiklal Marşı'nın Kabulü",
                "outcome": "İTA.8.3.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-3-9",
                "title": "I. İnönü Zaferinin Dış Sonuçları: Londra Konferansı (BMM'nin Tanınması)",
                "outcome": "İTA.8.3.3",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-3-10",
                "title": "Türk-Afgan Dostluk Antlaşması ve Moskova Antlaşması (Batum Tavizi)",
                "outcome": "İTA.8.3.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-3-11",
                "title": "II. İnönü Muharebesi (23 Mart - 1 Nisan 1921) ve Mustafa Kemal'in Telgrafı",
                "outcome": "İTA.8.3.4",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-3-12",
                "title": "Kütahya-Eskişehir Muharebeleri (10-24 Temmuz 1921) ve Ordunun Sakarya Gerisine Çekilişi",
                "outcome": "İTA.8.3.5",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-3-13",
                "title": "Maarif Kongresi (15-21 Temmuz 1921): Savaş Şartlarında Eğitime Verilen Önem",
                "outcome": "İTA.8.3.5",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme"
              },
              {
                "id": "ITA-8-3-14",
                "title": "Mustafa Kemal Paşa'ya Başkomutanlık Yetkisinin Verilmesi (5 Ağustos 1921)",
                "outcome": "İTA.8.3.6",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-3-15",
                "title": "Tekâlif-i Millîye Emirleri (7-8 Ağustos 1921) ve Topyekûn Seferberlik Ruhu",
                "outcome": "İTA.8.3.6",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme"
              },
              {
                "id": "ITA-8-3-16",
                "title": "Sakarya Meydan Muharebesi (23 Ağustos - 13 Eylül 1921): 'Hattı müdafaa yoktur...'",
                "outcome": "İTA.8.3.7",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              },
              {
                "id": "ITA-8-3-17",
                "title": "Sakarya Zaferinin Sonuçları: Gazilik/Mareşallik, Kars Antlaşması ve Doğu Sınırı",
                "outcome": "İTA.8.3.7",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-3-18",
                "title": "Büyük Taarruz ve Başkomutanlık Meydan Muharebesi (26-30 Ağustos 1922)",
                "outcome": "İTA.8.3.8",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "ITA-8-3-19",
                "title": "Mudanya Ateşkes Antlaşması (11 Ekim 1922): Boğazlar, İstanbul ve Trakya'nın Savaşsız Alınması",
                "outcome": "İTA.8.3.9",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-3-20",
                "title": "Lozan Barış Konferansı, Tartışılan Konular ve İsmet Paşa'nın Tavrı",
                "outcome": "İTA.8.3.10",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-3-21",
                "title": "Lozan Barış Antlaşması (24 Temmuz 1923): Kapitülasyonların Kaldırılması ve Bağımsızlık",
                "outcome": "İTA.8.3.10",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme"
              }
            ]
          }
        ]
      },
      {
        "unitId": "ITA-8-U4",
        "unitTitle": "4. Ünite: Atatürkçülük ve Çağdaşlaşan Türkiye",
        "topics": [
          {
            "topicTitle": "Atatürk İlkeleri",
            "subtopics": [
              {
                "id": "ITA-8-4-1",
                "title": "Cumhuriyetçilik İlkesi (Millî Egemenlik, Seçim, Çoğulculuk)",
                "outcome": "İTA.8.4.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-4-2",
                "title": "Milliyetçilik İlkesi (Millî Birlik, Bağımsızlık, Türk Dili ve Tarihi)",
                "outcome": "İTA.8.4.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-4-3",
                "title": "Halkçılık İlkesi (Kanun Önünde Eşitlik, Ayrıcalıksız Toplum, Sosyal Adalet)",
                "outcome": "İTA.8.4.2",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-4-4",
                "title": "Devletçilik İlkesi (Karma Ekonomi, Özel Sektörün Yetmediği Yerde Kamu Yatırımı)",
                "outcome": "İTA.8.4.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-4-5",
                "title": "Laiklik İlkesi (Din ve Devlet İşlerinin Ayrılması, Akılcılık ve Vicdan Özgürlüğü)",
                "outcome": "İTA.8.4.2",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-4-6",
                "title": "İnkılapçılık İlkesi (Dinamizm, Sürekli Çağdaşlaşma ve Yenilenme)",
                "outcome": "İTA.8.4.2",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-4-7",
                "title": "Atatürk İlkeleri ile İnkılaplar Arasındaki Eşleştirme Soruları",
                "outcome": "İTA.8.4.2",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              }
            ]
          },
          {
            "topicTitle": "Siyasi ve Hukuk Alanında İnkılaplar",
            "subtopics": [
              {
                "id": "ITA-8-4-8",
                "title": "Saltanatın Kaldırılması (1 Kasım 1922) ve Lozan'da İkiliğin Önlenmesi",
                "outcome": "İTA.8.4.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-4-9",
                "title": "Ankara'nın Başkent Oluşu (13 Ekim 1923)",
                "outcome": "İTA.8.4.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "ITA-8-4-10",
                "title": "Cumhuriyetin İlanı (29 Ekim 1923): Hükûmet Bunalımının Çözümü ve İlk Cumhurbaşkanı",
                "outcome": "İTA.8.4.3",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-4-11",
                "title": "Halifeliğin Kaldırılması (3 Mart 1924) ve Laikleşme Adımları",
                "outcome": "İTA.8.4.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-4-12",
                "title": "1924 Anayasası ve Temel Nitelikleri",
                "outcome": "İTA.8.4.4",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-4-13",
                "title": "Türk Medeni Kanunu (17 Şubat 1926): Kadın-Erkek Eşitliği, Hukukta Birlik, Laik Hukuk",
                "outcome": "İTA.8.4.4",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme"
              },
              {
                "id": "ITA-8-4-14",
                "title": "Şeriye Mahkemelerinin Kapatılması ve Çağdaş Ceza/Ticaret/Borçlar Kanunları",
                "outcome": "İTA.8.4.4",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              }
            ]
          },
          {
            "topicTitle": "Eğitim, Kültür, Toplumsal ve Ekonomik İnkılaplar",
            "subtopics": [
              {
                "id": "ITA-8-4-15",
                "title": "Tevhid-i Tedrisat Kanunu (3 Mart 1924): Eğitimde Birlik ve Millî Eğitim İlkesi",
                "outcome": "İTA.8.4.5",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-4-16",
                "title": "Medreselerin Kapatılması ve Maarif Teşkilatı Kanunu",
                "outcome": "İTA.8.4.5",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-4-17",
                "title": "Yeni Türk Harflerinin Kabulü (1 Kasım 1928) ve Millet Mektepleri",
                "outcome": "İTA.8.4.5",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "ITA-8-4-18",
                "title": "Atatürk'e Başöğretmenlik Unvanının Verilmesi (24 Kasım 1928)",
                "outcome": "İTA.8.4.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "ITA-8-4-19",
                "title": "Türk Tarih Kurumu (1931) ve Türk Dil Kurumunun (1932) Kurulması",
                "outcome": "İTA.8.4.5",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-4-20",
                "title": "Üniversite Reformu (Darülfünundan İstanbul Üniversitesine) ve Yabancı Bilim İnsanları",
                "outcome": "İTA.8.4.5",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-4-21",
                "title": "Şapka İnkılabı ve Kılık-Kıyafet Düzenlemesi",
                "outcome": "İTA.8.4.6",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-4-22",
                "title": "Tekke, Zaviye ve Türbelerin Kapatılması",
                "outcome": "İTA.8.4.6",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-4-23",
                "title": "Takvim, Saat ve Ölçülerde Değişiklik (Uluslararası Sisteme Uyum)",
                "outcome": "İTA.8.4.6",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "ITA-8-4-24",
                "title": "Soyadı Kanunu (1934) ve Ayrıcalık İfade Eden Unvanların Kaldırılması (Halkçılık)",
                "outcome": "İTA.8.4.6",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-4-25",
                "title": "Türk Kadınına Siyasi Hakların Verilmesi (1930 Belediye, 1933 Muhtar, 1934 Vekil - 034 Kuralı)",
                "outcome": "İTA.8.4.6",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme"
              },
              {
                "id": "ITA-8-4-26",
                "title": "İzmir İktisat Kongresi ve Misak-ı İktisadi Kararları",
                "outcome": "İTA.8.4.6",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-4-27",
                "title": "Tarımda İnkılaplar: Aşar Vergisinin Kaldırılması, Örnek Çiftlikler ve Kredi İmkanları",
                "outcome": "İTA.8.4.6",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-4-28",
                "title": "Kabotaj Kanunu (1 Temmuz 1926) ve Türk Karasularında Millî Egemenlik",
                "outcome": "İTA.8.4.6",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-4-29",
                "title": "Sanayi ve Ticarette İnkılaplar: Teşvik-i Sanayi, I. Beş Yıllık Sanayi Planı, Sümerbank, Etibank",
                "outcome": "İTA.8.4.6",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-4-30",
                "title": "Sağlık ve Sosyal Yardım Alanı: Hıfzıssıhha, Veremle Savaş, Kızılay",
                "outcome": "İTA.8.4.6",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              }
            ]
          }
        ]
      },
      {
        "unitId": "ITA-8-U5",
        "unitTitle": "5. Ünite: Demokratikleşme Çabaları",
        "topics": [
          {
            "topicTitle": "Çok Partili Hayata Geçiş Denemeleri",
            "subtopics": [
              {
                "id": "ITA-8-5-1",
                "title": "Çok Partili Hayata Geçiş Nedenleri ve Demokrasinin Unsurları",
                "outcome": "İTA.8.5.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-5-2",
                "title": "Cumhuriyet Halk Fırkası: Türkiye'nin İlk Siyasi Partisi ve Programı",
                "outcome": "İTA.8.5.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "ITA-8-5-3",
                "title": "Terakkiperver Cumhuriyet Fırkası: İlk Muhalefet Partisi, Kurucuları ve İlkeleri",
                "outcome": "İTA.8.5.1",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-5-4",
                "title": "Şeyh Sait İsyanı (1925), Takrir-i Sükûn Kanunu ve Terakkiperver Partisinin Kapatılması",
                "outcome": "İTA.8.5.1",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-5-5",
                "title": "Mustafa Kemal'e Suikast Girişimi (İzmir Suikastı - 1926) ve Önemi",
                "outcome": "İTA.8.5.1",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-5-6",
                "title": "Serbest Cumhuriyet Fırkası (1930): Ali Fethi Okyar, Ekonomik Kriz ve Partinin Feshi",
                "outcome": "İTA.8.5.1",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-5-7",
                "title": "Menemen Olayı (Kubilay Olayı - 1930) ve Rejime Yönelik Tehditler",
                "outcome": "İTA.8.5.1",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme"
              }
            ]
          }
        ]
      },
      {
        "unitId": "ITA-8-U6",
        "unitTitle": "6. Ünite: Atatürk Dönemi Türk Dış Politikası",
        "topics": [
          {
            "topicTitle": "Dış Politika İlkeleri ve Gelişmeler",
            "subtopics": [
              {
                "id": "ITA-8-6-1",
                "title": "Atatürk Dönemi Türk Dış Politikasının Temel İlkeleri (Tam Bağımsızlık, Barışçılık, Gerçekçilik)",
                "outcome": "İTA.8.6.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-6-2",
                "title": "'Yurtta Sulh, Cihanda Sulh' İlkesi ve Diplomasi Anlayışı",
                "outcome": "İTA.8.6.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-6-3",
                "title": "Yabancı Okullar Sorunu ve Türkiye'nin İç İşlerine Karışılmaması Kararlılığı",
                "outcome": "İTA.8.6.1",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-6-4",
                "title": "Nüfus Mübadelesi (Ahali / Etabli Sorunu) ve Türk-Yunan Uzlaşması",
                "outcome": "İTA.8.6.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-6-5",
                "title": "Musul Meselesi, Şeyh Sait İsyanının Etkisi ve Ankara Antlaşması (1926)",
                "outcome": "İTA.8.6.1",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-6-6",
                "title": "Türkiye'nin Milletler Cemiyetine Girişi (1932) ve Davet Alan İlk Devlet Olması",
                "outcome": "İTA.8.6.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "ITA-8-6-7",
                "title": "Balkan Antantı (1934): Batı Sınır Güvenliği (Türkiye, Yunanistan, Yugoslavya, Romanya)",
                "outcome": "İTA.8.6.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-6-8",
                "title": "Montrö Boğazlar Sözleşmesi (1936): Boğazlar Komisyonunun Kaldırılması ve Tam Türk Hâkimiyeti",
                "outcome": "İTA.8.6.2",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Sentez"
              },
              {
                "id": "ITA-8-6-9",
                "title": "Sadabat Paktı (1937): Doğu Sınır Güvenliği (Türkiye, İran, Irak, Afganistan)",
                "outcome": "İTA.8.6.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-6-10",
                "title": "Hatay Meselesi: Bağımsız Hatay Cumhuriyeti ve Hatay'ın Ana Vatana Katılması (1939)",
                "outcome": "İTA.8.6.3",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme"
              }
            ]
          }
        ]
      },
      {
        "unitId": "ITA-8-U7",
        "unitTitle": "7. Ünite: Atatürk'ün Ölümü ve Sonrası",
        "topics": [
          {
            "topicTitle": "Atatürk'ün Vefatı, Eserleri ve İkinci Dünya Savaşı",
            "subtopics": [
              {
                "id": "ITA-8-7-1",
                "title": "Atatürk'ün Hastalığı, Son Günleri ve Vefatı (10 Kasım 1938)",
                "outcome": "İTA.8.7.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "ITA-8-7-2",
                "title": "Atatürk'ün Naaşının Etnografya Müzesi'ne ve Anıtkabir'e Nakli",
                "outcome": "İTA.8.7.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama"
              },
              {
                "id": "ITA-8-7-3",
                "title": "Atatürk'ün Kaleme Aldığı Eserler: Nutuk (1919-1927 Belgesi), Geometri Kitabı vb.",
                "outcome": "İTA.8.7.1",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-7-4",
                "title": "Atatürk'ün Türk Milletine Emanetleri: Cumhuriyet ve Gençliğe Hitabe",
                "outcome": "İTA.8.7.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              },
              {
                "id": "ITA-8-7-5",
                "title": "İkinci Cumhurbaşkanı İsmet İnönü ve II. Dünya Savaşı Dönemi Dengeleri",
                "outcome": "İTA.8.7.1",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "ITA-8-7-6",
                "title": "II. Dünya Savaşı Sırasında Türkiye'nin Tarafsızlık ve Güvenlik Tedbirleri",
                "outcome": "İTA.8.7.1",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme"
              },
              {
                "id": "ITA-8-7-7",
                "title": "1945 Sonrası Türkiye: Çok Partili Demokratik Hayata Kesin Geçiş (MKP ve DP)",
                "outcome": "İTA.8.7.1",
                "cognitive": "Kavrama",
                "bloom": "Anlama"
              }
            ]
          }
        ]
      }
    ]
  }
};

export const MEB_GRANULAR_CURRICULUM_GRADE_5 = {
  "turkce": {
    "courseName": "Türkçe",
    "grade": 5,
    "totalUnits": 9,
    "units": [
      {
        "unitId": "TUR-5-U1",
        "unitTitle": "1. Ünite: Sözcükte Anlam ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Sözcükte Anlam (Gerçek ve Mecaz)",
            "week": 1,
            "subtopics": [
              {
                "id": "TUR-5-1-1",
                "title": "Sözcükte Anlam - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-1-2",
                "title": "Sözcükte Anlam: Gerçek ve Mecaz",
                "outcome": "T.5.1.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-5-1-3",
                "title": "Sözcükte Anlam - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Terim Anlam ve Eş/Zıt Anlamlı Sözcükler",
            "week": 2,
            "subtopics": [
              {
                "id": "TUR-5-2-1",
                "title": "Terim Anlam ve Eş/Zıt Anlamlı Sözcükler - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-2-2",
                "title": "Terim Anlam ve Eş/Zıt Anlamlı Sözcükler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Deyimler ve Atasözleri",
            "week": 3,
            "subtopics": [
              {
                "id": "TUR-5-3-1",
                "title": "Deyimler ve Atasözleri - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.1.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-3-2",
                "title": "Deyimler ve Atasözleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.1.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Cümlede Anlam (Öznel ve Nesnel Yargılar)",
            "week": 4,
            "subtopics": [
              {
                "id": "TUR-5-4-1",
                "title": "Cümlede Anlam - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.1.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-4-2",
                "title": "Cümlede Anlam: Öznel ve Nesnel Yargılar",
                "outcome": "T.5.1.4.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-5-4-3",
                "title": "Cümlede Anlam - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.1.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-5-U2",
        "unitTitle": "2. Ünite: Neden-Sonuç ve Amaç-Sonuç Cümleleri ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Neden-Sonuç ve Amaç-Sonuç Cümleleri",
            "week": 5,
            "subtopics": [
              {
                "id": "TUR-5-5-1",
                "title": "Neden-Sonuç ve Amaç-Sonuç Cümleleri - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.1.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-5-2",
                "title": "Neden-Sonuç ve Amaç-Sonuç Cümleleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.1.5.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Koşul (Şart) ve Karşılaştırma Cümleleri",
            "week": 6,
            "subtopics": [
              {
                "id": "TUR-5-6-1",
                "title": "Koşul  ve Karşılaştırma Cümleleri - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.1.6",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-6-2",
                "title": "Koşul  ve Karşılaştırma Cümleleri: Şart",
                "outcome": "T.5.1.6.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-5-6-3",
                "title": "Koşul  ve Karşılaştırma Cümleleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.1.6.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Paragrafta Konu ve Başlık",
            "week": 7,
            "subtopics": [
              {
                "id": "TUR-5-7-1",
                "title": "Paragrafta Konu ve Başlık - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-7-2",
                "title": "Paragrafta Konu ve Başlık - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Paragrafta Ana Fikir ve Yardımcı Fikirler",
            "week": 8,
            "subtopics": [
              {
                "id": "TUR-5-8-1",
                "title": "Paragrafta Ana Fikir ve Yardımcı Fikirler - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.3.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-8-2",
                "title": "Paragrafta Ana Fikir ve Yardımcı Fikirler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.3.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-5-U3",
        "unitTitle": "3. Ünite: Paragrafın Giriş, Gelişme ve Sonuç Bölümleri ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Paragrafın Giriş, Gelişme ve Sonuç Bölümleri",
            "week": 9,
            "subtopics": [
              {
                "id": "TUR-5-9-1",
                "title": "Paragrafın Giriş, Gelişme ve Sonuç Bölümleri - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.3.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-9-2",
                "title": "Paragrafın Giriş, Gelişme ve Sonuç Bölümleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.3.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Anlatım Biçimleri: Öyküleme ve Betimleme",
            "week": 10,
            "subtopics": [
              {
                "id": "TUR-5-10-1",
                "title": "Anlatım Biçimleri: Öyküleme ve Betimleme - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.3.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-10-2",
                "title": "Anlatım Biçimleri: Öyküleme ve Betimleme - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.3.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Düşünceyi Geliştirme: Tanımlama ve Örnekleme",
            "week": 11,
            "subtopics": [
              {
                "id": "TUR-5-11-1",
                "title": "Düşünceyi Geliştirme: Tanımlama ve Örnekleme - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.3.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-11-2",
                "title": "Düşünceyi Geliştirme: Tanımlama ve Örnekleme - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.3.5.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Metin Türleri: Hikâye (Öykü) ve Masal",
            "week": 12,
            "subtopics": [
              {
                "id": "TUR-5-12-1",
                "title": "Metin Türleri: Hikâye  ve Masal - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.3.6",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-12-2",
                "title": "Metin Türleri: Hikâye  ve Masal: Öykü",
                "outcome": "T.5.3.6.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-5-12-3",
                "title": "Metin Türleri: Hikâye  ve Masal - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.3.6.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-5-U4",
        "unitTitle": "4. Ünite: Metin Türleri ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Metin Türleri: Fabl ve Şiir",
            "week": 13,
            "subtopics": [
              {
                "id": "TUR-5-13-1",
                "title": "Metin Türleri: Fabl ve Şiir - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.3.7",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-13-2",
                "title": "Metin Türleri: Fabl ve Şiir - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.3.7.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Söz Sanatları: Benzetme (Teşbih) ve Kişileştirme (Teşhis)",
            "week": 14,
            "subtopics": [
              {
                "id": "TUR-5-14-1",
                "title": "Söz Sanatları: Benzetme - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.3.8",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-14-2",
                "title": "Söz Sanatları: Benzetme: Teşbih",
                "outcome": "T.5.3.8.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-5-14-3",
                "title": "Söz Sanatları: Benzetme - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.3.8.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Görsel, Karikatür ve İnfografik Yorumlama",
            "week": 15,
            "subtopics": [
              {
                "id": "TUR-5-15-1",
                "title": "Görsel, Karikatür ve İnfografik Yorumlama - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.3.9",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-15-2",
                "title": "Görsel, Karikatür ve İnfografik Yorumlama - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.3.9.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Tablo ve Grafik Okuma",
            "week": 16,
            "subtopics": [
              {
                "id": "TUR-5-16-1",
                "title": "Tablo ve Grafik Okuma - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.3.10",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-16-2",
                "title": "Tablo ve Grafik Okuma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.3.10.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-5-U5",
        "unitTitle": "5. Ünite: Kökler ve Ekler ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Kökler ve Ekler (İsim ve Fiil Kökleri)",
            "week": 17,
            "subtopics": [
              {
                "id": "TUR-5-17-1",
                "title": "Kökler ve Ekler - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-17-2",
                "title": "Kökler ve Ekler: İsim ve Fiil Kökleri",
                "outcome": "T.5.4.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-5-17-3",
                "title": "Kökler ve Ekler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.4.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Yapım Ekleri ve Türemiş Sözcükler",
            "week": 18,
            "subtopics": [
              {
                "id": "TUR-5-18-1",
                "title": "Yapım Ekleri ve Türemiş Sözcükler - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.4.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-18-2",
                "title": "Yapım Ekleri ve Türemiş Sözcükler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.4.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Çekim Ekleri (Çoğul ve Hâl Ekleri)",
            "week": 19,
            "subtopics": [
              {
                "id": "TUR-5-19-1",
                "title": "Çekim Ekleri - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.4.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-19-2",
                "title": "Çekim Ekleri: Çoğul ve Hâl Ekleri",
                "outcome": "T.5.4.3.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-5-19-3",
                "title": "Çekim Ekleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.4.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "İyilik ve İlgi Ekleri",
            "week": 20,
            "subtopics": [
              {
                "id": "TUR-5-20-1",
                "title": "İyilik ve İlgi Ekleri - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.4.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-20-2",
                "title": "İyilik ve İlgi Ekleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.4.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-5-U6",
        "unitTitle": "6. Ünite: Büyük Harflerin Kullanıldığı Yerler ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Büyük Harflerin Kullanıldığı Yerler",
            "week": 21,
            "subtopics": [
              {
                "id": "TUR-5-21-1",
                "title": "Büyük Harflerin Kullanıldığı Yerler - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.4.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-21-2",
                "title": "Büyük Harflerin Kullanıldığı Yerler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.4.5.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Sayıların ve Tarihlerin Yazımı",
            "week": 22,
            "subtopics": [
              {
                "id": "TUR-5-22-1",
                "title": "Sayıların ve Tarihlerin Yazımı - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.4.6",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-22-2",
                "title": "Sayıların ve Tarihlerin Yazımı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.4.6.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "'de/da' ve 'ki' Bağlaçlarının Yazımı",
            "week": 23,
            "subtopics": [
              {
                "id": "TUR-5-23-1",
                "title": "'de/da' ve 'ki' Bağlaçlarının Yazımı - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.4.7",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-23-2",
                "title": "'de/da' ve 'ki' Bağlaçlarının Yazımı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.4.7.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Soru Eki 'mi'nin Yazımı",
            "week": 24,
            "subtopics": [
              {
                "id": "TUR-5-24-1",
                "title": "Soru Eki 'mi'nin Yazımı - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.4.8",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-24-2",
                "title": "Soru Eki 'mi'nin Yazımı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.4.8.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-5-U7",
        "unitTitle": "7. Ünite: Nokta, Virgül ve İki Nokta ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Nokta, Virgül ve İki Nokta",
            "week": 25,
            "subtopics": [
              {
                "id": "TUR-5-25-1",
                "title": "Nokta, Virgül ve İki Nokta - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.4.9",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-25-2",
                "title": "Nokta, Virgül ve İki Nokta - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.4.9.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Üç Nokta, Soru İşareti ve Ünlem İşareti",
            "week": 26,
            "subtopics": [
              {
                "id": "TUR-5-26-1",
                "title": "Üç Nokta, Soru İşareti ve Ünlem İşareti - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.4.10",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-26-2",
                "title": "Üç Nokta, Soru İşareti ve Ünlem İşareti - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.4.10.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Kısa Çizgi, Tırnak ve Kesme İşareti",
            "week": 27,
            "subtopics": [
              {
                "id": "TUR-5-27-1",
                "title": "Kısa Çizgi, Tırnak ve Kesme İşareti - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.4.11",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-27-2",
                "title": "Kısa Çizgi, Tırnak ve Kesme İşareti - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.4.11.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Akıcı Okuma ve Sesli Düşünme Becerileri",
            "week": 28,
            "subtopics": [
              {
                "id": "TUR-5-28-1",
                "title": "Akıcı Okuma ve Sesli Düşünme Becerileri - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-28-2",
                "title": "Akıcı Okuma ve Sesli Düşünme Becerileri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-5-U8",
        "unitTitle": "8. Ünite: Örtülü Anlam ve Çıkarım Yapma ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Örtülü Anlam ve Çıkarım Yapma",
            "week": 29,
            "subtopics": [
              {
                "id": "TUR-5-29-1",
                "title": "Örtülü Anlam ve Çıkarım Yapma - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.3.11",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-29-2",
                "title": "Örtülü Anlam ve Çıkarım Yapma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.3.11.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Metin İçi Mantık ve Olay Akışı",
            "week": 30,
            "subtopics": [
              {
                "id": "TUR-5-30-1",
                "title": "Metin İçi Mantık ve Olay Akışı - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.3.12",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-30-2",
                "title": "Metin İçi Mantık ve Olay Akışı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.3.12.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Eleştirel Okuma ve Metin Değerlendirme",
            "week": 31,
            "subtopics": [
              {
                "id": "TUR-5-31-1",
                "title": "Eleştirel Okuma ve Metin Değerlendirme - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.3.13",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-31-2",
                "title": "Eleştirel Okuma ve Metin Değerlendirme - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.3.13.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Biyografi ve Mektup İncelemesi",
            "week": 32,
            "subtopics": [
              {
                "id": "TUR-5-32-1",
                "title": "Biyografi ve Mektup İncelemesi - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.3.14",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-32-2",
                "title": "Biyografi ve Mektup İncelemesi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.3.14.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-5-U9",
        "unitTitle": "9. Ünite: Karma Dil ve Anlam Bilgisi Denemesi - I ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Karma Dil ve Anlam Bilgisi Denemesi - I",
            "week": 33,
            "subtopics": [
              {
                "id": "TUR-5-33-1",
                "title": "Karma Dil ve Anlam Bilgisi Denemesi - I - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.LGS.01",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-33-2",
                "title": "Karma Dil ve Anlam Bilgisi Denemesi - I - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.LGS.01.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Karma Dil ve Anlam Bilgisi Denemesi - II",
            "week": 34,
            "subtopics": [
              {
                "id": "TUR-5-34-1",
                "title": "Karma Dil ve Anlam Bilgisi Denemesi - II - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.LGS.02",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-34-2",
                "title": "Karma Dil ve Anlam Bilgisi Denemesi - II - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.LGS.02.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "5. Sınıf Yıl Sonu Bütüncül Sözel Prova - I",
            "week": 35,
            "subtopics": [
              {
                "id": "TUR-5-35-1",
                "title": "5. Sınıf Yıl Sonu Bütüncül Sözel Prova - I - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.LGS.03",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-35-2",
                "title": "5. Sınıf Yıl Sonu Bütüncül Sözel Prova - I - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.LGS.03.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "5. Sınıf Yıl Sonu Bütüncül Sözel Prova - II",
            "week": 36,
            "subtopics": [
              {
                "id": "TUR-5-36-1",
                "title": "5. Sınıf Yıl Sonu Bütüncül Sözel Prova - II - Temel Kavramlar ve Tanımlar",
                "outcome": "T.5.LGS.04",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-5-36-2",
                "title": "5. Sınıf Yıl Sonu Bütüncül Sözel Prova - II - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.5.LGS.04.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      }
    ]
  },
  "matematik": {
    "courseName": "Matematik",
    "grade": 5,
    "totalUnits": 9,
    "units": [
      {
        "unitId": "MAT-5-U1",
        "unitTitle": "1. Ünite: Milyonlu Doğal Sayıların Okunuşu ve Yazılışı ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Milyonlu Doğal Sayıların Okunuşu ve Yazılışı",
            "week": 1,
            "subtopics": [
              {
                "id": "MAT-5-1-1",
                "title": "Milyonlu Doğal Sayıların Okunuşu ve Yazılışı - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.1.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-1-2",
                "title": "Milyonlu Doğal Sayıların Okunuşu ve Yazılışı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.1.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Basamak Değeri ve Bölük Kavramı",
            "week": 2,
            "subtopics": [
              {
                "id": "MAT-5-2-1",
                "title": "Basamak Değeri ve Bölük Kavramı - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.1.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-2-2",
                "title": "Basamak Değeri ve Bölük Kavramı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.1.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Doğal Sayılarla Toplama ve Çıkarma İşlemleri",
            "week": 3,
            "subtopics": [
              {
                "id": "MAT-5-3-1",
                "title": "Doğal Sayılarla Toplama ve Çıkarma İşlemleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.1.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-3-2",
                "title": "Doğal Sayılarla Toplama ve Çıkarma İşlemleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.1.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Zihinden Toplama-Çıkarma ve Tahmin",
            "week": 4,
            "subtopics": [
              {
                "id": "MAT-5-4-1",
                "title": "Zihinden Toplama-Çıkarma ve Tahmin - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.1.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-4-2",
                "title": "Zihinden Toplama-Çıkarma ve Tahmin - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.1.2.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-5-U2",
        "unitTitle": "2. Ünite: Doğal Sayılarla Çarpma İşlemi ve Modelleme ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Doğal Sayılarla Çarpma İşlemi ve Modelleme",
            "week": 5,
            "subtopics": [
              {
                "id": "MAT-5-5-1",
                "title": "Doğal Sayılarla Çarpma İşlemi ve Modelleme - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.1.2.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-5-2",
                "title": "Doğal Sayılarla Çarpma İşlemi ve Modelleme - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.1.2.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Doğal Sayılarla Bölme İşlemi ve Kalan Yorumlama",
            "week": 6,
            "subtopics": [
              {
                "id": "MAT-5-6-1",
                "title": "Doğal Sayılarla Bölme İşlemi ve Kalan Yorumlama - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.1.2.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-6-2",
                "title": "Doğal Sayılarla Bölme İşlemi ve Kalan Yorumlama - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.1.2.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Doğal Sayıların Karesi ve Küpü",
            "week": 7,
            "subtopics": [
              {
                "id": "MAT-5-7-1",
                "title": "Doğal Sayıların Karesi ve Küpü - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.1.2.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-7-2",
                "title": "Doğal Sayıların Karesi ve Küpü - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.1.2.5.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Parantezli İşlemler ve İşlem Önceliği",
            "week": 8,
            "subtopics": [
              {
                "id": "MAT-5-8-1",
                "title": "Parantezli İşlemler ve İşlem Önceliği - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.1.2.6",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-8-2",
                "title": "Parantezli İşlemler ve İşlem Önceliği - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.1.2.6.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-5-U3",
        "unitTitle": "3. Ünite: Birim Kesirler ve Sayı Doğrusunda Gösterimi ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Birim Kesirler ve Sayı Doğrusunda Gösterimi",
            "week": 9,
            "subtopics": [
              {
                "id": "MAT-5-9-1",
                "title": "Birim Kesirler ve Sayı Doğrusunda Gösterimi - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.1.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-9-2",
                "title": "Birim Kesirler ve Sayı Doğrusunda Gösterimi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.1.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Tam Sayılı ve Bileşik Kesir Dönüşümleri",
            "week": 10,
            "subtopics": [
              {
                "id": "MAT-5-10-1",
                "title": "Tam Sayılı ve Bileşik Kesir Dönüşümleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.1.3.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-10-2",
                "title": "Tam Sayılı ve Bileşik Kesir Dönüşümleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.1.3.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Denk Kesirler ve Sadeleştirme/Genişletme",
            "week": 11,
            "subtopics": [
              {
                "id": "MAT-5-11-1",
                "title": "Denk Kesirler ve Sadeleştirme/Genişletme - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.1.3.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-11-2",
                "title": "Denk Kesirler ve Sadeleştirme/Genişletme - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.1.3.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Kesirleri Sıralama ve Karşılaştırma",
            "week": 12,
            "subtopics": [
              {
                "id": "MAT-5-12-1",
                "title": "Kesirleri Sıralama ve Karşılaştırma - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.1.3.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-12-2",
                "title": "Kesirleri Sıralama ve Karşılaştırma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.1.3.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-5-U4",
        "unitTitle": "4. Ünite: Bir Çokluğun İstenen Basit Kesir Kadarını Bulma ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Bir Çokluğun İstenen Basit Kesir Kadarını Bulma",
            "week": 13,
            "subtopics": [
              {
                "id": "MAT-5-13-1",
                "title": "Bir Çokluğun İstenen Basit Kesir Kadarını Bulma - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.1.3.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-13-2",
                "title": "Bir Çokluğun İstenen Basit Kesir Kadarını Bulma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.1.3.5.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Kesirlerle Toplama ve Çıkarma İşlemleri",
            "week": 14,
            "subtopics": [
              {
                "id": "MAT-5-14-1",
                "title": "Kesirlerle Toplama ve Çıkarma İşlemleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.1.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-14-2",
                "title": "Kesirlerle Toplama ve Çıkarma İşlemleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.1.4.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Ondalık Gösterim: Onda Birler, Yüzde Birler, Binde Birler",
            "week": 15,
            "subtopics": [
              {
                "id": "MAT-5-15-1",
                "title": "Ondalık Gösterim: Onda Birler, Yüzde Birler, Binde Birler - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.1.5.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-15-2",
                "title": "Ondalık Gösterim: Onda Birler, Yüzde Birler, Binde Birler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.1.5.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Ondalık Gösterimleri Sayı Doğrusunda Sıralama",
            "week": 16,
            "subtopics": [
              {
                "id": "MAT-5-16-1",
                "title": "Ondalık Gösterimleri Sayı Doğrusunda Sıralama - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.1.5.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-16-2",
                "title": "Ondalık Gösterimleri Sayı Doğrusunda Sıralama - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.1.5.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-5-U5",
        "unitTitle": "5. Ünite: Ondalık Gösterimlerle Toplama ve Çıkarma ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Ondalık Gösterimlerle Toplama ve Çıkarma",
            "week": 17,
            "subtopics": [
              {
                "id": "MAT-5-17-1",
                "title": "Ondalık Gösterimlerle Toplama ve Çıkarma - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.1.5.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-17-2",
                "title": "Ondalık Gösterimlerle Toplama ve Çıkarma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.1.5.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Yüzde Kavramı (%) ve Kesir-Ondalık Dönüşümü",
            "week": 18,
            "subtopics": [
              {
                "id": "MAT-5-18-1",
                "title": "Yüzde Kavramı  ve Kesir-Ondalık Dönüşümü - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.1.6.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-18-2",
                "title": "Yüzde Kavramı  ve Kesir-Ondalık Dönüşümü - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.1.6.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Bir Çokluğun Belirtilen Yüzdesini Hesaplama",
            "week": 19,
            "subtopics": [
              {
                "id": "MAT-5-19-1",
                "title": "Bir Çokluğun Belirtilen Yüzdesini Hesaplama - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.1.6.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-19-2",
                "title": "Bir Çokluğun Belirtilen Yüzdesini Hesaplama - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.1.6.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Temel Geometrik Kavramlar: Nokta, Doğru, Işın, Doğru Parçası",
            "week": 20,
            "subtopics": [
              {
                "id": "MAT-5-20-1",
                "title": "Temel Geometrik Kavramlar: Nokta, Doğru, Işın, Doğru Parçası - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.2.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-20-2",
                "title": "Temel Geometrik Kavramlar: Nokta, Doğru, Işın, Doğru Parçası - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.2.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-5-U6",
        "unitTitle": "6. Ünite: İki Noktanın Birbirine Göre Konumu ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "İki Noktanın Birbirine Göre Konumu",
            "week": 21,
            "subtopics": [
              {
                "id": "MAT-5-21-1",
                "title": "İki Noktanın Birbirine Göre Konumu - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.2.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-21-2",
                "title": "İki Noktanın Birbirine Göre Konumu - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.2.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Eşit Uzunluktaki Doğru Parçaları Çizme",
            "week": 22,
            "subtopics": [
              {
                "id": "MAT-5-22-1",
                "title": "Eşit Uzunluktaki Doğru Parçaları Çizme - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.2.1.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-22-2",
                "title": "Eşit Uzunluktaki Doğru Parçaları Çizme - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.2.1.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Dar, Dik, Geniş ve Doğru Açılar",
            "week": 23,
            "subtopics": [
              {
                "id": "MAT-5-23-1",
                "title": "Dar, Dik, Geniş ve Doğru Açılar - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.2.1.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-23-2",
                "title": "Dar, Dik, Geniş ve Doğru Açılar - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.2.1.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Üçgen Çeşitleri (Açılarına ve Kenarlarına Göre)",
            "week": 24,
            "subtopics": [
              {
                "id": "MAT-5-24-1",
                "title": "Üçgen Çeşitleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.2.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-24-2",
                "title": "Üçgen Çeşitleri: Açılarına ve Kenarlarına Göre",
                "outcome": "M.5.2.2.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-5-24-3",
                "title": "Üçgen Çeşitleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.2.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-5-U7",
        "unitTitle": "7. Ünite: Dörtgenler ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Dörtgenler: Kare, Dikdörtgen, Paralelkenar, Eşkenar Dörtgen, Yamuk",
            "week": 25,
            "subtopics": [
              {
                "id": "MAT-5-25-1",
                "title": "Dörtgenler: Kare, Dikdörtgen, Paralelkenar, Eşkenar Dörtgen, Yamuk - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.2.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-25-2",
                "title": "Dörtgenler: Kare, Dikdörtgen, Paralelkenar, Eşkenar Dörtgen, Yamuk - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.2.2.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Üçgen ve Dörtgenlerde İç Açılar Toplamı",
            "week": 26,
            "subtopics": [
              {
                "id": "MAT-5-26-1",
                "title": "Üçgen ve Dörtgenlerde İç Açılar Toplamı - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.2.2.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-26-2",
                "title": "Üçgen ve Dörtgenlerde İç Açılar Toplamı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.2.2.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Uzunluk Ölçme Birimleri ve Dönüşümleri (m, cm, mm, km)",
            "week": 27,
            "subtopics": [
              {
                "id": "MAT-5-27-1",
                "title": "Uzunluk Ölçme Birimleri ve Dönüşümleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.2.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-27-3",
                "title": "Uzunluk Ölçme Birimleri ve Dönüşümleri: cm",
                "outcome": "M.5.2.3.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-5-27-4",
                "title": "Uzunluk Ölçme Birimleri ve Dönüşümleri: mm",
                "outcome": "M.5.2.3.1.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-5-27-5",
                "title": "Uzunluk Ölçme Birimleri ve Dönüşümleri: km",
                "outcome": "M.5.2.3.1.4",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-5-27-5",
                "title": "Uzunluk Ölçme Birimleri ve Dönüşümleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.2.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Çevre Uzunluğu Hesaplama Problemleri",
            "week": 28,
            "subtopics": [
              {
                "id": "MAT-5-28-1",
                "title": "Çevre Uzunluğu Hesaplama Problemleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.2.3.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-28-2",
                "title": "Çevre Uzunluğu Hesaplama Problemleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.2.3.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-5-U8",
        "unitTitle": "8. Ünite: Zaman Ölçme Birimleri ve Süre Problemleri ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Zaman Ölçme Birimleri ve Süre Problemleri",
            "week": 29,
            "subtopics": [
              {
                "id": "MAT-5-29-1",
                "title": "Zaman Ölçme Birimleri ve Süre Problemleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.2.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-29-2",
                "title": "Zaman Ölçme Birimleri ve Süre Problemleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.2.4.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Dikdörtgenin Alanını Hesaplama ve Birim Kareler",
            "week": 30,
            "subtopics": [
              {
                "id": "MAT-5-30-1",
                "title": "Dikdörtgenin Alanını Hesaplama ve Birim Kareler - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.2.5.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-30-2",
                "title": "Dikdörtgenin Alanını Hesaplama ve Birim Kareler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.2.5.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Aynı Alana Sahip Farklı Dikdörtgenler Oluşturma",
            "week": 31,
            "subtopics": [
              {
                "id": "MAT-5-31-1",
                "title": "Aynı Alana Sahip Farklı Dikdörtgenler Oluşturma - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.2.5.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-31-2",
                "title": "Aynı Alana Sahip Farklı Dikdörtgenler Oluşturma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.2.5.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Dikdörtgenler Prizması, Kare Prizma ve Küp Açınımları",
            "week": 32,
            "subtopics": [
              {
                "id": "MAT-5-32-1",
                "title": "Dikdörtgenler Prizması, Kare Prizma ve Küp Açınımları - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.2.6.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-32-2",
                "title": "Dikdörtgenler Prizması, Kare Prizma ve Küp Açınımları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.2.6.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-5-U9",
        "unitTitle": "9. Ünite: Dikdörtgenler Prizmasının Yüzey Alanı ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Dikdörtgenler Prizmasının Yüzey Alanı",
            "week": 33,
            "subtopics": [
              {
                "id": "MAT-5-33-1",
                "title": "Dikdörtgenler Prizmasının Yüzey Alanı - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.2.6.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-33-2",
                "title": "Dikdörtgenler Prizmasının Yüzey Alanı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.2.6.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Veri Toplama, Çetele ve Sıklık Tablosu",
            "week": 34,
            "subtopics": [
              {
                "id": "MAT-5-34-1",
                "title": "Veri Toplama, Çetele ve Sıklık Tablosu - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.3.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-34-2",
                "title": "Veri Toplama, Çetele ve Sıklık Tablosu - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.3.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Sütun Grafiği Çizme ve Yorumlama",
            "week": 35,
            "subtopics": [
              {
                "id": "MAT-5-35-1",
                "title": "Sütun Grafiği Çizme ve Yorumlama - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.3.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-35-2",
                "title": "Sütun Grafiği Çizme ve Yorumlama - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.3.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "5. Sınıf Yıl Sonu Bütüncül Sayısal Prova",
            "week": 36,
            "subtopics": [
              {
                "id": "MAT-5-36-1",
                "title": "5. Sınıf Yıl Sonu Bütüncül Sayısal Prova - Temel Kavramlar ve Tanımlar",
                "outcome": "M.5.LGS.01",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-5-36-2",
                "title": "5. Sınıf Yıl Sonu Bütüncül Sayısal Prova - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.5.LGS.01.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      }
    ]
  },
  "fen": {
    "courseName": "Fen Bilimleri",
    "grade": 5,
    "totalUnits": 9,
    "units": [
      {
        "unitId": "FEN-5-U1",
        "unitTitle": "1. Ünite: Güneş'in Yapısı ve Dönme Hareketi ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Güneş'in Yapısı ve Dönme Hareketi",
            "week": 1,
            "subtopics": [
              {
                "id": "FEN-5-1-1",
                "title": "Güneş'in Yapısı ve Dönme Hareketi - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.1.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-1-2",
                "title": "Güneş'in Yapısı ve Dönme Hareketi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.1.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Ay'ın Yapısı, Atmosferi ve Yüzey Şekilleri",
            "week": 2,
            "subtopics": [
              {
                "id": "FEN-5-2-1",
                "title": "Ay'ın Yapısı, Atmosferi ve Yüzey Şekilleri - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.1.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-2-2",
                "title": "Ay'ın Yapısı, Atmosferi ve Yüzey Şekilleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.1.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Ay'ın Hareketleri ve Evreleri (Ana ve Ara Evreler)",
            "week": 3,
            "subtopics": [
              {
                "id": "FEN-5-3-1",
                "title": "Ay'ın Hareketleri ve Evreleri - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.1.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-3-2",
                "title": "Ay'ın Hareketleri ve Evreleri: Ana ve Ara Evreler",
                "outcome": "F.5.1.3.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-5-3-3",
                "title": "Ay'ın Hareketleri ve Evreleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.1.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Güneş, Dünya ve Ay'ın Birbirine Göre Hareketleri",
            "week": 4,
            "subtopics": [
              {
                "id": "FEN-5-4-1",
                "title": "Güneş, Dünya ve Ay'ın Birbirine Göre Hareketleri - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.1.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-4-2",
                "title": "Güneş, Dünya ve Ay'ın Birbirine Göre Hareketleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.1.4.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-5-U2",
        "unitTitle": "2. Ünite: Canlıların Sınıflandırılması ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Canlıların Sınıflandırılması: Mikroskobik Canlılar",
            "week": 5,
            "subtopics": [
              {
                "id": "FEN-5-5-1",
                "title": "Canlıların Sınıflandırılması: Mikroskobik Canlılar - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.2.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-5-2",
                "title": "Canlıların Sınıflandırılması: Mikroskobik Canlılar - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.2.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Mantarlar Dünyası (Şapkalı, Küf, Maya, Parazit)",
            "week": 6,
            "subtopics": [
              {
                "id": "FEN-5-6-1",
                "title": "Mantarlar Dünyası - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.2.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-6-2",
                "title": "Mantarlar Dünyası: Şapkalı",
                "outcome": "F.5.2.1.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-5-6-3",
                "title": "Mantarlar Dünyası: Küf",
                "outcome": "F.5.2.1.2.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-5-6-4",
                "title": "Mantarlar Dünyası: Maya",
                "outcome": "F.5.2.1.2.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-5-6-5",
                "title": "Mantarlar Dünyası: Parazit",
                "outcome": "F.5.2.1.2.4",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-5-6-6",
                "title": "Mantarlar Dünyası - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.2.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Bitkiler Dünyası (Çiçekli ve Çiçeksiz Bitkiler)",
            "week": 7,
            "subtopics": [
              {
                "id": "FEN-5-7-1",
                "title": "Bitkiler Dünyası - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.2.1.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-7-2",
                "title": "Bitkiler Dünyası: Çiçekli ve Çiçeksiz Bitkiler",
                "outcome": "F.5.2.1.3.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-5-7-3",
                "title": "Bitkiler Dünyası - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.2.1.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Hayvanlar Dünyası (Omurgalı ve Omurgasız Hayvanlar)",
            "week": 8,
            "subtopics": [
              {
                "id": "FEN-5-8-1",
                "title": "Hayvanlar Dünyası - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.2.1.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-8-2",
                "title": "Hayvanlar Dünyası: Omurgalı ve Omurgasız Hayvanlar",
                "outcome": "F.5.2.1.4.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-5-8-3",
                "title": "Hayvanlar Dünyası - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.2.1.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-5-U3",
        "unitTitle": "3. Ünite: Kuvvetin Ölçülmesi ve Dinamometre ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Kuvvetin Ölçülmesi ve Dinamometre",
            "week": 9,
            "subtopics": [
              {
                "id": "FEN-5-9-1",
                "title": "Kuvvetin Ölçülmesi ve Dinamometre - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.3.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-9-2",
                "title": "Kuvvetin Ölçülmesi ve Dinamometre - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.3.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Sürtünme Kuvveti ve Harekete Etkisi (Katı Yüzeyler)",
            "week": 10,
            "subtopics": [
              {
                "id": "FEN-5-10-1",
                "title": "Sürtünme Kuvveti ve Harekete Etkisi - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.3.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-10-2",
                "title": "Sürtünme Kuvveti ve Harekete Etkisi: Katı Yüzeyler",
                "outcome": "F.5.3.2.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-5-10-3",
                "title": "Sürtünme Kuvveti ve Harekete Etkisi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.3.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Hava ve Su Direnci (Sürtünmenin Teknolojideki Yeri)",
            "week": 11,
            "subtopics": [
              {
                "id": "FEN-5-11-1",
                "title": "Hava ve Su Direnci - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.3.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-11-2",
                "title": "Hava ve Su Direnci: Sürtünmenin Teknolojideki Yeri",
                "outcome": "F.5.3.2.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-5-11-3",
                "title": "Hava ve Su Direnci - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.3.2.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Maddenin Hâl Değişimi: Erime ve Donma",
            "week": 12,
            "subtopics": [
              {
                "id": "FEN-5-12-1",
                "title": "Maddenin Hâl Değişimi: Erime ve Donma - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.4.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-12-2",
                "title": "Maddenin Hâl Değişimi: Erime ve Donma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.4.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-5-U4",
        "unitTitle": "4. Ünite: Buharlaşma, Kaynama ve Yoğuşma ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Buharlaşma, Kaynama ve Yoğuşma",
            "week": 13,
            "subtopics": [
              {
                "id": "FEN-5-13-1",
                "title": "Buharlaşma, Kaynama ve Yoğuşma - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.4.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-13-2",
                "title": "Buharlaşma, Kaynama ve Yoğuşma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.4.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Süblimleşme ve Kırağılaşma",
            "week": 14,
            "subtopics": [
              {
                "id": "FEN-5-14-1",
                "title": "Süblimleşme ve Kırağılaşma - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.4.1.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-14-2",
                "title": "Süblimleşme ve Kırağılaşma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.4.1.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Maddenin Ayırt Edici Özellikleri: Erime ve Donma Noktası",
            "week": 15,
            "subtopics": [
              {
                "id": "FEN-5-15-1",
                "title": "Maddenin Ayırt Edici Özellikleri: Erime ve Donma Noktası - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.4.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-15-2",
                "title": "Maddenin Ayırt Edici Özellikleri: Erime ve Donma Noktası - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.4.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Kaynama Noktası ve Saf Maddeler",
            "week": 16,
            "subtopics": [
              {
                "id": "FEN-5-16-1",
                "title": "Kaynama Noktası ve Saf Maddeler - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.4.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-16-2",
                "title": "Kaynama Noktası ve Saf Maddeler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.4.2.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-5-U5",
        "unitTitle": "5. Ünite: Isı ve Sıcaklık Arasındaki Farklar ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Isı ve Sıcaklık Arasındaki Farklar",
            "week": 17,
            "subtopics": [
              {
                "id": "FEN-5-17-1",
                "title": "Isı ve Sıcaklık Arasındaki Farklar - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.4.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-17-2",
                "title": "Isı ve Sıcaklık Arasındaki Farklar - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.4.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Isı Alışverişi ve Termal Denge",
            "week": 18,
            "subtopics": [
              {
                "id": "FEN-5-18-1",
                "title": "Isı Alışverişi ve Termal Denge - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.4.3.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-18-2",
                "title": "Isı Alışverişi ve Termal Denge - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.4.3.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Genleşme ve Büzülme Olayları (Katı, Sıvı, Gaz)",
            "week": 19,
            "subtopics": [
              {
                "id": "FEN-5-19-1",
                "title": "Genleşme ve Büzülme Olayları - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.4.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-19-2",
                "title": "Genleşme ve Büzülme Olayları: Katı",
                "outcome": "F.5.4.4.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-5-19-3",
                "title": "Genleşme ve Büzülme Olayları: Sıvı",
                "outcome": "F.5.4.4.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-5-19-4",
                "title": "Genleşme ve Büzülme Olayları: Gaz",
                "outcome": "F.5.4.4.1.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-5-19-5",
                "title": "Genleşme ve Büzülme Olayları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.4.4.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Işığın Doğrusal Yayılması ve Işık Işını",
            "week": 20,
            "subtopics": [
              {
                "id": "FEN-5-20-1",
                "title": "Işığın Doğrusal Yayılması ve Işık Işını - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.5.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-20-2",
                "title": "Işığın Doğrusal Yayılması ve Işık Işını - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.5.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-5-U6",
        "unitTitle": "6. Ünite: Işığın Yansıması ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Işığın Yansıması: Düzgün ve Dağınık Yansıma",
            "week": 21,
            "subtopics": [
              {
                "id": "FEN-5-21-1",
                "title": "Işığın Yansıması: Düzgün ve Dağınık Yansıma - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.5.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-21-2",
                "title": "Işığın Yansıması: Düzgün ve Dağınık Yansıma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.5.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Yansıma Kanunları (Gelen Işın, Normal, Yansıyan Işın)",
            "week": 22,
            "subtopics": [
              {
                "id": "FEN-5-22-1",
                "title": "Yansıma Kanunları - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.5.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-22-2",
                "title": "Yansıma Kanunları: Gelen Işın",
                "outcome": "F.5.5.2.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-5-22-3",
                "title": "Yansıma Kanunları: Normal",
                "outcome": "F.5.5.2.2.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-5-22-4",
                "title": "Yansıma Kanunları: Yansıyan Işın",
                "outcome": "F.5.5.2.2.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-5-22-5",
                "title": "Yansıma Kanunları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.5.2.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Işığın Maddeyle Karşılaşması: Saydam, Yarı Saydam, Opak",
            "week": 23,
            "subtopics": [
              {
                "id": "FEN-5-23-1",
                "title": "Işığın Maddeyle Karşılaşması: Saydam, Yarı Saydam, Opak - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.5.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-23-2",
                "title": "Işığın Maddeyle Karşılaşması: Saydam, Yarı Saydam, Opak - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.5.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Tam Gölge Oluşumu ve Gölge Boyunu Etkileyen Değişkenler",
            "week": 24,
            "subtopics": [
              {
                "id": "FEN-5-24-1",
                "title": "Tam Gölge Oluşumu ve Gölge Boyunu Etkileyen Değişkenler - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.5.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-24-2",
                "title": "Tam Gölge Oluşumu ve Gölge Boyunu Etkileyen Değişkenler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.5.4.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-5-U7",
        "unitTitle": "7. Ünite: Biyoçeşitlilik ve Ülkemizin Biyolojik Zenginlikleri ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Biyoçeşitlilik ve Ülkemizin Biyolojik Zenginlikleri",
            "week": 25,
            "subtopics": [
              {
                "id": "FEN-5-25-1",
                "title": "Biyoçeşitlilik ve Ülkemizin Biyolojik Zenginlikleri - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.6.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-25-2",
                "title": "Biyoçeşitlilik ve Ülkemizin Biyolojik Zenginlikleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.6.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Nesli Tükenen ve Tükenme Tehlikesinde Olan Canlılar",
            "week": 26,
            "subtopics": [
              {
                "id": "FEN-5-26-1",
                "title": "Nesli Tükenen ve Tükenme Tehlikesinde Olan Canlılar - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.6.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-26-2",
                "title": "Nesli Tükenen ve Tükenme Tehlikesinde Olan Canlılar - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.6.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "İnsan ve Çevre İlişkisi: Çevre Kirliliği Çeşitleri",
            "week": 27,
            "subtopics": [
              {
                "id": "FEN-5-27-1",
                "title": "İnsan ve Çevre İlişkisi: Çevre Kirliliği Çeşitleri - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.6.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-27-2",
                "title": "İnsan ve Çevre İlişkisi: Çevre Kirliliği Çeşitleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.6.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Yıkıcı Doğa Olayları: Deprem, Sel, Heyelan, Fırtına, Volkan",
            "week": 28,
            "subtopics": [
              {
                "id": "FEN-5-28-1",
                "title": "Yıkıcı Doğa Olayları: Deprem, Sel, Heyelan, Fırtına, Volkan - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.6.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-28-2",
                "title": "Yıkıcı Doğa Olayları: Deprem, Sel, Heyelan, Fırtına, Volkan - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.6.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-5-U8",
        "unitTitle": "8. Ünite: Doğal Afetlerden Korunma Yolları ve Bilinçlenme ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Doğal Afetlerden Korunma Yolları ve Bilinçlenme",
            "week": 29,
            "subtopics": [
              {
                "id": "FEN-5-29-1",
                "title": "Doğal Afetlerden Korunma Yolları ve Bilinçlenme - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.6.3.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-29-2",
                "title": "Doğal Afetlerden Korunma Yolları ve Bilinçlenme - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.6.3.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Basit Elektrik Devresi Elemanları ve Sembolleri",
            "week": 30,
            "subtopics": [
              {
                "id": "FEN-5-30-1",
                "title": "Basit Elektrik Devresi Elemanları ve Sembolleri - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.7.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-30-2",
                "title": "Basit Elektrik Devresi Elemanları ve Sembolleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.7.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Devre Şeması Çizimi ve Kurulumu",
            "week": 31,
            "subtopics": [
              {
                "id": "FEN-5-31-1",
                "title": "Devre Şeması Çizimi ve Kurulumu - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.7.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-31-2",
                "title": "Devre Şeması Çizimi ve Kurulumu - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.7.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Ampul Parlaklığını Etkileyen Değişkenler (Pil Sayısı)",
            "week": 32,
            "subtopics": [
              {
                "id": "FEN-5-32-1",
                "title": "Ampul Parlaklığını Etkileyen Değişkenler - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.7.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-32-2",
                "title": "Ampul Parlaklığını Etkileyen Değişkenler: Pil Sayısı",
                "outcome": "F.5.7.2.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-5-32-3",
                "title": "Ampul Parlaklığını Etkileyen Değişkenler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.7.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-5-U9",
        "unitTitle": "9. Ünite: Ampul Parlaklığını Etkileyen Değişkenler ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Ampul Parlaklığını Etkileyen Değişkenler (Ampul Sayısı)",
            "week": 33,
            "subtopics": [
              {
                "id": "FEN-5-33-1",
                "title": "Ampul Parlaklığını Etkileyen Değişkenler - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.7.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-33-2",
                "title": "Ampul Parlaklığını Etkileyen Değişkenler: Ampul Sayısı",
                "outcome": "F.5.7.2.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-5-33-3",
                "title": "Ampul Parlaklığını Etkileyen Değişkenler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.7.2.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Bağımlı, Bağımsız ve Sabit Tutulan Değişken Deneyleri",
            "week": 34,
            "subtopics": [
              {
                "id": "FEN-5-34-1",
                "title": "Bağımlı, Bağımsız ve Sabit Tutulan Değişken Deneyleri - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.7.2.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-34-2",
                "title": "Bağımlı, Bağımsız ve Sabit Tutulan Değişken Deneyleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.7.2.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "5. Sınıf Fen Bilimleri Bütüncül Deneme - I",
            "week": 35,
            "subtopics": [
              {
                "id": "FEN-5-35-1",
                "title": "5. Sınıf Fen Bilimleri Bütüncül Deneme - I - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.LGS.01",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-35-2",
                "title": "5. Sınıf Fen Bilimleri Bütüncül Deneme - I - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.LGS.01.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "5. Sınıf Fen Bilimleri Bütüncül Deneme - II",
            "week": 36,
            "subtopics": [
              {
                "id": "FEN-5-36-1",
                "title": "5. Sınıf Fen Bilimleri Bütüncül Deneme - II - Temel Kavramlar ve Tanımlar",
                "outcome": "F.5.LGS.02",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-5-36-2",
                "title": "5. Sınıf Fen Bilimleri Bütüncül Deneme - II - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.5.LGS.02.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      }
    ]
  },
  "sosyal": {
    "courseName": "Sosyal Bilgiler",
    "grade": 5,
    "totalUnits": 9,
    "units": [
      {
        "unitId": "SOS-5-U1",
        "unitTitle": "1. Ünite: Sosyal Bilgiler Dersi ve Bize Kazandırdıkları ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Sosyal Bilgiler Dersi ve Bize Kazandırdıkları",
            "week": 1,
            "subtopics": [
              {
                "id": "SOS-5-1-1",
                "title": "Sosyal Bilgiler Dersi ve Bize Kazandırdıkları - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-1-2",
                "title": "Sosyal Bilgiler Dersi ve Bize Kazandırdıkları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Yeni Bir Kulüpteyim: Hak ve Sorumluluklarım",
            "week": 2,
            "subtopics": [
              {
                "id": "SOS-5-2-1",
                "title": "Yeni Bir Kulüpteyim: Hak ve Sorumluluklarım - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-2-2",
                "title": "Yeni Bir Kulüpteyim: Hak ve Sorumluluklarım - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Çocuk Hakları ve Dünya Çocukları",
            "week": 3,
            "subtopics": [
              {
                "id": "SOS-5-3-1",
                "title": "Çocuk Hakları ve Dünya Çocukları - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.1.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-3-2",
                "title": "Çocuk Hakları ve Dünya Çocukları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.1.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Tarihe Yolculuk: Anadolu ve Mezopotamya Uygarlıkları",
            "week": 4,
            "subtopics": [
              {
                "id": "SOS-5-4-1",
                "title": "Tarihe Yolculuk: Anadolu ve Mezopotamya Uygarlıkları - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-4-2",
                "title": "Tarihe Yolculuk: Anadolu ve Mezopotamya Uygarlıkları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-5-U2",
        "unitTitle": "2. Ünite: Güzel Ülkem ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Güzel Ülkem: Doğal Varlıklar ve Tarihî Eserler",
            "week": 5,
            "subtopics": [
              {
                "id": "SOS-5-5-1",
                "title": "Güzel Ülkem: Doğal Varlıklar ve Tarihî Eserler - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-5-2",
                "title": "Güzel Ülkem: Doğal Varlıklar ve Tarihî Eserler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.2.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Kültürel Zenginliğimiz: Bayramlarımız ve Geleneklerimiz",
            "week": 6,
            "subtopics": [
              {
                "id": "SOS-5-6-1",
                "title": "Kültürel Zenginliğimiz: Bayramlarımız ve Geleneklerimiz - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.2.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-6-2",
                "title": "Kültürel Zenginliğimiz: Bayramlarımız ve Geleneklerimiz - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.2.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Geçmişten Günümüze Kültürel Değişim",
            "week": 7,
            "subtopics": [
              {
                "id": "SOS-5-7-1",
                "title": "Geçmişten Günümüze Kültürel Değişim - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.2.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-7-2",
                "title": "Geçmişten Günümüze Kültürel Değişim - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.2.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Haritayı Tanıyorum: Yeryüzü Şekilleri ve Renkler",
            "week": 8,
            "subtopics": [
              {
                "id": "SOS-5-8-1",
                "title": "Haritayı Tanıyorum: Yeryüzü Şekilleri ve Renkler - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-8-2",
                "title": "Haritayı Tanıyorum: Yeryüzü Şekilleri ve Renkler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-5-U3",
        "unitTitle": "3. Ünite: İklim ve İnsan Faaliyetleri ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "İklim ve İnsan Faaliyetleri (Karadeniz, Akdeniz, Karasal)",
            "week": 9,
            "subtopics": [
              {
                "id": "SOS-5-9-1",
                "title": "İklim ve İnsan Faaliyetleri - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.3.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-9-2",
                "title": "İklim ve İnsan Faaliyetleri: Karadeniz",
                "outcome": "SB.5.3.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "SOS-5-9-3",
                "title": "İklim ve İnsan Faaliyetleri: Akdeniz",
                "outcome": "SB.5.3.2.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "SOS-5-9-4",
                "title": "İklim ve İnsan Faaliyetleri: Karasal",
                "outcome": "SB.5.3.2.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "SOS-5-9-5",
                "title": "İklim ve İnsan Faaliyetleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.3.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Nüfus ve Yerleşmeyi Etkileyen Doğal ve Beşerî Faktörler",
            "week": 10,
            "subtopics": [
              {
                "id": "SOS-5-10-1",
                "title": "Nüfus ve Yerleşmeyi Etkileyen Doğal ve Beşerî Faktörler - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.3.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-10-2",
                "title": "Nüfus ve Yerleşmeyi Etkileyen Doğal ve Beşerî Faktörler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.3.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Afetler ve Çevre Sorunları",
            "week": 11,
            "subtopics": [
              {
                "id": "SOS-5-11-1",
                "title": "Afetler ve Çevre Sorunları - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.3.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-11-2",
                "title": "Afetler ve Çevre Sorunları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.3.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Teknoloji ve Toplum: Doğru ve Güvenli İnternet Kullanımı",
            "week": 12,
            "subtopics": [
              {
                "id": "SOS-5-12-1",
                "title": "Teknoloji ve Toplum: Doğru ve Güvenli İnternet Kullanımı - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-12-2",
                "title": "Teknoloji ve Toplum: Doğru ve Güvenli İnternet Kullanımı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.4.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-5-U4",
        "unitTitle": "4. Ünite: Bilgi Kaynaklarını Değerlendirme ve Bilimsel Etik ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Bilgi Kaynaklarını Değerlendirme ve Bilimsel Etik",
            "week": 13,
            "subtopics": [
              {
                "id": "SOS-5-13-1",
                "title": "Bilgi Kaynaklarını Değerlendirme ve Bilimsel Etik - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.4.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-13-2",
                "title": "Bilgi Kaynaklarını Değerlendirme ve Bilimsel Etik - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.4.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Buluşlar ve Bilim İnsanlarının Ortak Özellikleri",
            "week": 14,
            "subtopics": [
              {
                "id": "SOS-5-14-1",
                "title": "Buluşlar ve Bilim İnsanlarının Ortak Özellikleri - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.4.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-14-2",
                "title": "Buluşlar ve Bilim İnsanlarının Ortak Özellikleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.4.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Fikir Hakları, Telif ve Patent",
            "week": 15,
            "subtopics": [
              {
                "id": "SOS-5-15-1",
                "title": "Fikir Hakları, Telif ve Patent - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.4.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-15-2",
                "title": "Fikir Hakları, Telif ve Patent - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.4.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Çevremizdeki Ekonomik Faaliyetler (Tarım, Sanayi, Hizmet)",
            "week": 16,
            "subtopics": [
              {
                "id": "SOS-5-16-1",
                "title": "Çevremizdeki Ekonomik Faaliyetler - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.5.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-16-2",
                "title": "Çevremizdeki Ekonomik Faaliyetler: Tarım",
                "outcome": "SB.5.5.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "SOS-5-16-3",
                "title": "Çevremizdeki Ekonomik Faaliyetler: Sanayi",
                "outcome": "SB.5.5.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "SOS-5-16-4",
                "title": "Çevremizdeki Ekonomik Faaliyetler: Hizmet",
                "outcome": "SB.5.5.1.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "SOS-5-16-5",
                "title": "Çevremizdeki Ekonomik Faaliyetler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.5.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-5-U5",
        "unitTitle": "5. Ünite: Ekonomik Faaliyetlerin Mesleklere Etkisi ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Ekonomik Faaliyetlerin Mesleklere Etkisi",
            "week": 17,
            "subtopics": [
              {
                "id": "SOS-5-17-1",
                "title": "Ekonomik Faaliyetlerin Mesleklere Etkisi - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.5.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-17-2",
                "title": "Ekonomik Faaliyetlerin Mesleklere Etkisi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.5.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Ekonomi ve Yaşam: Üretimden Tüketime Yolculuk",
            "week": 18,
            "subtopics": [
              {
                "id": "SOS-5-18-1",
                "title": "Ekonomi ve Yaşam: Üretimden Tüketime Yolculuk - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.5.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-18-2",
                "title": "Ekonomi ve Yaşam: Üretimden Tüketime Yolculuk - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.5.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Bilinçli Tüketici Hakları ve Bütçe Planlama",
            "week": 19,
            "subtopics": [
              {
                "id": "SOS-5-19-1",
                "title": "Bilinçli Tüketici Hakları ve Bütçe Planlama - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.5.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-19-2",
                "title": "Bilinçli Tüketici Hakları ve Bütçe Planlama - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.5.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Halka Hizmet Veren Kurumlar (Bakanlıklar, Belediyeler)",
            "week": 20,
            "subtopics": [
              {
                "id": "SOS-5-20-1",
                "title": "Halka Hizmet Veren Kurumlar - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.6.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-20-2",
                "title": "Halka Hizmet Veren Kurumlar: Bakanlıklar",
                "outcome": "SB.5.6.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "SOS-5-20-3",
                "title": "Halka Hizmet Veren Kurumlar: Belediyeler",
                "outcome": "SB.5.6.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "SOS-5-20-4",
                "title": "Halka Hizmet Veren Kurumlar - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.6.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-5-U6",
        "unitTitle": "6. Ünite: Sivil Toplum Kuruluşları ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Sivil Toplum Kuruluşları (STK) ve Dayanışma",
            "week": 21,
            "subtopics": [
              {
                "id": "SOS-5-21-1",
                "title": "Sivil Toplum Kuruluşları  ve Dayanışma - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.6.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-21-2",
                "title": "Sivil Toplum Kuruluşları  ve Dayanışma: STK",
                "outcome": "SB.5.6.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "SOS-5-21-3",
                "title": "Sivil Toplum Kuruluşları  ve Dayanışma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.6.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Yerel Yönetimler: Valilik, Kaymakamlık, Muhtarlık",
            "week": 22,
            "subtopics": [
              {
                "id": "SOS-5-22-1",
                "title": "Yerel Yönetimler: Valilik, Kaymakamlık, Muhtarlık - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.6.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-22-2",
                "title": "Yerel Yönetimler: Valilik, Kaymakamlık, Muhtarlık - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.6.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Egemenlik ve Bağımsızlık Sembollerimiz",
            "week": 23,
            "subtopics": [
              {
                "id": "SOS-5-23-1",
                "title": "Egemenlik ve Bağımsızlık Sembollerimiz - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.6.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-23-2",
                "title": "Egemenlik ve Bağımsızlık Sembollerimiz - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.6.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Yaşadığım Çevrenin Yönetimi",
            "week": 24,
            "subtopics": [
              {
                "id": "SOS-5-24-1",
                "title": "Yaşadığım Çevrenin Yönetimi - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.6.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-24-2",
                "title": "Yaşadığım Çevrenin Yönetimi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.6.5.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-5-U7",
        "unitTitle": "7. Ünite: Ülkeler Arası Ekonomik İlişkiler ve Ticaret ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Ülkeler Arası Ekonomik İlişkiler ve Ticaret",
            "week": 25,
            "subtopics": [
              {
                "id": "SOS-5-25-1",
                "title": "Ülkeler Arası Ekonomik İlişkiler ve Ticaret - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.7.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-25-2",
                "title": "Ülkeler Arası Ekonomik İlişkiler ve Ticaret - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.7.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Kültür Elçileri ve Uluslararası Ortak Miras",
            "week": 26,
            "subtopics": [
              {
                "id": "SOS-5-26-1",
                "title": "Kültür Elçileri ve Uluslararası Ortak Miras - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.7.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-26-2",
                "title": "Kültür Elçileri ve Uluslararası Ortak Miras - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.7.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Dünya Çocuk Oyunları ve Evrensel Değerler",
            "week": 27,
            "subtopics": [
              {
                "id": "SOS-5-27-1",
                "title": "Dünya Çocuk Oyunları ve Evrensel Değerler - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.7.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-27-2",
                "title": "Dünya Çocuk Oyunları ve Evrensel Değerler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.7.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Turizm ve Kültürlerarası Etkileşim",
            "week": 28,
            "subtopics": [
              {
                "id": "SOS-5-28-1",
                "title": "Turizm ve Kültürlerarası Etkileşim - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.7.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-28-2",
                "title": "Turizm ve Kültürlerarası Etkileşim - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.7.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-5-U8",
        "unitTitle": "8. Ünite: Doğal Çevreyi Koruma ve Sürdürülebilirlik Bilinci ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Doğal Çevreyi Koruma ve Sürdürülebilirlik Bilinci",
            "week": 29,
            "subtopics": [
              {
                "id": "SOS-5-29-1",
                "title": "Doğal Çevreyi Koruma ve Sürdürülebilirlik Bilinci - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.3.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-29-2",
                "title": "Doğal Çevreyi Koruma ve Sürdürülebilirlik Bilinci - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.3.5.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Girişimcilik ve Yeni İş Fikirleri",
            "week": 30,
            "subtopics": [
              {
                "id": "SOS-5-30-1",
                "title": "Girişimcilik ve Yeni İş Fikirleri - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.5.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-30-2",
                "title": "Girişimcilik ve Yeni İş Fikirleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.5.5.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Yardımlaşma ve Paylaşma Kültürü (Kızılay, Yeşilay)",
            "week": 31,
            "subtopics": [
              {
                "id": "SOS-5-31-1",
                "title": "Yardımlaşma ve Paylaşma Kültürü - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.6.6",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-31-2",
                "title": "Yardımlaşma ve Paylaşma Kültürü: Kızılay",
                "outcome": "SB.5.6.6.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "SOS-5-31-3",
                "title": "Yardımlaşma ve Paylaşma Kültürü: Yeşilay",
                "outcome": "SB.5.6.6.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "SOS-5-31-4",
                "title": "Yardımlaşma ve Paylaşma Kültürü - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.6.6.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Cumhuriyetimizin Kuruluş Felsefesi ve Değerleri",
            "week": 32,
            "subtopics": [
              {
                "id": "SOS-5-32-1",
                "title": "Cumhuriyetimizin Kuruluş Felsefesi ve Değerleri - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.6.7",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-32-2",
                "title": "Cumhuriyetimizin Kuruluş Felsefesi ve Değerleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.6.7.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-5-U9",
        "unitTitle": "9. Ünite: Karma Sosyal Bilgiler Kazanım Denemesi - I ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Karma Sosyal Bilgiler Kazanım Denemesi - I",
            "week": 33,
            "subtopics": [
              {
                "id": "SOS-5-33-1",
                "title": "Karma Sosyal Bilgiler Kazanım Denemesi - I - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.LGS.01",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-33-2",
                "title": "Karma Sosyal Bilgiler Kazanım Denemesi - I - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.LGS.01.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Karma Sosyal Bilgiler Kazanım Denemesi - II",
            "week": 34,
            "subtopics": [
              {
                "id": "SOS-5-34-1",
                "title": "Karma Sosyal Bilgiler Kazanım Denemesi - II - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.LGS.02",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-34-2",
                "title": "Karma Sosyal Bilgiler Kazanım Denemesi - II - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.LGS.02.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "5. Sınıf Sosyal Bilgiler Yıl Sonu Denemesi - I",
            "week": 35,
            "subtopics": [
              {
                "id": "SOS-5-35-1",
                "title": "5. Sınıf Sosyal Bilgiler Yıl Sonu Denemesi - I - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.LGS.03",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-35-2",
                "title": "5. Sınıf Sosyal Bilgiler Yıl Sonu Denemesi - I - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.LGS.03.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "5. Sınıf Sosyal Bilgiler Yıl Sonu Denemesi - II",
            "week": 36,
            "subtopics": [
              {
                "id": "SOS-5-36-1",
                "title": "5. Sınıf Sosyal Bilgiler Yıl Sonu Denemesi - II - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.5.LGS.04",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-5-36-2",
                "title": "5. Sınıf Sosyal Bilgiler Yıl Sonu Denemesi - II - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.5.LGS.04.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      }
    ]
  }
};

export const MEB_GRANULAR_CURRICULUM_GRADE_6 = {
  "turkce": {
    "courseName": "Türkçe",
    "grade": 6,
    "totalUnits": 9,
    "units": [
      {
        "unitId": "TUR-6-U1",
        "unitTitle": "1. Ünite: Sözcükte Anlam ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Sözcükte Anlam (Mecaz, Terim, Söz Öbekleri)",
            "week": 1,
            "subtopics": [
              {
                "id": "TUR-6-1-1",
                "title": "Sözcükte Anlam - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-1-2",
                "title": "Sözcükte Anlam: Mecaz",
                "outcome": "T.6.1.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-6-1-3",
                "title": "Sözcükte Anlam: Terim",
                "outcome": "T.6.1.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TUR-6-1-4",
                "title": "Sözcükte Anlam: Söz Öbekleri",
                "outcome": "T.6.1.1.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TUR-6-1-5",
                "title": "Sözcükte Anlam - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Sözcüğün Yapısı: Kökler (İsim ve Fiil Kökü)",
            "week": 2,
            "subtopics": [
              {
                "id": "TUR-6-2-1",
                "title": "Sözcüğün Yapısı: Kökler - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-2-2",
                "title": "Sözcüğün Yapısı: Kökler: İsim ve Fiil Kökü",
                "outcome": "T.6.4.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-6-2-3",
                "title": "Sözcüğün Yapısı: Kökler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.4.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Sözcüğün Yapısı: Yapım Ekleri ve Gövde",
            "week": 3,
            "subtopics": [
              {
                "id": "TUR-6-3-1",
                "title": "Sözcüğün Yapısı: Yapım Ekleri ve Gövde - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.4.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-3-2",
                "title": "Sözcüğün Yapısı: Yapım Ekleri ve Gövde - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.4.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Sözcüğün Yapısı: Çekim Ekleri (İsim Çekim Ekleri)",
            "week": 4,
            "subtopics": [
              {
                "id": "TUR-6-4-1",
                "title": "Sözcüğün Yapısı: Çekim Ekleri - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.4.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-4-2",
                "title": "Sözcüğün Yapısı: Çekim Ekleri: İsim Çekim Ekleri",
                "outcome": "T.6.4.3.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-6-4-3",
                "title": "Sözcüğün Yapısı: Çekim Ekleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.4.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-6-U2",
        "unitTitle": "2. Ünite: Basit, Türemiş ve Birleşik Sözcükler ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Basit, Türemiş ve Birleşik Sözcükler",
            "week": 5,
            "subtopics": [
              {
                "id": "TUR-6-5-1",
                "title": "Basit, Türemiş ve Birleşik Sözcükler - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.4.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-5-2",
                "title": "Basit, Türemiş ve Birleşik Sözcükler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.4.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "İsimler (Adlar): Varlıklara Verilişine Göre İsimler",
            "week": 6,
            "subtopics": [
              {
                "id": "TUR-6-6-1",
                "title": "İsimler : Varlıklara Verilişine Göre İsimler - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.4.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-6-2",
                "title": "İsimler : Varlıklara Verilişine Göre İsimler: Adlar",
                "outcome": "T.6.4.5.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-6-6-3",
                "title": "İsimler : Varlıklara Verilişine Göre İsimler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.4.5.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "İsim Tamlamaları (Belirtili, Belirtisiz, Zincirleme)",
            "week": 7,
            "subtopics": [
              {
                "id": "TUR-6-7-1",
                "title": "İsim Tamlamaları - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.4.6",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-7-2",
                "title": "İsim Tamlamaları: Belirtili",
                "outcome": "T.6.4.6.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-6-7-3",
                "title": "İsim Tamlamaları: Belirtisiz",
                "outcome": "T.6.4.6.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TUR-6-7-4",
                "title": "İsim Tamlamaları: Zincirleme",
                "outcome": "T.6.4.6.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TUR-6-7-5",
                "title": "İsim Tamlamaları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.4.6.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Sıfatlar (Ön Adlar): Niteleme ve Belirtme Sıfatları",
            "week": 8,
            "subtopics": [
              {
                "id": "TUR-6-8-1",
                "title": "Sıfatlar : Niteleme ve Belirtme Sıfatları - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.4.7",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-8-2",
                "title": "Sıfatlar : Niteleme ve Belirtme Sıfatları: Ön Adlar",
                "outcome": "T.6.4.7.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-6-8-3",
                "title": "Sıfatlar : Niteleme ve Belirtme Sıfatları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.4.7.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-6-U3",
        "unitTitle": "3. Ünite: Sıfat Tamlamaları ve Metindeki İşlevleri ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Sıfat Tamlamaları ve Metindeki İşlevleri",
            "week": 9,
            "subtopics": [
              {
                "id": "TUR-6-9-1",
                "title": "Sıfat Tamlamaları ve Metindeki İşlevleri - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.4.8",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-9-2",
                "title": "Sıfat Tamlamaları ve Metindeki İşlevleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.4.8.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Zamirler (Adıllar): Kişi, İşaret, Belgisiz, Soru Zamirleri",
            "week": 10,
            "subtopics": [
              {
                "id": "TUR-6-10-1",
                "title": "Zamirler : Kişi, İşaret, Belgisiz, Soru Zamirleri - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.4.9",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-10-2",
                "title": "Zamirler : Kişi, İşaret, Belgisiz, Soru Zamirleri: Adıllar",
                "outcome": "T.6.4.9.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-6-10-3",
                "title": "Zamirler : Kişi, İşaret, Belgisiz, Soru Zamirleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.4.9.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Edat, Bağlaç ve Ünlemler",
            "week": 11,
            "subtopics": [
              {
                "id": "TUR-6-11-1",
                "title": "Edat, Bağlaç ve Ünlemler - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.4.10",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-11-2",
                "title": "Edat, Bağlaç ve Ünlemler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.4.10.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Paragrafta Konu, Ana Fikir ve Başlık",
            "week": 12,
            "subtopics": [
              {
                "id": "TUR-6-12-1",
                "title": "Paragrafta Konu, Ana Fikir ve Başlık - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-12-2",
                "title": "Paragrafta Konu, Ana Fikir ve Başlık - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-6-U4",
        "unitTitle": "4. Ünite: Paragrafta Yardımcı Fikirler ve Değinilmemiştir Soruları ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Paragrafta Yardımcı Fikirler ve Değinilmemiştir Soruları",
            "week": 13,
            "subtopics": [
              {
                "id": "TUR-6-13-1",
                "title": "Paragrafta Yardımcı Fikirler ve Değinilmemiştir Soruları - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.3.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-13-2",
                "title": "Paragrafta Yardımcı Fikirler ve Değinilmemiştir Soruları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.3.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Paragrafın Yapısı: Akışı Bozan Cümle ve İkiye Bölme",
            "week": 14,
            "subtopics": [
              {
                "id": "TUR-6-14-1",
                "title": "Paragrafın Yapısı: Akışı Bozan Cümle ve İkiye Bölme - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.3.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-14-2",
                "title": "Paragrafın Yapısı: Akışı Bozan Cümle ve İkiye Bölme - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.3.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Anlatım Biçimleri: Açıklama ve Tartışma",
            "week": 15,
            "subtopics": [
              {
                "id": "TUR-6-15-1",
                "title": "Anlatım Biçimleri: Açıklama ve Tartışma - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.3.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-15-2",
                "title": "Anlatım Biçimleri: Açıklama ve Tartışma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.3.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Düşünceyi Geliştirme: Benzetme ve Karşılaştırma",
            "week": 16,
            "subtopics": [
              {
                "id": "TUR-6-16-1",
                "title": "Düşünceyi Geliştirme: Benzetme ve Karşılaştırma - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.3.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-16-2",
                "title": "Düşünceyi Geliştirme: Benzetme ve Karşılaştırma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.3.5.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-6-U5",
        "unitTitle": "5. Ünite: Metin Türleri ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Metin Türleri: Tiyatro, Anı (Hatıra) ve Mektup",
            "week": 17,
            "subtopics": [
              {
                "id": "TUR-6-17-1",
                "title": "Metin Türleri: Tiyatro, Anı  ve Mektup - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.3.6",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-17-2",
                "title": "Metin Türleri: Tiyatro, Anı  ve Mektup: Hatıra",
                "outcome": "T.6.3.6.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-6-17-3",
                "title": "Metin Türleri: Tiyatro, Anı  ve Mektup - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.3.6.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Metin Türleri: Gezi Yazısı ve Günlük",
            "week": 18,
            "subtopics": [
              {
                "id": "TUR-6-18-1",
                "title": "Metin Türleri: Gezi Yazısı ve Günlük - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.3.7",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-18-2",
                "title": "Metin Türleri: Gezi Yazısı ve Günlük - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.3.7.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Söz Sanatları: Tezat (Karşıtlık) ve Konuşturma (İntak)",
            "week": 19,
            "subtopics": [
              {
                "id": "TUR-6-19-1",
                "title": "Söz Sanatları: Tezat - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.3.8",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-19-2",
                "title": "Söz Sanatları: Tezat: Karşıtlık",
                "outcome": "T.6.3.8.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-6-19-3",
                "title": "Söz Sanatları: Tezat - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.3.8.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Cümlede Anlam İlişkileri (Neden, Amaç, Koşul)",
            "week": 20,
            "subtopics": [
              {
                "id": "TUR-6-20-1",
                "title": "Cümlede Anlam İlişkileri - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-20-2",
                "title": "Cümlede Anlam İlişkileri: Neden",
                "outcome": "T.6.1.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-6-20-3",
                "title": "Cümlede Anlam İlişkileri: Amaç",
                "outcome": "T.6.1.2.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TUR-6-20-4",
                "title": "Cümlede Anlam İlişkileri: Koşul",
                "outcome": "T.6.1.2.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TUR-6-20-5",
                "title": "Cümlede Anlam İlişkileri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-6-U6",
        "unitTitle": "6. Ünite: Öznel ve Nesnel Anlatım, Doğrudan/Dolaylı Aktarım ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Öznel ve Nesnel Anlatım, Doğrudan/Dolaylı Aktarım",
            "week": 21,
            "subtopics": [
              {
                "id": "TUR-6-21-1",
                "title": "Öznel ve Nesnel Anlatım, Doğrudan/Dolaylı Aktarım - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.1.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-21-2",
                "title": "Öznel ve Nesnel Anlatım, Doğrudan/Dolaylı Aktarım - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.1.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Örtülü Anlam ve Cümle Vurgusu",
            "week": 22,
            "subtopics": [
              {
                "id": "TUR-6-22-1",
                "title": "Örtülü Anlam ve Cümle Vurgusu - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.1.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-22-2",
                "title": "Örtülü Anlam ve Cümle Vurgusu - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.1.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Büyük Harfler ve Birleşik Kelimelerin Yazımı",
            "week": 23,
            "subtopics": [
              {
                "id": "TUR-6-23-1",
                "title": "Büyük Harfler ve Birleşik Kelimelerin Yazımı - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.4.11",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-23-2",
                "title": "Büyük Harfler ve Birleşik Kelimelerin Yazımı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.4.11.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "'de', 'ki' ve 'mi' Ek/Bağlaçlarının Yazımı",
            "week": 24,
            "subtopics": [
              {
                "id": "TUR-6-24-1",
                "title": "'de', 'ki' ve 'mi' Ek/Bağlaçlarının Yazımı - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.4.12",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-24-2",
                "title": "'de', 'ki' ve 'mi' Ek/Bağlaçlarının Yazımı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.4.12.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-6-U7",
        "unitTitle": "7. Ünite: Noktalama ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Noktalama: Noktalı Virgül ve İki Nokta Ayrımı",
            "week": 25,
            "subtopics": [
              {
                "id": "TUR-6-25-1",
                "title": "Noktalama: Noktalı Virgül ve İki Nokta Ayrımı - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.4.13",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-25-2",
                "title": "Noktalama: Noktalı Virgül ve İki Nokta Ayrımı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.4.13.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Noktalama: Yay Ayraç, Köşeli Ayraç ve Kesme İşareti",
            "week": 26,
            "subtopics": [
              {
                "id": "TUR-6-26-1",
                "title": "Noktalama: Yay Ayraç, Köşeli Ayraç ve Kesme İşareti - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.4.14",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-26-2",
                "title": "Noktalama: Yay Ayraç, Köşeli Ayraç ve Kesme İşareti - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.4.14.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Sözel Mantık: İki Değişkenli Tablo Okuma",
            "week": 27,
            "subtopics": [
              {
                "id": "TUR-6-27-1",
                "title": "Sözel Mantık: İki Değişkenli Tablo Okuma - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.3.9",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-27-2",
                "title": "Sözel Mantık: İki Değişkenli Tablo Okuma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.3.9.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Sözel Mantık: Sıralama ve Kısıt Çözümleme",
            "week": 28,
            "subtopics": [
              {
                "id": "TUR-6-28-1",
                "title": "Sözel Mantık: Sıralama ve Kısıt Çözümleme - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.3.10",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-28-2",
                "title": "Sözel Mantık: Sıralama ve Kısıt Çözümleme - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.3.10.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-6-U8",
        "unitTitle": "8. Ünite: Görsel, İnfografik ve Çizgi Grafik Yorumlama ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Görsel, İnfografik ve Çizgi Grafik Yorumlama",
            "week": 29,
            "subtopics": [
              {
                "id": "TUR-6-29-1",
                "title": "Görsel, İnfografik ve Çizgi Grafik Yorumlama - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.3.11",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-29-2",
                "title": "Görsel, İnfografik ve Çizgi Grafik Yorumlama - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.3.11.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Metin Karşılaştırma ve Bakış Açısı Analizi",
            "week": 30,
            "subtopics": [
              {
                "id": "TUR-6-30-1",
                "title": "Metin Karşılaştırma ve Bakış Açısı Analizi - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.3.12",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-30-2",
                "title": "Metin Karşılaştırma ve Bakış Açısı Analizi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.3.12.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Deyim ve Atasözü Eşleme Soruları",
            "week": 31,
            "subtopics": [
              {
                "id": "TUR-6-31-1",
                "title": "Deyim ve Atasözü Eşleme Soruları - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.1.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-31-2",
                "title": "Deyim ve Atasözü Eşleme Soruları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.1.5.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Eleştirel Okuma ve Metin Tahlili",
            "week": 32,
            "subtopics": [
              {
                "id": "TUR-6-32-1",
                "title": "Eleştirel Okuma ve Metin Tahlili - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.3.13",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-32-2",
                "title": "Eleştirel Okuma ve Metin Tahlili - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.3.13.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-6-U9",
        "unitTitle": "9. Ünite: 6. Sınıf Türkçe Kazanım Denemesi - I ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "6. Sınıf Türkçe Kazanım Denemesi - I",
            "week": 33,
            "subtopics": [
              {
                "id": "TUR-6-33-1",
                "title": "6. Sınıf Türkçe Kazanım Denemesi - I - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.LGS.01",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-33-2",
                "title": "6. Sınıf Türkçe Kazanım Denemesi - I - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.LGS.01.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "6. Sınıf Türkçe Kazanım Denemesi - II",
            "week": 34,
            "subtopics": [
              {
                "id": "TUR-6-34-1",
                "title": "6. Sınıf Türkçe Kazanım Denemesi - II - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.LGS.02",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-34-2",
                "title": "6. Sınıf Türkçe Kazanım Denemesi - II - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.LGS.02.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "6. Sınıf Yıl Sonu Bütüncül Sözel Prova - I",
            "week": 35,
            "subtopics": [
              {
                "id": "TUR-6-35-1",
                "title": "6. Sınıf Yıl Sonu Bütüncül Sözel Prova - I - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.LGS.03",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-35-2",
                "title": "6. Sınıf Yıl Sonu Bütüncül Sözel Prova - I - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.LGS.03.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "6. Sınıf Yıl Sonu Bütüncül Sözel Prova - II",
            "week": 36,
            "subtopics": [
              {
                "id": "TUR-6-36-1",
                "title": "6. Sınıf Yıl Sonu Bütüncül Sözel Prova - II - Temel Kavramlar ve Tanımlar",
                "outcome": "T.6.LGS.04",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-6-36-2",
                "title": "6. Sınıf Yıl Sonu Bütüncül Sözel Prova - II - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.6.LGS.04.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      }
    ]
  },
  "matematik": {
    "courseName": "Matematik",
    "grade": 6,
    "totalUnits": 9,
    "units": [
      {
        "unitId": "MAT-6-U1",
        "unitTitle": "1. Ünite: Doğal Sayılarla İşlemler ve İşlem Önceliği ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Doğal Sayılarla İşlemler ve İşlem Önceliği",
            "week": 1,
            "subtopics": [
              {
                "id": "MAT-6-1-1",
                "title": "Doğal Sayılarla İşlemler ve İşlem Önceliği - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-1-2",
                "title": "Doğal Sayılarla İşlemler ve İşlem Önceliği - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Ortak Çarpan Parantezi ve Dağılma Özelliği",
            "week": 2,
            "subtopics": [
              {
                "id": "MAT-6-2-1",
                "title": "Ortak Çarpan Parantezi ve Dağılma Özelliği - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-2-2",
                "title": "Ortak Çarpan Parantezi ve Dağılma Özelliği - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Doğal Sayı Problemleri (Dört İşlem)",
            "week": 3,
            "subtopics": [
              {
                "id": "MAT-6-3-1",
                "title": "Doğal Sayı Problemleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.1.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-3-2",
                "title": "Doğal Sayı Problemleri: Dört İşlem",
                "outcome": "M.6.1.1.3.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-6-3-3",
                "title": "Doğal Sayı Problemleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.1.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Çarpanlar ve Katlar: Doğal Sayıların Çarpanları",
            "week": 4,
            "subtopics": [
              {
                "id": "MAT-6-4-1",
                "title": "Çarpanlar ve Katlar: Doğal Sayıların Çarpanları - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-4-2",
                "title": "Çarpanlar ve Katlar: Doğal Sayıların Çarpanları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-6-U2",
        "unitTitle": "2. Ünite: 2, 3, 4, 5, 6, 9 ve 10 ile Bölünebilme Kuralları ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "2, 3, 4, 5, 6, 9 ve 10 ile Bölünebilme Kuralları",
            "week": 5,
            "subtopics": [
              {
                "id": "MAT-6-5-1",
                "title": "2, 3, 4, 5, 6, 9 ve 10 ile Bölünebilme Kuralları - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-5-2",
                "title": "2, 3, 4, 5, 6, 9 ve 10 ile Bölünebilme Kuralları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.2.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Asal Sayılar ve Asal Çarpanlara Ayırma",
            "week": 6,
            "subtopics": [
              {
                "id": "MAT-6-6-1",
                "title": "Asal Sayılar ve Asal Çarpanlara Ayırma - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.2.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-6-2",
                "title": "Asal Sayılar ve Asal Çarpanlara Ayırma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.2.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Ortak Bölenler ve Ortak Katlar (EBOB-EKOK Temeli)",
            "week": 7,
            "subtopics": [
              {
                "id": "MAT-6-7-1",
                "title": "Ortak Bölenler ve Ortak Katlar - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.2.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-7-2",
                "title": "Ortak Bölenler ve Ortak Katlar: EBOB-EKOK Temeli",
                "outcome": "M.6.1.2.4.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-6-7-3",
                "title": "Ortak Bölenler ve Ortak Katlar - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.2.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Kümeler: Küme Gösterimi (Liste, Venn Şeması, Ortak Özellik)",
            "week": 8,
            "subtopics": [
              {
                "id": "MAT-6-8-1",
                "title": "Kümeler: Küme Gösterimi - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-8-2",
                "title": "Kümeler: Küme Gösterimi: Liste",
                "outcome": "M.6.1.3.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-6-8-3",
                "title": "Kümeler: Küme Gösterimi: Venn Şeması",
                "outcome": "M.6.1.3.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-6-8-4",
                "title": "Kümeler: Küme Gösterimi: Ortak Özellik",
                "outcome": "M.6.1.3.1.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-6-8-5",
                "title": "Kümeler: Küme Gösterimi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-6-U3",
        "unitTitle": "3. Ünite: Kümelerde Kesişim ve Birleşim İşlemleri ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Kümelerde Kesişim ve Birleşim İşlemleri",
            "week": 9,
            "subtopics": [
              {
                "id": "MAT-6-9-1",
                "title": "Kümelerde Kesişim ve Birleşim İşlemleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.3.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-9-2",
                "title": "Kümelerde Kesişim ve Birleşim İşlemleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.3.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Tam Sayılar: Negatif ve Pozitif Sayılar",
            "week": 10,
            "subtopics": [
              {
                "id": "MAT-6-10-1",
                "title": "Tam Sayılar: Negatif ve Pozitif Sayılar - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-10-2",
                "title": "Tam Sayılar: Negatif ve Pozitif Sayılar - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.4.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Tam Sayıları Sayı Doğrusunda Gösterme ve Sıralama",
            "week": 11,
            "subtopics": [
              {
                "id": "MAT-6-11-1",
                "title": "Tam Sayıları Sayı Doğrusunda Gösterme ve Sıralama - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.4.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-11-2",
                "title": "Tam Sayıları Sayı Doğrusunda Gösterme ve Sıralama - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.4.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Mutlak Değer Kavramı ve Sayı Doğrusu Uzaklığı",
            "week": 12,
            "subtopics": [
              {
                "id": "MAT-6-12-1",
                "title": "Mutlak Değer Kavramı ve Sayı Doğrusu Uzaklığı - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.4.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-12-2",
                "title": "Mutlak Değer Kavramı ve Sayı Doğrusu Uzaklığı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.4.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-6-U4",
        "unitTitle": "4. Ünite: Kesirlerle İşlemler ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Kesirlerle İşlemler: Kesirleri Karşılaştırma ve Sıralama",
            "week": 13,
            "subtopics": [
              {
                "id": "MAT-6-13-1",
                "title": "Kesirlerle İşlemler: Kesirleri Karşılaştırma ve Sıralama - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.5.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-13-2",
                "title": "Kesirlerle İşlemler: Kesirleri Karşılaştırma ve Sıralama - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.5.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Kesirlerle Toplama ve Çıkarma İşlemleri",
            "week": 14,
            "subtopics": [
              {
                "id": "MAT-6-14-1",
                "title": "Kesirlerle Toplama ve Çıkarma İşlemleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.5.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-14-2",
                "title": "Kesirlerle Toplama ve Çıkarma İşlemleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.5.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Kesirlerle Çarpma İşlemi ve Modelleme",
            "week": 15,
            "subtopics": [
              {
                "id": "MAT-6-15-1",
                "title": "Kesirlerle Çarpma İşlemi ve Modelleme - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.5.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-15-2",
                "title": "Kesirlerle Çarpma İşlemi ve Modelleme - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.5.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Kesirlerle Bölme İşlemi (Ters Çevirip Çarpma)",
            "week": 16,
            "subtopics": [
              {
                "id": "MAT-6-16-1",
                "title": "Kesirlerle Bölme İşlemi - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.5.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-16-2",
                "title": "Kesirlerle Bölme İşlemi: Ters Çevirip Çarpma",
                "outcome": "M.6.1.5.4.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-6-16-3",
                "title": "Kesirlerle Bölme İşlemi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.5.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-6-U5",
        "unitTitle": "5. Ünite: Kesir Problemleri ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Kesir Problemleri (Çok Adımlı Günlük Hayat Senaryoları)",
            "week": 17,
            "subtopics": [
              {
                "id": "MAT-6-17-1",
                "title": "Kesir Problemleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.5.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-17-2",
                "title": "Kesir Problemleri: Çok Adımlı Günlük Hayat Senaryoları",
                "outcome": "M.6.1.5.5.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-6-17-3",
                "title": "Kesir Problemleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.5.5.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Ondalık Gösterim: Çözümleme ve Basamak Değerleri",
            "week": 18,
            "subtopics": [
              {
                "id": "MAT-6-18-1",
                "title": "Ondalık Gösterim: Çözümleme ve Basamak Değerleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.6.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-18-2",
                "title": "Ondalık Gösterim: Çözümleme ve Basamak Değerleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.6.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Ondalık Gösterimleri Yuvarlama (Birler, Onda Birler)",
            "week": 19,
            "subtopics": [
              {
                "id": "MAT-6-19-1",
                "title": "Ondalık Gösterimleri Yuvarlama - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.6.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-19-2",
                "title": "Ondalık Gösterimleri Yuvarlama: Birler",
                "outcome": "M.6.1.6.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-6-19-3",
                "title": "Ondalık Gösterimleri Yuvarlama: Onda Birler",
                "outcome": "M.6.1.6.2.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-6-19-4",
                "title": "Ondalık Gösterimleri Yuvarlama - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.6.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Ondalık Gösterimlerle Çarpma ve Kısa Yoldan 10, 100, 1000",
            "week": 20,
            "subtopics": [
              {
                "id": "MAT-6-20-1",
                "title": "Ondalık Gösterimlerle Çarpma ve Kısa Yoldan 10, 100, 1000 - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.6.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-20-2",
                "title": "Ondalık Gösterimlerle Çarpma ve Kısa Yoldan 10, 100, 1000 - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.6.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-6-U6",
        "unitTitle": "6. Ünite: Ondalık Gösterimlerle Bölme İşlemi ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Ondalık Gösterimlerle Bölme İşlemi",
            "week": 21,
            "subtopics": [
              {
                "id": "MAT-6-21-1",
                "title": "Ondalık Gösterimlerle Bölme İşlemi - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.6.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-21-2",
                "title": "Ondalık Gösterimlerle Bölme İşlemi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.6.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Oran Kavramı ve Çoklukları Karşılaştırma",
            "week": 22,
            "subtopics": [
              {
                "id": "MAT-6-22-1",
                "title": "Oran Kavramı ve Çoklukları Karşılaştırma - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.7.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-22-2",
                "title": "Oran Kavramı ve Çoklukları Karşılaştırma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.7.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Birimli ve Birimsiz Oran Ayrımı (Hız: km/sa, m/sn)",
            "week": 23,
            "subtopics": [
              {
                "id": "MAT-6-23-1",
                "title": "Birimli ve Birimsiz Oran Ayrımı - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.1.7.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-23-2",
                "title": "Birimli ve Birimsiz Oran Ayrımı: Hız: km/sa",
                "outcome": "M.6.1.7.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-6-23-3",
                "title": "Birimli ve Birimsiz Oran Ayrımı: m/sn",
                "outcome": "M.6.1.7.2.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-6-23-4",
                "title": "Birimli ve Birimsiz Oran Ayrımı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.1.7.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Cebirsel İfadeler: Terim, Değişken, Sabit Terim, Katsayı",
            "week": 24,
            "subtopics": [
              {
                "id": "MAT-6-24-1",
                "title": "Cebirsel İfadeler: Terim, Değişken, Sabit Terim, Katsayı - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.2.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-24-2",
                "title": "Cebirsel İfadeler: Terim, Değişken, Sabit Terim, Katsayı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.2.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-6-U7",
        "unitTitle": "7. Ünite: Cebirsel İfadenin Değerini Hesaplama ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Cebirsel İfadenin Değerini Hesaplama (x yerine değer yazma)",
            "week": 25,
            "subtopics": [
              {
                "id": "MAT-6-25-1",
                "title": "Cebirsel İfadenin Değerini Hesaplama - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.2.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-25-2",
                "title": "Cebirsel İfadenin Değerini Hesaplama: x yerine değer yazma",
                "outcome": "M.6.2.1.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-6-25-3",
                "title": "Cebirsel İfadenin Değerini Hesaplama - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.2.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Veri Analizi: İki Gruba Ait Verileri Karşılaştırma",
            "week": 26,
            "subtopics": [
              {
                "id": "MAT-6-26-1",
                "title": "Veri Analizi: İki Gruba Ait Verileri Karşılaştırma - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.3.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-26-2",
                "title": "Veri Analizi: İki Gruba Ait Verileri Karşılaştırma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.3.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Aritmetik Ortalama ve Açıklık Hesaplama",
            "week": 27,
            "subtopics": [
              {
                "id": "MAT-6-27-1",
                "title": "Aritmetik Ortalama ve Açıklık Hesaplama - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.3.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-27-2",
                "title": "Aritmetik Ortalama ve Açıklık Hesaplama - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.3.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Açılar: Komşu Açılar, Tümler ve Bütünler Açılar",
            "week": 28,
            "subtopics": [
              {
                "id": "MAT-6-28-1",
                "title": "Açılar: Komşu Açılar, Tümler ve Bütünler Açılar - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.4.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-28-2",
                "title": "Açılar: Komşu Açılar, Tümler ve Bütünler Açılar - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.4.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-6-U8",
        "unitTitle": "8. Ünite: Ters Açılar ve Açı Problemleri ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Ters Açılar ve Açı Problemleri",
            "week": 29,
            "subtopics": [
              {
                "id": "MAT-6-29-1",
                "title": "Ters Açılar ve Açı Problemleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.4.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-29-2",
                "title": "Ters Açılar ve Açı Problemleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.4.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Üçgende Alan Bağıntısı (Taban x Yükseklik / 2)",
            "week": 30,
            "subtopics": [
              {
                "id": "MAT-6-30-1",
                "title": "Üçgende Alan Bağıntısı - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.4.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-30-2",
                "title": "Üçgende Alan Bağıntısı: Taban x Yükseklik / 2",
                "outcome": "M.6.4.2.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-6-30-3",
                "title": "Üçgende Alan Bağıntısı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.4.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Paralelkenarda Alan Bağıntısı",
            "week": 31,
            "subtopics": [
              {
                "id": "MAT-6-31-1",
                "title": "Paralelkenarda Alan Bağıntısı - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.4.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-31-2",
                "title": "Paralelkenarda Alan Bağıntısı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.4.2.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Alan Ölçme Birimleri (m², dm², cm², mm², ar, dekar, hektar)",
            "week": 32,
            "subtopics": [
              {
                "id": "MAT-6-32-1",
                "title": "Alan Ölçme Birimleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.4.2.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-32-2",
                "title": "Alan Ölçme Birimleri: m²",
                "outcome": "M.6.4.2.3.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-6-32-3",
                "title": "Alan Ölçme Birimleri: dm²",
                "outcome": "M.6.4.2.3.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-6-32-4",
                "title": "Alan Ölçme Birimleri: cm²",
                "outcome": "M.6.4.2.3.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-6-32-5",
                "title": "Alan Ölçme Birimleri: mm²",
                "outcome": "M.6.4.2.3.4",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-6-32-6",
                "title": "Alan Ölçme Birimleri: ar",
                "outcome": "M.6.4.2.3.5",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-6-32-7",
                "title": "Alan Ölçme Birimleri: dekar",
                "outcome": "M.6.4.2.3.6",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-6-32-8",
                "title": "Alan Ölçme Birimleri: hektar",
                "outcome": "M.6.4.2.3.7",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-6-32-9",
                "title": "Alan Ölçme Birimleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.4.2.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-6-U9",
        "unitTitle": "9. Ünite: Çember ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Çember: Merkez, Yarıçap, Çap ve Çevre Uzunluğu (2πr)",
            "week": 33,
            "subtopics": [
              {
                "id": "MAT-6-33-1",
                "title": "Çember: Merkez, Yarıçap, Çap ve Çevre Uzunluğu - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.4.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-33-2",
                "title": "Çember: Merkez, Yarıçap, Çap ve Çevre Uzunluğu: 2πr",
                "outcome": "M.6.4.3.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-6-33-3",
                "title": "Çember: Merkez, Yarıçap, Çap ve Çevre Uzunluğu - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.4.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Dikdörtgenler Prizmasının Hacmi (Taban Alanı x Yükseklik)",
            "week": 34,
            "subtopics": [
              {
                "id": "MAT-6-34-1",
                "title": "Dikdörtgenler Prizmasının Hacmi - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.4.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-34-2",
                "title": "Dikdörtgenler Prizmasının Hacmi: Taban Alanı x Yükseklik",
                "outcome": "M.6.4.4.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-6-34-3",
                "title": "Dikdörtgenler Prizmasının Hacmi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.4.4.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Sıvı Ölçme Birimleri (Litre, Desilitre, Santilitre, Mililitre)",
            "week": 35,
            "subtopics": [
              {
                "id": "MAT-6-35-1",
                "title": "Sıvı Ölçme Birimleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.4.4.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-35-2",
                "title": "Sıvı Ölçme Birimleri: Litre",
                "outcome": "M.6.4.4.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-6-35-3",
                "title": "Sıvı Ölçme Birimleri: Desilitre",
                "outcome": "M.6.4.4.2.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-6-35-4",
                "title": "Sıvı Ölçme Birimleri: Santilitre",
                "outcome": "M.6.4.4.2.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-6-35-5",
                "title": "Sıvı Ölçme Birimleri: Mililitre",
                "outcome": "M.6.4.4.2.4",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-6-35-6",
                "title": "Sıvı Ölçme Birimleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.4.4.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "6. Sınıf Yıl Sonu Bütüncül Sayısal Prova",
            "week": 36,
            "subtopics": [
              {
                "id": "MAT-6-36-1",
                "title": "6. Sınıf Yıl Sonu Bütüncül Sayısal Prova - Temel Kavramlar ve Tanımlar",
                "outcome": "M.6.LGS.01",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-6-36-2",
                "title": "6. Sınıf Yıl Sonu Bütüncül Sayısal Prova - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.6.LGS.01.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      }
    ]
  },
  "fen": {
    "courseName": "Fen Bilimleri",
    "grade": 6,
    "totalUnits": 9,
    "units": [
      {
        "unitId": "FEN-6-U1",
        "unitTitle": "1. Ünite: Güneş Sistemi ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Güneş Sistemi: Gezegenlerin Özellikleri ve Sıralaması",
            "week": 1,
            "subtopics": [
              {
                "id": "FEN-6-1-1",
                "title": "Güneş Sistemi: Gezegenlerin Özellikleri ve Sıralaması - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.1.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-1-2",
                "title": "Güneş Sistemi: Gezegenlerin Özellikleri ve Sıralaması - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.1.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Asteroit ve Meteorlar, Gök Taşları",
            "week": 2,
            "subtopics": [
              {
                "id": "FEN-6-2-1",
                "title": "Asteroit ve Meteorlar, Gök Taşları - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.1.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-2-2",
                "title": "Asteroit ve Meteorlar, Gök Taşları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.1.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Güneş Tutulması Modeli ve Özellikleri",
            "week": 3,
            "subtopics": [
              {
                "id": "FEN-6-3-1",
                "title": "Güneş Tutulması Modeli ve Özellikleri - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.1.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-3-2",
                "title": "Güneş Tutulması Modeli ve Özellikleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.1.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Ay Tutulması Modeli ve Karşılaştırma",
            "week": 4,
            "subtopics": [
              {
                "id": "FEN-6-4-1",
                "title": "Ay Tutulması Modeli ve Karşılaştırma - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.1.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-4-2",
                "title": "Ay Tutulması Modeli ve Karşılaştırma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.1.2.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-6-U2",
        "unitTitle": "2. Ünite: Destek ve Hareket Sistemi ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Destek ve Hareket Sistemi: Kemikler ve Kıkırdak",
            "week": 5,
            "subtopics": [
              {
                "id": "FEN-6-5-1",
                "title": "Destek ve Hareket Sistemi: Kemikler ve Kıkırdak - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.2.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-5-2",
                "title": "Destek ve Hareket Sistemi: Kemikler ve Kıkırdak - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.2.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Eklemler ve Kas Çeşitleri (Çizgili, Düz, Kalp Kası)",
            "week": 6,
            "subtopics": [
              {
                "id": "FEN-6-6-1",
                "title": "Eklemler ve Kas Çeşitleri - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.2.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-6-2",
                "title": "Eklemler ve Kas Çeşitleri: Çizgili",
                "outcome": "F.6.2.1.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-6-6-3",
                "title": "Eklemler ve Kas Çeşitleri: Düz",
                "outcome": "F.6.2.1.2.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-6-6-4",
                "title": "Eklemler ve Kas Çeşitleri: Kalp Kası",
                "outcome": "F.6.2.1.2.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-6-6-5",
                "title": "Eklemler ve Kas Çeşitleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.2.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Sindirim Sistemi: Ağızdan Mideye, İnce ve Kalın Bağırsağa",
            "week": 7,
            "subtopics": [
              {
                "id": "FEN-6-7-1",
                "title": "Sindirim Sistemi: Ağızdan Mideye, İnce ve Kalın Bağırsağa - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.2.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-7-2",
                "title": "Sindirim Sistemi: Ağızdan Mideye, İnce ve Kalın Bağırsağa - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.2.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Mekanik ve Kimyasal Sindirim, Emilim Olayı",
            "week": 8,
            "subtopics": [
              {
                "id": "FEN-6-8-1",
                "title": "Mekanik ve Kimyasal Sindirim, Emilim Olayı - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.2.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-8-2",
                "title": "Mekanik ve Kimyasal Sindirim, Emilim Olayı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.2.2.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-6-U3",
        "unitTitle": "3. Ünite: Sindirime Yardımcı Organlar ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Sindirime Yardımcı Organlar: Karaciğer ve Pankreas",
            "week": 9,
            "subtopics": [
              {
                "id": "FEN-6-9-1",
                "title": "Sindirime Yardımcı Organlar: Karaciğer ve Pankreas - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.2.2.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-9-2",
                "title": "Sindirime Yardımcı Organlar: Karaciğer ve Pankreas - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.2.2.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Dolaşım Sistemi: Kalbin Yapısı ve Çalışması",
            "week": 10,
            "subtopics": [
              {
                "id": "FEN-6-10-1",
                "title": "Dolaşım Sistemi: Kalbin Yapısı ve Çalışması - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.2.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-10-2",
                "title": "Dolaşım Sistemi: Kalbin Yapısı ve Çalışması - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.2.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Damarlar (Atardamar, Toplardamar, Kılcal Damar)",
            "week": 11,
            "subtopics": [
              {
                "id": "FEN-6-11-1",
                "title": "Damarlar - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.2.3.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-11-2",
                "title": "Damarlar: Atardamar",
                "outcome": "F.6.2.3.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-6-11-3",
                "title": "Damarlar: Toplardamar",
                "outcome": "F.6.2.3.2.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-6-11-4",
                "title": "Damarlar: Kılcal Damar",
                "outcome": "F.6.2.3.2.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-6-11-5",
                "title": "Damarlar - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.2.3.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Küçük ve Büyük Kan Dolaşımı",
            "week": 12,
            "subtopics": [
              {
                "id": "FEN-6-12-1",
                "title": "Küçük ve Büyük Kan Dolaşımı - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.2.3.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-12-2",
                "title": "Küçük ve Büyük Kan Dolaşımı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.2.3.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-6-U4",
        "unitTitle": "4. Ünite: Kanın Yapısı ve Görevleri, Kan Grupları ve Bağışı ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Kanın Yapısı ve Görevleri, Kan Grupları ve Bağışı",
            "week": 13,
            "subtopics": [
              {
                "id": "FEN-6-13-1",
                "title": "Kanın Yapısı ve Görevleri, Kan Grupları ve Bağışı - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.2.3.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-13-2",
                "title": "Kanın Yapısı ve Görevleri, Kan Grupları ve Bağışı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.2.3.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Solunum Sistemi Organları ve Gaz Değişimi",
            "week": 14,
            "subtopics": [
              {
                "id": "FEN-6-14-1",
                "title": "Solunum Sistemi Organları ve Gaz Değişimi - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.2.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-14-2",
                "title": "Solunum Sistemi Organları ve Gaz Değişimi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.2.4.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Boşaltım Sistemi Organları: Böbrekler, Üreter, İdrar Kesesi",
            "week": 15,
            "subtopics": [
              {
                "id": "FEN-6-15-1",
                "title": "Boşaltım Sistemi Organları: Böbrekler, Üreter, İdrar Kesesi - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.2.5.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-15-2",
                "title": "Boşaltım Sistemi Organları: Böbrekler, Üreter, İdrar Kesesi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.2.5.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Kuvvetin Yönü, Doğrultusu ve Büyüklüğü",
            "week": 16,
            "subtopics": [
              {
                "id": "FEN-6-16-1",
                "title": "Kuvvetin Yönü, Doğrultusu ve Büyüklüğü - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.3.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-16-2",
                "title": "Kuvvetin Yönü, Doğrultusu ve Büyüklüğü - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.3.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-6-U5",
        "unitTitle": "5. Ünite: Bileşke Kuvvet ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Bileşke Kuvvet (Net Kuvvet) Hesaplamaları",
            "week": 17,
            "subtopics": [
              {
                "id": "FEN-6-17-1",
                "title": "Bileşke Kuvvet  Hesaplamaları - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.3.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-17-2",
                "title": "Bileşke Kuvvet  Hesaplamaları: Net Kuvvet",
                "outcome": "F.6.3.1.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-6-17-3",
                "title": "Bileşke Kuvvet  Hesaplamaları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.3.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Dengelenmiş ve Dengelenmemiş Kuvvetler",
            "week": 18,
            "subtopics": [
              {
                "id": "FEN-6-18-1",
                "title": "Dengelenmiş ve Dengelenmemiş Kuvvetler - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.3.1.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-18-2",
                "title": "Dengelenmiş ve Dengelenmemiş Kuvvetler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.3.1.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Sabit Süratli Hareket, Yol-Zaman Grafikleri",
            "week": 19,
            "subtopics": [
              {
                "id": "FEN-6-19-1",
                "title": "Sabit Süratli Hareket, Yol-Zaman Grafikleri - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.3.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-19-2",
                "title": "Sabit Süratli Hareket, Yol-Zaman Grafikleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.3.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Maddenin Tanecikli, Boşluklu ve Hareketli Yapısı",
            "week": 20,
            "subtopics": [
              {
                "id": "FEN-6-20-1",
                "title": "Maddenin Tanecikli, Boşluklu ve Hareketli Yapısı - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.4.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-20-2",
                "title": "Maddenin Tanecikli, Boşluklu ve Hareketli Yapısı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.4.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-6-U6",
        "unitTitle": "6. Ünite: Yoğunluk ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Yoğunluk (Özkütle) Kavramı: d = m / V Hesabı",
            "week": 21,
            "subtopics": [
              {
                "id": "FEN-6-21-1",
                "title": "Yoğunluk  Kavramı: d = m / V Hesabı - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.4.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-21-2",
                "title": "Yoğunluk  Kavramı: d = m / V Hesabı: Özkütle",
                "outcome": "F.6.4.2.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-6-21-3",
                "title": "Yoğunluk  Kavramı: d = m / V Hesabı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.4.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Birbiri İçinde Çözünmeyen Sıvıların Yoğunluk Dengesi",
            "week": 22,
            "subtopics": [
              {
                "id": "FEN-6-22-1",
                "title": "Birbiri İçinde Çözünmeyen Sıvıların Yoğunluk Dengesi - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.4.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-22-2",
                "title": "Birbiri İçinde Çözünmeyen Sıvıların Yoğunluk Dengesi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.4.2.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Suyun Özel Durumu ve Canlılar İçin Önemi",
            "week": 23,
            "subtopics": [
              {
                "id": "FEN-6-23-1",
                "title": "Suyun Özel Durumu ve Canlılar İçin Önemi - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.4.2.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-23-2",
                "title": "Suyun Özel Durumu ve Canlılar İçin Önemi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.4.2.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Isı İletimi: İletken ve Yalıtkan Maddeler",
            "week": 24,
            "subtopics": [
              {
                "id": "FEN-6-24-1",
                "title": "Isı İletimi: İletken ve Yalıtkan Maddeler - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.4.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-24-2",
                "title": "Isı İletimi: İletken ve Yalıtkan Maddeler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.4.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-6-U7",
        "unitTitle": "7. Ünite: Binalarda Isı Yalıtımı ve Enerji Tasarrufu ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Binalarda Isı Yalıtımı ve Enerji Tasarrufu",
            "week": 25,
            "subtopics": [
              {
                "id": "FEN-6-25-1",
                "title": "Binalarda Isı Yalıtımı ve Enerji Tasarrufu - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.4.3.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-25-2",
                "title": "Binalarda Isı Yalıtımı ve Enerji Tasarrufu - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.4.3.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Yakıtlar ve Çevresel Etkileri (Fosil, Biyokütle)",
            "week": 26,
            "subtopics": [
              {
                "id": "FEN-6-26-1",
                "title": "Yakıtlar ve Çevresel Etkileri - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.4.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-26-2",
                "title": "Yakıtlar ve Çevresel Etkileri: Fosil",
                "outcome": "F.6.4.4.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-6-26-3",
                "title": "Yakıtlar ve Çevresel Etkileri: Biyokütle",
                "outcome": "F.6.4.4.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-6-26-4",
                "title": "Yakıtlar ve Çevresel Etkileri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.4.4.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Sesin Yayılması (Katı, Sıvı ve Gaz Ortamlar)",
            "week": 27,
            "subtopics": [
              {
                "id": "FEN-6-27-1",
                "title": "Sesin Yayılması - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.5.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-27-2",
                "title": "Sesin Yayılması: Katı",
                "outcome": "F.6.5.1.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-6-27-3",
                "title": "Sesin Yayılması: Sıvı ve Gaz Ortamlar",
                "outcome": "F.6.5.1.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-6-27-4",
                "title": "Sesin Yayılması - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.5.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Sesin Farklı Ortamlarda Farklı Duyulması",
            "week": 28,
            "subtopics": [
              {
                "id": "FEN-6-28-1",
                "title": "Sesin Farklı Ortamlarda Farklı Duyulması - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.5.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-28-2",
                "title": "Sesin Farklı Ortamlarda Farklı Duyulması - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.5.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-6-U8",
        "unitTitle": "8. Ünite: Sesin Sürati ve Işık Sürati ile Karşılaştırılması ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Sesin Sürati ve Işık Sürati ile Karşılaştırılması",
            "week": 29,
            "subtopics": [
              {
                "id": "FEN-6-29-1",
                "title": "Sesin Sürati ve Işık Sürati ile Karşılaştırılması - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.5.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-29-2",
                "title": "Sesin Sürati ve Işık Sürati ile Karşılaştırılması - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.5.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Sesin Maddeyle Etkileşimi: Yansıma, Soğurulma, Yalıtım",
            "week": 30,
            "subtopics": [
              {
                "id": "FEN-6-30-1",
                "title": "Sesin Maddeyle Etkileşimi: Yansıma, Soğurulma, Yalıtım - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.5.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-30-2",
                "title": "Sesin Maddeyle Etkileşimi: Yansıma, Soğurulma, Yalıtım - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.5.4.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Denetleyici ve Düzenleyici Sistemler: Beyin, Beyincik, Omurilik",
            "week": 31,
            "subtopics": [
              {
                "id": "FEN-6-31-1",
                "title": "Denetleyici ve Düzenleyici Sistemler: Beyin, Beyincik, Omurilik - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.6.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-31-2",
                "title": "Denetleyici ve Düzenleyici Sistemler: Beyin, Beyincik, Omurilik - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.6.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Refleks Olayı ve İç Salgı Bezleri (Hormonlar)",
            "week": 32,
            "subtopics": [
              {
                "id": "FEN-6-32-1",
                "title": "Refleks Olayı ve İç Salgı Bezleri - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.6.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-32-2",
                "title": "Refleks Olayı ve İç Salgı Bezleri: Hormonlar",
                "outcome": "F.6.6.1.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-6-32-3",
                "title": "Refleks Olayı ve İç Salgı Bezleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.6.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-6-U9",
        "unitTitle": "9. Ünite: Duyu Organları ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Duyu Organları: Göz, Kulak, Burun, Dil, Deri",
            "week": 33,
            "subtopics": [
              {
                "id": "FEN-6-33-1",
                "title": "Duyu Organları: Göz, Kulak, Burun, Dil, Deri - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.6.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-33-2",
                "title": "Duyu Organları: Göz, Kulak, Burun, Dil, Deri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.6.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Elektriksel İletkenlik ve Yalıtkanlık",
            "week": 34,
            "subtopics": [
              {
                "id": "FEN-6-34-1",
                "title": "Elektriksel İletkenlik ve Yalıtkanlık - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.7.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-34-2",
                "title": "Elektriksel İletkenlik ve Yalıtkanlık - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.7.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Elektriksel Direnç ve Bağlı Olduğu Faktörler (Boy, Kesit)",
            "week": 35,
            "subtopics": [
              {
                "id": "FEN-6-35-1",
                "title": "Elektriksel Direnç ve Bağlı Olduğu Faktörler - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.7.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-35-2",
                "title": "Elektriksel Direnç ve Bağlı Olduğu Faktörler: Boy",
                "outcome": "F.6.7.2.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-6-35-3",
                "title": "Elektriksel Direnç ve Bağlı Olduğu Faktörler: Kesit",
                "outcome": "F.6.7.2.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-6-35-4",
                "title": "Elektriksel Direnç ve Bağlı Olduğu Faktörler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.7.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "6. Sınıf Fen Bilimleri Bütüncül Deneme",
            "week": 36,
            "subtopics": [
              {
                "id": "FEN-6-36-1",
                "title": "6. Sınıf Fen Bilimleri Bütüncül Deneme - Temel Kavramlar ve Tanımlar",
                "outcome": "F.6.LGS.01",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-6-36-2",
                "title": "6. Sınıf Fen Bilimleri Bütüncül Deneme - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.6.LGS.01.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      }
    ]
  },
  "sosyal": {
    "courseName": "Sosyal Bilgiler",
    "grade": 6,
    "totalUnits": 9,
    "units": [
      {
        "unitId": "SOS-6-U1",
        "unitTitle": "1. Ünite: Değişen Rollerim ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Değişen Rollerim: Hak ve Sorumluluk Bilinci",
            "week": 1,
            "subtopics": [
              {
                "id": "SOS-6-1-1",
                "title": "Değişen Rollerim: Hak ve Sorumluluk Bilinci - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-1-2",
                "title": "Değişen Rollerim: Hak ve Sorumluluk Bilinci - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Kültürümüzle Yaşıyor ve Gelişiyoruz (Maddi/Manevi Değerler)",
            "week": 2,
            "subtopics": [
              {
                "id": "SOS-6-2-1",
                "title": "Kültürümüzle Yaşıyor ve Gelişiyoruz - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-2-2",
                "title": "Kültürümüzle Yaşıyor ve Gelişiyoruz: Maddi/Manevi Değerler",
                "outcome": "SB.6.1.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "SOS-6-2-3",
                "title": "Kültürümüzle Yaşıyor ve Gelişiyoruz - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Önyargıları Kırıyorum: Hoşgörü ve Empati",
            "week": 3,
            "subtopics": [
              {
                "id": "SOS-6-3-1",
                "title": "Önyargıları Kırıyorum: Hoşgörü ve Empati - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.1.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-3-2",
                "title": "Önyargıları Kırıyorum: Hoşgörü ve Empati - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.1.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Farklılıklara Saygı ve Toplumsal Birliktelik",
            "week": 4,
            "subtopics": [
              {
                "id": "SOS-6-4-1",
                "title": "Farklılıklara Saygı ve Toplumsal Birliktelik - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.1.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-4-2",
                "title": "Farklılıklara Saygı ve Toplumsal Birliktelik - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.1.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-6-U2",
        "unitTitle": "2. Ünite: Tarihe Yolculuk ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Tarihe Yolculuk: Destan ve Yazıtlarda İlk Türk Devletleri",
            "week": 5,
            "subtopics": [
              {
                "id": "SOS-6-5-1",
                "title": "Tarihe Yolculuk: Destan ve Yazıtlarda İlk Türk Devletleri - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-5-2",
                "title": "Tarihe Yolculuk: Destan ve Yazıtlarda İlk Türk Devletleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Orta Asya Türk Kültürü: Yaşam Tarzı ve Yönetim",
            "week": 6,
            "subtopics": [
              {
                "id": "SOS-6-6-1",
                "title": "Orta Asya Türk Kültürü: Yaşam Tarzı ve Yönetim - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-6-2",
                "title": "Orta Asya Türk Kültürü: Yaşam Tarzı ve Yönetim - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.2.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "İslamiyet'in Doğuşu ve Yayılışı (Dört Halife Dönemi)",
            "week": 7,
            "subtopics": [
              {
                "id": "SOS-6-7-1",
                "title": "İslamiyet'in Doğuşu ve Yayılışı - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.2.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-7-2",
                "title": "İslamiyet'in Doğuşu ve Yayılışı: Dört Halife Dönemi",
                "outcome": "SB.6.2.3.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "SOS-6-7-3",
                "title": "İslamiyet'in Doğuşu ve Yayılışı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.2.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Türklerin İslamiyet'i Kabulü ve İlk Türk-İslam Devletleri",
            "week": 8,
            "subtopics": [
              {
                "id": "SOS-6-8-1",
                "title": "Türklerin İslamiyet'i Kabulü ve İlk Türk-İslam Devletleri - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.2.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-8-2",
                "title": "Türklerin İslamiyet'i Kabulü ve İlk Türk-İslam Devletleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.2.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-6-U3",
        "unitTitle": "3. Ünite: Karahanlılar, Gazneliler ve Büyük Selçuklu Devleti ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Karahanlılar, Gazneliler ve Büyük Selçuklu Devleti",
            "week": 9,
            "subtopics": [
              {
                "id": "SOS-6-9-1",
                "title": "Karahanlılar, Gazneliler ve Büyük Selçuklu Devleti - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.2.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-9-2",
                "title": "Karahanlılar, Gazneliler ve Büyük Selçuklu Devleti - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.2.5.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Yeni Yurt Anadolu: Malazgirt Zaferi ve Beylikler",
            "week": 10,
            "subtopics": [
              {
                "id": "SOS-6-10-1",
                "title": "Yeni Yurt Anadolu: Malazgirt Zaferi ve Beylikler - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.2.6",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-10-2",
                "title": "Yeni Yurt Anadolu: Malazgirt Zaferi ve Beylikler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.2.6.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Tarihî Ticaret Yolları: İpek ve Baharat Yolu",
            "week": 11,
            "subtopics": [
              {
                "id": "SOS-6-11-1",
                "title": "Tarihî Ticaret Yolları: İpek ve Baharat Yolu - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.2.7",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-11-2",
                "title": "Tarihî Ticaret Yolları: İpek ve Baharat Yolu - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.2.7.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Dünya'nın Neresindeyiz: Paralel, Meridyen ve Koordinat",
            "week": 12,
            "subtopics": [
              {
                "id": "SOS-6-12-1",
                "title": "Dünya'nın Neresindeyiz: Paralel, Meridyen ve Koordinat - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-12-2",
                "title": "Dünya'nın Neresindeyiz: Paralel, Meridyen ve Koordinat - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-6-U4",
        "unitTitle": "4. Ünite: Türkiye'nin Coğrafi Konumu ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Türkiye'nin Coğrafi Konumu (Matematik ve Özel Konum)",
            "week": 13,
            "subtopics": [
              {
                "id": "SOS-6-13-1",
                "title": "Türkiye'nin Coğrafi Konumu - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.3.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-13-2",
                "title": "Türkiye'nin Coğrafi Konumu: Matematik ve Özel Konum",
                "outcome": "SB.6.3.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "SOS-6-13-3",
                "title": "Türkiye'nin Coğrafi Konumu - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.3.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Türkiye'nin Fiziki Coğrafyası: Dağlar, Ovalar, Platolar, Akarsular",
            "week": 14,
            "subtopics": [
              {
                "id": "SOS-6-14-1",
                "title": "Türkiye'nin Fiziki Coğrafyası: Dağlar, Ovalar, Platolar, Akarsular - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.3.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-14-2",
                "title": "Türkiye'nin Fiziki Coğrafyası: Dağlar, Ovalar, Platolar, Akarsular - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.3.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Türkiye'nin İklimi ve Bitki Örtüsü Özellikleri",
            "week": 15,
            "subtopics": [
              {
                "id": "SOS-6-15-1",
                "title": "Türkiye'nin İklimi ve Bitki Örtüsü Özellikleri - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.3.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-15-2",
                "title": "Türkiye'nin İklimi ve Bitki Örtüsü Özellikleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.3.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Farklı İklimlerde Yaşam: Ekvatoral, Kutup, Çöl, Muson",
            "week": 16,
            "subtopics": [
              {
                "id": "SOS-6-16-1",
                "title": "Farklı İklimlerde Yaşam: Ekvatoral, Kutup, Çöl, Muson - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.3.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-16-2",
                "title": "Farklı İklimlerde Yaşam: Ekvatoral, Kutup, Çöl, Muson - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.3.5.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-6-U5",
        "unitTitle": "5. Ünite: Tıp ve Matematik Öncüleri ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Tıp ve Matematik Öncüleri: İbn-i Sina, Harizmi, Farabi",
            "week": 17,
            "subtopics": [
              {
                "id": "SOS-6-17-1",
                "title": "Tıp ve Matematik Öncüleri: İbn-i Sina, Harizmi, Farabi - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-17-2",
                "title": "Tıp ve Matematik Öncüleri: İbn-i Sina, Harizmi, Farabi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.4.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Matbaanın Gelişimi ve Bilginin Yayılması",
            "week": 18,
            "subtopics": [
              {
                "id": "SOS-6-18-1",
                "title": "Matbaanın Gelişimi ve Bilginin Yayılması - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.4.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-18-2",
                "title": "Matbaanın Gelişimi ve Bilginin Yayılması - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.4.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Bilimsel Araştırma Basamakları ve Kaynakça Gösterme",
            "week": 19,
            "subtopics": [
              {
                "id": "SOS-6-19-1",
                "title": "Bilimsel Araştırma Basamakları ve Kaynakça Gösterme - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.4.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-19-2",
                "title": "Bilimsel Araştırma Basamakları ve Kaynakça Gösterme - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.4.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Telif ve Patent Haklarının Önemi",
            "week": 20,
            "subtopics": [
              {
                "id": "SOS-6-20-1",
                "title": "Telif ve Patent Haklarının Önemi - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.4.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-20-2",
                "title": "Telif ve Patent Haklarının Önemi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.4.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-6-U6",
        "unitTitle": "6. Ünite: Ülkemizin Doğal Kaynakları ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Ülkemizin Doğal Kaynakları: Topraklarımız ve Tarım",
            "week": 21,
            "subtopics": [
              {
                "id": "SOS-6-21-1",
                "title": "Ülkemizin Doğal Kaynakları: Topraklarımız ve Tarım - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.5.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-21-2",
                "title": "Ülkemizin Doğal Kaynakları: Topraklarımız ve Tarım - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.5.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Sularımız ve Denizlerimiz: Balıkçılık, Ulaşım, Turizm",
            "week": 22,
            "subtopics": [
              {
                "id": "SOS-6-22-1",
                "title": "Sularımız ve Denizlerimiz: Balıkçılık, Ulaşım, Turizm - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.5.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-22-2",
                "title": "Sularımız ve Denizlerimiz: Balıkçılık, Ulaşım, Turizm - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.5.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Ormanlarımız ve Maden Kaynaklarımız",
            "week": 23,
            "subtopics": [
              {
                "id": "SOS-6-23-1",
                "title": "Ormanlarımız ve Maden Kaynaklarımız - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.5.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-23-2",
                "title": "Ormanlarımız ve Maden Kaynaklarımız - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.5.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Türkiye'de Enerji Kaynakları (Yenilenebilir ve Tükenebilir)",
            "week": 24,
            "subtopics": [
              {
                "id": "SOS-6-24-1",
                "title": "Türkiye'de Enerji Kaynakları - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.5.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-24-2",
                "title": "Türkiye'de Enerji Kaynakları: Yenilenebilir ve Tükenebilir",
                "outcome": "SB.6.5.4.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "SOS-6-24-3",
                "title": "Türkiye'de Enerji Kaynakları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.5.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-6-U7",
        "unitTitle": "7. Ünite: Yatırım ve Pazarlama ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Yatırım ve Pazarlama: Coğrafi Şartlara Göre Yatırım Projeleri",
            "week": 25,
            "subtopics": [
              {
                "id": "SOS-6-25-1",
                "title": "Yatırım ve Pazarlama: Coğrafi Şartlara Göre Yatırım Projeleri - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.5.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-25-2",
                "title": "Yatırım ve Pazarlama: Coğrafi Şartlara Göre Yatırım Projeleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.5.5.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Vergilerimizle Büyüyoruz: Vatandaşlık Görevimiz",
            "week": 26,
            "subtopics": [
              {
                "id": "SOS-6-26-1",
                "title": "Vergilerimizle Büyüyoruz: Vatandaşlık Görevimiz - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.5.6",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-26-2",
                "title": "Vergilerimizle Büyüyoruz: Vatandaşlık Görevimiz - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.5.6.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Mesleğimi Seçiyorum: İlgi, Yetenek ve Meslek Analizi",
            "week": 27,
            "subtopics": [
              {
                "id": "SOS-6-27-1",
                "title": "Mesleğimi Seçiyorum: İlgi, Yetenek ve Meslek Analizi - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.5.7",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-27-2",
                "title": "Mesleğimi Seçiyorum: İlgi, Yetenek ve Meslek Analizi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.5.7.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Demokrasinin Temel İlkeleri: Millî Egemenlik, Eşitlik, Özgürlük",
            "week": 28,
            "subtopics": [
              {
                "id": "SOS-6-28-1",
                "title": "Demokrasinin Temel İlkeleri: Millî Egemenlik, Eşitlik, Özgürlük - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.6.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-28-2",
                "title": "Demokrasinin Temel İlkeleri: Millî Egemenlik, Eşitlik, Özgürlük - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.6.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-6-U8",
        "unitTitle": "8. Ünite: Yönetim Biçimleri ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Yönetim Biçimleri: Monarşi, Oligarşi, Teokrasi, Cumhuriyet",
            "week": 29,
            "subtopics": [
              {
                "id": "SOS-6-29-1",
                "title": "Yönetim Biçimleri: Monarşi, Oligarşi, Teokrasi, Cumhuriyet - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.6.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-29-2",
                "title": "Yönetim Biçimleri: Monarşi, Oligarşi, Teokrasi, Cumhuriyet - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.6.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Türkiye Cumhuriyeti Devleti'nin Temel Organları (Yasama, Yürütme, Yargı)",
            "week": 30,
            "subtopics": [
              {
                "id": "SOS-6-30-1",
                "title": "Türkiye Cumhuriyeti Devleti'nin Temel Organları - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.6.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-30-2",
                "title": "Türkiye Cumhuriyeti Devleti'nin Temel Organları: Yasama",
                "outcome": "SB.6.6.3.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "SOS-6-30-3",
                "title": "Türkiye Cumhuriyeti Devleti'nin Temel Organları: Yürütme",
                "outcome": "SB.6.6.3.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "SOS-6-30-4",
                "title": "Türkiye Cumhuriyeti Devleti'nin Temel Organları: Yargı",
                "outcome": "SB.6.6.3.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "SOS-6-30-5",
                "title": "Türkiye Cumhuriyeti Devleti'nin Temel Organları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.6.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Karar Alma Sürecinde Ben de Varım: Kamuoyu ve Sivil Toplum",
            "week": 31,
            "subtopics": [
              {
                "id": "SOS-6-31-1",
                "title": "Karar Alma Sürecinde Ben de Varım: Kamuoyu ve Sivil Toplum - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.6.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-31-2",
                "title": "Karar Alma Sürecinde Ben de Varım: Kamuoyu ve Sivil Toplum - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.6.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Kanun Önünde Eşitlik ve Kadın Haklarının Gelişimi",
            "week": 32,
            "subtopics": [
              {
                "id": "SOS-6-32-1",
                "title": "Kanun Önünde Eşitlik ve Kadın Haklarının Gelişimi - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.6.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-32-2",
                "title": "Kanun Önünde Eşitlik ve Kadın Haklarının Gelişimi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.6.5.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-6-U9",
        "unitTitle": "9. Ünite: Komşularımız ve Türk Cumhuriyetleri ile İlişkilerimiz ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Komşularımız ve Türk Cumhuriyetleri ile İlişkilerimiz",
            "week": 33,
            "subtopics": [
              {
                "id": "SOS-6-33-1",
                "title": "Komşularımız ve Türk Cumhuriyetleri ile İlişkilerimiz - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.7.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-33-2",
                "title": "Komşularımız ve Türk Cumhuriyetleri ile İlişkilerimiz - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.7.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Uluslararası Kuruluşlar (BM, NATO, TİKA, UNESCO)",
            "week": 34,
            "subtopics": [
              {
                "id": "SOS-6-34-1",
                "title": "Uluslararası Kuruluşlar - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.7.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-34-2",
                "title": "Uluslararası Kuruluşlar: BM",
                "outcome": "SB.6.7.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "SOS-6-34-3",
                "title": "Uluslararası Kuruluşlar: NATO",
                "outcome": "SB.6.7.2.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "SOS-6-34-4",
                "title": "Uluslararası Kuruluşlar: TİKA",
                "outcome": "SB.6.7.2.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "SOS-6-34-5",
                "title": "Uluslararası Kuruluşlar: UNESCO",
                "outcome": "SB.6.7.2.4",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "SOS-6-34-6",
                "title": "Uluslararası Kuruluşlar - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.7.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Uluslararası Ticaret ve Dış Alım / Dış Satım",
            "week": 35,
            "subtopics": [
              {
                "id": "SOS-6-35-1",
                "title": "Uluslararası Ticaret ve Dış Alım / Dış Satım - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.7.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-35-2",
                "title": "Uluslararası Ticaret ve Dış Alım / Dış Satım - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.7.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "6. Sınıf Sosyal Bilgiler Yıl Sonu Denemesi",
            "week": 36,
            "subtopics": [
              {
                "id": "SOS-6-36-1",
                "title": "6. Sınıf Sosyal Bilgiler Yıl Sonu Denemesi - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.6.LGS.01",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-6-36-2",
                "title": "6. Sınıf Sosyal Bilgiler Yıl Sonu Denemesi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.6.LGS.01.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      }
    ]
  }
};

export const MEB_GRANULAR_CURRICULUM_GRADE_7 = {
  "turkce": {
    "courseName": "Türkçe",
    "grade": 7,
    "totalUnits": 9,
    "units": [
      {
        "unitId": "TUR-7-U1",
        "unitTitle": "1. Ünite: Fiillerde Anlam ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Fiillerde Anlam (İş, Oluş, Durum Fiilleri)",
            "week": 1,
            "subtopics": [
              {
                "id": "TUR-7-1-1",
                "title": "Fiillerde Anlam - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-1-2",
                "title": "Fiillerde Anlam: İş",
                "outcome": "T.7.4.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-7-1-3",
                "title": "Fiillerde Anlam: Oluş",
                "outcome": "T.7.4.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TUR-7-1-4",
                "title": "Fiillerde Anlam: Durum Fiilleri",
                "outcome": "T.7.4.1.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TUR-7-1-5",
                "title": "Fiillerde Anlam - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.4.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Fiil Çekimi: Haber (Bildirme) Kipleri",
            "week": 2,
            "subtopics": [
              {
                "id": "TUR-7-2-1",
                "title": "Fiil Çekimi: Haber  Kipleri - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.4.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-2-2",
                "title": "Fiil Çekimi: Haber  Kipleri: Bildirme",
                "outcome": "T.7.4.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-7-2-3",
                "title": "Fiil Çekimi: Haber  Kipleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.4.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Fiil Çekimi: Dilek (Tasarlama) Kipleri",
            "week": 3,
            "subtopics": [
              {
                "id": "TUR-7-3-1",
                "title": "Fiil Çekimi: Dilek  Kipleri - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.4.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-3-2",
                "title": "Fiil Çekimi: Dilek  Kipleri: Tasarlama",
                "outcome": "T.7.4.3.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-7-3-3",
                "title": "Fiil Çekimi: Dilek  Kipleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.4.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Fiillerde Kişi (Şahıs) Ekleri ve Olumsuzluk",
            "week": 4,
            "subtopics": [
              {
                "id": "TUR-7-4-1",
                "title": "Fiillerde Kişi  Ekleri ve Olumsuzluk - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.4.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-4-2",
                "title": "Fiillerde Kişi  Ekleri ve Olumsuzluk: Şahıs",
                "outcome": "T.7.4.4.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-7-4-3",
                "title": "Fiillerde Kişi  Ekleri ve Olumsuzluk - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.4.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-7-U2",
        "unitTitle": "2. Ünite: Fiillerde Anlam ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Fiillerde Anlam (Zaman) Kayması",
            "week": 5,
            "subtopics": [
              {
                "id": "TUR-7-5-1",
                "title": "Fiillerde Anlam  Kayması - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.4.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-5-2",
                "title": "Fiillerde Anlam  Kayması: Zaman",
                "outcome": "T.7.4.5.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-7-5-3",
                "title": "Fiillerde Anlam  Kayması - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.4.5.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Ek Fiil (İsimlere Gelen Ek Fiil ve İşlevleri)",
            "week": 6,
            "subtopics": [
              {
                "id": "TUR-7-6-1",
                "title": "Ek Fiil - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.4.6",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-6-2",
                "title": "Ek Fiil: İsimlere Gelen Ek Fiil ve İşlevleri",
                "outcome": "T.7.4.6.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-7-6-3",
                "title": "Ek Fiil - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.4.6.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Ek Fiil (Basit Zamanlı Fiilleri Birleşik Zamanlı Yapma)",
            "week": 7,
            "subtopics": [
              {
                "id": "TUR-7-7-1",
                "title": "Ek Fiil - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.4.7",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-7-2",
                "title": "Ek Fiil: Basit Zamanlı Fiilleri Birleşik Zamanlı Yapma",
                "outcome": "T.7.4.7.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-7-7-3",
                "title": "Ek Fiil - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.4.7.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Zarflar (Belirteçler): Durum, Zaman, Miktar, Yer-Yön, Soru",
            "week": 8,
            "subtopics": [
              {
                "id": "TUR-7-8-1",
                "title": "Zarflar : Durum, Zaman, Miktar, Yer-Yön, Soru - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.4.8",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-8-2",
                "title": "Zarflar : Durum, Zaman, Miktar, Yer-Yön, Soru: Belirteçler",
                "outcome": "T.7.4.8.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-7-8-3",
                "title": "Zarflar : Durum, Zaman, Miktar, Yer-Yön, Soru - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.4.8.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-7-U3",
        "unitTitle": "3. Ünite: Zarfların Cümleye Kattığı Anlamlar ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Zarfların Cümleye Kattığı Anlamlar",
            "week": 9,
            "subtopics": [
              {
                "id": "TUR-7-9-1",
                "title": "Zarfların Cümleye Kattığı Anlamlar - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.4.9",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-9-2",
                "title": "Zarfların Cümleye Kattığı Anlamlar - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.4.9.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Fiillerde Yapı: Basit, Türemiş ve Birleşik Fiiller",
            "week": 10,
            "subtopics": [
              {
                "id": "TUR-7-10-1",
                "title": "Fiillerde Yapı: Basit, Türemiş ve Birleşik Fiiller - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.4.10",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-10-2",
                "title": "Fiillerde Yapı: Basit, Türemiş ve Birleşik Fiiller - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.4.10.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Kurallı Birleşik Fiiller (Yeterlilik, Tezlik, Süreklilik, Yaklaşma)",
            "week": 11,
            "subtopics": [
              {
                "id": "TUR-7-11-1",
                "title": "Kurallı Birleşik Fiiller - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.4.11",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-11-2",
                "title": "Kurallı Birleşik Fiiller: Yeterlilik",
                "outcome": "T.7.4.11.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-7-11-3",
                "title": "Kurallı Birleşik Fiiller: Tezlik",
                "outcome": "T.7.4.11.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TUR-7-11-4",
                "title": "Kurallı Birleşik Fiiller: Süreklilik",
                "outcome": "T.7.4.11.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TUR-7-11-5",
                "title": "Kurallı Birleşik Fiiller: Yaklaşma",
                "outcome": "T.7.4.11.4",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TUR-7-11-6",
                "title": "Kurallı Birleşik Fiiller - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.4.11.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Deyimleşmiş ve Yardımcı Eylemle Kurulan Birleşik Fiiller",
            "week": 12,
            "subtopics": [
              {
                "id": "TUR-7-12-1",
                "title": "Deyimleşmiş ve Yardımcı Eylemle Kurulan Birleşik Fiiller - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.4.12",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-12-2",
                "title": "Deyimleşmiş ve Yardımcı Eylemle Kurulan Birleşik Fiiller - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.4.12.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-7-U4",
        "unitTitle": "4. Ünite: Paragrafta Ana Düşünce ve Vurgu ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Paragrafta Ana Düşünce ve Vurgu",
            "week": 13,
            "subtopics": [
              {
                "id": "TUR-7-13-1",
                "title": "Paragrafta Ana Düşünce ve Vurgu - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-13-2",
                "title": "Paragrafta Ana Düşünce ve Vurgu - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Paragrafta Yardımcı Fikirler ve Yargı Tespiti",
            "week": 14,
            "subtopics": [
              {
                "id": "TUR-7-14-1",
                "title": "Paragrafta Yardımcı Fikirler ve Yargı Tespiti - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.3.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-14-2",
                "title": "Paragrafta Yardımcı Fikirler ve Yargı Tespiti - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.3.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Düşüncenin Akışını Bozan Cümle ve İkiye Bölme",
            "week": 15,
            "subtopics": [
              {
                "id": "TUR-7-15-1",
                "title": "Düşüncenin Akışını Bozan Cümle ve İkiye Bölme - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.3.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-15-2",
                "title": "Düşüncenin Akışını Bozan Cümle ve İkiye Bölme - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.3.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Anlatım Biçimleri: Öyküleme, Betimleme, Açıklama, Tartışma",
            "week": 16,
            "subtopics": [
              {
                "id": "TUR-7-16-1",
                "title": "Anlatım Biçimleri: Öyküleme, Betimleme, Açıklama, Tartışma - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.3.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-16-2",
                "title": "Anlatım Biçimleri: Öyküleme, Betimleme, Açıklama, Tartışma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.3.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-7-U5",
        "unitTitle": "5. Ünite: Düşünceyi Geliştirme Yolları ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Düşünceyi Geliştirme Yolları (Tanık Gösterme, Karşılaştırma)",
            "week": 17,
            "subtopics": [
              {
                "id": "TUR-7-17-1",
                "title": "Düşünceyi Geliştirme Yolları - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.3.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-17-2",
                "title": "Düşünceyi Geliştirme Yolları: Tanık Gösterme",
                "outcome": "T.7.3.5.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-7-17-3",
                "title": "Düşünceyi Geliştirme Yolları: Karşılaştırma",
                "outcome": "T.7.3.5.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TUR-7-17-4",
                "title": "Düşünceyi Geliştirme Yolları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.3.5.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Metin Türleri: Söyleşi (Sohbet) ve Fıkra (Köşe Yazısı)",
            "week": 18,
            "subtopics": [
              {
                "id": "TUR-7-18-1",
                "title": "Metin Türleri: Söyleşi - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.3.6",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-18-2",
                "title": "Metin Türleri: Söyleşi: Sohbet",
                "outcome": "T.7.3.6.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-7-18-3",
                "title": "Metin Türleri: Söyleşi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.3.6.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Metin Türleri: Deneme, Makale ve Biyografi",
            "week": 19,
            "subtopics": [
              {
                "id": "TUR-7-19-1",
                "title": "Metin Türleri: Deneme, Makale ve Biyografi - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.3.7",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-19-2",
                "title": "Metin Türleri: Deneme, Makale ve Biyografi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.3.7.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Söz Sanatları: Teşbih, Teşhis, İntak, Tezat, Mübalağa",
            "week": 20,
            "subtopics": [
              {
                "id": "TUR-7-20-1",
                "title": "Söz Sanatları: Teşbih, Teşhis, İntak, Tezat, Mübalağa - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.3.8",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-20-2",
                "title": "Söz Sanatları: Teşbih, Teşhis, İntak, Tezat, Mübalağa - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.3.8.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-7-U6",
        "unitTitle": "6. Ünite: Cümlede Anlam İlişkileri ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Cümlede Anlam İlişkileri (Neden, Amaç, Koşul)",
            "week": 21,
            "subtopics": [
              {
                "id": "TUR-7-21-1",
                "title": "Cümlede Anlam İlişkileri - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-21-2",
                "title": "Cümlede Anlam İlişkileri: Neden",
                "outcome": "T.7.1.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "TUR-7-21-3",
                "title": "Cümlede Anlam İlişkileri: Amaç",
                "outcome": "T.7.1.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TUR-7-21-4",
                "title": "Cümlede Anlam İlişkileri: Koşul",
                "outcome": "T.7.1.1.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "TUR-7-21-5",
                "title": "Cümlede Anlam İlişkileri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Örtülü Anlam ve Cümle Yorumu",
            "week": 22,
            "subtopics": [
              {
                "id": "TUR-7-22-1",
                "title": "Örtülü Anlam ve Cümle Yorumu - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-22-2",
                "title": "Örtülü Anlam ve Cümle Yorumu - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Deyimler ve Atasözleri Tahlili",
            "week": 23,
            "subtopics": [
              {
                "id": "TUR-7-23-1",
                "title": "Deyimler ve Atasözleri Tahlili - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.1.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-23-2",
                "title": "Deyimler ve Atasözleri Tahlili - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.1.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Yazım Kuralları: Büyük Harfler ve Kısaltmalar",
            "week": 24,
            "subtopics": [
              {
                "id": "TUR-7-24-1",
                "title": "Yazım Kuralları: Büyük Harfler ve Kısaltmalar - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.4.13",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-24-2",
                "title": "Yazım Kuralları: Büyük Harfler ve Kısaltmalar - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.4.13.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-7-U7",
        "unitTitle": "7. Ünite: Yazım Kuralları ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Yazım Kuralları: Birleşik Sözcükler ve Eklerin Yazımı",
            "week": 25,
            "subtopics": [
              {
                "id": "TUR-7-25-1",
                "title": "Yazım Kuralları: Birleşik Sözcükler ve Eklerin Yazımı - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.4.14",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-25-2",
                "title": "Yazım Kuralları: Birleşik Sözcükler ve Eklerin Yazımı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.4.14.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Noktalama: Noktalı Virgül ve İki Nokta",
            "week": 26,
            "subtopics": [
              {
                "id": "TUR-7-26-1",
                "title": "Noktalama: Noktalı Virgül ve İki Nokta - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.4.15",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-26-2",
                "title": "Noktalama: Noktalı Virgül ve İki Nokta - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.4.15.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Noktalama: Tırnak İşareti ve Kesme İşareti İstisnaları",
            "week": 27,
            "subtopics": [
              {
                "id": "TUR-7-27-1",
                "title": "Noktalama: Tırnak İşareti ve Kesme İşareti İstisnaları - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.4.16",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-27-2",
                "title": "Noktalama: Tırnak İşareti ve Kesme İşareti İstisnaları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.4.16.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Sözel Mantık: Çoklu Değişkenli Tablo Analizi",
            "week": 28,
            "subtopics": [
              {
                "id": "TUR-7-28-1",
                "title": "Sözel Mantık: Çoklu Değişkenli Tablo Analizi - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.3.9",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-28-2",
                "title": "Sözel Mantık: Çoklu Değişkenli Tablo Analizi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.3.9.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-7-U8",
        "unitTitle": "8. Ünite: Sözel Mantık ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Sözel Mantık: Şifreleme ve Sıralama Problemleri",
            "week": 29,
            "subtopics": [
              {
                "id": "TUR-7-29-1",
                "title": "Sözel Mantık: Şifreleme ve Sıralama Problemleri - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.3.10",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-29-2",
                "title": "Sözel Mantık: Şifreleme ve Sıralama Problemleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.3.10.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Görsel, Grafik ve İnfografik Yorumlama",
            "week": 30,
            "subtopics": [
              {
                "id": "TUR-7-30-1",
                "title": "Görsel, Grafik ve İnfografik Yorumlama - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.3.11",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-30-2",
                "title": "Görsel, Grafik ve İnfografik Yorumlama - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.3.11.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Diyalog Tamamlama ve Metin Karşılaştırma",
            "week": 31,
            "subtopics": [
              {
                "id": "TUR-7-31-1",
                "title": "Diyalog Tamamlama ve Metin Karşılaştırma - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.3.12",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-31-2",
                "title": "Diyalog Tamamlama ve Metin Karşılaştırma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.3.12.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Eleştirel Okuma ve Metin Çözümleme",
            "week": 32,
            "subtopics": [
              {
                "id": "TUR-7-32-1",
                "title": "Eleştirel Okuma ve Metin Çözümleme - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.3.13",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-32-2",
                "title": "Eleştirel Okuma ve Metin Çözümleme - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.3.13.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "TUR-7-U9",
        "unitTitle": "9. Ünite: 7. Sınıf Türkçe LGS Hazırlık Denemesi - I ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "7. Sınıf Türkçe LGS Hazırlık Denemesi - I",
            "week": 33,
            "subtopics": [
              {
                "id": "TUR-7-33-1",
                "title": "7. Sınıf Türkçe LGS Hazırlık Denemesi - I - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.LGS.01",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-33-2",
                "title": "7. Sınıf Türkçe LGS Hazırlık Denemesi - I - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.LGS.01.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "7. Sınıf Türkçe LGS Hazırlık Denemesi - II",
            "week": 34,
            "subtopics": [
              {
                "id": "TUR-7-34-1",
                "title": "7. Sınıf Türkçe LGS Hazırlık Denemesi - II - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.LGS.02",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-34-2",
                "title": "7. Sınıf Türkçe LGS Hazırlık Denemesi - II - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.LGS.02.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "7. Sınıf Yıl Sonu Bütüncül Sözel Prova - I",
            "week": 35,
            "subtopics": [
              {
                "id": "TUR-7-35-1",
                "title": "7. Sınıf Yıl Sonu Bütüncül Sözel Prova - I - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.LGS.03",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-35-2",
                "title": "7. Sınıf Yıl Sonu Bütüncül Sözel Prova - I - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.LGS.03.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "7. Sınıf Yıl Sonu Bütüncül Sözel Prova - II",
            "week": 36,
            "subtopics": [
              {
                "id": "TUR-7-36-1",
                "title": "7. Sınıf Yıl Sonu Bütüncül Sözel Prova - II - Temel Kavramlar ve Tanımlar",
                "outcome": "T.7.LGS.04",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "TUR-7-36-2",
                "title": "7. Sınıf Yıl Sonu Bütüncül Sözel Prova - II - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "T.7.LGS.04.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      }
    ]
  },
  "matematik": {
    "courseName": "Matematik",
    "grade": 7,
    "totalUnits": 9,
    "units": [
      {
        "unitId": "MAT-7-U1",
        "unitTitle": "1. Ünite: Tam Sayılarla Toplama ve Çıkarma İşlemleri ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Tam Sayılarla Toplama ve Çıkarma İşlemleri",
            "week": 1,
            "subtopics": [
              {
                "id": "MAT-7-1-1",
                "title": "Tam Sayılarla Toplama ve Çıkarma İşlemleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.1.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-1-2",
                "title": "Tam Sayılarla Toplama ve Çıkarma İşlemleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.1.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Tam Sayılarla Çarpma ve Bölme İşlemleri",
            "week": 2,
            "subtopics": [
              {
                "id": "MAT-7-2-1",
                "title": "Tam Sayılarla Çarpma ve Bölme İşlemleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.1.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-2-2",
                "title": "Tam Sayılarla Çarpma ve Bölme İşlemleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.1.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Tam Sayıların Tam Sayı Kuvvetleri (Üslü Nicelikler)",
            "week": 3,
            "subtopics": [
              {
                "id": "MAT-7-3-1",
                "title": "Tam Sayıların Tam Sayı Kuvvetleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.1.1.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-3-2",
                "title": "Tam Sayıların Tam Sayı Kuvvetleri: Üslü Nicelikler",
                "outcome": "M.7.1.1.3.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-7-3-3",
                "title": "Tam Sayıların Tam Sayı Kuvvetleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.1.1.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Tam Sayı Problemleri ve Çok Adımlı İşlemler",
            "week": 4,
            "subtopics": [
              {
                "id": "MAT-7-4-1",
                "title": "Tam Sayı Problemleri ve Çok Adımlı İşlemler - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.1.1.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-4-2",
                "title": "Tam Sayı Problemleri ve Çok Adımlı İşlemler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.1.1.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-7-U2",
        "unitTitle": "2. Ünite: Rasyonel Sayılar ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Rasyonel Sayılar: Sayı Doğrusunda Gösterimi ve Sıralama",
            "week": 5,
            "subtopics": [
              {
                "id": "MAT-7-5-1",
                "title": "Rasyonel Sayılar: Sayı Doğrusunda Gösterimi ve Sıralama - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.1.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-5-2",
                "title": "Rasyonel Sayılar: Sayı Doğrusunda Gösterimi ve Sıralama - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.1.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Devirli Ondalık Gösterimleri Rasyonel Sayıya Dönüştürme",
            "week": 6,
            "subtopics": [
              {
                "id": "MAT-7-6-1",
                "title": "Devirli Ondalık Gösterimleri Rasyonel Sayıya Dönüştürme - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.1.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-6-2",
                "title": "Devirli Ondalık Gösterimleri Rasyonel Sayıya Dönüştürme - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.1.2.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Rasyonel Sayılarla Toplama ve Çıkarma İşlemleri",
            "week": 7,
            "subtopics": [
              {
                "id": "MAT-7-7-1",
                "title": "Rasyonel Sayılarla Toplama ve Çıkarma İşlemleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.1.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-7-2",
                "title": "Rasyonel Sayılarla Toplama ve Çıkarma İşlemleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.1.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Rasyonel Sayılarla Çarpma ve Bölme İşlemleri",
            "week": 8,
            "subtopics": [
              {
                "id": "MAT-7-8-1",
                "title": "Rasyonel Sayılarla Çarpma ve Bölme İşlemleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.1.3.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-8-2",
                "title": "Rasyonel Sayılarla Çarpma ve Bölme İşlemleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.1.3.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-7-U3",
        "unitTitle": "3. Ünite: Rasyonel Sayıların Kare ve Küpleri ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Rasyonel Sayıların Kare ve Küpleri",
            "week": 9,
            "subtopics": [
              {
                "id": "MAT-7-9-1",
                "title": "Rasyonel Sayıların Kare ve Küpleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.1.3.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-9-2",
                "title": "Rasyonel Sayıların Kare ve Küpleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.1.3.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Rasyonel Sayılarla Çok Adımlı İşlemler ve Merdivenli Kesirler",
            "week": 10,
            "subtopics": [
              {
                "id": "MAT-7-10-1",
                "title": "Rasyonel Sayılarla Çok Adımlı İşlemler ve Merdivenli Kesirler - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.1.3.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-10-2",
                "title": "Rasyonel Sayılarla Çok Adımlı İşlemler ve Merdivenli Kesirler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.1.3.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Rasyonel Sayı Problemleri (Gerçek Yaşam Senaryoları)",
            "week": 11,
            "subtopics": [
              {
                "id": "MAT-7-11-1",
                "title": "Rasyonel Sayı Problemleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.1.3.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-11-2",
                "title": "Rasyonel Sayı Problemleri: Gerçek Yaşam Senaryoları",
                "outcome": "M.7.1.3.5.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-7-11-3",
                "title": "Rasyonel Sayı Problemleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.1.3.5.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Cebirsel İfadelerle Toplama ve Çıkarma İşlemleri",
            "week": 12,
            "subtopics": [
              {
                "id": "MAT-7-12-1",
                "title": "Cebirsel İfadelerle Toplama ve Çıkarma İşlemleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.2.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-12-2",
                "title": "Cebirsel İfadelerle Toplama ve Çıkarma İşlemleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.2.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-7-U4",
        "unitTitle": "4. Ünite: Bir Doğal Sayı ile Cebirsel İfadeyi Çarpma ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Bir Doğal Sayı ile Cebirsel İfadeyi Çarpma",
            "week": 13,
            "subtopics": [
              {
                "id": "MAT-7-13-1",
                "title": "Bir Doğal Sayı ile Cebirsel İfadeyi Çarpma - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.2.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-13-2",
                "title": "Bir Doğal Sayı ile Cebirsel İfadeyi Çarpma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.2.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Sayı Örüntülerinin Genel Kuralını (n) Bulma",
            "week": 14,
            "subtopics": [
              {
                "id": "MAT-7-14-1",
                "title": "Sayı Örüntülerinin Genel Kuralını  Bulma - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.2.1.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-14-2",
                "title": "Sayı Örüntülerinin Genel Kuralını  Bulma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.2.1.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Eşitliğin Korunumu İlkesi ve Terazi Denge Modelleri",
            "week": 15,
            "subtopics": [
              {
                "id": "MAT-7-15-1",
                "title": "Eşitliğin Korunumu İlkesi ve Terazi Denge Modelleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.2.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-15-2",
                "title": "Eşitliğin Korunumu İlkesi ve Terazi Denge Modelleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.2.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Birinci Dereceden Bir Bilinmeyenli Denklemler",
            "week": 16,
            "subtopics": [
              {
                "id": "MAT-7-16-1",
                "title": "Birinci Dereceden Bir Bilinmeyenli Denklemler - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.2.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-16-2",
                "title": "Birinci Dereceden Bir Bilinmeyenli Denklemler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.2.2.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-7-U5",
        "unitTitle": "5. Ünite: Parantezli ve Rasyonel Katsayılı Denklem Çözümü ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Parantezli ve Rasyonel Katsayılı Denklem Çözümü",
            "week": 17,
            "subtopics": [
              {
                "id": "MAT-7-17-1",
                "title": "Parantezli ve Rasyonel Katsayılı Denklem Çözümü - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.2.2.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-17-2",
                "title": "Parantezli ve Rasyonel Katsayılı Denklem Çözümü - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.2.2.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Birinci Dereceden Bir Bilinmeyenli Denklem Problemleri",
            "week": 18,
            "subtopics": [
              {
                "id": "MAT-7-18-1",
                "title": "Birinci Dereceden Bir Bilinmeyenli Denklem Problemleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.2.2.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-18-2",
                "title": "Birinci Dereceden Bir Bilinmeyenli Denklem Problemleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.2.2.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Oran Kavramı ve Orantı Sabiti (k)",
            "week": 19,
            "subtopics": [
              {
                "id": "MAT-7-19-1",
                "title": "Oran Kavramı ve Orantı Sabiti - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.1.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-19-2",
                "title": "Oran Kavramı ve Orantı Sabiti - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.1.4.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Doğru Orantı ve Problem Çözümleri",
            "week": 20,
            "subtopics": [
              {
                "id": "MAT-7-20-1",
                "title": "Doğru Orantı ve Problem Çözümleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.1.4.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-20-2",
                "title": "Doğru Orantı ve Problem Çözümleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.1.4.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-7-U6",
        "unitTitle": "6. Ünite: Ters Orantı ve Problem Çözümleri ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Ters Orantı ve Problem Çözümleri",
            "week": 21,
            "subtopics": [
              {
                "id": "MAT-7-21-1",
                "title": "Ters Orantı ve Problem Çözümleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.1.4.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-21-2",
                "title": "Ters Orantı ve Problem Çözümleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.1.4.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Doğru ve Ters Orantı Karışık Problemleri (İşçi, Havuz, Yol)",
            "week": 22,
            "subtopics": [
              {
                "id": "MAT-7-22-1",
                "title": "Doğru ve Ters Orantı Karışık Problemleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.1.4.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-22-2",
                "title": "Doğru ve Ters Orantı Karışık Problemleri: İşçi",
                "outcome": "M.7.1.4.4.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-7-22-3",
                "title": "Doğru ve Ters Orantı Karışık Problemleri: Havuz",
                "outcome": "M.7.1.4.4.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-7-22-4",
                "title": "Doğru ve Ters Orantı Karışık Problemleri: Yol",
                "outcome": "M.7.1.4.4.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-7-22-5",
                "title": "Doğru ve Ters Orantı Karışık Problemleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.1.4.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Yüzde Hesaplamaları: Bir Çokluğun Yüzdesini Bulma",
            "week": 23,
            "subtopics": [
              {
                "id": "MAT-7-23-1",
                "title": "Yüzde Hesaplamaları: Bir Çokluğun Yüzdesini Bulma - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.1.5.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-23-2",
                "title": "Yüzde Hesaplamaları: Bir Çokluğun Yüzdesini Bulma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.1.5.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Yüzde ile Artırma ve Azaltma (KDV, İndirim, Zam)",
            "week": 24,
            "subtopics": [
              {
                "id": "MAT-7-24-1",
                "title": "Yüzde ile Artırma ve Azaltma - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.1.5.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-24-2",
                "title": "Yüzde ile Artırma ve Azaltma: KDV",
                "outcome": "M.7.1.5.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-7-24-3",
                "title": "Yüzde ile Artırma ve Azaltma: İndirim",
                "outcome": "M.7.1.5.2.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-7-24-4",
                "title": "Yüzde ile Artırma ve Azaltma: Zam",
                "outcome": "M.7.1.5.2.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-7-24-5",
                "title": "Yüzde ile Artırma ve Azaltma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.1.5.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-7-U7",
        "unitTitle": "7. Ünite: Kâr-Zarar Problemleri ve Faiz Hesaplamaları ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Kâr-Zarar Problemleri ve Faiz Hesaplamaları",
            "week": 25,
            "subtopics": [
              {
                "id": "MAT-7-25-1",
                "title": "Kâr-Zarar Problemleri ve Faiz Hesaplamaları - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.1.5.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-25-2",
                "title": "Kâr-Zarar Problemleri ve Faiz Hesaplamaları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.1.5.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Açılar: Bir Açının Açıortayı",
            "week": 26,
            "subtopics": [
              {
                "id": "MAT-7-26-1",
                "title": "Açılar: Bir Açının Açıortayı - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.3.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-26-2",
                "title": "Açılar: Bir Açının Açıortayı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.3.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "İki Paralel Doğruyla Bir Kesenin Oluşturduğu Açılar (Z, U, M Kuralları)",
            "week": 27,
            "subtopics": [
              {
                "id": "MAT-7-27-1",
                "title": "İki Paralel Doğruyla Bir Kesenin Oluşturduğu Açılar - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.3.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-27-4",
                "title": "İki Paralel Doğruyla Bir Kesenin Oluşturduğu Açılar: M Kuralları",
                "outcome": "M.7.3.1.2.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "MAT-7-27-3",
                "title": "İki Paralel Doğruyla Bir Kesenin Oluşturduğu Açılar - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.3.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Çokgenler: Düzgün Çokgenler ve İç/Dış Açı Özellikleri",
            "week": 28,
            "subtopics": [
              {
                "id": "MAT-7-28-1",
                "title": "Çokgenler: Düzgün Çokgenler ve İç/Dış Açı Özellikleri - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.3.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-28-2",
                "title": "Çokgenler: Düzgün Çokgenler ve İç/Dış Açı Özellikleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.3.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-7-U8",
        "unitTitle": "8. Ünite: Özel Dörtgenler ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Özel Dörtgenler: Paralelkenar, Eşkenar Dörtgen, Dikdörtgen, Kare, Yamuk",
            "week": 29,
            "subtopics": [
              {
                "id": "MAT-7-29-1",
                "title": "Özel Dörtgenler: Paralelkenar, Eşkenar Dörtgen, Dikdörtgen, Kare, Yamuk - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.3.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-29-2",
                "title": "Özel Dörtgenler: Paralelkenar, Eşkenar Dörtgen, Dikdörtgen, Kare, Yamuk - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.3.2.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Eşkenar Dörtgen ve Yamuğun Alanı",
            "week": 30,
            "subtopics": [
              {
                "id": "MAT-7-30-1",
                "title": "Eşkenar Dörtgen ve Yamuğun Alanı - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.3.2.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-30-2",
                "title": "Eşkenar Dörtgen ve Yamuğun Alanı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.3.2.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Çemberde Merkez Açı ve Gördüğü Yay İlişkisi",
            "week": 31,
            "subtopics": [
              {
                "id": "MAT-7-31-1",
                "title": "Çemberde Merkez Açı ve Gördüğü Yay İlişkisi - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.3.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-31-2",
                "title": "Çemberde Merkez Açı ve Gördüğü Yay İlişkisi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.3.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Çember Yayının Uzunluğu ve Çevre Hesaplamaları",
            "week": 32,
            "subtopics": [
              {
                "id": "MAT-7-32-1",
                "title": "Çember Yayının Uzunluğu ve Çevre Hesaplamaları - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.3.3.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-32-2",
                "title": "Çember Yayının Uzunluğu ve Çevre Hesaplamaları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.3.3.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "MAT-7-U9",
        "unitTitle": "9. Ünite: Dairenin ve Daire Diliminin Alanı ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Dairenin ve Daire Diliminin Alanı (πr² x α/360)",
            "week": 33,
            "subtopics": [
              {
                "id": "MAT-7-33-1",
                "title": "Dairenin ve Daire Diliminin Alanı - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.3.3.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-33-2",
                "title": "Dairenin ve Daire Diliminin Alanı: πr² x α/360",
                "outcome": "M.7.3.3.3.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-7-33-3",
                "title": "Dairenin ve Daire Diliminin Alanı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.3.3.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Veri Analizi: Çizgi Grafiği Çizme ve Yorumlama",
            "week": 34,
            "subtopics": [
              {
                "id": "MAT-7-34-1",
                "title": "Veri Analizi: Çizgi Grafiği Çizme ve Yorumlama - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.4.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-34-2",
                "title": "Veri Analizi: Çizgi Grafiği Çizme ve Yorumlama - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.4.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Daire Grafiği ve Grafikler Arası Dönüşüm (360 Derece Dağılımı)",
            "week": 35,
            "subtopics": [
              {
                "id": "MAT-7-35-1",
                "title": "Daire Grafiği ve Grafikler Arası Dönüşüm - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.4.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-35-2",
                "title": "Daire Grafiği ve Grafikler Arası Dönüşüm: 360 Derece Dağılımı",
                "outcome": "M.7.4.1.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "MAT-7-35-3",
                "title": "Daire Grafiği ve Grafikler Arası Dönüşüm - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.4.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "7. Sınıf Yıl Sonu Bütüncül Sayısal Prova",
            "week": 36,
            "subtopics": [
              {
                "id": "MAT-7-36-1",
                "title": "7. Sınıf Yıl Sonu Bütüncül Sayısal Prova - Temel Kavramlar ve Tanımlar",
                "outcome": "M.7.LGS.01",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "MAT-7-36-2",
                "title": "7. Sınıf Yıl Sonu Bütüncül Sayısal Prova - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "M.7.LGS.01.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      }
    ]
  },
  "fen": {
    "courseName": "Fen Bilimleri",
    "grade": 7,
    "totalUnits": 9,
    "units": [
      {
        "unitId": "FEN-7-U1",
        "unitTitle": "1. Ünite: Uzay Araştırmaları ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Uzay Araştırmaları: Roketler, Uydular ve Uzay İstasyonları",
            "week": 1,
            "subtopics": [
              {
                "id": "FEN-7-1-1",
                "title": "Uzay Araştırmaları: Roketler, Uydular ve Uzay İstasyonları - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.1.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-1-2",
                "title": "Uzay Araştırmaları: Roketler, Uydular ve Uzay İstasyonları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.1.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Uzay Kirliliği ve Çözüm Önerileri",
            "week": 2,
            "subtopics": [
              {
                "id": "FEN-7-2-1",
                "title": "Uzay Kirliliği ve Çözüm Önerileri - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.1.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-2-2",
                "title": "Uzay Kirliliği ve Çözüm Önerileri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.1.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Teleskobun Yapısı ve Tarihsel Gelişimi (Aynalı/Mercekli)",
            "week": 3,
            "subtopics": [
              {
                "id": "FEN-7-3-1",
                "title": "Teleskobun Yapısı ve Tarihsel Gelişimi - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.1.1.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-3-2",
                "title": "Teleskobun Yapısı ve Tarihsel Gelişimi: Aynalı/Mercekli",
                "outcome": "F.7.1.1.3.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-7-3-3",
                "title": "Teleskobun Yapısı ve Tarihsel Gelişimi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.1.1.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Güneş Sistemi Ötesi Gök Cisimleri: Yıldızlar ve Yaşam Döngüsü",
            "week": 4,
            "subtopics": [
              {
                "id": "FEN-7-4-1",
                "title": "Güneş Sistemi Ötesi Gök Cisimleri: Yıldızlar ve Yaşam Döngüsü - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.1.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-4-2",
                "title": "Güneş Sistemi Ötesi Gök Cisimleri: Yıldızlar ve Yaşam Döngüsü - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.1.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-7-U2",
        "unitTitle": "2. Ünite: Bulutsu ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Bulutsu (Nebula), Karadelik ve Galaksiler (Samanyolu, Andromeda)",
            "week": 5,
            "subtopics": [
              {
                "id": "FEN-7-5-1",
                "title": "Bulutsu - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.1.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-5-2",
                "title": "Bulutsu: Nebula",
                "outcome": "F.7.1.2.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-7-5-3",
                "title": "Bulutsu - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.1.2.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Hücrenin Temel Kısımları: Çekirdek, Sitoplazma, Hücre Zarı",
            "week": 6,
            "subtopics": [
              {
                "id": "FEN-7-6-1",
                "title": "Hücrenin Temel Kısımları: Çekirdek, Sitoplazma, Hücre Zarı - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.2.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-6-2",
                "title": "Hücrenin Temel Kısımları: Çekirdek, Sitoplazma, Hücre Zarı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.2.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Hücre Organelleri ve Görevleri (Bitki ve Hayvan Hücresi Farkları)",
            "week": 7,
            "subtopics": [
              {
                "id": "FEN-7-7-1",
                "title": "Hücre Organelleri ve Görevleri - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.2.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-7-2",
                "title": "Hücre Organelleri ve Görevleri: Bitki ve Hayvan Hücresi Farkları",
                "outcome": "F.7.2.1.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-7-7-3",
                "title": "Hücre Organelleri ve Görevleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.2.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Hücre - Doku - Organ - Sistem - Organizma İlişkisi",
            "week": 8,
            "subtopics": [
              {
                "id": "FEN-7-8-1",
                "title": "Hücre - Doku - Organ - Sistem - Organizma İlişkisi - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.2.1.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-8-2",
                "title": "Hücre - Doku - Organ - Sistem - Organizma İlişkisi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.2.1.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-7-U3",
        "unitTitle": "3. Ünite: Mitoz Bölünme ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Mitoz Bölünme: Evreleri ve Canlılar İçin Önemi (Kromozom Sayısı)",
            "week": 9,
            "subtopics": [
              {
                "id": "FEN-7-9-1",
                "title": "Mitoz Bölünme: Evreleri ve Canlılar İçin Önemi - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.2.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-9-2",
                "title": "Mitoz Bölünme: Evreleri ve Canlılar İçin Önemi: Kromozom Sayısı",
                "outcome": "F.7.2.2.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-7-9-3",
                "title": "Mitoz Bölünme: Evreleri ve Canlılar İçin Önemi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.2.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Mayoz Bölünme: Mayoz I ve Mayoz II Evreleri",
            "week": 10,
            "subtopics": [
              {
                "id": "FEN-7-10-1",
                "title": "Mayoz Bölünme: Mayoz I ve Mayoz II Evreleri - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.2.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-10-2",
                "title": "Mayoz Bölünme: Mayoz I ve Mayoz II Evreleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.2.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Parça Değişimi (Krossing-over) ve Genetik Çeşitlilik",
            "week": 11,
            "subtopics": [
              {
                "id": "FEN-7-11-1",
                "title": "Parça Değişimi  ve Genetik Çeşitlilik - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.2.3.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-11-2",
                "title": "Parça Değişimi  ve Genetik Çeşitlilik: Krossing-over",
                "outcome": "F.7.2.3.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-7-11-3",
                "title": "Parça Değişimi  ve Genetik Çeşitlilik - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.2.3.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Mitoz ve Mayoz Bölünme Karşılaştırmalı Analizi",
            "week": 12,
            "subtopics": [
              {
                "id": "FEN-7-12-1",
                "title": "Mitoz ve Mayoz Bölünme Karşılaştırmalı Analizi - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.2.3.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-12-2",
                "title": "Mitoz ve Mayoz Bölünme Karşılaştırmalı Analizi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.2.3.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-7-U4",
        "unitTitle": "4. Ünite: Kütle ve Ağırlık Kavramları Arasındaki Farklar ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Kütle ve Ağırlık Kavramları Arasındaki Farklar",
            "week": 13,
            "subtopics": [
              {
                "id": "FEN-7-13-1",
                "title": "Kütle ve Ağırlık Kavramları Arasındaki Farklar - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.3.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-13-2",
                "title": "Kütle ve Ağırlık Kavramları Arasındaki Farklar - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.3.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Yer Çekimi Kuvveti ve Gök Cisimlerinde Ağırlık",
            "week": 14,
            "subtopics": [
              {
                "id": "FEN-7-14-1",
                "title": "Yer Çekimi Kuvveti ve Gök Cisimlerinde Ağırlık - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.3.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-14-2",
                "title": "Yer Çekimi Kuvveti ve Gök Cisimlerinde Ağırlık - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.3.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Fiziksel Anlamda İş: Kuvvet x Yol İlişkisi",
            "week": 15,
            "subtopics": [
              {
                "id": "FEN-7-15-1",
                "title": "Fiziksel Anlamda İş: Kuvvet x Yol İlişkisi - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.3.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-15-2",
                "title": "Fiziksel Anlamda İş: Kuvvet x Yol İlişkisi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.3.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Kinetik Enerji ve Değişkenleri (Kütle ve Sürat)",
            "week": 16,
            "subtopics": [
              {
                "id": "FEN-7-16-1",
                "title": "Kinetik Enerji ve Değişkenleri - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.3.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-16-2",
                "title": "Kinetik Enerji ve Değişkenleri: Kütle ve Sürat",
                "outcome": "F.7.3.3.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-7-16-3",
                "title": "Kinetik Enerji ve Değişkenleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.3.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-7-U5",
        "unitTitle": "5. Ünite: Potansiyel Enerji ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Potansiyel Enerji (Çekim ve Esneklik Potansiyel Enerjisi)",
            "week": 17,
            "subtopics": [
              {
                "id": "FEN-7-17-1",
                "title": "Potansiyel Enerji - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.3.3.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-17-2",
                "title": "Potansiyel Enerji: Çekim ve Esneklik Potansiyel Enerjisi",
                "outcome": "F.7.3.3.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-7-17-3",
                "title": "Potansiyel Enerji - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.3.3.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Enerjinin Korunumu ve Dönüşümü (Sürtünmesiz Ortam)",
            "week": 18,
            "subtopics": [
              {
                "id": "FEN-7-18-1",
                "title": "Enerjinin Korunumu ve Dönüşümü - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.3.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-18-2",
                "title": "Enerjinin Korunumu ve Dönüşümü: Sürtünmesiz Ortam",
                "outcome": "F.7.3.4.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-7-18-3",
                "title": "Enerjinin Korunumu ve Dönüşümü - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.3.4.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Sürtünme Kuvveti ve Enerji Kaybı (Isıya Dönüşüm)",
            "week": 19,
            "subtopics": [
              {
                "id": "FEN-7-19-1",
                "title": "Sürtünme Kuvveti ve Enerji Kaybı - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.3.4.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-19-2",
                "title": "Sürtünme Kuvveti ve Enerji Kaybı: Isıya Dönüşüm",
                "outcome": "F.7.3.4.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-7-19-3",
                "title": "Sürtünme Kuvveti ve Enerji Kaybı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.3.4.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Maddenin Tanecikli Yapısı ve Atom Modelleri (Democritus'tan Günümüze)",
            "week": 20,
            "subtopics": [
              {
                "id": "FEN-7-20-1",
                "title": "Maddenin Tanecikli Yapısı ve Atom Modelleri - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.4.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-20-2",
                "title": "Maddenin Tanecikli Yapısı ve Atom Modelleri: Democritus'tan Günümüze",
                "outcome": "F.7.4.1.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-7-20-3",
                "title": "Maddenin Tanecikli Yapısı ve Atom Modelleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.4.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-7-U6",
        "unitTitle": "6. Ünite: Atomun Temel Parçacıkları ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Atomun Temel Parçacıkları: Proton, Nötron, Elektron",
            "week": 21,
            "subtopics": [
              {
                "id": "FEN-7-21-1",
                "title": "Atomun Temel Parçacıkları: Proton, Nötron, Elektron - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.4.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-21-2",
                "title": "Atomun Temel Parçacıkları: Proton, Nötron, Elektron - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.4.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Saf Maddeler: Elementler, Sembolleri ve Periyodik Sistem Giriş",
            "week": 22,
            "subtopics": [
              {
                "id": "FEN-7-22-1",
                "title": "Saf Maddeler: Elementler, Sembolleri ve Periyodik Sistem Giriş - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.4.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-22-2",
                "title": "Saf Maddeler: Elementler, Sembolleri ve Periyodik Sistem Giriş - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.4.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Bileşikler ve Formülleri (Su, Tuz, Karbondioksit vb.)",
            "week": 23,
            "subtopics": [
              {
                "id": "FEN-7-23-1",
                "title": "Bileşikler ve Formülleri - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.4.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-23-2",
                "title": "Bileşikler ve Formülleri: Su",
                "outcome": "F.7.4.2.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-7-23-3",
                "title": "Bileşikler ve Formülleri: Tuz",
                "outcome": "F.7.4.2.2.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-7-23-4",
                "title": "Bileşikler ve Formülleri: Karbondioksit vb.",
                "outcome": "F.7.4.2.2.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-7-23-5",
                "title": "Bileşikler ve Formülleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.4.2.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Karışımlar: Homojen (Çözelti) ve Heterojen Karışımlar",
            "week": 24,
            "subtopics": [
              {
                "id": "FEN-7-24-1",
                "title": "Karışımlar: Homojen  ve Heterojen Karışımlar - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.4.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-24-2",
                "title": "Karışımlar: Homojen  ve Heterojen Karışımlar: Çözelti",
                "outcome": "F.7.4.3.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-7-24-3",
                "title": "Karışımlar: Homojen  ve Heterojen Karışımlar - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.4.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-7-U7",
        "unitTitle": "7. Ünite: Çözünme Hızını Etkileyen Faktörler ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Çözünme Hızını Etkileyen Faktörler (Sıcaklık, Temas Yüzeyi, Karıştırma)",
            "week": 25,
            "subtopics": [
              {
                "id": "FEN-7-25-1",
                "title": "Çözünme Hızını Etkileyen Faktörler - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.4.3.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-25-2",
                "title": "Çözünme Hızını Etkileyen Faktörler: Sıcaklık",
                "outcome": "F.7.4.3.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-7-25-3",
                "title": "Çözünme Hızını Etkileyen Faktörler: Temas Yüzeyi",
                "outcome": "F.7.4.3.2.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-7-25-4",
                "title": "Çözünme Hızını Etkileyen Faktörler: Karıştırma",
                "outcome": "F.7.4.3.2.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-7-25-5",
                "title": "Çözünme Hızını Etkileyen Faktörler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.4.3.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Karışımların Ayrılması Yöntemleri (Buharlaştırma, Damıtma, Yoğunluk)",
            "week": 26,
            "subtopics": [
              {
                "id": "FEN-7-26-1",
                "title": "Karışımların Ayrılması Yöntemleri - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.4.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-26-2",
                "title": "Karışımların Ayrılması Yöntemleri: Buharlaştırma",
                "outcome": "F.7.4.4.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-7-26-3",
                "title": "Karışımların Ayrılması Yöntemleri: Damıtma",
                "outcome": "F.7.4.4.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-7-26-4",
                "title": "Karışımların Ayrılması Yöntemleri: Yoğunluk",
                "outcome": "F.7.4.4.1.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-7-26-5",
                "title": "Karışımların Ayrılması Yöntemleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.4.4.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Evsel Atıklar ve Geri Dönüşümün Önemi",
            "week": 27,
            "subtopics": [
              {
                "id": "FEN-7-27-1",
                "title": "Evsel Atıklar ve Geri Dönüşümün Önemi - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.4.5.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-27-2",
                "title": "Evsel Atıklar ve Geri Dönüşümün Önemi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.4.5.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Işığın Soğurulması ve Koyu/Açık Renklerin Etkisi",
            "week": 28,
            "subtopics": [
              {
                "id": "FEN-7-28-1",
                "title": "Işığın Soğurulması ve Koyu/Açık Renklerin Etkisi - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.5.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-28-2",
                "title": "Işığın Soğurulması ve Koyu/Açık Renklerin Etkisi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.5.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-7-U8",
        "unitTitle": "8. Ünite: Düzlem Aynalar ve Görüntü Özellikleri ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Düzlem Aynalar ve Görüntü Özellikleri",
            "week": 29,
            "subtopics": [
              {
                "id": "FEN-7-29-1",
                "title": "Düzlem Aynalar ve Görüntü Özellikleri - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.5.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-29-2",
                "title": "Düzlem Aynalar ve Görüntü Özellikleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.5.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Küresel Aynalar: Çukur ve Tümsek Aynalar",
            "week": 30,
            "subtopics": [
              {
                "id": "FEN-7-30-1",
                "title": "Küresel Aynalar: Çukur ve Tümsek Aynalar - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.5.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-30-2",
                "title": "Küresel Aynalar: Çukur ve Tümsek Aynalar - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.5.2.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Işığın Kırılması ve Kırılma Kanunları",
            "week": 31,
            "subtopics": [
              {
                "id": "FEN-7-31-1",
                "title": "Işığın Kırılması ve Kırılma Kanunları - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.5.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-31-2",
                "title": "Işığın Kırılması ve Kırılma Kanunları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.5.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Mercekler (İnce ve Kalın Kenarlı Mercekler, Odak Noktası)",
            "week": 32,
            "subtopics": [
              {
                "id": "FEN-7-32-1",
                "title": "Mercekler - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.5.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-32-2",
                "title": "Mercekler: İnce ve Kalın Kenarlı Mercekler",
                "outcome": "F.7.5.4.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-7-32-3",
                "title": "Mercekler: Odak Noktası",
                "outcome": "F.7.5.4.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-7-32-4",
                "title": "Mercekler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.5.4.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "FEN-7-U9",
        "unitTitle": "9. Ünite: İnsanda Üreme, Büyüme ve Gelişme ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "İnsanda Üreme, Büyüme ve Gelişme (Üreme Organları, Zigot, Fetüs)",
            "week": 33,
            "subtopics": [
              {
                "id": "FEN-7-33-1",
                "title": "İnsanda Üreme, Büyüme ve Gelişme - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.6.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-33-2",
                "title": "İnsanda Üreme, Büyüme ve Gelişme: Üreme Organları",
                "outcome": "F.7.6.1.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-7-33-3",
                "title": "İnsanda Üreme, Büyüme ve Gelişme: Zigot",
                "outcome": "F.7.6.1.1.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-7-33-4",
                "title": "İnsanda Üreme, Büyüme ve Gelişme: Fetüs",
                "outcome": "F.7.6.1.1.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "FEN-7-33-5",
                "title": "İnsanda Üreme, Büyüme ve Gelişme - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.6.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Bitki ve Hayvanlarda Üreme (Eşeyli ve Eşeysiz Üreme Çeşitleri)",
            "week": 34,
            "subtopics": [
              {
                "id": "FEN-7-34-1",
                "title": "Bitki ve Hayvanlarda Üreme - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.6.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-34-2",
                "title": "Bitki ve Hayvanlarda Üreme: Eşeyli ve Eşeysiz Üreme Çeşitleri",
                "outcome": "F.7.6.2.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-7-34-3",
                "title": "Bitki ve Hayvanlarda Üreme - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.6.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Ampullerin Bağlanma Şekilleri: Seri ve Paralel Bağlama",
            "week": 35,
            "subtopics": [
              {
                "id": "FEN-7-35-1",
                "title": "Ampullerin Bağlanma Şekilleri: Seri ve Paralel Bağlama - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.7.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-35-2",
                "title": "Ampullerin Bağlanma Şekilleri: Seri ve Paralel Bağlama - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.7.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Elektrik Akımı, Gerilim (Voltaj) ve Ohm Kanunu (V = I x R)",
            "week": 36,
            "subtopics": [
              {
                "id": "FEN-7-36-1",
                "title": "Elektrik Akımı, Gerilim - Temel Kavramlar ve Tanımlar",
                "outcome": "F.7.7.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "FEN-7-36-2",
                "title": "Elektrik Akımı, Gerilim: Voltaj",
                "outcome": "F.7.7.1.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "FEN-7-36-3",
                "title": "Elektrik Akımı, Gerilim - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "F.7.7.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      }
    ]
  },
  "sosyal": {
    "courseName": "Sosyal Bilgiler",
    "grade": 7,
    "totalUnits": 9,
    "units": [
      {
        "unitId": "SOS-7-U1",
        "unitTitle": "1. Ünite: İletişimin Gücü ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "İletişimin Gücü: İletişim Türleri ve Beden Dili",
            "week": 1,
            "subtopics": [
              {
                "id": "SOS-7-1-1",
                "title": "İletişimin Gücü: İletişim Türleri ve Beden Dili - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.1.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-1-2",
                "title": "İletişimin Gücü: İletişim Türleri ve Beden Dili - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.1.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Olumlu ve Olumsuz İletişim (Ben Dili - Sen Dili)",
            "week": 2,
            "subtopics": [
              {
                "id": "SOS-7-2-1",
                "title": "Olumlu ve Olumsuz İletişim - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.1.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-2-2",
                "title": "Olumlu ve Olumsuz İletişim: Ben Dili - Sen Dili",
                "outcome": "SB.7.1.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "SOS-7-2-3",
                "title": "Olumlu ve Olumsuz İletişim - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.1.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Medya ve İletişim: Doğru Bilgiye Ulaşma ve Medya Okuryazarlığı",
            "week": 3,
            "subtopics": [
              {
                "id": "SOS-7-3-1",
                "title": "Medya ve İletişim: Doğru Bilgiye Ulaşma ve Medya Okuryazarlığı - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.1.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-3-2",
                "title": "Medya ve İletişim: Doğru Bilgiye Ulaşma ve Medya Okuryazarlığı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.1.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Düşünce ve İfade Özgürlüğü, Doğru Haber Alma Hakkı",
            "week": 4,
            "subtopics": [
              {
                "id": "SOS-7-4-1",
                "title": "Düşünce ve İfade Özgürlüğü, Doğru Haber Alma Hakkı - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.1.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-4-2",
                "title": "Düşünce ve İfade Özgürlüğü, Doğru Haber Alma Hakkı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.1.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-7-U2",
        "unitTitle": "2. Ünite: Beylikten Cihan Devletine ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Beylikten Cihan Devletine: Osmanlı Devleti'nin Kuruluşu",
            "week": 5,
            "subtopics": [
              {
                "id": "SOS-7-5-1",
                "title": "Beylikten Cihan Devletine: Osmanlı Devleti'nin Kuruluşu - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.2.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-5-2",
                "title": "Beylikten Cihan Devletine: Osmanlı Devleti'nin Kuruluşu - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.2.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Osmanlı'nın Kısa Sürede Büyümesini Sağlayan Faktörler",
            "week": 6,
            "subtopics": [
              {
                "id": "SOS-7-6-1",
                "title": "Osmanlı'nın Kısa Sürede Büyümesini Sağlayan Faktörler - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.2.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-6-2",
                "title": "Osmanlı'nın Kısa Sürede Büyümesini Sağlayan Faktörler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.2.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Gaza ve Cihat Anlayışı, İskân ve İstimâlet (Hoşgörü) Politikası",
            "week": 7,
            "subtopics": [
              {
                "id": "SOS-7-7-1",
                "title": "Gaza ve Cihat Anlayışı, İskân ve İstimâlet  Politikası - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.2.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-7-2",
                "title": "Gaza ve Cihat Anlayışı, İskân ve İstimâlet  Politikası: Hoşgörü",
                "outcome": "SB.7.2.3.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "SOS-7-7-3",
                "title": "Gaza ve Cihat Anlayışı, İskân ve İstimâlet  Politikası - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.2.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Fethin Müjdesi: İstanbul'un Fethi ve Dünya Tarihindeki Sonuçları",
            "week": 8,
            "subtopics": [
              {
                "id": "SOS-7-8-1",
                "title": "Fethin Müjdesi: İstanbul'un Fethi ve Dünya Tarihindeki Sonuçları - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.2.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-8-2",
                "title": "Fethin Müjdesi: İstanbul'un Fethi ve Dünya Tarihindeki Sonuçları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.2.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-7-U3",
        "unitTitle": "3. Ünite: Denizlerde Hâkimiyet ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Denizlerde Hâkimiyet: Karadeniz ve Akdeniz'in Türk Gölü Olması",
            "week": 9,
            "subtopics": [
              {
                "id": "SOS-7-9-1",
                "title": "Denizlerde Hâkimiyet: Karadeniz ve Akdeniz'in Türk Gölü Olması - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.2.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-9-2",
                "title": "Denizlerde Hâkimiyet: Karadeniz ve Akdeniz'in Türk Gölü Olması - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.2.5.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Osmanlı Kültür ve Medeniyeti: Divan-ı Hümayun ve Toplum Yapısı",
            "week": 10,
            "subtopics": [
              {
                "id": "SOS-7-10-1",
                "title": "Osmanlı Kültür ve Medeniyeti: Divan-ı Hümayun ve Toplum Yapısı - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.2.6",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-10-2",
                "title": "Osmanlı Kültür ve Medeniyeti: Divan-ı Hümayun ve Toplum Yapısı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.2.6.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Avrupa'daki Gelişmeler: Coğrafi Keşifler, Rönesans ve Reform",
            "week": 11,
            "subtopics": [
              {
                "id": "SOS-7-11-1",
                "title": "Avrupa'daki Gelişmeler: Coğrafi Keşifler, Rönesans ve Reform - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.2.7",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-11-2",
                "title": "Avrupa'daki Gelişmeler: Coğrafi Keşifler, Rönesans ve Reform - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.2.7.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Aydınlanma Çağı ve Sanayi İnkılabı'nın Osmanlı'ya Etkileri",
            "week": 12,
            "subtopics": [
              {
                "id": "SOS-7-12-1",
                "title": "Aydınlanma Çağı ve Sanayi İnkılabı'nın Osmanlı'ya Etkileri - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.2.8",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-12-2",
                "title": "Aydınlanma Çağı ve Sanayi İnkılabı'nın Osmanlı'ya Etkileri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.2.8.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-7-U4",
        "unitTitle": "4. Ünite: Osmanlı'da Islahat Hareketleri ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Osmanlı'da Islahat Hareketleri (Lale Devri, Tanzimat, Meşrutiyet)",
            "week": 13,
            "subtopics": [
              {
                "id": "SOS-7-13-1",
                "title": "Osmanlı'da Islahat Hareketleri - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.2.9",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-13-2",
                "title": "Osmanlı'da Islahat Hareketleri: Lale Devri",
                "outcome": "SB.7.2.9.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "SOS-7-13-3",
                "title": "Osmanlı'da Islahat Hareketleri: Tanzimat",
                "outcome": "SB.7.2.9.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "SOS-7-13-4",
                "title": "Osmanlı'da Islahat Hareketleri: Meşrutiyet",
                "outcome": "SB.7.2.9.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "SOS-7-13-5",
                "title": "Osmanlı'da Islahat Hareketleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.2.9.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Nereden Nereye: Türkiye'de Nüfusun Dağılışı ve Etkileyen Faktörler",
            "week": 14,
            "subtopics": [
              {
                "id": "SOS-7-14-1",
                "title": "Nereden Nereye: Türkiye'de Nüfusun Dağılışı ve Etkileyen Faktörler - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.3.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-14-2",
                "title": "Nereden Nereye: Türkiye'de Nüfusun Dağılışı ve Etkileyen Faktörler - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.3.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Türkiye'nin Nüfus Özellikleri ve Nüfus Piramitleri",
            "week": 15,
            "subtopics": [
              {
                "id": "SOS-7-15-1",
                "title": "Türkiye'nin Nüfus Özellikleri ve Nüfus Piramitleri - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.3.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-15-2",
                "title": "Türkiye'nin Nüfus Özellikleri ve Nüfus Piramitleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.3.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Göçün Neden ve Sonuçları (İç ve Dış Göç, Beyin Göçü)",
            "week": 16,
            "subtopics": [
              {
                "id": "SOS-7-16-1",
                "title": "Göçün Neden ve Sonuçları - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.3.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-16-2",
                "title": "Göçün Neden ve Sonuçları: İç ve Dış Göç",
                "outcome": "SB.7.3.3.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "SOS-7-16-3",
                "title": "Göçün Neden ve Sonuçları: Beyin Göçü",
                "outcome": "SB.7.3.3.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "SOS-7-16-4",
                "title": "Göçün Neden ve Sonuçları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.3.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-7-U5",
        "unitTitle": "5. Ünite: Yerleşme ve Seyahat Özgürlüğü Anayasal Hakkı ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Yerleşme ve Seyahat Özgürlüğü Anayasal Hakkı",
            "week": 17,
            "subtopics": [
              {
                "id": "SOS-7-17-1",
                "title": "Yerleşme ve Seyahat Özgürlüğü Anayasal Hakkı - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.3.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-17-2",
                "title": "Yerleşme ve Seyahat Özgürlüğü Anayasal Hakkı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.3.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Kil Tabletten Akıllı Tablete: Yazının ve Bilginin Serüveni",
            "week": 18,
            "subtopics": [
              {
                "id": "SOS-7-18-1",
                "title": "Kil Tabletten Akıllı Tablete: Yazının ve Bilginin Serüveni - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.4.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-18-2",
                "title": "Kil Tabletten Akıllı Tablete: Yazının ve Bilginin Serüveni - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.4.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Türk-İslam Dünyasında Bilim İnsanları (Harezmi, Ali Kuşçu, Katip Çelebi)",
            "week": 19,
            "subtopics": [
              {
                "id": "SOS-7-19-1",
                "title": "Türk-İslam Dünyasında Bilim İnsanları - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.4.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-19-2",
                "title": "Türk-İslam Dünyasında Bilim İnsanları: Harezmi",
                "outcome": "SB.7.4.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "SOS-7-19-3",
                "title": "Türk-İslam Dünyasında Bilim İnsanları: Ali Kuşçu",
                "outcome": "SB.7.4.2.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "SOS-7-19-4",
                "title": "Türk-İslam Dünyasında Bilim İnsanları: Katip Çelebi",
                "outcome": "SB.7.4.2.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "SOS-7-19-5",
                "title": "Türk-İslam Dünyasında Bilim İnsanları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.4.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Avrupa'da Bilimsel Aydınlanma (Kopernik, Galileo, Newton)",
            "week": 20,
            "subtopics": [
              {
                "id": "SOS-7-20-1",
                "title": "Avrupa'da Bilimsel Aydınlanma - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.4.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-20-2",
                "title": "Avrupa'da Bilimsel Aydınlanma: Kopernik",
                "outcome": "SB.7.4.3.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "SOS-7-20-3",
                "title": "Avrupa'da Bilimsel Aydınlanma: Galileo",
                "outcome": "SB.7.4.3.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "SOS-7-20-4",
                "title": "Avrupa'da Bilimsel Aydınlanma: Newton",
                "outcome": "SB.7.4.3.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "SOS-7-20-5",
                "title": "Avrupa'da Bilimsel Aydınlanma - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.4.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-7-U6",
        "unitTitle": "6. Ünite: Özgür Düşüncenin Bilime Katkısı ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Özgür Düşüncenin Bilime Katkısı",
            "week": 21,
            "subtopics": [
              {
                "id": "SOS-7-21-1",
                "title": "Özgür Düşüncenin Bilime Katkısı - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.4.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-21-2",
                "title": "Özgür Düşüncenin Bilime Katkısı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.4.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Toprak Ana: Tarih Boyunca Toprağın Yönetimi (İkta ve Tımar)",
            "week": 22,
            "subtopics": [
              {
                "id": "SOS-7-22-1",
                "title": "Toprak Ana: Tarih Boyunca Toprağın Yönetimi - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.5.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-22-2",
                "title": "Toprak Ana: Tarih Boyunca Toprağın Yönetimi: İkta ve Tımar",
                "outcome": "SB.7.5.1.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "SOS-7-22-3",
                "title": "Toprak Ana: Tarih Boyunca Toprağın Yönetimi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.5.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Üretim Teknolojisi Hayatımızı Değiştiriyor (Buhar Makinesinden Robotlara)",
            "week": 23,
            "subtopics": [
              {
                "id": "SOS-7-23-1",
                "title": "Üretim Teknolojisi Hayatımızı Değiştiriyor - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.5.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-23-2",
                "title": "Üretim Teknolojisi Hayatımızı Değiştiriyor: Buhar Makinesinden Robotlara",
                "outcome": "SB.7.5.2.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "SOS-7-23-3",
                "title": "Üretim Teknolojisi Hayatımızı Değiştiriyor - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.5.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Vakıf Demek Medeniyet Demektir: Sosyal Dayanışma Kurumları",
            "week": 24,
            "subtopics": [
              {
                "id": "SOS-7-24-1",
                "title": "Vakıf Demek Medeniyet Demektir: Sosyal Dayanışma Kurumları - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.5.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-24-2",
                "title": "Vakıf Demek Medeniyet Demektir: Sosyal Dayanışma Kurumları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.5.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-7-U7",
        "unitTitle": "7. Ünite: İşinin Ehli İnsan Yetiştirmek ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "İşinin Ehli İnsan Yetiştirmek: Ahilik Teşkilatı ve Mesleki Eğitim",
            "week": 25,
            "subtopics": [
              {
                "id": "SOS-7-25-1",
                "title": "İşinin Ehli İnsan Yetiştirmek: Ahilik Teşkilatı ve Mesleki Eğitim - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.5.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-25-2",
                "title": "İşinin Ehli İnsan Yetiştirmek: Ahilik Teşkilatı ve Mesleki Eğitim - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.5.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Geleceğin Meslekleri ve Dijital Ekonomi",
            "week": 26,
            "subtopics": [
              {
                "id": "SOS-7-26-1",
                "title": "Geleceğin Meslekleri ve Dijital Ekonomi - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.5.5",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-26-2",
                "title": "Geleceğin Meslekleri ve Dijital Ekonomi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.5.5.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Demokrasinin Serüveni: İlk Çağ'dan Günümüze Demokrasi",
            "week": 27,
            "subtopics": [
              {
                "id": "SOS-7-27-1",
                "title": "Demokrasinin Serüveni: İlk Çağ'dan Günümüze Demokrasi - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.6.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-27-2",
                "title": "Demokrasinin Serüveni: İlk Çağ'dan Günümüze Demokrasi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.6.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Magna Carta'dan İnsan Hakları Evrensel Beyannamesi'ne",
            "week": 28,
            "subtopics": [
              {
                "id": "SOS-7-28-1",
                "title": "Magna Carta'dan İnsan Hakları Evrensel Beyannamesi'ne - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.6.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-28-2",
                "title": "Magna Carta'dan İnsan Hakları Evrensel Beyannamesi'ne - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.6.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-7-U8",
        "unitTitle": "8. Ünite: Türkiye Cumhuriyeti'nde Demokrasinin Gelişimi ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Türkiye Cumhuriyeti'nde Demokrasinin Gelişimi",
            "week": 29,
            "subtopics": [
              {
                "id": "SOS-7-29-1",
                "title": "Türkiye Cumhuriyeti'nde Demokrasinin Gelişimi - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.6.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-29-2",
                "title": "Türkiye Cumhuriyeti'nde Demokrasinin Gelişimi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.6.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Demokratik Vatandaşlık ve Seçme-Seçilme Hakkı",
            "week": 30,
            "subtopics": [
              {
                "id": "SOS-7-30-1",
                "title": "Demokratik Vatandaşlık ve Seçme-Seçilme Hakkı - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.6.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-30-2",
                "title": "Demokratik Vatandaşlık ve Seçme-Seçilme Hakkı - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.6.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Türkiye'nin Bölgesel ve Küresel Gücü",
            "week": 31,
            "subtopics": [
              {
                "id": "SOS-7-31-1",
                "title": "Türkiye'nin Bölgesel ve Küresel Gücü - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.7.1",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-31-2",
                "title": "Türkiye'nin Bölgesel ve Küresel Gücü - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.7.1.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Kültürlerarası Köprü Türkiye: Dış Politika ve İş Birlikleri",
            "week": 32,
            "subtopics": [
              {
                "id": "SOS-7-32-1",
                "title": "Kültürlerarası Köprü Türkiye: Dış Politika ve İş Birlikleri - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.7.2",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-32-2",
                "title": "Kültürlerarası Köprü Türkiye: Dış Politika ve İş Birlikleri - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.7.2.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      },
      {
        "unitId": "SOS-7-U9",
        "unitTitle": "9. Ünite: Küresel Sorunlar ve Çözüm Arayışları ve İlgili Kazanımlar",
        "topics": [
          {
            "topicTitle": "Küresel Sorunlar ve Çözüm Arayışları (İklim Değişikliği, Açlık, Göç)",
            "week": 33,
            "subtopics": [
              {
                "id": "SOS-7-33-1",
                "title": "Küresel Sorunlar ve Çözüm Arayışları - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.7.3",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-33-2",
                "title": "Küresel Sorunlar ve Çözüm Arayışları: İklim Değişikliği",
                "outcome": "SB.7.7.3.1",
                "cognitive": "Uygulama",
                "bloom": "Uygulama"
              },
              {
                "id": "SOS-7-33-3",
                "title": "Küresel Sorunlar ve Çözüm Arayışları: Açlık",
                "outcome": "SB.7.7.3.2",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "SOS-7-33-4",
                "title": "Küresel Sorunlar ve Çözüm Arayışları: Göç",
                "outcome": "SB.7.7.3.3",
                "cognitive": "Analiz",
                "bloom": "Analiz"
              },
              {
                "id": "SOS-7-33-5",
                "title": "Küresel Sorunlar ve Çözüm Arayışları - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.7.3.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "Uluslararası Yardım Kuruluşları ve İnsani Diplomasi",
            "week": 34,
            "subtopics": [
              {
                "id": "SOS-7-34-1",
                "title": "Uluslararası Yardım Kuruluşları ve İnsani Diplomasi - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.7.4",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-34-2",
                "title": "Uluslararası Yardım Kuruluşları ve İnsani Diplomasi - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.7.4.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "7. Sınıf Sosyal Bilgiler Kazanım Denemesi - I",
            "week": 35,
            "subtopics": [
              {
                "id": "SOS-7-35-1",
                "title": "7. Sınıf Sosyal Bilgiler Kazanım Denemesi - I - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.LGS.01",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-35-2",
                "title": "7. Sınıf Sosyal Bilgiler Kazanım Denemesi - I - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.LGS.01.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          },
          {
            "topicTitle": "7. Sınıf Sosyal Bilgiler Kazanım Denemesi - II",
            "week": 36,
            "subtopics": [
              {
                "id": "SOS-7-36-1",
                "title": "7. Sınıf Sosyal Bilgiler Kazanım Denemesi - II - Temel Kavramlar ve Tanımlar",
                "outcome": "SB.7.LGS.02",
                "cognitive": "Kavrama",
                "bloom": "Hatırlama/Anlama"
              },
              {
                "id": "SOS-7-36-2",
                "title": "7. Sınıf Sosyal Bilgiler Kazanım Denemesi - II - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü",
                "outcome": "SB.7.LGS.02.LGS",
                "cognitive": "LGS_YENI_NESIL",
                "bloom": "Değerlendirme/Sentez"
              }
            ]
          }
        ]
      }
    ]
  }
};

export const ALL_GRADES_CURRICULUM = {
  5: MEB_GRANULAR_CURRICULUM_GRADE_5,
  6: MEB_GRANULAR_CURRICULUM_GRADE_6,
  7: MEB_GRANULAR_CURRICULUM_GRADE_7,
  8: MEB_GRANULAR_CURRICULUM_GRADE_8
};

/**
 * Belirtilen Sınıf ve Branş İçin Tüm Ayrıntılı Mikro Konuları Döner
 */
export function getGranularSubtopics(courseKey = 'matematik', grade = 8) {
  const gradeCurriculum = ALL_GRADES_CURRICULUM[grade] || MEB_GRANULAR_CURRICULUM_GRADE_8;
  const course = gradeCurriculum[courseKey];
  if (!course) return [];
  const list = [];
  course.units.forEach(u => {
    u.topics.forEach(t => {
      t.subtopics.forEach(st => {
        list.push({
          unitId: u.unitId,
          unitTitle: u.unitTitle,
          topicTitle: t.topicTitle,
          ...st
        });
      });
    });
  });
  return list;
}

/**
 * 4 Kademe Genel Müfredat İstatistikleri
 */
export function getGranularCurriculumStats() {
  const summary = {};
  let totalGrandSubtopics = 0;

  for (const grade of [5, 6, 7, 8]) {
    const cur = ALL_GRADES_CURRICULUM[grade];
    const gradeStats = {};
    let gradeTotal = 0;

    Object.entries(cur).forEach(([cKey, course]) => {
      let subCount = 0;
      let topicCount = 0;
      course.units.forEach(u => {
        topicCount += u.topics.length;
        u.topics.forEach(t => {
          subCount += t.subtopics.length;
        });
      });
      gradeStats[cKey] = {
        courseName: course.courseName,
        units: course.totalUnits,
        topics: topicCount,
        subtopics: subCount
      };
      gradeTotal += subCount;
    });

    summary[`grade${grade}`] = gradeStats;
    summary[`grade${grade}TotalSubtopics`] = gradeTotal;
    totalGrandSubtopics += gradeTotal;
  }

  summary.grandTotalMicroTopics = totalGrandSubtopics;
  return summary;
}
