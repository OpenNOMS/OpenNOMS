SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = off;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET escape_string_warning = off;

-- Function: opennoms.macad(text, text)

-- DROP FUNCTION opennoms.macad(text, text);

CREATE OR REPLACE FUNCTION opennoms.macad(text, text)
  RETURNS text AS
$BODY$select 
case 
when 
	$1 = ANY (ARRAY['MSP'::text, 'FCM'::text, 'STP'::text, '21D'::text, 'MIC'::text, 'ANE'::text, 'LVN'::text]) 
	AND
	$2 = ANY (ARRAY['MSP'::text, 'FCM'::text, 'STP'::text, '21D'::text, 'MIC'::text, 'ANE'::text, 'LVN'::text])
then 'B'
when 
	$1 = ANY (ARRAY['MSP'::text, 'FCM'::text, 'STP'::text, '21D'::text, 'MIC'::text, 'ANE'::text, 'LVN'::text]) 
then 'A'
when 
	$2 = ANY (ARRAY['MSP'::text, 'FCM'::text, 'STP'::text, '21D'::text, 'MIC'::text, 'ANE'::text, 'LVN'::text]) 
then 'D'
else
'0'
end
$BODY$
  LANGUAGE sql IMMUTABLE
  COST 100;
ALTER FUNCTION opennoms.macad(text, text) OWNER TO postgres;


-- Function: opennoms.macairport(text)

-- DROP FUNCTION opennoms.macairport(text);

CREATE OR REPLACE FUNCTION opennoms.macairport(text)
  RETURNS boolean AS
$BODY$
select coalesce($1,'') in ('MSP','STP','ANE','FCM','21D','LVN','MIC','KMSP','KSTP','KANE','KFCM','K21D','KLVN','KMIC');
$BODY$
  LANGUAGE sql VOLATILE
  COST 100;
ALTER FUNCTION opennoms.macairport(text) OWNER TO postgres;



-- Function: opennoms.events_delete_trigger()

-- DROP FUNCTION opennoms.events_delete_trigger();

CREATE OR REPLACE FUNCTION opennoms.events_delete_trigger()
  RETURNS trigger AS
$BODY$
    BEGIN
            INSERT INTO events_edits SELECT OLD.*;
		RETURN OLD;
    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION opennoms.events_delete_trigger() OWNER TO postgres;


-- Function: opennoms.insert_events_trigger()

-- DROP FUNCTION opennoms.insert_events_trigger();

CREATE OR REPLACE FUNCTION opennoms.insert_events_trigger()
  RETURNS trigger AS
$BODY$
	DECLARE
		sql text;
		m record;
		r opennoms.events;
	BEGIN	

		IF EXISTS (SELECT 1 from opennoms.events WHERE eventid=NEW.eventid)  THEN
			SELECT INTO r * FROM opennoms.events WHERE eventid=NEW.eventid;
			NEW.lastmodified := null;
			r.lastmodified:=null;
			IF ROW(r.*) IS DISTINCT FROM ROW(NEW.*) THEN
				DELETE FROM opennoms.events WHERE eventid=NEW.eventid;
			ELSE 
				RETURN null;
			END IF;
		END IF;
		NEW.lastmodified=now();

		RETURN NEW;
	END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION opennoms.insert_events_trigger() OWNER TO postgres;


-- Function: opennoms.update_events_trigger()

-- DROP FUNCTION opennoms.update_events_trigger();

CREATE OR REPLACE FUNCTION opennoms.update_events_trigger()
  RETURNS trigger AS
$BODY$
	DECLARE
	BEGIN
		IF ROW(NEW.*) IS DISTINCT FROM ROW(OLD.*) THEN	
			NEW.lastmodified=now();
			INSERT INTO events_edits SELECT OLD.*;
			RETURN NEW;
		END IF;
		RETURN null;
	END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION opennoms.update_events_trigger() OWNER TO postgres;


-- Function: opennoms.insert_noisematch_trigger()

-- DROP FUNCTION opennoms.insert_noisematch_trigger();

CREATE OR REPLACE FUNCTION opennoms.insert_noisematch_trigger()
  RETURNS trigger AS
$BODY$
	DECLARE
		sql text;
		m record;
		r opennoms.noisematch;
	BEGIN	

		IF EXISTS (SELECT 1 from opennoms.noisematch WHERE opnum=NEW.opnum and eventid=NEW.eventid)  THEN
			SELECT INTO r * FROM opennoms.noisematch WHERE opnum=NEW.opnum and eventid=NEW.eventid;
			IF ROW(r.*) IS DISTINCT FROM ROW(NEW.*) THEN
				DELETE FROM opennoms.noisematch WHERE opnum=NEW.opnum and eventid=NEW.eventid;
			ELSE 
				RETURN null;
			END IF;
		END IF;
		RETURN NEW;
	END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION opennoms.insert_noisematch_trigger() OWNER TO postgres;



-- Function: opennoms.update_noisematch_trigger()

-- DROP FUNCTION opennoms.update_noisematch_trigger();

CREATE OR REPLACE FUNCTION opennoms.update_noisematch_trigger()
  RETURNS trigger AS
$BODY$
	DECLARE
	BEGIN
		IF ROW(NEW.*) IS DISTINCT FROM ROW(OLD.*) THEN	
			NEW.lastmod=now();
			INSERT INTO noisematch_edits SELECT OLD.*;
			RETURN NEW;
		END IF;
		RETURN null;
	END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION opennoms.update_noisematch_trigger() OWNER TO postgres;



-- Function: opennoms.noisematch_delete_trigger()

-- DROP FUNCTION opennoms.noisematch_delete_trigger();

CREATE OR REPLACE FUNCTION opennoms.noisematch_delete_trigger()
  RETURNS trigger AS
$BODY$
    BEGIN
            INSERT INTO noisematch_edits SELECT OLD.*;
            RETURN OLD;
    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION opennoms.noisematch_delete_trigger() OWNER TO postgres;



-- Function: opennoms.operations_delete_trigger()

-- DROP FUNCTION opennoms.operations_delete_trigger();

CREATE OR REPLACE FUNCTION opennoms.operations_delete_trigger()
  RETURNS trigger AS
$BODY$
    BEGIN
            INSERT INTO operations_edits SELECT OLD.*;
            RETURN OLD;
    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION opennoms.operations_delete_trigger() OWNER TO postgres;



-- Function: opennoms.insert_operations_trigger()

-- DROP FUNCTION opennoms.insert_operations_trigger();

CREATE OR REPLACE FUNCTION opennoms.insert_operations_trigger()
  RETURNS trigger AS
$BODY$
	DECLARE 
		sql text;
		m record;
		r opennoms.operations;
	BEGIN	
--		IF NEW.stime > NEW.etime THEN 
--			RETURN null;
--		END IF;
--raise warning 'In Insert';
		IF NEW.trackinfo='G' THEN
			UPDATE noisematch SET valid=false WHERE opnum=NEW.opnum;
		END IF;
		IF EXISTS (SELECT 1 from opennoms.operations WHERE opnum=NEW.opnum)  THEN
--raise warning 'Opnum Exists';
			SELECT INTO r * FROM opennoms.operations WHERE opnum=NEW.opnum;
			NEW.lastmod := null;
			r.lastmod:=null;
			IF ROW(r.*) IS DISTINCT FROM ROW(NEW.*) OR NOT(r.the_geom ~ NEW.the_geom and st_equals(r.the_geom,NEW.the_geom)) THEN
--raise warning 'Not a duplicate';
				DELETE FROM opennoms.operations WHERE opnum=NEW.opnum;
			ELSE 
--raise warning 'Duplicate';
				RETURN null;
			END IF;
		END IF;
		NEW.lastmod=now();
		--PERFORM ad(NEW.arr_apt,NEW.dep_apt,NEW.arr_rwy,NEW.dep_rwy,NEW.stime,NEW.etime,NEW.opnum);

		RETURN NEW;
	END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION opennoms.insert_operations_trigger() OWNER TO postgres;



-- Function: opennoms.update_operations_trigger()

-- DROP FUNCTION opennoms.update_operations_trigger();

CREATE OR REPLACE FUNCTION opennoms.update_operations_trigger()
  RETURNS trigger AS
$BODY$
	DECLARE
	BEGIN
		IF ROW(NEW.*) IS DISTINCT FROM ROW(OLD.*) OR NOT(OLD.the_geom ~ NEW.the_geom and st_equals(OLD.the_geom,NEW.the_geom))THEN	
			NEW.lastmod=now();
			INSERT INTO operations_edits SELECT OLD.*;
			IF NEW.trackinfo='G' THEN
				UPDATE noisematch SET valid=false WHERE opnum=NEW.opnum;
			END IF;
			--PERFORM ad(NEW.arr_apt,NEW.dep_apt,NEW.arr_rwy,NEW.dep_rwy,NEW.stime,NEW.etime,NEW.opnum);
			RETURN NEW;
		END IF;
		RETURN null;
	END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION opennoms.update_operations_trigger() OWNER TO postgres;


-- Function: opennoms.grabflights_opennoms(text, text, text, text, text, text, text, text, text, text, text, text, text, text)

-- DROP FUNCTION opennoms.grabflights_opennoms(text, text, text, text, text, text, text, text, text, text, text, text, text, text);

CREATE OR REPLACE FUNCTION opennoms.grabflights_opennoms(isorange text, airport text DEFAULT ''::text, optypein text DEFAULT ''::text, adflagin text DEFAULT ''::text, runwayin text DEFAULT ''::text, nightmode text DEFAULT ''::text, timemode text DEFAULT ''::text, timesubset text DEFAULT ''::text, publicmode text DEFAULT ''::text, mactypein text DEFAULT ''::text, airlinein text DEFAULT ''::text, minalt text DEFAULT ''::text, maxalt text DEFAULT ''::text, extrasql text DEFAULT ''::text)
  RETURNS SETOF opennoms.operations_view AS
$BODY$declare
iso_arr text[];
iso text;
p period;
sd timestamp; --1
ed timestamp; --2
date bool;
statement text;
retval operations_view;
sdlimit timestamp;
edlimit timestamp;
optype text := optypein;
runway text :=runwayin;
adflag text :=adflagin;
mactype text :=mactypein;
airline text :=airlinein;
g text := 'targets';
gw text := '';
begin
statement:='';
set search_path to opennoms,alias,public;
set enable_seqscan to off;
for iso in select regexp_split_to_table(isorange,',') loop
raise notice 'iso: %',iso;
if (iso_to_period(iso) is null) then 
	raise warning 'bad iso date in input';
        return;
else 
	p:=iso_to_period(iso);
	sd:=first(p);
	ed:=last(p);
	if sd=ed then
		ed:=ed+'10 seconds';
	end if;
	raise notice 'timestamp';
end if;  
if (upper(publicmode)='TRUE' or upper(publicmode)='T') then
	select into sdlimit,edlimit sdate,edate from publicdates limit 1;
	sd:=greatest(least(sd,ed,edlimit),sdlimit);
	ed:=least(greatest(sd,ed,sdlimit),edlimit);
end if;
if (upper(timesubset)='TRUE' or upper(timesubset)='T') then
g := 'track_by_time_period(' || g || ',stime,etime,''' || sd || '''::timestamptz,''' || ed || '''::timestamptz) ';
gw := ' geometrytype( ' || g || ')=''LINESTRING'' and ';
end if;
if (minalt~E'^[0-9]+$' and maxalt~E'^[0-9]+$') then
gw := gw || '(st_zmin(' || g || ')<=' || maxalt || ' and st_zmax(' || g || ')>=' || minalt || ') and ';
g := ' geometryn(st_multi(st_locatebetweenelevations(' || g || ', ' || minalt || ', ' || maxalt || ')),1)';
end if;
g := g || ' as targets';
statement := statement || '
select opnum,stime,etime,runwaytime,actype,mactype,airport,adflag,runway,airline,beacon,flight_id,night,inmnight,opertype,stage,image,manufactured,takeoffnoise,description,otherport,';
statement := statement || g;
statement := statement || '
from operations_view where ';

statement := statement || ' period_cc(stime, etime) && ''[' || sd || ',' || ed || ']'' and ';
if (timemode = 'runwaytime') then
	statement := statement || ' runwaytime between ''' || sd || ''' and ''' || ed || ''' and ';
elsif (timemode = 'stime' or timemode = 'starttime') then
	statement := statement || ' stime between ''' || sd || ''' and ''' || ed || ''' and ';
elsif (timemode = 'etime' or timemode = 'endtime') then
	statement := statement || ' etime between ''' || sd || ''' and ''' || ed || ''' and ';
end if;	

statement := statement || parselist(airport,'airport','^[a-z]{3}(,[a-z]{3})*$') || ' and ';

if (airport='MSP') then
	statement := statement || ' runway in (''12L'',''12R'',''30L'',''30R'',''17'',''35'',''04'',''22'') and ';
end if;

statement := statement || parselist(optype,'opertype','^[a-z](,[a-z])*$') || ' and ';

statement := statement || parselist(adflag,'adflag','^[ado](,[ado])*$') || ' and ';

statement := statement || parselist(runway,'runway','^([0-9][0-9]?[A-Z]?)(,[0-9][0-9]?[A-Z]?)*$') || ' and ';


if (upper(nightmode)='TRUE' or upper(nightmode)='T') or upper(nightmode)='NIGHT' then
	raise notice 'filtered by night flights';
	statement := statement || ' 
	night=true and ';
elsif (upper(nightmode)='FALSE' or upper(nightmode)='F') then
	raise notice 'filtered by night flights (day only)';
	statement := statement || ' 
	(night=false or night is null) and ';
elsif (upper(nightmode)='INMNIGHT' or upper(nightmode)='INM') then
	raise notice 'filtered by inm night flights';
	statement := statement || ' 
	(inmnight=true) and '; 
elsif (upper(nightmode)='INMDAY') then
	raise notice 'filtered by inm night flights';
	statement := statement || ' 
	(inmnight=false or inmnight is null) and '; 
end if;

statement := statement || parselist(mactype,'mactype','^[a-z0-9]+(,[a-z0-9])*$') || ' and ';
statement := statement || parselist(airline,'airline','^[a-z]{3}(,[a-z]{3})*$') || ' and ';


statement := statement || gw;
statement := statement || extrasql;
statement := trim(trailing 'and ' from statement);
statement := statement || ' union all ';
raise notice '2statement: %',statement;
end loop;
statement := trim(trailing 'union all ' from statement);
statement := regexp_replace(statement,E'(and[ ]+)+',' and ','gi');
raise notice '3statement: %',statement;
--for retval in execute statement loop
--	return query select (retval).* ;
--end loop; 
return query execute statement;
--return;
end;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION opennoms.grabflights_opennoms(text, text, text, text, text, text, text, text, text, text, text, text, text, text) OWNER TO postgres;


-- Function: opennoms.parselist(text, text, text)

-- DROP FUNCTION opennoms.parselist(text, text, text);

CREATE OR REPLACE FUNCTION opennoms.parselist(text, text, text)
  RETURNS text AS
$BODY$
declare
out text;
negtest text;
postest text;
col text;
none boolean;
begin
out := upper($1);
col := upper($2);
negtest := '!' || $3;
postest := $3;
if (out ~* 'NONE') then
	out := replace(out,'NONE','');
	col := ' coalesce(' || $2 || ','''') ';
	none := true;
else 
	col := ' ' || $2 || ' ';
end if;

if (out ~* E'^!') then
	out := replace(out,'!','');
	col := col || ' not ';
end if;
if (out ~* postest or none) then 
	out := replace(out,',',''',''');
	out := ' in (''' || out || ''') ';
else 
	return '';
end if;
out := col || out;

return out;
end;
$BODY$
  LANGUAGE plpgsql IMMUTABLE
  COST 100;
ALTER FUNCTION opennoms.parselist(text, text, text) OWNER TO postgres;



-- Function: opennoms.regex_replace(text, text, text)

-- DROP FUNCTION opennoms.regex_replace(text, text, text);

CREATE OR REPLACE FUNCTION opennoms.regex_replace(text, text, text)
  RETURNS text AS
$BODY$$return = $_[0];
$regex=$_[1];
$to=$_[2];
$return =~ s/$regex/$to/i;
return $return;$BODY$
  LANGUAGE plperl VOLATILE
  COST 100;
ALTER FUNCTION opennoms.regex_replace(text, text, text) OWNER TO postgres;


-- Function: opennoms.grabflights_opennoms2(text, text, text, text, text, text, text, text, text, text, text, text)

-- DROP FUNCTION opennoms.grabflights_opennoms2(text, text, text, text, text, text, text, text, text, text, text, text);

CREATE OR REPLACE FUNCTION opennoms.grabflights_opennoms2(isorange text, airport text DEFAULT ''::text, adflagin text DEFAULT ''::text, runwayin text DEFAULT ''::text, timemode text DEFAULT ''::text, timesubset text DEFAULT ''::text, publicmode text DEFAULT ''::text, mactypein text DEFAULT ''::text, airlinein text DEFAULT ''::text, minalt text DEFAULT ''::text, maxalt text DEFAULT ''::text, extrasql text DEFAULT ''::text)
  RETURNS SETOF opennoms.operations_view AS
$BODY$declare
iso_arr text[];
iso text;
--p period;
sd timestamp; --1
ed timestamp; --2
date bool;
statement text;
retval opennoms.operations_view;
sdlimit timestamp;
edlimit timestamp;
--optype text := optypein;
runway text :=runwayin;
adflag text :=adflagin;
mactype text :=mactypein;
airline text :=airlinein;
g text := 'targets';
gw text := '';
begin
statement:='';
set search_path to opennoms,alias,public;
set enable_seqscan to off;
for iso in select regexp_split_to_table(isorange,',') loop
raise notice 'iso: %',iso;
if (isorange is null) then 
	raise warning 'bad iso date in input';
        return;
else 
	--p:=iso_to_period(iso);
	sd:= split_part(isorange,'/', 1);
	ed:=split_part(isorange,'/', 2);
	if sd=ed then
		ed:=ed+'10 seconds';
	end if;
	raise notice 'timestamp';
end if;  
if (upper(publicmode)='TRUE' or upper(publicmode)='T') then
	select into sdlimit,edlimit sdate,edate from publicdates limit 1;
	sd:=greatest(least(sd,ed,edlimit),sdlimit);
	ed:=least(greatest(sd,ed,sdlimit),edlimit);
end if;
if (upper(timesubset)='TRUE' or upper(timesubset)='T') then
g := 'track_by_time_period(' || g || ',stime,etime,''' || sd || '''::timestamptz,''' || ed || '''::timestamptz) ';
gw := ' geometrytype( ' || g || ')=''LINESTRING'' and ';
end if;
if (minalt~E'^[0-9]+$' and maxalt~E'^[0-9]+$') then
gw := gw || '(st_zmin(' || g || ')<=' || maxalt || ' and st_zmax(' || g || ')>=' || minalt || ') and ';
g := ' geometryn(st_multi(st_locatebetweenelevations(' || g || ', ' || minalt || ', ' || maxalt || ')),1)';
end if;
g := g || ' as targets';
statement := statement || '
select opnum,stime,etime,mactype,airport,adflag,runway,airline,flight_id,description,otherport,';
statement := statement || g;
statement := statement || '
from operations_view where ';

--statement := statement || ' period_cc(stime, etime) && ''[' || sd || ',' || ed || ']'' and ';

statement := statement || '''' || sd || ''' < stime AND ''' || ed || ''' > etime AND ';

if (timemode = 'stime' or timemode = 'starttime') then
	statement := statement || ' stime between ''' || sd || ''' and ''' || ed || ''' and ';
elsif (timemode = 'etime' or timemode = 'endtime') then
	statement := statement || ' etime between ''' || sd || ''' and ''' || ed || ''' and ';
end if;	

statement := statement || parselist(airport,'airport','^[a-z]{3}(,[a-z]{3})*$') || ' and ';

if (airport='MSP') then
	statement := statement || ' runway in (''12L'',''12R'',''30L'',''30R'',''17'',''35'',''04'',''22'') and ';
end if;


statement := statement || parselist(adflag,'adflag','^[ado](,[ado])*$') || ' and ';

statement := statement || parselist(runway,'runway','^([0-9][0-9]?[A-Z]?)(,[0-9][0-9]?[A-Z]?)*$') || ' and ';

statement := statement || parselist(mactype,'mactype','^[a-z0-9]+(,[a-z0-9])*$') || ' and ';

statement := statement || parselist(airline,'airline','^[a-z]{3}(,[a-z]{3})*$') || ' and ';


statement := statement || gw;
statement := statement || extrasql;
statement := trim(trailing 'and ' from statement);
statement := statement || ' union all ';
raise notice '2statement: %',statement;
end loop;
statement := trim(trailing 'union all ' from statement);
statement := regexp_replace(statement,E'(and[ ]+)+',' and ','gi');
raise notice '3statement: %',statement;
--for retval in execute statement loop
--	return query select (retval).* ;
--end loop; 
return query execute statement;
--return;
end;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION opennoms.grabflights_opennoms2(text, text, text, text, text, text, text, text, text, text, text, text) OWNER TO postgres;


-- Function: opennoms.everynseconds(geometry, integer)

-- DROP FUNCTION opennoms.everynseconds(geometry, integer);

CREATE OR REPLACE FUNCTION opennoms.everynseconds(geometry, integer)
  RETURNS geometry AS
'select st_makeline(st_locate_along_measure($1,g)) from generate_series(0,floor(st_m(st_endpoint($1)))::int,$2) g;'
  LANGUAGE sql VOLATILE
  COST 100;
ALTER FUNCTION opennoms.everynseconds(geometry, integer) OWNER TO postgres;



-- Function: opennoms.mac_dumppoints_web(geometry, timestamp with time zone, integer)

-- DROP FUNCTION opennoms.mac_dumppoints_web(geometry, timestamp with time zone, integer);

CREATE OR REPLACE FUNCTION opennoms.mac_dumppoints_web(IN geometry, IN timestamp with time zone, IN step integer, OUT path integer, OUT x integer, OUT y integer, OUT z integer, OUT "time" timestamp with time zone, OUT heading integer, OUT speed integer)
  RETURNS SETOF record AS
$BODY$
	select * from (select 
		path[1],
		round(st_x(geom))::int,
		round(st_y(geom))::int,
		round(st_z(geom)*3.2808399)::int as z,
		(st_m(geom)::text || ' seconds')::interval + $2 as "time",
		round(mac_heading(lag(geom,2) over (),lag(geom,1) over (),geom,lead(geom,1) over (),lead(geom,2) over ())/10.0)::int * 10 as heading,
		round(mac_speed(lag(geom,3) over (),lag(geom,2) over (),lag(geom,1) over (),geom,lead(geom,1) over (),lead(geom,2) over (),lead(geom,3) over ())*2.236936)::int as speed
	from st_dumppoints(everynseconds($1,$3)) 
	--where 
	--extract(epoch from ((st_m(geom))::text || ' seconds')::interval + $2)::int % $3 = 0 
	) as foo where z>59 and speed >50
 $BODY$
  LANGUAGE sql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION opennoms.mac_dumppoints_web(geometry, timestamp with time zone, integer) OWNER TO postgres;


-- Function: opennoms.mac_heading(geometry, geometry, geometry, geometry, geometry)

-- DROP FUNCTION opennoms.mac_heading(geometry, geometry, geometry, geometry, geometry);

CREATE OR REPLACE FUNCTION opennoms.mac_heading(IN geometry, IN geometry, IN geometry DEFAULT NULL::geometry, IN geometry DEFAULT NULL::geometry, IN geometry DEFAULT NULL::geometry, OUT double precision)
  RETURNS double precision AS
$BODY$
SELECT case 
	when degrees(atan2(sum(sin(x)),sum(cos(x)))) > 0 then degrees(atan2(sum(sin(x)),sum(cos(x))))
	else degrees(atan2(sum(sin(x)),sum(cos(x)))) + 360
	end
FROM (
	SELECT st_azimuth($1,$2) as x
	UNION ALL
	SELECT st_azimuth($2,$3) as x
	UNION ALL
	SELECT st_azimuth($3,$4) as x
	UNION ALL
	SELECT st_azimuth($4,$5) as x
) as foo;
$BODY$
  LANGUAGE sql VOLATILE
  COST 100;
ALTER FUNCTION opennoms.mac_heading(geometry, geometry, geometry, geometry, geometry) OWNER TO postgres;


-- Function: opennoms.mac_speed(geometry, geometry, geometry, geometry, geometry, geometry, geometry)

-- DROP FUNCTION opennoms.mac_speed(geometry, geometry, geometry, geometry, geometry, geometry, geometry);

CREATE OR REPLACE FUNCTION opennoms.mac_speed(IN geometry, IN geometry, IN geometry DEFAULT NULL::geometry, IN geometry DEFAULT NULL::geometry, IN geometry DEFAULT NULL::geometry, IN geometry DEFAULT NULL::geometry, IN geometry DEFAULT NULL::geometry, OUT double precision)
  RETURNS double precision AS
$BODY$
SELECT avg(x)
FROM (
	SELECT st_distance($1,$2)/(st_m($2)-st_m($1)) as x
	UNION ALL
	SELECT st_distance($2,$3)/(st_m($3)-st_m($2)) as x
	UNION ALL
	SELECT st_distance($3,$4)/(st_m($4)-st_m($3)) as x
	UNION ALL
	SELECT st_distance($4,$5)/(st_m($5)-st_m($4)) as x
	UNION ALL
	SELECT st_distance($5,$6)/(st_m($6)-st_m($5)) as x
	UNION ALL
	SELECT st_distance($6,$7)/(st_m($7)-st_m($6)) as x
) as foo;
$BODY$
  LANGUAGE sql VOLATILE
  COST 100;
ALTER FUNCTION opennoms.mac_speed(geometry, geometry, geometry, geometry, geometry, geometry, geometry) OWNER TO postgres;



-- Function: opennoms.mac_dumppoints_web(geometry, timestamp with time zone, integer)

-- DROP FUNCTION opennoms.mac_dumppoints_web2(geometry, timestamp with time zone, integer);

CREATE OR REPLACE FUNCTION opennoms.mac_dumppoints_web2(IN geometry, IN timestamp with time zone, IN step integer)
  RETURNS SETOF text AS
$BODY$

	SELECT '{p:' || path || ',x:' || x || ',y:' || y || ',z:' || z || ',t:''' || "time" || ''',h:' || heading || ',s:' || speed || '}' 
	FROM (
		SELECT 
			path[1] as path,
			round(st_x(geom))::int as x,
			round(st_y(geom))::int as y,
			round(st_z(geom)*3.2808399)::int as z,
			(st_m(geom)::text || ' seconds')::interval + $2 || '00' as "time",
			round(opennoms.mac_heading(lag(geom,2) over (),lag(geom,1) over (),geom,lead(geom,1) over (),lead(geom,2) over ())/10.0)::int * 10 as heading,
			round(opennoms.mac_speed(lag(geom,3) over (),lag(geom,2) over (),lag(geom,1) over (),geom,lead(geom,1) over (),lead(geom,2) over (),lead(geom,3) over ())*2.236936)::int as speed
		FROM st_dumppoints(opennoms.everynseconds($1,$3)) 
	) AS foo 
	WHERE z>59 and speed >50

 $BODY$
  LANGUAGE sql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION opennoms.mac_dumppoints_web2(geometry, timestamp with time zone, integer) OWNER TO postgres;


CREATE OR REPLACE FUNCTION track_by_time_period(geometry, timestamp with time zone, timestamp with time zone, timestamp with time zone, timestamp with time zone)
  RETURNS geometry AS
$BODY$
	SELECT
	CASE WHEN
	period_cc($2,$3) <@ period_cc($4,$5) THEN $1
	WHEN
	period_cc($2,$3) @> period_cc($4,$5) THEN st_locate_between_measures($1,extract(epoch from period_offset(period_cc($2,$3),$4)),extract(epoch from period_offset(period_cc($2,$3),$5)))
	WHEN
	period_cc($2,$3) &> period_cc($4,$5) THEN st_locate_between_measures($1,0,extract(epoch from ($5-$2)))
	WHEN
	period_cc($2,$3) &< period_cc($4,$5) THEN st_locate_between_measures($1,extract(epoch from ($4-$2)),999999999999999999999)
	ELSE
	null

end;$BODY$
  LANGUAGE sql IMMUTABLE
  COST 100;
 
 

--Using start time end time (not thoroughly tested, hopefully I didn’t get anything backwards):
-- Function: opennoms.track_by_time(geometry, timestamp with time zone, timestamp with time zone, timestamp with time zone, timestamp with time zone, boolean)

-- DROP FUNCTION opennoms.track_by_time(geometry, timestamp with time zone, timestamp with time zone, timestamp with time zone, timestamp with time zone, boolean);

CREATE OR REPLACE FUNCTION opennoms.track_by_time(geom geometry, trackstime timestamp with time zone, tracketime timestamp with time zone, periodstime timestamp with time zone, periodetime timestamp with time zone, subset boolean)
  RETURNS geometry AS
$BODY$

    SELECT
    CASE
    -- Subset is set to false or track entirely within period
    WHEN $6=false OR ($2 >= $4 AND $3 <= $5)
	    THEN $1
    -- Track starts before period and ends after period
    WHEN $2 < $4 AND $3 > $5
	    THEN st_locate_between_measures(
			    $1,
			    extract(epoch from $4-$2),
			    extract(epoch from $5-$2)
	    )
    --track starts during period and ends after period
    WHEN $2 >= $4 AND $2 <= $5 AND $3 > $5
	    THEN st_locate_between_measures(
			    $1,
			    0,
			    extract(epoch from $5-$2)
	    )
    --track starts before period and ends during period
    WHEN $2 < $4 AND $3 >= $4 AND $3 <= $5
	    THEN st_locate_between_measures(
			    $1,
			    extract(epoch from $4-$2),
			    9999999999999999999999
	    )
    ELSE NULL
END;

$BODY$
  LANGUAGE sql VOLATILE
  COST 100;
ALTER FUNCTION opennoms.track_by_time(geometry, timestamp with time zone, timestamp with time zone, timestamp with time zone, timestamp with time zone, boolean) OWNER TO postgres;
