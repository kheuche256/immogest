-- ============================================================
--  Migration : Module Réservations — KeurGest
--  À exécuter dans l'éditeur SQL de Supabase
-- ============================================================

-- ── 1. Colonnes supplémentaires sur biens ────────────────────
ALTER TABLE biens
  ADD COLUMN IF NOT EXISTS est_meuble          BOOLEAN   NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tarif_nuit          NUMERIC   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tarif_semaine       NUMERIC   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tarif_mois          NUMERIC   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS capacite_personnes  INTEGER   DEFAULT 1,
  ADD COLUMN IF NOT EXISTS equipements         TEXT[]    DEFAULT '{}';

COMMENT ON COLUMN biens.est_meuble         IS 'True si le bien est meublé (location courte durée)';
COMMENT ON COLUMN biens.tarif_nuit         IS 'Tarif par nuitée en FCFA';
COMMENT ON COLUMN biens.tarif_semaine      IS 'Tarif à la semaine en FCFA';
COMMENT ON COLUMN biens.tarif_mois         IS 'Tarif mensuel meublé en FCFA';
COMMENT ON COLUMN biens.capacite_personnes IS 'Nombre maximum de personnes';
COMMENT ON COLUMN biens.equipements        IS 'Liste des équipements inclus (wifi, piscine, etc.)';

-- ── 2. Table reservations ────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservations (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bien_id           UUID        NOT NULL REFERENCES biens(id)      ON DELETE CASCADE,

  -- Client
  locataire_id      UUID        REFERENCES locataires(id)          ON DELETE SET NULL,
  client_nom        TEXT        NOT NULL,
  client_telephone  TEXT        NOT NULL,
  client_email      TEXT,

  -- Période
  date_debut        DATE        NOT NULL,
  date_fin          DATE        NOT NULL,
  CONSTRAINT ck_dates CHECK (date_fin > date_debut),

  -- Tarification
  tarif_nuitee      NUMERIC     NOT NULL DEFAULT 0,
  nb_nuits          INTEGER     NOT NULL DEFAULT 1,
  montant_total     NUMERIC     NOT NULL DEFAULT 0,
  acompte           NUMERIC     NOT NULL DEFAULT 0,
  montant_restant   NUMERIC     GENERATED ALWAYS AS (montant_total - acompte) STORED,

  -- Statut
  statut            TEXT        NOT NULL DEFAULT 'en_attente'
    CHECK (statut IN ('en_attente','confirmee','en_cours','terminee','annulee')),

  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_reservations_user_id    ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_bien_id    ON reservations(bien_id);
CREATE INDEX IF NOT EXISTS idx_reservations_statut     ON reservations(statut);
CREATE INDEX IF NOT EXISTS idx_reservations_dates      ON reservations(date_debut, date_fin);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reservations_updated_at ON reservations;
CREATE TRIGGER trg_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 3. Row Level Security ────────────────────────────────────
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Chaque utilisateur ne voit que ses réservations
CREATE POLICY "reservations_select" ON reservations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "reservations_insert" ON reservations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reservations_update" ON reservations
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reservations_delete" ON reservations
  FOR DELETE USING (auth.uid() = user_id);

-- ── 4. Vue utilitaire : conflits de disponibilité ────────────
-- Permet de détecter facilement les chevauchements depuis le client
CREATE OR REPLACE VIEW v_reservations_actives AS
  SELECT *
  FROM   reservations
  WHERE  statut NOT IN ('annulee');

-- ── 5. Commentaires ──────────────────────────────────────────
COMMENT ON TABLE reservations IS 'Réservations courte durée pour biens meublés — KeurGest';
