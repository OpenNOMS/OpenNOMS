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

Ext.define('OpenNoms.widgets.AppPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.opennoms-widgets-apppanel',
    border: false,

    id: 'app-panel',

    initComponent: function () {
        this.addEvents({
            'clearmeasureclicked': true,
            'refreshnoiseclicked': true
        });

        this.mapPanel = new OpenNoms.widgets.MapPanel();
        this.appHeader = new OpenNoms.widgets.AppHeader();

        Ext.apply(this, {
            items: [
                this.appHeader,
                this.mapPanel
            ],
            layout: 'border'
        });

        this.noiseButton = Ext.create('Ext.panel.Panel', {
            frame: true,
            floating: true,
            width: 40,
            height: 40,
            layout: 'fit',
            items: [{
                xtype: 'button',
                iconCls: 'icon-center microphone',
                tooltip: 'View Noise Events',
                iconAlign: 'top',
                text: '',
                scale: 'medium',
                enableToggle: true,
                toggleGroup: 'info-panel-controls',
                toggleHandler: function (btn, state) {
                    if (state) {
                        this.infoPanel.show();
                        this.infoPanel.alignTo(this.mapPanel, 'tr-tr', [-60, 10]);
                        this.infoPanel.layout.setActiveItem(0);
                    } else {
                        this.infoPanel.hide();
                    }
                },
                scope: this
            }]
        });

        this.legendButton = Ext.create('Ext.panel.Panel', {
            frame: true,
            floating: true,
            width: 40,
            height: 40,
            layout: 'fit',
            items: [{
                xtype: 'button',
                iconCls: 'icon-center map',
                tooltip: 'View Legend',
                iconAlign: 'top',
                text: '',
                scale: 'medium',
                enableToggle: true,
                toggleGroup: 'info-panel-controls',
                toggleHandler: function (btn, state) {
                    if (state) {
                        this.infoPanel.show();
                        this.infoPanel.alignTo(this.mapPanel, 'tr-tr', [-60, 10]);
                        this.infoPanel.layout.setActiveItem(1);
                    } else {
                        this.infoPanel.hide();
                    }
                },
                scope: this
            }]
        });

        this.selectFlightsButton = Ext.create('Ext.panel.Panel', {
            frame: true,
            floating: true,
            width: 40,
            height: 40,
            layout: 'fit',
            items: [{
                xtype: 'button',
                iconCls: 'icon-center plane',
                tooltip: 'Select Flights',
                iconAlign: 'top',
                text: '',
                scale: 'medium',
                enableToggle: true,
                toggleGroup: 'info-panel-controls',
                toggleHandler: function (btn, state) {
                    if (state) {
                        this.infoPanel.show();
                        this.infoPanel.alignTo(this.mapPanel, 'tr-tr', [-60, 10]);
                        this.infoPanel.layout.setActiveItem(2);
                    } else {
                        this.infoPanel.hide();
                    }
                },
                scope: this
            }]
        });

        this.infoPanel = Ext.create('Ext.panel.Panel', {
            frame: true,
            floating: true,
            width: 425,
            height: 320,
            layout: 'card',
            items: [{
                xtype: 'panel',
                title: 'Noise Event Information',
                layout: 'border',
                tools: [{
                    type: 'refresh',
                    handler: function () {
                        this.fireEvent('refreshnoiseclicked');
                    },
                    scope: this
                }, {
                    type: 'close',
                    handler: function (event, toolEl, panel) {
                        this.noiseButton.query('button')[0].toggle();
                    },
                    scope: this
                }],
                items: [{
                    xtype: 'container',
                    id: 'flight-info-region',
                    height: 25,
                    style: 'padding:5px;',
                    tpl: new Ext.XTemplate(
                        '<tpl if="opnum == \'no flight\'">',
                            '<p>No Flight Track Selected</p>',
                        '</tpl>',
                        '<tpl if="opnum != \'no flight\'">',
                            '<p><span style="font-weight:bold;">Flight #:</span> {flight_id}, <span style="font-weight:bold;">Airport:</span> {airport}, <span style="font-weight:bold;">Airline:</span> {airline}, <span style="font-weight:bold;">Aircraft:</span> {mactype}</p>',
                        '</tpl>'
                    ),
                    data: { opnum: 'no flight' },
                    region: 'north'
                }, Ext.create('OpenNoms.widgets.NoiseEventViewer', {
                    region: 'center'
                })]
            }, {
                xtype: 'panel',
                title: 'Legend',
                layout: 'border',
                tools: [{
                    type: 'close',
                    handler: function (event, toolEl, panel) {
                        this.legendButton.query('button')[0].toggle();
                    },
                    scope: this
                }],
                items: [{
                    xtype: 'container',
                    id: 'flight-legend-display-region',
                    height: 60,
                    style: 'padding:5px;',
                    layout: 'card',
                    items: [{
                        xtype: 'container',
                        html: '<div style="font-weight:bold;">Flight Track Display:</div>' +
                            '​<div id="staticflightlegend">' +
                                '<img src="media/images/redline.png" style="padding-left:40px;padding-right:6px;">Arrivals' +
                                '<img src="media/images/greenline.png" style="padding-left:40px;padding-right:6px;">Departures' +
                                '<img src="media/images/blueline.png" style="padding-left:40px;padding-right:6px;">Untagged' +
                            '</div>'
                    }, {
                        xtype: 'container',
                        html: '<div style="font-weight:bold;">Animated Flight Display:</div>' +
                            '​<div id="animatedflightlegend">' +
                                '<img src="media/images/airplane_red.png" style="padding-left:40px;padding-right:6px;">Arrivals' +
                                '<img src="media/images/airplane_green.png" style="padding-left:40px;padding-right:6px;">Departures' +
                                '<img src="media/images/airplane_blue.png" style="padding-left:40px;padding-right:6px;">Untagged' +
                            '</div>'
                    }],
                    region: 'north'
                }, Ext.create('OpenNoms.widgets.Legend', {
                    region: 'center'
                })]
            }, Ext.create('OpenNoms.widgets.SelectFlights', {
                tools: [{
                    type: 'close',
                    handler: function (event, toolEl, panel) {
                        this.selectFlightsButton.query('button')[0].toggle();
                    },
                    scope: this
                }]
            })],
            listeners: {
                'show': function () {
                    this.on({
                        'afterlayout': function () {
                            this.infoPanel.alignTo(this.mapPanel, 'tr-tr', [-60, 10]);
                        },
                        scope: this
                    });
                },
                scope: this,
                single: true
            }
        });

        this.measureFeedbackPanel = Ext.create('Ext.panel.Panel', {
            frame: true,
            floating: true,
            width: 200,
            height: 80,
            layout: {
                type: 'vbox',
                padding: '5',
                align: 'stretch'
            },
            items: [{
                xtype: 'container',
                height: 35,
                html: '<div style="font-weight:bold;">Current Measurement: </div><div id="measure-read-out"></div>'
            }, {
                xtype: 'button',
                text: 'Clear Measurement',
                height: 25,
                handler: function () {
                    this.fireEvent('clearmeasureclicked');
                },
                scope: this
            }],
            listeners: {
                'show': function () {
                    this.on({
                        'afterlayout': function () {
                            this.measureFeedbackPanel.alignTo(this.mapPanel, 'tl-tl', [70, 10]);
                        },
                        scope: this
                    });
                },
                scope: this,
                single: true
            }
        });

        this.linkURLWindow = Ext.create('Ext.window.Window', {
            title: 'Link for Email',
            modal: true,
            height: 110,
            width: 420,
            layout: 'fit',
            closeAction: 'hide',
            items: [{
                xtype: 'form',
                bodyPadding: 5,
                layout: 'anchor',
                defaults: {
                    anchor: '100%',
                    labelWidth: 30
                },
                // The fields
                defaultType: 'textfield',
                items: [{
                    fieldLabel: 'URL',
                    id: 'linkurltextfield',
                    name: 'url',
                    allowBlank: false,
                    value: 'asfdafsasdf',
                    readOnly: true,
                    selectOnFocus: true
                }],
                // Reset and Submit buttons
                buttons: [{
                    text: 'Close',
                    handler: function () {
                        this.linkURLWindow.hide();
                    },
                    scope: this
                }]
            }],
            closable: true,
            draggable: false,
            resizable: false,
            listeners: {
                'show': function () {
                    Ext.getCmp('linkurltextfield').selectText();
                },
                scope: this
            }
        });

        this.on({
            'activate': function () {
                this.noiseButton.show();
                this.legendButton.show();
                this.selectFlightsButton.show();
                this.on({
                    'afterlayout': function () {
                        this.noiseButton.alignTo(this.mapPanel, 'tr-tr', [-10, 60]);
                        this.legendButton.alignTo(this.mapPanel, 'tr-tr', [-10, 10]);
                        this.selectFlightsButton.alignTo(this.mapPanel, 'tr-tr', [-10, 110]);
                        this.legendButton.query('button')[0].toggle(true);
                        this.legendButton.query('button')[0].toggle(false);
                    },
                    'activate': function () {
                        this.noiseButton.show();
                        this.legendButton.show();
                        this.selectFlightsButton.show();
                    },
                    'deactivate': function () {
                        this.noiseButton.hide();
                        this.legendButton.hide();
                        this.selectFlightsButton.hide();
                    },
                    scope: this
                });
                this.doLayout();
            },
            single: true,
            scope: this
        });


        this.callParent(arguments);
    }
});