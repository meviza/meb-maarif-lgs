import { createHash } from 'node:crypto';

const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');

function freeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

// All inputs to this renderer are fixed, locally authored geometry below.
// Metadata never becomes SVG markup, a model prompt or a network request.
function squares({ x, y, width, height, scale }) {
  const cells = [];
  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      cells.push(`<rect data-unit-square="true" x="${x + column * scale}" y="${y + row * scale}" width="${scale}" height="${scale}" fill="#e6f3e8" stroke="#729484" stroke-width="1"/>`);
    }
  }
  return cells.join('');
}

function visual(id, alt, svg) {
  return { id, format: 'image/svg+xml', alt, svg, sha256: hash(svg), rightsStatus: 'owned_original' };
}

function mainVisual() {
  const alt = '6 cm uzun ve 4 cm kısa kenarlı dikdörtgen modeli. Turuncu sınır dört kenarı izler; toplam uzunluğu 20 cm olur. İçeride her biri 1 cm² olan 24 birim kare, altışarlı dört sıra halinde yer alır.';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 350" role="img" aria-labelledby="perimeter-main-title perimeter-main-desc"><title id="perimeter-main-title">Kenarı izle, içini kapla</title><desc id="perimeter-main-desc">${alt}</desc><rect width="560" height="350" rx="20" fill="#fffaf0"/><g font-family="Arial,sans-serif" fill="#203d36"><text x="280" y="32" text-anchor="middle" font-size="21">Aynı model, iki farklı ölçüm</text>${squares({ x: 90, y: 80, width: 6, height: 4, scale: 42 })}<rect data-model="rectangle-6x4" x="90" y="80" width="252" height="168" fill="none" stroke="#355f4f" stroke-width="1"/><path data-boundary="true" d="M 90 80 H 342 V 248 H 90 Z" fill="none" stroke="#c4592c" stroke-width="5"/><circle cx="90" cy="80" r="6" fill="#c4592c"/><text x="216" y="65" text-anchor="middle" font-size="19">6 cm</text><text x="216" y="278" text-anchor="middle" font-size="19">6 cm</text><text x="58" y="169" text-anchor="middle" font-size="19">4 cm</text><text x="378" y="169" text-anchor="middle" font-size="19">4 cm</text><text x="280" y="308" text-anchor="middle" font-size="17">Her küçük kare 1 cm².</text><text x="280" y="332" text-anchor="middle" font-size="15">Turuncu kenar: çevre · Yeşil kareler: alan</text></g></svg>`;
  return visual('perimeter-area-main-v1', alt, svg);
}

function comparisonVisual() {
  const alt = 'Aynı birim ölçeğiyle çizilen iki dikdörtgen. Soldaki 6 cm × 4 cm modelin alanı 24 cm², çevresi 20 cm; sağdaki 8 cm × 3 cm modelin alanı 24 cm², çevresi 22 cm. Her küçük kare 1 cm². Eşit alanlar farklı çevrelere sahip olabilir.';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 290" role="img" aria-labelledby="perimeter-compare-title perimeter-compare-desc"><title id="perimeter-compare-title">Alanlar eşit, çevreler farklı</title><desc id="perimeter-compare-desc">${alt}</desc><rect width="560" height="290" rx="20" fill="#fffaf0"/><g font-family="Arial,sans-serif" fill="#203d36"><text x="280" y="31" text-anchor="middle" font-size="21">Aynı alan, farklı çevre</text>${squares({ x: 40, y: 80, width: 6, height: 4, scale: 26 })}${squares({ x: 295, y: 80, width: 8, height: 3, scale: 26 })}<rect data-model="rectangle-6x4" x="40" y="80" width="156" height="104" fill="none" stroke="#c4592c" stroke-width="4"/><rect data-model="rectangle-8x3" x="295" y="80" width="208" height="78" fill="none" stroke="#c4592c" stroke-width="4"/><text x="118" y="64" text-anchor="middle" font-size="18">6 cm</text><text x="221" y="136" text-anchor="middle" font-size="18">4 cm</text><text x="399" y="64" text-anchor="middle" font-size="18">8 cm</text><text x="531" y="123" text-anchor="middle" font-size="18">3 cm</text><text x="118" y="216" text-anchor="middle" font-size="17">Alan: 24 cm²</text><text x="118" y="241" text-anchor="middle" font-size="17">Çevre: 20 cm</text><text x="399" y="216" text-anchor="middle" font-size="17">Alan: 24 cm²</text><text x="399" y="241" text-anchor="middle" font-size="17">Çevre: 22 cm</text><text x="280" y="273" text-anchor="middle" font-size="15">Her küçük kare 1 cm².</text></g></svg>`;
  return visual('perimeter-area-comparison-v1', alt, svg);
}

function referenceId(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,79}$/u.test(value) ? value : 'unassigned';
}

export function createPerimeterLesson({ metadata } = {}) {
  const authored = {
    schemaVersion: 'perimeter-mini-lesson/v1',
    id: 'lesson-perimeter-area-v1',
    version: '1.0.0',
    title: 'Çevre mi, alan mı?',
    concept: {
      perimeter: 'Çevre, şeklin dış sınırı boyunca yürüdüğümüzde izlediğimiz toplam uzunluktur. Bütün kenarları sayarız; birimi santimetre olabilir.',
      area: 'Alan, şeklin içini kaplayan yüzeyin büyüklüğüdür. Boşluk bırakmadan yerleştirdiğimiz birim kareleri sayarız; birimi santimetrekare olabilir.',
    },
    activities: [
      { id: 'trace-boundary', measure: 'perimeter', visualId: 'perimeter-area-main-v1', instruction: 'Turuncu noktadan başla. Parmağınla dört kenarı sırayla izle ve başladığın yere dön. Her kenarın uzunluğunu bir kez say.' },
      { id: 'cover-with-unit-squares', measure: 'area', visualId: 'perimeter-area-main-v1', instruction: 'Bu kez modelin içine bak. Bir sıradaki altı kareyi say; sonra dört eş sırayı düşün. Her karenin kenarı 1 cm, alanı 1 cm².' },
    ],
    workedExample: {
      modelId: 'rectangle-6x4',
      visualId: 'perimeter-area-main-v1',
      model: { width: 6, height: 4, lengthUnit: 'cm' },
      perimeter: { expression: '6 + 4 + 6 + 4', value: 20, unit: 'cm' },
      area: { expression: '4 × 6', value: 24, unit: 'cm²' },
      explanation: 'Kenarları toplamak sınırın uzunluğunu verir: 20 cm. Dört sıradaki altışar birim kareyi saymak kaplanan yüzeyi verir: 24 cm².',
    },
    misconception: {
      claim: 'Alanları eşit olan şekillerin çevreleri de eşittir.',
      explanation: 'Bu her zaman doğru değildir. Aynı 24 birim kareyi farklı biçimde dizince dış sınırın uzunluğu değişebilir. Alanı bulmak için kareleri, çevreyi bulmak için dış kenarları say.',
      comparison: {
        visualId: 'perimeter-area-comparison-v1',
        models: [
          { width: 6, height: 4, lengthUnit: 'cm', area: { value: 24, unit: 'cm²' }, perimeter: { value: 20, unit: 'cm' } },
          { width: 8, height: 3, lengthUnit: 'cm', area: { value: 24, unit: 'cm²' }, perimeter: { value: 22, unit: 'cm' } },
        ],
      },
    },
    formativeQuestions: [
      { id: 'check-boundary', measure: 'perimeter', modelId: 'rectangle-6x4', visualId: 'perimeter-area-main-v1', prompt: '6 cm ve 4 cm kenarlı modelin dış sınırına ip yerleştiriyoruz. Hiç açıklık bırakmadan kaç santimetre ip gerekir?', answer: { value: 20, unit: 'cm' }, feedback: 'İp dış kenarları izler. Dört kenarı birer kez topla: 6 + 4 + 6 + 4 = 20 cm. İçteki kareleri saymamıza gerek yok.' },
      { id: 'check-covered-surface', measure: 'area', modelId: 'rectangle-6x4', visualId: 'perimeter-area-main-v1', prompt: 'Modelin içinde dört sıra, her sırada altı tane 1 cm² kare var. Modelin alanı kaç santimetrekaredir?', answer: { value: 24, unit: 'cm²' }, feedback: 'Kareler modelin içini kaplar. Dört sıradaki altışar kare 24 birim kare eder; alan 24 cm² olur. Sonuca uzunluk birimi cm yazmayız.' },
    ],
    teacherHint: 'Önce çocuğun şekil üzerinde neyi saydığını göstermesini isteyin. Kenarı izliyorsa cm, içini birim karelerle kaplıyorsa cm² kullanmasını birlikte açıklayın. Karıştırdığında örneğe geri dönün; tek cevapla kalıcı yetenek ya da zekâ yorumu yapmayın.',
    visuals: [mainVisual(), comparisonVisual()],
    speechTranscript: 'Haydi, bir dikdörtgeni birlikte inceleyelim. Parmağını dış kenarların üzerinde gezdir. Başladığın yere döndüğünde izlediğin yol, çevredir. Şimdi içeriye bak: yüzeyi kaplayan küçük kareleri saymak, alanı bulmamıza yardım eder. Modelimizin uzun kenarı altı, kısa kenarı dört santimetre. Dört kenarı toplarsak yirmi santimetre buluruz. İçeride dört sıra var; her sırada altı birim kare olduğu için alan yirmi dört santimetrekaredir. Santimetre bir uzunluğu, santimetrekare ise kaplanan yüzeyi anlatır. Aynı alanı olan şekillerin çevreleri farklı olabilir. Karıştırırsan kendine sor: Kenarda mı yürüyorum, içeriyi mi kaplıyorum? Şimdi bunu şeklin üzerinde göster.',
  };
  const sourceSha256 = hash(authored);
  const item = {
    ...authored,
    state: 'draft',
    publishReady: false,
    difficulty: { level: 'introductory', calibrationStatus: 'author_estimated', empiricallyCalibrated: false },
    metadata: {
      source: { sourceId: 'internal-authoring:perimeter-mini-lesson-v1', rightsStatus: 'owned_original', purpose: 'original_math_lesson', sha256: sourceSha256, externalDataUsed: false, containsStudentData: false, containsPrivateData: false },
      curriculum: { mappingStatus: 'unresolved', registryEntryId: null, programVersion: null, grade: null, outcomeCode: null, sourceUrl: null, sourceSha256: null },
      governance: { ownerId: referenceId(metadata?.governance?.ownerId), stewardId: referenceId(metadata?.governance?.stewardId), purpose: 'review_only', retentionPolicyId: 'lesson-review-v1' },
    },
    review: { expert: 'pending', rights: 'pending', curriculum: 'pending', accessibility: 'pending' },
    pending: ['canonical_curriculum_mapping', 'expert_review', 'rights_review', 'accessibility_review', 'difficulty_calibration'],
    sourceSha256,
  };
  item.contentSha256 = hash(item);
  return freeze(item);
}
