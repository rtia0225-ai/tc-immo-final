-- =========================================================
-- TC-IMMO : Schéma de base de données Supabase (PostgreSQL)
-- À exécuter dans Supabase > SQL Editor
-- =========================================================

-- Extension nécessaire pour générer des UUID
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- 1. PROFILS UTILISATEURS (étend auth.users de Supabase)
-- ---------------------------------------------------------
create type user_role as enum ('client', 'artisan');

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role user_role not null default 'client',
  full_name text not null,
  phone text,
  country text default 'Côte d''Ivoire',
  city text,
  avatar_url text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- 2. PROFILS ARTISANS (infos métier, en plus du profil de base)
-- ---------------------------------------------------------
create table artisan_profiles (
  id uuid references profiles(id) on delete cascade primary key,
  trade text not null,              -- ex: "Plombier", "Maçon", "Électricien"
  bio text,
  years_experience int default 0,
  is_verified boolean default false, -- badge "vérifié TC-Immo"
  hourly_rate numeric(10,2),
  currency text default 'XOF',
  services text[] default '{}',      -- ex: {"Plans & études", "Permis", "Suivi de chantier"}
  projects_completed int default 0,  -- nombre de projets réalisés, affiché sur les cartes
  created_at timestamptz default now()
);

-- Photos de portfolio d'un artisan
create table artisan_photos (
  id uuid primary key default uuid_generate_v4(),
  artisan_id uuid references artisan_profiles(id) on delete cascade,
  photo_url text not null,
  caption text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- 3. AVIS / NOTES
-- ---------------------------------------------------------
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  artisan_id uuid references artisan_profiles(id) on delete cascade,
  client_id uuid references profiles(id) on delete cascade,
  project_id uuid, -- lié plus bas après création de la table projects
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- 4. PROJETS + ESCROW (structure de paiement séquestré)
-- ---------------------------------------------------------
create type project_status as enum (
  'draft', 'awaiting_payment', 'funded', 'in_progress',
  'completed', 'disputed', 'released', 'cancelled'
);

create table projects (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references profiles(id) on delete cascade,
  artisan_id uuid references artisan_profiles(id) on delete cascade,
  title text not null,
  description text,
  amount numeric(12,2) not null,
  currency text default 'XOF',
  status project_status default 'draft',
  escrow_provider text,        -- ex: "stripe_connect", "cinetpay"
  escrow_reference text,       -- id de transaction chez le prestataire
  funded_at timestamptz,
  released_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table reviews
  add constraint fk_reviews_project
  foreign key (project_id) references projects(id) on delete set null;

-- Historique des étapes de l'escrow (traçabilité)
create table escrow_events (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  event_type text not null,   -- 'payment_initiated', 'funded', 'released', 'refunded', 'disputed'
  metadata jsonb,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- 5. MESSAGERIE
-- ---------------------------------------------------------
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references profiles(id) on delete cascade,
  artisan_id uuid references artisan_profiles(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  created_at timestamptz default now(),
  unique (client_id, artisan_id, project_id)
);

create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  content text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- 5bis. RENDEZ-VOUS (calendrier / appel vidéo type Meet)
-- ---------------------------------------------------------
create type appointment_status as enum ('proposed', 'confirmed', 'cancelled', 'completed');

create table appointments (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete set null,
  client_id uuid references profiles(id) on delete cascade,
  artisan_id uuid references artisan_profiles(id) on delete cascade,
  scheduled_at timestamptz not null,
  duration_minutes int default 30,
  meeting_link text,          -- lien Meet/Zoom généré ou saisi manuellement
  status appointment_status default 'proposed',
  notes text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- 5ter. CHRONOGRAMME DU PROJET (étapes cochables par l'artisan,
--       consultables par le client)
-- ---------------------------------------------------------
create table project_milestones (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  order_index int default 0,
  is_completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- 5quater. CHRONOGRAMME PAR DÉFAUT
-- Dès qu'un projet est créé, on pré-remplit ses 5 étapes standards
-- (Fondations → Dalle → Murs → Toiture → Finitions), que l'artisan
-- coche ensuite au fur et à mesure de l'avancement.
-- ---------------------------------------------------------
create or replace function public.create_default_milestones()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into project_milestones (project_id, title, order_index) values
    (new.id, 'Fondations', 1),
    (new.id, 'Dalle', 2),
    (new.id, 'Murs', 3),
    (new.id, 'Toiture', 4),
    (new.id, 'Finitions', 5);
  return new;
end;
$$;

drop trigger if exists on_project_created on projects;
create trigger on_project_created
  after insert on projects
  for each row execute function public.create_default_milestones();

-- ---------------------------------------------------------
-- 6. FLUX CAMÉRA LIVE (structure — à brancher sur un
--    prestataire de streaming type Mux, Daily, ou Agora)
-- ---------------------------------------------------------
create table camera_feeds (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  provider text default 'mux',   -- prestataire de streaming utilisé
  stream_key text,               -- clé de diffusion (côté artisan/chantier)
  playback_url text,             -- URL de lecture (côté client)
  is_live boolean default false,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- 7. SÉCURITÉ : Row Level Security (RLS)
-- ---------------------------------------------------------
alter table profiles enable row level security;
alter table artisan_profiles enable row level security;
alter table artisan_photos enable row level security;
alter table reviews enable row level security;
alter table projects enable row level security;
alter table escrow_events enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table camera_feeds enable row level security;
alter table appointments enable row level security;
alter table project_milestones enable row level security;

-- Tout le monde peut lire les profils publics et artisans
create policy "profils visibles publiquement" on profiles
  for select using (true);
create policy "artisans visibles publiquement" on artisan_profiles
  for select using (true);
create policy "photos artisans visibles publiquement" on artisan_photos
  for select using (true);
create policy "avis visibles publiquement" on reviews
  for select using (true);

-- Un utilisateur ne peut modifier que son propre profil
create policy "modifier son propre profil" on profiles
  for update using (auth.uid() = id);
create policy "creer son propre profil" on profiles
  for insert with check (auth.uid() = id);
create policy "artisan modifie son propre profil metier" on artisan_profiles
  for all using (auth.uid() = id);
create policy "artisan gere ses propres photos" on artisan_photos
  for all using (auth.uid() = artisan_id);

-- Un client peut laisser un avis en son nom propre
create policy "client cree ses avis" on reviews
  for insert with check (auth.uid() = client_id);

-- Projets visibles uniquement par le client et l'artisan concernés
create policy "acces projet client ou artisan" on projects
  for select using (auth.uid() = client_id or auth.uid() = artisan_id);
create policy "client cree un projet" on projects
  for insert with check (auth.uid() = client_id);
create policy "client ou artisan met a jour le projet" on projects
  for update using (auth.uid() = client_id or auth.uid() = artisan_id);

create policy "acces historique escrow" on escrow_events
  for select using (
    exists (
      select 1 from projects p
      where p.id = escrow_events.project_id
      and (p.client_id = auth.uid() or p.artisan_id = auth.uid())
    )
  );

-- Messagerie : accès réservé aux deux participants
create policy "acces conversation participants" on conversations
  for select using (auth.uid() = client_id or auth.uid() = artisan_id);
create policy "creer conversation" on conversations
  for insert with check (auth.uid() = client_id or auth.uid() = artisan_id);

create policy "acces messages participants" on messages
  for select using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
      and (c.client_id = auth.uid() or c.artisan_id = auth.uid())
    )
  );
create policy "envoyer message" on messages
  for insert with check (auth.uid() = sender_id);

-- Rendez-vous : accès réservé au client et à l'artisan concernés
create policy "acces rdv participants" on appointments
  for select using (auth.uid() = client_id or auth.uid() = artisan_id);
create policy "creer rdv" on appointments
  for insert with check (auth.uid() = client_id or auth.uid() = artisan_id);
create policy "modifier rdv participants" on appointments
  for update using (auth.uid() = client_id or auth.uid() = artisan_id);

-- Chronogramme : visible par client + artisan du projet,
-- mais seul l'artisan peut cocher les étapes (contrôlé aussi côté appli)
create policy "acces chronogramme participants" on project_milestones
  for select using (
    exists (
      select 1 from projects p
      where p.id = project_milestones.project_id
      and (p.client_id = auth.uid() or p.artisan_id = auth.uid())
    )
  );
create policy "artisan gere le chronogramme" on project_milestones
  for all using (
    exists (
      select 1 from projects p
      where p.id = project_milestones.project_id
      and p.artisan_id = auth.uid()
    )
  );

-- Flux caméra : accès réservé au projet concerné
create policy "acces flux camera participants" on camera_feeds
  for select using (
    exists (
      select 1 from projects p
      where p.id = camera_feeds.project_id
      and (p.client_id = auth.uid() or p.artisan_id = auth.uid())
    )
  );

-- ---------------------------------------------------------
-- 8. AUTORISATIONS D'ACCÈS AUX TABLES (CRUCIAL)
-- Sans ceci, même avec des règles RLS correctes, personne ne peut
-- accéder aux tables depuis le site. S'applique aussi aux tables
-- créées après coup.
-- ---------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all functions in schema public to anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

-- ---------------------------------------------------------
-- 9. CRÉATION AUTOMATIQUE DU PROFIL À L'INSCRIPTION
-- Filet de sécurité : le profil (et la fiche artisan) se crée
-- automatiquement dès qu'un compte est créé, indépendamment du code
-- du site. Utilise les métadonnées (nom/rôle/métier) transmises par
-- le formulaire d'inscription, avec des valeurs par défaut sinon.
-- ---------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text;
  v_role user_role;
  v_trade text;
begin
  v_full_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  v_role := coalesce((new.raw_user_meta_data->>'role')::user_role, 'client');
  v_trade := new.raw_user_meta_data->>'trade';

  insert into public.profiles (id, full_name, role)
  values (new.id, v_full_name, v_role)
  on conflict (id) do nothing;

  if v_role = 'artisan' then
    insert into public.artisan_profiles (id, trade)
    values (new.id, coalesce(v_trade, 'Non spécifié'))
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------
-- 10. CONFIRMATION AUTOMATIQUE DES COMPTES
-- Évite d'avoir à cliquer sur un lien reçu par email pour activer
-- un compte. À retirer si tu veux un jour réactiver la vraie
-- vérification d'email.
-- ---------------------------------------------------------
create or replace function public.auto_confirm_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
  return new;
end;
$$;

drop trigger if exists on_auth_user_auto_confirm on auth.users;
create trigger on_auth_user_auto_confirm
  before insert on auth.users
  for each row execute function public.auto_confirm_email();

-- ---------------------------------------------------------
-- 11. DÉTAILS DE PROFIL ARTISAN (mobilité, tarification, disponibilités)
-- ---------------------------------------------------------
create type mobility_scope as enum ('all', 'selected');

alter table artisan_profiles add column if not exists mobility_scope mobility_scope default 'selected';
alter table artisan_profiles add column if not exists mobility_cities text[] default '{}';
alter table artisan_profiles add column if not exists pricing_info text;
alter table artisan_profiles add column if not exists availability_days text[] default '{}';

-- Informations personnelles privées, jamais visibles du client,
-- utilisées pour la vérification du profil.
alter table profiles add column if not exists emergency_contact_name text;
alter table profiles add column if not exists emergency_contact_phone text;

-- ---------------------------------------------------------
-- 12. STATISTIQUES DE RECHERCHE (usage interne uniquement)
-- Journal des recherches clients : type de maison, métier, ville,
-- recommandation. Sert à identifier les besoins en spécialités selon
-- le type de construction (ex: géotechniciens pour les immeubles élevés).
-- N'affecte jamais les résultats affichés au client.
-- ---------------------------------------------------------
create table search_analytics (
  id uuid primary key default uuid_generate_v4(),
  house_type text,
  trade text,
  city text,
  recommendation text,
  searched_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table search_analytics enable row level security;

create policy "personne ne lit les analytics" on search_analytics
  for select using (false);

create policy "tout le monde peut logger une recherche" on search_analytics
  for insert with check (true);

-- ---------------------------------------------------------
-- 13. STOCKAGE DE FICHIERS (photos de profil et réalisations)
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('artisan-photos', 'artisan-photos', true)
on conflict (id) do nothing;

create policy "avatars lecture publique" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "photos artisans lecture publique" on storage.objects
  for select using (bucket_id = 'artisan-photos');

create policy "upload de son propre avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "modifier son propre avatar" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "supprimer son propre avatar" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "upload de ses propres photos" on storage.objects
  for insert with check (
    bucket_id = 'artisan-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "modifier ses propres photos" on storage.objects
  for update using (
    bucket_id = 'artisan-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "supprimer ses propres photos" on storage.objects
  for delete using (
    bucket_id = 'artisan-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------
-- 14. LOCALISATION FIXE (capturée une seule fois, façon partage de
-- position WhatsApp). Information privée, utilisée pour la vérification
-- du domicile — jamais affichée sur le profil public.
-- ---------------------------------------------------------
alter table profiles add column if not exists home_latitude double precision;
alter table profiles add column if not exists home_longitude double precision;
alter table profiles add column if not exists home_location_captured_at timestamptz;

-- ---------------------------------------------------------
-- 15. NOTES VOCALES DANS LA MESSAGERIE
-- ---------------------------------------------------------
alter table messages alter column content drop not null;
alter table messages add column if not exists audio_url text;

insert into storage.buckets (id, name, public)
values ('voice-notes', 'voice-notes', true)
on conflict (id) do nothing;

create policy "notes vocales lecture publique" on storage.objects
  for select using (bucket_id = 'voice-notes');

create policy "envoyer sa propre note vocale" on storage.objects
  for insert with check (
    bucket_id = 'voice-notes' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------
-- 16. NÉGOCIATION DE RENDEZ-VOUS (contre-propositions)
-- ---------------------------------------------------------
alter table appointments add column if not exists proposed_by uuid references profiles(id);

-- ---------------------------------------------------------
-- 17. PIÈCE D'IDENTITÉ (privée) ET CONTRATS SIGNÉS
-- ---------------------------------------------------------
alter table profiles add column if not exists id_document_url text;
alter table profiles add column if not exists id_document_uploaded_at timestamptz;

insert into storage.buckets (id, name, public)
values ('id-documents', 'id-documents', false)
on conflict (id) do nothing;

create policy "voir sa propre piece d'identite" on storage.objects
  for select using (
    bucket_id = 'id-documents' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "uploader sa propre piece d'identite" on storage.objects
  for insert with check (
    bucket_id = 'id-documents' and (storage.foldername(name))[1] = auth.uid()::text
  );

create table contracts (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade unique,
  content text not null,
  client_signed_at timestamptz,
  artisan_signed_at timestamptz,
  created_at timestamptz default now()
);

alter table contracts enable row level security;

create policy "acces contrat participants" on contracts
  for select using (
    exists (select 1 from projects p where p.id = contracts.project_id and (p.client_id = auth.uid() or p.artisan_id = auth.uid()))
  );
create policy "signer le contrat" on contracts
  for update using (
    exists (select 1 from projects p where p.id = contracts.project_id and (p.client_id = auth.uid() or p.artisan_id = auth.uid()))
  );
create policy "creer le contrat a la creation du projet" on contracts
  for insert with check (
    exists (select 1 from projects p where p.id = contracts.project_id and p.client_id = auth.uid())
  );

-- ---------------------------------------------------------
-- 18. COMPTE MOBILE MONEY (reversements artisan — pas de compte bancaire)
-- ---------------------------------------------------------
alter table artisan_profiles add column if not exists mobile_money_operator text;
alter table artisan_profiles add column if not exists mobile_money_number text;

-- ---------------------------------------------------------
-- 18. ÉCHÉANCIER DE PAIEMENT PERSONNALISÉ (remplace les étapes
-- génériques automatiques — chaque projet a ses propres paliers,
-- définis par le client selon le contrat convenu avec l'artisan)
-- ---------------------------------------------------------
alter table project_milestones add column if not exists payment_percentage numeric(5,2);
alter table project_milestones add column if not exists amount numeric(12,2);
alter table project_milestones add column if not exists paid_at timestamptz;

drop trigger if exists on_project_created on projects;

-- ---------------------------------------------------------
-- 19. IDENTIFIANT EMAIL OU TÉLÉPHONE
-- Mise à jour de la création automatique de profil pour récupérer aussi
-- le numéro de téléphone (quand l'inscription se fait par téléphone
-- plutôt que par email — beaucoup d'artisans n'ont pas d'email).
-- ---------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text;
  v_role user_role;
  v_trade text;
  v_phone text;
begin
  v_full_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  v_role := coalesce((new.raw_user_meta_data->>'role')::user_role, 'client');
  v_trade := new.raw_user_meta_data->>'trade';
  v_phone := new.raw_user_meta_data->>'phone';

  insert into public.profiles (id, full_name, role, phone)
  values (new.id, v_full_name, v_role, v_phone)
  on conflict (id) do nothing;

  if v_role = 'artisan' then
    insert into public.artisan_profiles (id, trade)
    values (new.id, coalesce(v_trade, 'Non spécifié'))
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------
-- 20. CORRECTIF : le client (pas seulement l'artisan) doit pouvoir créer
-- l'échéancier de paiement à la création du projet.
-- ---------------------------------------------------------
create policy "client cree le chronogramme" on project_milestones
  for insert with check (
    exists (select 1 from projects p where p.id = project_milestones.project_id and p.client_id = auth.uid())
  );

-- ---------------------------------------------------------
-- 21. TYPE ET NUMÉRO DE PIÈCE D'IDENTITÉ
-- ---------------------------------------------------------
alter table profiles add column if not exists id_document_type text;
alter table profiles add column if not exists id_document_number text;

-- ---------------------------------------------------------
-- 22. SUPPRESSION DE COMPTE (bloquée si projet en cours)
-- ---------------------------------------------------------
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_active_count int;
begin
  if v_uid is null then
    raise exception 'Non authentifié.';
  end if;

  select count(*) into v_active_count
  from projects
  where (client_id = v_uid or artisan_id = v_uid)
    and status not in ('released', 'cancelled');

  if v_active_count > 0 then
    raise exception 'Impossible de supprimer le compte : un projet est encore en cours.';
  end if;

  delete from auth.users where id = v_uid;
end;
$$;

grant execute on function public.delete_own_account() to authenticated;
