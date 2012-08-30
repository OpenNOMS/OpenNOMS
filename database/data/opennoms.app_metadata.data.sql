--
-- PostgreSQL database dump
--

-- Dumped from database version 9.0.5
-- Dumped by pg_dump version 9.0.5
-- Started on 2011-11-29 13:18:31

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = off;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET escape_string_warning = off;

SET search_path = app_metadata, pg_catalog;

--
-- TOC entry 3315 (class 0 OID 142976)
-- Dependencies: 263
-- Data for Name: airlines; Type: TABLE DATA; Schema: app_metadata; Owner: postgres
--

INSERT INTO airlines VALUES ('TRS', 'Airtran', true);
INSERT INTO airlines VALUES ('AWE', 'America West', true);
INSERT INTO airlines VALUES ('AAL', 'American', true);
INSERT INTO airlines VALUES ('EGF', 'American Eagle', true);
INSERT INTO airlines VALUES ('CAW', 'Comair', true);
INSERT INTO airlines VALUES ('CPZ', 'Compass', true);
INSERT INTO airlines VALUES ('COA', 'Continental', true);
INSERT INTO airlines VALUES ('DAL', 'Delta', true);
INSERT INTO airlines VALUES ('FDX', 'FedEx', true);
INSERT INTO airlines VALUES ('FFT', 'Frontier Airlines', true);
INSERT INTO airlines VALUES ('MES', 'Mesaba', true);
INSERT INTO airlines VALUES ('FLG', 'Pinnacle', true);
INSERT INTO airlines VALUES ('RPA', 'Republic Airlines', true);
INSERT INTO airlines VALUES ('TCF', 'Shuttle America', true);
INSERT INTO airlines VALUES ('SLL', 'Skywest Airlines', true);
INSERT INTO airlines VALUES ('SWA', 'Southwest', true);
INSERT INTO airlines VALUES ('SCX', 'Sun Country', true);
INSERT INTO airlines VALUES ('UAL', 'United', true);
INSERT INTO airlines VALUES ('UPS', 'UPS', true);


--
-- TOC entry 3313 (class 0 OID 142940)
-- Dependencies: 261
-- Data for Name: airports; Type: TABLE DATA; Schema: app_metadata; Owner: postgres
--

INSERT INTO airports VALUES ('MSP', 'MINNEAPOLIS\\ST PAUL', '0101000020E610000000000000324E57C000000060E5704640');
INSERT INTO airports VALUES ('STP', 'SAINT PAUL DOWNTOWN', NULL);
INSERT INTO airports VALUES ('FCM', 'Flying Cloud', NULL);
INSERT INTO airports VALUES ('ANE', 'Anoka/Blaine', NULL);
INSERT INTO airports VALUES ('MIC', 'Crystal', NULL);
INSERT INTO airports VALUES ('LVN', 'Airlake', NULL);
INSERT INTO airports VALUES ('21D', 'Lake Elmo', NULL);


--
-- TOC entry 3316 (class 0 OID 142996)
-- Dependencies: 265
-- Data for Name: flight_types; Type: TABLE DATA; Schema: app_metadata; Owner: postgres
--

INSERT INTO flight_types VALUES ('Arrivals', 'A', true);
INSERT INTO flight_types VALUES ('Departures', 'D', true);
INSERT INTO flight_types VALUES ('Unknown', 'O', true);


--
-- TOC entry 3314 (class 0 OID 142959)
-- Dependencies: 262 3313
-- Data for Name: runways; Type: TABLE DATA; Schema: app_metadata; Owner: postgres
--

INSERT INTO runways VALUES ('MSP', '12R', true);
INSERT INTO runways VALUES ('MSP', '30L', true);
INSERT INTO runways VALUES ('MSP', '12L', true);
INSERT INTO runways VALUES ('MSP', '30R', true);
INSERT INTO runways VALUES ('MSP', '17', true);
INSERT INTO runways VALUES ('MSP', '35', true);
INSERT INTO runways VALUES ('MSP', '4', true);
INSERT INTO runways VALUES ('MSP', '22', true);
INSERT INTO runways VALUES ('STP', '14', true);
INSERT INTO runways VALUES ('STP', '32', true);
INSERT INTO runways VALUES ('STP', '13', true);
INSERT INTO runways VALUES ('STP', '31', true);
INSERT INTO runways VALUES ('STP', '9', true);
INSERT INTO runways VALUES ('STP', '27', true);
INSERT INTO runways VALUES ('FCM', '10R', true);
INSERT INTO runways VALUES ('FCM', '10L', true);
INSERT INTO runways VALUES ('FCM', '28R', true);
INSERT INTO runways VALUES ('FCM', '28L', true);
INSERT INTO runways VALUES ('FCM', '36', true);
INSERT INTO runways VALUES ('FCM', '18', true);


-- Completed on 2011-11-29 13:18:31

--
-- PostgreSQL database dump complete
--

