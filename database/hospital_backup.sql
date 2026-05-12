--
-- PostgreSQL database dump
--

\restrict Nkn1XgVPPlKdikR8OxRja8XTAbjs7xIH5nTDPI6lKWBueNxDAXxtJ5nWBBD55ck

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-12 10:10:31

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 16760)
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    appointment_id bigint NOT NULL,
    patient_id bigint NOT NULL,
    doctor_id bigint NOT NULL,
    appointment_date_time timestamp without time zone NOT NULL,
    duration_in_minutes integer DEFAULT 30,
    reason text,
    notes text,
    status character varying(20) DEFAULT 'SCHEDULED'::character varying,
    diagnosis text,
    prescription text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16759)
-- Name: appointments_appointment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointments_appointment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_appointment_id_seq OWNER TO postgres;

--
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 225
-- Name: appointments_appointment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointments_appointment_id_seq OWNED BY public.appointments.appointment_id;


--
-- TOC entry 230 (class 1259 OID 16815)
-- Name: billing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.billing (
    billing_id integer NOT NULL,
    patient_id integer NOT NULL,
    appointment_id integer,
    amount numeric(10,2) NOT NULL,
    description character varying(255),
    status character varying(20) DEFAULT 'PENDING'::character varying,
    payment_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.billing OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16814)
-- Name: billing_billing_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.billing_billing_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.billing_billing_id_seq OWNER TO postgres;

--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 229
-- Name: billing_billing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.billing_billing_id_seq OWNED BY public.billing.billing_id;


--
-- TOC entry 224 (class 1259 OID 16735)
-- Name: doctors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctors (
    doctor_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    specialization character varying(255) NOT NULL,
    years_of_experience integer NOT NULL,
    qualifications character varying(255),
    bio text,
    office character varying(100),
    consultation_fee double precision NOT NULL,
    status character varying(20) DEFAULT 'AVAILABLE'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.doctors OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16714)
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    patient_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    date_of_birth date NOT NULL,
    gender character varying(255),
    blood_type character varying(10),
    medical_history text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.patients OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16944)
-- Name: dashboard_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.dashboard_stats AS
 SELECT ( SELECT count(*) AS count
           FROM public.patients) AS total_patients,
    ( SELECT count(*) AS count
           FROM public.doctors) AS total_doctors,
    ( SELECT count(*) AS count
           FROM public.appointments) AS total_appointments,
    ( SELECT count(*) AS count
           FROM public.appointments
          WHERE ((appointments.status)::text = 'SCHEDULED'::text)) AS pending_appointments,
    ( SELECT count(*) AS count
           FROM public.appointments
          WHERE ((appointments.status)::text = 'COMPLETED'::text)) AS completed_appointments;


ALTER VIEW public.dashboard_stats OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16887)
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    department_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    head_doctor_id integer,
    phone character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16886)
-- Name: departments_department_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_department_id_seq OWNER TO postgres;

--
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 235
-- Name: departments_department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;


--
-- TOC entry 223 (class 1259 OID 16734)
-- Name: doctors_doctor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctors_doctor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctors_doctor_id_seq OWNER TO postgres;

--
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 223
-- Name: doctors_doctor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctors_doctor_id_seq OWNED BY public.doctors.doctor_id;


--
-- TOC entry 240 (class 1259 OID 16927)
-- Name: equipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment (
    equipment_id integer NOT NULL,
    name character varying(255) NOT NULL,
    department_id integer,
    quantity integer DEFAULT 1,
    purchase_date date,
    status character varying(20) DEFAULT 'WORKING'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.equipment OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16926)
-- Name: equipment_equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipment_equipment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_equipment_id_seq OWNER TO postgres;

--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 239
-- Name: equipment_equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_equipment_id_seq OWNED BY public.equipment.equipment_id;


--
-- TOC entry 228 (class 1259 OID 16791)
-- Name: medical_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_records (
    record_id integer NOT NULL,
    patient_id integer NOT NULL,
    appointment_id integer,
    record_type character varying(100),
    content text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.medical_records OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16790)
-- Name: medical_records_record_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medical_records_record_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_records_record_id_seq OWNER TO postgres;

--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 227
-- Name: medical_records_record_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medical_records_record_id_seq OWNED BY public.medical_records.record_id;


--
-- TOC entry 221 (class 1259 OID 16713)
-- Name: patients_patient_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patients_patient_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patients_patient_id_seq OWNER TO postgres;

--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 221
-- Name: patients_patient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patients_patient_id_seq OWNED BY public.patients.patient_id;


--
-- TOC entry 232 (class 1259 OID 16840)
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescriptions (
    prescription_id integer NOT NULL,
    appointment_id integer NOT NULL,
    patient_id integer NOT NULL,
    medication character varying(255) NOT NULL,
    dosage character varying(100),
    frequency character varying(100),
    duration character varying(100),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.prescriptions OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16839)
-- Name: prescriptions_prescription_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prescriptions_prescription_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prescriptions_prescription_id_seq OWNER TO postgres;

--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 231
-- Name: prescriptions_prescription_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prescriptions_prescription_id_seq OWNED BY public.prescriptions.prescription_id;


--
-- TOC entry 238 (class 1259 OID 16908)
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    service_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    cost numeric(10,2),
    department_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.services OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16907)
-- Name: services_service_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_service_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_service_id_seq OWNER TO postgres;

--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 237
-- Name: services_service_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.services_service_id_seq OWNED BY public.services.service_id;


--
-- TOC entry 234 (class 1259 OID 16867)
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    staff_id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    "position" character varying(100),
    department character varying(100),
    salary numeric(10,2),
    join_date date,
    status character varying(20) DEFAULT 'ACTIVE'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.staff OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16866)
-- Name: staff_staff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_staff_id_seq OWNER TO postgres;

--
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 233
-- Name: staff_staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_staff_id_seq OWNED BY public.staff.staff_id;


--
-- TOC entry 220 (class 1259 OID 16691)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id bigint NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    status character varying(20) DEFAULT 'ACTIVE'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16690)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 4820 (class 2604 OID 16948)
-- Name: appointments appointment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments ALTER COLUMN appointment_id SET DEFAULT nextval('public.appointments_appointment_id_seq'::regclass);


--
-- TOC entry 4828 (class 2604 OID 16818)
-- Name: billing billing_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing ALTER COLUMN billing_id SET DEFAULT nextval('public.billing_billing_id_seq'::regclass);


--
-- TOC entry 4839 (class 2604 OID 16890)
-- Name: departments department_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);


--
-- TOC entry 4816 (class 2604 OID 17011)
-- Name: doctors doctor_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors ALTER COLUMN doctor_id SET DEFAULT nextval('public.doctors_doctor_id_seq'::regclass);


--
-- TOC entry 4845 (class 2604 OID 16930)
-- Name: equipment equipment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment ALTER COLUMN equipment_id SET DEFAULT nextval('public.equipment_equipment_id_seq'::regclass);


--
-- TOC entry 4825 (class 2604 OID 16794)
-- Name: medical_records record_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records ALTER COLUMN record_id SET DEFAULT nextval('public.medical_records_record_id_seq'::regclass);


--
-- TOC entry 4813 (class 2604 OID 17049)
-- Name: patients patient_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients ALTER COLUMN patient_id SET DEFAULT nextval('public.patients_patient_id_seq'::regclass);


--
-- TOC entry 4832 (class 2604 OID 16843)
-- Name: prescriptions prescription_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions ALTER COLUMN prescription_id SET DEFAULT nextval('public.prescriptions_prescription_id_seq'::regclass);


--
-- TOC entry 4842 (class 2604 OID 16911)
-- Name: services service_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN service_id SET DEFAULT nextval('public.services_service_id_seq'::regclass);


--
-- TOC entry 4835 (class 2604 OID 16870)
-- Name: staff staff_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff ALTER COLUMN staff_id SET DEFAULT nextval('public.staff_staff_id_seq'::regclass);


--
-- TOC entry 4809 (class 2604 OID 17085)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 5071 (class 0 OID 16760)
-- Dependencies: 226
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (appointment_id, patient_id, doctor_id, appointment_date_time, duration_in_minutes, reason, notes, status, diagnosis, prescription, created_at, updated_at) FROM stdin;
15	4	14	2026-05-15 11:16:00	30	surgery	\N	SCHEDULED	\N	\N	2026-05-08 11:16:36.354387	2026-05-08 11:16:36.354387
16	1	12	2026-05-15 11:20:00	30	spinal code	\N	SCHEDULED	\N	\N	2026-05-08 11:20:50.422783	2026-05-08 11:20:50.422783
17	2	10	2026-05-15 14:18:00	30	spinal code	\N	SCHEDULED	\N	\N	2026-05-08 14:18:47.95502	2026-05-08 14:18:47.95502
18	3	12	2026-05-14 14:59:00	30	hand pain	\N	SCHEDULED	\N	\N	2026-05-08 15:00:06.739614	2026-05-08 15:00:06.739614
19	3	12	2026-05-09 10:07:00	30	checkup	\N	SCHEDULED	\N	\N	2026-05-09 09:08:05.005741	2026-05-09 09:08:05.005741
20	3	14	2026-05-09 10:08:00	30	checkup	\N	SCHEDULED	\N	\N	2026-05-09 09:08:48.166019	2026-05-09 09:08:48.167018
21	2	11	2026-05-16 09:09:00	30	follow up	\N	SCHEDULED	\N	\N	2026-05-09 09:09:19.45002	2026-05-09 09:09:19.45002
22	3	13	2026-05-15 12:09:00	30	follow up	\N	SCHEDULED	\N	\N	2026-05-09 09:09:48.844738	2026-05-09 09:09:48.844738
23	2	14	2026-05-15 11:19:00	30	normal checkup	\N	SCHEDULED	\N	\N	2026-05-09 09:19:24.476448	2026-05-09 09:19:24.476448
\.


--
-- TOC entry 5075 (class 0 OID 16815)
-- Dependencies: 230
-- Data for Name: billing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.billing (billing_id, patient_id, appointment_id, amount, description, status, payment_date, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5081 (class 0 OID 16887)
-- Dependencies: 236
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (department_id, name, description, head_doctor_id, phone, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5069 (class 0 OID 16735)
-- Dependencies: 224
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctors (doctor_id, name, email, phone, specialization, years_of_experience, qualifications, bio, office, consultation_fee, status, created_at, updated_at) FROM stdin;
10	Rajesh Kumar	rajesh@hospital.com	+91-9876543210	Cardiology	15	MD, DM Cardiology	Expert in heart diseases	Room 101	500	AVAILABLE	2026-05-07 17:04:06.124463	2026-05-07 17:04:06.124463
11	Priya Sharma	priya@hospital.com	+91-9876543211	Neurology	12	MD, DM Neurology	Brain specialist	Room 102	450	AVAILABLE	2026-05-07 17:04:06.124463	2026-05-07 17:04:06.124463
12	Amit Patel	amit@hospital.com	+91-9876543212	Orthopedics	10	MD, MS Orthopedics	Bone and joint expert	Room 103	400	AVAILABLE	2026-05-07 17:04:06.124463	2026-05-07 17:04:06.124463
13	Neha Gupta	neha@hospital.com	+91-9876543213	Pediatrics	8	MD Pediatrics	Children specialist	Room 104	350	AVAILABLE	2026-05-07 17:04:06.124463	2026-05-07 17:04:06.124463
14	Vikram Singh	vikram@hospital.com	+91-9876543214	General Surgery	18	MS Surgery	Surgical expert	Room 105	600	AVAILABLE	2026-05-07 17:04:06.124463	2026-05-07 17:04:06.124463
15	Anjali Verma	anjali@hospital.com	+91-9876543215	Gynecology	9	MD, DGO	Women health specialist	Room 106	380	AVAILABLE	2026-05-07 17:04:06.124463	2026-05-07 17:04:06.124463
\.


--
-- TOC entry 5085 (class 0 OID 16927)
-- Dependencies: 240
-- Data for Name: equipment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment (equipment_id, name, department_id, quantity, purchase_date, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5073 (class 0 OID 16791)
-- Dependencies: 228
-- Data for Name: medical_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medical_records (record_id, patient_id, appointment_id, record_type, content, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5067 (class 0 OID 16714)
-- Dependencies: 222
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (patient_id, name, email, phone, date_of_birth, gender, blood_type, medical_history, created_at, updated_at) FROM stdin;
1	Arjun Singh	arjun.singh@hospital.com	8765432100	1990-05-15	Male	O+	No known allergies	2026-04-11 15:11:28.252562	2026-04-11 15:11:28.252562
2	Priya Verma	priya.verma@hospital.com	8765432101	1992-08-22	Female	B+	Diabetes Type 2	2026-04-11 15:11:28.252562	2026-04-11 15:11:28.252562
3	Rajesh Gupta	rajesh.gupta@hospital.com	8765432102	1985-03-10	Male	A+	Hypertension	2026-04-11 15:11:28.252562	2026-04-11 15:11:28.252562
4	tamil	tamil@gmail.com	8765445678	2026-01-30	Male	A+		2026-04-22 21:56:44.062805	2026-04-22 21:56:44.062805
\.


--
-- TOC entry 5077 (class 0 OID 16840)
-- Dependencies: 232
-- Data for Name: prescriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescriptions (prescription_id, appointment_id, patient_id, medication, dosage, frequency, duration, notes, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5083 (class 0 OID 16908)
-- Dependencies: 238
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (service_id, name, description, cost, department_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5079 (class 0 OID 16867)
-- Dependencies: 234
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff (staff_id, name, email, phone, "position", department, salary, join_date, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5065 (class 0 OID 16691)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, email, password, role, status, created_at, updated_at) FROM stdin;
1	admin	admin@hospital.com	admin123	ADMIN	ACTIVE	2026-04-11 15:11:03.18356	2026-04-11 15:11:03.18356
2	doctor1	doctor1@hospital.com	doc123	DOCTOR	ACTIVE	2026-04-11 15:11:03.18356	2026-04-11 15:11:03.18356
3	patient1	patient1@hospital.com	pat123	PATIENT	ACTIVE	2026-04-11 15:11:03.18356	2026-04-11 15:11:03.18356
\.


--
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 225
-- Name: appointments_appointment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointments_appointment_id_seq', 23, true);


--
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 229
-- Name: billing_billing_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.billing_billing_id_seq', 1, false);


--
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 235
-- Name: departments_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_department_id_seq', 1, false);


--
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 223
-- Name: doctors_doctor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.doctors_doctor_id_seq', 15, true);


--
-- TOC entry 5106 (class 0 OID 0)
-- Dependencies: 239
-- Name: equipment_equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_equipment_id_seq', 1, false);


--
-- TOC entry 5107 (class 0 OID 0)
-- Dependencies: 227
-- Name: medical_records_record_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medical_records_record_id_seq', 1, false);


--
-- TOC entry 5108 (class 0 OID 0)
-- Dependencies: 221
-- Name: patients_patient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patients_patient_id_seq', 4, true);


--
-- TOC entry 5109 (class 0 OID 0)
-- Dependencies: 231
-- Name: prescriptions_prescription_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prescriptions_prescription_id_seq', 1, false);


--
-- TOC entry 5110 (class 0 OID 0)
-- Dependencies: 237
-- Name: services_service_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_service_id_seq', 1, false);


--
-- TOC entry 5111 (class 0 OID 0)
-- Dependencies: 233
-- Name: staff_staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.staff_staff_id_seq', 1, false);


--
-- TOC entry 5112 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 3, true);


--
-- TOC entry 4874 (class 2606 OID 16950)
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (appointment_id);


--
-- TOC entry 4883 (class 2606 OID 16826)
-- Name: billing billing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing
    ADD CONSTRAINT billing_pkey PRIMARY KEY (billing_id);


--
-- TOC entry 4897 (class 2606 OID 16900)
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- TOC entry 4899 (class 2606 OID 16898)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);


--
-- TOC entry 4866 (class 2606 OID 16754)
-- Name: doctors doctors_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_email_key UNIQUE (email);


--
-- TOC entry 4868 (class 2606 OID 17013)
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (doctor_id);


--
-- TOC entry 4904 (class 2606 OID 16938)
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (equipment_id);


--
-- TOC entry 4881 (class 2606 OID 16802)
-- Name: medical_records medical_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_pkey PRIMARY KEY (record_id);


--
-- TOC entry 4862 (class 2606 OID 16730)
-- Name: patients patients_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_email_key UNIQUE (email);


--
-- TOC entry 4864 (class 2606 OID 17051)
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (patient_id);


--
-- TOC entry 4889 (class 2606 OID 16853)
-- Name: prescriptions prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_pkey PRIMARY KEY (prescription_id);


--
-- TOC entry 4902 (class 2606 OID 16919)
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (service_id);


--
-- TOC entry 4893 (class 2606 OID 16883)
-- Name: staff staff_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_email_key UNIQUE (email);


--
-- TOC entry 4895 (class 2606 OID 16881)
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (staff_id);


--
-- TOC entry 4853 (class 2606 OID 16710)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4855 (class 2606 OID 17087)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4857 (class 2606 OID 17102)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4875 (class 1259 OID 16788)
-- Name: idx_appointments_date_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_date_time ON public.appointments USING btree (appointment_date_time);


--
-- TOC entry 4876 (class 1259 OID 16977)
-- Name: idx_appointments_doctor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_doctor ON public.appointments USING btree (doctor_id);


--
-- TOC entry 4877 (class 1259 OID 16994)
-- Name: idx_appointments_patient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_patient ON public.appointments USING btree (patient_id);


--
-- TOC entry 4878 (class 1259 OID 16789)
-- Name: idx_appointments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_status ON public.appointments USING btree (status);


--
-- TOC entry 4884 (class 1259 OID 16837)
-- Name: idx_billing_patient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_billing_patient ON public.billing USING btree (patient_id);


--
-- TOC entry 4885 (class 1259 OID 16838)
-- Name: idx_billing_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_billing_status ON public.billing USING btree (status);


--
-- TOC entry 4869 (class 1259 OID 16755)
-- Name: idx_doctors_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctors_email ON public.doctors USING btree (email);


--
-- TOC entry 4870 (class 1259 OID 16758)
-- Name: idx_doctors_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctors_name ON public.doctors USING btree (name);


--
-- TOC entry 4871 (class 1259 OID 16756)
-- Name: idx_doctors_specialization; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctors_specialization ON public.doctors USING btree (specialization);


--
-- TOC entry 4872 (class 1259 OID 16757)
-- Name: idx_doctors_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctors_status ON public.doctors USING btree (status);


--
-- TOC entry 4879 (class 1259 OID 16813)
-- Name: idx_medical_records_patient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medical_records_patient ON public.medical_records USING btree (patient_id);


--
-- TOC entry 4858 (class 1259 OID 16731)
-- Name: idx_patients_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patients_email ON public.patients USING btree (email);


--
-- TOC entry 4859 (class 1259 OID 16733)
-- Name: idx_patients_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patients_name ON public.patients USING btree (name);


--
-- TOC entry 4860 (class 1259 OID 17083)
-- Name: idx_patients_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patients_phone ON public.patients USING btree (phone);


--
-- TOC entry 4886 (class 1259 OID 16865)
-- Name: idx_prescriptions_appointment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prescriptions_appointment ON public.prescriptions USING btree (appointment_id);


--
-- TOC entry 4887 (class 1259 OID 16864)
-- Name: idx_prescriptions_patient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prescriptions_patient ON public.prescriptions USING btree (patient_id);


--
-- TOC entry 4900 (class 1259 OID 16925)
-- Name: idx_services_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_services_name ON public.services USING btree (name);


--
-- TOC entry 4890 (class 1259 OID 16884)
-- Name: idx_staff_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_email ON public.staff USING btree (email);


--
-- TOC entry 4891 (class 1259 OID 16885)
-- Name: idx_staff_position; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_position ON public.staff USING btree ("position");


--
-- TOC entry 4850 (class 1259 OID 16711)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4851 (class 1259 OID 17099)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- TOC entry 4905 (class 2606 OID 17020)
-- Name: appointments appointments_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(doctor_id) ON DELETE RESTRICT;


--
-- TOC entry 4906 (class 2606 OID 17068)
-- Name: appointments appointments_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE RESTRICT;


--
-- TOC entry 4909 (class 2606 OID 16957)
-- Name: billing billing_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing
    ADD CONSTRAINT billing_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(appointment_id) ON DELETE SET NULL;


--
-- TOC entry 4910 (class 2606 OID 17058)
-- Name: billing billing_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing
    ADD CONSTRAINT billing_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE RESTRICT;


--
-- TOC entry 4913 (class 2606 OID 17015)
-- Name: departments departments_head_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_head_doctor_id_fkey FOREIGN KEY (head_doctor_id) REFERENCES public.doctors(doctor_id) ON DELETE SET NULL;


--
-- TOC entry 4915 (class 2606 OID 16939)
-- Name: equipment equipment_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON DELETE SET NULL;


--
-- TOC entry 4907 (class 2606 OID 16952)
-- Name: medical_records medical_records_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(appointment_id) ON DELETE SET NULL;


--
-- TOC entry 4908 (class 2606 OID 17053)
-- Name: medical_records medical_records_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;


--
-- TOC entry 4911 (class 2606 OID 16962)
-- Name: prescriptions prescriptions_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(appointment_id) ON DELETE CASCADE;


--
-- TOC entry 4912 (class 2606 OID 17063)
-- Name: prescriptions prescriptions_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;


--
-- TOC entry 4914 (class 2606 OID 16920)
-- Name: services services_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON DELETE SET NULL;


-- Completed on 2026-05-12 10:10:31

--
-- PostgreSQL database dump complete
--

\unrestrict Nkn1XgVPPlKdikR8OxRja8XTAbjs7xIH5nTDPI6lKWBueNxDAXxtJ5nWBBD55ck

