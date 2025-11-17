/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.5954596203945, "KoPercent": 0.404540379605508};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.40061592854484557, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.19344921815697586, 500, 1500, "Offer Detail"], "isController": false}, {"data": [0.509662963308748, 500, 1500, "Loyalty  Card"], "isController": false}, {"data": [0.2189543614407806, 500, 1500, "Offer List"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 268700, 1087, 0.404540379605508, 1843.64181987346, 434, 537568, 765.0, 4598.0, 6781.9000000000015, 75130.81000000003, 414.20601777987423, 1760.806645252566, 639.6675168020698], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Offer Detail", 39522, 347, 0.8779920044532159, 4189.84026618086, 529, 530687, 3216.0, 7514.0, 7956.950000000001, 49973.450000000084, 60.925490292803694, 108.35974196327545, 93.53699991829738], "isController": false}, {"data": ["Loyalty  Card", 171376, 364, 0.21239846886378488, 961.3530482681302, 434, 465525, 661.0, 1068.0, 1157.0, 1522.9600000000064, 264.18863922255383, 233.11968825681606, 403.93706821499705], "isController": false}, {"data": ["Offer List", 57802, 376, 0.6504965226116743, 2855.3138299713005, 473, 537568, 2669.5, 4314.0, 4545.950000000001, 5355.0, 89.10422521315675, 1419.360199628758, 142.21241367122525], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Operation timed out", 8, 0.7359705611775529, 0.00297729810197246], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, 0.09199632014719411, 3.721622627465575E-4], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 135, 12.419503219871205, 0.05024190547078526], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: mulesoftuat.keellsnexus.com:443 failed to respond", 1, 0.09199632014719411, 3.721622627465575E-4], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to mulesoftuat.keellsnexus.com:443 [mulesoftuat.keellsnexus.com/104.21.70.219, mulesoftuat.keellsnexus.com/172.67.139.244, mulesoftuat.keellsnexus.com/2606:4700:3036:0:0:0:ac43:8bf4, mulesoftuat.keellsnexus.com/2606:4700:3033:0:0:0:6815:46db] failed: Operation timed out", 230, 21.159153633854647, 0.08559732043170823], "isController": false}, {"data": ["520/&lt;none&gt;", 1, 0.09199632014719411, 3.721622627465575E-4], "isController": false}, {"data": ["524/&lt;none&gt;", 1, 0.09199632014719411, 3.721622627465575E-4], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 710, 65.31738730450782, 0.26423520655005583], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 268700, 1087, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 710, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to mulesoftuat.keellsnexus.com:443 [mulesoftuat.keellsnexus.com/104.21.70.219, mulesoftuat.keellsnexus.com/172.67.139.244, mulesoftuat.keellsnexus.com/2606:4700:3036:0:0:0:ac43:8bf4, mulesoftuat.keellsnexus.com/2606:4700:3033:0:0:0:6815:46db] failed: Operation timed out", 230, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 135, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Operation timed out", 8, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Offer Detail", 39522, 347, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 211, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to mulesoftuat.keellsnexus.com:443 [mulesoftuat.keellsnexus.com/104.21.70.219, mulesoftuat.keellsnexus.com/172.67.139.244, mulesoftuat.keellsnexus.com/2606:4700:3036:0:0:0:ac43:8bf4, mulesoftuat.keellsnexus.com/2606:4700:3033:0:0:0:6815:46db] failed: Operation timed out", 84, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 47, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Operation timed out", 3, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1], "isController": false}, {"data": ["Loyalty  Card", 171376, 364, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 247, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to mulesoftuat.keellsnexus.com:443 [mulesoftuat.keellsnexus.com/104.21.70.219, mulesoftuat.keellsnexus.com/172.67.139.244, mulesoftuat.keellsnexus.com/2606:4700:3036:0:0:0:ac43:8bf4, mulesoftuat.keellsnexus.com/2606:4700:3033:0:0:0:6815:46db] failed: Operation timed out", 67, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 46, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Operation timed out", 3, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: mulesoftuat.keellsnexus.com:443 failed to respond", 1], "isController": false}, {"data": ["Offer List", 57802, 376, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 252, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to mulesoftuat.keellsnexus.com:443 [mulesoftuat.keellsnexus.com/104.21.70.219, mulesoftuat.keellsnexus.com/172.67.139.244, mulesoftuat.keellsnexus.com/2606:4700:3036:0:0:0:ac43:8bf4, mulesoftuat.keellsnexus.com/2606:4700:3033:0:0:0:6815:46db] failed: Operation timed out", 79, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 42, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Operation timed out", 2, "520/&lt;none&gt;", 1], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
