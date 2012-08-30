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

Ext.define('OpenNoms.widgets.SelectFlights', {
    extend: 'Ext.grid.Panel',
    alias: 'widgets.opennoms-widgets-selectflights',

    id: 'select-flights',
    title: 'Select Flights for Display',
    hideHeaders: true,

    initComponent: function () {
        this.store = Ext.create('Ext.data.Store', {
            fields: ['group', 'name', 'value', 'ischecked'],
            groupField: 'group',
            proxy: Ext.create('FGI.data.proxy.GeoserverJsonP', {
                url: OpenNoms.config.URLs.ows,
                extraParams: {
                    'service': 'WFS',
                    'version': '1.0.0',
                    'request': 'GetFeature',
                    'typeName': 'opennoms:advanced_query_choices',
                    'maxFeatures': '50',
                    'outputFormat': 'json'
                }
            }),
            autoLoad: false
        });

        this.columns = [{
            header: '',
            dataIndex: 'name',
            renderer: function () {
                return '';
            },
            width: 25
        }, {
            xtype: 'checkcolumn',
            header: '',
            dataIndex: 'ischecked',
            width: 22,
            listeners: {
                'checkchange': function (column, recIndex, checked) {
                    var record = this.store.getAt(recIndex);
                    record.commit();
                },
                scope: this
            }
        }, {
            header: 'Name',
            dataIndex: 'name',
            flex: 1
        }];

        this.features = [{
            ftype: 'checkgrouping',
            checkField: 'ischecked',
            //groupHeaderTpl: '{name} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})'
            groupHeaderTpl: '{[values.name == "Airline" ? "Airlines" : ""]}' +
                '{[values.name == "Airport:FCM" ? "FCM Aiport Runways" : ""]}' +
                '{[values.name == "Airport:MSP" ? "MSP Airport Runways" : ""]}' +
                '{[values.name == "Airport:STP" ? "STP Airport Runways" : ""]}' +
                '{[values.name == "Flight Type" ? "Flight Types" : ""]}'
        }];

        this.callParent(arguments);

        this.on({
            'viewready': function () {
                this.store.on({
                    'update': function (store, record, operation, opts) {
                        this.updateGroup(store, record);
                    },
                    scope: this
                });

                this.store.data.each(function (record, index, allRecords) {
                    this.updateGroup(this.store, record);
                }, this);
            },
            scope: this,
            single: true
        });
    },

    updateGroup: function (store, record) {
        var group = record.get('group');
        var groupNodeEl = Ext.get('groupcheck' + group).up('dl');
        var records = store.queryBy(function (rec, id) {
            return (rec.data[store.groupField] == group);
        }, this);
        var allOn = true;
        var allOff = true;
        records.each(function (item, index, allItems) {
            if (item.get('ischecked')) {
                allOff = false;
            } else {
                allOn = false
            }
        }, this);
        if (!allOff && !allOn) {
            if (groupNodeEl.hasCls('x-grid-row-checked')) {
                groupNodeEl.removeCls('x-grid-row-checked');
            }
            if (!groupNodeEl.hasCls('x-grid-row-partialchecked')) {
                groupNodeEl.addCls('x-grid-row-partialchecked');
            }
        } else {
            if (groupNodeEl.hasCls('x-grid-row-partialchecked')) {
                groupNodeEl.removeCls('x-grid-row-partialchecked');
            }
            if (allOn) {
                if (!groupNodeEl.hasCls('x-grid-row-checked')) {
                    groupNodeEl.addCls('x-grid-row-checked');
                }
            } else {
                if (groupNodeEl.hasCls('x-grid-row-checked')) {
                    groupNodeEl.removeCls('x-grid-row-checked');
                }
            }
        }
    }
});

/**
*/
Ext.define('Ext.grid.feature.CheckGrouping', {
    extend: 'Ext.grid.feature.Grouping',
    requires: 'Ext',
    alias: 'feature.checkgrouping',
    checkField: '',

    constructor: function () {
        this.callParent(arguments);

        this.groupHeaderTpl = ['<dl style="height:18px; border:0px !important" class="x-grid-row-checked">',
             '<dd id="groupcheck{name}" class="x-grid-row-checker x-column-header-text" style="width:18px; float:left;" x-grid-group-hd-text="{text}">&nbsp;</dd>',
             '<dd style="float:left; padding:0px 0px 0px 3px;">',
             this.groupHeaderTpl,
             '</dd>',
             '</dl>'
             ].join('');
    },

    onGroupClick: function (view, node, group, e, options) {
        var checkbox = Ext.get('groupcheck' + group);
        if (this.inCheckbox(checkbox, e.getXY())) {
            this.toggleCheckbox(group, node, view);
        } else if (this.isLeftofCheckbox(checkbox, e.getXY())) {
            this.callParent(arguments);
        }
    },

    inCheckbox: function (checkbox, xy) {
        var x = xy[0];
        var y = xy[1];
        if (x >= checkbox.getLeft() &&
            x <= checkbox.getRight() &&
            y >= checkbox.getTop() &&
            y <= checkbox.getBottom()) {
            return true;
        }
        return false;
    },
    isLeftofCheckbox: function (checkbox, xy) {
        if (xy[0] < checkbox.getLeft()) {
            return true;
        }
        return false;
    },
    toggleCheckbox: function (group, node, view) {
        var nodeEl = Ext.get(node).down('dl');
        var checked = !nodeEl.hasCls('x-grid-row-checked');
        var records = view.store.queryBy(
            function (record, id) {
                if (record.data[view.store.groupField] == group) {
                    if (checked) {
                        record.set(this.checkField, true);
                    }
                    else {
                        record.set(this.checkField, false);
                    }
                    record.commit();
                }
            }, this
        );
    }
});