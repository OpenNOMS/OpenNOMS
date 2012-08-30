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

Ext.define('OpenNoms.controller.State', {
    extend: 'Ext.util.Observable',
    alias: 'controller.opennoms-controller-state',
    state: 'static',

    constructor: function (config) {
        this.addEvents({
            "beforestatechange": true,
            "afterstatechange": true
        });

        // Call our superclass constructor to complete construction process.
        this.callParent(arguments)
    },

    loadingData: function (isLoading) {
        if (isLoading) {
            Ext.getCmp('gobutton').setIconCls('loading');
        } else {
            Ext.getCmp('gobutton').setIconCls('refresh');
        }
    },

    changeState: function (state) {
        if (this.fireEvent('beforestatechange')) {
            Ext.getCmp('flighttrackstartdatepicker').hide();
            Ext.getCmp('flighttrackstarttimepicker').hide();
            Ext.getCmp('staticlengthcombo').hide();
            Ext.getCmp('truncate-flight-tracks-checkbox').hide();
            Ext.getCmp('realtimemessage').hide();
            Ext.getCmp('tabtrackanimator').stop();
            Ext.getCmp('tabtrackanimator').hide();
            Ext.getCmp('gobutton').hide();
            Ext.getCmp('display-type-combo').hide();
            Ext.getCmp('map-panel').staticflightlayer.setVisibility(false);

            switch (state) {
                case 'static':
                    Ext.getCmp('flight-track-type-menu').setText('<span style="font-weight:bold;">Static Flight Tracks</span>');
                    Ext.getCmp('flighttrackstartdatepicker').show();
                    Ext.getCmp('flighttrackstarttimepicker').show();
                    Ext.getCmp('staticlengthcombo').show();
                    Ext.getCmp('truncate-flight-tracks-checkbox').show();
                    Ext.getCmp('gobutton').show();
                    Ext.getCmp('map-panel').clickControl.activate();
                    Ext.getCmp('map-panel').staticflightlayer.setVisibility(true);
                    Ext.getCmp('map-panel').animatedFlightTracks.removeAllFeatures();
                    Ext.getCmp('flight-legend-display-region').layout.setActiveItem(0);
                    this.state = 'static';
                    break;
                case 'realtime':
                    Ext.getCmp('flight-track-type-menu').setText('<span style="font-weight:bold;">Real Time Flight Track Replay</span>');
                    Ext.getCmp('realtimemessage').show();
                    Ext.getCmp('display-type-combo').show();
                    Ext.getCmp('map-panel').clickControl.deactivate();
                    Ext.getCmp('app-panel').noiseButton.query('button')[0].toggle(false);
                    Ext.getCmp('noise-event-viewer').store.removeAll();
                    Ext.getCmp('map-panel').noiseEventLayer.removeAllFeatures();
                    Ext.getCmp('map-panel').selectedFlightTrackLayer.removeAllFeatures();
                    Ext.getCmp('map-panel').animatedFlightTracks.removeAllFeatures();
                    Ext.getCmp('flight-legend-display-region').layout.setActiveItem(1);
                    //Ext.getCmp('tabtrackanimator').show();
                    Ext.getCmp('queryController').getRealtimeFlightData();
                    this.state = 'realtime';
                    break;
                case 'animated':
                    Ext.getCmp('flight-track-type-menu').setText('<span style="font-weight:bold;">Animated Flight Track Replay</span>');
                    Ext.getCmp('flighttrackstartdatepicker').show();
                    Ext.getCmp('flighttrackstarttimepicker').show();
                    Ext.getCmp('tabtrackanimator').show();
                    Ext.getCmp('gobutton').show();
                    Ext.getCmp('display-type-combo').show();
                    Ext.getCmp('map-panel').clickControl.deactivate();
                    Ext.getCmp('app-panel').noiseButton.query('button')[0].toggle(false);
                    Ext.getCmp('noise-event-viewer').store.removeAll();
                    Ext.getCmp('map-panel').noiseEventLayer.removeAllFeatures();
                    Ext.getCmp('map-panel').selectedFlightTrackLayer.removeAllFeatures();
                    Ext.getCmp('queryController').getAnimatedFlightData();
                    Ext.getCmp('flight-legend-display-region').layout.setActiveItem(1);
                    this.state = 'animated';
                    break;
            }
        }
        this.fireEvent('afterstatechange');
    }

});