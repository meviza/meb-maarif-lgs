/**
 * MEB Maarif LGS Platformu - LLM İstemcisi ve Sağlayıcı Katmanı (Faz 4)
 * Yerel Ollama (Llama-3, Qwen, Mistral) & Çoklu Model Entegrasyonu
 */

import http from 'http';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'localhost';
const OLLAMA_PORT = process.env.OLLAMA_PORT || 11434;

export class LlmClient {
  constructor(defaultModel = 'qwen2.5:3b') {
    this.defaultModel = defaultModel;
  }

  // 1. Yerel Ollama Modellerini Listele
  async listAvailableModels() {
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
            const models = (parsed.models || []).map(m => m.name);
            resolve({ available: true, models, host: `http://${OLLAMA_HOST}:${OLLAMA_PORT}` });
          } catch (e) {
            resolve({ available: false, models: [], error: 'JSON parse hatası' });
          }
        });
      });

      req.on('error', () => {
        resolve({ available: false, models: [], error: 'Ollama servisine ulaşılamadı' });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ available: false, models: [], error: 'Zaman aşımı' });
      });

      req.end();
    });
  }

  // 2. Metin Üret (Generate)
  async generateCompletion(prompt, model = null) {
    const targetModel = model || this.defaultModel;

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
