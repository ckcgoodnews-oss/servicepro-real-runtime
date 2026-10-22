-- Legacy deployments authorize platform access by email. Prevent another
-- company's owner or public signup from copying a registered site-admin email.
CREATE OR REPLACE FUNCTION public.protect_site_admin_email()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER
SET search_path = pg_catalog, public AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.runtime_site_admins a
    JOIN public.runtime_users u ON u.id=a.user_id AND u.tenant_id=a.tenant_id
    WHERE lower(btrim(u.email))=lower(btrim(NEW.email)) AND u.id<>NEW.id
  ) THEN
    RAISE EXCEPTION 'This email is reserved for an existing site administrator'
      USING ERRCODE='23505';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_site_admin_email() FROM PUBLIC;
DROP TRIGGER IF EXISTS protect_site_admin_email ON public.runtime_users;
CREATE TRIGGER protect_site_admin_email
BEFORE INSERT OR UPDATE OF email,tenant_id ON public.runtime_users
FOR EACH ROW EXECUTE FUNCTION public.protect_site_admin_email();
