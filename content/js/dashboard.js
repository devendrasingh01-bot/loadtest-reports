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

    var data = {"OkPercent": 99.56823536903777, "KoPercent": 0.4317646309622365};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4528863911354518, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4033546140452699, 500, 1500, "Offer Detail"], "isController": false}, {"data": [0.5134777975631301, 500, 1500, "Loyalty  Card"], "isController": false}, {"data": [0.40156917014589294, 500, 1500, "Offer List"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 314060, 1356, 0.4317646309622365, 1708.8040278927274, 439, 465816, 846.0, 1733.9000000000015, 95581.35000000006, 208220.0, 467.92146976746955, 512.4440282315799, 728.5502901671642], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Offer Detail", 86150, 447, 0.5188624492164828, 2070.3756355194582, 439, 465816, 1059.0, 1744.0, 2052.9500000000007, 150135.99, 128.3640622345926, 113.49059737201961, 198.65523506110142], "isController": false}, {"data": ["Loyalty  Card", 142642, 462, 0.3238877749891336, 1264.7575328444611, 441, 254143, 687.0, 967.0, 1159.0, 150290.92, 212.53656087170953, 286.6778890818025, 326.0475909682168], "isController": false}, {"data": ["Offer List", 85268, 447, 0.5242294882019046, 2086.3229816578473, 442, 452929, 1060.0, 1744.0, 2056.0, 150122.0, 127.04949786929701, 112.30675807907069, 203.89207751922103], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Operation timed out", 24, 1.7699115044247788, 0.007641851875437814], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 34, 2.5073746312684366, 0.010825956823536903], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 595, 43.87905604719764, 0.18945424441189582], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to mulesoftuat.keellsnexus.com:443 [mulesoftuat.keellsnexus.com/172.67.139.244, mulesoftuat.keellsnexus.com/104.21.70.219, mulesoftuat.keellsnexus.com/2606:4700:3036:0:0:0:ac43:8bf4, mulesoftuat.keellsnexus.com/2606:4700:3033:0:0:0:6815:46db] failed: Operation timed out", 153, 11.283185840707965, 0.048716805705916064], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: mulesoftuat.keellsnexus.com:443 failed to respond", 48, 3.5398230088495577, 0.015283703750875628], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to mulesoftuat.keellsnexus.com:443 [mulesoftuat.keellsnexus.com/172.67.139.244, mulesoftuat.keellsnexus.com/104.21.70.219, mulesoftuat.keellsnexus.com/2606:4700:3033:0:0:0:6815:46db, mulesoftuat.keellsnexus.com/2606:4700:3036:0:0:0:ac43:8bf4] failed: Operation timed out", 359, 26.474926253687315, 0.11430936763675731], "isController": false}, {"data": ["Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host terminated the handshake", 7, 0.5162241887905604, 0.0022288734636693626], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 136, 10.029498525073747, 0.04330382729414761], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 314060, 1356, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 595, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to mulesoftuat.keellsnexus.com:443 [mulesoftuat.keellsnexus.com/172.67.139.244, mulesoftuat.keellsnexus.com/104.21.70.219, mulesoftuat.keellsnexus.com/2606:4700:3033:0:0:0:6815:46db, mulesoftuat.keellsnexus.com/2606:4700:3036:0:0:0:ac43:8bf4] failed: Operation timed out", 359, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to mulesoftuat.keellsnexus.com:443 [mulesoftuat.keellsnexus.com/172.67.139.244, mulesoftuat.keellsnexus.com/104.21.70.219, mulesoftuat.keellsnexus.com/2606:4700:3036:0:0:0:ac43:8bf4, mulesoftuat.keellsnexus.com/2606:4700:3033:0:0:0:6815:46db] failed: Operation timed out", 153, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 136, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: mulesoftuat.keellsnexus.com:443 failed to respond", 48], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Offer Detail", 86150, 447, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 188, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to mulesoftuat.keellsnexus.com:443 [mulesoftuat.keellsnexus.com/172.67.139.244, mulesoftuat.keellsnexus.com/104.21.70.219, mulesoftuat.keellsnexus.com/2606:4700:3033:0:0:0:6815:46db, mulesoftuat.keellsnexus.com/2606:4700:3036:0:0:0:ac43:8bf4] failed: Operation timed out", 118, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to mulesoftuat.keellsnexus.com:443 [mulesoftuat.keellsnexus.com/172.67.139.244, mulesoftuat.keellsnexus.com/104.21.70.219, mulesoftuat.keellsnexus.com/2606:4700:3036:0:0:0:ac43:8bf4, mulesoftuat.keellsnexus.com/2606:4700:3033:0:0:0:6815:46db] failed: Operation timed out", 61, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 47, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: mulesoftuat.keellsnexus.com:443 failed to respond", 13], "isController": false}, {"data": ["Loyalty  Card", 142642, 462, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 232, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to mulesoftuat.keellsnexus.com:443 [mulesoftuat.keellsnexus.com/172.67.139.244, mulesoftuat.keellsnexus.com/104.21.70.219, mulesoftuat.keellsnexus.com/2606:4700:3033:0:0:0:6815:46db, mulesoftuat.keellsnexus.com/2606:4700:3036:0:0:0:ac43:8bf4] failed: Operation timed out", 111, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 49, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to mulesoftuat.keellsnexus.com:443 [mulesoftuat.keellsnexus.com/172.67.139.244, mulesoftuat.keellsnexus.com/104.21.70.219, mulesoftuat.keellsnexus.com/2606:4700:3036:0:0:0:ac43:8bf4, mulesoftuat.keellsnexus.com/2606:4700:3033:0:0:0:6815:46db] failed: Operation timed out", 44, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 10], "isController": false}, {"data": ["Offer List", 85268, 447, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 175, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to mulesoftuat.keellsnexus.com:443 [mulesoftuat.keellsnexus.com/172.67.139.244, mulesoftuat.keellsnexus.com/104.21.70.219, mulesoftuat.keellsnexus.com/2606:4700:3033:0:0:0:6815:46db, mulesoftuat.keellsnexus.com/2606:4700:3036:0:0:0:ac43:8bf4] failed: Operation timed out", 130, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to mulesoftuat.keellsnexus.com:443 [mulesoftuat.keellsnexus.com/172.67.139.244, mulesoftuat.keellsnexus.com/104.21.70.219, mulesoftuat.keellsnexus.com/2606:4700:3036:0:0:0:ac43:8bf4, mulesoftuat.keellsnexus.com/2606:4700:3033:0:0:0:6815:46db] failed: Operation timed out", 48, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 40, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: mulesoftuat.keellsnexus.com:443 failed to respond", 25], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
