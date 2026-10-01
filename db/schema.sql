-- ============================================================================
-- T.C. Millî Eğitim Bakanlığı & Türkiye Yüzyılı Maarif Modeli
-- 8. Sınıf LGS Soru Bankası ve Optik Sınav Platformu Veritabanı Şeması
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Dersler (Courses)
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- 'Türkçe', 'Matematik', 'Fen Bilimleri', 'T.C. İnkılap Tarihi', 'Din Kültürü', 'İngilizce'
    grade_level SMALLINT NOT NULL DEFAULT 8,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Üniteler (Units)
CREATE TABLE IF NOT EXISTS units (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    unit_no SMALLINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (course_id, unit_no)
);

-- 3. Konular (Topics)
CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    unit_id INT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    topic_no SMALLINT NOT NULL,
    title VARCHAR(150) NOT NULL, -- Örn: 'Paragrafta Anlam', 'Çarpanlar ve Katlar', 'Mevsimlerin Oluşumu'
    slug VARCHAR(180) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. MEB Kazanımları ve Soru Alt Tipleri (Learning Outcomes & Sub-types)
CREATE TABLE IF NOT EXISTS learning_outcomes (
    id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    code VARCHAR(30) NOT NULL UNIQUE, -- Örn: 'T.8.3.14', 'M.8.1.1.1'
    title VARCHAR(255) NOT NULL,
    sub_category_code VARCHAR(50), -- Örn: '03_AKISI_BOZAN_CUMLE', 'EBOB_EKOK_PROBLEMLERI'
    sub_category_name VARCHAR(150), -- Örn: 'Akışı Bozan Cümle'
    bloom_level VARCHAR(20) DEFAULT 'ANALYZE', -- REMEMBER, UNDERSTAND, APPLY, ANALYZE, EVALUATE
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Soru Havuzu (Questions Pool)
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outcome_id INT NOT NULL REFERENCES learning_outcomes(id) ON DELETE RESTRICT,
    code VARCHAR(50) UNIQUE, -- Örn: 'LGS-TR-PAR-0001'
    
    -- Soru İçeriği
    stimulus TEXT, -- Paragraf metni, okuma parçası, öncül, deney senaryosu veya tablo verisi
    media_url VARCHAR(255), -- Görsel, infografik veya grafik çizim URL'i
    stem TEXT NOT NULL, -- Soru kökü ("Buna göre numaralanmış cümlelerin hangisinde...")
    
    -- Şıklar ve Doğru Cevap
    options JSONB NOT NULL, -- {"A": "I", "B": "II", "C": "III", "D": "IV"}
    correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    
    -- Pedagojik Çözüm Mühendisliği
    solution_strategy TEXT NOT NULL, -- "💡 Uzman Öğretmen Taktik Notu / İpucu"
    detailed_solution TEXT NOT NULL, -- Adım adım kesin ve anlaşılır çözüm
    distractor_analysis JSONB NOT NULL, -- {"A": "Neden çeldirici...", "B": "...", "D": "..."}
    
    -- Seviye ve Kalite Metrikleri
    difficulty_level VARCHAR(20) NOT NULL DEFAULT 'ORTA' CHECK (difficulty_level IN ('KOLAY', 'ORTA', 'ZOR', 'LGS_YENI_NESIL')),
    cognitive_skill VARCHAR(100) DEFAULT 'Akıl Yürütme ve Eleştirel Düşünme',
    
    -- Jev / System-1 Karar ve Denetim Telemetrisi
    jev_audit JSONB, -- {"is_meb_aligned": true, "distractor_quality": 0.92, "approved": true}
    is_approved BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Testler (Tests / Exam Bundles)
CREATE TABLE IF NOT EXISTS tests (
    id SERIAL PRIMARY KEY,
    topic_id INT REFERENCES topics(id) ON DELETE SET NULL,
    test_type VARCHAR(30) NOT NULL CHECK (test_type IN ('KONU_TESTI', 'UNITE_TARAMA', 'LGS_DENEME_SOZEL', 'LGS_DENEME_SAYISAL')),
    test_no SMALLINT DEFAULT 1,
    title VARCHAR(150) NOT NULL, -- Örn: 'Paragrafta Anlam - Test 1 (20 Soru)'
    total_questions INT NOT NULL DEFAULT 20,
    duration_minutes INT NOT NULL DEFAULT 30, -- LGS süresi
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Test - Soru Eşleştirme (Test Questions Matrix)
CREATE TABLE IF NOT EXISTS test_questions (
    test_id INT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    question_order INT NOT NULL,
    PRIMARY KEY (test_id, question_id)
);

-- 8. Öğrenci Sınav Oturumları (Student Exam Sessions & Optical Sheet Submission)
CREATE TABLE IF NOT EXISTS exam_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- Öğrenci ID
    test_id INT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    mode VARCHAR(20) NOT NULL DEFAULT 'EXAM' CHECK (mode IN ('PRACTICE', 'EXAM')), -- Pratik modu vs Optik Sınav Modu
    
    -- Sınav Sonuç Metrikleri (LGS 3 Yanlış 1 Doğru Kuralı)
    correct_count INT DEFAULT 0,
    wrong_count INT DEFAULT 0,
    empty_count INT DEFAULT 0,
    net_score NUMERIC(5, 2) DEFAULT 0.00, -- Net = Doğru - (Yanlış / 3)
    lgs_standard_score NUMERIC(6, 2) DEFAULT 0.00,
    duration_seconds INT DEFAULT 0,
    
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Soru Bazlı Öğrenci Cevapları & Optik Form Kodlaması
CREATE TABLE IF NOT EXISTS student_answers (
    id SERIAL PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option CHAR(1) CHECK (selected_option IN ('A', 'B', 'C', 'D')), -- NULL ise boş bırakılmış
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    time_spent_seconds INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (session_id, question_id)
);

-- 10. İndeksler (Yüksek Performans Sorguları İçin)
CREATE INDEX IF NOT EXISTS idx_questions_outcome ON questions(outcome_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_questions_approved ON questions(is_approved, is_published);
CREATE INDEX IF NOT EXISTS idx_tests_topic ON tests(topic_id, test_type);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_user ON exam_sessions(user_id, test_id);
