-- Supabase expose le schéma « public » par son API REST (clé anonyme publique) : sans protection, n'importe qui
-- pourrait lire ou modifier utilisateurs, sessions, commandes… Le site n'utilise que la connexion Postgres directe
-- (propriétaire des tables, non soumis à la RLS) : on active donc la RLS sans aucune politique et on retire les
-- droits des rôles de l'API. Sans effet sur un Postgres qui n'a pas ces rôles (Neon, base locale).
DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM authenticated;
  END IF;
END $$;
