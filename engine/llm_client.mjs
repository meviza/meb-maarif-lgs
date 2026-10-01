/**
 * MEB Maarif LGS Platformu - LLM İstemcisi ve Sağlayıcı Katmanı (Faz 4)
 * Yerel Ollama (Llama-3, Qwen, Mistral) & Çoklu Model Entegrasyonu
 */

import http from 'http';
import https from 'https';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'localhost';
const OLLAMA_PORT = process.env.OLLAMA_PORT || 11434;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

export class LlmClient {
  constructor(defaultModel = 'qwen2.5:3b') {
    this.defaultModel = defaultModel;
  }

  // 1. Kullanılabilir Modelleri Listele (Ollama + Google Gemini)
  async listAvailableModels() {
    const result = {
      available: false,
      models: [],
      geminiAvailable: Boolean(GEMINI_API_KEY),
      geminiModels: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-4-argon (Deneysel / Gelecek Nesil)'],
      host: `http://${OLLAMA_HOST}:${OLLAMA_PORT}`
    };

    return new Promise((resolve) => {
      const req = http.request({
        hostname: OLLAMA_HOST,
        port: OLLAMA_PORT,
        path: '/api/tags',
        method: 'GET',
        timeout: 3000
      }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const ollamaModels = (parsed.models || []).map(m => m.name);
            result.available = true;
            result.models = [...ollamaModels, ...result.geminiModels];
            resolve(result);
          } catch (e) {
            result.models = [...result.geminiModels];
            resolve(result);
          }
        });
      });

      req.on('error', () => {
        result.models = [...result.geminiModels];
        resolve(result);
      });

      req.on('timeout', () => {
        req.destroy();
        result.models = [...result.geminiModels];
        resolve(result);
      });

      req.end();
    });
  }

  // 2. Metin Üret (Router: Gemini veya Ollama)
  async generateCompletion(prompt, model = null) {
    const targetModel = model || this.defaultModel;

    if (targetModel.toLowerCase().startsWith('gemini')) {
      return this.generateGeminiCompletion(prompt, targetModel);
    }

    return this.generateOllamaCompletion(prompt, targetModel);
  }

  // 2.1 Google Gemini API Entegrasyonu (Gemini 2.0 / 1.5 / Argon vb.)
  async generateGeminiCompletion(prompt, model) {
    const cleanModelName = model.split(' ')[0].trim(); // 'gemini-4-argon (Deneysel)' -> 'gemini-4-argon'
    const apiKey = GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(`GEMINI_API_KEY bulunamadi. Gemini modelini (${cleanModelName}) kullanmak icin terminalde export GEMINI_API_KEY="AIza..." calistiriniz.`);
    }

    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      });

      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/${cleanModelName}:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 30000
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (data.error) {
              reject(new Error(`Gemini API Hatasi (${data.error.code}): ${data.error.message}`));
              return;
            }
            const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!candidateText) {
              reject(new Error('Gemini API gecerli bir yanit donmedi.'));
              return;
            }
            resolve(candidateText);
          } catch (err) {
            reject(new Error(`Gemini yaniti cozumlenemedi: ${err.message}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(new Error(`Gemini API baglanti hatasi: ${err.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Gemini API istek zaman asimina ugradi (30s).'));
      });

      req.write(payload);
      req.end();
    });
  }

  // 2.2 Yerel Ollama API Entegrasyonu
  async generateOllamaCompletion(prompt, targetModel) {

    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        model: targetModel,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3, // Kararlı ve deterministik pedagojik çıktılar için düşük sıcaklık
          top_p: 0.9
        }
      });

      const req = http.request({
        hostname: OLLAMA_HOST,
        port: OLLAMA_PORT,
        path: '/api/generate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 45000 // LLM üretimi için güvenli süre
      }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.response || '');
          } catch (e) {
            reject(new Error('Ollama yanıtı çözümlenemedi: ' + data));
          }
        });
      });

      req.on('error', (err) => {
        reject(new Error(`Ollama bağlantı hatası: ${err.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Ollama istek zaman aşımına uğradı.'));
      });

      req.write(payload);
      req.end();
    });
  }

  // 3. Yanıttan JSON Ayıklayıcı
  extractJsonFromResponse(rawText) {
    if (!rawText) return null;

    // Doğrudan JSON ise
    const trimmed = rawText.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {}
    }

    // Markdown blokları ```json ... ``` içindeyse
    const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
    const match = rawText.match(jsonBlockRegex);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (e) {}
    }

    // İlk { ile son } arasını ara
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
      } catch (e) {}
    }

    return null;
  }
}

export const llmClient = new LlmClient();
