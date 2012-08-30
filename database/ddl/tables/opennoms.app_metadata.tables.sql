--
-- PostgreSQL database dump
--

-- Dumped from database version 9.0.5
-- Dumped by pg_dump version 9.0.5
-- Started on 2011-11-23 10:38:54

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = off;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET escape_string_warning = off;

--
-- TOC entry 9 (class 2615 OID 142928)
-- Name: app_metadata; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA app_metadata;


ALTER SCHEMA app_metadata OWNER TO postgres;

SET search_path = app_metadata, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 262 (class 1259 OID 142976)
-- Dependencies: 3260 9
-- Name: airlines; Type: TABLE; Schema: app_metadata; Owner: postgres; Tablespace: 
--

CREATE TABLE airlines (
    code text NOT NULL,
    name text NOT NULL,
    checked boolean DEFAULT true NOT NULL
);


ALTER TABLE app_metadata.airlines OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 142940)
-- Dependencies: 9 1554
-- Name: airports; Type: TABLE; Schema: app_metadata; Owner: postgres; Tablespace: 
--

CREATE TABLE airports (
    code text NOT NULL,
    name text,
    geom public.geometry
);


ALTER TABLE app_metadata.airports OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 142996)
-- Dependencies: 3261 9
-- Name: flight_types; Type: TABLE; Schema: app_metadata; Owner: postgres; Tablespace: 
--

CREATE TABLE flight_types (
    type text,
    code text NOT NULL,
    checked boolean DEFAULT true NOT NULL
);


ALTER TABLE app_metadata.flight_types OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 142959)
-- Dependencies: 3259 9
-- Name: runways; Type: TABLE; Schema: app_metadata; Owner: postgres; Tablespace: 
--

CREATE TABLE runways (
    airport_code text NOT NULL,
    runway text NOT NULL,
    checked boolean DEFAULT true NOT NULL
);


ALTER TABLE app_metadata.runways OWNER TO postgres;


--
-- TOC entry 3267 (class 2606 OID 142983)
-- Dependencies: 262 262
-- Name: airlines_pkey; Type: CONSTRAINT; Schema: app_metadata; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY airlines
    ADD CONSTRAINT airlines_pkey PRIMARY KEY (code);


--
-- TOC entry 3263 (class 2606 OID 142947)
-- Dependencies: 260 260
-- Name: airports_pkey; Type: CONSTRAINT; Schema: app_metadata; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY airports
    ADD CONSTRAINT airports_pkey PRIMARY KEY (code);


--
-- TOC entry 3269 (class 2606 OID 143003)
-- Dependencies: 264 264
-- Name: flight_types_pkey; Type: CONSTRAINT; Schema: app_metadata; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY flight_types
    ADD CONSTRAINT flight_types_pkey PRIMARY KEY (code);


--
-- TOC entry 3265 (class 2606 OID 142966)
-- Dependencies: 261 261 261
-- Name: runways_pkey; Type: CONSTRAINT; Schema: app_metadata; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY runways
    ADD CONSTRAINT runways_pkey PRIMARY KEY (airport_code, runway);


--
-- TOC entry 3270 (class 2606 OID 142967)
-- Dependencies: 261 3262 260
-- Name: runways_airport_code_fkey; Type: FK CONSTRAINT; Schema: app_metadata; Owner: postgres
--

ALTER TABLE ONLY runways
    ADD CONSTRAINT runways_airport_code_fkey FOREIGN KEY (airport_code) REFERENCES airports(code);


-- Completed on 2011-11-23 10:38:54

--
-- PostgreSQL database dump complete
--

