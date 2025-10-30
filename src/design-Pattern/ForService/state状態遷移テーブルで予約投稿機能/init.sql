-- ============================================
-- マスタテーブル
-- ============================================

-- トピック（カテゴリ）マスタ
CREATE TABLE topics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,  -- 例: "グルメ", "観光", "ホテル"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 記事テーブル（メインエンティティ）
-- ============================================

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 基本情報
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,  -- URL用（例: "kyoto-best-cafe-2024"）
  topic_id INTEGER REFERENCES topics(id),
  
  -- 状態管理
  state VARCHAR(20) NOT NULL DEFAULT 'draft',
    -- 'draft' | 'scheduled' | 'published' | 'archived'
  scheduled_at TIMESTAMP,  -- 予約公開日時
  published_at TIMESTAMP,  -- 実際の公開日時
  
  -- メタ情報
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- 制約
  CONSTRAINT valid_state CHECK (
    state IN ('draft', 'scheduled', 'published', 'archived')
  ),
  CONSTRAINT scheduled_future CHECK (
    scheduled_at IS NULL OR scheduled_at > created_at
  )
);

-- ============================================
-- コンテンツテーブル（1NF対応: 配列を分離）
-- ============================================

-- 記事のコンテンツブロック
CREATE TABLE article_contents (
  id SERIAL PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  
  -- コンテンツ
  image_url TEXT,
  description TEXT,
  
  -- 順序制御
  display_order INTEGER NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- 同じ記事内で順序が重複しないように
  UNIQUE(article_id, display_order)
);

-- ============================================
-- 場所情報テーブル（3NF対応: 推移的従属を分離）
-- ============================================

CREATE TABLE article_locations (
  id SERIAL PRIMARY KEY,
  article_id UUID UNIQUE NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  
  -- 基本情報
  place_name VARCHAR(255),  -- 例: "金閣寺", "築地市場"
  address TEXT,
  phone_number VARCHAR(20),
  official_website TEXT,
  google_maps_url TEXT,
  
  -- 営業情報
  opening_hours TEXT,  -- 例: "10:00-18:00"
  closed_days TEXT,    -- 例: "月曜日、年末年始"
  access_info TEXT,    -- 例: "JR京都駅からバス20分"
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 監査ログテーブル（状態遷移履歴）
-- ============================================

CREATE TABLE article_state_histories (
  id SERIAL PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  
  from_state VARCHAR(20) NOT NULL,
  to_state VARCHAR(20) NOT NULL,
  event VARCHAR(50) NOT NULL,  -- 'publish', 'schedule', 'cancel', etc.
  
  -- 誰が実行したか（将来的にユーザー管理を追加する場合）
  -- user_id UUID REFERENCES users(id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- インデックス
  INDEX idx_article_histories (article_id, created_at DESC)
);