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

Ext.define('OpenNoms.widgets.Legend', {
    extend: 'Ext.grid.Panel',
    alias: 'widgets.opennoms-widgets-legend',

    id: 'legend-grid',
    hideHeaders: true,

    initComponent: function () {
        this.addEvents({
            'checkchange': true
        });

        this.store = Ext.create('Ext.data.Store', {
            fields: [
                { name: 'name', type: 'string' },
                { name: 'isOn', type: 'boolean' },
                { name: 'layer' }
            ]
        });

        this.columns = [
            {
                xtype: 'checkcolumn',
                header: '',
                dataIndex: 'isOn',
                width: 22,
                listeners: {
                    'checkchange': function (column, recIndex, checked) {
                        var record = this.store.getAt(recIndex);
                        record.commit();
                        this.fireEvent('checkchange', this, recIndex, checked);
                    },
                    scope: this
                }
            },
            { header: 'Layer Name', dataIndex: 'name', flex: 1 }
        ];

        this.callParent(arguments);
    }
});