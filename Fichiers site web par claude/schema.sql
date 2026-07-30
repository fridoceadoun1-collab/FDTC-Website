-- ============================================================
-- FDTC PLATFORM — Schéma Supabase
-- Hébergement : West EU (Irlande) — Supabase Inc.
-- Responsable du traitement : ADOUN Fridoce / Fridoce Design and Trade Center
-- Base légale : Contrat (Art. 6.1.b RGPD) + Consentement (Art. 6.1.a RGPD)
-- DPIA : Requise — données de paiement + données personnelles
-- Date : 2026
-- ============================================================

-- 1. TABLE PROFILES (extension de auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  country_code TEXT DEFAULT '+229',
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLE ORDERS (commandes)
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  service TEXT NOT NULL,
  formule TEXT NOT NULL,
  amount_fcfa INTEGER NOT NULL,
  amount_usd NUMERIC(10,2),
  status TEXT DEFAULT 'en_attente' CHECK (
    status IN ('en_attente', 'acompte_recu', 'en_cours', 'revision', 'livre', 'annule')
  ),
  fedapay_transaction_id TEXT,
  notes_client TEXT,
  notes_admin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE FILES (fichiers livrés)
CREATE TABLE public.files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by TEXT DEFAULT 'admin',
  size_bytes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE MESSAGES (messagerie commande)
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'admin')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE CONSENT_LOG (journal de consentement RGPD)
CREATE TABLE public.consent_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  consent_type TEXT NOT NULL,
  consented BOOLEAN NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS : mise à jour automatique de updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER : création automatique du profil à l'inscription
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — Politique de sécurité par ligne
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_log ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "client_voit_son_profil" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "client_modifie_son_profil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "admin_voit_tous_profils" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ORDERS
CREATE POLICY "client_voit_ses_commandes" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "client_cree_commande" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_gere_toutes_commandes" ON public.orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- FILES
CREATE POLICY "client_voit_ses_fichiers" ON public.files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "admin_gere_fichiers" ON public.files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- MESSAGES
CREATE POLICY "participants_voient_messages" ON public.messages
  FOR SELECT USING (
    auth.uid() = sender_id OR
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "participants_envoient_messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND (
      EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id AND o.user_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    )
  );

-- CONSENT_LOG
CREATE POLICY "user_voit_ses_consentements" ON public.consent_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_insere_consentement" ON public.consent_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_voit_consentements" ON public.consent_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- STORAGE BUCKET : fichiers livrés (privé)
-- ============================================================
-- À exécuter dans Supabase Dashboard > Storage > New Bucket
-- Nom : deliverables
-- Public : NON (privé, accès par URL signée uniquement)

-- ============================================================
-- VUES UTILES POUR L'ADMIN
-- ============================================================

CREATE VIEW public.admin_orders_view AS
SELECT
  o.id,
  o.service,
  o.formule,
  o.amount_fcfa,
  o.status,
  o.created_at,
  o.updated_at,
  p.full_name AS client_name,
  p.phone AS client_phone,
  (SELECT COUNT(*) FROM public.messages m WHERE m.order_id = o.id AND m.is_read = FALSE AND m.sender_role = 'client') AS unread_messages,
  (SELECT COUNT(*) FROM public.files f WHERE f.order_id = o.id) AS files_count
FROM public.orders o
JOIN public.profiles p ON p.id = o.user_id;

-- ============================================================
-- DONNÉES INITIALES : statuts lisibles
-- ============================================================
-- en_attente    → En attente de paiement
-- acompte_recu  → Acompte reçu — démarrage en cours
-- en_cours      → En cours de réalisation
-- revision      → En révision
-- livre         → Livré
-- annule        → Annulé
