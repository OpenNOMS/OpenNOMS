/*
OpenNOMS (Noise and Operations Management System)
    Copyright (C) 2012  Farallon Geographics, Inc

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
	
Contact: info@fargeo.com
*/

Ext.define('OpenNoms.controller.Query', {
    extend: 'Ext.util.Observable',
    alias: 'controller.opennoms-controller-query',

    constructor: function (config) {
        this.addEvents({
            "queryupdated": true
        });

        this.joinString = '\\,';

        // Call our superclass constructor to complete construction process.
        this.callParent(arguments)
    },


    updateLayerWithNewParams: function (layer) {
        // here we'd get the time values for example and update the static flight track
        // for now lets just do this until we understand the time picker better
        //layer.setUrl(OpenNoms.config.URLs.wms + '?viewparams=' + this.getAllParams());
        layer.mergeNewParams({ viewparams: this.getAllParams() });
    },

    getAnimatedFlightData: function () {
        var trackAnimator = Ext.getCmp('tabtrackanimator');
        trackAnimator.playContinuously = false;
        
        var params = this.getFlightParams();
        params.isorange = this.getIsoRange(900000);
        params.step = 2;
        params.timesubset = 't';

        trackAnimator.extraParams.viewparams = this.formatParamsForGeoserver(params);
        trackAnimator.startTime = this.getStartDateTime();
        trackAnimator.endTime = this.getEndDateTime(900000);
        trackAnimator.store.load();
    },

    getRealtimeFlightData: function () {
        var trackAnimator = Ext.getCmp('tabtrackanimator');
        trackAnimator.startTime = 1312563600000; // 8/5/2011 10am
        trackAnimator.endTime = 1312563660000;
        Ext.getCmp('flighttrackstartdatepicker').setValue('8/5/2011');
        Ext.getCmp('flighttrackstarttimepicker').setValue(10);

        trackAnimator.playContinuously = true;
        trackAnimator.speed = 1;

        var params = {};
        params.step = 1;
        params.timesubset = 't';
        params.isorange = this.getIsoRange(60000);
        trackAnimator.extraParams.viewparams = this.formatParamsForGeoserver(params);
        trackAnimator.params = params;
        trackAnimator.formatParamsForGeoserver = this.formatParamsForGeoserver;
        trackAnimator.store.load();
    },

    getFlightParams: function () {
        var flights = Ext.getCmp('select-flights');
        var params = {};
        var airlines, runways, adflags;
        var arr = [];

        // get the selected airlines 
        var airlines = flights.store.queryBy(function (rec, id) { return rec.get('group') == 'Airline' ? true : false; });
        Ext.each(airlines.items, function (item, index, allItems) {
            if (item.data.ischecked) {
                arr.push(item.data.value);
            }
        }, this);

        params.airline = arr.join(this.joinString);
        arr = [];

        // get the selected adflags 
        var adflags = flights.store.queryBy(function (rec, id) { return rec.get('group') == 'Flight Type' ? true : false; });
        Ext.each(adflags.items, function (item, index, allItems) {
            if (item.data.ischecked) {
                arr.push(item.data.value);
            }
        }, this);

        params.adflag = arr.join(this.joinString);
        arr = [];

        // get the selected runways 
        var runways = flights.store.queryBy(function (rec, id) { return rec.get('group').substr(0, 7) == 'Airport' ? true : false; });
        Ext.each(runways.items, function (item, index, allItems) {
            if (item.data.ischecked) {
                arr.push(item.data.value);
            }
        }, this);

        params.runway = arr.join(this.joinString);
        arr = [];

        return params;
    },

    getIsoRange: function (timelimit) {
        var startDate = this.getStartDateTime();
        var endDate = this.getEndDateTime(timelimit);
        return Ext.Date.format(startDate, 'Y-m-d H\\\\:i\\\\:s') + '/' + Ext.Date.format(endDate, 'Y-m-d H\\\\:i\\\\:s');
    },

    getStartDateTime: function () {
        var startDate = Ext.getCmp('flighttrackstartdatepicker').getValue();
        var startTime = Ext.getCmp('flighttrackstarttimepicker').getValue();
        startDate.setHours(startTime.getHours(), startTime.getMinutes(), startTime.getSeconds(), startTime.getMilliseconds());
        return startDate;
    },

    getEndDateTime: function (timelimit) {
        var endDate = new Date();
        var startDate = this.getStartDateTime();
        if (timelimit) {
            endDate.setTime(startDate.getTime() + timelimit);
        } else {
            endDate.setTime(startDate.getTime() + Ext.getCmp('staticlengthcombo').getValue());
        }
        return endDate;
    },

    getAllParams: function (timelimit) {
        var params = this.getFlightParams();
        params.isorange = this.getIsoRange(timelimit);
        params.step = 2;
        if (Ext.getCmp('truncate-flight-tracks-checkbox').getValue()) {
            params.timesubset = 't';
        } else {
            params.timesubset = 'f';
        }

        return this.formatParamsForGeoserver(params);
    },

    formatParamsForGeoserver: function (params) {
        var ret = "";
        for (var propertyName in params) {
            ret += propertyName + ':' + params[propertyName] + ';';
        }

        return ret;
    }

});