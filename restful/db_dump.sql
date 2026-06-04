--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1)
-- Dumped by pg_dump version 17.5 (Debian 17.5-1)

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
-- Name: auth_schema; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth_schema;


--
-- Name: extinguisher_schema; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extinguisher_schema;


--
-- Name: inspection_schema; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA inspection_schema;


--
-- Name: maintenance_schema; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA maintenance_schema;


--
-- Name: notification_schema; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA notification_schema;


--
-- Name: reporting_schema; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA reporting_schema;


--
-- Name: user_schema; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA user_schema;


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: role_requests_status_enum; Type: TYPE; Schema: auth_schema; Owner: -
--

CREATE TYPE auth_schema.role_requests_status_enum AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: users_role_enum; Type: TYPE; Schema: auth_schema; Owner: -
--

CREATE TYPE auth_schema.users_role_enum AS ENUM (
    'admin',
    'inspector',
    'technician',
    'user'
);


--
-- Name: fire_extinguishers_status_enum; Type: TYPE; Schema: extinguisher_schema; Owner: -
--

CREATE TYPE extinguisher_schema.fire_extinguishers_status_enum AS ENUM (
    'active',
    'expired',
    'maintenance',
    'decommissioned'
);


--
-- Name: fire_extinguishers_type_enum; Type: TYPE; Schema: extinguisher_schema; Owner: -
--

CREATE TYPE extinguisher_schema.fire_extinguishers_type_enum AS ENUM (
    'water',
    'foam',
    'co2',
    'dry_powder',
    'wet_chemical'
);


--
-- Name: inspections_result_enum; Type: TYPE; Schema: inspection_schema; Owner: -
--

CREATE TYPE inspection_schema.inspections_result_enum AS ENUM (
    'pass',
    'fail',
    'needs_maintenance'
);


--
-- Name: inspections_status_enum; Type: TYPE; Schema: inspection_schema; Owner: -
--

CREATE TYPE inspection_schema.inspections_status_enum AS ENUM (
    'scheduled',
    'in_progress',
    'completed',
    'cancelled',
    'overdue'
);


--
-- Name: maintenance_logs_conditionafter_enum; Type: TYPE; Schema: maintenance_schema; Owner: -
--

CREATE TYPE maintenance_schema.maintenance_logs_conditionafter_enum AS ENUM (
    'good',
    'fair',
    'poor',
    'critical'
);


--
-- Name: maintenance_logs_conditionbefore_enum; Type: TYPE; Schema: maintenance_schema; Owner: -
--

CREATE TYPE maintenance_schema.maintenance_logs_conditionbefore_enum AS ENUM (
    'good',
    'fair',
    'poor',
    'critical'
);


--
-- Name: maintenance_logs_maintenancetype_enum; Type: TYPE; Schema: maintenance_schema; Owner: -
--

CREATE TYPE maintenance_schema.maintenance_logs_maintenancetype_enum AS ENUM (
    'refill',
    'repair',
    'replacement',
    'pressure_test',
    'general_service'
);


--
-- Name: notifications_status_enum; Type: TYPE; Schema: notification_schema; Owner: -
--

CREATE TYPE notification_schema.notifications_status_enum AS ENUM (
    'pending',
    'sent',
    'failed',
    'retrying'
);


--
-- Name: notifications_type_enum; Type: TYPE; Schema: notification_schema; Owner: -
--

CREATE TYPE notification_schema.notifications_type_enum AS ENUM (
    'email',
    'system',
    'alert'
);


--
-- Name: EscalationLevel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EscalationLevel" AS ENUM (
    'USER',
    'COMPANY',
    'POLICE'
);


--
-- Name: ExtinguisherStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ExtinguisherStatus" AS ENUM (
    'ACTIVE',
    'EXPIRING_SOON',
    'EXPIRED',
    'REPLACED'
);


--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationType" AS ENUM (
    'WARNING',
    'URGENT',
    'ESCALATED'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'COMPANY_ADMIN',
    'SYSTEM_ADMIN'
);


--
-- Name: audit_logs_action_enum; Type: TYPE; Schema: reporting_schema; Owner: -
--

CREATE TYPE reporting_schema.audit_logs_action_enum AS ENUM (
    'user.created',
    'user.updated',
    'user.deleted',
    'user.activated',
    'user.deactivated',
    'role.changed',
    'password.changed',
    'password.reset',
    'auth.login',
    'auth.logout',
    'extinguisher.created',
    'extinguisher.updated',
    'extinguisher.deleted',
    'inspection.scheduled',
    'inspection.completed',
    'maintenance.logged',
    'report.generated'
);


--
-- Name: reports_format_enum; Type: TYPE; Schema: reporting_schema; Owner: -
--

CREATE TYPE reporting_schema.reports_format_enum AS ENUM (
    'json',
    'pdf',
    'csv'
);


--
-- Name: reports_type_enum; Type: TYPE; Schema: reporting_schema; Owner: -
--

CREATE TYPE reporting_schema.reports_type_enum AS ENUM (
    'daily',
    'monthly',
    'yearly',
    'expired_extinguishers',
    'maintenance_history',
    'inspection_summary'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth_schema; Owner: -
--

CREATE TABLE auth_schema.refresh_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" character varying NOT NULL,
    token character varying NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL,
    "isRevoked" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: role_requests; Type: TABLE; Schema: auth_schema; Owner: -
--

CREATE TABLE auth_schema.role_requests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" character varying NOT NULL,
    email character varying NOT NULL,
    "firstName" character varying NOT NULL,
    "lastName" character varying NOT NULL,
    "currentRole" character varying NOT NULL,
    "requestedRole" character varying NOT NULL,
    reason text,
    status auth_schema.role_requests_status_enum DEFAULT 'pending'::auth_schema.role_requests_status_enum NOT NULL,
    "reviewedBy" character varying,
    "reviewNote" text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: auth_schema; Owner: -
--

CREATE TABLE auth_schema.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    "firstName" character varying NOT NULL,
    "lastName" character varying NOT NULL,
    role auth_schema.users_role_enum DEFAULT 'user'::auth_schema.users_role_enum NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    phone character varying,
    address character varying,
    department character varying,
    "resetToken" character varying,
    "resetTokenExpiresAt" timestamp without time zone
);


--
-- Name: fire_extinguishers; Type: TABLE; Schema: extinguisher_schema; Owner: -
--

CREATE TABLE extinguisher_schema.fire_extinguishers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "serialNumber" character varying NOT NULL,
    type extinguisher_schema.fire_extinguishers_type_enum NOT NULL,
    manufacturer character varying NOT NULL,
    "manufacturingDate" date NOT NULL,
    "expiryDate" date NOT NULL,
    "lastInspectionDate" date,
    "nextInspectionDate" date,
    location character varying NOT NULL,
    building character varying,
    floor character varying,
    status extinguisher_schema.fire_extinguishers_status_enum DEFAULT 'active'::extinguisher_schema.fire_extinguishers_status_enum NOT NULL,
    weight numeric(5,2) NOT NULL,
    notes character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: inspections; Type: TABLE; Schema: inspection_schema; Owner: -
--

CREATE TABLE inspection_schema.inspections (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "extinguisherId" character varying NOT NULL,
    "inspectorId" character varying NOT NULL,
    "scheduledDate" timestamp without time zone NOT NULL,
    "completedDate" timestamp without time zone,
    status inspection_schema.inspections_status_enum DEFAULT 'scheduled'::inspection_schema.inspections_status_enum NOT NULL,
    result inspection_schema.inspections_result_enum,
    notes character varying,
    findings character varying,
    "pressureCheck" boolean DEFAULT false NOT NULL,
    "sealIntact" boolean DEFAULT false NOT NULL,
    "pinPresent" boolean DEFAULT false NOT NULL,
    "hosCondition" boolean DEFAULT false NOT NULL,
    "labelReadable" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: maintenance_logs; Type: TABLE; Schema: maintenance_schema; Owner: -
--

CREATE TABLE maintenance_schema.maintenance_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "extinguisherId" character varying NOT NULL,
    "technicianId" character varying NOT NULL,
    "inspectionId" character varying,
    "maintenanceType" maintenance_schema.maintenance_logs_maintenancetype_enum NOT NULL,
    "conditionBefore" maintenance_schema.maintenance_logs_conditionbefore_enum NOT NULL,
    "conditionAfter" maintenance_schema.maintenance_logs_conditionafter_enum NOT NULL,
    description character varying NOT NULL,
    "partsReplaced" character varying,
    cost numeric(10,2),
    "maintenanceDate" date NOT NULL,
    "nextMaintenanceDate" date,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: notification_schema; Owner: -
--

CREATE TABLE notification_schema.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    type notification_schema.notifications_type_enum NOT NULL,
    recipient character varying NOT NULL,
    subject character varying NOT NULL,
    body text NOT NULL,
    status notification_schema.notifications_status_enum DEFAULT 'pending'::notification_schema.notifications_status_enum NOT NULL,
    "retryCount" integer DEFAULT 0 NOT NULL,
    "errorMessage" character varying,
    "eventType" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "sentAt" timestamp without time zone,
    "recipientId" character varying,
    "isRead" boolean DEFAULT false NOT NULL
);


--
-- Name: Company; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Company" (
    id text NOT NULL,
    name text NOT NULL,
    "contactEmail" text,
    "contactPhone" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: FireExtinguisher; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FireExtinguisher" (
    id text NOT NULL,
    "serialNumber" text NOT NULL,
    type text NOT NULL,
    location text NOT NULL,
    "purchaseDate" timestamp(3) without time zone NOT NULL,
    "expiryDate" timestamp(3) without time zone NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    status public."ExtinguisherStatus" DEFAULT 'ACTIVE'::public."ExtinguisherStatus" NOT NULL,
    "lastInspected" timestamp(3) without time zone,
    "userId" text NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    type public."NotificationType" NOT NULL,
    message text NOT NULL,
    "daysUntilExpiry" integer NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "escalationLevel" public."EscalationLevel" DEFAULT 'USER'::public."EscalationLevel" NOT NULL,
    "userId" text NOT NULL,
    "companyId" text NOT NULL,
    "extinguisherId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: NotificationThreshold; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."NotificationThreshold" (
    id text NOT NULL,
    "warningDays" integer DEFAULT 60 NOT NULL,
    "urgentDays" integer DEFAULT 30 NOT NULL,
    "escalationDays" integer DEFAULT 0 NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: audit_logs; Type: TABLE; Schema: reporting_schema; Owner: -
--

CREATE TABLE reporting_schema.audit_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    action reporting_schema.audit_logs_action_enum NOT NULL,
    "entityType" character varying NOT NULL,
    "entityId" character varying,
    "performedBy" character varying NOT NULL,
    "performedByEmail" character varying NOT NULL,
    details jsonb,
    "ipAddress" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: reports; Type: TABLE; Schema: reporting_schema; Owner: -
--

CREATE TABLE reporting_schema.reports (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL,
    type reporting_schema.reports_type_enum NOT NULL,
    format reporting_schema.reports_format_enum DEFAULT 'json'::reporting_schema.reports_format_enum NOT NULL,
    data jsonb,
    "filePath" character varying,
    "generatedBy" character varying NOT NULL,
    "periodStart" date,
    "periodEnd" date,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: user_profiles; Type: TABLE; Schema: user_schema; Owner: -
--

CREATE TABLE user_schema.user_profiles (
    id uuid NOT NULL,
    email character varying NOT NULL,
    "firstName" character varying NOT NULL,
    "lastName" character varying NOT NULL,
    phone character varying,
    address character varying,
    department character varying,
    role character varying DEFAULT 'user'::character varying NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth_schema; Owner: -
--

COPY auth_schema.refresh_tokens (id, "userId", token, "expiresAt", "isRevoked", "createdAt") FROM stdin;
8ca437ed-43c6-487a-bac5-4648a37e6fd2	9eee55dc-496f-4709-bf68-76d8e713ce8d	052c3715-3786-444a-9f9d-f014091db5a1	2026-06-10 09:34:29.251	f	2026-06-03 02:34:29.252106
5ea4be4b-626c-4393-8f6a-0f354392452e	9eee55dc-496f-4709-bf68-76d8e713ce8d	be4ec3a3-1a98-461f-a919-d1c98b1870f6	2026-06-10 09:34:37.333	f	2026-06-03 02:34:37.334192
5039544c-6264-40dd-8ad7-165655ba36a8	23c5c87f-83a3-48b5-8cb0-99373c49a340	c08b9c5b-95e9-4ad0-8cf1-6fad64ee35b7	2026-06-10 09:39:32.253	f	2026-06-03 02:39:32.253876
e0384518-dbf9-456c-b958-91240f360b32	9eee55dc-496f-4709-bf68-76d8e713ce8d	c34646f8-ff85-40f0-98f7-c3daa16bc8ac	2026-06-10 09:40:17.879	f	2026-06-03 02:40:17.879502
ba60bb2f-74ee-461d-9074-a1f101bb6f35	9eee55dc-496f-4709-bf68-76d8e713ce8d	c4103ed0-6858-49ae-8853-f7362d916018	2026-06-10 09:40:49.811	f	2026-06-03 02:40:49.811607
dade0ac7-d5bd-4c43-a275-248dba08be11	9eee55dc-496f-4709-bf68-76d8e713ce8d	f940b8b3-f45e-4597-a3de-8e9abdac00f1	2026-06-10 09:41:06.046	f	2026-06-03 02:41:06.046634
949a2b7b-c359-4e00-a236-a4c7493fbdc5	9eee55dc-496f-4709-bf68-76d8e713ce8d	0a575857-64c2-4cbf-a354-ddc31ac977f0	2026-06-10 09:41:25.353	f	2026-06-03 02:41:25.354163
bb2f16b5-3e41-4b36-985d-507c54a3befc	9eee55dc-496f-4709-bf68-76d8e713ce8d	80f86065-fdd6-4bef-986c-6db0ad7fd349	2026-06-10 09:41:40.327	f	2026-06-03 02:41:40.328301
338b2eef-51ad-463d-bce8-595e1fc95695	d0026bd9-b57a-4798-8cd9-2f58119d66cf	71e91af0-007d-49e4-b17c-5a1bd8fb193f	2026-06-10 10:17:46.808	f	2026-06-03 03:17:46.809206
f71757d1-0990-42fb-b9d2-5f9d4657f8ec	d0026bd9-b57a-4798-8cd9-2f58119d66cf	a9d3a7b6-da49-4e28-b6fa-f7771cff547b	2026-06-10 10:18:22.963	f	2026-06-03 03:18:22.965097
0d2fb3d7-4565-4975-bfef-c0776533f74c	d0026bd9-b57a-4798-8cd9-2f58119d66cf	be2e875e-f922-4dcd-8ad9-b645929a520b	2026-06-10 10:28:16.458	f	2026-06-03 03:28:16.458808
86fd0b66-8111-47bb-9c15-b2e3cb637f57	c50fd6f0-ac43-48a7-85a3-be52f8c7b1b5	8339248a-bfb1-4919-8863-4d7f56b97cc6	2026-06-10 10:30:24.328	f	2026-06-03 03:30:24.328605
f20ab7ea-9207-4250-8cb7-b00ea63a8116	d0026bd9-b57a-4798-8cd9-2f58119d66cf	5c224ded-2a60-4714-91e7-6bdb30f54b9b	2026-06-10 11:15:54.779	f	2026-06-03 04:15:54.780566
b71de248-a281-4208-94ae-752c70bd675e	d0026bd9-b57a-4798-8cd9-2f58119d66cf	499b467c-2308-41cf-814c-ac93d40a7f50	2026-06-10 11:25:17.573	f	2026-06-03 04:25:17.574395
33b29217-228a-46e3-aaaf-1d5b3232704c	d0026bd9-b57a-4798-8cd9-2f58119d66cf	2107c97d-fc86-4f68-bd21-92de20e467db	2026-06-10 11:27:36.087	f	2026-06-03 04:27:36.088603
5993e58d-5f04-421a-963c-4a800cea7b2b	dccf53bd-1cbc-470c-acfb-7d5be149f49b	8ce0b0da-8d79-4f59-ba08-db82d6ef1c00	2026-06-10 12:14:48.387	f	2026-06-03 05:14:48.392192
ccf9b5a5-f21d-4b27-8665-61f2ae22eb0f	dccf53bd-1cbc-470c-acfb-7d5be149f49b	0400bc94-a65d-47b8-bea0-50e530f0c5d9	2026-06-10 12:15:20.286	f	2026-06-03 05:15:20.287095
d6546df2-395a-419a-b1ea-da47ad351ab4	dccf53bd-1cbc-470c-acfb-7d5be149f49b	0b4d3e61-c95a-48c7-8e4a-d407ba4d7970	2026-06-10 12:15:46.317	f	2026-06-03 05:15:46.317695
2538414b-d7e8-4c58-bd2a-7c444d4365f3	dccf53bd-1cbc-470c-acfb-7d5be149f49b	1cce4d72-5852-476a-92f0-0c29048717e2	2026-06-10 12:16:08.266	f	2026-06-03 05:16:08.268042
7bea51c1-e5a4-4be6-9b91-19d1dc10f0fb	dccf53bd-1cbc-470c-acfb-7d5be149f49b	05473c33-8454-468b-a06a-9d681e25a4c9	2026-06-10 12:17:00.483	f	2026-06-03 05:17:00.484025
2ccb9d4c-fd90-4faa-bd72-c1917eaeb02e	dccf53bd-1cbc-470c-acfb-7d5be149f49b	620eebdb-d18d-4f87-bc09-94f2fabc13dd	2026-06-10 12:17:29.58	f	2026-06-03 05:17:29.580708
a8253199-091e-4dd5-8608-7765e93d0719	dccf53bd-1cbc-470c-acfb-7d5be149f49b	2725866f-5fe1-471d-a62d-e6aa4095fe9e	2026-06-10 12:23:44.991	f	2026-06-03 05:23:44.99163
1b20dbfa-f9c3-466b-9554-e773c3c939c9	dccf53bd-1cbc-470c-acfb-7d5be149f49b	c14c1ac3-d68c-4a5f-be08-51efd84ea6f2	2026-06-10 12:25:39.805	f	2026-06-03 05:25:39.805911
d772ad9e-7c04-45ab-afa4-40c0033c2a99	dccf53bd-1cbc-470c-acfb-7d5be149f49b	4fbf015b-c46d-4517-b58e-d3f95d46de5e	2026-06-10 12:26:37.195	f	2026-06-03 05:26:37.195563
622fa597-9401-4f37-988e-660db43ee79a	33704276-c405-4272-9d45-8ab86f2da955	97f43fe2-60fe-4394-9081-a62cbdfe5991	2026-06-10 12:28:04.225	f	2026-06-03 05:28:04.228454
214efc00-17f4-4840-8bad-1b96630d0825	dccf53bd-1cbc-470c-acfb-7d5be149f49b	48b38d96-1100-4b55-ad3e-b966a399f0f0	2026-06-10 12:33:51.874	f	2026-06-03 05:33:51.875151
30476d07-c4bd-4d30-a2e9-6012ca85a61e	150e7108-f0a7-4235-8545-75e24586d792	6dec7a02-d922-483c-a374-fcb5eb803e0b	2026-06-10 12:33:51.928	f	2026-06-03 05:33:51.928702
d420e0ce-efa5-438a-86b4-513ef9d44ac8	dccf53bd-1cbc-470c-acfb-7d5be149f49b	cc3f1e00-3aea-44b9-ab39-680a397264fa	2026-06-10 12:34:20.173	f	2026-06-03 05:34:20.1737
bd373080-a04a-44e0-b778-281dc9a52475	dccf53bd-1cbc-470c-acfb-7d5be149f49b	a3528594-42b6-48c7-b397-642be4121007	2026-06-10 12:37:13.884	f	2026-06-03 05:37:13.884551
5bbbae07-6baa-4b7e-acba-6defab49c7c7	33704276-c405-4272-9d45-8ab86f2da955	1bed45ec-dcfe-4ca0-9d5a-496edfa714a4	2026-06-10 12:46:28.486	f	2026-06-03 05:46:28.487059
ce4cb5b9-d932-4014-bfb5-8f82259254d0	33704276-c405-4272-9d45-8ab86f2da955	1b46fa02-73e9-4536-8b96-91ed2a402816	2026-06-10 12:48:16.313	f	2026-06-03 05:48:16.314281
083f8ac1-845e-479c-9daf-fe791ba80c34	33704276-c405-4272-9d45-8ab86f2da955	19e19f1b-8aaf-44b0-b3c4-5a0572b5a9a6	2026-06-10 12:48:29.319	f	2026-06-03 05:48:29.31978
eeb3fc83-ce03-4f70-b948-12e69d864860	33704276-c405-4272-9d45-8ab86f2da955	7525943e-b026-4f33-9e28-3827d77dbcb3	2026-06-10 12:48:53.522	f	2026-06-03 05:48:53.522912
84ebfd75-4049-48ce-89cd-bf4bf9d907c8	ae069162-6e8a-4eb0-b8ad-ed38ddf2b003	ae32e4cd-34a8-40b6-b974-459d3ece5b62	2026-06-10 12:53:46.464	f	2026-06-03 05:53:46.465725
13b9ad82-9358-4495-84b8-efbe12f5c8fd	ae069162-6e8a-4eb0-b8ad-ed38ddf2b003	9c5cf65a-03e9-4d81-9c4f-2427f8c554b6	2026-06-10 12:54:30.576	f	2026-06-03 05:54:30.576445
7b4001fe-c5ff-4492-8388-f05d8a58eb99	ae069162-6e8a-4eb0-b8ad-ed38ddf2b003	f1654b1d-94f0-42bf-b6cb-b92053c98d4c	2026-06-10 12:55:13.145	f	2026-06-03 05:55:13.146217
5a2917d5-6a6f-4048-b76c-367389a91343	33704276-c405-4272-9d45-8ab86f2da955	e0bcd7b9-693e-4cd0-b84c-61e3600a29c8	2026-06-10 13:00:32.656	f	2026-06-03 06:00:32.656895
30ac821e-9884-40ee-9715-4496c9447158	dccf53bd-1cbc-470c-acfb-7d5be149f49b	9b72942d-c8d6-4632-80dd-2dc08c7f2f3c	2026-06-10 13:06:15.161	f	2026-06-03 06:06:15.161526
8714a6b5-7051-48eb-a427-531c26fcd01a	150e7108-f0a7-4235-8545-75e24586d792	0784e162-d507-4ab4-8315-2332ba85b929	2026-06-10 13:06:15.262	f	2026-06-03 06:06:15.262594
4c125076-9e79-4a3c-bd12-ed77c99ecef0	9eee55dc-496f-4709-bf68-76d8e713ce8d	ad016409-9330-41cf-bc2b-b792b6412875	2026-06-10 13:06:49.834	f	2026-06-03 06:06:49.835512
3933dcc1-c4d5-40fb-b3a3-9921a398697e	9eee55dc-496f-4709-bf68-76d8e713ce8d	8f1f2770-76bd-4ee0-bc40-e78e09dae0d5	2026-06-10 13:10:16.851	f	2026-06-03 06:10:16.852783
3d584e73-861b-46a5-ba68-b03712bf188a	9eee55dc-496f-4709-bf68-76d8e713ce8d	4c68a4ab-c5ed-40f5-89e7-901e1f52349c	2026-06-10 13:11:01.893	f	2026-06-03 06:11:01.894258
aa267467-727c-4359-9cb4-e7079c8181cb	9eee55dc-496f-4709-bf68-76d8e713ce8d	405540e1-a805-4fcc-867e-5d6ae99ccb9e	2026-06-10 13:16:30.963	f	2026-06-03 06:16:30.964932
1e686aaa-4ded-413b-9d80-3cd0fa5c5f2e	33704276-c405-4272-9d45-8ab86f2da955	7f28805f-94fb-4a7c-9297-277fce5b0759	2026-06-10 13:17:15.649	f	2026-06-03 06:17:15.650082
251e3944-8686-4790-84c7-fea44081a4b2	9eee55dc-496f-4709-bf68-76d8e713ce8d	fe9e85d5-1e10-4a6b-bf46-2ad6c90cfc13	2026-06-10 13:18:32.741	f	2026-06-03 06:18:32.741999
789dfe84-f4e4-47db-a437-f752e947fc51	33704276-c405-4272-9d45-8ab86f2da955	a24c8201-f2df-41c4-90a7-19a4cb69e9fb	2026-06-10 13:20:42.767	f	2026-06-03 06:20:42.767601
f979b604-5a3d-4dd5-b3be-cab106da311f	33704276-c405-4272-9d45-8ab86f2da955	81736853-09ec-449c-975c-04cc05cc9104	2026-06-10 13:26:59.103	f	2026-06-03 06:26:59.104101
54a09c07-0b0f-489a-8e65-e9e19aef9a54	33704276-c405-4272-9d45-8ab86f2da955	ae2937c8-5e5f-4f50-b2a4-b2b2633ffa3d	2026-06-10 13:39:53.25	f	2026-06-03 06:39:53.251514
afeada1e-b1a1-4606-b751-ff9a81e1f605	33704276-c405-4272-9d45-8ab86f2da955	c6673eab-2c6d-4cf4-b1cb-6bcd152dc7ad	2026-06-10 13:41:00.063	f	2026-06-03 06:41:00.063884
7c77b6b3-0018-4d7a-84f2-7c7bd7b6b10c	9eee55dc-496f-4709-bf68-76d8e713ce8d	42294046-8e8b-4e49-aa59-b22997e1e8cb	2026-06-10 13:41:39.046	f	2026-06-03 06:41:39.0472
9a206d52-800a-4b5b-9521-468b19262ffd	dccf53bd-1cbc-470c-acfb-7d5be149f49b	ffe12244-9147-48a6-8b79-67ca2b211565	2026-06-10 13:47:35.779	f	2026-06-03 06:47:35.781007
51031dbb-4c30-4a31-a5f8-47b5ba2a4c47	33704276-c405-4272-9d45-8ab86f2da955	0758baa3-afb2-473d-93e0-31f234e96753	2026-06-10 13:50:46.731	f	2026-06-03 06:50:46.731817
1a923761-1309-4089-9bb5-589943161da2	9eee55dc-496f-4709-bf68-76d8e713ce8d	29f458ed-e018-4cfe-92bd-63b697512f78	2026-06-10 13:51:24.37	f	2026-06-03 06:51:24.370576
5503f186-0ca5-44c5-8b71-32cacbbc5c45	9eee55dc-496f-4709-bf68-76d8e713ce8d	628c1f80-2b9f-43a8-aed2-0fda117ab008	2026-06-10 13:54:21.285	f	2026-06-03 06:54:21.286135
93a4598c-426a-418f-9364-6f3717eed295	9eee55dc-496f-4709-bf68-76d8e713ce8d	6898d175-4fa3-46c2-88c1-7de5605fbdd6	2026-06-10 13:55:44.902	f	2026-06-03 06:55:44.903334
a66943c5-7150-451c-a8ff-f47bbe3f7b4c	33704276-c405-4272-9d45-8ab86f2da955	9f0c5d28-f4e9-4438-9d57-3f651d1e2e43	2026-06-10 13:56:10.177	f	2026-06-03 06:56:10.177956
d9ea8b44-3e82-4357-9da9-fe41744ecda5	9eee55dc-496f-4709-bf68-76d8e713ce8d	0a5f309b-61d7-43ea-a506-edf7feafc1ae	2026-06-10 13:56:43.539	f	2026-06-03 06:56:43.539332
f915f375-649d-4326-8b38-ffc588381cf8	33704276-c405-4272-9d45-8ab86f2da955	371dde1b-1847-409e-88cf-25deb05fbbba	2026-06-10 13:57:11.254	f	2026-06-03 06:57:11.254753
db6d1533-785f-4580-89dd-88ab9f2a18fa	787e3b33-eec9-4a8c-81d8-b2319ef032cb	cb768878-94d2-43bd-b21e-32f9422abe40	2026-06-10 13:59:46.798	f	2026-06-03 06:59:46.799548
80e90509-96d0-476e-9522-659d3c9aa222	9eee55dc-496f-4709-bf68-76d8e713ce8d	b8b1d198-ae6c-46f9-b780-657177272044	2026-06-10 14:00:25.76	f	2026-06-03 07:00:25.76056
3c04eff7-6e63-4bf3-b193-076f2596087a	787e3b33-eec9-4a8c-81d8-b2319ef032cb	4f0ee119-80aa-47bd-ace0-6ad44bef9142	2026-06-10 14:01:48.133	f	2026-06-03 07:01:48.133574
d3254c67-676d-4ccf-913a-9b55b89494ac	9eee55dc-496f-4709-bf68-76d8e713ce8d	2ae89ec8-9511-4503-85b4-ad748ffd84fd	2026-06-10 14:03:41.969	f	2026-06-03 07:03:41.969914
edcea40c-6f3c-4b85-8cab-c64bdb5ad095	9eee55dc-496f-4709-bf68-76d8e713ce8d	79145aa9-f16a-47f4-aa12-5c6e5a3dfdb8	2026-06-10 14:04:25.269	f	2026-06-03 07:04:25.270097
3a08a40a-5578-49b9-b8e6-916444f45f58	33704276-c405-4272-9d45-8ab86f2da955	a3a4fa36-40af-4a08-ac33-6f6963ecf124	2026-06-10 14:05:12.858	f	2026-06-03 07:05:12.858425
fe3457f3-ea01-4e2b-ba53-7e9bce278253	33704276-c405-4272-9d45-8ab86f2da955	57b7b38b-b9ff-430a-944f-d22d0714e05e	2026-06-11 10:00:18.143	f	2026-06-04 03:00:18.144757
7e238927-ee11-4291-b22d-656102c4a1e7	3cbf7758-a53b-464f-bf9c-fac38efb7a6a	6ba97900-112a-41a4-ac01-585a4b0409ff	2026-06-11 10:01:11.285	f	2026-06-04 03:01:11.286406
32f25fba-9eb3-464a-9903-06eb5ac5e371	9eee55dc-496f-4709-bf68-76d8e713ce8d	e34f8f17-1fa1-4c44-8319-4ad743a241bb	2026-06-11 10:03:34.609	f	2026-06-04 03:03:34.610231
fd87eec5-8de4-4d5a-a17a-f20777430ff1	33704276-c405-4272-9d45-8ab86f2da955	cd8579c5-ba44-47f7-a6f3-ba3130b79cdf	2026-06-11 10:09:54.929	f	2026-06-04 03:09:54.930326
d5cda459-4d43-474f-af81-52c892da4b30	33704276-c405-4272-9d45-8ab86f2da955	f5de3905-48a2-49e6-8336-04c9e23ddc22	2026-06-11 10:14:38.789	f	2026-06-04 03:14:38.790993
39d5fbde-a227-41cd-a5e1-1148a12030fb	9eee55dc-496f-4709-bf68-76d8e713ce8d	2c0d4f10-24ca-4515-b7b1-3852013fa979	2026-06-11 11:36:43.419	f	2026-06-04 04:36:43.419485
3abb7bab-6e27-4919-8f1f-df493879bab1	9eee55dc-496f-4709-bf68-76d8e713ce8d	496794da-1edd-4792-a1d9-534c3c1e16f5	2026-06-11 11:39:40.246	f	2026-06-04 04:39:40.246891
56791ebf-415b-4850-a8f1-8a3fe7531ec1	9eee55dc-496f-4709-bf68-76d8e713ce8d	e31ae76f-7aec-43ee-afd8-fa1d0d2f3578	2026-06-11 11:47:11.553	f	2026-06-04 04:47:11.553933
b93a4aaa-7613-4f7e-b416-19820e5c4569	049bdbe1-8c15-4680-9279-64a03f34bb05	91fbbd0a-21e2-47cb-9e84-d552e7fed27b	2026-06-11 11:48:39.668	f	2026-06-04 04:48:39.668766
1b9a4cfb-d4b0-4f3f-9df8-1eab7517c479	049bdbe1-8c15-4680-9279-64a03f34bb05	91111d4c-c7c7-46e7-9f82-4f8b0a7578be	2026-06-11 11:50:05.22	f	2026-06-04 04:50:05.22095
2726acfe-2a51-4990-aa14-39a6e6364685	049bdbe1-8c15-4680-9279-64a03f34bb05	36e32c51-120d-482a-820b-c9f5faf365f4	2026-06-11 11:51:10.976	f	2026-06-04 04:51:10.976641
bd465b4d-0e05-40ff-9763-42a7f56185e3	9eee55dc-496f-4709-bf68-76d8e713ce8d	7dbefc53-ace5-43f5-9b7f-06dc4c08b088	2026-06-11 11:51:46.788	f	2026-06-04 04:51:46.788848
290d9267-c1b9-4345-967b-aecf3c43c3ac	33704276-c405-4272-9d45-8ab86f2da955	cd873516-a9bf-4986-87ae-51f74f8e847f	2026-06-11 11:54:32.51	f	2026-06-04 04:54:32.511525
17deb01c-42d9-46f2-9c68-5ef44205512e	9eee55dc-496f-4709-bf68-76d8e713ce8d	15ecffc6-3d63-4c3d-99a6-18d1ede3882e	2026-06-11 11:57:50.511	f	2026-06-04 04:57:50.512116
c988170d-e017-4496-96b0-0f4e396294be	9eee55dc-496f-4709-bf68-76d8e713ce8d	261ac79b-14ec-48e1-b03b-9f1e13dbfd45	2026-06-11 11:58:27.035	f	2026-06-04 04:58:27.036119
ecc43c2e-bb9d-409b-88b3-906caca8dff4	33704276-c405-4272-9d45-8ab86f2da955	38569688-508a-44ff-8b92-244516b93d7b	2026-06-11 12:02:29.399	f	2026-06-04 05:02:29.39938
65227b80-7ad3-4f7e-b19e-c88105d0ccc3	33704276-c405-4272-9d45-8ab86f2da955	0189d018-897c-49b0-a951-04356fa9ac36	2026-06-11 12:02:50.453	f	2026-06-04 05:02:50.454562
ab412d28-4956-4594-b825-2075a4c0c00b	9eee55dc-496f-4709-bf68-76d8e713ce8d	023f828b-de40-4f34-a428-f2b4e8e30ef3	2026-06-11 12:03:37.167	f	2026-06-04 05:03:37.167427
\.


--
-- Data for Name: role_requests; Type: TABLE DATA; Schema: auth_schema; Owner: -
--

COPY auth_schema.role_requests (id, "userId", email, "firstName", "lastName", "currentRole", "requestedRole", reason, status, "reviewedBy", "reviewNote", "createdAt", "updatedAt") FROM stdin;
2332ff59-9387-413d-bc75-e0e760d1a2d7	33704276-c405-4272-9d45-8ab86f2da955	niyobyosepaulin20@gmail.com	niyobyose	niyobyose	user	technician	123aeruyaeryhrdhfhereryeyreyreyreyreyr	pending	\N	\N	2026-06-03 06:51:10.870644	2026-06-03 06:51:10.870644
2ed574fc-5ad2-41dd-9f8d-9a342f44ce7d	787e3b33-eec9-4a8c-81d8-b2319ef032cb	not@example.com	notification	notification	user	inspector	Yoooooooooooooooooooooooooooooooooo	pending	\N	\N	2026-06-03 07:00:01.991673	2026-06-03 07:00:01.991673
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth_schema; Owner: -
--

COPY auth_schema.users (id, email, password, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt", phone, address, department, "resetToken", "resetTokenExpiresAt") FROM stdin;
9eee55dc-496f-4709-bf68-76d8e713ce8d	admin@test.com	$2b$10$hXSCEvxrs8yKJ7poTiCT4.2TA.h9WK2zOGbQvtrpRb1X6LuUDYENy	Admin	User	admin	t	2026-06-03 02:34:29.244301	2026-06-03 05:14:20.208597	\N	\N	\N	\N	\N
150e7108-f0a7-4235-8545-75e24586d792	user@tzw.com	$2b$10$JDVgPwHciXDuGwBDvswQqez.bHW78/gL.7yh4LzNxls8jWtWiyNHC	Test	User	user	t	2026-06-03 05:14:20.212586	2026-06-03 05:37:14.14859	\N	\N	\N	\N	\N
ae069162-6e8a-4eb0-b8ad-ed38ddf2b003	test@example.com	$2b$10$u5aOi4XoWmSmMsN86Kbd8e4fLwryA/184Wq0ODQHZ1Po9tPrhGm5e	testing	test	user	t	2026-06-03 05:53:46.456593	2026-06-03 05:54:56.385962	\N	\N	\N	\N	\N
d0026bd9-b57a-4798-8cd9-2f58119d66cf	testuser@demo.com	$2b$10$hXSCEvxrs8yKJ7poTiCT4.2TA.h9WK2zOGbQvtrpRb1X6LuUDYENy	Test	User	inspector	t	2026-06-03 03:17:46.801858	2026-06-03 04:26:43.124806				\N	\N
c50fd6f0-ac43-48a7-85a3-be52f8c7b1b5	paulin@gmail.com	$2b$10$hXSCEvxrs8yKJ7poTiCT4.2TA.h9WK2zOGbQvtrpRb1X6LuUDYENy	paulin	paul	admin	t	2026-06-03 03:30:24.323758	2026-06-03 03:30:24.323758	\N	\N	\N	\N	\N
dccf53bd-1cbc-470c-acfb-7d5be149f49b	admin@tzw.com	$2b$10$Pldb2QIAqUk4S7GJ.wWrWuhEfU/CJ6oX14kwc6qJfSD/kVenuWmbm	System	Admin	admin	t	2026-06-03 05:14:20.211656	2026-06-03 06:48:56.500003	+255700000000	qwrtr	No Department	\N	\N
23c5c87f-83a3-48b5-8cb0-99373c49a340	inspector@test.com	$2b$10$hXSCEvxrs8yKJ7poTiCT4.2TA.h9WK2zOGbQvtrpRb1X6LuUDYENy	John	Inspector	admin	t	2026-06-03 02:39:32.250584	2026-06-03 06:49:48.003027	\N	\N	\N	\N	\N
1d58fdf7-622a-49ba-bec5-16185eb0bb6e	sample@gmail.com	$2b$10$uHmBH/WsBkoupFOQsGZIsu4ftFexgbCofPSTjfhnjwiMhZW66/YYq	sample user	sample	technician	f	2026-06-03 06:07:27.756365	2026-06-03 06:54:30.137905	\N	\N	\N	\N	\N
33704276-c405-4272-9d45-8ab86f2da955	niyobyosepaulin20@gmail.com	$2b$10$Yy5cOPUcquMrr9Ie1c6X8OJxJkbkzLrzqslmhTME7LYOmq2u0.BJ6	niyobyose	niyobyose	inspector	t	2026-06-03 05:28:04.217257	2026-06-03 06:56:59.993822	\N	\N	\N	d22fd2f9-125b-4cb5-91b7-15d2123c899e	2026-06-03 14:52:47.325
787e3b33-eec9-4a8c-81d8-b2319ef032cb	not@example.com	$2b$10$KHH6CduFanoclx/QNPDLh.2ZX0Al/j6uzLdK.js/cKkuyrtJu4Vty	notification	notification	inspector	t	2026-06-03 06:59:46.783239	2026-06-03 07:01:16.569219	\N	\N	\N	\N	\N
3cbf7758-a53b-464f-bf9c-fac38efb7a6a	new@gmail.com	$2b$10$tzcQBNO6FpmWwpuTKCe3.uDdBcGw6QASUqSAkOta7ebwYqAIR2Z7e	new	new	user	t	2026-06-04 03:01:11.281228	2026-06-04 03:01:11.281228	\N	\N	\N	\N	\N
049bdbe1-8c15-4680-9279-64a03f34bb05	sssample@gmail.com	$2b$10$BOSciv7bHh6CHB0K62Uof.hAbmjP6WlhPUH9NM9wL/P2BJAZ/o0ci	sample user	sampleeeee	user	t	2026-06-04 04:48:07.148507	2026-06-04 04:50:33.754833	+250796358871	Rubavu, Rwanda	No Department	\N	\N
\.


--
-- Data for Name: fire_extinguishers; Type: TABLE DATA; Schema: extinguisher_schema; Owner: -
--

COPY extinguisher_schema.fire_extinguishers (id, "serialNumber", type, manufacturer, "manufacturingDate", "expiryDate", "lastInspectionDate", "nextInspectionDate", location, building, floor, status, weight, notes, "createdAt", "updatedAt") FROM stdin;
606cd84c-c600-4e59-921e-3226ce4303a4	FE-2024-001	co2	FireGuard Inc.	2024-01-15	2029-01-15	\N	\N	Building A, Floor 2, Room 201	Building A	2	active	4.50	New extinguisher	2026-06-03 02:40:17.924733	2026-06-03 02:40:17.924733
71620527-86e3-4a22-b182-0fa99eba9bcf	FE-2024-12	water	Fireguard	2026-04-07	2026-06-06	\N	\N	Kigali center	Building B	3	maintenance	13.00	This fire extinguihser is good	2026-06-03 03:21:43.242085	2026-06-03 03:22:39.2958
\.


--
-- Data for Name: inspections; Type: TABLE DATA; Schema: inspection_schema; Owner: -
--

COPY inspection_schema.inspections (id, "extinguisherId", "inspectorId", "scheduledDate", "completedDate", status, result, notes, findings, "pressureCheck", "sealIntact", "pinPresent", "hosCondition", "labelReadable", "createdAt", "updatedAt") FROM stdin;
4cd6ff2a-9534-4384-9c4a-a871d61230ec	606cd84c-c600-4e59-921e-3226ce4303a4	23c5c87f-83a3-48b5-8cb0-99373c49a340	2026-06-06 14:26:37.228	\N	scheduled	\N	Test inspection	\N	f	f	f	f	f	2026-06-03 05:26:37.37745	2026-06-03 05:26:37.37745
619fbe14-49c9-42d6-908e-fe46e4a3d7c3	71620527-86e3-4a22-b182-0fa99eba9bcf	23c5c87f-83a3-48b5-8cb0-99373c49a340	2026-06-13 14:37:14	\N	cancelled	\N	QA test	\N	f	f	f	f	f	2026-06-03 05:37:14.083081	2026-06-03 05:37:14.107675
b46a4cb5-81db-42cf-9c55-316393d25ed6	606cd84c-c600-4e59-921e-3226ce4303a4	d0026bd9-b57a-4798-8cd9-2f58119d66cf	2026-06-04 13:50:00	\N	scheduled	\N	qwert	\N	f	f	f	f	f	2026-06-03 06:50:20.467071	2026-06-03 06:50:20.467071
45c0e060-57e1-4df6-9242-b9a391bda0ae	606cd84c-c600-4e59-921e-3226ce4303a4	33704276-c405-4272-9d45-8ab86f2da955	2026-06-06 10:04:00	\N	scheduled	\N	Sample notes	\N	f	f	f	f	f	2026-06-04 03:05:09.127186	2026-06-04 03:05:09.127186
4faa9660-509d-4d3c-9fab-b43577ffd088	606cd84c-c600-4e59-921e-3226ce4303a4	33704276-c405-4272-9d45-8ab86f2da955	2026-06-05 11:55:00	\N	scheduled	\N	1qwrewtqewt	\N	f	f	f	f	f	2026-06-04 04:55:15.782067	2026-06-04 04:55:15.782067
944d4159-9cae-449c-beec-df5765960038	606cd84c-c600-4e59-921e-3226ce4303a4	23c5c87f-83a3-48b5-8cb0-99373c49a340	2026-06-10 12:00:00	\N	cancelled	\N	Routine quarterly inspection	\N	f	f	f	f	f	2026-06-03 02:41:06.090853	2026-06-04 04:55:40.605624
7d149f7a-8471-4fc0-b81f-11bb327113e2	606cd84c-c600-4e59-921e-3226ce4303a4	33704276-c405-4272-9d45-8ab86f2da955	2026-06-09 12:01:00	\N	scheduled	\N	qweqwe	\N	f	f	f	f	f	2026-06-04 05:02:14.00305	2026-06-04 05:02:14.00305
6884d9f8-baec-43e1-a8b0-a24e55812fa8	606cd84c-c600-4e59-921e-3226ce4303a4	d0026bd9-b57a-4798-8cd9-2f58119d66cf	2026-06-13 12:03:00	\N	scheduled	\N		\N	f	f	f	f	f	2026-06-04 05:04:15.523752	2026-06-04 05:04:15.523752
\.


--
-- Data for Name: maintenance_logs; Type: TABLE DATA; Schema: maintenance_schema; Owner: -
--

COPY maintenance_schema.maintenance_logs (id, "extinguisherId", "technicianId", "inspectionId", "maintenanceType", "conditionBefore", "conditionAfter", description, "partsReplaced", cost, "maintenanceDate", "nextMaintenanceDate", "createdAt", "updatedAt") FROM stdin;
b5eb8d13-1279-40e1-a8ca-da8f3caa08d3	606cd84c-c600-4e59-921e-3226ce4303a4	23c5c87f-83a3-48b5-8cb0-99373c49a340	\N	general_service	good	good	Routine maintenance check completed	\N	75.00	2026-06-03	2026-12-03	2026-06-03 02:41:25.416473	2026-06-03 02:41:25.416473
a92d0ffa-e9a6-4a47-a172-d373586838b4	606cd84c-c600-4e59-921e-3226ce4303a4	eyJhbGciOi	\N	general_service	fair	good	Test maintenance log	\N	\N	2026-06-03	\N	2026-06-03 05:26:37.594093	2026-06-03 05:26:37.594093
5394b331-7913-4b72-ac4e-16f4fdb8eee6	71620527-86e3-4a22-b182-0fa99eba9bcf	23c5c87f-83a3-48b5-8cb0-99373c49a340	\N	refill	poor	good	QA refill test	\N	\N	2026-06-03	\N	2026-06-03 05:37:14.126721	2026-06-03 05:37:14.126721
61d8c4ba-4f01-4427-a6ed-48e5d6fc6894	81bd43bb-035e-4173-998a-cd6dd9507696	9eee55dc-496f-4709-bf68-76d8e713ce8d	\N	general_service	fair	good	qwreqrtqteqtwqtqe	Pressure gauge	75.00	2026-06-01	2026-06-04	2026-06-04 03:05:55.853227	2026-06-04 03:05:55.853227
abe98d85-6a82-4aee-8061-60f615a20382	606cd84c-c600-4e59-921e-3226ce4303a4	33704276-c405-4272-9d45-8ab86f2da955	\N	general_service	fair	good	13241234	134134	12.00	2026-06-04	2026-06-06	2026-06-04 04:56:34.637866	2026-06-04 04:56:34.637866
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: notification_schema; Owner: -
--

COPY notification_schema.notifications (id, type, recipient, subject, body, status, "retryCount", "errorMessage", "eventType", "createdAt", "sentAt", "recipientId", "isRead") FROM stdin;
3806971c-245e-4445-a369-0230e05b86c5	email	admin@test.com	Welcome to Fire Extinguisher Management System	Welcome Admin! Your account has been created.	failed	0	\N	user.created	2026-06-03 02:38:04.181586	\N	\N	f
ec9e7392-2b6a-46d6-bc20-1b71ac6be146	email	inspector@test.com	Welcome to Fire Extinguisher Management System	Welcome John! Your account has been created.	failed	0	\N	user.created	2026-06-03 02:39:32.26148	\N	\N	f
14b0c5e9-01a2-4a9a-b1de-0d92daa574e9	email	23c5c87f-83a3-48b5-8cb0-99373c49a340	New Inspection Assigned	You have been assigned a new inspection for extinguisher 606cd84c-c600-4e59-921e-3226ce4303a4 on 2026-06-10T10:00:00.000Z	sent	0	\N	inspection.scheduled	2026-06-03 02:41:06.15414	2026-06-03 09:41:06.156	\N	f
243e416c-4f66-42ff-be17-f6567ae41fe1	system	admin	Maintenance Action Logged	Maintenance logged for extinguisher 606cd84c-c600-4e59-921e-3226ce4303a4: Routine maintenance check completed	pending	0	\N	maintenance.logged	2026-06-03 02:41:25.485343	\N	\N	f
3b971aa8-dfb7-4dee-97c6-2228fbac8a75	email	testuser@demo.com	Welcome to Fire Extinguisher Management System	Welcome Test! Your account has been created.	failed	0	\N	user.created	2026-06-03 03:17:46.870695	\N	\N	f
e5bcbf4c-43ae-4539-8cf4-5f4a5fb107b4	email	paulin@gmail.com	Welcome to Fire Extinguisher Management System	Welcome paulin! Your account has been created.	failed	0	\N	user.created	2026-06-03 03:30:24.33366	\N	\N	f
d679c832-f03a-47bd-b240-ec8c115ab3cf	email	testuser@demo.com	Password Reset Request	Password reset requested for testuser@demo.com	failed	0	\N	password.reset.requested	2026-06-03 04:34:09.315174	\N	\N	f
957b5a97-b279-45f5-b191-2114a73c06ab	email	23c5c87f-83a3-48b5-8cb0-99373c49a340	New Inspection Assigned	You have been assigned a new inspection for extinguisher 606cd84c-c600-4e59-921e-3226ce4303a4 on 2026-06-06T12:26:37.228Z	sent	0	\N	inspection.scheduled	2026-06-03 05:26:37.541912	2026-06-03 12:26:37.555	\N	f
bdf6c95a-f343-4f1a-baf2-a81ed991b66f	system	admin	Maintenance Action Logged	Maintenance logged for extinguisher 606cd84c-c600-4e59-921e-3226ce4303a4: Test maintenance log	pending	0	\N	maintenance.logged	2026-06-03 05:26:37.701126	\N	\N	f
20da7a42-2041-497c-b872-5c15b2fea5a1	email	niyobyosepaulin20@gmail.com	Welcome to Fire Extinguisher Management System	Welcome niyobyose! Your account has been created.	failed	0	\N	user.created	2026-06-03 05:28:04.237705	\N	\N	f
17945060-8f6e-4c7f-aea9-47a5479ff381	email	23c5c87f-83a3-48b5-8cb0-99373c49a340	New Inspection Assigned	You have been assigned a new inspection for extinguisher 71620527-86e3-4a22-b182-0fa99eba9bcf on 2026-06-13T12:37:14.000Z	sent	0	\N	inspection.scheduled	2026-06-03 05:37:14.112546	2026-06-03 12:37:14.115	\N	f
8f12ad2d-9a1f-4042-9c57-a884b966f417	system	admin	Maintenance Action Logged	Maintenance logged for extinguisher 71620527-86e3-4a22-b182-0fa99eba9bcf: QA refill test	pending	0	\N	maintenance.logged	2026-06-03 05:37:14.135106	\N	\N	f
67c6122e-9226-4f68-8e50-7bf42511158b	email	test@example.com	Welcome to Fire Extinguisher Management System	Welcome testing! Your account has been created.	failed	0	\N	user.created	2026-06-03 05:53:46.531023	\N	\N	f
3af004ce-668e-4111-bce6-974689196f7b	email	niyobyosepaulin20@gmail.com	Password Reset Request	Password reset requested for niyobyosepaulin20@gmail.com	failed	0	\N	password.reset.requested	2026-06-03 05:57:41.470664	\N	\N	f
12a88df2-f7eb-4429-b346-f8d3b09176f3	email	sample@gmail.com	Welcome to Fire Extinguisher Management System	Welcome sample user! Your account has been created.	failed	0	\N	user.created	2026-06-03 06:07:27.768941	\N	\N	f
25af96b1-b150-4024-a6a0-b3ad3e27acca	email	d0026bd9-b57a-4798-8cd9-2f58119d66cf	New Inspection Assigned	You have been assigned a new inspection for extinguisher 606cd84c-c600-4e59-921e-3226ce4303a4 on 2026-06-04T11:50:00.000Z	sent	0	\N	inspection.scheduled	2026-06-03 06:50:20.537582	2026-06-03 13:50:20.544	\N	f
c34c1b36-551a-4247-b406-5550ff30097e	email	niyobyosepaulin20@gmail.com	Password Reset Request	Password reset requested for niyobyosepaulin20@gmail.com	failed	0	\N	password.reset.requested	2026-06-03 06:52:47.341917	\N	\N	f
56db4dd0-68d3-443c-bda8-73512c3d4e2b	email	not@example.com	Welcome to Fire Extinguisher Management System	Welcome notification! Your account has been created.	failed	0	\N	user.created	2026-06-03 06:59:46.85749	\N	\N	f
da454972-55c4-469c-9e0a-d6e7713b48d2	system	not@example.com	Role Change Request Submitted	Your request to change role from user to inspector has been submitted and is pending admin review. Reason: Yoooooooooooooooooooooooooooooooooo	pending	0	\N	role.request.created	2026-06-03 07:00:02.022348	\N	787e3b33-eec9-4a8c-81d8-b2319ef032cb	f
c8392b9b-b048-4719-9ce1-774374e89337	system	admin	New Role Request: notification notification	User notification notification (not@example.com) has requested a role change from user to inspector. Reason: Yoooooooooooooooooooooooooooooooooo	pending	0	\N	role.request.created	2026-06-03 07:00:02.027556	\N	\N	f
a8c35ca6-d6be-4764-888e-c482c4051944	email	new@gmail.com	Welcome to Fire Extinguisher Management System	Welcome new! Your account has been created.	failed	0	\N	user.created	2026-06-04 03:01:11.351426	\N	\N	f
23eca27c-37e2-406a-894f-8e8ff183eb60	email	33704276-c405-4272-9d45-8ab86f2da955	New Inspection Assigned	You have been assigned a new inspection for extinguisher 606cd84c-c600-4e59-921e-3226ce4303a4 on 2026-06-06T08:04:00.000Z	sent	0	\N	inspection.scheduled	2026-06-04 03:05:09.181843	2026-06-04 10:05:09.183	\N	f
a7c291d8-6918-4008-b2ea-f1356cf14fe3	system	admin	Maintenance Action Logged	Maintenance logged for extinguisher 81bd43bb-035e-4173-998a-cd6dd9507696: qwreqrtqteqtwqtqe	pending	0	\N	maintenance.logged	2026-06-04 03:05:55.92229	\N	\N	f
95ddc41d-05ad-4d7d-b73d-854d54526741	email	sssample@gmail.com	Welcome to Fire Extinguisher Management System	Welcome sample user! Your account has been created.	failed	0	\N	user.created	2026-06-04 04:48:07.211308	\N	\N	f
3f74a08f-eefb-474c-b944-e94623ae4765	email	33704276-c405-4272-9d45-8ab86f2da955	New Inspection Assigned	You have been assigned a new inspection for extinguisher 606cd84c-c600-4e59-921e-3226ce4303a4 on 2026-06-05T09:55:00.000Z	sent	0	\N	inspection.scheduled	2026-06-04 04:55:15.993741	2026-06-04 11:55:15.997	\N	f
b3116a66-661e-4879-87f7-bd0e5522b32c	system	admin	Maintenance Action Logged	Maintenance logged for extinguisher 606cd84c-c600-4e59-921e-3226ce4303a4: 13241234	pending	0	\N	maintenance.logged	2026-06-04 04:56:34.743135	\N	\N	f
30de73a6-20ff-41f0-b84a-8d79b7f37e47	email	33704276-c405-4272-9d45-8ab86f2da955	New Inspection Assigned	You have been assigned a new inspection for extinguisher 606cd84c-c600-4e59-921e-3226ce4303a4 on 2026-06-09T10:01:00.000Z	sent	0	\N	inspection.scheduled	2026-06-04 05:02:14.031634	2026-06-04 12:02:14.035	\N	f
81e400a7-b990-488a-b09d-8c3bd8230db8	email	d0026bd9-b57a-4798-8cd9-2f58119d66cf	New Inspection Assigned	You have been assigned a new inspection for extinguisher 606cd84c-c600-4e59-921e-3226ce4303a4 on 2026-06-13T10:03:00.000Z	sent	0	\N	inspection.scheduled	2026-06-04 05:04:15.595483	2026-06-04 12:04:15.599	\N	f
\.


--
-- Data for Name: Company; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Company" (id, name, "contactEmail", "contactPhone", "createdAt", "updatedAt") FROM stdin;
company-001	Acme Corporation	admin@acmecorp.com	+1 (555) 123-4567	2026-06-01 19:40:00.321	2026-06-01 19:40:00.321
company-system	System Administration	admin@fireextinguisher.sys	+1 (555) 000-0000	2026-06-01 19:40:00.322	2026-06-01 19:40:00.322
5e95cbe5-54e6-43d4-8dfc-91774ac8f21c	Acme corp	pascal@gmail.com		2026-06-01 19:55:34.745	2026-06-01 19:55:34.745
6aac1745-0d31-4a1a-b687-a240befdad08	Acme corp	john@example.com		2026-06-03 07:14:14.025	2026-06-03 07:14:14.025
\.


--
-- Data for Name: FireExtinguisher; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FireExtinguisher" (id, "serialNumber", type, location, "purchaseDate", "expiryDate", quantity, status, "lastInspected", "userId", "companyId", "createdAt", "updatedAt") FROM stdin;
ext-001	FE-2024-001	ABC Powder	Building A - Main Entrance	2022-03-15 00:00:00	2025-03-15 00:00:00	2	EXPIRING_SOON	2024-12-10 00:00:00	user-001	company-001	2026-06-01 19:40:00.379	2026-06-01 19:40:00.379
ext-002	FE-2024-002	CO2	Building B - Server Room	2023-06-20 00:00:00	2026-06-20 00:00:00	1	ACTIVE	2024-11-20 00:00:00	user-001	company-001	2026-06-01 19:40:00.38	2026-06-01 19:40:00.38
ext-003	FE-2024-003	Water Mist	Building A - Floor 3	2023-01-10 00:00:00	2025-01-10 00:00:00	3	EXPIRING_SOON	2024-10-05 00:00:00	user-001	company-001	2026-06-01 19:40:00.382	2026-06-01 19:40:00.382
ext-004	FE-2024-004	ABC Powder	Building C - Warehouse	2024-02-01 00:00:00	2027-02-01 00:00:00	5	ACTIVE	2024-12-15 00:00:00	user-002	company-001	2026-06-01 19:40:00.383	2026-06-01 19:40:00.383
ext-005	FE-2024-005	Foam	Building D - Parking Garage	2021-05-12 00:00:00	2024-05-12 00:00:00	2	EXPIRED	2023-10-20 00:00:00	user-003	company-001	2026-06-01 19:40:00.385	2026-06-01 19:40:00.385
0ade1d51-a060-4d4e-ba20-6367bc5a7c0c	123	123	123	2026-06-02 00:00:00	2026-06-03 00:00:00	1	EXPIRING_SOON	2026-06-30 00:00:00	a64816d8-bce8-4514-bf44-0336f61928c7	5e95cbe5-54e6-43d4-8dfc-91774ac8f21c	2026-06-01 20:13:26.565	2026-06-01 20:13:26.565
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Notification" (id, type, message, "daysUntilExpiry", read, "escalationLevel", "userId", "companyId", "extinguisherId", "createdAt", "updatedAt") FROM stdin;
notif-001	WARNING	Fire extinguisher FE-2024-001 expires in 45 days	45	f	USER	user-001	company-001	ext-001	2024-12-20 00:00:00	2026-06-01 19:40:00.386
notif-002	URGENT	Fire extinguisher FE-2024-003 expires in 15 days - Action Required	15	f	USER	user-001	company-001	ext-003	2024-12-25 00:00:00	2026-06-01 19:40:00.386
notif-003	ESCALATED	Fire extinguisher FE-2024-005 has EXPIRED - Awaiting police notification	-234	t	POLICE	user-003	company-001	ext-005	2024-12-15 00:00:00	2026-06-01 19:40:00.386
\.


--
-- Data for Name: NotificationThreshold; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."NotificationThreshold" (id, "warningDays", "urgentDays", "escalationDays", "companyId", "createdAt", "updatedAt") FROM stdin;
threshold-001	60	30	0	company-001	2026-06-01 19:40:00.388	2026-06-01 19:40:00.388
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, name, email, password, role, "companyId", "createdAt", "updatedAt") FROM stdin;
user-001	John Smith	john@acmecorp.com	$2b$10$7flhejgYADRpEfsKFidhZ.F1AXe6j2pkQIrYdrPpPO5LdjreROLhy	USER	company-001	2026-06-01 19:40:00.371	2026-06-01 19:40:00.371
user-002	Emily Davis	emily@acmecorp.com	$2b$10$7flhejgYADRpEfsKFidhZ.F1AXe6j2pkQIrYdrPpPO5LdjreROLhy	USER	company-001	2026-06-01 19:40:00.374	2026-06-01 19:40:00.374
user-003	Robert Wilson	robert@acmecorp.com	$2b$10$7flhejgYADRpEfsKFidhZ.F1AXe6j2pkQIrYdrPpPO5LdjreROLhy	USER	company-001	2026-06-01 19:40:00.375	2026-06-01 19:40:00.375
admin-001	Sarah Johnson	sarah@acmecorp.com	$2b$10$7flhejgYADRpEfsKFidhZ.F1AXe6j2pkQIrYdrPpPO5LdjreROLhy	COMPANY_ADMIN	company-001	2026-06-01 19:40:00.376	2026-06-01 19:40:00.376
system-admin-001	Michael Chen	michael@fireextinguisher.sys	$2b$10$7flhejgYADRpEfsKFidhZ.F1AXe6j2pkQIrYdrPpPO5LdjreROLhy	SYSTEM_ADMIN	company-system	2026-06-01 19:40:00.377	2026-06-01 19:40:00.377
a64816d8-bce8-4514-bf44-0336f61928c7	pascal	pascal@gmail.com	$2b$10$tu0GfByLnfbgsDbMEnTHLeCOcwS1g6jOfu788u5sAQOedHsj0KgX2	COMPANY_ADMIN	5e95cbe5-54e6-43d4-8dfc-91774ac8f21c	2026-06-01 19:55:34.754	2026-06-01 19:55:34.754
7b30c14c-5923-42d1-9f5e-b7d5d833c241	john	john@example.com	$2b$10$JHqKm3UEqEdpuqkkAj4cEORCK8cIq1xA/K0EyjN5PPXbLuHsStgAe	USER	6aac1745-0d31-4a1a-b687-a240befdad08	2026-06-03 07:14:14.029	2026-06-03 07:14:14.029
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
db29089a-69b9-4441-99c9-4d09f09db5bb	9352b441279b3d9e0fd90775243f8c98d8b76d0410c2f82ea96d1ac652cea0b6	2026-06-01 13:17:18.98921-05	20260601181718_init	\N	\N	2026-06-01 13:17:18.978287-05	1
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: reporting_schema; Owner: -
--

COPY reporting_schema.audit_logs (id, action, "entityType", "entityId", "performedBy", "performedByEmail", details, "ipAddress", "createdAt") FROM stdin;
95f520ce-75ea-4ca7-a2f4-e95f4466f9d6	password.changed	user	dccf53bd-1cbc-470c-acfb-7d5be149f49b	dccf53bd-1cbc-470c-acfb-7d5be149f49b	admin@tzw.com	{"email": "admin@tzw.com", "userId": "dccf53bd-1cbc-470c-acfb-7d5be149f49b", "firstName": "System", "performedBy": "dccf53bd-1cbc-470c-acfb-7d5be149f49b", "performedByEmail": "admin@tzw.com"}	\N	2026-06-03 06:48:56.508216
5c112ea1-5557-47c0-aa39-1bb70faff316	role.changed	user	1d58fdf7-622a-49ba-bec5-16185eb0bb6e	admin	admin@system	{"email": "sample@gmail.com", "reason": "Admin role change", "userId": "1d58fdf7-622a-49ba-bec5-16185eb0bb6e", "newRole": "technician", "oldRole": "user", "lastName": "sample", "firstName": "sample user", "performedBy": "admin", "performedByEmail": "admin@system"}	\N	2026-06-03 06:49:33.184306
fe581759-5b1f-4fab-9201-f6f4aeeccf90	role.changed	user	23c5c87f-83a3-48b5-8cb0-99373c49a340	admin	admin@system	{"email": "inspector@test.com", "reason": "Admin role change", "userId": "23c5c87f-83a3-48b5-8cb0-99373c49a340", "newRole": "admin", "oldRole": "inspector", "lastName": "Inspector", "firstName": "John", "performedBy": "admin", "performedByEmail": "admin@system"}	\N	2026-06-03 06:49:48.032684
814a6366-5fef-4bb4-ae55-b4f3f5816f53	user.deactivated	user	1d58fdf7-622a-49ba-bec5-16185eb0bb6e	admin	admin@system	{"email": "sample@gmail.com", "userId": "1d58fdf7-622a-49ba-bec5-16185eb0bb6e", "isActive": false, "lastName": "sample", "firstName": "sample user", "performedBy": "admin", "performedByEmail": "admin@system"}	\N	2026-06-03 06:54:30.168515
02325f11-f381-4566-8121-b1e399cc4064	user.deactivated	user	33704276-c405-4272-9d45-8ab86f2da955	admin	admin@system	{"email": "niyobyosepaulin20@gmail.com", "userId": "33704276-c405-4272-9d45-8ab86f2da955", "isActive": false, "lastName": "niyobyose", "firstName": "niyobyose", "performedBy": "admin", "performedByEmail": "admin@system"}	\N	2026-06-03 06:54:37.076359
7dbf9304-f07f-493d-af00-f7f1e9b71f9e	user.activated	user	33704276-c405-4272-9d45-8ab86f2da955	admin	admin@system	{"email": "niyobyosepaulin20@gmail.com", "userId": "33704276-c405-4272-9d45-8ab86f2da955", "isActive": true, "lastName": "niyobyose", "firstName": "niyobyose", "performedBy": "admin", "performedByEmail": "admin@system"}	\N	2026-06-03 06:55:55.502203
272d7342-ff5b-4ac3-a1be-4213eb842c65	role.changed	user	33704276-c405-4272-9d45-8ab86f2da955	admin	admin@system	{"email": "niyobyosepaulin20@gmail.com", "reason": "Admin role change", "userId": "33704276-c405-4272-9d45-8ab86f2da955", "newRole": "inspector", "oldRole": "user", "lastName": "niyobyose", "firstName": "niyobyose", "performedBy": "admin", "performedByEmail": "admin@system"}	\N	2026-06-03 06:57:00.010043
ac7e0b3f-3cbd-47a8-907d-2bc4b31a0a46	user.created	user	787e3b33-eec9-4a8c-81d8-b2319ef032cb	self-registration	not@example.com	{"role": "user", "email": "not@example.com", "userId": "787e3b33-eec9-4a8c-81d8-b2319ef032cb", "lastName": "notification", "firstName": "notification", "performedBy": "self-registration", "performedByEmail": "not@example.com"}	\N	2026-06-03 06:59:46.856208
a41b609a-215c-4547-bcd6-58af0c9fb3a4	role.changed	user	787e3b33-eec9-4a8c-81d8-b2319ef032cb	admin	admin@system	{"email": "not@example.com", "reason": "Admin role change", "userId": "787e3b33-eec9-4a8c-81d8-b2319ef032cb", "newRole": "inspector", "oldRole": "user", "lastName": "notification", "firstName": "notification", "performedBy": "admin", "performedByEmail": "admin@system"}	\N	2026-06-03 07:01:16.58863
fc4a330b-3e13-4ea1-82d9-e1e16749bd5f	user.created	user	3cbf7758-a53b-464f-bf9c-fac38efb7a6a	self-registration	new@gmail.com	{"role": "user", "email": "new@gmail.com", "userId": "3cbf7758-a53b-464f-bf9c-fac38efb7a6a", "lastName": "new", "firstName": "new", "performedBy": "self-registration", "performedByEmail": "new@gmail.com"}	\N	2026-06-04 03:01:11.363431
c69cf636-03d7-44d0-a05d-198fcb2b35eb	user.created	user	049bdbe1-8c15-4680-9279-64a03f34bb05	admin-privileged	admin@system	{"role": "user", "email": "sssample@gmail.com", "userId": "049bdbe1-8c15-4680-9279-64a03f34bb05", "lastName": "sample", "firstName": "sample user", "performedBy": "admin-privileged", "performedByEmail": "admin@system"}	\N	2026-06-04 04:48:07.212455
c0175542-254b-4647-b9a8-5263e39d70c4	password.changed	user	049bdbe1-8c15-4680-9279-64a03f34bb05	049bdbe1-8c15-4680-9279-64a03f34bb05	sssample@gmail.com	{"email": "sssample@gmail.com", "userId": "049bdbe1-8c15-4680-9279-64a03f34bb05", "firstName": "sample user", "performedBy": "049bdbe1-8c15-4680-9279-64a03f34bb05", "performedByEmail": "sssample@gmail.com"}	\N	2026-06-04 04:50:33.763077
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: reporting_schema; Owner: -
--

COPY reporting_schema.reports (id, title, type, format, data, "filePath", "generatedBy", "periodStart", "periodEnd", "createdAt") FROM stdin;
b0a466a6-7fde-4960-a5cd-2e38743fcebb	Test Monthly Report	monthly	json	{"type": "monthly", "periodEnd": null, "generatedAt": "2026-06-03T10:25:40.000Z", "periodStart": null}	\N	dccf53bd-1cbc-470c-acfb-7d5be149f49b	\N	\N	2026-06-03 05:25:40.056198
5dada3ae-6065-4b86-909f-de839466a99b	QA Report	monthly	json	{"type": "monthly", "periodEnd": null, "generatedAt": "2026-06-03T10:33:52.009Z", "periodStart": null}	\N	dccf53bd-1cbc-470c-acfb-7d5be149f49b	\N	\N	2026-06-03 05:33:52.016875
2ad4b20f-ee86-4780-a39f-17d618641778	QA daily	daily	json	{"type": "daily", "periodEnd": null, "generatedAt": "2026-06-03T10:37:14.162Z", "periodStart": null}	\N	dccf53bd-1cbc-470c-acfb-7d5be149f49b	\N	\N	2026-06-03 05:37:14.177067
460a0a43-340c-4705-a257-94425a5f4b6d	QA monthly	monthly	json	{"type": "monthly", "periodEnd": null, "generatedAt": "2026-06-03T10:37:14.191Z", "periodStart": null}	\N	dccf53bd-1cbc-470c-acfb-7d5be149f49b	\N	\N	2026-06-03 05:37:14.191968
bd36e305-f2af-4112-baba-375179e1f68f	QA yearly	yearly	json	{"type": "yearly", "periodEnd": null, "generatedAt": "2026-06-03T10:37:14.200Z", "periodStart": null}	\N	dccf53bd-1cbc-470c-acfb-7d5be149f49b	\N	\N	2026-06-03 05:37:14.201512
3df3e0ea-df5e-4071-8b78-54654091db07	QA expired_extinguishers	expired_extinguishers	json	[]	\N	dccf53bd-1cbc-470c-acfb-7d5be149f49b	\N	\N	2026-06-03 05:37:14.215213
1b3de884-cc21-4815-8907-d02d86678e25	QA maintenance_history	maintenance_history	json	{"message": "Maintenance history", "generatedAt": "2026-06-03T10:37:14.220Z"}	\N	dccf53bd-1cbc-470c-acfb-7d5be149f49b	\N	\N	2026-06-03 05:37:14.220888
66cad459-e74b-4329-8bc6-e277b4c2a869	QA inspection_summary	inspection_summary	json	{"message": "Inspection summary", "generatedAt": "2026-06-03T10:37:14.225Z"}	\N	dccf53bd-1cbc-470c-acfb-7d5be149f49b	\N	\N	2026-06-03 05:37:14.225913
c46b6f98-abf0-4a98-a5a2-223f708e8109	Sample	monthly	pdf	{"type": "monthly", "periodEnd": "2026-06-27", "generatedAt": "2026-06-03T11:02:29.960Z", "periodStart": "2026-03-11"}	\N	33704276-c405-4272-9d45-8ab86f2da955	2026-03-11	2026-06-27	2026-06-03 06:02:29.967784
24ae61f1-de4d-40a7-b503-042622c348d9	Export Test	monthly	csv	{"type": "monthly", "periodEnd": null, "generatedAt": "2026-06-03T11:06:15.270Z", "periodStart": null}	\N	dccf53bd-1cbc-470c-acfb-7d5be149f49b	\N	\N	2026-06-03 06:06:15.274979
d24fb2e0-a4bd-4ebb-8ffa-f69c655942f2	weratat	monthly	pdf	{"type": "monthly", "periodEnd": "2026-06-05", "generatedAt": "2026-06-03T11:31:14.883Z", "periodStart": "2026-06-03"}	\N	33704276-c405-4272-9d45-8ab86f2da955	2026-06-03	2026-06-05	2026-06-03 06:31:14.88974
ee68b63a-bc16-4472-8189-bd2685f65013	Sample monthly report	monthly	csv	{"type": "monthly", "periodEnd": "2026-06-12", "generatedAt": "2026-06-04T08:06:32.286Z", "periodStart": "2026-06-01"}	\N	9eee55dc-496f-4709-bf68-76d8e713ce8d	2026-06-01	2026-06-12	2026-06-04 03:06:32.292776
b04179bb-04c7-4950-9dc7-0733f04ad49d	Sample title 	monthly	json	{"type": "monthly", "periodEnd": "2026-06-12", "generatedAt": "2026-06-04T09:53:12.356Z", "periodStart": "2026-06-01"}	\N	9eee55dc-496f-4709-bf68-76d8e713ce8d	2026-06-01	2026-06-12	2026-06-04 04:53:12.361728
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: user_schema; Owner: -
--

COPY user_schema.user_profiles (id, email, "firstName", "lastName", phone, address, department, role, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: role_requests PK_32873821a9e1122603cc2fb86a9; Type: CONSTRAINT; Schema: auth_schema; Owner: -
--

ALTER TABLE ONLY auth_schema.role_requests
    ADD CONSTRAINT "PK_32873821a9e1122603cc2fb86a9" PRIMARY KEY (id);


--
-- Name: refresh_tokens PK_7d8bee0204106019488c4c50ffa; Type: CONSTRAINT; Schema: auth_schema; Owner: -
--

ALTER TABLE ONLY auth_schema.refresh_tokens
    ADD CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: auth_schema; Owner: -
--

ALTER TABLE ONLY auth_schema.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: auth_schema; Owner: -
--

ALTER TABLE ONLY auth_schema.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: fire_extinguishers PK_09b3c7167d7e7257325e239a58b; Type: CONSTRAINT; Schema: extinguisher_schema; Owner: -
--

ALTER TABLE ONLY extinguisher_schema.fire_extinguishers
    ADD CONSTRAINT "PK_09b3c7167d7e7257325e239a58b" PRIMARY KEY (id);


--
-- Name: fire_extinguishers UQ_723cab6c0137fa323ffacef0263; Type: CONSTRAINT; Schema: extinguisher_schema; Owner: -
--

ALTER TABLE ONLY extinguisher_schema.fire_extinguishers
    ADD CONSTRAINT "UQ_723cab6c0137fa323ffacef0263" UNIQUE ("serialNumber");


--
-- Name: inspections PK_a484980015782324454d8c88abe; Type: CONSTRAINT; Schema: inspection_schema; Owner: -
--

ALTER TABLE ONLY inspection_schema.inspections
    ADD CONSTRAINT "PK_a484980015782324454d8c88abe" PRIMARY KEY (id);


--
-- Name: maintenance_logs PK_096e4b6bb7c9fe74d960e7523e4; Type: CONSTRAINT; Schema: maintenance_schema; Owner: -
--

ALTER TABLE ONLY maintenance_schema.maintenance_logs
    ADD CONSTRAINT "PK_096e4b6bb7c9fe74d960e7523e4" PRIMARY KEY (id);


--
-- Name: notifications PK_6a72c3c0f683f6462415e653c3a; Type: CONSTRAINT; Schema: notification_schema; Owner: -
--

ALTER TABLE ONLY notification_schema.notifications
    ADD CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY (id);


--
-- Name: Company Company_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Company"
    ADD CONSTRAINT "Company_pkey" PRIMARY KEY (id);


--
-- Name: FireExtinguisher FireExtinguisher_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FireExtinguisher"
    ADD CONSTRAINT "FireExtinguisher_pkey" PRIMARY KEY (id);


--
-- Name: NotificationThreshold NotificationThreshold_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NotificationThreshold"
    ADD CONSTRAINT "NotificationThreshold_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: audit_logs PK_1bb179d048bbc581caa3b013439; Type: CONSTRAINT; Schema: reporting_schema; Owner: -
--

ALTER TABLE ONLY reporting_schema.audit_logs
    ADD CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY (id);


--
-- Name: reports PK_d9013193989303580053c0b5ef6; Type: CONSTRAINT; Schema: reporting_schema; Owner: -
--

ALTER TABLE ONLY reporting_schema.reports
    ADD CONSTRAINT "PK_d9013193989303580053c0b5ef6" PRIMARY KEY (id);


--
-- Name: user_profiles PK_1ec6662219f4605723f1e41b6cb; Type: CONSTRAINT; Schema: user_schema; Owner: -
--

ALTER TABLE ONLY user_schema.user_profiles
    ADD CONSTRAINT "PK_1ec6662219f4605723f1e41b6cb" PRIMARY KEY (id);


--
-- Name: FireExtinguisher_serialNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "FireExtinguisher_serialNumber_key" ON public."FireExtinguisher" USING btree ("serialNumber");


--
-- Name: NotificationThreshold_companyId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "NotificationThreshold_companyId_key" ON public."NotificationThreshold" USING btree ("companyId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: FireExtinguisher FireExtinguisher_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FireExtinguisher"
    ADD CONSTRAINT "FireExtinguisher_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FireExtinguisher FireExtinguisher_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FireExtinguisher"
    ADD CONSTRAINT "FireExtinguisher_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: NotificationThreshold NotificationThreshold_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NotificationThreshold"
    ADD CONSTRAINT "NotificationThreshold_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_extinguisherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_extinguisherId_fkey" FOREIGN KEY ("extinguisherId") REFERENCES public."FireExtinguisher"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

