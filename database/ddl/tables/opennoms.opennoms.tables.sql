--
-- PostgreSQL database dump
--

-- Dumped from database version 9.0.5
-- Dumped by pg_dump version 9.0.5
-- Started on 2011-11-29 11:40:16

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = off;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET escape_string_warning = off;

SET search_path = opennoms, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 164 (class 1259 OID 128511)
-- Dependencies: 3284 3285 3286 8 1569
-- Name: operations; Type: TABLE; Schema: opennoms; Owner: postgres; Tablespace: 
--

CREATE TABLE operations (
    opnum integer NOT NULL,
    actype text,
    arr_apt text,
    arr_rwy text,
    dep_apt text,
    dep_rwy text,
    flight_id text,
    airline text,
    beacon smallint,
    stime timestamp with time zone NOT NULL,
    etime timestamp with time zone NOT NULL,
    the_geom public.geometry NOT NULL,
    lastmod timestamp with time zone DEFAULT now(),
    infile text,
    length double precision,
    roughness double precision,
    mgap double precision,
    dupes text,
    splits text,
    trackinfo character varying(254),
    nnumber text,
    CONSTRAINT enforce_geotype_the_geom CHECK (((public.geometrytype(the_geom) = 'LINESTRING'::text) OR (the_geom IS NULL))),
    CONSTRAINT enforce_srid_the_geom CHECK ((public.srid(the_geom) = 26915))
)
WITH (fillfactor=95);


ALTER TABLE opennoms.operations OWNER TO postgres;

--
-- TOC entry 3324 (class 0 OID 0)
-- Dependencies: 164
-- Name: TABLE operations; Type: COMMENT; Schema: opennoms; Owner: postgres
--

COMMENT ON TABLE operations IS 'Flight track data, from FAA ASR9 (pre June 2010) and MLAT systems (June 2010 and on).';


--
-- TOC entry 165 (class 1259 OID 128520)
-- Dependencies: 3287 8 1569
-- Name: realtime_lines; Type: TABLE; Schema: opennoms; Owner: postgres; Tablespace: 
--

CREATE TABLE realtime_lines (
    tracknumber integer,
    tailnumber text,
    beacon integer,
    the_geom public.geometry,
    stime timestamp with time zone,
    etime timestamp with time zone,
    acid text,
    actype text,
    departure text,
    destination text,
    id integer NOT NULL,
    smoothed boolean DEFAULT false NOT NULL
);


ALTER TABLE opennoms.realtime_lines OWNER TO postgres;

--
-- TOC entry 176 (class 1259 OID 128732)
-- Dependencies: 3289 8
-- Name: events; Type: TABLE; Schema: opennoms; Owner: postgres; Tablespace: 
--

CREATE TABLE events (
    eventid integer NOT NULL,
    rmt smallint NOT NULL,
    stime timestamp with time zone NOT NULL,
    mtime timestamp with time zone NOT NULL,
    duration smallint NOT NULL,
    leq real NOT NULL,
    sel real NOT NULL,
    lmax real NOT NULL,
    prevhistory smallint[],
    history smallint[] NOT NULL,
    posthistory smallint[],
    lastmodified timestamp without time zone DEFAULT now(),
    infile text
);


ALTER TABLE opennoms.events OWNER TO postgres;

--
-- TOC entry 3325 (class 0 OID 0)
-- Dependencies: 176
-- Name: TABLE events; Type: COMMENT; Schema: opennoms; Owner: postgres
--

COMMENT ON TABLE events IS 'Data comes directly from InFlight exports, lastmodified is time imported and infile is the source file both filled in on our end.';


--
-- TOC entry 178 (class 1259 OID 128745)
-- Dependencies: 8
-- Name: noisematch; Type: TABLE; Schema: opennoms; Owner: postgres; Tablespace: 
--

CREATE TABLE noisematch (
    id integer NOT NULL,
    opnum integer NOT NULL,
    eventid integer NOT NULL,
    pocatime timestamp with time zone,
    pocadist3d real,
    pocadist2d real,
    pocaalt real,
    valid boolean,
    lastmod timestamp with time zone,
    infile text
)
WITH (fillfactor=97);


ALTER TABLE opennoms.noisematch OWNER TO postgres;

--
-- TOC entry 3326 (class 0 OID 0)
-- Dependencies: 178
-- Name: TABLE noisematch; Type: COMMENT; Schema: opennoms; Owner: postgres
--

COMMENT ON TABLE noisematch IS 'Data comes directly from InFlight exports, lastmodified is time imported and infile is the source file both filled in on our end.';


--
-- TOC entry 228 (class 1259 OID 128968)
-- Dependencies: 8 178
-- Name: noisematch_id_seq; Type: SEQUENCE; Schema: opennoms; Owner: postgres
--

CREATE SEQUENCE noisematch_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE opennoms.noisematch_id_seq OWNER TO postgres;

--
-- TOC entry 3327 (class 0 OID 0)
-- Dependencies: 228
-- Name: noisematch_id_seq; Type: SEQUENCE OWNED BY; Schema: opennoms; Owner: postgres
--

ALTER SEQUENCE noisematch_id_seq OWNED BY noisematch.id;


--
-- TOC entry 243 (class 1259 OID 129026)
-- Dependencies: 165 8
-- Name: realtime_lines_id_seq; Type: SEQUENCE; Schema: opennoms; Owner: postgres
--

CREATE SEQUENCE realtime_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE opennoms.realtime_lines_id_seq OWNER TO postgres;

--
-- TOC entry 3328 (class 0 OID 0)
-- Dependencies: 243
-- Name: realtime_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: opennoms; Owner: postgres
--

ALTER SEQUENCE realtime_lines_id_seq OWNED BY realtime_lines.id;


--
-- TOC entry 3290 (class 2604 OID 129109)
-- Dependencies: 228 178
-- Name: id; Type: DEFAULT; Schema: opennoms; Owner: postgres
--

ALTER TABLE noisematch ALTER COLUMN id SET DEFAULT nextval('noisematch_id_seq'::regclass);


--
-- TOC entry 3288 (class 2604 OID 129116)
-- Dependencies: 243 165
-- Name: id; Type: DEFAULT; Schema: opennoms; Owner: postgres
--

ALTER TABLE realtime_lines ALTER COLUMN id SET DEFAULT nextval('realtime_lines_id_seq'::regclass);


--
-- TOC entry 3307 (class 2606 OID 129166)
-- Dependencies: 176 176
-- Name: events_pkey; Type: CONSTRAINT; Schema: opennoms; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY events
    ADD CONSTRAINT events_pkey PRIMARY KEY (eventid);

ALTER TABLE events CLUSTER ON events_pkey;


--
-- TOC entry 3311 (class 2606 OID 129180)
-- Dependencies: 178 178
-- Name: noisematch_pkey; Type: CONSTRAINT; Schema: opennoms; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY noisematch
    ADD CONSTRAINT noisematch_pkey PRIMARY KEY (id);


--
-- TOC entry 3298 (class 2606 OID 129188)
-- Dependencies: 164 164
-- Name: operations_pkey; Type: CONSTRAINT; Schema: opennoms; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY operations
    ADD CONSTRAINT operations_pkey PRIMARY KEY (opnum);

ALTER TABLE operations CLUSTER ON operations_pkey;


--
-- TOC entry 3304 (class 1259 OID 129219)
-- Dependencies: 176
-- Name: events_mtime_idx; Type: INDEX; Schema: opennoms; Owner: postgres; Tablespace: 
--

CREATE INDEX events_mtime_idx ON events USING btree (mtime);


--
-- TOC entry 3305 (class 1259 OID 129220)
-- Dependencies: 176 176 176
-- Name: events_mtime_rmt_lmax; Type: INDEX; Schema: opennoms; Owner: postgres; Tablespace: 
--

CREATE INDEX events_mtime_rmt_lmax ON events USING btree (mtime DESC NULLS LAST, rmt, lmax DESC NULLS LAST);


--
-- TOC entry 3308 (class 1259 OID 129223)
-- Dependencies: 178
-- Name: fki_noisematch_opnum; Type: INDEX; Schema: opennoms; Owner: postgres; Tablespace: 
--

CREATE INDEX fki_noisematch_opnum ON noisematch USING btree (opnum);


--
-- TOC entry 3309 (class 1259 OID 129229)
-- Dependencies: 178
-- Name: noisematch_eventid_idx; Type: INDEX; Schema: opennoms; Owner: postgres; Tablespace: 
--

CREATE INDEX noisematch_eventid_idx ON noisematch USING btree (eventid);


--
-- TOC entry 3312 (class 1259 OID 129230)
-- Dependencies: 178
-- Name: noisematch_pocatime_idx; Type: INDEX; Schema: opennoms; Owner: postgres; Tablespace: 
--

CREATE INDEX noisematch_pocatime_idx ON noisematch USING btree (pocatime DESC NULLS LAST);


--
-- TOC entry 3291 (class 1259 OID 129232)
-- Dependencies: 164
-- Name: operations_actype_idx; Type: INDEX; Schema: opennoms; Owner: postgres; Tablespace: 
--

CREATE INDEX operations_actype_idx ON operations USING btree (actype);


--
-- TOC entry 3292 (class 1259 OID 129233)
-- Dependencies: 164 164
-- Name: operations_arr_apt_dep_apt_idx; Type: INDEX; Schema: opennoms; Owner: postgres; Tablespace: 
--

CREATE INDEX operations_arr_apt_dep_apt_idx ON operations USING btree (arr_apt, dep_apt);


--
-- TOC entry 3293 (class 1259 OID 129235)
-- Dependencies: 164
-- Name: operations_etime_idx; Type: INDEX; Schema: opennoms; Owner: postgres; Tablespace: 
--

CREATE INDEX operations_etime_idx ON operations USING btree (etime);


--
-- TOC entry 3294 (class 1259 OID 129236)
-- Dependencies: 164
-- Name: operations_infile_idx; Type: INDEX; Schema: opennoms; Owner: postgres; Tablespace: 
--

CREATE INDEX operations_infile_idx ON operations USING btree (infile DESC NULLS LAST);


--
-- TOC entry 3295 (class 1259 OID 129237)
-- Dependencies: 164
-- Name: operations_lastmod_idx; Type: INDEX; Schema: opennoms; Owner: postgres; Tablespace: 
--

CREATE INDEX operations_lastmod_idx ON operations USING btree (lastmod);


--
-- TOC entry 3296 (class 1259 OID 129238)
-- Dependencies: 164 164 164 1202
-- Name: operations_macad; Type: INDEX; Schema: opennoms; Owner: postgres; Tablespace: 
--

CREATE INDEX operations_macad ON operations USING btree (macad(arr_apt, dep_apt));


--
-- TOC entry 3299 (class 1259 OID 129239)
-- Dependencies: 164
-- Name: operations_stime_idx; Type: INDEX; Schema: opennoms; Owner: postgres; Tablespace: 
--

CREATE INDEX operations_stime_idx ON operations USING btree (stime);


--
-- TOC entry 3300 (class 1259 OID 129240)
-- Dependencies: 164
-- Name: ops_trackinfo_idx; Type: INDEX; Schema: opennoms; Owner: postgres; Tablespace: 
--

CREATE INDEX ops_trackinfo_idx ON operations USING btree (trackinfo);


--
-- TOC entry 3301 (class 1259 OID 129242)
-- Dependencies: 165
-- Name: realtime_lines_etime_idx; Type: INDEX; Schema: opennoms; Owner: postgres; Tablespace: 
--

CREATE INDEX realtime_lines_etime_idx ON realtime_lines USING btree (etime);


--
-- TOC entry 3302 (class 1259 OID 129243)
-- Dependencies: 165
-- Name: realtime_lines_stime_idx; Type: INDEX; Schema: opennoms; Owner: postgres; Tablespace: 
--

CREATE INDEX realtime_lines_stime_idx ON realtime_lines USING btree (stime);


--
-- TOC entry 3303 (class 1259 OID 129247)
-- Dependencies: 165
-- Name: realtime_lines_tracknumber_idx; Type: INDEX; Schema: opennoms; Owner: postgres; Tablespace: 
--

CREATE INDEX realtime_lines_tracknumber_idx ON realtime_lines USING btree (tracknumber);


--
-- TOC entry 3316 (class 2620 OID 129254)
-- Dependencies: 176 1106
-- Name: events_delete_trigger; Type: TRIGGER; Schema: opennoms; Owner: postgres
--

CREATE TRIGGER events_delete_trigger BEFORE DELETE ON events FOR EACH ROW EXECUTE PROCEDURE events_delete_trigger();


--
-- TOC entry 3317 (class 2620 OID 129256)
-- Dependencies: 176 1159
-- Name: insert_events_trigger; Type: TRIGGER; Schema: opennoms; Owner: postgres
--

CREATE TRIGGER insert_events_trigger BEFORE INSERT ON events FOR EACH ROW EXECUTE PROCEDURE insert_events_trigger();


--
-- TOC entry 3319 (class 2620 OID 129260)
-- Dependencies: 1163 178
-- Name: insert_noisematch_trigger; Type: TRIGGER; Schema: opennoms; Owner: postgres
--

CREATE TRIGGER insert_noisematch_trigger BEFORE INSERT ON noisematch FOR EACH ROW EXECUTE PROCEDURE insert_noisematch_trigger();


--
-- TOC entry 3315 (class 2620 OID 129261)
-- Dependencies: 164 1164
-- Name: insert_operations_trigger; Type: TRIGGER; Schema: opennoms; Owner: postgres
--

CREATE TRIGGER insert_operations_trigger BEFORE INSERT ON operations FOR EACH ROW EXECUTE PROCEDURE insert_operations_trigger();


--
-- TOC entry 3320 (class 2620 OID 129269)
-- Dependencies: 178 1209
-- Name: noisematch_delete_trigger; Type: TRIGGER; Schema: opennoms; Owner: postgres
--

CREATE TRIGGER noisematch_delete_trigger BEFORE DELETE ON noisematch FOR EACH ROW EXECUTE PROCEDURE noisematch_delete_trigger();


--
-- TOC entry 3313 (class 2620 OID 129270)
-- Dependencies: 164 1214
-- Name: operations_delete_trigger; Type: TRIGGER; Schema: opennoms; Owner: postgres
--

CREATE TRIGGER operations_delete_trigger BEFORE DELETE ON operations FOR EACH ROW EXECUTE PROCEDURE operations_delete_trigger();


--
-- TOC entry 3318 (class 2620 OID 129271)
-- Dependencies: 176 1258
-- Name: update_events_trigger; Type: TRIGGER; Schema: opennoms; Owner: postgres
--

CREATE TRIGGER update_events_trigger BEFORE UPDATE ON events FOR EACH ROW EXECUTE PROCEDURE update_events_trigger();


--
-- TOC entry 3321 (class 2620 OID 129272)
-- Dependencies: 178 1259
-- Name: update_noisematch_trigger; Type: TRIGGER; Schema: opennoms; Owner: postgres
--

CREATE TRIGGER update_noisematch_trigger BEFORE UPDATE ON noisematch FOR EACH ROW EXECUTE PROCEDURE update_noisematch_trigger();


--
-- TOC entry 3314 (class 2620 OID 129273)
-- Dependencies: 1260 164
-- Name: update_operations_trigger; Type: TRIGGER; Schema: opennoms; Owner: postgres
--

CREATE TRIGGER update_operations_trigger BEFORE UPDATE ON operations FOR EACH ROW EXECUTE PROCEDURE update_operations_trigger();



--
-- TOC entry 182 (class 1259 OID 128764)
-- Dependencies: 1576 8
-- Name: rmts; Type: TABLE; Schema: opennoms; Owner: postgres; Tablespace: 
--

CREATE TABLE rmts (
    gid integer NOT NULL,
    inm double precision,
    anoms_buf bigint,
    longitude double precision,
    latitude double precision,
    city character varying,
    address character varying,
    rmt integer NOT NULL,
    the_geom public.geometry,
    radius integer,
    ceiling integer,
    secondsbefore integer,
    secondsafter integer
);


ALTER TABLE opennoms.rmts OWNER TO postgres;

--
-- TOC entry 3307 (class 0 OID 0)
-- Dependencies: 182
-- Name: TABLE rmts; Type: COMMENT; Schema: opennoms; Owner: postgres
--

COMMENT ON TABLE rmts IS 'Remote Monitoring Tower locations and informations';


--
-- TOC entry 251 (class 1259 OID 129059)
-- Dependencies: 8 182
-- Name: rmts_gid_seq; Type: SEQUENCE; Schema: opennoms; Owner: postgres
--

CREATE SEQUENCE rmts_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE opennoms.rmts_gid_seq OWNER TO postgres;

--
-- TOC entry 3308 (class 0 OID 0)
-- Dependencies: 251
-- Name: rmts_gid_seq; Type: SEQUENCE OWNED BY; Schema: opennoms; Owner: postgres
--

ALTER SEQUENCE rmts_gid_seq OWNED BY rmts.gid;


--
-- TOC entry 3301 (class 2604 OID 129119)
-- Dependencies: 251 182
-- Name: gid; Type: DEFAULT; Schema: opennoms; Owner: postgres
--

ALTER TABLE rmts ALTER COLUMN gid SET DEFAULT nextval('rmts_gid_seq'::regclass);


--
-- TOC entry 3304 (class 2606 OID 129196)
-- Dependencies: 182 182
-- Name: rmts_pkey; Type: CONSTRAINT; Schema: opennoms; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY rmts
    ADD CONSTRAINT rmts_pkey PRIMARY KEY (rmt);


--
-- TOC entry 3302 (class 1259 OID 129251)
-- Dependencies: 182
-- Name: rmts_idx; Type: INDEX; Schema: opennoms; Owner: postgres; Tablespace: 
--

CREATE UNIQUE INDEX rmts_idx ON rmts USING btree (rmt);

ALTER TABLE rmts CLUSTER ON rmts_idx;


-- Completed on 2011-11-29 13:56:35

--
-- PostgreSQL database dump complete
--


