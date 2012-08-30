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


ALTER SCHEMA app_metadata OWNER TO postgres;

SET search_path = app_metadata, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 263 (class 1259 OID 142992)
-- Dependencies: 3047 9
-- Name: advanced_query_choices; Type: VIEW; Schema: app_metadata; Owner: postgres
--

CREATE VIEW advanced_query_choices AS
    (SELECT ('Airport:'::text || airports.code) AS "group", runways.runway AS name, runways.runway AS value, runways.checked AS ischecked FROM airports, runways WHERE (airports.code = runways.airport_code) UNION SELECT 'Airline' AS "group", airlines.name, airlines.code AS value, airlines.checked AS ischecked FROM airlines) UNION SELECT 'Flight Type' AS "group", flight_types.type AS name, flight_types.code AS value, flight_types.checked AS ischecked FROM flight_types;


ALTER TABLE app_metadata.advanced_query_choices OWNER TO postgres;
