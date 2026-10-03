# Animasyon ve Türkçe ses araçları — kaynak/lisans kararı

Tarih: 2026-10-03. Kullanıcının paylaştığı 47 satırlık araştırma ve resmî repo/model kartları incelendi. Bu, read-only seçim araştırmasıdır: kurulum, ağırlık indirme, ses klonlama, inference veya bulut harcaması yapılmadı. Kod lisansı, ağırlık/yardımcı model lisansı, konuşmacı hakkı ve bulut hizmet bedeli birbirinden ayrılır. Kaynakta “açık” olması ücretsiz/sınırsız ticari hak anlamına gelmez.

## Video/iş akışı matrisi

| Araç / kod revizyonu | Karar gerekçesi | Projedeki olası rol |
| --- | --- | --- |
| [ComfyUI 0.38.0 / e9027f2](https://github.com/Comfy-Org/ComfyUI/tree/e9027f2b30f37bb3052714eb08fcf479542f4fc0) | GPL-3.0; model/custom-node hakları ayrı. CPU/MPS desteği büyük modelin bu Mac'e sığacağını göstermez. | Daha sonra tek, denetlenmiş workflow editörü; şu an kurmak gerekmiyor. |
| [Stability Matrix / 604387e](https://github.com/LykosAI/StabilityMatrix/tree/604387e55633550c248c9b71b7a2968711210286) | AGPL-3.0 kaynak; hazır binary için ayrı [EULA](https://lykos.ai/license) tam doğrulanmadı. | Paket yöneticisi; otomatik çoklu model indirmesini tercih etmiyoruz. |
| [Wan2.1 / 9737cba](https://github.com/Wan-Video/Wan2.1/tree/9737cba9c1c3c4d04b33fcad41c111989865d315) | Resmî kod/model Apache-2.0. 8,19 GB VRAM beyanı T2V-1.3B; I2V ayrı 14B modelleri. | İleride hakları uygun dekoratif I2V için GPU pilot adayı; matematik etiketi/kanıtı üretmez. |
| [LTX-Video / 4b2d053](https://github.com/Lightricks/LTX-Video/tree/4b2d053057623ddd4d0a1d3e9cd28890e9ef487f) | Kod Apache-2.0; checkpoint sürümüne göre farklı ve şartlı ağırlık lisansı. | Exact checkpoint/hak seçimi olmadan kullanılmaz; sadece “LTX açık” denmez. |
| [Özgün HunyuanVideo / e748c73](https://github.com/Tencent-Hunyuan/HunyuanVideo/tree/e748c73ac064728bf6bd15b1cdb8161e55a4f331) | [Community lisansında](https://github.com/Tencent-Hunyuan/HunyuanVideo/blob/e748c73ac064728bf6bd15b1cdb8161e55a4f331/LICENSE.txt) AB/İngiltere/Güney Kore kapsam dışında; çıktı dağıtımı da etkilenir. Resmî örnekler 45–60 GB GPU belleği. | Avrupa açılımı hedefiyle koşulsuz ürün motoru seçilmez. Yeni sürüm/aile ayrı incelenir. |
| [LivePortrait / 9b294b3](https://github.com/KlingAIResearch/LivePortrait/tree/9b294b3d0536135442ea73cb01e6cb3ca7029dd3) | MIT kod; [InsightFace hazır modelleri](https://github.com/KlingAIResearch/LivePortrait/blob/9b294b3d0536135442ea73cb01e6cb3ca7029dd3/LICENSE) ticari olmayan araştırma şartlı. | Portre hareketi; geometri aracı değil. Çocuk yüzleri/verileriyle pilot yapılmaz. |
| [Open-Generative-AI 2.0.0 / ce82e99](https://github.com/Anil-matcha/Open-Generative-AI/tree/ce82e99365ee25271427442e92310c6b0c05e94c) | MIT uygulama, alttaki API/model haklarını/ücretini sağlamaz. Web Muapi; masaüstünde yerel resim + ayrı CUDA/ROCm video sunucusu. | “Hepsi yerel ve ücretsiz” varsayımıyla kurulmaz; ihtiyaca göre ayrı servis kapısı. |

Bu kod revizyonları araştırma kanıtıdır; ağırlık hash/revision pinlemesi veya kurulum onayı değildir. GPL/AGPL ticari kullanımı genel olarak yasaklamaz; dağıtım/değişiklik/servis biçiminin yükümlülükleri ayrıca değerlendirilir.

LTX checkpoint ayrımları: [0.9](https://huggingface.co/Lightricks/LTX-Video/blob/main/ltx-video-2b-v0.9.license.txt) / [0.9.1](https://huggingface.co/Lightricks/LTX-Video/blob/main/ltx-video-2b-v0.9.1.license.txt) akademik/araştırma; [2B 0.9.5](https://huggingface.co/Lightricks/LTX-Video/blob/main/ltx-video-2b-v0.9.5.license.txt) OpenRAIL-M; [0.9.6+ 0.X](https://huggingface.co/Lightricks/LTX-Video/blob/main/LTX-Video-Open-Weights-License-0.X.txt) yıllık gelir ≥10 milyon USD için ayrı ticari lisans. Kullanım kısıtları ve makine üretimi açıklama şartı var. Klişesiz, kaliteli sanat yönü hedeflenir; lisansın gerektirdiği üretim kaynağı açıklaması kaldırılmaz.

[Apple MLX Wan örneği](https://github.com/ml-explore/mlx-examples/blob/main/video/wan2.1/README.md), quantization olmadan 81 kare I2V14B için yaklaşık 39 GB RAM bildiriyor. M4 Max ölçümü M2 ölçümü değildir. 16 GB birleşik bellekli bu Mac ve GPU tahsisi belirtilmeyen Docker Small, bu I2V modelinin uygun çalışma ortamı olarak doğrulanmadı. CUDA CPU-offload ifadesi GPU'suz inference garantisi değildir.

## Ses modeli matrisi

| Araç / exact model | Türkçe ve lisans | Karar |
| --- | --- | --- |
| [GPT-SoVITS](https://github.com/RVC-Boss/GPT-SoVITS) / [lj1995/GPT-SoVITS](https://huggingface.co/lj1995/GPT-SoVITS/tree/main) | MIT kod/model etiketi; resmî sentez listesi EN/JA/KO/ZH/YUE. Türkçe README dil desteği değildir; topluluk Türkçe eklentisi doğrulanmadı. | Türkçe ana motor değil; yardımcı modellerin hakları ayrıca gerekir. |
| [ChatTTS](https://github.com/2noise/ChatTTS#licenses) / [2Noise/ChatTTS](https://huggingface.co/2Noise/ChatTTS) | Kod AGPLv3+; ağırlık CC BY-NC 4.0; EN/ZH. | Ticari okul içerik hattına alınmaz. |
| [Coqui TTS](https://github.com/coqui-ai/TTS) / [coqui/XTTS-v2](https://huggingface.co/coqui/XTTS-v2) | Toolkit MPL-2.0; Türkçe var. [CPML](https://huggingface.co/coqui/XTTS-v2/blob/main/LICENSE.txt) model ve çıktılarını non-commercial sınırlar. | Ayrı geçerli ticari izin olmadan satılan ürün içeriğinde kullanılmaz. |
| [Voicebox](https://github.com/jamiepine/voicebox) + [Qwen3-TTS 0.6B Base](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base) | MIT uygulama, Apache-2.0 model; resmî 10 dilde Türkçe yok. | Türkçe çözüm gibi sunulmaz. |
| Voicebox + [Kokoro-82M v1.0](https://huggingface.co/hexgrad/Kokoro-82M) | Apache-2.0; [ses listesinde](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md) Türkçe yok. | İngilizceye aday; Türkçe ana motor değil. |
| Voicebox + [Chatterbox Multilingual](https://huggingface.co/ResembleAI/chatterbox) | MIT; `tr` mevcut. Voicebox bağlayıcısı V2, upstream V3 ayrı seçilebilir. | İzinli yetişkin anlatıcı ve benchmark ile **koşullu pilot adayı**, henüz kurulmadı. |
| [Piper](https://github.com/OHF-Voice/piper1-gpl) + [tr_TR-dfki-medium](https://huggingface.co/rhasspy/piper-voices/blob/main/tr/tr_TR/dfki/medium/MODEL_CARD) | Güncel motor GPL-3.0; ses kartında dataset CC BY-NC-SA 4.0. | Genel depo MIT etiketiyle ticari onay verilmez. Eski kaldırılmış Türkçe sesler yeniden kullanılmaz. |

Voicebox bir arayüzdür, bütün motorlar aynı yetenek/lisansa sahip değildir. [Kurulum gereksinimleri](https://github.com/jamiepine/voicebox/blob/main/docs/content/docs/overview/installation.mdx) minimum 8 GB RAM/5 GB boş disk, öneri 16 GB+/10 GB+; [Chatterbox backend](https://raw.githubusercontent.com/jamiepine/voicebox/main/backend/backends/chatterbox_backend.py) macOS'ta `force_cpu_on_mac=True`. Genel MLX/Metal ifadesi Türkçe motorun M2 GPU'sunda çalıştığının kanıtı değildir. GPU'suz 2 vCPU/4 GiB yeterliliği ölçülmedi.

Küçük araştırma adayı [ema-tts](https://huggingface.co/canberkkkkkk/ema-tts), revizyon `48d9f1c93cd06ede8a87f0b4ba665526767935a7`: Apache-2.0 beyanı; 65M + [AudioVAE/VoxCPM2](https://huggingface.co/openbmb/VoxCPM2) 94M. Kartta ~254 MB ana depo/~1 GB GPU beyanı var; konuşmacı/veri provenansı açıklanmıyor, 1–6 kelimelik kısa cümle sınırlaması var, M2/CPU performansı doğrulanmadı. 1. sınıf kısa yönergelerine doğrudan onay değil. Coqui registry'deki eski Türkçe Glow-TTS/HiFiGAN için de exact arşiv/hash/konuşmacı hakkı doğrulanmadan onay yok.

## İş bölümü

| İş | İlk ortam | Kısıt |
| --- | --- | --- |
| Tasarım, kaynak/hak incelemesi, kısa önizleme | Mac | Mevcut araçlar; büyük model/SDK indirmesi yok |
| Doğrulanmış SVG → sahne PNG → MP4, test/batch | Mac; sonra süreli Docker CPU işi | Tek worker / iki encoder thread; içerik ve byte bütçesi |
| Türkçe TTS karşılaştırması | İzole küçük pilot; yeterli RAM ölçümü | Ağırlık/voice/speaker hakkı; sayı/birim/dil testleri |
| Generatif dekoratif I2V | Gerekirse ayrı GPU worker | Exact model lisansı/kapasitesi/maliyet izni; matematik katmanı ayrı |
| Canlı öğrenci API/DB | Ayrı on-prem veya sözleşmeli hosting | Çocuk verisi, tenant, hukuk, restore ve güvenlik kapısı |

İlk aşamada ComfyUI, Matrix ve bütün TTS motorlarını birden kurmayacağız. Mevcut hafif renderer [gerçek sessiz MP4](VIDEO_PILOT_EVIDENCE_2026-10-03.md) üretti. İzinli kendi/yetişkin öğretmen ses kaydı da seslendirme pilotunun ekonomik bir seçeneğidir; klonlama zorunlu değildir. Model çıktıları bir kez onaylanıp hash/version ile yeniden kullanılabilir; öğrenci her oynattığında yeniden AI üretimi yapılmaz.

## Ses kalite ve güvenlik kapıları

- Exact code/weight/voice revizyonu, licence/hash, konuşmacı ticari sentetik-ses izni; çocuk sesi/yüzü kullanılmaz. TTS'de filigran ve gerekli açıklamalar kaldırılmaz.
- Soru/çözüm grafiğinden denetlenmiş anlatım; “cm²”, ondalık, kesir, eksi, eşitlik, vurgu ve duraklama için Türkçe okunuş. TTS sayıyı/kelimeyi ekleyip atlamamalı.
- 20 kısa/uzun/gürültüye dayanıklılık metninde uzman dinlemesi; kaynak metinle hizalama, süre, RAM, RTF, çıktı boyutu ve ret/yeniden üretim sayısı. ASR round-trip yardımcıdır, uzman dinleme yerine geçmez.
- Ses–sahne/VTT senkronu; görsel-sayı uyumu, durdurma/hız, düşük ağ ve mobil okunurluk. Matematik grafiği TTS/I2V sonucuna göre değiştirilmez.
- Anahtar/kişisel veri/prompts bulut servisine otomatik gönderilmez. Kurulumdan önce uygulama bağımlılıkları/script/lisans/ağ incelemesi gerekir. Uygulama repo incelemesi SkillSpector skill sertifikası değildir; yeni agent skill'leri ayrı `skill-inspector --no-llm` kapısından geçer.

Bu araştırma lisans veya güvenlik garantisi değildir; seçili pilotun ölçüm ve uzman kabulü ayrıca kaydedilir.
