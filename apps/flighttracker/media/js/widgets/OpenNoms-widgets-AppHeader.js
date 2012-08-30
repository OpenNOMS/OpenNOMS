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

Ext.define('OpenNoms.widgets.AppHeader', {
    extend: 'Ext.container.Container',
    alias: 'widgets.opennoms-widgets-appheader',

    id: 'app-header',
    height: 102,
    region: 'north',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    border: false,


    initComponent: function () {
        this.addEvents({
            'measureclicked': true,
            'changestate': true,
            'setdatetimerange': true,
            'emailclicked': true
        });

        var yesterday = new Date();
        yesterday.setDate(new Date().getDate() - 1);

        var defaultDate = new Date();
        defaultDate.setTime(OpenNoms.config.AppConfig.date);

        this.items = [{
            xtype: 'panel',
            layout: 'hbox',
            bodyCls: 'header-area',
            border: false,
            bodyStyle: 'padding: 2px 3px 8px 8px;',
            height: 34,
            items: [{
                xtype: 'container',
                layout: 'fit',
                style: 'padding-left:71px;',
                html: '<div style="font-size:18px;font-weight:bold;padding-top:3px;">MAC Flight Tracker</div>',
                flex: 1
            }, {
                xtype: 'container',
                layout: 'fit',
                html: '<a href="#" style="color: white;" id="feedback-link">Feedback</a><a style="padding-left: 10px; color: white;" href="#" id="help-link">Help</a>',
                width: 100,
                style: 'padding-right:10px;padding-top: 5px;'
            }],
        }, {
            xtype: 'container',
            layout: 'hbox',
            height: 38,
            items: [{
                xtype: 'combo',
                triggerCls: 'x-form-search-trigger',
                id: 'find-address-combo',
                name: 'addresssearch',
                emptyText: 'Find an Address',
                listConfig: {
                    loadingText: 'Searching...',

                    // Custom rendering template for each item
                    getInnerTpl: function () {
                        return '<div class="search-item">' +
                                    '{fulladdwcity}' +
                                '</div>';
                    }
                },
                width: 425,
                style: 'padding-left: 76px; padding-top: 8px;',
                minChars: 5,
                //tpl: '<tpl for="."><div class="x-combo-list-item"><h3>{fulladdwcity}<br></h3></div></tpl>',
                hideTrigger: false,
                forceSelection: true,
                displayField: 'fulladdwcity',
                queryParam: 'query',
                store: Ext.create('Ext.data.Store', {
                    fields: ['fulladdress', 'fulladdwcity', 'city', 'zip', 'lon', 'lat', 'x', 'y'],
                    proxy: {
                        type: 'ajax',
                        url: OpenNoms.config.URLs.geocodeSearch,
                        extraParams: {
                            maxRows: '20'
                        },
                        reader: {
                            type: 'json',
                            root: 'items'
                        }
                    }
                })
            }, {
                xtype: 'container',
                flex: 1
            }, {
                xtype: 'container',
                layout: 'hbox',
                width: 140,
                style: 'padding-top: 2px;',
                items: [{
                    xtype: 'button',
                    iconCls: 'icon-center printer',
                    tooltip: 'Print',
                    iconAlign: 'top',
                    text: '',
                    handler: function () {
                        Ext.Msg.alert('Under Construction', 'This feature is coming soon!');
                    },
                    scope: this,
                    scale: 'medium'
                }, {
                    xtype: 'container',
                    width: 10
                }, {
                    xtype: 'button',
                    iconCls: 'icon-center link',
                    tooltip: 'Email Link',
                    iconAlign: 'top',
                    text: '',
                    handler: function () {
                        this.fireEvent('emailclicked');
                    },
                    scope: this,
                    scale: 'medium'
                }, {
                    xtype: 'container',
                    width: 10
                },{
                    xtype: 'splitbutton',
                    id: 'measure-button',
                    tooltip: 'Measure Tool',
                    iconCls: 'icon-center ruler',
                    iconAlign: 'top',
                    text: '',
                    enableToggle: true,
                    toggleHandler: function (btn, state) {
                        var mode = 'distance';
                        if (Ext.getCmp('measure-button').iconCls == 'icon-center rulersquare') {
                            mode = 'area';
                        }
                        this.fireEvent('measureclicked', mode, state);
                    },
                    scope: this,
                    menu: [{
                        text: 'Distance',
                        iconCls: 'ruler',
                        handler: function () {
                            Ext.getCmp('measure-button').setIconCls('icon-center ruler');
                            Ext.getCmp('measure-button').toggle(true);
                        },
                        scope: this
                    },{
                        text: 'Area',
                        iconCls: 'rulersquare',
                        handler: function () {
                            Ext.getCmp('measure-button').setIconCls('icon-center rulersquare');
                            Ext.getCmp('measure-button').toggle(true);
                        },
                        scope: this
                    }],
                    arrowAlign: 'right',
                    scope: this,
                    scale: 'medium'
                }]
            }]
        }, {
            xtype: 'toolbar',
            height: 30,
            items: [{
                xtype: 'button',
                id: 'flight-track-type-menu',
                tooltip: 'Select flight track display type',
                style: 'font-weight: bold;',
                text: '<span style="font-weight:bold;">Static Flight Tracks</span>',
                width: 200,
                menu: {
                    width: 200,
                    defaults: {
                        width: 194
                    },
                    items: [{
                        text: 'Static Flight Tracks',
                        iconCls: 'lineblue',
                        handler: function () {
                            this.fireEvent('changestate', 'static');
                        },
                        scope: this
                    }, {
                        text: 'Animated Flight Track Replay',
                        iconCls: 'coggo',
                        handler: function () {
                            this.fireEvent('changestate', 'animated');
                        },
                        scope: this
                    }, {
                        text: 'Real Time Flight Track Replay',
                        iconCls: 'clockgo',
                        handler: function () {
                            this.fireEvent('changestate', 'realtime');
                        },
                        scope: this
                    }]
                }
            },'-',{
                xtype: 'datefield',
                id: 'flighttrackstartdatepicker',
                fieldLabel: 'Start Date',
                labelWidth: 60,
                labelAlign: 'right',
                width: 170,
                name: 'staticstartdate',
                maxValue: yesterday,
                value: defaultDate
            },{
                xtype: 'timefield',
                id: 'flighttrackstarttimepicker',
                name: 'staticstarttime',
                fieldLabel: 'Start Time',
                labelWidth: 60,
                labelAlign: 'right',
                width: 160,
                minValue: '12:00 AM',
                maxValue: '11:55 PM',
                value: OpenNoms.config.AppConfig.time,
                increment: 5
            },{
                xtype: 'combo',
                id: 'staticlengthcombo',
                name: 'staticlength',
                value: OpenNoms.config.AppConfig.length,
                forceSelection:true,
                labelWidth: 45,
                labelAlign: 'right',
                width: 150,
                fieldLabel: 'Length',
                store: Ext.create('Ext.data.Store', {
                    fields: ['length', 'text'],
                    data: [
                        { "length": 60000, "text": "1 Minute" },
                        { "length": 300000, "text": "5 Minutes" },
                        { "length": 600000, "text": "10 Minutes" },
                        { "length": 1200000, "text": "20 Minutes" },
                        { "length": 1800000, "text": "30 Minutes" },
                        { "length": 2700000, "text": "45 Minutes" },
                        { "length": 3600000, "text": "1 Hour" },
                        { "length": 5400000, "text": "1.5 Hours" },
                        { "length": 7200000, "text": "2 Hours" },
                        { "length": 9000000, "text": "2.5 Hours" },
                        { "length": 10800000, "text": "3 Hours" },
                        { "length": 12600000, "text": "3.5 Hours" },
                        { "length": 14400000, "text": "4 Hours" },
                        { "length": 18000000, "text": "5 Hours" },
                        { "length": 28800000, "text": "8 Hours" },
                        { "length": 43200000, "text": "12 Hours" },
                        { "length": 64800000, "text": "18 Hours" },
                        { "length": 86400000, "text": "24 Hours" }
                    ]
                }),
                queryMode: 'local',
                displayField: 'text',
                valueField: 'length'
            },{
                xtype: 'checkboxfield',
                id: 'truncate-flight-tracks-checkbox',
                name: 'truncateflighttracks',
                checked: OpenNoms.config.AppConfig.truncate,
                labelWidth: 160,
                labelAlign: 'right',
                width: 185,
                fieldLabel: 'Truncate Flight Tracks by Time?'
            },{
                xtype: 'container',
                id: 'realtimemessage',
                html: '(Flight display is delayed by 16 minutes.)',
                style: 'padding-left: 5px;',
                hidden: true
            },{
                xtype: 'combo',
                id: 'display-type-combo',
                name: 'displaytype',
                value: OpenNoms.config.AppConfig.display,
                forceSelection:true,
                labelWidth: 45,
                labelAlign: 'right',
                width: 200,
                fieldLabel: 'Display',
                store: Ext.create('Ext.data.Store', {
                    fields: ['value', 'text'],
                    data: [
	                    { "value": 'flight_id', "text": 'Flight ID' },
	                    { "value": 'airline', "text": 'Airline' },
	                    { "value": 'altitude', "text": 'Altitude (Ft above MSP)' },
	                    { "value": 'heading', "text": 'Heading (Degrees)' },
	                    { "value": 'mactype', "text": 'Aircraft Type' },
	                    { "value": 'speed', "text": 'Speed (MPH)' }
                    ]
                }),
                queryMode: 'local',
                displayField: 'text',
                valueField: 'value',
                hidden: true
            },{
                xtype: 'button',
                id: 'gobutton',
                text: 'Refresh Tracks',
                tooltip: 'Refresh flight tracks',
                iconCls: 'icon-center refresh',
                scope: this,
                handler: function () {
                    this.fireEvent('setdatetimerange');
                },
                scale: 'small'
            },'-',{
                xtype: 'multislider',
                id: 'staticslider',
                flex: 1,
                minValue: 0,
                hideLabel: false,
                useTips: false,
                maxValue: 1440,
                values: [0,10],
                increment: 5,
                style: 'margin-left: 15px;margin-right: 15px;',
                hidden: true
            },{
                xtype:'opennoms-widgets-trackanimator',
		        id:'tabtrackanimator',
                hidden: true,
                flex: 1,
                span: 20, // seconds of "tail" to show
                speed: OpenNoms.config.AppConfig.speed, // play at 150x real time
		        frameRate: Ext.isIE?1:4,
                listeners:{
                    'afterrender': function(){
                        this.layer = OpenNoms.app.appPanel.mapPanel.animatedFlightTracks;
                    }
                },
		        url: OpenNoms.config.URLs.ows,
                extraParams:{
                    service:'WFS',
                    request:'GetFeature',
                    version:'1.0.0',
                    typeName:'opennoms:realtimetrack',
                    outputFormat:'json'
                    //viewparams:'airport:MSP;isorange:2011-08-06 16\\\:00\\\:00/2011-08-06 16\\\:15\\\:00;optype:;x:480956;y:4970848;step:2;&outputFormat=json'
                }
            }]
        }];

        this.callParent(arguments);

        this.logo = Ext.create('Ext.container.Container', {
            layout: 'fit',
            cls: 'header-logo',
            width: 64,
            height: 64,
            floating: true,
            shadow: false,
            x: 5,
            y: 5
        });

        this.on({
            'afterlayout': function () {
                this.logo.show();
            },
            single: true,
            scope: this
        });
    }
});