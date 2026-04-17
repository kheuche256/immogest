-- ── Table : etats_lieux ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS etats_lieux (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bien_id              UUID          NOT NULL REFERENCES biens(id)      ON DELETE CASCADE,
  locataire_id         UUID          REFERENCES locataires(id)          ON DELETE SET NULL,
  reservation_id       UUID          REFERENCES reservations(id)        ON DELETE SET NULL,

  type                 TEXT          NOT NULL CHECK (type IN ('entree', 'sortie')),
  date_etat            DATE          NOT NULL DEFAULT CURRENT_DATE,

  -- Compteurs
  releve_electricite   NUMERIC       DEFAULT NULL,
  releve_eau           NUMERIC       DEFAULT NULL,

  -- État du bien
  etat_general         TEXT          CHECK (etat_general IN ('excellent', 'bon', 'moyen', 'mauvais')),
  proprete             TEXT          CHECK (proprete IN ('impeccable', 'propre', 'a_nettoyer', 'sale')),

  -- Descriptif
  observations         TEXT,
  anomalies            TEXT,

  -- Photos (URLs Supabase Storage)
  photos               TEXT[]        DEFAULT '{}',

  -- Signatures
  signe_proprietaire   BOOLEAN       NOT NULL DEFAULT false,
  signe_locataire      BOOLEAN       NOT NULL DEFAULT false,
  date_signature       TIMESTAMPTZ   DEFAULT NULL,

  created_at           TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ   DEFAULT NULL
);

-- ── Index ───────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_etats_lieux_user_id       ON etats_lieux (user_id);
CREATE INDEX IF NOT EXISTS idx_etats_lieux_bien_id       ON etats_lieux (bien_id);
CREATE INDEX IF NOT EXISTS idx_etats_lieux_locataire_id  ON etats_lieux (locataire_id);
CREATE INDEX IF NOT EXISTS idx_etats_lieux_date_etat     ON etats_lieux (date_etat DESC);

-- ── RLS ─────────────────────────────────────────────────────────────────────────
ALTER TABLE etats_lieux ENABLE ROW LEVEL SECURITY;

CREATE POLICY "etats_lieux: lecture propriétaire"
  ON etats_lieux FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "etats_lieux: insertion propriétaire"
  ON etats_lieux FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "etats_lieux: mise à jour propriétaire"
  ON etats_lieux FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "etats_lieux: suppression propriétaire"
  ON etats_lieux FOR DELETE
  USING (auth.uid() = user_id);
