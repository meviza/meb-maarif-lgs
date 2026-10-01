# Jev (System 1) Karar ve Kalite Denetim Motoru Şartnamesi
## Ollama / Local Decision Model Entegrasyon Kılavuzu

---

## 1. Neden Jev ve System-1?
Geleneksel LLM'ler (Claude, GPT, Gemini) "System 2" mantığıyla çalışır: Kelime kelime token üretir, derindir ancak yavaştır ve yüksek token maliyeti doğurur.

**Jev / Tev1 / Nimble** gibi modeller ise **System 1 (Sezgisel & Hızlı Karar)** sınıflandırma modelleridir:
* Metin üretmez.
* Önceden tanımlanmış katı kurallar, boolean kontroller ve olasılık skorları üretir.
* Ollama 0.35+ ile yerel makinede (veya sunucuda) saniyede yüzlerce soruyu sıfır token maliyetiyle denetler.

---

## 2. Denetim Döngüsü (Quality Gate Pipeline)

```
[Büyük Dil Modeli (Gemini/Claude/GPT)]
      │ (Soru Taslağı Üretir)
      ▼
┌────────────────────────────────────────────────────────┐
│             JEV (SYSTEM 1) KARAR MOTORU                │
├────────────────────────────────────────────────────────┤
│ 1. Kazanım ve Yaş Grubu Uygunluğu                      │
│ 2. Kesin Tek Cevap Kontrolü (Ambigüite Yok)           │
│ 3. Bloom Taksonomisi (Ezber mi / Akıl Yürütme mi?)     │
│ 4. Çeldirici Güç Katsayısı (> 0.70)                    │
│ 5. TDK İmla ve Anlatım Bozukluğu Kontrolü              │
│ 6. Yapay Zekâ Klişesi / Halüsinasyon Kontrolü          │
└────────────────────────────────────────────────────────┘
      │
      ├─► [REJECT / DÜZELTME GEREKLİ] ──► Taslak Revize Edilir
      │
      └─► [APPROVED] ──► PostgreSQL'e Basılır
```

---

## 3. Ollama System-1 JSON Şeması

Ollama karar sorgusu için Jev'e gönderilecek giriş (`state` + `questions`):

```json
{
  "state": {
    "grade": 8,
    "course": "Türkçe",
    "topic": "Paragrafta Anlam",
    "sub_type": "03_Akisi_Bozan_Cumle",
    "stimulus": "(I) Yapay zekâ destekli tanı sistemleri...",
    "stem": "Bu parçadaki numaralanmış cümlelerden hangisi düşüncenin akışını bozmaktadır?",
    "options": {
      "A": "I",
      "B": "II",
      "C": "III",
      "D": "IV"
    },
    "correct_option": "C",
    "solution_strategy": "Bu bir Akışı Bozan Cümle sorusudur...",
    "distractor_analysis": {
      "A": "Giriş cümlesidir, akışı başlatır.",
      "B": "Teknolojik derinliği anlatır, akışa uygundur.",
      "D": "Hekim sezgisiyle birleştirir, ana fikri tamamlar."
    }
  },
  "decisions": [
    {
      "name": "is_meb_aligned",
      "type": "boolean",
      "prompt": "Soru ve metin T.C. MEB 8. sınıf seviyesine ve Türkçe müfredatına tam uyumlu mu?"
    },
    {
      "name": "single_deterministic_answer",
      "type": "boolean",
      "prompt": "Soru şıklarında tartışmalı bir durum veya ikinci bir olası doğru cevap var mı?"
    },
    {
      "name": "bloom_level",
      "type": "choice",
      "options": ["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE", "EVALUATE"]
    },
    {
      "name": "distractor_quality",
      "type": "probability",
      "prompt": "Çeldiriciler pedagojik olarak güçlü ve mantıklı mı?"
    },
    {
      "name": "tdk_compliance",
      "type": "boolean",
      "prompt": "Metinde veya şıklarda TDK imla hatası veya anlatım bozukluğu var mı?"
    },
    {
      "name": "is_approved",
      "type": "boolean",
      "prompt": "Bu soru MEB LGS sınavında soru olarak sorulmaya uygun kalitede mi?"
    }
  ]
}
```

---

## 4. Jev Kabul Kriterleri (Acceptance Thresholds)

Sisteme otomatik ekleme yapabilmek için Jev çıktısının şu eşikleri sağlaması zorunludur:

| Kriter | Beklenen Değer | Eylem |
|---|---|---|
| `is_meb_aligned` | `true` | `false` ise doğrudan reddet. |
| `single_deterministic_answer` | `true` | `false` ise acil revize et (çift doğru şüphesi). |
| `bloom_level` | `APPLY`, `ANALYZE` veya `EVALUATE` | `REMEMBER` (salt ezber) ise LGS standardına uymaz, reddet. |
| `distractor_quality` | `>= 0.75` | Altındaysa şıklar çok zayıf/kolay demektir, yeniden yaz. |
| `tdk_compliance` | `true` | İmla hatası varsa otomatik TDK düzelticisine yönlendir. |
| `is_approved` | `true` | Genel komisyon onayı. |
