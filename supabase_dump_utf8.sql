--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: _realtime; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA _realtime;


ALTER SCHEMA _realtime OWNER TO postgres;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_net IS 'Async HTTP';


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: supabase_functions; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA supabase_functions;


ALTER SCHEMA supabase_functions OWNER TO supabase_admin;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: AppointmentPriority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AppointmentPriority" AS ENUM (
    'LOW',
    'NORMAL',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."AppointmentPriority" OWNER TO postgres;

--
-- Name: AppointmentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AppointmentStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW'
);


ALTER TYPE public."AppointmentStatus" OWNER TO postgres;

--
-- Name: ApprovalMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ApprovalMethod" AS ENUM (
    'IN_PERSON',
    'PHONE',
    'EMAIL',
    'APP',
    'SMS',
    'DIGITAL_SIGNATURE'
);


ALTER TYPE public."ApprovalMethod" OWNER TO postgres;

--
-- Name: ApprovalStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ApprovalStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'DECLINED',
    'EXPIRED'
);


ALTER TYPE public."ApprovalStatus" OWNER TO postgres;

--
-- Name: AttachmentCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AttachmentCategory" AS ENUM (
    'GENERAL',
    'INVOICE',
    'RECEIPT',
    'WARRANTY',
    'INSPECTION',
    'BEFORE_AFTER',
    'DIAGNOSTIC',
    'MANUAL',
    'OTHER'
);


ALTER TYPE public."AttachmentCategory" OWNER TO postgres;

--
-- Name: ChecklistStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ChecklistStatus" AS ENUM (
    'GREEN',
    'YELLOW',
    'RED'
);


ALTER TYPE public."ChecklistStatus" OWNER TO postgres;

--
-- Name: DayOfWeek; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DayOfWeek" AS ENUM (
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY'
);


ALTER TYPE public."DayOfWeek" OWNER TO postgres;

--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'DRAFT',
    'SENT',
    'PAID',
    'OVERDUE',
    'CANCELLED'
);


ALTER TYPE public."InvoiceStatus" OWNER TO postgres;

--
-- Name: JobPriority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."JobPriority" AS ENUM (
    'LOW',
    'NORMAL',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."JobPriority" OWNER TO postgres;

--
-- Name: JobSource; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."JobSource" AS ENUM (
    'WALK_IN',
    'APPOINTMENT',
    'PHONE',
    'ROADSIDE_ASSIST'
);


ALTER TYPE public."JobSource" OWNER TO postgres;

--
-- Name: JobType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."JobType" AS ENUM (
    'REPAIR',
    'MAINTENANCE',
    'INSPECTION',
    'WARRANTY',
    'RECALL'
);


ALTER TYPE public."JobType" OWNER TO postgres;

--
-- Name: LineItemType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LineItemType" AS ENUM (
    'SERVICE',
    'LABOR',
    'PART',
    'DISCOUNT',
    'TAX',
    'OTHER'
);


ALTER TYPE public."LineItemType" OWNER TO postgres;

--
-- Name: PartSource; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PartSource" AS ENUM (
    'INVENTORY',
    'SUPPLIER',
    'CUSTOMER_SUPPLIED',
    'WARRANTY',
    'SALVAGE'
);


ALTER TYPE public."PartSource" OWNER TO postgres;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'BANK_TRANSFER',
    'UPI',
    'CHEQUE',
    'DIGITAL_WALLET',
    'INSURANCE',
    'WARRANTY'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PARTIALLY_PAID',
    'PAID',
    'OVERDUE',
    'COMPLETED',
    'FAILED',
    'REFUNDED',
    'PARTIAL_REFUND',
    'CANCELLED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: ServiceDiscountType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ServiceDiscountType" AS ENUM (
    'FIXED',
    'PERCENTAGE'
);


ALTER TYPE public."ServiceDiscountType" OWNER TO postgres;

--
-- Name: ServiceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ServiceStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."ServiceStatus" OWNER TO postgres;

--
-- Name: TirePosition; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TirePosition" AS ENUM (
    'LF',
    'RF',
    'LR',
    'RR',
    'SPARE'
);


ALTER TYPE public."TirePosition" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'CUSTOMER',
    'ADMIN',
    'MANAGER',
    'SERVICE_ADVISOR',
    'INVENTORY_MANAGER',
    'TECHNICIAN'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

--
-- Name: WarrantyStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WarrantyStatus" AS ENUM (
    'NONE',
    'MANUFACTURER',
    'EXTENDED'
);


ALTER TYPE public."WarrantyStatus" OWNER TO postgres;

--
-- Name: WorkOrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WorkOrderStatus" AS ENUM (
    'PENDING',
    'ESTIMATE',
    'IN_PROGRESS',
    'WAITING_FOR_PARTS',
    'QC_PENDING',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."WorkOrderStatus" OWNER TO postgres;

--
-- Name: WorkflowStep; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WorkflowStep" AS ENUM (
    'RECEIVED',
    'INSPECTION',
    'ESTIMATE',
    'APPROVAL',
    'REPAIR',
    'QC',
    'READY',
    'CLOSED'
);


ALTER TYPE public."WorkflowStep" OWNER TO postgres;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

    REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
    REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

    GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      PERFORM pg_notify(
          'realtime:system',
          jsonb_build_object(
              'error', SQLERRM,
              'function', 'realtime.send',
              'event', event,
              'topic', topic,
              'private', private
          )::text
      );
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


ALTER FUNCTION storage.add_prefixes(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


ALTER FUNCTION storage.delete_prefix(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


ALTER FUNCTION storage.delete_prefix_hierarchy_trigger() OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


ALTER FUNCTION storage.get_level(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


ALTER FUNCTION storage.get_prefix(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


ALTER FUNCTION storage.get_prefixes(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO supabase_storage_admin;

--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_insert_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_update_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.prefixes_insert_trigger() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
BEGIN
    RETURN query EXECUTE
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name || '/' AS name,
                    NULL::uuid AS id,
                    NULL::timestamptz AS updated_at,
                    NULL::timestamptz AS created_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
                ORDER BY prefixes.name COLLATE "C" LIMIT $3
            )
            UNION ALL
            (SELECT split_part(name, '/', $4) AS key,
                name,
                id,
                updated_at,
                created_at,
                metadata
            FROM storage.objects
            WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
            ORDER BY name COLLATE "C" LIMIT $3)
        ) obj
        ORDER BY name COLLATE "C" LIMIT $3;
        $sql$
        USING prefix, bucket_name, limits, levels, start_after;
END;
$_$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

--
-- Name: http_request(); Type: FUNCTION; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE FUNCTION supabase_functions.http_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'supabase_functions'
    AS $$
  DECLARE
    request_id bigint;
    payload jsonb;
    url text := TG_ARGV[0]::text;
    method text := TG_ARGV[1]::text;
    headers jsonb DEFAULT '{}'::jsonb;
    params jsonb DEFAULT '{}'::jsonb;
    timeout_ms integer DEFAULT 1000;
  BEGIN
    IF url IS NULL OR url = 'null' THEN
      RAISE EXCEPTION 'url argument is missing';
    END IF;

    IF method IS NULL OR method = 'null' THEN
      RAISE EXCEPTION 'method argument is missing';
    END IF;

    IF TG_ARGV[2] IS NULL OR TG_ARGV[2] = 'null' THEN
      headers = '{"Content-Type": "application/json"}'::jsonb;
    ELSE
      headers = TG_ARGV[2]::jsonb;
    END IF;

    IF TG_ARGV[3] IS NULL OR TG_ARGV[3] = 'null' THEN
      params = '{}'::jsonb;
    ELSE
      params = TG_ARGV[3]::jsonb;
    END IF;

    IF TG_ARGV[4] IS NULL OR TG_ARGV[4] = 'null' THEN
      timeout_ms = 1000;
    ELSE
      timeout_ms = TG_ARGV[4]::integer;
    END IF;

    CASE
      WHEN method = 'GET' THEN
        SELECT http_get INTO request_id FROM net.http_get(
          url,
          params,
          headers,
          timeout_ms
        );
      WHEN method = 'POST' THEN
        payload = jsonb_build_object(
          'old_record', OLD,
          'record', NEW,
          'type', TG_OP,
          'table', TG_TABLE_NAME,
          'schema', TG_TABLE_SCHEMA
        );

        SELECT http_post INTO request_id FROM net.http_post(
          url,
          payload,
          params,
          headers,
          timeout_ms
        );
      ELSE
        RAISE EXCEPTION 'method argument % is invalid', method;
    END CASE;

    INSERT INTO supabase_functions.hooks
      (hook_table_id, hook_name, request_id)
    VALUES
      (TG_RELID, TG_NAME, request_id);

    RETURN NEW;
  END
$$;


ALTER FUNCTION supabase_functions.http_request() OWNER TO supabase_functions_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: extensions; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.extensions (
    id uuid NOT NULL,
    type text,
    settings jsonb,
    tenant_external_id text,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE _realtime.extensions OWNER TO supabase_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE _realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: tenants; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.tenants (
    id uuid NOT NULL,
    name text,
    external_id text,
    jwt_secret text,
    max_concurrent_users integer DEFAULT 200 NOT NULL,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    max_events_per_second integer DEFAULT 100 NOT NULL,
    postgres_cdc_default text DEFAULT 'postgres_cdc_rls'::text,
    max_bytes_per_second integer DEFAULT 100000 NOT NULL,
    max_channels_per_client integer DEFAULT 100 NOT NULL,
    max_joins_per_second integer DEFAULT 500 NOT NULL,
    suspend boolean DEFAULT false,
    jwt_jwks jsonb,
    notify_private_alpha boolean DEFAULT false,
    private_only boolean DEFAULT false NOT NULL,
    migrations_ran integer DEFAULT 0,
    broadcast_adapter character varying(255) DEFAULT 'gen_rpc'::character varying
);


ALTER TABLE _realtime.tenants OWNER TO supabase_admin;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: Admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Admin" (
    id text NOT NULL,
    "userProfileId" text NOT NULL,
    "employeeId" text,
    permissions text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Admin" OWNER TO postgres;

--
-- Name: Appointment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Appointment" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "vehicleId" text NOT NULL,
    "requestedAt" timestamp(3) without time zone NOT NULL,
    "startTime" timestamp(3) without time zone,
    "endTime" timestamp(3) without time zone,
    status public."AppointmentStatus" DEFAULT 'PENDING'::public."AppointmentStatus" NOT NULL,
    priority public."AppointmentPriority" DEFAULT 'NORMAL'::public."AppointmentPriority" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "assignedToId" text
);


ALTER TABLE public."Appointment" OWNER TO postgres;

--
-- Name: AppointmentCannedService; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AppointmentCannedService" (
    id text NOT NULL,
    "appointmentId" text NOT NULL,
    "cannedServiceId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    price numeric(10,2) NOT NULL,
    notes text
);


ALTER TABLE public."AppointmentCannedService" OWNER TO postgres;

--
-- Name: CannedService; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CannedService" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    duration integer NOT NULL,
    price numeric(10,2) NOT NULL,
    "isAvailable" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CannedService" OWNER TO postgres;

--
-- Name: CannedServiceLabor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CannedServiceLabor" (
    id text NOT NULL,
    "cannedServiceId" text NOT NULL,
    "laborCatalogId" text NOT NULL,
    sequence integer DEFAULT 1 NOT NULL,
    notes text
);


ALTER TABLE public."CannedServiceLabor" OWNER TO postgres;

--
-- Name: CannedServicePartsCategory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CannedServicePartsCategory" (
    id text NOT NULL,
    "cannedServiceId" text NOT NULL,
    "categoryId" text NOT NULL,
    "isRequired" boolean DEFAULT true NOT NULL,
    notes text
);


ALTER TABLE public."CannedServicePartsCategory" OWNER TO postgres;

--
-- Name: Customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Customer" (
    id text NOT NULL,
    "userProfileId" text,
    name character varying(255) NOT NULL,
    email text,
    phone text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Customer" OWNER TO postgres;

--
-- Name: EstimateLabor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EstimateLabor" (
    id text NOT NULL,
    "estimateId" text NOT NULL,
    "laborCatalogId" text,
    description text NOT NULL,
    hours numeric(5,2) NOT NULL,
    rate numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    notes text,
    "customerApproved" boolean DEFAULT false NOT NULL,
    "customerNotes" text,
    "cannedServiceId" text,
    "serviceDiscountAmount" numeric(10,2),
    "serviceDiscountType" public."ServiceDiscountType",
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."EstimateLabor" OWNER TO postgres;

--
-- Name: EstimatePart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EstimatePart" (
    id text NOT NULL,
    "estimateId" text NOT NULL,
    "inventoryItemId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    source public."PartSource" DEFAULT 'INVENTORY'::public."PartSource" NOT NULL,
    "supplierName" text,
    "warrantyInfo" text,
    notes text,
    "customerApproved" boolean DEFAULT false NOT NULL,
    "customerNotes" text,
    "cannedServiceId" text,
    "serviceDiscountAmount" numeric(10,2),
    "serviceDiscountType" public."ServiceDiscountType",
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."EstimatePart" OWNER TO postgres;

--
-- Name: InspectionChecklistItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InspectionChecklistItem" (
    id text NOT NULL,
    "inspectionId" text NOT NULL,
    "templateItemId" text,
    category text,
    item text NOT NULL,
    status public."ChecklistStatus" NOT NULL,
    notes text,
    "requiresFollowUp" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."InspectionChecklistItem" OWNER TO postgres;

--
-- Name: InspectionTemplate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InspectionTemplate" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    category text,
    "imageUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."InspectionTemplate" OWNER TO postgres;

--
-- Name: InspectionTemplateItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InspectionTemplateItem" (
    id text NOT NULL,
    "templateId" text NOT NULL,
    name text NOT NULL,
    description text,
    category text,
    "sortOrder" integer,
    "isRequired" boolean DEFAULT true NOT NULL,
    "allowsNotes" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."InspectionTemplateItem" OWNER TO postgres;

--
-- Name: InventoryCategory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InventoryCategory" (
    id text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."InventoryCategory" OWNER TO postgres;

--
-- Name: InventoryItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InventoryItem" (
    id text NOT NULL,
    name text NOT NULL,
    sku text,
    "partNumber" text,
    manufacturer text,
    location text,
    quantity integer DEFAULT 0 NOT NULL,
    "minStockLevel" integer DEFAULT 0,
    "maxStockLevel" integer DEFAULT 0,
    "reorderPoint" integer DEFAULT 0,
    "unitPrice" numeric(65,30) NOT NULL,
    supplier text,
    "supplierPartNumber" text,
    core boolean DEFAULT false NOT NULL,
    "corePrice" numeric(10,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "categoryId" text NOT NULL
);


ALTER TABLE public."InventoryItem" OWNER TO postgres;

--
-- Name: InventoryManager; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InventoryManager" (
    id text NOT NULL,
    "userProfileId" text NOT NULL,
    "employeeId" text,
    department text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."InventoryManager" OWNER TO postgres;

--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Invoice" (
    id text NOT NULL,
    "invoiceNumber" text NOT NULL,
    "workOrderId" text NOT NULL,
    "issueDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dueDate" timestamp(3) without time zone,
    status public."InvoiceStatus" DEFAULT 'DRAFT'::public."InvoiceStatus" NOT NULL,
    "subtotalServices" numeric(10,2) DEFAULT 0 NOT NULL,
    "subtotalLabor" numeric(10,2) DEFAULT 0 NOT NULL,
    "subtotalParts" numeric(10,2) DEFAULT 0 NOT NULL,
    subtotal numeric(10,2) DEFAULT 0 NOT NULL,
    "taxAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "discountAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "totalAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "paidAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "balanceDue" numeric(10,2) DEFAULT 0 NOT NULL,
    notes text,
    terms text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Invoice" OWNER TO postgres;

--
-- Name: InvoiceLineItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InvoiceLineItem" (
    id text NOT NULL,
    "invoiceId" text NOT NULL,
    type public."LineItemType" NOT NULL,
    description text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    "workOrderServiceId" text,
    "workOrderLaborId" text,
    "workOrderPartId" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."InvoiceLineItem" OWNER TO postgres;

--
-- Name: LaborCatalog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LaborCatalog" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    "estimatedHours" numeric(5,2) NOT NULL,
    "hourlyRate" numeric(10,2) NOT NULL,
    category text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."LaborCatalog" OWNER TO postgres;

--
-- Name: Manager; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Manager" (
    id text NOT NULL,
    "userProfileId" text NOT NULL,
    "employeeId" text,
    department text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Manager" OWNER TO postgres;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "workOrderId" text NOT NULL,
    method public."PaymentMethod" NOT NULL,
    amount numeric(10,2) NOT NULL,
    reference text,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "paidAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "processedById" text,
    notes text,
    "refundAmount" numeric(10,2),
    "refundReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Payment" OWNER TO postgres;

--
-- Name: ServiceAdvisor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ServiceAdvisor" (
    id text NOT NULL,
    "userProfileId" text NOT NULL,
    "employeeId" text,
    department text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ServiceAdvisor" OWNER TO postgres;

--
-- Name: ShopCapacitySettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ShopCapacitySettings" (
    id text NOT NULL,
    "appointmentsPerDay" integer DEFAULT 6 NOT NULL,
    "appointmentsPerTimeBlock" integer DEFAULT 2 NOT NULL,
    "timeBlockIntervalMinutes" integer DEFAULT 30 NOT NULL,
    "minimumNoticeHours" integer DEFAULT 48 NOT NULL,
    "futureSchedulingCutoffYears" integer DEFAULT 3 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ShopCapacitySettings" OWNER TO postgres;

--
-- Name: ShopOperatingHours; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ShopOperatingHours" (
    id text NOT NULL,
    "dayOfWeek" public."DayOfWeek" NOT NULL,
    "isOpen" boolean DEFAULT false NOT NULL,
    "openTime" text,
    "closeTime" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ShopOperatingHours" OWNER TO postgres;

--
-- Name: Technician; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Technician" (
    id text NOT NULL,
    "userProfileId" text NOT NULL,
    "employeeId" text,
    specialization text,
    certifications text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Technician" OWNER TO postgres;

--
-- Name: TireInspection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TireInspection" (
    id text NOT NULL,
    "inspectionId" text NOT NULL,
    "position" public."TirePosition" NOT NULL,
    brand text,
    model text,
    size text,
    psi integer,
    "treadDepth" numeric(4,2),
    "damageNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TireInspection" OWNER TO postgres;

--
-- Name: UserProfile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserProfile" (
    id text NOT NULL,
    "supabaseUserId" uuid NOT NULL,
    name text,
    phone text,
    "profileImage" text,
    role public."UserRole" DEFAULT 'CUSTOMER'::public."UserRole" NOT NULL,
    "isRegistrationComplete" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserProfile" OWNER TO postgres;

--
-- Name: Vehicle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Vehicle" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    make text NOT NULL,
    model text NOT NULL,
    year integer,
    vin text,
    "licensePlate" text,
    "imageUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Vehicle" OWNER TO postgres;

--
-- Name: WorkOrder; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WorkOrder" (
    id text NOT NULL,
    "workOrderNumber" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "customerId" text NOT NULL,
    "vehicleId" text NOT NULL,
    "appointmentId" text,
    "advisorId" text,
    status public."WorkOrderStatus" NOT NULL,
    "jobType" public."JobType" DEFAULT 'REPAIR'::public."JobType" NOT NULL,
    priority public."JobPriority" DEFAULT 'NORMAL'::public."JobPriority" NOT NULL,
    source public."JobSource" DEFAULT 'WALK_IN'::public."JobSource" NOT NULL,
    complaint text,
    "odometerReading" integer,
    "warrantyStatus" public."WarrantyStatus" DEFAULT 'NONE'::public."WarrantyStatus" NOT NULL,
    "estimatedTotal" numeric(10,2),
    "estimateNotes" text,
    "estimateApproved" boolean DEFAULT false NOT NULL,
    "subtotalLabor" numeric(10,2),
    "subtotalParts" numeric(10,2),
    "discountAmount" numeric(10,2),
    "taxAmount" numeric(10,2),
    "totalAmount" numeric(10,2),
    "paidAmount" numeric(10,2) DEFAULT 0,
    "openedAt" timestamp(3) without time zone,
    "promisedAt" timestamp(3) without time zone,
    "closedAt" timestamp(3) without time zone,
    "workflowStep" public."WorkflowStep" DEFAULT 'RECEIVED'::public."WorkflowStep" NOT NULL,
    "internalNotes" text,
    "customerNotes" text,
    "invoiceNumber" text,
    "finalizedAt" timestamp(3) without time zone,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "warrantyClaimNumber" text,
    "thirdPartyApprovalCode" text,
    "campaignId" text,
    "servicePackageId" text,
    "customerSignature" text,
    "customerFeedback" text
);


ALTER TABLE public."WorkOrder" OWNER TO postgres;

--
-- Name: WorkOrderApproval; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WorkOrderApproval" (
    id text NOT NULL,
    "workOrderId" text NOT NULL,
    "estimateId" text,
    status public."ApprovalStatus" NOT NULL,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "approvedById" text,
    method public."ApprovalMethod",
    notes text,
    "customerSignature" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."WorkOrderApproval" OWNER TO postgres;

--
-- Name: WorkOrderAttachment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WorkOrderAttachment" (
    id text NOT NULL,
    "workOrderId" text NOT NULL,
    "fileUrl" text NOT NULL,
    "fileName" text,
    "fileType" text NOT NULL,
    "fileSize" integer,
    description text,
    category public."AttachmentCategory" DEFAULT 'GENERAL'::public."AttachmentCategory" NOT NULL,
    "uploadedById" text,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."WorkOrderAttachment" OWNER TO postgres;

--
-- Name: WorkOrderEstimate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WorkOrderEstimate" (
    id text NOT NULL,
    "workOrderId" text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    description text,
    "totalAmount" numeric(10,2) NOT NULL,
    "laborAmount" numeric(10,2),
    "partsAmount" numeric(10,2),
    "taxAmount" numeric(10,2),
    "discountAmount" numeric(10,2),
    notes text,
    "isVisibleToCustomer" boolean DEFAULT false NOT NULL,
    "createdById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    approved boolean DEFAULT false NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "approvedById" text
);


ALTER TABLE public."WorkOrderEstimate" OWNER TO postgres;

--
-- Name: WorkOrderInspection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WorkOrderInspection" (
    id text NOT NULL,
    "workOrderId" text NOT NULL,
    "inspectorId" text,
    "templateId" text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    "isCompleted" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."WorkOrderInspection" OWNER TO postgres;

--
-- Name: WorkOrderInspectionAttachment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WorkOrderInspectionAttachment" (
    id text NOT NULL,
    "inspectionId" text NOT NULL,
    "fileUrl" text NOT NULL,
    "fileName" text,
    "fileType" text,
    "fileSize" integer,
    description text,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."WorkOrderInspectionAttachment" OWNER TO postgres;

--
-- Name: WorkOrderLabor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WorkOrderLabor" (
    id text NOT NULL,
    "workOrderId" text NOT NULL,
    "laborCatalogId" text,
    description text NOT NULL,
    hours numeric(5,2) NOT NULL,
    rate numeric(10,2) NOT NULL,
    "technicianId" text,
    subtotal numeric(10,2) NOT NULL,
    "startTime" timestamp(3) without time zone,
    "endTime" timestamp(3) without time zone,
    status public."ServiceStatus" DEFAULT 'PENDING'::public."ServiceStatus" NOT NULL,
    notes text,
    "cannedServiceId" text,
    "serviceDiscountAmount" numeric(10,2),
    "serviceDiscountType" public."ServiceDiscountType",
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."WorkOrderLabor" OWNER TO postgres;

--
-- Name: WorkOrderPart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WorkOrderPart" (
    id text NOT NULL,
    "workOrderId" text NOT NULL,
    "inventoryItemId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    source public."PartSource" DEFAULT 'INVENTORY'::public."PartSource" NOT NULL,
    "supplierName" text,
    "supplierInvoice" text,
    "warrantyInfo" text,
    notes text,
    "installedAt" timestamp(3) without time zone,
    "installedById" text,
    "cannedServiceId" text,
    "serviceDiscountAmount" numeric(10,2),
    "serviceDiscountType" public."ServiceDiscountType",
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."WorkOrderPart" OWNER TO postgres;

--
-- Name: WorkOrderQC; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WorkOrderQC" (
    id text NOT NULL,
    "workOrderId" text NOT NULL,
    passed boolean NOT NULL,
    "inspectorId" text,
    notes text,
    "qcDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "reworkRequired" boolean DEFAULT false NOT NULL,
    "reworkNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."WorkOrderQC" OWNER TO postgres;

--
-- Name: WorkOrderService; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WorkOrderService" (
    id text NOT NULL,
    "workOrderId" text NOT NULL,
    "cannedServiceId" text NOT NULL,
    description text,
    quantity integer DEFAULT 1 NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    status public."ServiceStatus" DEFAULT 'PENDING'::public."ServiceStatus" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."WorkOrderService" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: messages_2025_10_03; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_10_03 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_10_03 OWNER TO supabase_admin;

--
-- Name: messages_2025_10_04; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_10_04 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_10_04 OWNER TO supabase_admin;

--
-- Name: messages_2025_10_05; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_10_05 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_10_05 OWNER TO supabase_admin;

--
-- Name: messages_2025_10_06; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_10_06 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_10_06 OWNER TO supabase_admin;

--
-- Name: messages_2025_10_07; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_10_07 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_10_07 OWNER TO supabase_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: iceberg_namespaces; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.iceberg_namespaces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.iceberg_namespaces OWNER TO supabase_storage_admin;

--
-- Name: iceberg_tables; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.iceberg_tables (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    namespace_id uuid NOT NULL,
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    location text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.iceberg_tables OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE storage.prefixes OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: hooks; Type: TABLE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE TABLE supabase_functions.hooks (
    id bigint NOT NULL,
    hook_table_id integer NOT NULL,
    hook_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    request_id bigint
);


ALTER TABLE supabase_functions.hooks OWNER TO supabase_functions_admin;

--
-- Name: TABLE hooks; Type: COMMENT; Schema: supabase_functions; Owner: supabase_functions_admin
--

COMMENT ON TABLE supabase_functions.hooks IS 'Supabase Functions Hooks: Audit trail for triggered hooks.';


--
-- Name: hooks_id_seq; Type: SEQUENCE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE SEQUENCE supabase_functions.hooks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE supabase_functions.hooks_id_seq OWNER TO supabase_functions_admin;

--
-- Name: hooks_id_seq; Type: SEQUENCE OWNED BY; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER SEQUENCE supabase_functions.hooks_id_seq OWNED BY supabase_functions.hooks.id;


--
-- Name: migrations; Type: TABLE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE TABLE supabase_functions.migrations (
    version text NOT NULL,
    inserted_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE supabase_functions.migrations OWNER TO supabase_functions_admin;

--
-- Name: messages_2025_10_03; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_10_03 FOR VALUES FROM ('2025-10-03 00:00:00') TO ('2025-10-04 00:00:00');


--
-- Name: messages_2025_10_04; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_10_04 FOR VALUES FROM ('2025-10-04 00:00:00') TO ('2025-10-05 00:00:00');


--
-- Name: messages_2025_10_05; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_10_05 FOR VALUES FROM ('2025-10-05 00:00:00') TO ('2025-10-06 00:00:00');


--
-- Name: messages_2025_10_06; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_10_06 FOR VALUES FROM ('2025-10-06 00:00:00') TO ('2025-10-07 00:00:00');


--
-- Name: messages_2025_10_07; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_10_07 FOR VALUES FROM ('2025-10-07 00:00:00') TO ('2025-10-08 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: hooks id; Type: DEFAULT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.hooks ALTER COLUMN id SET DEFAULT nextval('supabase_functions.hooks_id_seq'::regclass);


--
-- Data for Name: extensions; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.extensions (id, type, settings, tenant_external_id, inserted_at, updated_at) FROM stdin;
997f7bbb-a73a-470d-b005-f867cea3a24c	postgres_cdc_rls	{"region": "us-east-1", "db_host": "HHTYdudcH7MN4OniIQdHZWuSMO8LjuMksACwc6e2dA8=", "db_name": "sWBpZNdjggEPTQVlI52Zfw==", "db_port": "+enMDFi1J/3IrrquHHwUmA==", "db_user": "uxbEq/zz8DXVD53TOI1zmw==", "slot_name": "supabase_realtime_replication_slot", "db_password": "sWBpZNdjggEPTQVlI52Zfw==", "publication": "supabase_realtime", "ssl_enforced": false, "poll_interval_ms": 100, "poll_max_changes": 100, "poll_max_record_bytes": 1048576}	realtime-dev	2025-10-04 14:37:51	2025-10-04 14:37:51
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.schema_migrations (version, inserted_at) FROM stdin;
20210706140551	2025-07-18 13:39:49
20220329161857	2025-07-18 13:39:49
20220410212326	2025-07-18 13:39:49
20220506102948	2025-07-18 13:39:49
20220527210857	2025-07-18 13:39:49
20220815211129	2025-07-18 13:39:49
20220815215024	2025-07-18 13:39:49
20220818141501	2025-07-18 13:39:49
20221018173709	2025-07-18 13:39:49
20221102172703	2025-07-18 13:39:49
20221223010058	2025-07-18 13:39:49
20230110180046	2025-07-18 13:39:49
20230810220907	2025-07-18 13:39:49
20230810220924	2025-07-18 13:39:49
20231024094642	2025-07-18 13:39:49
20240306114423	2025-07-18 13:39:49
20240418082835	2025-07-18 13:39:49
20240625211759	2025-07-18 13:39:49
20240704172020	2025-07-18 13:39:49
20240902173232	2025-07-18 13:39:49
20241106103258	2025-07-18 13:39:49
20250424203323	2025-07-18 13:39:49
20250613072131	2025-07-18 13:39:49
20250711044927	2025-07-18 13:39:49
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.tenants (id, name, external_id, jwt_secret, max_concurrent_users, inserted_at, updated_at, max_events_per_second, postgres_cdc_default, max_bytes_per_second, max_channels_per_client, max_joins_per_second, suspend, jwt_jwks, notify_private_alpha, private_only, migrations_ran, broadcast_adapter) FROM stdin;
9a86b30c-7562-46d2-9532-ed87a3e864af	realtime-dev	realtime-dev	iNjicxc4+llvc9wovDvqymwfnj9teWMlyOIbJ8Fh6j2WNU8CIJ2ZgjR6MUIKqSmeDmvpsKLsZ9jgXJmQPpwL8w==	200	2025-10-04 14:37:51	2025-10-04 14:37:51	100	postgres_cdc_rls	100000	100	100	f	{"keys": [{"k": "c3VwZXItc2VjcmV0LWp3dC10b2tlbi13aXRoLWF0LWxlYXN0LTMyLWNoYXJhY3RlcnMtbG9uZw", "kty": "oct"}]}	f	f	62	gen_rpc
\.


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	be6e3afe-430c-4689-a46d-c76b691a83f1	{"action":"user_signedup","actor_id":"a5f298da-c164-4cc6-9b01-d5ca5e57210e","actor_username":"test@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-01 22:12:00.379169+00	
00000000-0000-0000-0000-000000000000	d675170e-3336-49f3-8ccb-72878c29c93d	{"action":"login","actor_id":"a5f298da-c164-4cc6-9b01-d5ca5e57210e","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-01 22:12:00.385215+00	
00000000-0000-0000-0000-000000000000	33312152-be93-4994-a86d-26ff63362ec9	{"action":"login","actor_id":"a5f298da-c164-4cc6-9b01-d5ca5e57210e","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-01 22:15:21.292963+00	
00000000-0000-0000-0000-000000000000	dbe9e120-1873-44c9-adcd-68e5e10e5a8e	{"action":"user_signedup","actor_id":"56d4e667-3542-43e1-ad44-a31f00e06cba","actor_username":"test-1754231677597@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-03 14:34:37.764351+00	
00000000-0000-0000-0000-000000000000	33b6ab05-c465-40bc-9f11-4eb7ee4594bd	{"action":"login","actor_id":"56d4e667-3542-43e1-ad44-a31f00e06cba","actor_username":"test-1754231677597@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-03 14:34:37.771008+00	
00000000-0000-0000-0000-000000000000	2639c073-c8c9-4acb-bbcb-2fc026c34252	{"action":"login","actor_id":"56d4e667-3542-43e1-ad44-a31f00e06cba","actor_username":"test-1754231677597@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-03 14:34:37.848911+00	
00000000-0000-0000-0000-000000000000	e064fc6e-71dd-42e3-8325-e3fb21578307	{"action":"token_refreshed","actor_id":"56d4e667-3542-43e1-ad44-a31f00e06cba","actor_username":"test-1754231677597@example.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 20:48:56.588889+00	
00000000-0000-0000-0000-000000000000	e5e2607c-7520-4033-b631-d62d6b1b4d39	{"action":"token_revoked","actor_id":"56d4e667-3542-43e1-ad44-a31f00e06cba","actor_username":"test-1754231677597@example.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 20:48:56.59043+00	
00000000-0000-0000-0000-000000000000	5fc64899-483b-4071-a604-04e77df3fb7c	{"action":"token_refreshed","actor_id":"56d4e667-3542-43e1-ad44-a31f00e06cba","actor_username":"test-1754231677597@example.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 21:46:57.271231+00	
00000000-0000-0000-0000-000000000000	1a014081-7b38-405c-a7bb-2dc3a446690c	{"action":"token_revoked","actor_id":"56d4e667-3542-43e1-ad44-a31f00e06cba","actor_username":"test-1754231677597@example.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 21:46:57.273434+00	
00000000-0000-0000-0000-000000000000	3d90c173-fdfc-4880-a856-4742f50e2d6c	{"action":"user_signedup","actor_id":"ce8b5427-ed91-44c2-a4b2-200f26ba9da4","actor_username":"test-1754258164186@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-03 21:56:04.37472+00	
00000000-0000-0000-0000-000000000000	ef3ef1d3-7914-4b6b-ade4-e855c7ca80b4	{"action":"login","actor_id":"ce8b5427-ed91-44c2-a4b2-200f26ba9da4","actor_username":"test-1754258164186@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-03 21:56:04.377987+00	
00000000-0000-0000-0000-000000000000	4d8f294a-264b-4753-a501-cc7d9ca132b1	{"action":"login","actor_id":"ce8b5427-ed91-44c2-a4b2-200f26ba9da4","actor_username":"test-1754258164186@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-03 21:56:04.453555+00	
00000000-0000-0000-0000-000000000000	6e6306e3-3aad-48cd-86b9-af8f9a26fb4d	{"action":"user_signedup","actor_id":"7a6b3d94-8b6d-4784-b075-a21cf8fb7130","actor_username":"test-1754258552256@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-03 22:02:31.827321+00	
00000000-0000-0000-0000-000000000000	845e1ab5-e774-4cf2-a93e-e1b760907168	{"action":"login","actor_id":"7a6b3d94-8b6d-4784-b075-a21cf8fb7130","actor_username":"test-1754258552256@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-03 22:02:31.830227+00	
00000000-0000-0000-0000-000000000000	ab0b9a1a-cb4e-4446-81c0-159ae0c99c6a	{"action":"login","actor_id":"7a6b3d94-8b6d-4784-b075-a21cf8fb7130","actor_username":"test-1754258552256@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-03 22:02:31.902547+00	
00000000-0000-0000-0000-000000000000	6390bd0f-3f16-4017-becc-3f9a8a5c42a0	{"action":"logout","actor_id":"7a6b3d94-8b6d-4784-b075-a21cf8fb7130","actor_username":"test-1754258552256@example.com","actor_via_sso":false,"log_type":"account"}	2025-08-03 22:02:31.986667+00	
00000000-0000-0000-0000-000000000000	f1fc586c-3ca4-44da-94f8-53455bff1908	{"action":"user_signedup","actor_id":"c9b59ad2-40b2-482e-816c-0bcbf5379eb5","actor_username":"plswork@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-03 23:12:07.47889+00	
00000000-0000-0000-0000-000000000000	c05a928a-771c-490e-a123-8bbe1b7d2bf8	{"action":"login","actor_id":"c9b59ad2-40b2-482e-816c-0bcbf5379eb5","actor_username":"plswork@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-03 23:12:07.486839+00	
00000000-0000-0000-0000-000000000000	64805c93-e3eb-44ef-8352-9beff001412e	{"action":"login","actor_id":"c9b59ad2-40b2-482e-816c-0bcbf5379eb5","actor_username":"plswork@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-03 23:12:22.688158+00	
00000000-0000-0000-0000-000000000000	49829a34-6526-471b-963d-4e334be1f281	{"action":"login","actor_id":"c9b59ad2-40b2-482e-816c-0bcbf5379eb5","actor_username":"plswork@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-03 23:27:16.369216+00	
00000000-0000-0000-0000-000000000000	11ca93c3-291f-47bf-b77d-3da6793357b1	{"action":"login","actor_id":"c9b59ad2-40b2-482e-816c-0bcbf5379eb5","actor_username":"plswork@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-03 23:31:40.077532+00	
00000000-0000-0000-0000-000000000000	c7028057-2f07-4495-97da-b27a7410f125	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"test-1754258164186@example.com","user_id":"ce8b5427-ed91-44c2-a4b2-200f26ba9da4","user_phone":""}}	2025-08-04 00:01:47.264971+00	
00000000-0000-0000-0000-000000000000	846b8d18-a12c-4136-92db-c98512b511ca	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"test-1754231677597@example.com","user_id":"56d4e667-3542-43e1-ad44-a31f00e06cba","user_phone":""}}	2025-08-04 00:01:47.273951+00	
00000000-0000-0000-0000-000000000000	cd1393f6-7529-4d83-9bcd-f421c70f175f	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"test@example.com","user_id":"a5f298da-c164-4cc6-9b01-d5ca5e57210e","user_phone":""}}	2025-08-04 00:01:47.274201+00	
00000000-0000-0000-0000-000000000000	13a9400d-b553-431e-8021-d7fc84a0757d	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"test-1754258552256@example.com","user_id":"7a6b3d94-8b6d-4784-b075-a21cf8fb7130","user_phone":""}}	2025-08-04 00:01:47.274547+00	
00000000-0000-0000-0000-000000000000	af418dcd-c929-47f5-bd61-a0ba7d177ec9	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"plswork@gmail.com","user_id":"c9b59ad2-40b2-482e-816c-0bcbf5379eb5","user_phone":""}}	2025-08-04 00:01:47.281847+00	
00000000-0000-0000-0000-000000000000	d9f5e12a-b198-4157-b0b8-e7e5be65a6c7	{"action":"user_signedup","actor_id":"9eed41d3-5058-4372-bbaa-1bafa9eaf46c","actor_username":"test-1754265918880@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-04 00:05:18.853199+00	
00000000-0000-0000-0000-000000000000	3a20e71a-e4a9-411f-93c1-b3b8beaf1e8e	{"action":"login","actor_id":"9eed41d3-5058-4372-bbaa-1bafa9eaf46c","actor_username":"test-1754265918880@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-04 00:05:18.857967+00	
00000000-0000-0000-0000-000000000000	c0162218-c745-48cc-b28c-3f477e8bf5b9	{"action":"login","actor_id":"9eed41d3-5058-4372-bbaa-1bafa9eaf46c","actor_username":"test-1754265918880@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-04 00:05:18.946313+00	
00000000-0000-0000-0000-000000000000	405a111b-12ec-4205-9a75-c9ee410897d9	{"action":"logout","actor_id":"9eed41d3-5058-4372-bbaa-1bafa9eaf46c","actor_username":"test-1754265918880@example.com","actor_via_sso":false,"log_type":"account"}	2025-08-04 00:05:19.057128+00	
00000000-0000-0000-0000-000000000000	92df87b5-02b4-4680-9069-ce06057e9230	{"action":"user_signedup","actor_id":"4f362ead-4f03-4839-bab9-f23aeef4a3ac","actor_username":"test-onboarding-1754266113840@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-04 00:08:33.500824+00	
00000000-0000-0000-0000-000000000000	35f77561-380e-457b-82eb-aaa32b1a2b4b	{"action":"login","actor_id":"4f362ead-4f03-4839-bab9-f23aeef4a3ac","actor_username":"test-onboarding-1754266113840@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-04 00:08:33.503879+00	
00000000-0000-0000-0000-000000000000	0cc65035-7c5e-4180-9cad-2f6581a12e01	{"action":"login","actor_id":"4f362ead-4f03-4839-bab9-f23aeef4a3ac","actor_username":"test-onboarding-1754266113840@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-04 00:08:33.56937+00	
00000000-0000-0000-0000-000000000000	e2fdb103-12b8-449e-b9a8-eeb41c4356a4	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"admin@motortrace.com","user_id":"3cf09af1-f357-4f0a-953d-4e160e2fae1b","user_phone":""}}	2025-08-04 19:55:02.232237+00	
00000000-0000-0000-0000-000000000000	6a9635be-9a40-4734-b3d4-a7d30a275593	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"manager@motortrace.com","user_id":"2438b359-ff02-4907-a3bc-9834440e928c","user_phone":""}}	2025-08-04 19:55:02.351616+00	
00000000-0000-0000-0000-000000000000	452d7733-4339-4058-bc3b-aff3b9a4e967	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"advisor@motortrace.com","user_id":"77c87a92-1cb6-48d3-a5d5-c90316089873","user_phone":""}}	2025-08-04 19:55:02.42866+00	
00000000-0000-0000-0000-000000000000	31d20245-4dfb-4df2-9b6c-3ae04ee1b45d	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"inventory@motortrace.com","user_id":"bd7c593c-59c7-4a74-afc9-5972d793a335","user_phone":""}}	2025-08-04 19:55:02.499393+00	
00000000-0000-0000-0000-000000000000	111c884c-61b0-4606-9d67-02749379ae47	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"technician@motortrace.com","user_id":"c8f6de01-fd61-498f-8dea-e4dfdf495376","user_phone":""}}	2025-08-04 19:55:02.570214+00	
00000000-0000-0000-0000-000000000000	d00d52db-0abd-4da9-9ee5-3a92dff48c9e	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"customer@motortrace.com","user_id":"60ba5fee-26ae-477b-a0ab-f020e5c3d234","user_phone":""}}	2025-08-04 19:55:02.642544+00	
00000000-0000-0000-0000-000000000000	361bbb52-f37e-427e-af0c-f89364121064	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"customer@motortrace.com","user_id":"60ba5fee-26ae-477b-a0ab-f020e5c3d234","user_phone":""}}	2025-08-16 16:14:38.023559+00	
00000000-0000-0000-0000-000000000000	283616a0-1dd8-46c1-b4ae-0363af99a854	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"technician@motortrace.com","user_id":"c8f6de01-fd61-498f-8dea-e4dfdf495376","user_phone":""}}	2025-08-16 16:14:38.03951+00	
00000000-0000-0000-0000-000000000000	40feeecb-2c2c-4fb1-bf79-bce8d54238ad	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"test-1754265918880@example.com","user_id":"9eed41d3-5058-4372-bbaa-1bafa9eaf46c","user_phone":""}}	2025-08-16 16:14:38.038287+00	
00000000-0000-0000-0000-000000000000	77783697-5fe7-44e3-85ae-6c7c24bf1c93	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"advisor@motortrace.com","user_id":"77c87a92-1cb6-48d3-a5d5-c90316089873","user_phone":""}}	2025-08-16 16:14:38.04348+00	
00000000-0000-0000-0000-000000000000	63467a71-895c-4b42-b116-4df40a7fb782	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"manager@motortrace.com","user_id":"2438b359-ff02-4907-a3bc-9834440e928c","user_phone":""}}	2025-08-16 16:14:38.043991+00	
00000000-0000-0000-0000-000000000000	9ad0b0b6-f174-4dca-a2e6-bc00edf60fb3	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"inventory@motortrace.com","user_id":"bd7c593c-59c7-4a74-afc9-5972d793a335","user_phone":""}}	2025-08-16 16:14:38.04399+00	
00000000-0000-0000-0000-000000000000	e06c92e3-7089-4eb5-b5eb-820c31df4f9d	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"admin@motortrace.com","user_id":"3cf09af1-f357-4f0a-953d-4e160e2fae1b","user_phone":""}}	2025-08-16 16:14:38.058582+00	
00000000-0000-0000-0000-000000000000	0c0496e4-bdee-4a66-a1ef-c21d53f9c94e	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"test-onboarding-1754266113840@example.com","user_id":"4f362ead-4f03-4839-bab9-f23aeef4a3ac","user_phone":""}}	2025-08-16 16:14:38.058791+00	
00000000-0000-0000-0000-000000000000	be3c77e7-e8e2-4756-81bd-7198e233b675	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"admin@motortrace.com","user_id":"385a10fe-7a72-44cf-ba01-746c7f05d7a1","user_phone":""}}	2025-08-16 16:14:43.583184+00	
00000000-0000-0000-0000-000000000000	010d2196-30e7-45a3-9b46-8ddf899eaf5a	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"manager@motortrace.com","user_id":"03b38fc5-b05f-4999-8880-40d616822d7f","user_phone":""}}	2025-08-16 16:14:43.681396+00	
00000000-0000-0000-0000-000000000000	bf7bef71-2031-4365-acf6-9eb10068a7ed	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"advisor@motortrace.com","user_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","user_phone":""}}	2025-08-16 16:14:43.749235+00	
00000000-0000-0000-0000-000000000000	4bab02d1-0e8a-4eee-b58b-08b72ecff1ea	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"inventory@motortrace.com","user_id":"6a2a3ac0-8191-4a76-b2ea-cfa84c474fb3","user_phone":""}}	2025-08-16 16:14:43.817759+00	
00000000-0000-0000-0000-000000000000	17c9e65a-dded-4597-9004-c916051d88fb	{"action":"login","actor_id":"0b9f8b4c-2a80-4846-87cb-3bf05f0121cb","actor_username":"abdulla123@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 13:22:35.723724+00	
00000000-0000-0000-0000-000000000000	a0975872-7010-4410-9c66-7e6c056d7e41	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"technician@motortrace.com","user_id":"c1f6d878-70fd-48b3-8c43-4b80df50ca2f","user_phone":""}}	2025-08-16 16:14:43.886508+00	
00000000-0000-0000-0000-000000000000	543c3ed4-7327-45cf-aaff-a3af9dc940d8	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"customer@motortrace.com","user_id":"31362d65-5571-4686-8e3a-78a51860e3d0","user_phone":""}}	2025-08-16 16:14:43.953338+00	
00000000-0000-0000-0000-000000000000	33569c4e-794b-4cd4-ba9d-83150a6268fb	{"action":"login","actor_id":"31362d65-5571-4686-8e3a-78a51860e3d0","actor_username":"customer@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-18 02:40:03.442486+00	
00000000-0000-0000-0000-000000000000	1493510e-1f4b-45f0-aa74-cefe9e6fbd09	{"action":"logout","actor_id":"31362d65-5571-4686-8e3a-78a51860e3d0","actor_username":"customer@motortrace.com","actor_via_sso":false,"log_type":"account"}	2025-08-18 02:44:00.576347+00	
00000000-0000-0000-0000-000000000000	d653ad63-7a02-48ff-ba83-e38b0bef7cfa	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-18 02:46:15.05578+00	
00000000-0000-0000-0000-000000000000	0cb5212f-ce6d-44bb-bed3-715655febd69	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-18 17:33:48.248712+00	
00000000-0000-0000-0000-000000000000	a13c6ce6-837e-4fa1-8f12-b943edeab486	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 18:31:52.529249+00	
00000000-0000-0000-0000-000000000000	715680ba-e4af-441d-812a-912c9d698b42	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 18:31:52.530008+00	
00000000-0000-0000-0000-000000000000	d75d11b7-6dc8-4cc6-b9fc-19fb965dd8ae	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-18 21:56:15.30889+00	
00000000-0000-0000-0000-000000000000	742aa2aa-4131-4eff-87ec-10f34f649b6f	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 22:54:35.346389+00	
00000000-0000-0000-0000-000000000000	96402329-f1d7-41e5-b2e1-ae711fb6b8fd	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 22:54:35.347655+00	
00000000-0000-0000-0000-000000000000	cf91c713-a71b-4009-aaf9-d0f4beeef08b	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-18 23:15:07.227872+00	
00000000-0000-0000-0000-000000000000	98f71efa-8357-4061-ae3f-610fc8025c83	{"action":"login","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-19 03:58:27.508165+00	
00000000-0000-0000-0000-000000000000	1178f61d-ff7b-41c0-ba01-7e5e45684108	{"action":"logout","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account"}	2025-08-19 04:21:40.451456+00	
00000000-0000-0000-0000-000000000000	ec7fa5b6-b9fc-45ae-b1c0-e6114d0d2bd4	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-19 04:22:04.854068+00	
00000000-0000-0000-0000-000000000000	c2569922-c6b4-4d7c-94b9-89b1c4ff50e8	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 06:15:24.080097+00	
00000000-0000-0000-0000-000000000000	ffe16bc2-cd23-4d33-b319-50cd297d70be	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 06:15:24.095441+00	
00000000-0000-0000-0000-000000000000	9f423e0d-8afd-48fc-8b5e-58274de20c33	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-19 18:07:02.651781+00	
00000000-0000-0000-0000-000000000000	e0481832-2c81-4127-bd9f-8646d2c11e59	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-27 06:29:37.318208+00	
00000000-0000-0000-0000-000000000000	08290d3c-b94b-4b5f-8ad9-d479da984c74	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-30 19:11:04.79094+00	
00000000-0000-0000-0000-000000000000	e099785d-6cf8-48ea-af32-b35766eeeae5	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 07:51:26.809114+00	
00000000-0000-0000-0000-000000000000	be7cec2d-cd1c-4c21-8209-08645b11945e	{"action":"logout","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account"}	2025-09-04 07:56:59.450288+00	
00000000-0000-0000-0000-000000000000	da8de1ec-606c-4236-a64e-bc0ee2baf7db	{"action":"login","actor_id":"385a10fe-7a72-44cf-ba01-746c7f05d7a1","actor_username":"admin@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 07:57:49.547968+00	
00000000-0000-0000-0000-000000000000	faa9cefe-d770-4bca-a1f3-21fcb4b97974	{"action":"logout","actor_id":"385a10fe-7a72-44cf-ba01-746c7f05d7a1","actor_username":"admin@motortrace.com","actor_via_sso":false,"log_type":"account"}	2025-09-04 07:59:19.209448+00	
00000000-0000-0000-0000-000000000000	15fba326-3b92-4635-a552-c3dfd953d0b0	{"action":"user_signedup","actor_id":"0b9f8b4c-2a80-4846-87cb-3bf05f0121cb","actor_username":"abdulla123@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-04 08:00:37.227301+00	
00000000-0000-0000-0000-000000000000	7c0bc67c-9828-4e95-b16b-a15901ca0ee8	{"action":"login","actor_id":"0b9f8b4c-2a80-4846-87cb-3bf05f0121cb","actor_username":"abdulla123@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 08:00:37.23122+00	
00000000-0000-0000-0000-000000000000	46805ee3-a36b-44f4-aeb1-ba4ed8433191	{"action":"login","actor_id":"0b9f8b4c-2a80-4846-87cb-3bf05f0121cb","actor_username":"abdulla123@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 08:06:46.464526+00	
00000000-0000-0000-0000-000000000000	b204b288-8df9-49d6-be39-d4eddaff1314	{"action":"logout","actor_id":"0b9f8b4c-2a80-4846-87cb-3bf05f0121cb","actor_username":"abdulla123@example.com","actor_via_sso":false,"log_type":"account"}	2025-09-04 08:08:06.446097+00	
00000000-0000-0000-0000-000000000000	3dd30cb3-aa1d-44aa-9c9d-b1bb99f36ac7	{"action":"login","actor_id":"385a10fe-7a72-44cf-ba01-746c7f05d7a1","actor_username":"admin@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 08:10:55.66104+00	
00000000-0000-0000-0000-000000000000	f89d4c4c-c8fc-47d8-97e0-da3443041dda	{"action":"login","actor_id":"0b9f8b4c-2a80-4846-87cb-3bf05f0121cb","actor_username":"abdulla123@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 13:02:59.82822+00	
00000000-0000-0000-0000-000000000000	1736a60c-b8b8-4f29-a639-4379d046fc2e	{"action":"login","actor_id":"0b9f8b4c-2a80-4846-87cb-3bf05f0121cb","actor_username":"abdulla123@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 13:28:17.556406+00	
00000000-0000-0000-0000-000000000000	316f5ae7-1e2f-45a5-9555-370bbfbb2122	{"action":"logout","actor_id":"0b9f8b4c-2a80-4846-87cb-3bf05f0121cb","actor_username":"abdulla123@example.com","actor_via_sso":false,"log_type":"account"}	2025-09-04 13:29:00.512406+00	
00000000-0000-0000-0000-000000000000	1237b16f-3775-420c-800f-4fc5d53a7bac	{"action":"login","actor_id":"385a10fe-7a72-44cf-ba01-746c7f05d7a1","actor_username":"admin@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 13:36:42.959043+00	
00000000-0000-0000-0000-000000000000	305abe34-0211-49f1-a7b7-bd0c1876d377	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 13:37:24.257302+00	
00000000-0000-0000-0000-000000000000	ee02baa8-66d9-4e84-8182-0fcc7457bcb6	{"action":"login","actor_id":"0b9f8b4c-2a80-4846-87cb-3bf05f0121cb","actor_username":"abdulla123@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 14:18:36.893492+00	
00000000-0000-0000-0000-000000000000	38b9a83c-0065-48c8-b711-cec86e2abe6c	{"action":"login","actor_id":"0b9f8b4c-2a80-4846-87cb-3bf05f0121cb","actor_username":"abdulla123@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 14:19:25.752137+00	
00000000-0000-0000-0000-000000000000	91eaeaf1-2e0b-41ab-940c-457f19137a28	{"action":"token_refreshed","actor_id":"0b9f8b4c-2a80-4846-87cb-3bf05f0121cb","actor_username":"abdulla123@example.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 15:17:48.07534+00	
00000000-0000-0000-0000-000000000000	bbfdf624-503f-40d2-94eb-0ef141c2e0d8	{"action":"token_revoked","actor_id":"0b9f8b4c-2a80-4846-87cb-3bf05f0121cb","actor_username":"abdulla123@example.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 15:17:48.076521+00	
00000000-0000-0000-0000-000000000000	2d9795d4-aeb3-4c7e-b371-3e857429c074	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 15:42:40.940226+00	
00000000-0000-0000-0000-000000000000	d1963282-7ba8-44a4-8949-86f8f64050e7	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-09 16:30:47.991343+00	
00000000-0000-0000-0000-000000000000	d5096807-55f8-4177-a1e6-2b2aa23df174	{"action":"logout","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account"}	2025-09-09 16:32:32.526403+00	
00000000-0000-0000-0000-000000000000	6e99d9a1-9d23-4a42-b4bc-822433eab7d5	{"action":"login","actor_id":"0b9f8b4c-2a80-4846-87cb-3bf05f0121cb","actor_username":"abdulla123@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-09 16:32:47.095875+00	
00000000-0000-0000-0000-000000000000	1a82cecf-7775-449b-b491-fe754e982ac6	{"action":"logout","actor_id":"0b9f8b4c-2a80-4846-87cb-3bf05f0121cb","actor_username":"abdulla123@example.com","actor_via_sso":false,"log_type":"account"}	2025-09-09 16:33:12.556557+00	
00000000-0000-0000-0000-000000000000	cec4c66c-04e2-4930-902e-338b861b6667	{"action":"login","actor_id":"0b9f8b4c-2a80-4846-87cb-3bf05f0121cb","actor_username":"abdulla123@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 08:18:41.374486+00	
00000000-0000-0000-0000-000000000000	98003fc7-e835-4060-9c71-8d0ba6185750	{"action":"login","actor_id":"0b9f8b4c-2a80-4846-87cb-3bf05f0121cb","actor_username":"abdulla123@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 10:05:13.013049+00	
00000000-0000-0000-0000-000000000000	f22afef2-0d28-427c-8e7d-f03a485c99c9	{"action":"logout","actor_id":"0b9f8b4c-2a80-4846-87cb-3bf05f0121cb","actor_username":"abdulla123@example.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 10:05:15.361051+00	
00000000-0000-0000-0000-000000000000	43b42a28-3b0a-4819-a0e6-8f829a8da8e8	{"action":"login","actor_id":"0b9f8b4c-2a80-4846-87cb-3bf05f0121cb","actor_username":"abdulla123@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 10:05:17.626701+00	
00000000-0000-0000-0000-000000000000	738fbc1b-85e4-49b5-9e60-44cc62252948	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"abdulla123@example.com","user_id":"0b9f8b4c-2a80-4846-87cb-3bf05f0121cb","user_phone":""}}	2025-09-10 10:10:24.696343+00	
00000000-0000-0000-0000-000000000000	3f195a04-e2a9-4e6d-8a2f-d8b165de26dd	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"abdulla123@example.com","user_id":"0b9f8b4c-2a80-4846-87cb-3bf05f0121cb","user_phone":""}}	2025-09-10 10:11:32.548838+00	
00000000-0000-0000-0000-000000000000	d01f6b2b-e3af-4920-a5a2-1c2b62e8445a	{"action":"token_refreshed","actor_id":"0b9f8b4c-2a80-4846-87cb-3bf05f0121cb","actor_username":"abdulla123@example.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 11:04:56.153096+00	
00000000-0000-0000-0000-000000000000	caf0bade-2aab-44fe-948f-d76fb8de9d4f	{"action":"token_revoked","actor_id":"0b9f8b4c-2a80-4846-87cb-3bf05f0121cb","actor_username":"abdulla123@example.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 11:04:56.157574+00	
00000000-0000-0000-0000-000000000000	8a4a2e0b-0aea-4d4f-9ecd-e685a778ae79	{"action":"login","actor_id":"385a10fe-7a72-44cf-ba01-746c7f05d7a1","actor_username":"admin@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 11:06:47.059731+00	
00000000-0000-0000-0000-000000000000	0c52e96b-0b90-40b9-8ecf-e12804f58d5e	{"action":"login","actor_id":"385a10fe-7a72-44cf-ba01-746c7f05d7a1","actor_username":"admin@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 12:26:54.860376+00	
00000000-0000-0000-0000-000000000000	56c7cfb7-7d10-4566-a88e-b2d8a74e6233	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 12:33:33.653744+00	
00000000-0000-0000-0000-000000000000	8cc713fa-2bc7-4e11-bde7-ce1397db67f2	{"action":"login","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 12:33:49.027838+00	
00000000-0000-0000-0000-000000000000	390462f8-d149-498a-8834-eb0b9a9c6392	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 12:38:36.147016+00	
00000000-0000-0000-0000-000000000000	864913bc-a889-436f-9c6c-6f6ff51ffa40	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 12:40:17.97058+00	
00000000-0000-0000-0000-000000000000	57d2cdcf-71f8-4cd0-8a58-e99aacd7139c	{"action":"login","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 14:09:44.680869+00	
00000000-0000-0000-0000-000000000000	6b385a43-fd4d-46ff-bd07-0fdeffcbf669	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 14:09:56.566148+00	
00000000-0000-0000-0000-000000000000	f00c426c-ea8c-450a-945b-9472d08a3c77	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 21:24:53.770988+00	
00000000-0000-0000-0000-000000000000	d15b408f-1a3f-44a9-bfda-3ecb4f4b4855	{"action":"login","actor_id":"385a10fe-7a72-44cf-ba01-746c7f05d7a1","actor_username":"admin@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 21:25:19.490182+00	
00000000-0000-0000-0000-000000000000	0aa6814b-901c-4181-9bfd-c1c2d6538430	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 21:30:19.766978+00	
00000000-0000-0000-0000-000000000000	cf43ae49-d288-4470-8d70-8901b92f6d3e	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 22:46:36.707743+00	
00000000-0000-0000-0000-000000000000	7b71b0e0-1504-4f94-88ea-efc5bbae4379	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 23:45:02.470837+00	
00000000-0000-0000-0000-000000000000	52e2b2f4-2859-4cb2-bd1d-d95d7f8078e9	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 23:45:02.472594+00	
00000000-0000-0000-0000-000000000000	6b567596-9eaa-4f2d-ac5d-ead18fde7e9a	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 23:49:57.058609+00	
00000000-0000-0000-0000-000000000000	6df36de1-891d-4d7e-bc96-9e78d41f291f	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 00:48:03.330606+00	
00000000-0000-0000-0000-000000000000	700be895-b31d-4375-b012-61a1ac2e5988	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 00:48:03.331917+00	
00000000-0000-0000-0000-000000000000	44473de2-c1fd-4a0b-a045-9792b352c0dd	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-11 08:48:49.410532+00	
00000000-0000-0000-0000-000000000000	36724a78-00e3-419d-803f-fc0b8ac8a24b	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-11 10:18:21.949253+00	
00000000-0000-0000-0000-000000000000	c5a56ecb-7705-4ea8-afe2-af397b3c31f7	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-11 11:38:10.346109+00	
00000000-0000-0000-0000-000000000000	8c67b665-a377-4e98-8fb2-dce9f72053b3	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-11 11:49:49.870696+00	
00000000-0000-0000-0000-000000000000	937fc3d0-99e8-45b9-b036-16b333a9b80b	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-11 11:51:15.787172+00	
00000000-0000-0000-0000-000000000000	b83c1501-30ed-427b-a02c-e4a1755a8617	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-11 11:52:47.229032+00	
00000000-0000-0000-0000-000000000000	41925774-5cfb-4fdc-9000-be7b3c758c35	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-11 11:53:17.884399+00	
00000000-0000-0000-0000-000000000000	ce0e2b2e-0af6-4925-b108-ce1cec0ac1c5	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-11 11:54:55.684345+00	
00000000-0000-0000-0000-000000000000	149005a6-3e44-4898-8088-26db01153583	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 12:53:02.456613+00	
00000000-0000-0000-0000-000000000000	40cbdf7a-e92e-4f20-a676-183f60fe04db	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 12:53:02.457671+00	
00000000-0000-0000-0000-000000000000	986c3525-1045-46d4-a08a-2a4084c7f8d5	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 13:51:02.831941+00	
00000000-0000-0000-0000-000000000000	32657225-d29a-44c0-8936-e0eb3c1ea217	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 13:51:02.833362+00	
00000000-0000-0000-0000-000000000000	5b2e47d7-ed42-44c7-80e6-ee75345267a1	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-11 14:09:16.217341+00	
00000000-0000-0000-0000-000000000000	32282469-3448-4ef5-b1c4-70ab3ebd121b	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 15:07:38.566443+00	
00000000-0000-0000-0000-000000000000	1dfc8226-f09f-48d1-bab0-97bc10752551	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 15:07:38.568673+00	
00000000-0000-0000-0000-000000000000	da73e258-4b87-4f45-a296-5835f256f818	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-11 15:19:14.900203+00	
00000000-0000-0000-0000-000000000000	f49edb84-3e8f-465c-aa77-7c42105cc10b	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 16:17:39.495275+00	
00000000-0000-0000-0000-000000000000	072955e9-4503-4a8a-9cc6-03d7761239af	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 16:17:39.496562+00	
00000000-0000-0000-0000-000000000000	cc00b944-39cd-46a9-b538-22c9c5064804	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-11 16:26:35.081541+00	
00000000-0000-0000-0000-000000000000	17854cd2-ed13-435d-a9c7-526127fc94f7	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 17:24:39.603165+00	
00000000-0000-0000-0000-000000000000	69d6e26e-8b70-4ab7-ad5c-08e1e85a0a98	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 17:24:39.604554+00	
00000000-0000-0000-0000-000000000000	2d2c32e6-ae33-49c2-9e92-d81960388633	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 18:22:41.026394+00	
00000000-0000-0000-0000-000000000000	566fd5b0-cb5b-4ae8-b08a-9aafa9b45ceb	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 18:22:41.028119+00	
00000000-0000-0000-0000-000000000000	ce6e088e-a6ba-4ea8-b711-575b5c59c8d9	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 19:20:40.62975+00	
00000000-0000-0000-0000-000000000000	27414dcd-b770-4d44-857c-bb293f13f87f	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 19:20:40.631053+00	
00000000-0000-0000-0000-000000000000	cb947430-fbd2-4311-9e7a-5e78a2147e36	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-12 08:28:49.787733+00	
00000000-0000-0000-0000-000000000000	06f4956f-d31f-4645-afae-6ecbe6943400	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-12 09:31:38.161355+00	
00000000-0000-0000-0000-000000000000	f93f5208-9403-410f-859f-1d2887a33561	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-12 11:14:18.595405+00	
00000000-0000-0000-0000-000000000000	d5e4417f-ae4d-4be3-aa41-0dbf881b98fa	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 12:12:44.69915+00	
00000000-0000-0000-0000-000000000000	3aeb19cf-41ac-4a72-bf05-0d66783c81a2	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 12:12:44.701059+00	
00000000-0000-0000-0000-000000000000	bc6203b4-0cb5-45b1-a334-878fb0140083	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-12 12:14:30.225838+00	
00000000-0000-0000-0000-000000000000	7832d499-db6e-4aec-9155-6d2c29fbb4fd	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 13:53:35.413295+00	
00000000-0000-0000-0000-000000000000	cf92347e-cdab-417d-8744-c98171eb4483	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 13:53:35.418517+00	
00000000-0000-0000-0000-000000000000	d2b082e8-144a-495e-8350-ce38f2b24752	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-12 13:54:00.584519+00	
00000000-0000-0000-0000-000000000000	dbce222d-47b4-4e9c-a334-01cacd4c5237	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 14:52:06.1957+00	
00000000-0000-0000-0000-000000000000	a3f7b947-8676-4824-b4ba-b72f16d8e883	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 14:52:06.198064+00	
00000000-0000-0000-0000-000000000000	1f379860-13b1-40b8-ba64-004c7dc096e4	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-12 15:11:39.626263+00	
00000000-0000-0000-0000-000000000000	a38c33d2-cb4d-4731-941f-8f4f19b819db	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-12 15:54:46.150429+00	
00000000-0000-0000-0000-000000000000	db849464-f2dd-4a83-b55c-08315c952dff	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 16:53:07.304314+00	
00000000-0000-0000-0000-000000000000	62fcdaab-3f86-4d24-9481-c2249e281b94	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 16:53:07.306694+00	
00000000-0000-0000-0000-000000000000	f78424db-b2e7-4b2f-82f5-37e7e48f78f7	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-12 17:05:23.317154+00	
00000000-0000-0000-0000-000000000000	69903c22-f649-4cc0-a43f-a9fe1b445975	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 18:43:03.432174+00	
00000000-0000-0000-0000-000000000000	8b8f9c43-5107-4384-b3d9-b224dc7e520f	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 18:43:03.435772+00	
00000000-0000-0000-0000-000000000000	d96ad024-21b0-418c-bf91-80b953a9fb51	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-12 20:21:32.679784+00	
00000000-0000-0000-0000-000000000000	a8792524-17e5-40cd-ae3d-3ce7f2c7680d	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 21:19:35.149467+00	
00000000-0000-0000-0000-000000000000	4b1aea26-4946-4f79-bf74-a39aaa70adbd	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 21:19:35.15097+00	
00000000-0000-0000-0000-000000000000	fad5f8f8-b945-4374-b806-28f8fb75d673	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-12 21:23:54.894665+00	
00000000-0000-0000-0000-000000000000	38330272-ef9a-4756-8c61-fbfbe1ffa8ef	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 07:38:27.142849+00	
00000000-0000-0000-0000-000000000000	bd093a66-24ab-4307-b039-880b98e1f669	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 08:36:32.763115+00	
00000000-0000-0000-0000-000000000000	e5928470-1629-4c8a-9f9c-542e216b7107	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 08:36:32.764102+00	
00000000-0000-0000-0000-000000000000	24364323-3ecb-431a-86f9-b1d81d5095aa	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 08:43:00.093126+00	
00000000-0000-0000-0000-000000000000	9a63acc5-4bdc-421d-a209-003f7b4f9cff	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 09:41:03.567156+00	
00000000-0000-0000-0000-000000000000	8f5f96a9-5afe-407f-9fe7-70beaed7d0f8	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 09:41:03.568461+00	
00000000-0000-0000-0000-000000000000	9d62649c-a246-4dd0-a56e-cb258be59f2f	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 11:12:34.106314+00	
00000000-0000-0000-0000-000000000000	2be34f04-c8d2-4c45-bd30-6498f40b2304	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 11:12:34.109417+00	
00000000-0000-0000-0000-000000000000	e2cafefc-497d-48e5-b2ad-15b2b8fc3c62	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 11:12:49.670649+00	
00000000-0000-0000-0000-000000000000	320196a9-7efb-49c0-bc41-5c49fd1720b7	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 11:21:20.854496+00	
00000000-0000-0000-0000-000000000000	4525db03-e853-4d98-8b29-5588a6ac8efb	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 11:21:47.310709+00	
00000000-0000-0000-0000-000000000000	ec705e77-d60b-4be4-9d94-f45a3e85c7af	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 11:24:13.237874+00	
00000000-0000-0000-0000-000000000000	868d7ca2-0f59-4ed0-9cea-1420fb111aff	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 11:25:29.908417+00	
00000000-0000-0000-0000-000000000000	8a253707-c048-4c84-84b5-285e396d9aee	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 12:23:54.488165+00	
00000000-0000-0000-0000-000000000000	8533876d-7a3b-4b56-ad3d-839e306ee1ee	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 12:23:54.488868+00	
00000000-0000-0000-0000-000000000000	ecb42a6c-fe38-4dd0-94e3-5536b28b965e	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 12:35:18.123431+00	
00000000-0000-0000-0000-000000000000	6c07cff8-1c82-4b61-9d6c-898d73f90283	{"action":"login","actor_id":"385a10fe-7a72-44cf-ba01-746c7f05d7a1","actor_username":"admin@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 12:46:57.063594+00	
00000000-0000-0000-0000-000000000000	4c90fb0d-ad3d-4a16-835a-13b4dda9c641	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 12:48:16.26638+00	
00000000-0000-0000-0000-000000000000	f8b1d638-4b25-4b5b-8d0c-72c3ef06771a	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 12:54:41.878426+00	
00000000-0000-0000-0000-000000000000	f0a4812f-036a-4aca-8f91-8044847739f6	{"action":"login","actor_id":"385a10fe-7a72-44cf-ba01-746c7f05d7a1","actor_username":"admin@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 13:29:31.833597+00	
00000000-0000-0000-0000-000000000000	530f5927-04cf-469c-a99f-43c8071c1dc9	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 13:29:58.176992+00	
00000000-0000-0000-0000-000000000000	0deed89b-0f9c-4c01-abfa-2c41c8a32680	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 13:41:01.453953+00	
00000000-0000-0000-0000-000000000000	a48dfd02-0987-44d0-897f-2143a4169c5f	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 14:39:08.195286+00	
00000000-0000-0000-0000-000000000000	30409e72-6dba-4538-8c4c-40b5f4243af6	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 14:39:08.196813+00	
00000000-0000-0000-0000-000000000000	8bf2e25f-b2d2-4a04-b669-a5e5bb263197	{"action":"login","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 14:41:49.642859+00	
00000000-0000-0000-0000-000000000000	e84ab0e5-13c7-44ce-b856-9e327a85892d	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 14:45:27.249873+00	
00000000-0000-0000-0000-000000000000	58cec679-8168-4e87-a4b7-4d8a23e57c18	{"action":"login","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 15:06:54.027872+00	
00000000-0000-0000-0000-000000000000	ef3f7665-1be3-463c-84a3-b9242e4d67ff	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 15:16:05.592258+00	
00000000-0000-0000-0000-000000000000	7099531d-edb3-40e9-8649-e974527817d7	{"action":"login","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 15:19:53.289172+00	
00000000-0000-0000-0000-000000000000	d6fe8063-32ed-48ca-ae3f-60bdde5fde22	{"action":"token_refreshed","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 16:18:09.775271+00	
00000000-0000-0000-0000-000000000000	c30e2e7a-80bb-44fc-9063-848099b7c36b	{"action":"token_revoked","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 16:18:09.776836+00	
00000000-0000-0000-0000-000000000000	b437eff2-0acf-430f-a05e-f865d506c262	{"action":"login","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 16:21:14.938247+00	
00000000-0000-0000-0000-000000000000	2e8cb0c6-674d-407a-a35a-d04f10275b53	{"action":"token_refreshed","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 17:19:40.038065+00	
00000000-0000-0000-0000-000000000000	f85daf77-b23c-4234-b92e-b163ca50f232	{"action":"token_revoked","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 17:19:40.040657+00	
00000000-0000-0000-0000-000000000000	664dc335-c212-4de1-a930-6e912a30cfbb	{"action":"login","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 17:48:27.087914+00	
00000000-0000-0000-0000-000000000000	6c094069-ed3f-4e2e-a418-da976b4ee580	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 18:14:06.608436+00	
00000000-0000-0000-0000-000000000000	d55c1842-746d-4ad9-9379-3e185e9b8fad	{"action":"login","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 18:15:03.532026+00	
00000000-0000-0000-0000-000000000000	1df59487-8aa2-4f06-9d56-4e89d1001ccc	{"action":"token_refreshed","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 19:13:12.026467+00	
00000000-0000-0000-0000-000000000000	df3b45e7-804a-47be-8b04-0f4b90ccc447	{"action":"token_revoked","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 19:13:12.027776+00	
00000000-0000-0000-0000-000000000000	acf1638f-178d-49f1-adee-70cdb842ac7b	{"action":"login","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 19:51:36.655697+00	
00000000-0000-0000-0000-000000000000	a3a78390-2867-47d3-add5-ac5019deb1e8	{"action":"login","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 20:47:05.883455+00	
00000000-0000-0000-0000-000000000000	dbf9ed6b-d45e-4e13-863e-1111957b4801	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 20:47:42.315871+00	
00000000-0000-0000-0000-000000000000	b7293801-2f14-4e15-918d-3240715db5ac	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 21:52:54.317085+00	
00000000-0000-0000-0000-000000000000	0a47f68c-a0a8-455e-b51f-99b663165813	{"action":"token_refreshed","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 22:50:58.028246+00	
00000000-0000-0000-0000-000000000000	1db737d5-898c-44a7-af2d-8f057ae211df	{"action":"token_revoked","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 22:50:58.030421+00	
00000000-0000-0000-0000-000000000000	76144150-1f7e-4bec-838b-fa86ead062fa	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-13 22:59:43.813303+00	
00000000-0000-0000-0000-000000000000	78f77920-ebd8-4b47-a040-97420b95a655	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-14 07:36:45.954119+00	
00000000-0000-0000-0000-000000000000	f21d5879-ba47-4709-b6d1-79d63c05556b	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-14 08:37:04.133348+00	
00000000-0000-0000-0000-000000000000	80bdbf9a-e2a7-41f8-8fb7-c2a111001059	{"action":"login","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-14 08:38:17.73229+00	
00000000-0000-0000-0000-000000000000	8e036d0d-75d6-4e02-b6f9-1e50ce7794d1	{"action":"login","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-14 08:39:31.514186+00	
00000000-0000-0000-0000-000000000000	58a648bb-083c-41d7-9358-b9f4d4a1c2c7	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-14 08:40:15.472415+00	
00000000-0000-0000-0000-000000000000	e9c296f6-7afd-4fd1-b06e-f90f36fd5498	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-14 08:47:00.625523+00	
00000000-0000-0000-0000-000000000000	52daf035-b491-45e1-8760-6ebbdf4e3ce1	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-14 09:48:34.571489+00	
00000000-0000-0000-0000-000000000000	d2fcf257-ae08-4462-baae-e595a8ba6b45	{"action":"login","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-14 09:59:47.172008+00	
00000000-0000-0000-0000-000000000000	a912a9f4-8125-4b7f-98db-fc956464d23a	{"action":"login","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-14 11:40:12.989135+00	
00000000-0000-0000-0000-000000000000	a2679fbe-d77a-4102-9bc5-e2bb39d1bcf6	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-14 12:45:21.11428+00	
00000000-0000-0000-0000-000000000000	6b74f437-a52f-4fce-abcf-2be51466dd23	{"action":"login","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-14 12:47:54.603302+00	
00000000-0000-0000-0000-000000000000	f89b873e-4081-4c8b-8ba1-c180fdce81be	{"action":"login","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-14 13:40:07.813564+00	
00000000-0000-0000-0000-000000000000	02e279ac-476f-4a87-b618-6b5a4521cd3d	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-14 13:41:06.613547+00	
00000000-0000-0000-0000-000000000000	2bc40966-f079-491c-a653-76eb1a555c03	{"action":"login","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-14 13:43:02.755773+00	
00000000-0000-0000-0000-000000000000	fbaef190-7513-4021-84b6-24d6b6d90b23	{"action":"login","actor_id":"00fa55c3-21b0-4f29-868f-51aa594c24a7","actor_username":"advisor@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-14 14:46:38.673968+00	
00000000-0000-0000-0000-000000000000	22e1d5fb-9974-4507-a1ea-a6e03c3c488f	{"action":"login","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-14 14:53:56.755882+00	
00000000-0000-0000-0000-000000000000	69ec41ad-3cba-4458-b55d-37f33363ba0f	{"action":"token_refreshed","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 16:04:23.128427+00	
00000000-0000-0000-0000-000000000000	73d5c741-9d8f-46bc-beac-8c473b3318a4	{"action":"token_revoked","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 16:04:23.132992+00	
00000000-0000-0000-0000-000000000000	17ffce83-4514-4bba-9a0f-9a36a1a74010	{"action":"login","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-14 16:04:47.817936+00	
00000000-0000-0000-0000-000000000000	59485bc6-5ce1-4cd9-9fa5-49c70d82998f	{"action":"token_refreshed","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 17:13:42.099318+00	
00000000-0000-0000-0000-000000000000	2be43ddc-f05a-4fb5-9be3-6bd2a56cb842	{"action":"token_revoked","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 17:13:42.102219+00	
00000000-0000-0000-0000-000000000000	742e50da-52c2-435f-9c09-568715c0ba16	{"action":"login","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-14 17:26:07.685637+00	
00000000-0000-0000-0000-000000000000	0029f291-ef86-40fb-937c-ffb826a931ff	{"action":"login","actor_id":"03b38fc5-b05f-4999-8880-40d616822d7f","actor_username":"manager@motortrace.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-14 20:50:20.623814+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
385a10fe-7a72-44cf-ba01-746c7f05d7a1	385a10fe-7a72-44cf-ba01-746c7f05d7a1	{"sub": "385a10fe-7a72-44cf-ba01-746c7f05d7a1", "email": "admin@motortrace.com", "email_verified": false, "phone_verified": false}	email	2025-08-16 16:14:43.5812+00	2025-08-16 16:14:43.58123+00	2025-08-16 16:14:43.58123+00	d1d9d61f-90e1-45c2-a752-b1330d529b71
03b38fc5-b05f-4999-8880-40d616822d7f	03b38fc5-b05f-4999-8880-40d616822d7f	{"sub": "03b38fc5-b05f-4999-8880-40d616822d7f", "email": "manager@motortrace.com", "email_verified": false, "phone_verified": false}	email	2025-08-16 16:14:43.680739+00	2025-08-16 16:14:43.680761+00	2025-08-16 16:14:43.680761+00	7571b5a4-41fe-4527-b322-ff35acf1be21
00fa55c3-21b0-4f29-868f-51aa594c24a7	00fa55c3-21b0-4f29-868f-51aa594c24a7	{"sub": "00fa55c3-21b0-4f29-868f-51aa594c24a7", "email": "advisor@motortrace.com", "email_verified": false, "phone_verified": false}	email	2025-08-16 16:14:43.748378+00	2025-08-16 16:14:43.748404+00	2025-08-16 16:14:43.748404+00	c815136c-b8d9-4a0b-ae86-77851b3e1973
6a2a3ac0-8191-4a76-b2ea-cfa84c474fb3	6a2a3ac0-8191-4a76-b2ea-cfa84c474fb3	{"sub": "6a2a3ac0-8191-4a76-b2ea-cfa84c474fb3", "email": "inventory@motortrace.com", "email_verified": false, "phone_verified": false}	email	2025-08-16 16:14:43.817041+00	2025-08-16 16:14:43.817067+00	2025-08-16 16:14:43.817067+00	c7a48508-d40f-4010-b960-d988dbace467
c1f6d878-70fd-48b3-8c43-4b80df50ca2f	c1f6d878-70fd-48b3-8c43-4b80df50ca2f	{"sub": "c1f6d878-70fd-48b3-8c43-4b80df50ca2f", "email": "technician@motortrace.com", "email_verified": false, "phone_verified": false}	email	2025-08-16 16:14:43.885742+00	2025-08-16 16:14:43.885765+00	2025-08-16 16:14:43.885765+00	7f488adf-89cd-4a4c-ad67-d3ca8f92424b
31362d65-5571-4686-8e3a-78a51860e3d0	31362d65-5571-4686-8e3a-78a51860e3d0	{"sub": "31362d65-5571-4686-8e3a-78a51860e3d0", "email": "customer@motortrace.com", "email_verified": false, "phone_verified": false}	email	2025-08-16 16:14:43.952328+00	2025-08-16 16:14:43.952353+00	2025-08-16 16:14:43.952353+00	0d7e5d46-bd28-43a1-822a-bcd23cd342b9
0b9f8b4c-2a80-4846-87cb-3bf05f0121cb	0b9f8b4c-2a80-4846-87cb-3bf05f0121cb	{"sub": "0b9f8b4c-2a80-4846-87cb-3bf05f0121cb", "role": "customer", "email": "abdulla123@example.com", "email_verified": false, "phone_verified": false}	email	2025-09-04 08:00:37.224974+00	2025-09-04 08:00:37.225007+00	2025-09-04 08:00:37.225007+00	c367d253-70b7-489b-ab6d-a0bd98990d65
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
22475981-1f0d-4d6a-9b9b-44c41cdb56cc	2025-09-04 08:10:55.664179+00	2025-09-04 08:10:55.664179+00	password	a9f13d17-3246-4f4b-8f42-638dab1d3900
bb356aa0-d0d8-46e1-b5e5-da0f98f307f2	2025-09-04 13:36:42.963987+00	2025-09-04 13:36:42.963987+00	password	1cfaaf9b-679a-4646-986c-a9dc619953d9
a99517f6-f103-41d5-b516-7a6de2229141	2025-09-10 10:05:17.632957+00	2025-09-10 10:05:17.632957+00	password	2c7adead-c06d-4ea6-b1af-3664af699c99
52f201d9-1871-4b6b-9a1f-18af480407db	2025-09-10 11:06:47.067702+00	2025-09-10 11:06:47.067702+00	password	9b309910-022d-4fe2-8be5-a2a1303a205a
bc1ec226-f616-412b-b220-fe5c73028761	2025-09-10 12:26:54.870637+00	2025-09-10 12:26:54.870637+00	password	ed0d9e4f-733c-4954-b1f4-46cd57c03d77
5e8a2ad6-e972-41e8-8202-a2d9753119c0	2025-09-10 12:33:33.657268+00	2025-09-10 12:33:33.657268+00	password	e46d1ffb-3c6e-4619-94c3-eb60a8a50e16
e03d43d9-a794-42c9-8d58-4b4d45c90d96	2025-09-10 12:33:49.030404+00	2025-09-10 12:33:49.030404+00	password	748b2e0e-3185-4935-867e-d68d43937c13
1f816ea4-6197-48a3-bf84-09c598579d7c	2025-09-10 12:38:36.149726+00	2025-09-10 12:38:36.149726+00	password	13c096d8-369f-453d-9152-42e3fb9d7b1b
edf22ea3-f28d-4f36-aaa2-84b72dd70a4d	2025-09-10 12:40:17.977755+00	2025-09-10 12:40:17.977755+00	password	7f63bcd4-3564-4134-a3df-27fc3ce1505e
1292ec9d-8062-43a5-8cd5-0d05b8d06f12	2025-09-10 14:09:44.694708+00	2025-09-10 14:09:44.694708+00	password	87d35fa6-019e-461f-be1f-f24c48503edd
d99cc498-ff6e-471b-87a2-591b8ff423c2	2025-09-10 14:09:56.568354+00	2025-09-10 14:09:56.568354+00	password	edf0bcc3-70c6-40fa-9846-336bc948e6ee
29e8a688-9178-411e-8190-ec7cd859e059	2025-09-10 21:24:53.780752+00	2025-09-10 21:24:53.780752+00	password	3abd32e5-3e31-457a-bd2f-3b413e15cdc9
54158e4f-01ed-4cb8-8bbc-9182e586d78e	2025-09-10 21:25:19.495864+00	2025-09-10 21:25:19.495864+00	password	7d22b538-74ce-4cc7-b7e2-37863725d020
78d93cbf-cb6c-495e-b765-d1a1951f1307	2025-09-10 21:30:19.769697+00	2025-09-10 21:30:19.769697+00	password	08a79fc9-aad9-4235-b4dd-555f1c3d6289
8fbacf1e-9540-419d-a249-a7e85281b44a	2025-09-10 22:46:36.715728+00	2025-09-10 22:46:36.715728+00	password	af265358-381a-476f-bd0e-57fdba63e440
30c7426e-1a26-4cae-9c42-39df0fc535fb	2025-09-10 23:49:57.062228+00	2025-09-10 23:49:57.062228+00	password	dc8f0037-ea7f-4d1e-bb12-85d6893cfb86
579d32bd-6a7a-40a0-8e64-a28221ab8fa2	2025-09-11 08:48:49.423892+00	2025-09-11 08:48:49.423892+00	password	e00fa073-ad18-466b-9e27-19f6c3c43eae
52913571-c63f-424f-8418-f740285e8531	2025-09-11 10:18:21.95569+00	2025-09-11 10:18:21.95569+00	password	acb3997f-55d8-4704-b5fe-c02a41914bfb
24b7d946-e3b1-484f-91b4-b6559339f232	2025-09-11 11:38:10.353465+00	2025-09-11 11:38:10.353465+00	password	9437b723-5555-4fd7-9fc0-01abdf6c91c9
8aa973b7-9049-4400-9c3f-54ef762a6ae0	2025-09-11 11:49:49.877644+00	2025-09-11 11:49:49.877644+00	password	1fdad709-4c61-402b-9f19-433fd4f29109
4e6f9de3-74a1-4c9f-9707-5825d5c6e638	2025-09-11 11:51:15.792288+00	2025-09-11 11:51:15.792288+00	password	18f4a4cd-e38c-4db1-91ae-2054280bacf9
4c96a820-4b93-4556-8eaa-06f7b699b960	2025-09-11 11:52:47.232307+00	2025-09-11 11:52:47.232307+00	password	05fc5ca3-2d9a-4ebb-a47e-aee256754037
f2a9dcf9-c856-4131-8796-0cbb255b4133	2025-09-11 11:53:17.88718+00	2025-09-11 11:53:17.88718+00	password	86e87816-a0b6-49fd-b0f5-dea918cb2fa8
13a11978-e334-4b7a-a043-4ed47b87cf4f	2025-09-11 11:54:55.686682+00	2025-09-11 11:54:55.686682+00	password	ab062030-aaec-46ea-85ab-31921af1751a
7386632d-1397-402e-9553-43bd1297ef78	2025-09-11 14:09:16.227106+00	2025-09-11 14:09:16.227106+00	password	dd073c9e-9cbe-4b8f-9bed-5dbc30e0288c
24010a60-4f7f-4a96-8af5-4868aec79e8f	2025-09-11 15:19:14.90397+00	2025-09-11 15:19:14.90397+00	password	dc51a6b7-770b-4299-8df6-cb2001236b39
0eea104c-de6d-4f24-89f3-5939d9ae0bc9	2025-09-11 16:26:35.086662+00	2025-09-11 16:26:35.086662+00	password	877e04fb-9806-415d-9997-fb6c35a1afe3
f83b5ff0-d5dc-4ebb-b565-8ca9fdade3a4	2025-09-12 08:28:49.796539+00	2025-09-12 08:28:49.796539+00	password	7fef5947-713f-4e5c-9c71-a1b1718b8d4f
f945ce16-2171-4b53-89b1-d25df6afba69	2025-09-12 09:31:38.168906+00	2025-09-12 09:31:38.168906+00	password	93a41e09-4774-416e-a88d-197f968ad04d
3a5df8ae-4461-4d98-b4ad-5e0549077b05	2025-09-12 11:14:18.60483+00	2025-09-12 11:14:18.60483+00	password	e95d61ea-994c-45aa-8f7d-b4c33edcbce5
fda93864-5fa9-4333-8fd3-6cde948f798a	2025-09-12 12:14:30.229911+00	2025-09-12 12:14:30.229911+00	password	4b215461-2178-48ab-bd20-9721097c2d0a
fae6100b-0882-4132-b7ac-f02660889b7d	2025-09-12 13:54:00.587941+00	2025-09-12 13:54:00.587941+00	password	64b7459f-b22c-48b8-a65b-d69154e99f7e
4b4641d6-1526-4e3c-95e3-dab1b33a968b	2025-09-12 15:11:39.634642+00	2025-09-12 15:11:39.634642+00	password	ea27c8a1-fb4d-45ab-8673-a35f753d5c45
cf44effb-c478-44dc-ab1a-41ba9abf10b8	2025-09-12 15:54:46.15406+00	2025-09-12 15:54:46.15406+00	password	85330ab3-55c1-4bc7-869a-bc5340fbdd47
2fc5a4a6-a9ee-4f94-ab45-795b758ab068	2025-09-12 17:05:23.322915+00	2025-09-12 17:05:23.322915+00	password	cb621cd6-b6a2-4878-8560-71fad306c899
0f61a957-0fcb-4351-9a6f-18c66078c553	2025-09-12 20:21:32.689935+00	2025-09-12 20:21:32.689935+00	password	921508ac-7d7d-4cc9-b7b0-2bbe7e4f7585
c6ca5477-d792-4e18-bb0d-0b4700d8f4b4	2025-09-12 21:23:54.898534+00	2025-09-12 21:23:54.898534+00	password	1301beb8-1865-46ed-acf4-1cadc3cc38b7
4e1f8379-3f43-4411-8ce5-29ed8587530e	2025-09-13 07:38:27.155055+00	2025-09-13 07:38:27.155055+00	password	d08b2fa3-8dcd-4fd8-aca8-9d2f792eba19
872ce270-03ab-4ffd-99b9-37d2b627c358	2025-09-13 08:43:00.097135+00	2025-09-13 08:43:00.097135+00	password	707a9979-3a97-442a-9e56-6301026e52fa
4560a732-016a-4b26-8dc3-3f66cbe145c4	2025-09-13 11:12:49.674183+00	2025-09-13 11:12:49.674183+00	password	3c7d1480-1190-4143-b561-3b176215b553
bae47c0d-5735-4171-b5be-9da3af321721	2025-09-13 11:21:20.860875+00	2025-09-13 11:21:20.860875+00	password	269ab633-666e-4c9a-9c65-1cf86a1f89c9
8d3b3126-f52d-4c7b-933a-3616fa3c6504	2025-09-13 11:21:47.313487+00	2025-09-13 11:21:47.313487+00	password	69c92e0d-1e09-41a0-a152-a28c030c815e
ce5f6c8d-ae5d-4ffc-858c-a6dafa3861de	2025-09-13 11:24:13.241272+00	2025-09-13 11:24:13.241272+00	password	57856ec8-8e1a-43a4-a34b-b872e30eda7a
bf368bed-a94a-4f77-8bb4-e96d7dc6b74e	2025-09-13 11:25:29.912063+00	2025-09-13 11:25:29.912063+00	password	0a5144a9-e68c-4d30-8b71-12314a199859
8fc63632-a6d8-47f8-9cca-24d366b1192e	2025-09-13 12:35:18.127137+00	2025-09-13 12:35:18.127137+00	password	4407e451-9a3b-4ec2-89ad-45009b18ae8f
398089a6-38a5-45aa-8290-e82d8409a0ea	2025-09-13 12:46:57.066187+00	2025-09-13 12:46:57.066187+00	password	62a3a741-b69e-41a7-bc31-22a72dc016f5
b7eb3865-b9ef-435a-8951-d6a5f9c9d076	2025-09-13 12:48:16.271467+00	2025-09-13 12:48:16.271467+00	password	48d94120-40c8-42b9-8648-f5f4016b7197
362e03d5-fbca-4734-816d-a32e95c16e47	2025-09-13 12:54:41.88073+00	2025-09-13 12:54:41.88073+00	password	e1dc15d2-8dd0-40dc-ba6e-ebe75b9185a6
69bee796-af81-4954-a930-1136d0ca4f7e	2025-09-13 13:29:31.840145+00	2025-09-13 13:29:31.840145+00	password	773ef813-d387-4280-8bbf-7512cb4dbaba
01daa17d-aec5-4643-98b2-75cdb3fa45a3	2025-09-13 13:29:58.178937+00	2025-09-13 13:29:58.178937+00	password	5871717e-91cd-4716-9dab-9f5aeb2b48a1
ab1cb10f-2229-4816-9409-b5985e2ead01	2025-09-13 13:41:01.456787+00	2025-09-13 13:41:01.456787+00	password	e78e703d-49fb-4ece-9ccc-69563ec5423f
47c94717-c154-4efb-ad48-0f40f12b2dd1	2025-09-13 14:41:49.646766+00	2025-09-13 14:41:49.646766+00	password	769928ec-dcc3-4062-b58a-f134b7ff282f
e32af484-1222-4d4e-8394-88bd8752ae4b	2025-09-13 14:45:27.253906+00	2025-09-13 14:45:27.253906+00	password	d68cf9b7-1504-41a4-a8cb-28f1b02e5a2e
e6281e48-667e-4982-9e4f-d0689e1b61ee	2025-09-13 15:06:54.030697+00	2025-09-13 15:06:54.030697+00	password	638285bb-9456-45c6-a1ef-9d02b973dec6
c542ba78-ad49-49f0-b6d1-7c06d8683894	2025-09-13 15:16:05.595311+00	2025-09-13 15:16:05.595311+00	password	36d17186-fc46-4ae6-961d-2a43fd632415
d961d790-bd78-4bcf-bbc0-92eec9f861db	2025-09-13 15:19:53.292356+00	2025-09-13 15:19:53.292356+00	password	f62b2c32-2f72-4e33-b31d-72d7dce02f98
d47c37e7-dd84-4ff6-98e2-7dec6c7fd2c3	2025-09-13 16:21:14.943731+00	2025-09-13 16:21:14.943731+00	password	df72ef58-a206-4d27-9e0e-55965ee0d052
5732dab9-c7b0-4a9b-91ec-ff71b4a259f1	2025-09-13 17:48:27.091848+00	2025-09-13 17:48:27.091848+00	password	fe30e82b-c6c0-46bc-b035-4fec36e76837
b13a88c2-ad84-439c-919a-3cddd07e4a82	2025-09-13 18:14:06.612917+00	2025-09-13 18:14:06.612917+00	password	bf5e8a6f-141f-4d41-84c4-b94f09e2d6ea
1d18dbd0-3081-4b0a-88a3-991b288c2162	2025-09-13 18:15:03.534579+00	2025-09-13 18:15:03.534579+00	password	cf893f22-ea5e-42cd-9bbe-d33292a00cd3
b6ea9720-6921-4e80-87c0-762f2c2b292a	2025-09-13 19:51:36.661467+00	2025-09-13 19:51:36.661467+00	password	932efa3b-a3f7-47f1-9222-60ee1b17e2f7
de507e12-1b44-4a71-b605-e82901479d6a	2025-09-13 20:47:05.89573+00	2025-09-13 20:47:05.89573+00	password	6becfb35-3570-4834-9260-681448c42b31
b91a142c-eb25-41ce-b29b-268328d2dbe7	2025-09-13 20:47:42.32466+00	2025-09-13 20:47:42.32466+00	password	108d65f0-8817-430c-bf04-e0a2bfef2aaa
5cb90475-d544-4755-a299-5e3c8d62f08b	2025-09-13 21:52:54.325976+00	2025-09-13 21:52:54.325976+00	password	e6443936-3416-4bbd-abc1-0154968fb42e
c5961b22-6bbc-46a3-a4f4-e56a7f923ecc	2025-09-13 22:59:43.819021+00	2025-09-13 22:59:43.819021+00	password	0cb816bc-a288-4b10-83f0-4bbde704880d
c9c2690e-ffe4-4a5c-a347-2a1fb2a3827d	2025-09-14 07:36:45.969505+00	2025-09-14 07:36:45.969505+00	password	513a4d43-61dc-407b-b5a2-8f0a697e0402
514cb2a9-621e-432a-839a-9049f6f88839	2025-09-14 08:37:04.140142+00	2025-09-14 08:37:04.140142+00	password	45a0f547-bb12-4e08-946e-5932d8af9bbb
45b2fa4e-9f96-4ae7-8787-c49de68aa3e5	2025-09-14 08:38:17.735075+00	2025-09-14 08:38:17.735075+00	password	c7524b66-da46-4cb9-940e-e26ae225e812
3c538793-fb56-41bc-928f-3b10f210316e	2025-09-14 08:39:31.519488+00	2025-09-14 08:39:31.519488+00	password	df2005eb-f2a7-4b87-99c3-6a794affc4af
1ef373aa-33c8-47fe-8740-e15b2e155d8e	2025-09-14 08:40:15.475035+00	2025-09-14 08:40:15.475035+00	password	14c1d5e2-d470-499f-b761-5b218b9c85ce
a86e32a3-b178-47cd-8852-97f7d9bac9d3	2025-09-14 08:47:00.628791+00	2025-09-14 08:47:00.628791+00	password	c27309aa-14ee-422a-ad7b-23fbc3c1ad77
b92c6d7b-7ab9-4515-8a80-c866cdf8956e	2025-09-14 09:48:34.578545+00	2025-09-14 09:48:34.578545+00	password	218c9d78-4eea-4fc5-826d-5441cf929802
af5171a0-9f14-442e-a96b-8fa7f9440f5e	2025-09-14 09:59:47.178242+00	2025-09-14 09:59:47.178242+00	password	51faadb1-0406-407b-ba16-794d4cc844c1
6ee73abd-58ff-4be5-9a86-65da1519ae3d	2025-09-14 11:40:13.000869+00	2025-09-14 11:40:13.000869+00	password	062ee8ac-68d0-409b-a846-c78e4b237262
a9a0d3c4-d4fa-45e4-9149-1d25ce905f21	2025-09-14 12:45:21.122821+00	2025-09-14 12:45:21.122821+00	password	dcea8d70-74fb-4235-8411-31371f1e4943
3bf7e496-0faa-4ce8-90ab-5d71319a9615	2025-09-14 12:47:54.613484+00	2025-09-14 12:47:54.613484+00	password	a000a68b-05c2-4522-89f8-6d4256b22819
ad01e173-81a9-4a35-87e3-73e4aba02c56	2025-09-14 13:40:07.821898+00	2025-09-14 13:40:07.821898+00	password	c968c08e-cade-434f-a65a-246e16ce0299
d6b956b9-48a3-4b9b-a1c1-7788193db348	2025-09-14 13:41:06.616894+00	2025-09-14 13:41:06.616894+00	password	9929c538-e7a8-486e-aadd-d31ab2350e99
b862ca20-ccbc-476a-a057-cf19006023e6	2025-09-14 13:43:02.761398+00	2025-09-14 13:43:02.761398+00	password	258da611-1b8c-4dfa-87b2-c641d0df057c
2be04787-08c5-4677-8179-67032ede7afc	2025-09-14 14:46:38.680875+00	2025-09-14 14:46:38.680875+00	password	5832fc0a-d3ca-4095-99a3-b151b8271e90
2a2543ba-54ee-44e9-b310-a62532a77814	2025-09-14 14:53:56.759621+00	2025-09-14 14:53:56.759621+00	password	03b1e9d6-9b83-4a04-96cb-f5ca80a8c52d
b3605337-502d-4a8f-af50-4fa03b337ec0	2025-09-14 16:04:47.821419+00	2025-09-14 16:04:47.821419+00	password	14e67948-b3b7-4678-bc1b-934c42e1920b
15980fc4-9d18-445b-944a-c474d03453d7	2025-09-14 17:26:07.689645+00	2025-09-14 17:26:07.689645+00	password	230d3517-3e7a-4588-ad66-d6d3d98bd1d7
d8bf9439-44ca-4ea4-8963-004c3d825f5b	2025-09-14 20:50:20.640827+00	2025-09-14 20:50:20.640827+00	password	559583de-0ccc-46d0-85f5-25972bd72cc1
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	100	pllyqlyjjx4w	385a10fe-7a72-44cf-ba01-746c7f05d7a1	f	2025-09-04 08:10:55.662933+00	2025-09-04 08:10:55.662933+00	\N	22475981-1f0d-4d6a-9b9b-44c41cdb56cc
00000000-0000-0000-0000-000000000000	104	vzdtpaireoyb	385a10fe-7a72-44cf-ba01-746c7f05d7a1	f	2025-09-04 13:36:42.963178+00	2025-09-04 13:36:42.963178+00	\N	bb356aa0-d0d8-46e1-b5e5-da0f98f307f2
00000000-0000-0000-0000-000000000000	114	6bj3qewqtzoc	0b9f8b4c-2a80-4846-87cb-3bf05f0121cb	t	2025-09-10 10:05:17.631827+00	2025-09-10 11:04:56.159898+00	\N	a99517f6-f103-41d5-b516-7a6de2229141
00000000-0000-0000-0000-000000000000	115	m6qlsok4pqsq	0b9f8b4c-2a80-4846-87cb-3bf05f0121cb	f	2025-09-10 11:04:56.165583+00	2025-09-10 11:04:56.165583+00	6bj3qewqtzoc	a99517f6-f103-41d5-b516-7a6de2229141
00000000-0000-0000-0000-000000000000	116	degjbjx2zxsq	385a10fe-7a72-44cf-ba01-746c7f05d7a1	f	2025-09-10 11:06:47.061982+00	2025-09-10 11:06:47.061982+00	\N	52f201d9-1871-4b6b-9a1f-18af480407db
00000000-0000-0000-0000-000000000000	117	n2kiidsgx76b	385a10fe-7a72-44cf-ba01-746c7f05d7a1	f	2025-09-10 12:26:54.867348+00	2025-09-10 12:26:54.867348+00	\N	bc1ec226-f616-412b-b220-fe5c73028761
00000000-0000-0000-0000-000000000000	118	bhucjdktrxcp	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-10 12:33:33.655923+00	2025-09-10 12:33:33.655923+00	\N	5e8a2ad6-e972-41e8-8202-a2d9753119c0
00000000-0000-0000-0000-000000000000	119	queq5iqbaoc2	03b38fc5-b05f-4999-8880-40d616822d7f	f	2025-09-10 12:33:49.029661+00	2025-09-10 12:33:49.029661+00	\N	e03d43d9-a794-42c9-8d58-4b4d45c90d96
00000000-0000-0000-0000-000000000000	120	7q4yjnbbjoys	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-10 12:38:36.148802+00	2025-09-10 12:38:36.148802+00	\N	1f816ea4-6197-48a3-bf84-09c598579d7c
00000000-0000-0000-0000-000000000000	121	cudr3onna3ca	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-10 12:40:17.976954+00	2025-09-10 12:40:17.976954+00	\N	edf22ea3-f28d-4f36-aaa2-84b72dd70a4d
00000000-0000-0000-0000-000000000000	122	ul6rzmq23sp2	03b38fc5-b05f-4999-8880-40d616822d7f	f	2025-09-10 14:09:44.690829+00	2025-09-10 14:09:44.690829+00	\N	1292ec9d-8062-43a5-8cd5-0d05b8d06f12
00000000-0000-0000-0000-000000000000	123	e7hpwdt44nia	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-10 14:09:56.567463+00	2025-09-10 14:09:56.567463+00	\N	d99cc498-ff6e-471b-87a2-591b8ff423c2
00000000-0000-0000-0000-000000000000	124	kvbztibx4x24	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-10 21:24:53.777436+00	2025-09-10 21:24:53.777436+00	\N	29e8a688-9178-411e-8190-ec7cd859e059
00000000-0000-0000-0000-000000000000	125	ewtgvyvrcaz4	385a10fe-7a72-44cf-ba01-746c7f05d7a1	f	2025-09-10 21:25:19.495172+00	2025-09-10 21:25:19.495172+00	\N	54158e4f-01ed-4cb8-8bbc-9182e586d78e
00000000-0000-0000-0000-000000000000	126	2dlpfmyymkcw	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-10 21:30:19.768817+00	2025-09-10 21:30:19.768817+00	\N	78d93cbf-cb6c-495e-b765-d1a1951f1307
00000000-0000-0000-0000-000000000000	127	qamzfvfuj53f	00fa55c3-21b0-4f29-868f-51aa594c24a7	t	2025-09-10 22:46:36.712768+00	2025-09-10 23:45:02.473405+00	\N	8fbacf1e-9540-419d-a249-a7e85281b44a
00000000-0000-0000-0000-000000000000	128	wt6iwp5hxy7y	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-10 23:45:02.476977+00	2025-09-10 23:45:02.476977+00	qamzfvfuj53f	8fbacf1e-9540-419d-a249-a7e85281b44a
00000000-0000-0000-0000-000000000000	129	cff2wsudfkue	00fa55c3-21b0-4f29-868f-51aa594c24a7	t	2025-09-10 23:49:57.060774+00	2025-09-11 00:48:03.332326+00	\N	30c7426e-1a26-4cae-9c42-39df0fc535fb
00000000-0000-0000-0000-000000000000	130	ku3kuhcopid5	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-11 00:48:03.333095+00	2025-09-11 00:48:03.333095+00	cff2wsudfkue	30c7426e-1a26-4cae-9c42-39df0fc535fb
00000000-0000-0000-0000-000000000000	131	rrb65yozcehr	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-11 08:48:49.420075+00	2025-09-11 08:48:49.420075+00	\N	579d32bd-6a7a-40a0-8e64-a28221ab8fa2
00000000-0000-0000-0000-000000000000	132	jd6avgzkwzkk	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-11 10:18:21.953214+00	2025-09-11 10:18:21.953214+00	\N	52913571-c63f-424f-8418-f740285e8531
00000000-0000-0000-0000-000000000000	133	32z4hkdo334d	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-11 11:38:10.351436+00	2025-09-11 11:38:10.351436+00	\N	24b7d946-e3b1-484f-91b4-b6559339f232
00000000-0000-0000-0000-000000000000	134	vh6l4pumoijk	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-11 11:49:49.876228+00	2025-09-11 11:49:49.876228+00	\N	8aa973b7-9049-4400-9c3f-54ef762a6ae0
00000000-0000-0000-0000-000000000000	135	cycdh2tfql5c	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-11 11:51:15.791461+00	2025-09-11 11:51:15.791461+00	\N	4e6f9de3-74a1-4c9f-9707-5825d5c6e638
00000000-0000-0000-0000-000000000000	136	vtddktoeqab2	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-11 11:52:47.230411+00	2025-09-11 11:52:47.230411+00	\N	4c96a820-4b93-4556-8eaa-06f7b699b960
00000000-0000-0000-0000-000000000000	137	mvoogdzwiaik	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-11 11:53:17.886046+00	2025-09-11 11:53:17.886046+00	\N	f2a9dcf9-c856-4131-8796-0cbb255b4133
00000000-0000-0000-0000-000000000000	138	lihak6vmsjxl	00fa55c3-21b0-4f29-868f-51aa594c24a7	t	2025-09-11 11:54:55.685864+00	2025-09-11 12:53:02.458246+00	\N	13a11978-e334-4b7a-a043-4ed47b87cf4f
00000000-0000-0000-0000-000000000000	139	bfd6hl4ywxuw	00fa55c3-21b0-4f29-868f-51aa594c24a7	t	2025-09-11 12:53:02.462973+00	2025-09-11 13:51:02.833822+00	lihak6vmsjxl	13a11978-e334-4b7a-a043-4ed47b87cf4f
00000000-0000-0000-0000-000000000000	140	i4ck2kcwaiaj	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-11 13:51:02.834983+00	2025-09-11 13:51:02.834983+00	bfd6hl4ywxuw	13a11978-e334-4b7a-a043-4ed47b87cf4f
00000000-0000-0000-0000-000000000000	141	pnxlltbzu6ka	00fa55c3-21b0-4f29-868f-51aa594c24a7	t	2025-09-11 14:09:16.223211+00	2025-09-11 15:07:38.569555+00	\N	7386632d-1397-402e-9553-43bd1297ef78
00000000-0000-0000-0000-000000000000	142	fz4f7otdv5bn	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-11 15:07:38.571387+00	2025-09-11 15:07:38.571387+00	pnxlltbzu6ka	7386632d-1397-402e-9553-43bd1297ef78
00000000-0000-0000-0000-000000000000	143	mspgdxwqzfcn	00fa55c3-21b0-4f29-868f-51aa594c24a7	t	2025-09-11 15:19:14.902432+00	2025-09-11 16:17:39.496921+00	\N	24010a60-4f7f-4a96-8af5-4868aec79e8f
00000000-0000-0000-0000-000000000000	144	y4lapypdb5zz	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-11 16:17:39.498815+00	2025-09-11 16:17:39.498815+00	mspgdxwqzfcn	24010a60-4f7f-4a96-8af5-4868aec79e8f
00000000-0000-0000-0000-000000000000	145	7rz7wbexgchl	00fa55c3-21b0-4f29-868f-51aa594c24a7	t	2025-09-11 16:26:35.084731+00	2025-09-11 17:24:39.606628+00	\N	0eea104c-de6d-4f24-89f3-5939d9ae0bc9
00000000-0000-0000-0000-000000000000	146	qypztvgdogew	00fa55c3-21b0-4f29-868f-51aa594c24a7	t	2025-09-11 17:24:39.607436+00	2025-09-11 18:22:41.028583+00	7rz7wbexgchl	0eea104c-de6d-4f24-89f3-5939d9ae0bc9
00000000-0000-0000-0000-000000000000	147	xirkpdenou2s	00fa55c3-21b0-4f29-868f-51aa594c24a7	t	2025-09-11 18:22:41.029532+00	2025-09-11 19:20:40.632646+00	qypztvgdogew	0eea104c-de6d-4f24-89f3-5939d9ae0bc9
00000000-0000-0000-0000-000000000000	148	bzo7mdhmjyqg	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-11 19:20:40.633573+00	2025-09-11 19:20:40.633573+00	xirkpdenou2s	0eea104c-de6d-4f24-89f3-5939d9ae0bc9
00000000-0000-0000-0000-000000000000	149	5ivib6emwev2	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-12 08:28:49.793274+00	2025-09-12 08:28:49.793274+00	\N	f83b5ff0-d5dc-4ebb-b565-8ca9fdade3a4
00000000-0000-0000-0000-000000000000	150	tdgkit7zorov	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-12 09:31:38.166408+00	2025-09-12 09:31:38.166408+00	\N	f945ce16-2171-4b53-89b1-d25df6afba69
00000000-0000-0000-0000-000000000000	151	5kzy2qxkx4ht	00fa55c3-21b0-4f29-868f-51aa594c24a7	t	2025-09-12 11:14:18.602629+00	2025-09-12 12:12:44.701642+00	\N	3a5df8ae-4461-4d98-b4ad-5e0549077b05
00000000-0000-0000-0000-000000000000	152	gzvp7yjzzho4	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-12 12:12:44.707358+00	2025-09-12 12:12:44.707358+00	5kzy2qxkx4ht	3a5df8ae-4461-4d98-b4ad-5e0549077b05
00000000-0000-0000-0000-000000000000	153	c2oskfivvwko	00fa55c3-21b0-4f29-868f-51aa594c24a7	t	2025-09-12 12:14:30.228131+00	2025-09-12 13:53:35.42125+00	\N	fda93864-5fa9-4333-8fd3-6cde948f798a
00000000-0000-0000-0000-000000000000	154	b6x2x3snwxpz	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-12 13:53:35.423884+00	2025-09-12 13:53:35.423884+00	c2oskfivvwko	fda93864-5fa9-4333-8fd3-6cde948f798a
00000000-0000-0000-0000-000000000000	155	z6bjwsmmzu65	00fa55c3-21b0-4f29-868f-51aa594c24a7	t	2025-09-12 13:54:00.586893+00	2025-09-12 14:52:06.198888+00	\N	fae6100b-0882-4132-b7ac-f02660889b7d
00000000-0000-0000-0000-000000000000	156	agr3awp6majz	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-12 14:52:06.199927+00	2025-09-12 14:52:06.199927+00	z6bjwsmmzu65	fae6100b-0882-4132-b7ac-f02660889b7d
00000000-0000-0000-0000-000000000000	157	xc2ratgvpq3s	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-12 15:11:39.632824+00	2025-09-12 15:11:39.632824+00	\N	4b4641d6-1526-4e3c-95e3-dab1b33a968b
00000000-0000-0000-0000-000000000000	158	fitiohkws66a	00fa55c3-21b0-4f29-868f-51aa594c24a7	t	2025-09-12 15:54:46.152606+00	2025-09-12 16:53:07.307544+00	\N	cf44effb-c478-44dc-ab1a-41ba9abf10b8
00000000-0000-0000-0000-000000000000	159	h7un4zhc3vib	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-12 16:53:07.308814+00	2025-09-12 16:53:07.308814+00	fitiohkws66a	cf44effb-c478-44dc-ab1a-41ba9abf10b8
00000000-0000-0000-0000-000000000000	160	r3egqesdhcqp	00fa55c3-21b0-4f29-868f-51aa594c24a7	t	2025-09-12 17:05:23.320754+00	2025-09-12 18:43:03.43691+00	\N	2fc5a4a6-a9ee-4f94-ab45-795b758ab068
00000000-0000-0000-0000-000000000000	161	lo7bkxtqxujm	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-12 18:43:03.439914+00	2025-09-12 18:43:03.439914+00	r3egqesdhcqp	2fc5a4a6-a9ee-4f94-ab45-795b758ab068
00000000-0000-0000-0000-000000000000	162	fgql7sxdmpbo	00fa55c3-21b0-4f29-868f-51aa594c24a7	t	2025-09-12 20:21:32.685963+00	2025-09-12 21:19:35.151382+00	\N	0f61a957-0fcb-4351-9a6f-18c66078c553
00000000-0000-0000-0000-000000000000	163	uyyjdkfbc7zi	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-12 21:19:35.153574+00	2025-09-12 21:19:35.153574+00	fgql7sxdmpbo	0f61a957-0fcb-4351-9a6f-18c66078c553
00000000-0000-0000-0000-000000000000	164	tb5wwfch35uu	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-12 21:23:54.897331+00	2025-09-12 21:23:54.897331+00	\N	c6ca5477-d792-4e18-bb0d-0b4700d8f4b4
00000000-0000-0000-0000-000000000000	165	5d3zvid5y3ki	00fa55c3-21b0-4f29-868f-51aa594c24a7	t	2025-09-13 07:38:27.150958+00	2025-09-13 08:36:32.764555+00	\N	4e1f8379-3f43-4411-8ce5-29ed8587530e
00000000-0000-0000-0000-000000000000	166	b5phvumrcsqb	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-13 08:36:32.766517+00	2025-09-13 08:36:32.766517+00	5d3zvid5y3ki	4e1f8379-3f43-4411-8ce5-29ed8587530e
00000000-0000-0000-0000-000000000000	167	55xlltm5aeey	00fa55c3-21b0-4f29-868f-51aa594c24a7	t	2025-09-13 08:43:00.095133+00	2025-09-13 09:41:03.568862+00	\N	872ce270-03ab-4ffd-99b9-37d2b627c358
00000000-0000-0000-0000-000000000000	168	kszuvshjeim7	00fa55c3-21b0-4f29-868f-51aa594c24a7	t	2025-09-13 09:41:03.569683+00	2025-09-13 11:12:34.111011+00	55xlltm5aeey	872ce270-03ab-4ffd-99b9-37d2b627c358
00000000-0000-0000-0000-000000000000	169	tra6vdv64p75	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-13 11:12:34.112371+00	2025-09-13 11:12:34.112371+00	kszuvshjeim7	872ce270-03ab-4ffd-99b9-37d2b627c358
00000000-0000-0000-0000-000000000000	170	fj6i52vtarqo	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-13 11:12:49.673146+00	2025-09-13 11:12:49.673146+00	\N	4560a732-016a-4b26-8dc3-3f66cbe145c4
00000000-0000-0000-0000-000000000000	171	mrbqmswgkkb7	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-13 11:21:20.859889+00	2025-09-13 11:21:20.859889+00	\N	bae47c0d-5735-4171-b5be-9da3af321721
00000000-0000-0000-0000-000000000000	172	4wplatigkjjc	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-13 11:21:47.311905+00	2025-09-13 11:21:47.311905+00	\N	8d3b3126-f52d-4c7b-933a-3616fa3c6504
00000000-0000-0000-0000-000000000000	173	lkkibfr464iy	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-13 11:24:13.240194+00	2025-09-13 11:24:13.240194+00	\N	ce5f6c8d-ae5d-4ffc-858c-a6dafa3861de
00000000-0000-0000-0000-000000000000	174	2bkjt27gwz2i	00fa55c3-21b0-4f29-868f-51aa594c24a7	t	2025-09-13 11:25:29.910809+00	2025-09-13 12:23:54.489305+00	\N	bf368bed-a94a-4f77-8bb4-e96d7dc6b74e
00000000-0000-0000-0000-000000000000	175	ulopvtwui3td	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-13 12:23:54.489817+00	2025-09-13 12:23:54.489817+00	2bkjt27gwz2i	bf368bed-a94a-4f77-8bb4-e96d7dc6b74e
00000000-0000-0000-0000-000000000000	176	6ttwguqmhp23	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-13 12:35:18.125716+00	2025-09-13 12:35:18.125716+00	\N	8fc63632-a6d8-47f8-9cca-24d366b1192e
00000000-0000-0000-0000-000000000000	177	tkpa4eeyaukk	385a10fe-7a72-44cf-ba01-746c7f05d7a1	f	2025-09-13 12:46:57.064947+00	2025-09-13 12:46:57.064947+00	\N	398089a6-38a5-45aa-8290-e82d8409a0ea
00000000-0000-0000-0000-000000000000	178	vxfamr4lpzgs	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-13 12:48:16.267705+00	2025-09-13 12:48:16.267705+00	\N	b7eb3865-b9ef-435a-8951-d6a5f9c9d076
00000000-0000-0000-0000-000000000000	179	joukssznbl24	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-13 12:54:41.879926+00	2025-09-13 12:54:41.879926+00	\N	362e03d5-fbca-4734-816d-a32e95c16e47
00000000-0000-0000-0000-000000000000	180	hmom4jnpzflb	385a10fe-7a72-44cf-ba01-746c7f05d7a1	f	2025-09-13 13:29:31.835476+00	2025-09-13 13:29:31.835476+00	\N	69bee796-af81-4954-a930-1136d0ca4f7e
00000000-0000-0000-0000-000000000000	181	f3waq2tmy55p	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-13 13:29:58.178242+00	2025-09-13 13:29:58.178242+00	\N	01daa17d-aec5-4643-98b2-75cdb3fa45a3
00000000-0000-0000-0000-000000000000	182	qfrtyg2e35qd	00fa55c3-21b0-4f29-868f-51aa594c24a7	t	2025-09-13 13:41:01.455783+00	2025-09-13 14:39:08.197267+00	\N	ab1cb10f-2229-4816-9409-b5985e2ead01
00000000-0000-0000-0000-000000000000	183	hahucl3q2rys	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-13 14:39:08.198092+00	2025-09-13 14:39:08.198092+00	qfrtyg2e35qd	ab1cb10f-2229-4816-9409-b5985e2ead01
00000000-0000-0000-0000-000000000000	184	gbzkqdo753ve	03b38fc5-b05f-4999-8880-40d616822d7f	f	2025-09-13 14:41:49.645238+00	2025-09-13 14:41:49.645238+00	\N	47c94717-c154-4efb-ad48-0f40f12b2dd1
00000000-0000-0000-0000-000000000000	185	d5ba4lpj3wjd	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-13 14:45:27.252415+00	2025-09-13 14:45:27.252415+00	\N	e32af484-1222-4d4e-8394-88bd8752ae4b
00000000-0000-0000-0000-000000000000	186	zskeijjo6qwh	03b38fc5-b05f-4999-8880-40d616822d7f	f	2025-09-13 15:06:54.029615+00	2025-09-13 15:06:54.029615+00	\N	e6281e48-667e-4982-9e4f-d0689e1b61ee
00000000-0000-0000-0000-000000000000	187	wm5hcnolaut5	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-13 15:16:05.594105+00	2025-09-13 15:16:05.594105+00	\N	c542ba78-ad49-49f0-b6d1-7c06d8683894
00000000-0000-0000-0000-000000000000	188	7wu6e2dggxj6	03b38fc5-b05f-4999-8880-40d616822d7f	t	2025-09-13 15:19:53.291152+00	2025-09-13 16:18:09.777293+00	\N	d961d790-bd78-4bcf-bbc0-92eec9f861db
00000000-0000-0000-0000-000000000000	189	b5lbmrzquiyt	03b38fc5-b05f-4999-8880-40d616822d7f	f	2025-09-13 16:18:09.778287+00	2025-09-13 16:18:09.778287+00	7wu6e2dggxj6	d961d790-bd78-4bcf-bbc0-92eec9f861db
00000000-0000-0000-0000-000000000000	190	4ijypjvqwaop	03b38fc5-b05f-4999-8880-40d616822d7f	t	2025-09-13 16:21:14.941929+00	2025-09-13 17:19:40.041674+00	\N	d47c37e7-dd84-4ff6-98e2-7dec6c7fd2c3
00000000-0000-0000-0000-000000000000	191	ts5vsqjxbpl3	03b38fc5-b05f-4999-8880-40d616822d7f	f	2025-09-13 17:19:40.045233+00	2025-09-13 17:19:40.045233+00	4ijypjvqwaop	d47c37e7-dd84-4ff6-98e2-7dec6c7fd2c3
00000000-0000-0000-0000-000000000000	192	axohspx6scan	03b38fc5-b05f-4999-8880-40d616822d7f	f	2025-09-13 17:48:27.090294+00	2025-09-13 17:48:27.090294+00	\N	5732dab9-c7b0-4a9b-91ec-ff71b4a259f1
00000000-0000-0000-0000-000000000000	193	aius2qctmotk	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-13 18:14:06.611307+00	2025-09-13 18:14:06.611307+00	\N	b13a88c2-ad84-439c-919a-3cddd07e4a82
00000000-0000-0000-0000-000000000000	194	4ktxlzkohsqr	03b38fc5-b05f-4999-8880-40d616822d7f	t	2025-09-13 18:15:03.533607+00	2025-09-13 19:13:12.028483+00	\N	1d18dbd0-3081-4b0a-88a3-991b288c2162
00000000-0000-0000-0000-000000000000	195	u33c6z6u3dzf	03b38fc5-b05f-4999-8880-40d616822d7f	f	2025-09-13 19:13:12.029642+00	2025-09-13 19:13:12.029642+00	4ktxlzkohsqr	1d18dbd0-3081-4b0a-88a3-991b288c2162
00000000-0000-0000-0000-000000000000	196	m5ldrq7umwvh	03b38fc5-b05f-4999-8880-40d616822d7f	f	2025-09-13 19:51:36.659626+00	2025-09-13 19:51:36.659626+00	\N	b6ea9720-6921-4e80-87c0-762f2c2b292a
00000000-0000-0000-0000-000000000000	197	pmrbgapacqby	03b38fc5-b05f-4999-8880-40d616822d7f	f	2025-09-13 20:47:05.891453+00	2025-09-13 20:47:05.891453+00	\N	de507e12-1b44-4a71-b605-e82901479d6a
00000000-0000-0000-0000-000000000000	198	idjwkmj3ho7e	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-13 20:47:42.323303+00	2025-09-13 20:47:42.323303+00	\N	b91a142c-eb25-41ce-b29b-268328d2dbe7
00000000-0000-0000-0000-000000000000	199	orwymnwa6jvw	00fa55c3-21b0-4f29-868f-51aa594c24a7	t	2025-09-13 21:52:54.323657+00	2025-09-13 22:50:58.031671+00	\N	5cb90475-d544-4755-a299-5e3c8d62f08b
00000000-0000-0000-0000-000000000000	200	pwfgp5uf5wfj	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-13 22:50:58.033736+00	2025-09-13 22:50:58.033736+00	orwymnwa6jvw	5cb90475-d544-4755-a299-5e3c8d62f08b
00000000-0000-0000-0000-000000000000	201	z6qynkhqrc6c	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-13 22:59:43.817229+00	2025-09-13 22:59:43.817229+00	\N	c5961b22-6bbc-46a3-a4f4-e56a7f923ecc
00000000-0000-0000-0000-000000000000	202	canaim244tba	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-14 07:36:45.963411+00	2025-09-14 07:36:45.963411+00	\N	c9c2690e-ffe4-4a5c-a347-2a1fb2a3827d
00000000-0000-0000-0000-000000000000	203	u4fy5doz4bvp	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-14 08:37:04.13773+00	2025-09-14 08:37:04.13773+00	\N	514cb2a9-621e-432a-839a-9049f6f88839
00000000-0000-0000-0000-000000000000	204	evr3dqfqria3	03b38fc5-b05f-4999-8880-40d616822d7f	f	2025-09-14 08:38:17.733959+00	2025-09-14 08:38:17.733959+00	\N	45b2fa4e-9f96-4ae7-8787-c49de68aa3e5
00000000-0000-0000-0000-000000000000	205	phaj4upowd7x	03b38fc5-b05f-4999-8880-40d616822d7f	f	2025-09-14 08:39:31.518438+00	2025-09-14 08:39:31.518438+00	\N	3c538793-fb56-41bc-928f-3b10f210316e
00000000-0000-0000-0000-000000000000	206	d6ff2szxzbc2	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-14 08:40:15.474113+00	2025-09-14 08:40:15.474113+00	\N	1ef373aa-33c8-47fe-8740-e15b2e155d8e
00000000-0000-0000-0000-000000000000	207	tnv4kio4sye2	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-14 08:47:00.627259+00	2025-09-14 08:47:00.627259+00	\N	a86e32a3-b178-47cd-8852-97f7d9bac9d3
00000000-0000-0000-0000-000000000000	208	744d3grqzsds	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-14 09:48:34.575056+00	2025-09-14 09:48:34.575056+00	\N	b92c6d7b-7ab9-4515-8a80-c866cdf8956e
00000000-0000-0000-0000-000000000000	209	lgivh2fb6ceu	03b38fc5-b05f-4999-8880-40d616822d7f	f	2025-09-14 09:59:47.176038+00	2025-09-14 09:59:47.176038+00	\N	af5171a0-9f14-442e-a96b-8fa7f9440f5e
00000000-0000-0000-0000-000000000000	210	3woufvuls37y	03b38fc5-b05f-4999-8880-40d616822d7f	f	2025-09-14 11:40:12.997144+00	2025-09-14 11:40:12.997144+00	\N	6ee73abd-58ff-4be5-9a86-65da1519ae3d
00000000-0000-0000-0000-000000000000	211	nzdyrtrdwjfa	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-14 12:45:21.12007+00	2025-09-14 12:45:21.12007+00	\N	a9a0d3c4-d4fa-45e4-9149-1d25ce905f21
00000000-0000-0000-0000-000000000000	212	ftunzw5ixmby	03b38fc5-b05f-4999-8880-40d616822d7f	f	2025-09-14 12:47:54.611602+00	2025-09-14 12:47:54.611602+00	\N	3bf7e496-0faa-4ce8-90ab-5d71319a9615
00000000-0000-0000-0000-000000000000	213	kldaw6tbt5ug	03b38fc5-b05f-4999-8880-40d616822d7f	f	2025-09-14 13:40:07.819848+00	2025-09-14 13:40:07.819848+00	\N	ad01e173-81a9-4a35-87e3-73e4aba02c56
00000000-0000-0000-0000-000000000000	214	rg3owtjxuvrm	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-14 13:41:06.615393+00	2025-09-14 13:41:06.615393+00	\N	d6b956b9-48a3-4b9b-a1c1-7788193db348
00000000-0000-0000-0000-000000000000	215	2vl52wrpvsfm	03b38fc5-b05f-4999-8880-40d616822d7f	f	2025-09-14 13:43:02.760311+00	2025-09-14 13:43:02.760311+00	\N	b862ca20-ccbc-476a-a057-cf19006023e6
00000000-0000-0000-0000-000000000000	216	zpep6dxk7mmf	00fa55c3-21b0-4f29-868f-51aa594c24a7	f	2025-09-14 14:46:38.678811+00	2025-09-14 14:46:38.678811+00	\N	2be04787-08c5-4677-8179-67032ede7afc
00000000-0000-0000-0000-000000000000	217	xdglamfwydra	03b38fc5-b05f-4999-8880-40d616822d7f	t	2025-09-14 14:53:56.758424+00	2025-09-14 16:04:23.134544+00	\N	2a2543ba-54ee-44e9-b310-a62532a77814
00000000-0000-0000-0000-000000000000	218	m4eldtkmsock	03b38fc5-b05f-4999-8880-40d616822d7f	f	2025-09-14 16:04:23.14553+00	2025-09-14 16:04:23.14553+00	xdglamfwydra	2a2543ba-54ee-44e9-b310-a62532a77814
00000000-0000-0000-0000-000000000000	219	jymh3o4naydg	03b38fc5-b05f-4999-8880-40d616822d7f	t	2025-09-14 16:04:47.820461+00	2025-09-14 17:13:42.103444+00	\N	b3605337-502d-4a8f-af50-4fa03b337ec0
00000000-0000-0000-0000-000000000000	220	a5p2oeefxbye	03b38fc5-b05f-4999-8880-40d616822d7f	f	2025-09-14 17:13:42.109825+00	2025-09-14 17:13:42.109825+00	jymh3o4naydg	b3605337-502d-4a8f-af50-4fa03b337ec0
00000000-0000-0000-0000-000000000000	221	s6ud2cwnysei	03b38fc5-b05f-4999-8880-40d616822d7f	f	2025-09-14 17:26:07.68811+00	2025-09-14 17:26:07.68811+00	\N	15980fc4-9d18-445b-944a-c474d03453d7
00000000-0000-0000-0000-000000000000	222	gjecm4lfnn6r	03b38fc5-b05f-4999-8880-40d616822d7f	f	2025-09-14 20:50:20.633228+00	2025-09-14 20:50:20.633228+00	\N	d8bf9439-44ca-4ea4-8963-004c3d825f5b
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
e32af484-1222-4d4e-8394-88bd8752ae4b	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-13 14:45:27.251271+00	2025-09-13 14:45:27.251271+00	\N	aal1	\N	\N	node	172.18.0.1	\N
13a11978-e334-4b7a-a043-4ed47b87cf4f	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-11 11:54:55.685189+00	2025-09-11 13:51:02.837422+00	\N	aal1	\N	2025-09-11 13:51:02.837364	node	172.18.0.1	\N
7386632d-1397-402e-9553-43bd1297ef78	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-11 14:09:16.218847+00	2025-09-11 15:07:38.575646+00	\N	aal1	\N	2025-09-11 15:07:38.575609	node	172.18.0.1	\N
22475981-1f0d-4d6a-9b9b-44c41cdb56cc	385a10fe-7a72-44cf-ba01-746c7f05d7a1	2025-09-04 08:10:55.662025+00	2025-09-04 08:10:55.662025+00	\N	aal1	\N	\N	node	172.18.0.1	\N
bb356aa0-d0d8-46e1-b5e5-da0f98f307f2	385a10fe-7a72-44cf-ba01-746c7f05d7a1	2025-09-04 13:36:42.962507+00	2025-09-04 13:36:42.962507+00	\N	aal1	\N	\N	node	172.18.0.1	\N
a99517f6-f103-41d5-b516-7a6de2229141	0b9f8b4c-2a80-4846-87cb-3bf05f0121cb	2025-09-10 10:05:17.628092+00	2025-09-10 11:04:56.172616+00	\N	aal1	\N	2025-09-10 11:04:56.172547	node	172.18.0.1	\N
52f201d9-1871-4b6b-9a1f-18af480407db	385a10fe-7a72-44cf-ba01-746c7f05d7a1	2025-09-10 11:06:47.06073+00	2025-09-10 11:06:47.06073+00	\N	aal1	\N	\N	node	172.18.0.1	\N
bc1ec226-f616-412b-b220-fe5c73028761	385a10fe-7a72-44cf-ba01-746c7f05d7a1	2025-09-10 12:26:54.862806+00	2025-09-10 12:26:54.862806+00	\N	aal1	\N	\N	node	172.18.0.1	\N
5e8a2ad6-e972-41e8-8202-a2d9753119c0	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-10 12:33:33.654848+00	2025-09-10 12:33:33.654848+00	\N	aal1	\N	\N	node	172.18.0.1	\N
e03d43d9-a794-42c9-8d58-4b4d45c90d96	03b38fc5-b05f-4999-8880-40d616822d7f	2025-09-10 12:33:49.028743+00	2025-09-10 12:33:49.028743+00	\N	aal1	\N	\N	node	172.18.0.1	\N
1f816ea4-6197-48a3-bf84-09c598579d7c	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-10 12:38:36.148176+00	2025-09-10 12:38:36.148176+00	\N	aal1	\N	\N	node	172.18.0.1	\N
edf22ea3-f28d-4f36-aaa2-84b72dd70a4d	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-10 12:40:17.976263+00	2025-09-10 12:40:17.976263+00	\N	aal1	\N	\N	node	172.18.0.1	\N
1292ec9d-8062-43a5-8cd5-0d05b8d06f12	03b38fc5-b05f-4999-8880-40d616822d7f	2025-09-10 14:09:44.683825+00	2025-09-10 14:09:44.683825+00	\N	aal1	\N	\N	node	172.18.0.1	\N
d99cc498-ff6e-471b-87a2-591b8ff423c2	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-10 14:09:56.566928+00	2025-09-10 14:09:56.566928+00	\N	aal1	\N	\N	node	172.18.0.1	\N
29e8a688-9178-411e-8190-ec7cd859e059	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-10 21:24:53.774544+00	2025-09-10 21:24:53.774544+00	\N	aal1	\N	\N	node	172.18.0.1	\N
54158e4f-01ed-4cb8-8bbc-9182e586d78e	385a10fe-7a72-44cf-ba01-746c7f05d7a1	2025-09-10 21:25:19.494315+00	2025-09-10 21:25:19.494315+00	\N	aal1	\N	\N	node	172.18.0.1	\N
78d93cbf-cb6c-495e-b765-d1a1951f1307	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-10 21:30:19.767919+00	2025-09-10 21:30:19.767919+00	\N	aal1	\N	\N	node	172.18.0.1	\N
8fbacf1e-9540-419d-a249-a7e85281b44a	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-10 22:46:36.711034+00	2025-09-10 23:45:02.480273+00	\N	aal1	\N	2025-09-10 23:45:02.480223	node	172.18.0.1	\N
30c7426e-1a26-4cae-9c42-39df0fc535fb	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-10 23:49:57.05957+00	2025-09-11 00:48:03.335973+00	\N	aal1	\N	2025-09-11 00:48:03.33594	node	172.18.0.1	\N
579d32bd-6a7a-40a0-8e64-a28221ab8fa2	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-11 08:48:49.416062+00	2025-09-11 08:48:49.416062+00	\N	aal1	\N	\N	node	172.18.0.1	\N
52913571-c63f-424f-8418-f740285e8531	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-11 10:18:21.95149+00	2025-09-11 10:18:21.95149+00	\N	aal1	\N	\N	node	172.18.0.1	\N
24b7d946-e3b1-484f-91b4-b6559339f232	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-11 11:38:10.347534+00	2025-09-11 11:38:10.347534+00	\N	aal1	\N	\N	node	172.18.0.1	\N
8aa973b7-9049-4400-9c3f-54ef762a6ae0	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-11 11:49:49.872302+00	2025-09-11 11:49:49.872302+00	\N	aal1	\N	\N	node	172.18.0.1	\N
4e6f9de3-74a1-4c9f-9707-5825d5c6e638	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-11 11:51:15.78798+00	2025-09-11 11:51:15.78798+00	\N	aal1	\N	\N	node	172.18.0.1	\N
4c96a820-4b93-4556-8eaa-06f7b699b960	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-11 11:52:47.229867+00	2025-09-11 11:52:47.229867+00	\N	aal1	\N	\N	node	172.18.0.1	\N
f2a9dcf9-c856-4131-8796-0cbb255b4133	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-11 11:53:17.88521+00	2025-09-11 11:53:17.88521+00	\N	aal1	\N	\N	node	172.18.0.1	\N
24010a60-4f7f-4a96-8af5-4868aec79e8f	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-11 15:19:14.90126+00	2025-09-11 16:17:39.501358+00	\N	aal1	\N	2025-09-11 16:17:39.501323	node	172.18.0.1	\N
e6281e48-667e-4982-9e4f-d0689e1b61ee	03b38fc5-b05f-4999-8880-40d616822d7f	2025-09-13 15:06:54.029004+00	2025-09-13 15:06:54.029004+00	\N	aal1	\N	\N	node	172.18.0.1	\N
c542ba78-ad49-49f0-b6d1-7c06d8683894	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-13 15:16:05.593333+00	2025-09-13 15:16:05.593333+00	\N	aal1	\N	\N	node	172.18.0.1	\N
0eea104c-de6d-4f24-89f3-5939d9ae0bc9	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-11 16:26:35.083218+00	2025-09-11 19:20:40.636635+00	\N	aal1	\N	2025-09-11 19:20:40.636584	node	172.18.0.1	\N
f83b5ff0-d5dc-4ebb-b565-8ca9fdade3a4	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-12 08:28:49.790221+00	2025-09-12 08:28:49.790221+00	\N	aal1	\N	\N	node	172.18.0.1	\N
f945ce16-2171-4b53-89b1-d25df6afba69	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-12 09:31:38.164099+00	2025-09-12 09:31:38.164099+00	\N	aal1	\N	\N	node	172.18.0.1	\N
3a5df8ae-4461-4d98-b4ad-5e0549077b05	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-12 11:14:18.600644+00	2025-09-12 12:12:44.711282+00	\N	aal1	\N	2025-09-12 12:12:44.711231	node	172.18.0.1	\N
fda93864-5fa9-4333-8fd3-6cde948f798a	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-12 12:14:30.226699+00	2025-09-12 13:53:35.432387+00	\N	aal1	\N	2025-09-12 13:53:35.432305	node	172.18.0.1	\N
fae6100b-0882-4132-b7ac-f02660889b7d	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-12 13:54:00.585971+00	2025-09-12 14:52:06.204462+00	\N	aal1	\N	2025-09-12 14:52:06.204335	node	172.18.0.1	\N
4b4641d6-1526-4e3c-95e3-dab1b33a968b	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-12 15:11:39.631257+00	2025-09-12 15:11:39.631257+00	\N	aal1	\N	\N	node	172.18.0.1	\N
cf44effb-c478-44dc-ab1a-41ba9abf10b8	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-12 15:54:46.151496+00	2025-09-12 16:53:07.312709+00	\N	aal1	\N	2025-09-12 16:53:07.31266	node	172.18.0.1	\N
2fc5a4a6-a9ee-4f94-ab45-795b758ab068	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-12 17:05:23.31925+00	2025-09-12 18:43:03.450582+00	\N	aal1	\N	2025-09-12 18:43:03.450482	node	172.18.0.1	\N
0f61a957-0fcb-4351-9a6f-18c66078c553	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-12 20:21:32.682312+00	2025-09-12 21:19:35.157836+00	\N	aal1	\N	2025-09-12 21:19:35.157595	node	172.18.0.1	\N
c6ca5477-d792-4e18-bb0d-0b4700d8f4b4	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-12 21:23:54.895998+00	2025-09-12 21:23:54.895998+00	\N	aal1	\N	\N	node	172.18.0.1	\N
4e1f8379-3f43-4411-8ce5-29ed8587530e	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-13 07:38:27.148079+00	2025-09-13 08:36:32.768761+00	\N	aal1	\N	2025-09-13 08:36:32.768722	node	172.18.0.1	\N
872ce270-03ab-4ffd-99b9-37d2b627c358	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-13 08:43:00.093945+00	2025-09-13 11:12:34.119319+00	\N	aal1	\N	2025-09-13 11:12:34.119237	node	172.18.0.1	\N
4560a732-016a-4b26-8dc3-3f66cbe145c4	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-13 11:12:49.671813+00	2025-09-13 11:12:49.671813+00	\N	aal1	\N	\N	node	172.18.0.1	\N
bae47c0d-5735-4171-b5be-9da3af321721	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-13 11:21:20.858928+00	2025-09-13 11:21:20.858928+00	\N	aal1	\N	\N	node	172.18.0.1	\N
8d3b3126-f52d-4c7b-933a-3616fa3c6504	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-13 11:21:47.311359+00	2025-09-13 11:21:47.311359+00	\N	aal1	\N	\N	node	172.18.0.1	\N
ce5f6c8d-ae5d-4ffc-858c-a6dafa3861de	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-13 11:24:13.239254+00	2025-09-13 11:24:13.239254+00	\N	aal1	\N	\N	node	172.18.0.1	\N
bf368bed-a94a-4f77-8bb4-e96d7dc6b74e	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-13 11:25:29.909812+00	2025-09-13 12:23:54.491042+00	\N	aal1	\N	2025-09-13 12:23:54.491008	node	172.18.0.1	\N
8fc63632-a6d8-47f8-9cca-24d366b1192e	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-13 12:35:18.12451+00	2025-09-13 12:35:18.12451+00	\N	aal1	\N	\N	node	172.18.0.1	\N
398089a6-38a5-45aa-8290-e82d8409a0ea	385a10fe-7a72-44cf-ba01-746c7f05d7a1	2025-09-13 12:46:57.064224+00	2025-09-13 12:46:57.064224+00	\N	aal1	\N	\N	node	172.18.0.1	\N
b7eb3865-b9ef-435a-8951-d6a5f9c9d076	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-13 12:48:16.267112+00	2025-09-13 12:48:16.267112+00	\N	aal1	\N	\N	node	172.18.0.1	\N
362e03d5-fbca-4734-816d-a32e95c16e47	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-13 12:54:41.879255+00	2025-09-13 12:54:41.879255+00	\N	aal1	\N	\N	node	172.18.0.1	\N
69bee796-af81-4954-a930-1136d0ca4f7e	385a10fe-7a72-44cf-ba01-746c7f05d7a1	2025-09-13 13:29:31.834611+00	2025-09-13 13:29:31.834611+00	\N	aal1	\N	\N	node	172.18.0.1	\N
01daa17d-aec5-4643-98b2-75cdb3fa45a3	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-13 13:29:58.177673+00	2025-09-13 13:29:58.177673+00	\N	aal1	\N	\N	node	172.18.0.1	\N
ab1cb10f-2229-4816-9409-b5985e2ead01	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-13 13:41:01.454952+00	2025-09-13 14:39:08.200413+00	\N	aal1	\N	2025-09-13 14:39:08.20038	node	172.18.0.1	\N
47c94717-c154-4efb-ad48-0f40f12b2dd1	03b38fc5-b05f-4999-8880-40d616822d7f	2025-09-13 14:41:49.644299+00	2025-09-13 14:41:49.644299+00	\N	aal1	\N	\N	node	172.18.0.1	\N
d961d790-bd78-4bcf-bbc0-92eec9f861db	03b38fc5-b05f-4999-8880-40d616822d7f	2025-09-13 15:19:53.290524+00	2025-09-13 16:18:09.78105+00	\N	aal1	\N	2025-09-13 16:18:09.781017	node	172.18.0.1	\N
d47c37e7-dd84-4ff6-98e2-7dec6c7fd2c3	03b38fc5-b05f-4999-8880-40d616822d7f	2025-09-13 16:21:14.940089+00	2025-09-13 17:19:40.050894+00	\N	aal1	\N	2025-09-13 17:19:40.050832	node	172.18.0.1	\N
5732dab9-c7b0-4a9b-91ec-ff71b4a259f1	03b38fc5-b05f-4999-8880-40d616822d7f	2025-09-13 17:48:27.089128+00	2025-09-13 17:48:27.089128+00	\N	aal1	\N	\N	node	172.18.0.1	\N
b13a88c2-ad84-439c-919a-3cddd07e4a82	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-13 18:14:06.609698+00	2025-09-13 18:14:06.609698+00	\N	aal1	\N	\N	node	172.18.0.1	\N
1d18dbd0-3081-4b0a-88a3-991b288c2162	03b38fc5-b05f-4999-8880-40d616822d7f	2025-09-13 18:15:03.532814+00	2025-09-13 19:13:12.032351+00	\N	aal1	\N	2025-09-13 19:13:12.032299	node	172.18.0.1	\N
b6ea9720-6921-4e80-87c0-762f2c2b292a	03b38fc5-b05f-4999-8880-40d616822d7f	2025-09-13 19:51:36.656803+00	2025-09-13 19:51:36.656803+00	\N	aal1	\N	\N	node	172.18.0.1	\N
de507e12-1b44-4a71-b605-e82901479d6a	03b38fc5-b05f-4999-8880-40d616822d7f	2025-09-13 20:47:05.889157+00	2025-09-13 20:47:05.889157+00	\N	aal1	\N	\N	node	172.18.0.1	\N
b91a142c-eb25-41ce-b29b-268328d2dbe7	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-13 20:47:42.31734+00	2025-09-13 20:47:42.31734+00	\N	aal1	\N	\N	node	172.18.0.1	\N
5cb90475-d544-4755-a299-5e3c8d62f08b	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-13 21:52:54.319082+00	2025-09-13 22:50:58.038958+00	\N	aal1	\N	2025-09-13 22:50:58.038853	node	172.18.0.1	\N
c5961b22-6bbc-46a3-a4f4-e56a7f923ecc	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-13 22:59:43.815164+00	2025-09-13 22:59:43.815164+00	\N	aal1	\N	\N	node	172.18.0.1	\N
c9c2690e-ffe4-4a5c-a347-2a1fb2a3827d	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-14 07:36:45.959719+00	2025-09-14 07:36:45.959719+00	\N	aal1	\N	\N	node	172.18.0.1	\N
514cb2a9-621e-432a-839a-9049f6f88839	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-14 08:37:04.136011+00	2025-09-14 08:37:04.136011+00	\N	aal1	\N	\N	node	172.18.0.1	\N
45b2fa4e-9f96-4ae7-8787-c49de68aa3e5	03b38fc5-b05f-4999-8880-40d616822d7f	2025-09-14 08:38:17.733269+00	2025-09-14 08:38:17.733269+00	\N	aal1	\N	\N	node	172.18.0.1	\N
3c538793-fb56-41bc-928f-3b10f210316e	03b38fc5-b05f-4999-8880-40d616822d7f	2025-09-14 08:39:31.515999+00	2025-09-14 08:39:31.515999+00	\N	aal1	\N	\N	node	172.18.0.1	\N
1ef373aa-33c8-47fe-8740-e15b2e155d8e	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-14 08:40:15.473249+00	2025-09-14 08:40:15.473249+00	\N	aal1	\N	\N	node	172.18.0.1	\N
a86e32a3-b178-47cd-8852-97f7d9bac9d3	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-14 08:47:00.626352+00	2025-09-14 08:47:00.626352+00	\N	aal1	\N	\N	node	172.18.0.1	\N
b92c6d7b-7ab9-4515-8a80-c866cdf8956e	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-14 09:48:34.573256+00	2025-09-14 09:48:34.573256+00	\N	aal1	\N	\N	node	172.18.0.1	\N
af5171a0-9f14-442e-a96b-8fa7f9440f5e	03b38fc5-b05f-4999-8880-40d616822d7f	2025-09-14 09:59:47.174033+00	2025-09-14 09:59:47.174033+00	\N	aal1	\N	\N	node	172.18.0.1	\N
6ee73abd-58ff-4be5-9a86-65da1519ae3d	03b38fc5-b05f-4999-8880-40d616822d7f	2025-09-14 11:40:12.995259+00	2025-09-14 11:40:12.995259+00	\N	aal1	\N	\N	node	172.18.0.1	\N
a9a0d3c4-d4fa-45e4-9149-1d25ce905f21	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-14 12:45:21.117963+00	2025-09-14 12:45:21.117963+00	\N	aal1	\N	\N	node	172.18.0.1	\N
3bf7e496-0faa-4ce8-90ab-5d71319a9615	03b38fc5-b05f-4999-8880-40d616822d7f	2025-09-14 12:47:54.604665+00	2025-09-14 12:47:54.604665+00	\N	aal1	\N	\N	node	172.18.0.1	\N
ad01e173-81a9-4a35-87e3-73e4aba02c56	03b38fc5-b05f-4999-8880-40d616822d7f	2025-09-14 13:40:07.817753+00	2025-09-14 13:40:07.817753+00	\N	aal1	\N	\N	node	172.18.0.1	\N
d6b956b9-48a3-4b9b-a1c1-7788193db348	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-14 13:41:06.614464+00	2025-09-14 13:41:06.614464+00	\N	aal1	\N	\N	node	172.18.0.1	\N
b862ca20-ccbc-476a-a057-cf19006023e6	03b38fc5-b05f-4999-8880-40d616822d7f	2025-09-14 13:43:02.759595+00	2025-09-14 13:43:02.759595+00	\N	aal1	\N	\N	node	172.18.0.1	\N
2be04787-08c5-4677-8179-67032ede7afc	00fa55c3-21b0-4f29-868f-51aa594c24a7	2025-09-14 14:46:38.676434+00	2025-09-14 14:46:38.676434+00	\N	aal1	\N	\N	node	172.18.0.1	\N
2a2543ba-54ee-44e9-b310-a62532a77814	03b38fc5-b05f-4999-8880-40d616822d7f	2025-09-14 14:53:56.757342+00	2025-09-14 16:04:23.152931+00	\N	aal1	\N	2025-09-14 16:04:23.152186	node	172.18.0.1	\N
b3605337-502d-4a8f-af50-4fa03b337ec0	03b38fc5-b05f-4999-8880-40d616822d7f	2025-09-14 16:04:47.819287+00	2025-09-14 17:13:42.120521+00	\N	aal1	\N	2025-09-14 17:13:42.12044	node	172.18.0.1	\N
15980fc4-9d18-445b-944a-c474d03453d7	03b38fc5-b05f-4999-8880-40d616822d7f	2025-09-14 17:26:07.686732+00	2025-09-14 17:26:07.686732+00	\N	aal1	\N	\N	node	172.18.0.1	\N
d8bf9439-44ca-4ea4-8963-004c3d825f5b	03b38fc5-b05f-4999-8880-40d616822d7f	2025-09-14 20:50:20.629837+00	2025-09-14 20:50:20.629837+00	\N	aal1	\N	\N	node	172.18.0.1	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	31362d65-5571-4686-8e3a-78a51860e3d0	authenticated	authenticated	customer@motortrace.com	$2a$10$HUDDKVphFryQM3WSJBswouVf7duxtYKhmxGAfjUIrWsX6p/duIFGC	2025-08-16 16:14:43.954462+00	\N		\N		\N			\N	2025-08-18 02:40:03.448756+00	{"provider": "email", "providers": ["email"]}	{"name": "John Customer", "role": "customer", "phone": "+1234567895", "email_verified": true}	\N	2025-08-16 16:14:43.951286+00	2025-08-18 02:40:03.454207+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	03b38fc5-b05f-4999-8880-40d616822d7f	authenticated	authenticated	manager@motortrace.com	$2a$10$qoRjtmhJirlRMe6fhNUhFec0jJZLwJqSOcSF7E7jckNakxfknqfmq	2025-08-16 16:14:43.682701+00	\N		\N		\N			\N	2025-09-14 20:50:20.629672+00	{"provider": "email", "providers": ["email"]}	{"name": "Service Manager", "role": "manager", "phone": "+1234567891", "email_verified": true}	\N	2025-08-16 16:14:43.679996+00	2025-09-14 20:50:20.639718+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	385a10fe-7a72-44cf-ba01-746c7f05d7a1	authenticated	authenticated	admin@motortrace.com	$2a$10$lfkDLfLh.D.6mUK/6O8IE.WJpzcu5lLo6DYv.ySZzCcWwJC4VdeRa	2025-08-16 16:14:43.584233+00	\N		\N		\N			\N	2025-09-13 13:29:31.834577+00	{"provider": "email", "providers": ["email"]}	{"name": "System Administrator", "role": "admin", "phone": "+1234567890", "email_verified": true}	\N	2025-08-16 16:14:43.574131+00	2025-09-13 13:29:31.83981+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	6a2a3ac0-8191-4a76-b2ea-cfa84c474fb3	authenticated	authenticated	inventory@motortrace.com	$2a$10$mYng1lIMNvgsD9CGYkeyte0fKF9/dCUzPQUFQF44IAkjTEXGi0SgW	2025-08-16 16:14:43.818767+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"name": "Inventory Manager", "role": "inventory_manager", "phone": "+1234567893", "email_verified": true}	\N	2025-08-16 16:14:43.81615+00	2025-08-16 16:14:43.819182+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	00fa55c3-21b0-4f29-868f-51aa594c24a7	authenticated	authenticated	advisor@motortrace.com	$2a$10$KRlPlD7EOib2a6eLKHZ7hOPHZaJc0HvywO./SVZyEdocPY/RnJpUW	2025-08-16 16:14:43.74989+00	\N		\N		\N			\N	2025-09-14 14:46:38.67632+00	{"provider": "email", "providers": ["email"]}	{"name": "Service Advisor", "role": "service_advisor", "phone": "+1234567892", "email_verified": true}	\N	2025-08-16 16:14:43.746955+00	2025-09-14 14:46:38.680537+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	c1f6d878-70fd-48b3-8c43-4b80df50ca2f	authenticated	authenticated	technician@motortrace.com	$2a$10$/HMy.VlaBxR995MvK2QJNuG.zTokHqax2TM0a.nf3UiQF/HDeYMS.	2025-08-16 16:14:43.890413+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"name": "Lead Technician", "role": "technician", "phone": "+1234567894", "email_verified": true}	\N	2025-08-16 16:14:43.884813+00	2025-08-16 16:14:43.890941+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	0b9f8b4c-2a80-4846-87cb-3bf05f0121cb	authenticated	authenticated	abdulla123@example.com	$2a$10$Jvd.MnGGHoU/17/Ew/TkmehXtPlg/yBYQ04veCkGGfV8H/cS/V/bi	2025-09-04 08:00:37.227671+00	\N		\N		\N			\N	2025-09-10 10:05:17.628043+00	{"provider": "email", "providers": ["email"]}	{"sub": "0b9f8b4c-2a80-4846-87cb-3bf05f0121cb", "name": "Kattayan", "role": "customer", "email": "abdulla123@example.com", "phone": "+1234567890", "email_verified": true, "phone_verified": false, "profileImageUrl": "http://127.0.0.1:54321/storage/v1/object/public/profile-images/0b9f8b4c-2a80-4846-87cb-3bf05f0121cb/d7a339eb-f7dd-4f03-b85e-861695eb4e10.png", "isRegistrationComplete": true}	\N	2025-09-04 08:00:37.220835+00	2025-09-10 11:04:56.169157+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: Admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Admin" (id, "userProfileId", "employeeId", permissions, "createdAt", "updatedAt") FROM stdin;
admin_4614dc0d-efe3-47b6-b9a9-f36923815ca6	cmeegjqdk0000uung6xaomqfb	EMP001	{USER_MANAGEMENT,SYSTEM_SETTINGS,REPORTS,FULL_ACCESS}	2025-08-18 00:57:01.632	2025-08-18 00:57:01.632
\.


--
-- Data for Name: Appointment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Appointment" (id, "customerId", "vehicleId", "requestedAt", "startTime", "endTime", status, priority, notes, "createdAt", "updatedAt", "assignedToId") FROM stdin;
cmf5i0kkc0001uu9g6h4ubgmv	cmeegjqmy000cuungykprix4g	veh_31af194c-dbeb-4300-a13b-19a946b6d43d	2025-08-05 10:00:00	2025-08-05 10:00:00	2025-08-05 12:00:00	CONFIRMED	HIGH	Try	2025-09-04 14:25:35.773	2025-09-14 13:40:48.832	sa_93405c38-b518-4a55-a0a2-d724f329d392
\.


--
-- Data for Name: AppointmentCannedService; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AppointmentCannedService" (id, "appointmentId", "cannedServiceId", quantity, price, notes) FROM stdin;
\.


--
-- Data for Name: CannedService; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CannedService" (id, code, name, description, duration, price, "isAvailable", "createdAt", "updatedAt") FROM stdin;
cs_002	BRAKE_INSPECTION_SERVICE	Brake System Inspection	Complete brake system inspection and fluid check	45	129.99	t	2025-08-16 16:30:22.753	2025-08-16 16:30:22.753
cs_003	TIRE_ROTATION_SERVICE	Tire Rotation Service	Tire rotation and pressure check	20	49.99	t	2025-08-16 16:30:22.753	2025-08-16 16:30:22.753
cs_004	ENGINE_DIAGNOSTIC_SERVICE	Engine Diagnostic Service	Computer diagnostic scan and engine analysis	60	149.99	t	2025-08-16 16:30:22.753	2025-08-16 16:30:22.753
cs_005	BATTERY_SERVICE	Battery Test and Service	Battery testing and terminal cleaning	15	39.99	t	2025-08-16 16:30:22.753	2025-08-16 16:30:22.753
cs_006	TUNE_UP_SERVICE	Engine Tune-Up Service	Complete engine tune-up with spark plugs and filters	90	199.99	t	2025-08-16 16:30:22.753	2025-08-16 16:30:22.753
cs_007	COMPLETE_BRAKE_SERVICE	Complete Brake Service	Brake inspection, pad replacement, and fluid bleeding	120	299.99	t	2025-08-16 16:30:22.753	2025-08-16 16:30:22.753
cs_001	OIL_CHANGE_SERVICE	Oil Change Service	Complete oil change with filter replacement	30	75.00	t	2025-08-16 16:30:22.753	2025-08-30 19:57:32.482
\.


--
-- Data for Name: CannedServiceLabor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CannedServiceLabor" (id, "cannedServiceId", "laborCatalogId", sequence, notes) FROM stdin;
csl_001	cs_001	labor_001	1	Drain oil and replace filter
csl_002	cs_002	labor_002	1	Complete brake system inspection
csl_003	cs_003	labor_003	1	Rotate tires and check pressure
csl_004	cs_004	labor_004	1	Computer diagnostic scan
csl_005	cs_005	labor_005	1	Test battery and clean terminals
csl_006	cs_006	labor_004	1	Engine diagnostic and tune-up
csl_007	cs_007	labor_002	1	Initial brake system inspection
csl_008	cs_007	labor_006	2	Replace brake pads and resurface rotors
csl_009	cs_007	labor_007	3	Bleed brake system and replace fluid
\.


--
-- Data for Name: CannedServicePartsCategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CannedServicePartsCategory" (id, "cannedServiceId", "categoryId", "isRequired", notes) FROM stdin;
\.


--
-- Data for Name: Customer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Customer" (id, "userProfileId", name, email, phone, "createdAt", "updatedAt") FROM stdin;
cmeegjqmy000cuungykprix4g	cmeegjqmu000auungyplrg2fg	Steve Smith	stevesmith@example.com	+1234567890	2025-08-16 16:14:44.122	2025-09-04 08:34:23.172
cmf54ib0v0002uub58hrhc0bh	cmf54ib0d0000uub528x2xn47	Kattayan	abdulla123@example.com	+1234567890	2025-09-04 08:07:28.591	2025-09-10 10:11:32.734
\.


--
-- Data for Name: EstimateLabor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EstimateLabor" (id, "estimateId", "laborCatalogId", description, hours, rate, subtotal, notes, "customerApproved", "customerNotes", "cannedServiceId", "serviceDiscountAmount", "serviceDiscountType", "createdAt", "updatedAt") FROM stdin;
cmfk6fv5p0005uuokvya165jq	cmfk65nl40001uuokv47znyk4	labor_001	Oil Change Service	0.50	75.00	75.00	Drain oil and replace filter	f	\N	cs_001	\N	\N	2025-09-14 20:58:06.589	2025-09-14 20:58:06.589
\.


--
-- Data for Name: EstimatePart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EstimatePart" (id, "estimateId", "inventoryItemId", quantity, "unitPrice", subtotal, source, "supplierName", "warrantyInfo", notes, "customerApproved", "customerNotes", "cannedServiceId", "serviceDiscountAmount", "serviceDiscountType", "createdAt", "updatedAt") FROM stdin;
cmfk6632p0003uuokb9j4rbl8	cmfk65nl40001uuokv47znyk4	inv_008	1	3200.00	3200.00	INVENTORY	\N	\N	\N	f	\N	\N	\N	\N	2025-09-14 20:50:30.289	2025-09-14 20:50:30.289
\.


--
-- Data for Name: InspectionChecklistItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InspectionChecklistItem" (id, "inspectionId", "templateItemId", category, item, status, notes, "requiresFollowUp", "createdAt") FROM stdin;
cmfjt5yoc0003uuekl7quwk5s	cmfjt5yns0001uuekw3cz4pu4	item_cooling_02	Cooling	Coolant condition	GREEN	\N	f	2025-09-14 14:46:29.581
cmfjt5yod0005uuek0b5jg30y	cmfjt5yns0001uuekw3cz4pu4	item_cooling_01	Cooling	Coolant level	GREEN	\N	f	2025-09-14 14:46:29.581
cmfjt5yos0009uuekd77re49c	cmfjt5yns0001uuekw3cz4pu4	item_cooling_07	Cooling	Hose condition	GREEN	\N	f	2025-09-14 14:46:29.581
cmfjt5yos0008uuekvpla3di9	cmfjt5yns0001uuekw3cz4pu4	item_cooling_04	Cooling	Water pump operation	GREEN	\N	f	2025-09-14 14:46:29.581
cmfjt5yot000buueka9e80w25	cmfjt5yns0001uuekw3cz4pu4	item_cooling_06	Cooling	Cooling fan operation	GREEN	\N	f	2025-09-14 14:46:29.581
cmfjt5yow000fuuek6xfega5z	cmfjt5yns0001uuekw3cz4pu4	item_cooling_03	Cooling	Radiator condition	GREEN	\N	f	2025-09-14 14:46:29.581
cmfjt5yov000duuekmzk2qt15	cmfjt5yns0001uuekw3cz4pu4	item_cooling_05	Cooling	Thermostat operation	GREEN	\N	f	2025-09-14 14:46:29.581
\.


--
-- Data for Name: InspectionTemplate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InspectionTemplate" (id, name, description, category, "imageUrl", "isActive", "sortOrder", "createdAt", "updatedAt") FROM stdin;
template_cooling_system	Cooling System	Complete cooling system inspection including coolant, radiator, water pump, and related components	Mechanical	https://hpautomotive.com.au/wp-content/uploads/2021/03/The-Top-8-Common-Cooling-System-Issues-to-Look-Out-For.jpg	t	2	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
template_engine_mechanical	Engine (Mechanical Condition)	Comprehensive mechanical inspection of engine components including oil, coolant, belts, and mounts	Mechanical	https://autoedu.info/wp-content/uploads/2021/07/Engine-mechanical-testing.jpg	t	1	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
template_electrical_system	Electrical System	Electrical system inspection covering battery, alternator, starter, lights, and wiring	Electrical	https://aamcominnesota.com/wp-content/uploads/2018/10/battery-header.jpg	t	3	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
template_steering_suspension	Steering & Suspension	Steering and suspension system inspection including steering components, shocks, and alignment	Mechanical	https://res.cloudinary.com/yourmechanic/image/upload/dpr_auto,f_auto,q_auto/v1/article_images/suspension_system	t	4	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
\.


--
-- Data for Name: InspectionTemplateItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InspectionTemplateItem" (id, "templateId", name, description, category, "sortOrder", "isRequired", "allowsNotes", "createdAt", "updatedAt") FROM stdin;
item_engine_01	template_engine_mechanical	Oil in air cleaner	Check for oil contamination in the air cleaner/filter housing	Engine	1	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_engine_02	template_engine_mechanical	Water in oil	Check for water contamination in engine oil (milky appearance)	Engine	2	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_engine_03	template_engine_mechanical	Oil level	Check engine oil level using dipstick	Engine	3	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_engine_04	template_engine_mechanical	Oil condition	Assess oil color, smell, and contamination level	Engine	4	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_engine_05	template_engine_mechanical	Oil leaks	Inspect for oil leaks around engine, gaskets, and seals	Engine	5	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_engine_06	template_engine_mechanical	Coolant leaks	Check for coolant leaks around engine and cooling system	Engine	6	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_engine_07	template_engine_mechanical	Belt condition	Inspect drive belts for wear, cracks, and proper tension	Engine	7	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_engine_08	template_engine_mechanical	Hose condition	Check all engine hoses for cracks, leaks, and deterioration	Engine	8	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_engine_09	template_engine_mechanical	Engine mounts	Inspect engine mounts for wear, damage, and proper alignment	Engine	9	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_cooling_01	template_cooling_system	Coolant level	Check coolant level in radiator and overflow tank	Cooling	1	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_cooling_02	template_cooling_system	Coolant condition	Assess coolant color, contamination, and freeze protection	Cooling	2	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_cooling_03	template_cooling_system	Radiator condition	Inspect radiator for damage, corrosion, and debris	Cooling	3	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_cooling_04	template_cooling_system	Water pump operation	Check water pump for leaks and proper operation	Cooling	4	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_cooling_05	template_cooling_system	Thermostat operation	Test thermostat operation and temperature regulation	Cooling	5	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_cooling_06	template_cooling_system	Cooling fan operation	Check electric cooling fan operation and temperature sensors	Cooling	6	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_cooling_07	template_cooling_system	Hose condition	Inspect all cooling system hoses for damage and leaks	Cooling	7	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_electrical_01	template_electrical_system	Battery condition	Check battery voltage, charge level, and overall condition	Electrical	1	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_electrical_02	template_electrical_system	Battery terminals	Inspect battery terminals for corrosion and tight connections	Electrical	2	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_electrical_03	template_electrical_system	Alternator output	Test alternator output voltage and charging system	Electrical	3	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_electrical_04	template_electrical_system	Starter operation	Test starter motor operation and engagement	Electrical	4	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_electrical_05	template_electrical_system	Lights operation	Check all exterior and interior lights for proper operation	Electrical	5	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_electrical_06	template_electrical_system	Warning lights	Check dashboard warning lights and instrument cluster	Electrical	6	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_electrical_07	template_electrical_system	Wiring condition	Inspect visible wiring for damage, corrosion, and proper routing	Electrical	7	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_steering_01	template_steering_suspension	Steering wheel play	Check steering wheel for excessive play and responsiveness	Steering	1	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_steering_02	template_steering_suspension	Power steering fluid	Check power steering fluid level and condition	Steering	2	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_steering_03	template_steering_suspension	Tie rod ends	Inspect tie rod ends for wear and play	Steering	3	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_steering_04	template_steering_suspension	Ball joints	Check ball joints for wear, play, and grease condition	Suspension	4	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_steering_05	template_steering_suspension	Struts/Shocks	Inspect struts and shock absorbers for leaks and condition	Suspension	5	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_steering_06	template_steering_suspension	Springs	Check coil springs and leaf springs for damage and sagging	Suspension	6	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
item_steering_07	template_steering_suspension	Alignment check	Perform basic alignment check and measure toe settings	Suspension	7	t	t	2025-08-18 21:16:09.047	2025-08-18 21:16:09.047
\.


--
-- Data for Name: InventoryCategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InventoryCategory" (id, name) FROM stdin;
cat_001	Engine Oil
cat_002	Oil Filter
cat_003	Brake Pads
cat_004	Brake Fluid
cat_005	Air Filter
cat_006	Spark Plugs
cat_007	Coolant
cat_008	Transmission Fluid
cat_009	Tires
cat_010	Battery
\.


--
-- Data for Name: InventoryItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InventoryItem" (id, name, sku, "partNumber", manufacturer, location, quantity, "minStockLevel", "maxStockLevel", "reorderPoint", "unitPrice", supplier, "supplierPartNumber", core, "corePrice", "createdAt", "updatedAt", "categoryId") FROM stdin;
inv_001	Engine Oil 5W30 - 4L	EO-5W30-4L	PN-EO-5W30-4L	Mobil	A1-01	20	5	50	10	5500.000000000000000000000000000000	Mobil Lanka	SUP-EO-5W30-4L	f	\N	2025-09-14 20:12:15.415	2025-09-14 20:12:15.415	cat_001
inv_002	Engine Oil 10W40 - 4L	EO-10W40-4L	PN-EO-10W40-4L	Castrol	A1-02	15	5	40	10	5200.000000000000000000000000000000	Castrol Distributor	SUP-EO-10W40-4L	f	\N	2025-09-14 20:12:15.415	2025-09-14 20:12:15.415	cat_001
inv_003	Oil Filter - Toyota	OF-TOY	PN-OF-TOY	Bosch	B1-01	30	5	100	10	1800.000000000000000000000000000000	Bosch Lanka	SUP-OF-TOY	f	\N	2025-09-14 20:12:15.415	2025-09-14 20:12:15.415	cat_002
inv_004	Oil Filter - Honda	OF-HON	PN-OF-HON	Bosch	B1-02	25	5	80	10	1700.000000000000000000000000000000	Bosch Lanka	SUP-OF-HON	f	\N	2025-09-14 20:12:15.415	2025-09-14 20:12:15.415	cat_002
inv_005	Brake Pads Front - Toyota Corolla	BP-FR-TOY	PN-BP-FR-TOY	TRW	C1-01	12	2	30	5	9500.000000000000000000000000000000	TRW Lanka	SUP-BP-FR-TOY	f	\N	2025-09-14 20:12:15.415	2025-09-14 20:12:15.415	cat_003
inv_006	Brake Pads Rear - Honda Civic	BP-RR-HON	PN-BP-RR-HON	TRW	C1-02	10	2	25	5	8800.000000000000000000000000000000	TRW Lanka	SUP-BP-RR-HON	f	\N	2025-09-14 20:12:15.415	2025-09-14 20:12:15.415	cat_003
inv_007	Brake Fluid DOT4 - 1L	BF-DOT4-1L	PN-BF-DOT4	Bosch	D1-01	40	10	100	15	2500.000000000000000000000000000000	Bosch Lanka	SUP-BF-DOT4	f	\N	2025-09-14 20:12:15.415	2025-09-14 20:12:15.415	cat_004
inv_008	Air Filter - Nissan	AF-NIS	PN-AF-NIS	MANN	E1-01	20	5	60	10	3200.000000000000000000000000000000	MANN Filters Lanka	SUP-AF-NIS	f	\N	2025-09-14 20:12:15.415	2025-09-14 20:12:15.415	cat_005
inv_009	Spark Plug NGK - Single	SP-NGK	PN-SP-NGK	NGK	F1-01	100	20	200	50	950.000000000000000000000000000000	NGK Lanka	SUP-SP-NGK	f	\N	2025-09-14 20:12:15.415	2025-09-14 20:12:15.415	cat_006
inv_010	Coolant Pre-Mix - 4L	CLT-4L	PN-CLT-4L	Toyota	G1-01	18	5	50	10	4300.000000000000000000000000000000	Toyota Lanka	SUP-CLT-4L	f	\N	2025-09-14 20:12:15.415	2025-09-14 20:12:15.415	cat_007
inv_011	Transmission Fluid ATF - 4L	ATF-4L	PN-ATF-4L	Valvoline	H1-01	10	3	30	5	6900.000000000000000000000000000000	Valvoline Lanka	SUP-ATF-4L	f	\N	2025-09-14 20:12:15.415	2025-09-14 20:12:15.415	cat_008
inv_012	Tire 195/65R15	TIRE-1956515	PN-TIRE-1956515	Bridgestone	T1-01	25	5	100	10	22000.000000000000000000000000000000	Bridgestone Lanka	SUP-TIRE-1956515	f	\N	2025-09-14 20:12:15.415	2025-09-14 20:12:15.415	cat_009
inv_013	Battery 12V 45Ah	BAT-45AH	PN-BAT-45AH	Exide	BAT-01	12	2	30	5	16500.000000000000000000000000000000	Exide Lanka	SUP-BAT-45AH	t	5000.00	2025-09-14 20:12:15.415	2025-09-14 20:12:15.415	cat_010
\.


--
-- Data for Name: InventoryManager; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InventoryManager" (id, "userProfileId", "employeeId", department, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Invoice" (id, "invoiceNumber", "workOrderId", "issueDate", "dueDate", status, "subtotalServices", "subtotalLabor", "subtotalParts", subtotal, "taxAmount", "discountAmount", "totalAmount", "paidAmount", "balanceDue", notes, terms, "createdAt", "updatedAt") FROM stdin;
cmfjzg7vx0001uurw9afp46o4	INV-202509-0001	cmfjqualw0001uu389cqs73oa	2025-09-14 17:42:25.774	2024-01-15 00:00:00	DRAFT	75.00	75.00	0.00	150.00	0.00	0.00	150.00	0.00	150.00	Thank you for your business!	\N	2025-09-14 17:42:25.774	2025-09-14 17:42:25.774
\.


--
-- Data for Name: InvoiceLineItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InvoiceLineItem" (id, "invoiceId", type, description, quantity, "unitPrice", subtotal, "workOrderServiceId", "workOrderLaborId", "workOrderPartId", notes, "createdAt", "updatedAt") FROM stdin;
cmfjzg7w30003uurwkwj5sywr	cmfjzg7vx0001uurw9afp46o4	SERVICE	Oil Change Service	1	54.99	75.00	cmfjqw1tu0007uu38xd7rc2m4	\N	\N	Created from approved estimate	2025-09-14 17:42:25.78	2025-09-14 17:42:25.78
cmfjzg7w90005uurwv1o714l6	cmfjzg7vx0001uurw9afp46o4	LABOR	Oil Change Service	1	75.00	75.00	\N	cmfjqw1tz0009uu38j9pjhk1c	\N	Drain oil and replace filter	2025-09-14 17:42:25.786	2025-09-14 17:42:25.786
\.


--
-- Data for Name: LaborCatalog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LaborCatalog" (id, code, name, description, "estimatedHours", "hourlyRate", category, "isActive", "createdAt", "updatedAt") FROM stdin;
labor_001	OIL_CHANGE	Oil Change Service	Standard oil and filter change	0.50	75.00	Maintenance	t	2025-08-16 16:30:22.753	2025-08-16 16:30:22.753
labor_002	BRAKE_INSPECT	Brake System Inspection	Visual inspection of brake pads, rotors, and fluid	0.75	85.00	Brakes	t	2025-08-16 16:30:22.753	2025-08-16 16:30:22.753
labor_003	TIRE_ROTATION	Tire Rotation	Rotate tires and check pressure	0.30	65.00	Tires	t	2025-08-16 16:30:22.753	2025-08-16 16:30:22.753
labor_004	ENGINE_DIAG	Engine Diagnostic	Computer diagnostic scan	1.00	95.00	Engine	t	2025-08-16 16:30:22.753	2025-08-16 16:30:22.753
labor_005	BATTERY_TEST	Battery Test and Service	Test battery and clean terminals	0.25	70.00	Electrical	t	2025-08-16 16:30:22.753	2025-08-16 16:30:22.753
labor_006	BRAKE_PAD_REPLACE	Brake Pad Replacement	Replace brake pads and resurface rotors	1.50	85.00	Brakes	t	2025-08-16 16:30:22.753	2025-08-16 16:30:22.753
labor_007	BRAKE_BLEED	Brake System Bleeding	Bleed brake system and replace fluid	0.75	85.00	Brakes	t	2025-08-16 16:30:22.753	2025-08-16 16:30:22.753
cmegiocd40000uu30thu1soop	TRANS_FLUID	Transmission Fluid Change	Replace transmission fluid and filter	1.25	90.00	Transmission	t	2025-08-18 02:49:50.489	2025-08-18 02:49:50.489
\.


--
-- Data for Name: Manager; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Manager" (id, "userProfileId", "employeeId", department, "createdAt", "updatedAt") FROM stdin;
mgr_ceb22dde-958b-4b99-9fcb-c1a936a642e1	cmeegjqfq0002uungvm8wl9v1	EMP002	Service Department	2025-08-18 00:57:01.632	2025-08-18 00:57:01.632
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payment" (id, "workOrderId", method, amount, reference, status, "paidAt", "processedById", notes, "refundAmount", "refundReason", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ServiceAdvisor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ServiceAdvisor" (id, "userProfileId", "employeeId", department, "createdAt", "updatedAt") FROM stdin;
sa_93405c38-b518-4a55-a0a2-d724f329d392	cmeegjqhh0004uung5cvvpz7j	EMP003	Customer Service	2025-08-18 00:57:01.632	2025-08-18 00:57:01.632
\.


--
-- Data for Name: ShopCapacitySettings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ShopCapacitySettings" (id, "appointmentsPerDay", "appointmentsPerTimeBlock", "timeBlockIntervalMinutes", "minimumNoticeHours", "futureSchedulingCutoffYears", "createdAt", "updatedAt") FROM stdin;
default	6	2	30	48	3	2025-08-16 16:15:33.079	2025-08-16 16:15:33.079
\.


--
-- Data for Name: ShopOperatingHours; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ShopOperatingHours" (id, "dayOfWeek", "isOpen", "openTime", "closeTime", "createdAt", "updatedAt") FROM stdin;
cmeegksdz0000uulkpyt5wi2b	SUNDAY	f	\N	\N	2025-08-16 16:15:33.047	2025-08-16 16:15:33.047
cmeegkse80001uulk8ecrwcgj	MONDAY	t	08:00	17:00	2025-08-16 16:15:33.057	2025-08-16 16:15:33.057
cmeegksek0002uulkzs1gq0fp	TUESDAY	t	08:00	17:00	2025-08-16 16:15:33.069	2025-08-16 16:15:33.069
cmeegksen0003uulkhff09trh	WEDNESDAY	t	08:00	17:00	2025-08-16 16:15:33.071	2025-08-16 16:15:33.071
cmeegksep0004uulk3od7h93z	THURSDAY	t	08:00	17:00	2025-08-16 16:15:33.073	2025-08-16 16:15:33.073
cmeegkses0006uulklqtushq3	SATURDAY	f	\N	\N	2025-08-16 16:15:33.077	2025-08-16 16:15:33.077
cmeegkser0005uulkq6gu7m31	FRIDAY	t	08:00	18:00	2025-08-16 16:15:33.075	2025-09-04 15:32:27.802
\.


--
-- Data for Name: Technician; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Technician" (id, "userProfileId", "employeeId", specialization, certifications, "createdAt", "updatedAt") FROM stdin;
tech_08f9e779-b6a8-44e5-989d-3a43bc71c22e	cmeegjql30008uunggiifqhs2	EMP005	Automotive Repair	{"ASE Certified","Brake Specialist","Engine Diagnostics"}	2025-08-18 00:56:45.918	2025-08-18 00:56:45.918
\.


--
-- Data for Name: TireInspection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TireInspection" (id, "inspectionId", "position", brand, model, size, psi, "treadDepth", "damageNotes", "createdAt") FROM stdin;
\.


--
-- Data for Name: UserProfile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserProfile" (id, "supabaseUserId", name, phone, "profileImage", role, "isRegistrationComplete", "createdAt", "updatedAt") FROM stdin;
cmeegjqmu000auungyplrg2fg	31362d65-5571-4686-8e3a-78a51860e3d0	John Customer	+1234567895	\N	CUSTOMER	t	2025-08-16 16:14:44.119	2025-08-16 16:14:44.119
cmeegjqdk0000uung6xaomqfb	385a10fe-7a72-44cf-ba01-746c7f05d7a1	System Administrator	+1234567890	\N	ADMIN	t	2025-08-16 16:14:43.784	2025-08-16 16:14:43.784
cmeegjqfq0002uungvm8wl9v1	03b38fc5-b05f-4999-8880-40d616822d7f	Service Manager	+1234567891	\N	MANAGER	t	2025-08-16 16:14:43.862	2025-08-16 16:14:43.862
cmeegjqja0006uungvrckgdsf	6a2a3ac0-8191-4a76-b2ea-cfa84c474fb3	Inventory Manager	+1234567893	\N	INVENTORY_MANAGER	t	2025-08-16 16:14:43.991	2025-08-16 16:14:43.991
cmf54ib0d0000uub528x2xn47	0b9f8b4c-2a80-4846-87cb-3bf05f0121cb	Kattayan	+1234567890	http://127.0.0.1:54321/storage/v1/object/public/profile-images/0b9f8b4c-2a80-4846-87cb-3bf05f0121cb/d7a339eb-f7dd-4f03-b85e-861695eb4e10.png	CUSTOMER	t	2025-09-04 08:07:28.574	2025-09-10 10:11:32.725
cmeegjqhh0004uung5cvvpz7j	00fa55c3-21b0-4f29-868f-51aa594c24a7	Nadhiya	+1234567892	\N	SERVICE_ADVISOR	t	2025-08-16 16:14:43.925	2025-08-16 16:14:43.925
cmeegjql30008uunggiifqhs2	c1f6d878-70fd-48b3-8c43-4b80df50ca2f	Baba rauf	+1234567894	http://127.0.0.1:54321/storage/v1/object/public/profile-images/0b9f8b4c-2a80-4846-87cb-3bf05f0121cb/d7a339eb-f7dd-4f03-b85e-861695eb4e10.png	TECHNICIAN	t	2025-08-16 16:14:44.056	2025-08-16 16:14:44.056
\.


--
-- Data for Name: Vehicle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Vehicle" (id, "customerId", make, model, year, vin, "licensePlate", "imageUrl", "createdAt", "updatedAt") FROM stdin;
cmfct4ub80001uufe821kljz8	cmf54ib0v0002uub58hrhc0bh	Honda	Civic	2019	1HGBP41JXMN109186	WP-1234	http://127.0.0.1:54321/storage/v1/object/public/car-images/0b9f8b4c-2a80-4846-87cb-3bf05f0121cb/66f6601f-8113-4a3c-ab15-8a10f705e0a2.png	2025-09-09 17:11:14.036	2025-09-10 08:32:43.901
veh_31af194c-dbeb-4300-a13b-19a946b6d43d	cmeegjqmy000cuungykprix4g	Toyota	Camry	2020	1HGBH41JXMN109186	ABC-123	https://www.autocollectionofmurfreesboro.com/imagetag/13415/main/l/Used-2020-Toyota-CAMRY-SE-FWD-SE-1614241878.jpg	2025-08-18 01:43:25.61	2025-08-18 01:43:25.61
\.


--
-- Data for Name: WorkOrder; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WorkOrder" (id, "workOrderNumber", "createdAt", "updatedAt", "customerId", "vehicleId", "appointmentId", "advisorId", status, "jobType", priority, source, complaint, "odometerReading", "warrantyStatus", "estimatedTotal", "estimateNotes", "estimateApproved", "subtotalLabor", "subtotalParts", "discountAmount", "taxAmount", "totalAmount", "paidAmount", "openedAt", "promisedAt", "closedAt", "workflowStep", "internalNotes", "customerNotes", "invoiceNumber", "finalizedAt", "paymentStatus", "warrantyClaimNumber", "thirdPartyApprovalCode", "campaignId", "servicePackageId", "customerSignature", "customerFeedback") FROM stdin;
cmfjqualw0001uu389cqs73oa	WO-20250914-001	2025-09-14 13:41:25.939	2025-09-14 14:23:57.019	cmeegjqmy000cuungykprix4g	veh_31af194c-dbeb-4300-a13b-19a946b6d43d	cmf5i0kkc0001uu9g6h4ubgmv	sa_93405c38-b518-4a55-a0a2-d724f329d392	ESTIMATE	REPAIR	NORMAL	APPOINTMENT	Try	50000	NONE	\N	\N	t	75.00	0.00	\N	\N	150.00	0.00	\N	\N	\N	RECEIVED	3123	ewer	\N	\N	PENDING	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: WorkOrderApproval; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WorkOrderApproval" (id, "workOrderId", "estimateId", status, "requestedAt", "approvedAt", "approvedById", method, notes, "customerSignature", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WorkOrderAttachment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WorkOrderAttachment" (id, "workOrderId", "fileUrl", "fileName", "fileType", "fileSize", description, category, "uploadedById", "uploadedAt") FROM stdin;
\.


--
-- Data for Name: WorkOrderEstimate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WorkOrderEstimate" (id, "workOrderId", version, description, "totalAmount", "laborAmount", "partsAmount", "taxAmount", "discountAmount", notes, "isVisibleToCustomer", "createdById", "createdAt", approved, "approvedAt", "approvedById") FROM stdin;
cmfk65nl40001uuokv47znyk4	cmfjqualw0001uu389cqs73oa	1	Initial estimate for vehicle service	3275.00	75.00	3200.00	0.00	0.00	Initial estimate - will add services	f	sa_93405c38-b518-4a55-a0a2-d724f329d392	2025-09-14 20:50:10.206	f	\N	\N
\.


--
-- Data for Name: WorkOrderInspection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WorkOrderInspection" (id, "workOrderId", "inspectorId", "templateId", date, notes, "isCompleted") FROM stdin;
cmfjt5yns0001uuekw3cz4pu4	cmfjqualw0001uu389cqs73oa	\N	template_cooling_system	2025-09-14 14:46:29.551	ewrwe	f
\.


--
-- Data for Name: WorkOrderInspectionAttachment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WorkOrderInspectionAttachment" (id, "inspectionId", "fileUrl", "fileName", "fileType", "fileSize", description, "uploadedAt") FROM stdin;
\.


--
-- Data for Name: WorkOrderLabor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WorkOrderLabor" (id, "workOrderId", "laborCatalogId", description, hours, rate, "technicianId", subtotal, "startTime", "endTime", status, notes, "cannedServiceId", "serviceDiscountAmount", "serviceDiscountType", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WorkOrderPart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WorkOrderPart" (id, "workOrderId", "inventoryItemId", quantity, "unitPrice", subtotal, source, "supplierName", "supplierInvoice", "warrantyInfo", notes, "installedAt", "installedById", "cannedServiceId", "serviceDiscountAmount", "serviceDiscountType", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WorkOrderQC; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WorkOrderQC" (id, "workOrderId", passed, "inspectorId", notes, "qcDate", "reworkRequired", "reworkNotes", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WorkOrderService; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WorkOrderService" (id, "workOrderId", "cannedServiceId", description, quantity, "unitPrice", subtotal, status, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
5eae218a-a6e0-44e0-a36a-96972b88c516	325e06852ea96ac31c6fe0a27db2683b1bf0d7fb874c051d21e4933fc20cb18c	2025-09-14 13:33:52.429163+00	20250914133352_add_labor_status	\N	\N	2025-09-14 13:33:52.288359+00	1
\.


--
-- Data for Name: messages_2025_10_03; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_10_03 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_10_04; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_10_04 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_10_05; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_10_05 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_10_06; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_10_06 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_10_07; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_10_07 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-07-18 13:39:50
20211116045059	2025-07-18 13:39:50
20211116050929	2025-07-18 13:39:50
20211116051442	2025-07-18 13:39:50
20211116212300	2025-07-18 13:39:50
20211116213355	2025-07-18 13:39:50
20211116213934	2025-07-18 13:39:50
20211116214523	2025-07-18 13:39:50
20211122062447	2025-07-18 13:39:50
20211124070109	2025-07-18 13:39:50
20211202204204	2025-07-18 13:39:50
20211202204605	2025-07-18 13:39:50
20211210212804	2025-07-18 13:39:50
20211228014915	2025-07-18 13:39:50
20220107221237	2025-07-18 13:39:50
20220228202821	2025-07-18 13:39:50
20220312004840	2025-07-18 13:39:50
20220603231003	2025-07-18 13:39:50
20220603232444	2025-07-18 13:39:50
20220615214548	2025-07-18 13:39:50
20220712093339	2025-07-18 13:39:50
20220908172859	2025-07-18 13:39:50
20220916233421	2025-07-18 13:39:50
20230119133233	2025-07-18 13:39:50
20230128025114	2025-07-18 13:39:50
20230128025212	2025-07-18 13:39:50
20230227211149	2025-07-18 13:39:50
20230228184745	2025-07-18 13:39:50
20230308225145	2025-07-18 13:39:50
20230328144023	2025-07-18 13:39:50
20231018144023	2025-07-18 13:39:50
20231204144023	2025-07-18 13:39:50
20231204144024	2025-07-18 13:39:50
20231204144025	2025-07-18 13:39:50
20240108234812	2025-07-18 13:39:50
20240109165339	2025-07-18 13:39:50
20240227174441	2025-07-18 13:39:50
20240311171622	2025-07-18 13:39:50
20240321100241	2025-07-18 13:39:50
20240401105812	2025-07-18 13:39:50
20240418121054	2025-07-18 13:39:50
20240523004032	2025-07-18 13:39:50
20240618124746	2025-07-18 13:39:50
20240801235015	2025-07-18 13:39:50
20240805133720	2025-07-18 13:39:50
20240827160934	2025-07-18 13:39:50
20240919163303	2025-07-18 13:39:50
20240919163305	2025-07-18 13:39:50
20241019105805	2025-07-18 13:39:50
20241030150047	2025-07-18 13:39:50
20241108114728	2025-07-18 13:39:50
20241121104152	2025-07-18 13:39:50
20241130184212	2025-07-18 13:39:50
20241220035512	2025-07-18 13:39:50
20241220123912	2025-07-18 13:39:50
20241224161212	2025-07-18 13:39:50
20250107150512	2025-07-18 13:39:50
20250110162412	2025-07-18 13:39:50
20250123174212	2025-07-18 13:39:50
20250128220012	2025-07-18 13:39:50
20250506224012	2025-07-18 13:39:50
20250523164012	2025-07-18 13:39:50
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
profile-images	profile-images	\N	2025-09-09 15:38:04.566652+00	2025-09-09 15:38:04.566652+00	t	f	5242880	{image/jpeg,image/png,image/webp}	\N	STANDARD
car-images	car-images	\N	2025-09-09 15:38:04.585373+00	2025-09-09 15:38:04.585373+00	t	f	5242880	{image/jpeg,image/png,image/webp}	\N	STANDARD
template-images	template-images	\N	2025-09-12 08:36:27.058042+00	2025-09-12 08:36:27.058042+00	t	f	5242880	{image/jpeg,image/png,image/webp}	\N	STANDARD
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (id, type, format, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.iceberg_namespaces (id, bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.iceberg_tables (id, namespace_id, bucket_id, name, location, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-07-18 13:40:27.997365
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-07-18 13:40:28.019302
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-07-18 13:40:28.021263
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-07-18 13:40:28.029703
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-07-18 13:40:28.033613
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-07-18 13:40:28.03545
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-07-18 13:40:28.037646
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-07-18 13:40:28.039891
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-07-18 13:40:28.041505
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-07-18 13:40:28.043061
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-07-18 13:40:28.045144
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-07-18 13:40:28.047509
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-07-18 13:40:28.049905
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-07-18 13:40:28.051729
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-07-18 13:40:28.053352
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-07-18 13:40:28.063722
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-07-18 13:40:28.065775
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-07-18 13:40:28.06728
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-07-18 13:40:28.069146
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-07-18 13:40:28.071071
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-07-18 13:40:28.072998
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-07-18 13:40:28.07508
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-07-18 13:40:28.07918
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-07-18 13:40:28.082225
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-07-18 13:40:28.084009
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-07-18 13:40:28.085651
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-07-18 13:40:28.087379
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-07-18 13:40:28.094943
28	object-bucket-name-sorting	ba85ec41b62c6a30a3f136788227ee47f311c436	2025-07-18 13:40:28.101019
29	create-prefixes	a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b	2025-07-18 13:40:28.103228
30	update-object-levels	6c6f6cc9430d570f26284a24cf7b210599032db7	2025-07-18 13:40:28.105163
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-07-18 13:40:28.10907
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-07-18 13:40:28.113008
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-07-18 13:40:28.116787
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-07-18 13:40:28.117996
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-07-18 13:40:28.120828
36	optimise-existing-functions	81cf92eb0c36612865a18016a38496c530443899	2025-07-18 13:40:28.122562
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-07-18 13:40:28.125735
38	iceberg-catalog-flag-on-buckets	19a8bd89d5dfa69af7f222a46c726b7c41e462c5	2025-07-18 13:40:28.127637
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
f1d6e55d-f3c9-4070-b98f-c2dc94eef6e1	car-images	0b9f8b4c-2a80-4846-87cb-3bf05f0121cb/a91243fd-58a5-47a5-960b-f3d3767d7c1a.png	\N	2025-09-10 08:28:59.153541+00	2025-09-10 08:28:59.153541+00	2025-09-10 08:28:59.153541+00	{"eTag": "\\"f9560f62cfacdfaa5413d9bb5f0e8c50\\"", "size": 118709, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-09-10T08:28:59.136Z", "contentLength": 118709, "httpStatusCode": 200}	114d5537-17a4-417f-987a-b3ac5829539f	\N	{}	2
c2d344e6-1f7b-4681-8cf3-479ce94f37b3	car-images	0b9f8b4c-2a80-4846-87cb-3bf05f0121cb/66f6601f-8113-4a3c-ab15-8a10f705e0a2.png	\N	2025-09-10 08:32:44.131218+00	2025-09-10 08:32:44.131218+00	2025-09-10 08:32:44.131218+00	{"eTag": "\\"f9560f62cfacdfaa5413d9bb5f0e8c50\\"", "size": 118709, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-09-10T08:32:44.125Z", "contentLength": 118709, "httpStatusCode": 200}	3492fe49-12a8-4f81-9cb5-52af908f9f6a	\N	{}	2
2b554868-14b0-4338-8a29-8c35bf68a845	profile-images	0b9f8b4c-2a80-4846-87cb-3bf05f0121cb/d7a339eb-f7dd-4f03-b85e-861695eb4e10.png	\N	2025-09-10 10:05:51.707719+00	2025-09-10 10:05:51.707719+00	2025-09-10 10:05:51.707719+00	{"eTag": "\\"27d91c2a80adc6c20356f3ce1acc57e7\\"", "size": 709336, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-09-10T10:05:51.695Z", "contentLength": 709336, "httpStatusCode": 200}	e2b5350f-973c-412f-9387-69cbbb3df342	\N	{}	2
\.


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
car-images	0b9f8b4c-2a80-4846-87cb-3bf05f0121cb	2025-09-10 08:28:59.153541+00	2025-09-10 08:28:59.153541+00
profile-images	0b9f8b4c-2a80-4846-87cb-3bf05f0121cb	2025-09-10 10:05:51.707719+00	2025-09-10 10:05:51.707719+00
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--

COPY supabase_functions.hooks (id, hook_table_id, hook_name, created_at, request_id) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--

COPY supabase_functions.migrations (version, inserted_at) FROM stdin;
initial	2025-07-18 13:39:24.601059+00
20210809183423_update_grants	2025-07-18 13:39:24.601059+00
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 222, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('supabase_functions.hooks_id_seq', 1, false);


--
-- Name: extensions extensions_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: Admin Admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_pkey" PRIMARY KEY (id);


--
-- Name: AppointmentCannedService AppointmentCannedService_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AppointmentCannedService"
    ADD CONSTRAINT "AppointmentCannedService_pkey" PRIMARY KEY (id);


--
-- Name: Appointment Appointment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_pkey" PRIMARY KEY (id);


--
-- Name: CannedServiceLabor CannedServiceLabor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CannedServiceLabor"
    ADD CONSTRAINT "CannedServiceLabor_pkey" PRIMARY KEY (id);


--
-- Name: CannedServicePartsCategory CannedServicePartsCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CannedServicePartsCategory"
    ADD CONSTRAINT "CannedServicePartsCategory_pkey" PRIMARY KEY (id);


--
-- Name: CannedService CannedService_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CannedService"
    ADD CONSTRAINT "CannedService_pkey" PRIMARY KEY (id);


--
-- Name: Customer Customer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Customer"
    ADD CONSTRAINT "Customer_pkey" PRIMARY KEY (id);


--
-- Name: EstimateLabor EstimateLabor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EstimateLabor"
    ADD CONSTRAINT "EstimateLabor_pkey" PRIMARY KEY (id);


--
-- Name: EstimatePart EstimatePart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EstimatePart"
    ADD CONSTRAINT "EstimatePart_pkey" PRIMARY KEY (id);


--
-- Name: InspectionChecklistItem InspectionChecklistItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InspectionChecklistItem"
    ADD CONSTRAINT "InspectionChecklistItem_pkey" PRIMARY KEY (id);


--
-- Name: InspectionTemplateItem InspectionTemplateItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InspectionTemplateItem"
    ADD CONSTRAINT "InspectionTemplateItem_pkey" PRIMARY KEY (id);


--
-- Name: InspectionTemplate InspectionTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InspectionTemplate"
    ADD CONSTRAINT "InspectionTemplate_pkey" PRIMARY KEY (id);


--
-- Name: InventoryCategory InventoryCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InventoryCategory"
    ADD CONSTRAINT "InventoryCategory_pkey" PRIMARY KEY (id);


--
-- Name: InventoryItem InventoryItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InventoryItem"
    ADD CONSTRAINT "InventoryItem_pkey" PRIMARY KEY (id);


--
-- Name: InventoryManager InventoryManager_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InventoryManager"
    ADD CONSTRAINT "InventoryManager_pkey" PRIMARY KEY (id);


--
-- Name: InvoiceLineItem InvoiceLineItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceLineItem"
    ADD CONSTRAINT "InvoiceLineItem_pkey" PRIMARY KEY (id);


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- Name: LaborCatalog LaborCatalog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LaborCatalog"
    ADD CONSTRAINT "LaborCatalog_pkey" PRIMARY KEY (id);


--
-- Name: Manager Manager_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Manager"
    ADD CONSTRAINT "Manager_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: ServiceAdvisor ServiceAdvisor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ServiceAdvisor"
    ADD CONSTRAINT "ServiceAdvisor_pkey" PRIMARY KEY (id);


--
-- Name: ShopCapacitySettings ShopCapacitySettings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShopCapacitySettings"
    ADD CONSTRAINT "ShopCapacitySettings_pkey" PRIMARY KEY (id);


--
-- Name: ShopOperatingHours ShopOperatingHours_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShopOperatingHours"
    ADD CONSTRAINT "ShopOperatingHours_pkey" PRIMARY KEY (id);


--
-- Name: Technician Technician_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Technician"
    ADD CONSTRAINT "Technician_pkey" PRIMARY KEY (id);


--
-- Name: TireInspection TireInspection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TireInspection"
    ADD CONSTRAINT "TireInspection_pkey" PRIMARY KEY (id);


--
-- Name: UserProfile UserProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserProfile"
    ADD CONSTRAINT "UserProfile_pkey" PRIMARY KEY (id);


--
-- Name: Vehicle Vehicle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Vehicle"
    ADD CONSTRAINT "Vehicle_pkey" PRIMARY KEY (id);


--
-- Name: WorkOrderApproval WorkOrderApproval_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderApproval"
    ADD CONSTRAINT "WorkOrderApproval_pkey" PRIMARY KEY (id);


--
-- Name: WorkOrderAttachment WorkOrderAttachment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderAttachment"
    ADD CONSTRAINT "WorkOrderAttachment_pkey" PRIMARY KEY (id);


--
-- Name: WorkOrderEstimate WorkOrderEstimate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderEstimate"
    ADD CONSTRAINT "WorkOrderEstimate_pkey" PRIMARY KEY (id);


--
-- Name: WorkOrderInspectionAttachment WorkOrderInspectionAttachment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderInspectionAttachment"
    ADD CONSTRAINT "WorkOrderInspectionAttachment_pkey" PRIMARY KEY (id);


--
-- Name: WorkOrderInspection WorkOrderInspection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderInspection"
    ADD CONSTRAINT "WorkOrderInspection_pkey" PRIMARY KEY (id);


--
-- Name: WorkOrderLabor WorkOrderLabor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderLabor"
    ADD CONSTRAINT "WorkOrderLabor_pkey" PRIMARY KEY (id);


--
-- Name: WorkOrderPart WorkOrderPart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderPart"
    ADD CONSTRAINT "WorkOrderPart_pkey" PRIMARY KEY (id);


--
-- Name: WorkOrderQC WorkOrderQC_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderQC"
    ADD CONSTRAINT "WorkOrderQC_pkey" PRIMARY KEY (id);


--
-- Name: WorkOrderService WorkOrderService_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderService"
    ADD CONSTRAINT "WorkOrderService_pkey" PRIMARY KEY (id);


--
-- Name: WorkOrder WorkOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrder"
    ADD CONSTRAINT "WorkOrder_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_10_03 messages_2025_10_03_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_10_03
    ADD CONSTRAINT messages_2025_10_03_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_10_04 messages_2025_10_04_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_10_04
    ADD CONSTRAINT messages_2025_10_04_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_10_05 messages_2025_10_05_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_10_05
    ADD CONSTRAINT messages_2025_10_05_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_10_06 messages_2025_10_06_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_10_06
    ADD CONSTRAINT messages_2025_10_06_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_10_07 messages_2025_10_07_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_10_07
    ADD CONSTRAINT messages_2025_10_07_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: iceberg_namespaces iceberg_namespaces_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_namespaces
    ADD CONSTRAINT iceberg_namespaces_pkey PRIMARY KEY (id);


--
-- Name: iceberg_tables iceberg_tables_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: hooks hooks_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.hooks
    ADD CONSTRAINT hooks_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (version);


--
-- Name: extensions_tenant_external_id_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE INDEX extensions_tenant_external_id_index ON _realtime.extensions USING btree (tenant_external_id);


--
-- Name: extensions_tenant_external_id_type_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX extensions_tenant_external_id_type_index ON _realtime.extensions USING btree (tenant_external_id, type);


--
-- Name: tenants_external_id_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX tenants_external_id_index ON _realtime.tenants USING btree (external_id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: Admin_employeeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Admin_employeeId_key" ON public."Admin" USING btree ("employeeId");


--
-- Name: Admin_userProfileId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Admin_userProfileId_key" ON public."Admin" USING btree ("userProfileId");


--
-- Name: AppointmentCannedService_appointmentId_cannedServiceId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "AppointmentCannedService_appointmentId_cannedServiceId_key" ON public."AppointmentCannedService" USING btree ("appointmentId", "cannedServiceId");


--
-- Name: CannedServiceLabor_cannedServiceId_laborCatalogId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CannedServiceLabor_cannedServiceId_laborCatalogId_key" ON public."CannedServiceLabor" USING btree ("cannedServiceId", "laborCatalogId");


--
-- Name: CannedServicePartsCategory_cannedServiceId_categoryId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CannedServicePartsCategory_cannedServiceId_categoryId_key" ON public."CannedServicePartsCategory" USING btree ("cannedServiceId", "categoryId");


--
-- Name: CannedService_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CannedService_code_key" ON public."CannedService" USING btree (code);


--
-- Name: Customer_userProfileId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Customer_userProfileId_key" ON public."Customer" USING btree ("userProfileId");


--
-- Name: InspectionChecklistItem_inspectionId_templateItemId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "InspectionChecklistItem_inspectionId_templateItemId_key" ON public."InspectionChecklistItem" USING btree ("inspectionId", "templateItemId");


--
-- Name: InspectionTemplateItem_templateId_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "InspectionTemplateItem_templateId_name_key" ON public."InspectionTemplateItem" USING btree ("templateId", name);


--
-- Name: InspectionTemplate_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "InspectionTemplate_name_key" ON public."InspectionTemplate" USING btree (name);


--
-- Name: InventoryCategory_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "InventoryCategory_name_key" ON public."InventoryCategory" USING btree (name);


--
-- Name: InventoryItem_partNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "InventoryItem_partNumber_key" ON public."InventoryItem" USING btree ("partNumber");


--
-- Name: InventoryItem_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "InventoryItem_sku_key" ON public."InventoryItem" USING btree (sku);


--
-- Name: InventoryManager_employeeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "InventoryManager_employeeId_key" ON public."InventoryManager" USING btree ("employeeId");


--
-- Name: InventoryManager_userProfileId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "InventoryManager_userProfileId_key" ON public."InventoryManager" USING btree ("userProfileId");


--
-- Name: Invoice_invoiceNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON public."Invoice" USING btree ("invoiceNumber");


--
-- Name: LaborCatalog_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "LaborCatalog_code_key" ON public."LaborCatalog" USING btree (code);


--
-- Name: Manager_employeeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Manager_employeeId_key" ON public."Manager" USING btree ("employeeId");


--
-- Name: Manager_userProfileId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Manager_userProfileId_key" ON public."Manager" USING btree ("userProfileId");


--
-- Name: ServiceAdvisor_employeeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ServiceAdvisor_employeeId_key" ON public."ServiceAdvisor" USING btree ("employeeId");


--
-- Name: ServiceAdvisor_userProfileId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ServiceAdvisor_userProfileId_key" ON public."ServiceAdvisor" USING btree ("userProfileId");


--
-- Name: ShopOperatingHours_dayOfWeek_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ShopOperatingHours_dayOfWeek_key" ON public."ShopOperatingHours" USING btree ("dayOfWeek");


--
-- Name: Technician_employeeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Technician_employeeId_key" ON public."Technician" USING btree ("employeeId");


--
-- Name: Technician_userProfileId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Technician_userProfileId_key" ON public."Technician" USING btree ("userProfileId");


--
-- Name: UserProfile_supabaseUserId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserProfile_supabaseUserId_key" ON public."UserProfile" USING btree ("supabaseUserId");


--
-- Name: Vehicle_vin_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Vehicle_vin_key" ON public."Vehicle" USING btree (vin);


--
-- Name: WorkOrder_appointmentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "WorkOrder_appointmentId_key" ON public."WorkOrder" USING btree ("appointmentId");


--
-- Name: WorkOrder_workOrderNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "WorkOrder_workOrderNumber_key" ON public."WorkOrder" USING btree ("workOrderNumber");


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_iceberg_namespaces_bucket_id; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_iceberg_namespaces_bucket_id ON storage.iceberg_namespaces USING btree (bucket_id, name);


--
-- Name: idx_iceberg_tables_namespace_id; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_iceberg_tables_namespace_id ON storage.iceberg_tables USING btree (namespace_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: supabase_functions_hooks_h_table_id_h_name_idx; Type: INDEX; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE INDEX supabase_functions_hooks_h_table_id_h_name_idx ON supabase_functions.hooks USING btree (hook_table_id, hook_name);


--
-- Name: supabase_functions_hooks_request_id_idx; Type: INDEX; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE INDEX supabase_functions_hooks_request_id_idx ON supabase_functions.hooks USING btree (request_id);


--
-- Name: messages_2025_10_03_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_10_03_pkey;


--
-- Name: messages_2025_10_04_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_10_04_pkey;


--
-- Name: messages_2025_10_05_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_10_05_pkey;


--
-- Name: messages_2025_10_06_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_10_06_pkey;


--
-- Name: messages_2025_10_07_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_10_07_pkey;


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: extensions extensions_tenant_external_id_fkey; Type: FK CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_tenant_external_id_fkey FOREIGN KEY (tenant_external_id) REFERENCES _realtime.tenants(external_id) ON DELETE CASCADE;


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: Admin Admin_userProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES public."UserProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AppointmentCannedService AppointmentCannedService_appointmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AppointmentCannedService"
    ADD CONSTRAINT "AppointmentCannedService_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES public."Appointment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AppointmentCannedService AppointmentCannedService_cannedServiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AppointmentCannedService"
    ADD CONSTRAINT "AppointmentCannedService_cannedServiceId_fkey" FOREIGN KEY ("cannedServiceId") REFERENCES public."CannedService"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Appointment Appointment_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public."ServiceAdvisor"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Appointment Appointment_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Appointment Appointment_vehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES public."Vehicle"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CannedServiceLabor CannedServiceLabor_cannedServiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CannedServiceLabor"
    ADD CONSTRAINT "CannedServiceLabor_cannedServiceId_fkey" FOREIGN KEY ("cannedServiceId") REFERENCES public."CannedService"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CannedServiceLabor CannedServiceLabor_laborCatalogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CannedServiceLabor"
    ADD CONSTRAINT "CannedServiceLabor_laborCatalogId_fkey" FOREIGN KEY ("laborCatalogId") REFERENCES public."LaborCatalog"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CannedServicePartsCategory CannedServicePartsCategory_cannedServiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CannedServicePartsCategory"
    ADD CONSTRAINT "CannedServicePartsCategory_cannedServiceId_fkey" FOREIGN KEY ("cannedServiceId") REFERENCES public."CannedService"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CannedServicePartsCategory CannedServicePartsCategory_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CannedServicePartsCategory"
    ADD CONSTRAINT "CannedServicePartsCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."InventoryCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Customer Customer_userProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Customer"
    ADD CONSTRAINT "Customer_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES public."UserProfile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: EstimateLabor EstimateLabor_estimateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EstimateLabor"
    ADD CONSTRAINT "EstimateLabor_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES public."WorkOrderEstimate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EstimateLabor EstimateLabor_laborCatalogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EstimateLabor"
    ADD CONSTRAINT "EstimateLabor_laborCatalogId_fkey" FOREIGN KEY ("laborCatalogId") REFERENCES public."LaborCatalog"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: EstimatePart EstimatePart_estimateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EstimatePart"
    ADD CONSTRAINT "EstimatePart_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES public."WorkOrderEstimate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EstimatePart EstimatePart_inventoryItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EstimatePart"
    ADD CONSTRAINT "EstimatePart_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES public."InventoryItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InspectionChecklistItem InspectionChecklistItem_inspectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InspectionChecklistItem"
    ADD CONSTRAINT "InspectionChecklistItem_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES public."WorkOrderInspection"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InspectionChecklistItem InspectionChecklistItem_templateItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InspectionChecklistItem"
    ADD CONSTRAINT "InspectionChecklistItem_templateItemId_fkey" FOREIGN KEY ("templateItemId") REFERENCES public."InspectionTemplateItem"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: InspectionTemplateItem InspectionTemplateItem_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InspectionTemplateItem"
    ADD CONSTRAINT "InspectionTemplateItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."InspectionTemplate"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InventoryItem InventoryItem_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InventoryItem"
    ADD CONSTRAINT "InventoryItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."InventoryCategory"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InventoryManager InventoryManager_userProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InventoryManager"
    ADD CONSTRAINT "InventoryManager_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES public."UserProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InvoiceLineItem InvoiceLineItem_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceLineItem"
    ADD CONSTRAINT "InvoiceLineItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Invoice Invoice_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public."WorkOrder"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Manager Manager_userProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Manager"
    ADD CONSTRAINT "Manager_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES public."UserProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payment Payment_processedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES public."ServiceAdvisor"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Payment Payment_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public."WorkOrder"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ServiceAdvisor ServiceAdvisor_userProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ServiceAdvisor"
    ADD CONSTRAINT "ServiceAdvisor_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES public."UserProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Technician Technician_userProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Technician"
    ADD CONSTRAINT "Technician_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES public."UserProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TireInspection TireInspection_inspectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TireInspection"
    ADD CONSTRAINT "TireInspection_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES public."WorkOrderInspection"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Vehicle Vehicle_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Vehicle"
    ADD CONSTRAINT "Vehicle_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkOrderApproval WorkOrderApproval_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderApproval"
    ADD CONSTRAINT "WorkOrderApproval_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public."ServiceAdvisor"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkOrderApproval WorkOrderApproval_estimateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderApproval"
    ADD CONSTRAINT "WorkOrderApproval_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES public."WorkOrderEstimate"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkOrderApproval WorkOrderApproval_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderApproval"
    ADD CONSTRAINT "WorkOrderApproval_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public."WorkOrder"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkOrderAttachment WorkOrderAttachment_uploadedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderAttachment"
    ADD CONSTRAINT "WorkOrderAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES public."InventoryManager"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkOrderAttachment WorkOrderAttachment_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderAttachment"
    ADD CONSTRAINT "WorkOrderAttachment_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public."WorkOrder"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkOrderEstimate WorkOrderEstimate_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderEstimate"
    ADD CONSTRAINT "WorkOrderEstimate_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkOrderEstimate WorkOrderEstimate_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderEstimate"
    ADD CONSTRAINT "WorkOrderEstimate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."ServiceAdvisor"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkOrderEstimate WorkOrderEstimate_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderEstimate"
    ADD CONSTRAINT "WorkOrderEstimate_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public."WorkOrder"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkOrderInspectionAttachment WorkOrderInspectionAttachment_inspectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderInspectionAttachment"
    ADD CONSTRAINT "WorkOrderInspectionAttachment_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES public."WorkOrderInspection"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkOrderInspection WorkOrderInspection_inspectorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderInspection"
    ADD CONSTRAINT "WorkOrderInspection_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES public."Technician"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkOrderInspection WorkOrderInspection_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderInspection"
    ADD CONSTRAINT "WorkOrderInspection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."InspectionTemplate"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkOrderInspection WorkOrderInspection_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderInspection"
    ADD CONSTRAINT "WorkOrderInspection_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public."WorkOrder"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkOrderLabor WorkOrderLabor_laborCatalogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderLabor"
    ADD CONSTRAINT "WorkOrderLabor_laborCatalogId_fkey" FOREIGN KEY ("laborCatalogId") REFERENCES public."LaborCatalog"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkOrderLabor WorkOrderLabor_technicianId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderLabor"
    ADD CONSTRAINT "WorkOrderLabor_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES public."Technician"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkOrderLabor WorkOrderLabor_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderLabor"
    ADD CONSTRAINT "WorkOrderLabor_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public."WorkOrder"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkOrderPart WorkOrderPart_installedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderPart"
    ADD CONSTRAINT "WorkOrderPart_installedById_fkey" FOREIGN KEY ("installedById") REFERENCES public."Technician"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkOrderPart WorkOrderPart_inventoryItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderPart"
    ADD CONSTRAINT "WorkOrderPart_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES public."InventoryItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkOrderPart WorkOrderPart_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderPart"
    ADD CONSTRAINT "WorkOrderPart_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public."WorkOrder"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkOrderQC WorkOrderQC_inspectorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderQC"
    ADD CONSTRAINT "WorkOrderQC_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES public."Technician"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkOrderQC WorkOrderQC_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderQC"
    ADD CONSTRAINT "WorkOrderQC_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public."WorkOrder"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkOrderService WorkOrderService_cannedServiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderService"
    ADD CONSTRAINT "WorkOrderService_cannedServiceId_fkey" FOREIGN KEY ("cannedServiceId") REFERENCES public."CannedService"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkOrderService WorkOrderService_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrderService"
    ADD CONSTRAINT "WorkOrderService_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public."WorkOrder"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkOrder WorkOrder_advisorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrder"
    ADD CONSTRAINT "WorkOrder_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES public."ServiceAdvisor"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkOrder WorkOrder_appointmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrder"
    ADD CONSTRAINT "WorkOrder_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES public."Appointment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkOrder WorkOrder_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrder"
    ADD CONSTRAINT "WorkOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkOrder WorkOrder_vehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkOrder"
    ADD CONSTRAINT "WorkOrder_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES public."Vehicle"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: iceberg_namespaces iceberg_namespaces_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_namespaces
    ADD CONSTRAINT iceberg_namespaces_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_analytics(id) ON DELETE CASCADE;


--
-- Name: iceberg_tables iceberg_tables_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_analytics(id) ON DELETE CASCADE;


--
-- Name: iceberg_tables iceberg_tables_namespace_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_namespace_id_fkey FOREIGN KEY (namespace_id) REFERENCES storage.iceberg_namespaces(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: iceberg_namespaces; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.iceberg_namespaces ENABLE ROW LEVEL SECURITY;

--
-- Name: iceberg_tables; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.iceberg_tables ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA net; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA net TO supabase_functions_admin;
GRANT USAGE ON SCHEMA net TO postgres;
GRANT USAGE ON SCHEMA net TO anon;
GRANT USAGE ON SCHEMA net TO authenticated;
GRANT USAGE ON SCHEMA net TO service_role;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA supabase_functions; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA supabase_functions TO postgres;
GRANT USAGE ON SCHEMA supabase_functions TO anon;
GRANT USAGE ON SCHEMA supabase_functions TO authenticated;
GRANT USAGE ON SCHEMA supabase_functions TO service_role;
GRANT ALL ON SCHEMA supabase_functions TO supabase_functions_admin;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer); Type: ACL; Schema: net; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO postgres;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO anon;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO authenticated;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO service_role;


--
-- Name: FUNCTION http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer); Type: ACL; Schema: net; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO postgres;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO anon;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO authenticated;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO service_role;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO postgres;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION http_request(); Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

REVOKE ALL ON FUNCTION supabase_functions.http_request() FROM PUBLIC;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO postgres;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO anon;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO authenticated;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO service_role;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE messages_2025_10_03; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_10_03 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_10_03 TO dashboard_user;


--
-- Name: TABLE messages_2025_10_04; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_10_04 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_10_04 TO dashboard_user;


--
-- Name: TABLE messages_2025_10_05; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_10_05 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_10_05 TO dashboard_user;


--
-- Name: TABLE messages_2025_10_06; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_10_06 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_10_06 TO dashboard_user;


--
-- Name: TABLE messages_2025_10_07; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_10_07 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_10_07 TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE iceberg_namespaces; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.iceberg_namespaces TO service_role;
GRANT SELECT ON TABLE storage.iceberg_namespaces TO authenticated;
GRANT SELECT ON TABLE storage.iceberg_namespaces TO anon;


--
-- Name: TABLE iceberg_tables; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.iceberg_tables TO service_role;
GRANT SELECT ON TABLE storage.iceberg_tables TO authenticated;
GRANT SELECT ON TABLE storage.iceberg_tables TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE prefixes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.prefixes TO service_role;
GRANT ALL ON TABLE storage.prefixes TO authenticated;
GRANT ALL ON TABLE storage.prefixes TO anon;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE hooks; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON TABLE supabase_functions.hooks TO postgres;
GRANT ALL ON TABLE supabase_functions.hooks TO anon;
GRANT ALL ON TABLE supabase_functions.hooks TO authenticated;
GRANT ALL ON TABLE supabase_functions.hooks TO service_role;


--
-- Name: SEQUENCE hooks_id_seq; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO postgres;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO anon;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO authenticated;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO service_role;


--
-- Name: TABLE migrations; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON TABLE supabase_functions.migrations TO postgres;
GRANT ALL ON TABLE supabase_functions.migrations TO anon;
GRANT ALL ON TABLE supabase_functions.migrations TO authenticated;
GRANT ALL ON TABLE supabase_functions.migrations TO service_role;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

