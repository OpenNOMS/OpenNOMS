-- View: opennoms.realtime_lines_view

-- DROP VIEW opennoms.realtime_lines_view;

CREATE OR REPLACE VIEW opennoms.realtime_lines_view AS 
        (         SELECT realtime_lines.id AS opnum, realtime_lines.stime, realtime_lines.etime, realtime_lines.etime AS runwaytime, realtime_lines.actype, actype.mactype, "substring"(realtime_lines.destination, '...$'::text) AS airport, 'A' AS adflag, NULL::unknown AS macad, NULL::unknown AS runway, "substring"(realtime_lines.acid, 1, 3) AS airline, realtime_lines.beacon::smallint AS beacon, realtime_lines.acid AS flight_id, realtime_lines.etime::time without time zone >= '22:30:00'::time without time zone OR realtime_lines.etime::time without time zone < '06:00:00'::time without time zone AS night, realtime_lines.etime::time without time zone >= '22:00:00'::time without time zone OR realtime_lines.etime::time without time zone < '07:00:00'::time without time zone AS inmnight, mactype.opertype, mactype.stage, mactype.image, mactype.manufactured, mactype.takeoffnoise, mactype.description, realtime_lines.departure AS otherport, realtime_lines.the_geom AS targets
                   FROM opennoms.realtime_lines
              LEFT JOIN alias.actype USING (actype)
         LEFT JOIN alias.mactype USING (mactype)
        WHERE opennoms.macairport(realtime_lines.destination)
        UNION ALL 
                 SELECT realtime_lines.id AS opnum, realtime_lines.stime, realtime_lines.etime, realtime_lines.stime AS runwaytime, realtime_lines.actype, actype.mactype, "substring"(realtime_lines.departure, '...$'::text) AS airport, 'D' AS adflag, NULL::unknown AS macad, NULL::unknown AS runway, "substring"(realtime_lines.acid, 1, 3) AS airline, realtime_lines.beacon::smallint AS beacon, realtime_lines.acid AS flight_id, realtime_lines.stime::time without time zone >= '22:30:00'::time without time zone OR realtime_lines.stime::time without time zone < '06:00:00'::time without time zone AS night, realtime_lines.stime::time without time zone >= '22:00:00'::time without time zone OR realtime_lines.stime::time without time zone < '07:00:00'::time without time zone AS inmnight, mactype.opertype, mactype.stage, mactype.image, mactype.manufactured, mactype.takeoffnoise, mactype.description, realtime_lines.destination AS otherport, realtime_lines.the_geom AS targets
                   FROM opennoms.realtime_lines
              LEFT JOIN alias.actype USING (actype)
         LEFT JOIN alias.mactype USING (mactype)
        WHERE opennoms.macairport(realtime_lines.departure))
UNION ALL 
         SELECT realtime_lines.id AS opnum, realtime_lines.stime, realtime_lines.etime, realtime_lines.stime AS runwaytime, realtime_lines.actype, actype.mactype, "substring"(realtime_lines.departure, '...$'::text) AS airport, 'O' AS adflag, NULL::unknown AS macad, NULL::unknown AS runway, "substring"(realtime_lines.acid, 1, 3) AS airline, realtime_lines.beacon::smallint AS beacon, realtime_lines.acid AS flight_id, realtime_lines.stime::time without time zone >= '22:30:00'::time without time zone OR realtime_lines.stime::time without time zone < '06:00:00'::time without time zone AS night, realtime_lines.stime::time without time zone >= '22:00:00'::time without time zone OR realtime_lines.stime::time without time zone < '07:00:00'::time without time zone AS inmnight, mactype.opertype, mactype.stage, mactype.image, mactype.manufactured, mactype.takeoffnoise, mactype.description, realtime_lines.destination AS otherport, realtime_lines.the_geom AS targets
           FROM opennoms.realtime_lines
      LEFT JOIN alias.actype USING (actype)
   LEFT JOIN alias.mactype USING (mactype)
  WHERE (realtime_lines.destination IS NULL OR opennoms.macairport(realtime_lines.destination) = false) AND (realtime_lines.departure IS NULL OR opennoms.macairport(realtime_lines.departure) = false);

ALTER TABLE opennoms.realtime_lines_view OWNER TO postgres;



-- View: opennoms.operations_view

--DROP VIEW opennoms.operations_view;

CREATE OR REPLACE VIEW opennoms.operations_view AS (        
(         
	SELECT operations.opnum, 
		operations.stime, 
		operations.etime, 
		--operations.etime AS runwaytime, 
		--operations.actype, 
		actype.mactype, 
		operations.arr_apt AS airport, 
		'A' AS adflag, 
		operations.arr_rwy AS runway, 
		operations.airline, 
		--operations.beacon, 
		operations.flight_id, 
		--operations.etime::time without time zone >= '22:30:00'::time without time zone OR operations.etime::time without time zone < '06:00:00'::time without time zone AS night, 
		--operations.etime::time without time zone >= '22:00:00'::time without time zone OR operations.etime::time without time zone < '07:00:00'::time without time zone AS inmnight,
		--mactype.opertype, 
		--mactype.stage, 
		--mactype.image, 
		--mactype.manufactured, 
		--mactype.takeoffnoise,
		mactype.description, 
		operations.dep_apt AS otherport, 
		operations.the_geom AS targets
	FROM opennoms.operations
	LEFT JOIN alias.actype USING (actype)
	LEFT JOIN alias.mactype USING (mactype)
	WHERE (operations.arr_apt = ANY (ARRAY['MSP'::text, 'FCM'::text, 'STP'::text, '21D'::text, 'MIC'::text, 'ANE'::text, 'LVN'::text])) AND (operations.trackinfo::text <> 'G'::text OR operations.trackinfo IS NULL)
	
UNION ALL 
	SELECT operations.opnum, 
		operations.stime, 
		operations.etime, 
		--operations.stime AS runwaytime, 
		--operations.actype, 
		actype.mactype, 
		operations.dep_apt AS airport, 
		'D' AS adflag, 
		operations.dep_rwy AS runway, 
		operations.airline, 
		--operations.beacon, 
		operations.flight_id, 
		--operations.stime::time without time zone >= '22:30:00'::time without time zone OR operations.stime::time without time zone < '06:00:00'::time without time zone AS night, 
		--operations.stime::time without time zone >= '22:00:00'::time without time zone OR operations.stime::time without time zone < '07:00:00'::time without time zone AS inmnight, 
		--mactype.opertype, 
		--mactype.stage, 
		--mactype.image, 
		--mactype.manufactured, 
		--mactype.takeoffnoise, 
		mactype.description, 
		operations.arr_apt AS otherport, 
		operations.the_geom AS targets
	FROM opennoms.operations
	LEFT JOIN alias.actype USING (actype)
	LEFT JOIN alias.mactype USING (mactype)
	WHERE (operations.dep_apt = ANY (ARRAY['MSP'::text, 'FCM'::text, 'STP'::text, '21D'::text, 'MIC'::text, 'ANE'::text, 'LVN'::text])) AND (operations.trackinfo::text <> 'G'::text OR operations.trackinfo IS NULL))

UNION ALL 
	SELECT operations.opnum, 
		operations.stime, 
		operations.etime, 
		--operations.etime AS runwaytime, 
		operations.actype, 
		--actype.mactype, 
		NULL::text AS airport, 
		'O' AS adflag, 
		NULL::unknown AS runway, 
		operations.airline, 
		--operations.beacon, 
		operations.flight_id, 
		--operations.stime::time without time zone >= '22:30:00'::time without time zone OR operations.stime::time without time zone < '06:00:00'::time without time zone AS night, 
		--operations.stime::time without time zone >= '22:00:00'::time without time zone OR operations.stime::time without time zone < '07:00:00'::time without time zone AS inmnight, 
		--mactype.opertype, 
		--mactype.stage, 
		--mactype.image, 
		--mactype.manufactured, 
		--mactype.takeoffnoise, 
		mactype.description, 
		NULL::text AS otherport, 
		operations.the_geom AS targets
	FROM opennoms.operations
	LEFT JOIN alias.actype USING (actype)
	LEFT JOIN alias.mactype USING (mactype)
	WHERE ((operations.dep_apt <> ALL (ARRAY['MSP'::text, 'FCM'::text, 'STP'::text, '21D'::text, 'MIC'::text, 'ANE'::text, 'LVN'::text])) OR operations.dep_apt IS NULL) AND ((operations.arr_apt <> ALL (ARRAY['MSP'::text, 'FCM'::text, 'STP'::text, '21D'::text, 'MIC'::text, 'ANE'::text, 'LVN'::text])) OR operations.arr_apt IS NULL) AND (operations.trackinfo::text <> 'G'::text OR operations.trackinfo IS NULL))

UNION ALL 
	SELECT realtime_lines_view.opnum, 
		realtime_lines_view.stime, 
		realtime_lines_view.etime, 
		--realtime_lines_view.runwaytime, 
		--realtime_lines_view.actype, 
		realtime_lines_view.mactype, 
		realtime_lines_view.airport, 
		realtime_lines_view.adflag, 
		realtime_lines_view.runway, 
		realtime_lines_view.airline, 
		--realtime_lines_view.beacon, 
		realtime_lines_view.flight_id, 
		--realtime_lines_view.night, 
		--realtime_lines_view.inmnight, 
		--realtime_lines_view.opertype, 
		--realtime_lines_view.stage, 
		--realtime_lines_view.image, 
		--realtime_lines_view.manufactured, 
		--realtime_lines_view.takeoffnoise, 
		realtime_lines_view.description, 
		realtime_lines_view.otherport, 
		realtime_lines_view.targets
	FROM opennoms.realtime_lines_view;

ALTER TABLE opennoms.operations_view OWNER TO postgres;





-- View: opennoms.getevents_view

-- DROP VIEW opennoms.getevents_view;

CREATE OR REPLACE VIEW opennoms.getevents_view AS 
 SELECT noisematch.eventid, noisematch.opnum, rmts.rmt, events.stime::timestamp without time zone AS stime, events.mtime::timestamp without time zone AS mtime, events.duration, events.leq, events.sel, events.lmax, round(events.lmax / 7::double precision) AS radius, astext(rmts.the_geom) AS wkt
   FROM opennoms.noisematch
   JOIN opennoms.events USING (eventid)
   JOIN opennoms.rmts USING (rmt)
  WHERE noisematch.valid;

ALTER TABLE opennoms.getevents_view OWNER TO postgres;



--
-- Name: realtimepoint; Type: VIEW; Schema: macnoms; Owner: -
--

-- DROP VIEW opennoms.realtimepoint;

--CREATE VIEW opennoms.realtimepoint AS
--    SELECT bar.opnum, bar.actype, bar.adflag, bar.airline, bar.flight_id, bar.pointn, bar.x, bar.y, bar.z, bar.t, bar.heading, bar.speed 
--    FROM (
--	SELECT foo.tracknumber AS opnum, foo.actype, 
--		CASE WHEN (foo.departure = 'KMSP'::text) THEN 'D'::text WHEN (foo.destination = 'KMSP'::text) THEN 'A'::text ELSE 'O'::text END AS adflag, 
--		CASE WHEN (foo.acid !~* 'N'::text) THEN "substring"(foo.acid, 1, 3) ELSE ''::text END AS airline, 
--		foo.acid AS flight_id, 1 AS pointn, round(public.st_x(foo.p)) AS x, round(public.st_y(foo.p)) AS y, 
--		round((public.st_z(foo.p) * (3.2808399)::double precision)) AS z, 
--		(round(date_part('epoch'::text, foo.t)) * (1000)::double precision) AS t, 
--		(round((mac_heading(public.st_startpoint(foo.seg), foo.p, public.st_endpoint(foo.seg)) / (10.0)::double precision)) * (10)::double precision) AS heading, 
--		round(((public.st_length(foo.seg) / (public.st_m(public.st_endpoint(foo.seg)) - public.st_m(public.st_startpoint(foo.seg)))) * (2.23693629)::double precision)) AS speed 
--	FROM (
--		SELECT realtime_lines.tracknumber, realtime_lines.tailnumber, realtime_lines.beacon, realtime_lines.the_geom, realtime_lines.stime, realtime_lines.etime, 
--			realtime_lines.acid, realtime_lines.actype, realtime_lines.departure, realtime_lines.destination, realtime_lines.id, t.t, 
--			public.st_locate_between_measures(realtime_lines.the_geom, date_part('epoch'::text, ((t.t - realtime_lines.stime) - '00:00:10'::interval)), 
--			date_part('epoch'::text, ((t.t - realtime_lines.stime) + '00:00:10'::interval))) AS seg, public.st_locate_along_measure(realtime_lines.the_geom, 
--			date_part('epoch'::text, (t.t - realtime_lines.stime))) AS p 
--		FROM opennoms.realtime_lines, (SELECT (now() - '00:15:30'::interval) AS t) t 
--		WHERE ((public.period_cc(realtime_lines.stime, realtime_lines.etime) OPERATOR(public.&&) public.period_cc((t.t - '00:00:10'::interval), 
--			(t.t + '00:00:10'::interval))) AND 
--			(public.st_geometrytype(public.st_locate_along_measure(realtime_lines.the_geom, date_part('epoch'::text, (t.t - realtime_lines.stime)))) = 'ST_Point'::text))
--	) foo
--    ) bar 
--    WHERE ((bar.z > (59)::double precision) AND (bar.speed > (50)::double precision));

--ALTER TABLE opennoms.realtimepoint OWNER TO postgres;