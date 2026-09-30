-- ============================================================
-- Placement Drive Calendar — Supabase Schema Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Table: profiles
-- Links to auth.users, stores name + role
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT 'coordinator'
                CHECK (role IN ('admin', 'coordinator')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'coordinator')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Table: drives
-- Core placement drive records
-- ============================================================
CREATE TABLE IF NOT EXISTS public.drives (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name    TEXT NOT NULL,
  drive_type      TEXT NOT NULL
                    CHECK (drive_type IN ('Summer Internship', 'Final Placement', 'Both', 'GL')),
  process_stages  TEXT[] NOT NULL DEFAULT '{}',
  assigned_date   DATE NOT NULL,
  poc_name        TEXT NOT NULL DEFAULT '',
  notes           TEXT DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'tentative'
                    CHECK (status IN ('tentative', 'fixed', 'cancelled')),
  created_by      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  confirmed_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  confirmed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_drives_updated_at
  BEFORE UPDATE ON public.drives
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Index for date lookups (primary calendar query)
CREATE INDEX IF NOT EXISTS drives_assigned_date_idx ON public.drives(assigned_date);
CREATE INDEX IF NOT EXISTS drives_status_idx ON public.drives(status);
CREATE INDEX IF NOT EXISTS drives_created_by_idx ON public.drives(created_by);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drives   ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current user role
CREATE OR REPLACE FUNCTION public.my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---- profiles policies ----
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- ---- drives policies ----

-- SELECT: all authenticated users can see non-cancelled drives
CREATE POLICY "Authenticated can view active drives"
  ON public.drives FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    (status != 'cancelled' OR public.is_admin())
  );

-- INSERT: any authenticated user can create tentative drives
CREATE POLICY "Authenticated can create tentative drives"
  ON public.drives FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    status = 'tentative' AND
    created_by = auth.uid()
  );

-- UPDATE: coordinators can only update their own tentative drives
--         admins can update any drive
CREATE POLICY "Coordinators update own tentative, admins update all"
  ON public.drives FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    (
      public.is_admin() OR
      (created_by = auth.uid() AND status = 'tentative')
    )
  );

-- DELETE: coordinators can delete their own tentative drives
--         admins can delete any drive
CREATE POLICY "Coordinators delete own tentative, admins delete all"
  ON public.drives FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    (
      public.is_admin() OR
      (created_by = auth.uid() AND status = 'tentative')
    )
  );
