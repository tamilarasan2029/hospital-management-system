--
-- PostgreSQL database dump
--

\restrict bXSWEXL2mZzUoqRLJBdnkm6GnmsBYZABcqymadHHnzljzUYO7ebRvEvNTqIhR5c

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-10-14 09:30:09

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
-- TOC entry 5264 (class 0 OID 0)
-- Dependencies: 225
-- Name: appointments_appointment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointments_appointment_id_seq OWNED BY public.appointments.appointment_id;


--
-- TOC entry 243 (class 1259 OID 25141)
-- Name: audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_log (
    audit_id integer NOT NULL,
    user_id integer,
    username character varying,
    action character varying(50) NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id character varying(50),
    details text,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.audit_log OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 25140)
-- Name: audit_log_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_log_audit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_log_audit_id_seq OWNER TO postgres;

--
-- TOC entry 5265 (class 0 OID 0)
-- Dependencies: 242
-- Name: audit_log_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_log_audit_id_seq OWNED BY public.audit_log.audit_id;


--
-- TOC entry 265 (class 1259 OID 25400)
-- Name: beds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.beds (
    bed_id integer NOT NULL,
    ward_id integer NOT NULL,
    bed_number character varying(20) NOT NULL,
    status character varying(20) NOT NULL,
    patient_id integer,
    admitted_at timestamp without time zone
);


ALTER TABLE public.beds OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 25399)
-- Name: beds_bed_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.beds_bed_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.beds_bed_id_seq OWNER TO postgres;

--
-- TOC entry 5266 (class 0 OID 0)
-- Dependencies: 264
-- Name: beds_bed_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.beds_bed_id_seq OWNED BY public.beds.bed_id;


--
-- TOC entry 269 (class 1259 OID 25445)
-- Name: bill_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bill_items (
    item_id integer NOT NULL,
    billing_id integer NOT NULL,
    category character varying(30) NOT NULL,
    description character varying(255) NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    amount numeric(10,2) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    service_date timestamp without time zone,
    end_date timestamp without time zone
);


ALTER TABLE public.bill_items OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 25444)
-- Name: bill_items_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bill_items_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bill_items_item_id_seq OWNER TO postgres;

--
-- TOC entry 5267 (class 0 OID 0)
-- Dependencies: 268
-- Name: bill_items_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bill_items_item_id_seq OWNED BY public.bill_items.item_id;


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
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    payment_method character varying(30)
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
-- TOC entry 5268 (class 0 OID 0)
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
-- TOC entry 5269 (class 0 OID 0)
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
-- TOC entry 5270 (class 0 OID 0)
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
-- TOC entry 5271 (class 0 OID 0)
-- Dependencies: 239
-- Name: equipment_equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_equipment_id_seq OWNED BY public.equipment.equipment_id;


--
-- TOC entry 260 (class 1259 OID 25322)
-- Name: insurance_claims; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.insurance_claims (
    claim_id integer NOT NULL,
    billing_id integer NOT NULL,
    patient_id integer NOT NULL,
    insurance_provider character varying(255) NOT NULL,
    policy_number character varying(100) NOT NULL,
    claim_amount numeric(10,2) NOT NULL,
    status character varying(20) NOT NULL,
    notes text,
    submitted_at timestamp without time zone NOT NULL,
    resolved_at timestamp without time zone
);


ALTER TABLE public.insurance_claims OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 25321)
-- Name: insurance_claims_claim_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.insurance_claims_claim_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.insurance_claims_claim_id_seq OWNER TO postgres;

--
-- TOC entry 5272 (class 0 OID 0)
-- Dependencies: 259
-- Name: insurance_claims_claim_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.insurance_claims_claim_id_seq OWNED BY public.insurance_claims.claim_id;


--
-- TOC entry 252 (class 1259 OID 25232)
-- Name: lab_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lab_orders (
    order_id integer NOT NULL,
    patient_id integer NOT NULL,
    doctor_id integer NOT NULL,
    appointment_id integer,
    test_type character varying(20) NOT NULL,
    test_name character varying(255) NOT NULL,
    status character varying(20) NOT NULL,
    result_text text,
    result_file_id integer,
    ordered_at timestamp without time zone NOT NULL,
    completed_at timestamp without time zone
);


ALTER TABLE public.lab_orders OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 25231)
-- Name: lab_orders_order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lab_orders_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lab_orders_order_id_seq OWNER TO postgres;

--
-- TOC entry 5273 (class 0 OID 0)
-- Dependencies: 251
-- Name: lab_orders_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lab_orders_order_id_seq OWNED BY public.lab_orders.order_id;


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
-- TOC entry 5274 (class 0 OID 0)
-- Dependencies: 227
-- Name: medical_records_record_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medical_records_record_id_seq OWNED BY public.medical_records.record_id;


--
-- TOC entry 254 (class 1259 OID 25268)
-- Name: medications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medications (
    medication_id integer NOT NULL,
    name character varying(255) NOT NULL,
    category character varying(100),
    unit character varying(30),
    stock_quantity integer NOT NULL,
    reorder_level integer NOT NULL,
    price numeric(10,2) NOT NULL,
    interacts_with text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone
);


ALTER TABLE public.medications OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 25267)
-- Name: medications_medication_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medications_medication_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medications_medication_id_seq OWNER TO postgres;

--
-- TOC entry 5275 (class 0 OID 0)
-- Dependencies: 253
-- Name: medications_medication_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medications_medication_id_seq OWNED BY public.medications.medication_id;


--
-- TOC entry 245 (class 1259 OID 25159)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    notification_id integer NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    reference_type character varying(50),
    reference_id integer,
    is_read boolean,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 25158)
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_notification_id_seq OWNER TO postgres;

--
-- TOC entry 5276 (class 0 OID 0)
-- Dependencies: 244
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;


--
-- TOC entry 258 (class 1259 OID 25296)
-- Name: ot_bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ot_bookings (
    ot_booking_id integer NOT NULL,
    patient_id integer NOT NULL,
    doctor_id integer NOT NULL,
    ot_room character varying(50) NOT NULL,
    procedure_name character varying(255),
    scheduled_start timestamp without time zone NOT NULL,
    scheduled_end timestamp without time zone NOT NULL,
    status character varying(20) NOT NULL,
    notes text
);


ALTER TABLE public.ot_bookings OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 25295)
-- Name: ot_bookings_ot_booking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ot_bookings_ot_booking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ot_bookings_ot_booking_id_seq OWNER TO postgres;

--
-- TOC entry 5277 (class 0 OID 0)
-- Dependencies: 257
-- Name: ot_bookings_ot_booking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ot_bookings_ot_booking_id_seq OWNED BY public.ot_bookings.ot_booking_id;


--
-- TOC entry 267 (class 1259 OID 25426)
-- Name: password_reset_otps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_otps (
    id integer NOT NULL,
    user_id integer NOT NULL,
    otp_hash character varying NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.password_reset_otps OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 25425)
-- Name: password_reset_otps_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_otps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_otps_id_seq OWNER TO postgres;

--
-- TOC entry 5278 (class 0 OID 0)
-- Dependencies: 266
-- Name: password_reset_otps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_otps_id_seq OWNED BY public.password_reset_otps.id;


--
-- TOC entry 261 (class 1259 OID 25348)
-- Name: patient_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_accounts (
    user_id integer NOT NULL,
    patient_id integer NOT NULL
);


ALTER TABLE public.patient_accounts OWNER TO postgres;

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
-- TOC entry 5279 (class 0 OID 0)
-- Dependencies: 221
-- Name: patients_patient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patients_patient_id_seq OWNED BY public.patients.patient_id;


--
-- TOC entry 263 (class 1259 OID 25368)
-- Name: pharmacy_dispenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pharmacy_dispenses (
    dispense_id integer NOT NULL,
    prescription_id integer,
    patient_id integer NOT NULL,
    medication_id integer NOT NULL,
    quantity integer NOT NULL,
    dispensed_at timestamp without time zone NOT NULL,
    dispensed_by_user_id integer
);


ALTER TABLE public.pharmacy_dispenses OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 25367)
-- Name: pharmacy_dispenses_dispense_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pharmacy_dispenses_dispense_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pharmacy_dispenses_dispense_id_seq OWNER TO postgres;

--
-- TOC entry 5280 (class 0 OID 0)
-- Dependencies: 262
-- Name: pharmacy_dispenses_dispense_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pharmacy_dispenses_dispense_id_seq OWNED BY public.pharmacy_dispenses.dispense_id;


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
-- TOC entry 5281 (class 0 OID 0)
-- Dependencies: 231
-- Name: prescriptions_prescription_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prescriptions_prescription_id_seq OWNED BY public.prescriptions.prescription_id;


--
-- TOC entry 250 (class 1259 OID 25209)
-- Name: queue_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.queue_entries (
    queue_id integer NOT NULL,
    patient_id integer NOT NULL,
    doctor_id integer NOT NULL,
    token_number integer NOT NULL,
    status character varying(20) NOT NULL,
    checked_in_at timestamp without time zone NOT NULL,
    called_at timestamp without time zone,
    completed_at timestamp without time zone
);


ALTER TABLE public.queue_entries OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 25208)
-- Name: queue_entries_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.queue_entries_queue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.queue_entries_queue_id_seq OWNER TO postgres;

--
-- TOC entry 5282 (class 0 OID 0)
-- Dependencies: 249
-- Name: queue_entries_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.queue_entries_queue_id_seq OWNED BY public.queue_entries.queue_id;


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
-- TOC entry 5283 (class 0 OID 0)
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
-- TOC entry 5284 (class 0 OID 0)
-- Dependencies: 233
-- Name: staff_staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_staff_id_seq OWNED BY public.staff.staff_id;


--
-- TOC entry 247 (class 1259 OID 25173)
-- Name: uploaded_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.uploaded_files (
    file_id integer NOT NULL,
    patient_id integer,
    doctor_id integer,
    original_filename character varying(255) NOT NULL,
    stored_filename character varying(255) NOT NULL,
    file_type character varying(50),
    description character varying(255),
    uploaded_at timestamp without time zone NOT NULL
);


ALTER TABLE public.uploaded_files OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 25172)
-- Name: uploaded_files_file_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.uploaded_files_file_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.uploaded_files_file_id_seq OWNER TO postgres;

--
-- TOC entry 5285 (class 0 OID 0)
-- Dependencies: 246
-- Name: uploaded_files_file_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.uploaded_files_file_id_seq OWNED BY public.uploaded_files.file_id;


--
-- TOC entry 248 (class 1259 OID 25195)
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profiles (
    user_id integer NOT NULL,
    display_name character varying(255),
    phone character varying(20),
    date_of_birth date,
    address character varying(255),
    city character varying(100),
    state character varying(100),
    country character varying(100),
    pincode character varying(20),
    updated_at timestamp without time zone
);


ALTER TABLE public.user_profiles OWNER TO postgres;

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
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    doctor_id integer
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
-- TOC entry 5286 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 256 (class 1259 OID 25285)
-- Name: wards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wards (
    ward_id integer NOT NULL,
    name character varying(100) NOT NULL,
    ward_type character varying(30) NOT NULL,
    total_beds integer NOT NULL
);


ALTER TABLE public.wards OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 25284)
-- Name: wards_ward_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wards_ward_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wards_ward_id_seq OWNER TO postgres;

--
-- TOC entry 5287 (class 0 OID 0)
-- Dependencies: 255
-- Name: wards_ward_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wards_ward_id_seq OWNED BY public.wards.ward_id;


--
-- TOC entry 4893 (class 2604 OID 16948)
-- Name: appointments appointment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments ALTER COLUMN appointment_id SET DEFAULT nextval('public.appointments_appointment_id_seq'::regclass);


--
-- TOC entry 4923 (class 2604 OID 25144)
-- Name: audit_log audit_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log ALTER COLUMN audit_id SET DEFAULT nextval('public.audit_log_audit_id_seq'::regclass);


--
-- TOC entry 4933 (class 2604 OID 25403)
-- Name: beds bed_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beds ALTER COLUMN bed_id SET DEFAULT nextval('public.beds_bed_id_seq'::regclass);


--
-- TOC entry 4935 (class 2604 OID 25448)
-- Name: bill_items item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_items ALTER COLUMN item_id SET DEFAULT nextval('public.bill_items_item_id_seq'::regclass);


--
-- TOC entry 4901 (class 2604 OID 16818)
-- Name: billing billing_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing ALTER COLUMN billing_id SET DEFAULT nextval('public.billing_billing_id_seq'::regclass);


--
-- TOC entry 4912 (class 2604 OID 16890)
-- Name: departments department_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);


--
-- TOC entry 4889 (class 2604 OID 17011)
-- Name: doctors doctor_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors ALTER COLUMN doctor_id SET DEFAULT nextval('public.doctors_doctor_id_seq'::regclass);


--
-- TOC entry 4918 (class 2604 OID 16930)
-- Name: equipment equipment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment ALTER COLUMN equipment_id SET DEFAULT nextval('public.equipment_equipment_id_seq'::regclass);


--
-- TOC entry 4931 (class 2604 OID 25325)
-- Name: insurance_claims claim_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insurance_claims ALTER COLUMN claim_id SET DEFAULT nextval('public.insurance_claims_claim_id_seq'::regclass);


--
-- TOC entry 4927 (class 2604 OID 25235)
-- Name: lab_orders order_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_orders ALTER COLUMN order_id SET DEFAULT nextval('public.lab_orders_order_id_seq'::regclass);


--
-- TOC entry 4898 (class 2604 OID 16794)
-- Name: medical_records record_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records ALTER COLUMN record_id SET DEFAULT nextval('public.medical_records_record_id_seq'::regclass);


--
-- TOC entry 4928 (class 2604 OID 25271)
-- Name: medications medication_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medications ALTER COLUMN medication_id SET DEFAULT nextval('public.medications_medication_id_seq'::regclass);


--
-- TOC entry 4924 (class 2604 OID 25162)
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);


--
-- TOC entry 4930 (class 2604 OID 25299)
-- Name: ot_bookings ot_booking_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ot_bookings ALTER COLUMN ot_booking_id SET DEFAULT nextval('public.ot_bookings_ot_booking_id_seq'::regclass);


--
-- TOC entry 4934 (class 2604 OID 25429)
-- Name: password_reset_otps id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_otps ALTER COLUMN id SET DEFAULT nextval('public.password_reset_otps_id_seq'::regclass);


--
-- TOC entry 4886 (class 2604 OID 17049)
-- Name: patients patient_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients ALTER COLUMN patient_id SET DEFAULT nextval('public.patients_patient_id_seq'::regclass);


--
-- TOC entry 4932 (class 2604 OID 25371)
-- Name: pharmacy_dispenses dispense_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_dispenses ALTER COLUMN dispense_id SET DEFAULT nextval('public.pharmacy_dispenses_dispense_id_seq'::regclass);


--
-- TOC entry 4905 (class 2604 OID 16843)
-- Name: prescriptions prescription_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions ALTER COLUMN prescription_id SET DEFAULT nextval('public.prescriptions_prescription_id_seq'::regclass);


--
-- TOC entry 4926 (class 2604 OID 25212)
-- Name: queue_entries queue_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_entries ALTER COLUMN queue_id SET DEFAULT nextval('public.queue_entries_queue_id_seq'::regclass);


--
-- TOC entry 4915 (class 2604 OID 16911)
-- Name: services service_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN service_id SET DEFAULT nextval('public.services_service_id_seq'::regclass);


--
-- TOC entry 4908 (class 2604 OID 16870)
-- Name: staff staff_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff ALTER COLUMN staff_id SET DEFAULT nextval('public.staff_staff_id_seq'::regclass);


--
-- TOC entry 4925 (class 2604 OID 25176)
-- Name: uploaded_files file_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uploaded_files ALTER COLUMN file_id SET DEFAULT nextval('public.uploaded_files_file_id_seq'::regclass);


--
-- TOC entry 4882 (class 2604 OID 17085)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 4929 (class 2604 OID 25288)
-- Name: wards ward_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wards ALTER COLUMN ward_id SET DEFAULT nextval('public.wards_ward_id_seq'::regclass);


--
-- TOC entry 4960 (class 2606 OID 16950)
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (appointment_id);


--
-- TOC entry 4992 (class 2606 OID 25152)
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (audit_id);


--
-- TOC entry 5020 (class 2606 OID 25409)
-- Name: beds beds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beds
    ADD CONSTRAINT beds_pkey PRIMARY KEY (bed_id);


--
-- TOC entry 5024 (class 2606 OID 25458)
-- Name: bill_items bill_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_items
    ADD CONSTRAINT bill_items_pkey PRIMARY KEY (item_id);


--
-- TOC entry 4969 (class 2606 OID 16826)
-- Name: billing billing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing
    ADD CONSTRAINT billing_pkey PRIMARY KEY (billing_id);


--
-- TOC entry 4983 (class 2606 OID 16900)
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- TOC entry 4985 (class 2606 OID 16898)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);


--
-- TOC entry 4952 (class 2606 OID 16754)
-- Name: doctors doctors_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_email_key UNIQUE (email);


--
-- TOC entry 4954 (class 2606 OID 17013)
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (doctor_id);


--
-- TOC entry 4990 (class 2606 OID 16938)
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (equipment_id);


--
-- TOC entry 5012 (class 2606 OID 25337)
-- Name: insurance_claims insurance_claims_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insurance_claims
    ADD CONSTRAINT insurance_claims_pkey PRIMARY KEY (claim_id);


--
-- TOC entry 5002 (class 2606 OID 25246)
-- Name: lab_orders lab_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_orders
    ADD CONSTRAINT lab_orders_pkey PRIMARY KEY (order_id);


--
-- TOC entry 4967 (class 2606 OID 16802)
-- Name: medical_records medical_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_pkey PRIMARY KEY (record_id);


--
-- TOC entry 5004 (class 2606 OID 25283)
-- Name: medications medications_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medications
    ADD CONSTRAINT medications_name_key UNIQUE (name);


--
-- TOC entry 5006 (class 2606 OID 25281)
-- Name: medications medications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medications
    ADD CONSTRAINT medications_pkey PRIMARY KEY (medication_id);


--
-- TOC entry 4994 (class 2606 OID 25171)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- TOC entry 5010 (class 2606 OID 25310)
-- Name: ot_bookings ot_bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ot_bookings
    ADD CONSTRAINT ot_bookings_pkey PRIMARY KEY (ot_booking_id);


--
-- TOC entry 5022 (class 2606 OID 25438)
-- Name: password_reset_otps password_reset_otps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_otps
    ADD CONSTRAINT password_reset_otps_pkey PRIMARY KEY (id);


--
-- TOC entry 5014 (class 2606 OID 25356)
-- Name: patient_accounts patient_accounts_patient_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_accounts
    ADD CONSTRAINT patient_accounts_patient_id_key UNIQUE (patient_id);


--
-- TOC entry 5016 (class 2606 OID 25354)
-- Name: patient_accounts patient_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_accounts
    ADD CONSTRAINT patient_accounts_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4948 (class 2606 OID 16730)
-- Name: patients patients_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_email_key UNIQUE (email);


--
-- TOC entry 4950 (class 2606 OID 17051)
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (patient_id);


--
-- TOC entry 5018 (class 2606 OID 25378)
-- Name: pharmacy_dispenses pharmacy_dispenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_dispenses
    ADD CONSTRAINT pharmacy_dispenses_pkey PRIMARY KEY (dispense_id);


--
-- TOC entry 4975 (class 2606 OID 16853)
-- Name: prescriptions prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_pkey PRIMARY KEY (prescription_id);


--
-- TOC entry 5000 (class 2606 OID 25220)
-- Name: queue_entries queue_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_entries
    ADD CONSTRAINT queue_entries_pkey PRIMARY KEY (queue_id);


--
-- TOC entry 4988 (class 2606 OID 16919)
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (service_id);


--
-- TOC entry 4979 (class 2606 OID 16883)
-- Name: staff staff_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_email_key UNIQUE (email);


--
-- TOC entry 4981 (class 2606 OID 16881)
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (staff_id);


--
-- TOC entry 4996 (class 2606 OID 25184)
-- Name: uploaded_files uploaded_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uploaded_files
    ADD CONSTRAINT uploaded_files_pkey PRIMARY KEY (file_id);


--
-- TOC entry 4998 (class 2606 OID 25202)
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4939 (class 2606 OID 16710)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4941 (class 2606 OID 17087)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4943 (class 2606 OID 17102)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5008 (class 2606 OID 25294)
-- Name: wards wards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wards
    ADD CONSTRAINT wards_pkey PRIMARY KEY (ward_id);


--
-- TOC entry 4961 (class 1259 OID 16788)
-- Name: idx_appointments_date_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_date_time ON public.appointments USING btree (appointment_date_time);


--
-- TOC entry 4962 (class 1259 OID 16977)
-- Name: idx_appointments_doctor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_doctor ON public.appointments USING btree (doctor_id);


--
-- TOC entry 4963 (class 1259 OID 16994)
-- Name: idx_appointments_patient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_patient ON public.appointments USING btree (patient_id);


--
-- TOC entry 4964 (class 1259 OID 16789)
-- Name: idx_appointments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_status ON public.appointments USING btree (status);


--
-- TOC entry 4970 (class 1259 OID 16837)
-- Name: idx_billing_patient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_billing_patient ON public.billing USING btree (patient_id);


--
-- TOC entry 4971 (class 1259 OID 16838)
-- Name: idx_billing_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_billing_status ON public.billing USING btree (status);


--
-- TOC entry 4955 (class 1259 OID 16755)
-- Name: idx_doctors_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctors_email ON public.doctors USING btree (email);


--
-- TOC entry 4956 (class 1259 OID 16758)
-- Name: idx_doctors_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctors_name ON public.doctors USING btree (name);


--
-- TOC entry 4957 (class 1259 OID 16756)
-- Name: idx_doctors_specialization; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctors_specialization ON public.doctors USING btree (specialization);


--
-- TOC entry 4958 (class 1259 OID 16757)
-- Name: idx_doctors_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctors_status ON public.doctors USING btree (status);


--
-- TOC entry 4965 (class 1259 OID 16813)
-- Name: idx_medical_records_patient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medical_records_patient ON public.medical_records USING btree (patient_id);


--
-- TOC entry 4944 (class 1259 OID 16731)
-- Name: idx_patients_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patients_email ON public.patients USING btree (email);


--
-- TOC entry 4945 (class 1259 OID 16733)
-- Name: idx_patients_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patients_name ON public.patients USING btree (name);


--
-- TOC entry 4946 (class 1259 OID 17083)
-- Name: idx_patients_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patients_phone ON public.patients USING btree (phone);


--
-- TOC entry 4972 (class 1259 OID 16865)
-- Name: idx_prescriptions_appointment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prescriptions_appointment ON public.prescriptions USING btree (appointment_id);


--
-- TOC entry 4973 (class 1259 OID 16864)
-- Name: idx_prescriptions_patient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prescriptions_patient ON public.prescriptions USING btree (patient_id);


--
-- TOC entry 4986 (class 1259 OID 16925)
-- Name: idx_services_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_services_name ON public.services USING btree (name);


--
-- TOC entry 4976 (class 1259 OID 16884)
-- Name: idx_staff_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_email ON public.staff USING btree (email);


--
-- TOC entry 4977 (class 1259 OID 16885)
-- Name: idx_staff_position; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_position ON public.staff USING btree ("position");


--
-- TOC entry 4936 (class 1259 OID 16711)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4937 (class 1259 OID 17099)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- TOC entry 5026 (class 2606 OID 17020)
-- Name: appointments appointments_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(doctor_id) ON DELETE RESTRICT;


--
-- TOC entry 5027 (class 2606 OID 17068)
-- Name: appointments appointments_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE RESTRICT;


--
-- TOC entry 5037 (class 2606 OID 25153)
-- Name: audit_log audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 5057 (class 2606 OID 25415)
-- Name: beds beds_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beds
    ADD CONSTRAINT beds_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- TOC entry 5058 (class 2606 OID 25410)
-- Name: beds beds_ward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beds
    ADD CONSTRAINT beds_ward_id_fkey FOREIGN KEY (ward_id) REFERENCES public.wards(ward_id);


--
-- TOC entry 5060 (class 2606 OID 25459)
-- Name: bill_items bill_items_billing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_items
    ADD CONSTRAINT bill_items_billing_id_fkey FOREIGN KEY (billing_id) REFERENCES public.billing(billing_id) ON DELETE CASCADE;


--
-- TOC entry 5030 (class 2606 OID 16957)
-- Name: billing billing_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing
    ADD CONSTRAINT billing_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(appointment_id) ON DELETE SET NULL;


--
-- TOC entry 5031 (class 2606 OID 17058)
-- Name: billing billing_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing
    ADD CONSTRAINT billing_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE RESTRICT;


--
-- TOC entry 5034 (class 2606 OID 17015)
-- Name: departments departments_head_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_head_doctor_id_fkey FOREIGN KEY (head_doctor_id) REFERENCES public.doctors(doctor_id) ON DELETE SET NULL;


--
-- TOC entry 5036 (class 2606 OID 16939)
-- Name: equipment equipment_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON DELETE SET NULL;


--
-- TOC entry 5049 (class 2606 OID 25338)
-- Name: insurance_claims insurance_claims_billing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insurance_claims
    ADD CONSTRAINT insurance_claims_billing_id_fkey FOREIGN KEY (billing_id) REFERENCES public.billing(billing_id);


--
-- TOC entry 5050 (class 2606 OID 25343)
-- Name: insurance_claims insurance_claims_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insurance_claims
    ADD CONSTRAINT insurance_claims_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- TOC entry 5043 (class 2606 OID 25257)
-- Name: lab_orders lab_orders_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_orders
    ADD CONSTRAINT lab_orders_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(appointment_id);


--
-- TOC entry 5044 (class 2606 OID 25252)
-- Name: lab_orders lab_orders_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_orders
    ADD CONSTRAINT lab_orders_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(doctor_id);


--
-- TOC entry 5045 (class 2606 OID 25247)
-- Name: lab_orders lab_orders_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_orders
    ADD CONSTRAINT lab_orders_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- TOC entry 5046 (class 2606 OID 25262)
-- Name: lab_orders lab_orders_result_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_orders
    ADD CONSTRAINT lab_orders_result_file_id_fkey FOREIGN KEY (result_file_id) REFERENCES public.uploaded_files(file_id);


--
-- TOC entry 5028 (class 2606 OID 16952)
-- Name: medical_records medical_records_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(appointment_id) ON DELETE SET NULL;


--
-- TOC entry 5029 (class 2606 OID 17053)
-- Name: medical_records medical_records_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;


--
-- TOC entry 5047 (class 2606 OID 25316)
-- Name: ot_bookings ot_bookings_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ot_bookings
    ADD CONSTRAINT ot_bookings_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(doctor_id);


--
-- TOC entry 5048 (class 2606 OID 25311)
-- Name: ot_bookings ot_bookings_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ot_bookings
    ADD CONSTRAINT ot_bookings_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- TOC entry 5059 (class 2606 OID 25439)
-- Name: password_reset_otps password_reset_otps_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_otps
    ADD CONSTRAINT password_reset_otps_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 5051 (class 2606 OID 25362)
-- Name: patient_accounts patient_accounts_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_accounts
    ADD CONSTRAINT patient_accounts_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- TOC entry 5052 (class 2606 OID 25357)
-- Name: patient_accounts patient_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_accounts
    ADD CONSTRAINT patient_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 5053 (class 2606 OID 25394)
-- Name: pharmacy_dispenses pharmacy_dispenses_dispensed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_dispenses
    ADD CONSTRAINT pharmacy_dispenses_dispensed_by_user_id_fkey FOREIGN KEY (dispensed_by_user_id) REFERENCES public.users(user_id);


--
-- TOC entry 5054 (class 2606 OID 25389)
-- Name: pharmacy_dispenses pharmacy_dispenses_medication_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_dispenses
    ADD CONSTRAINT pharmacy_dispenses_medication_id_fkey FOREIGN KEY (medication_id) REFERENCES public.medications(medication_id);


--
-- TOC entry 5055 (class 2606 OID 25384)
-- Name: pharmacy_dispenses pharmacy_dispenses_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_dispenses
    ADD CONSTRAINT pharmacy_dispenses_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- TOC entry 5056 (class 2606 OID 25379)
-- Name: pharmacy_dispenses pharmacy_dispenses_prescription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_dispenses
    ADD CONSTRAINT pharmacy_dispenses_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(prescription_id);


--
-- TOC entry 5032 (class 2606 OID 16962)
-- Name: prescriptions prescriptions_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(appointment_id) ON DELETE CASCADE;


--
-- TOC entry 5033 (class 2606 OID 17063)
-- Name: prescriptions prescriptions_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;


--
-- TOC entry 5041 (class 2606 OID 25226)
-- Name: queue_entries queue_entries_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_entries
    ADD CONSTRAINT queue_entries_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(doctor_id);


--
-- TOC entry 5042 (class 2606 OID 25221)
-- Name: queue_entries queue_entries_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_entries
    ADD CONSTRAINT queue_entries_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- TOC entry 5035 (class 2606 OID 16920)
-- Name: services services_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON DELETE SET NULL;


--
-- TOC entry 5038 (class 2606 OID 25190)
-- Name: uploaded_files uploaded_files_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uploaded_files
    ADD CONSTRAINT uploaded_files_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(doctor_id);


--
-- TOC entry 5039 (class 2606 OID 25185)
-- Name: uploaded_files uploaded_files_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uploaded_files
    ADD CONSTRAINT uploaded_files_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- TOC entry 5040 (class 2606 OID 25203)
-- Name: user_profiles user_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 5025 (class 2606 OID 25420)
-- Name: users users_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(doctor_id);


-- Completed on 2026-10-14 09:30:14

--
-- PostgreSQL database dump complete
--

\unrestrict bXSWEXL2mZzUoqRLJBdnkm6GnmsBYZABcqymadHHnzljzUYO7ebRvEvNTqIhR5c

