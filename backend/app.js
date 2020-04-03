const express = require('express');
const app = express();
const db = require('./db');
var request = require('superagent');

var port = process.env.PORT || 3000;

// API stuff ..................................................................
// setInterval(() => {
//     var playerTag = "802PRQ2L"
//     var requestURL = `https://api.brawlstars.com/v1/players/%24${playerTag}/battlelog`;
//     request.get(requestURL)
//         .set('authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjhmN2ZjY2I0LTNmOTUtNDhmOC04NGFhLTg0MmMzNjI2ZjhhYyIsImlhdCI6MTU4NTcwMjg1OSwic3ViIjoiZGV2ZWxvcGVyL2QzZGQzYTQ2LTAxNjMtYmZiZi02NzE5LTQ1MGEwN2FhYmFmMiIsInNjb3BlcyI6WyJicmF3bHN0YXJzIl0sImxpbWl0cyI6W3sidGllciI6ImRldmVsb3Blci9zaWx2ZXIiLCJ0eXBlIjoidGhyb3R0bGluZyJ9LHsiY2lkcnMiOlsiNzEuMTI1Ljg3LjUzIl0sInR5cGUiOiJjbGllbnQifV19.GGGCG2ntMchf80TdqAQk_Vv1Tk1iVOy-G5--QPmxYR-a_-fmZZ_DBnlCpq1KAQ4BWZ6GULiPZ1A6x7J5vXjiHw')
//         .then(res => {
//             var result = JSON.parse(res.text)['items'];
//             db.insert(result);
//         })
//         .catch(err => { console.log(err) });
// }, 12 * 60 * 60 * 1000); /* 12 hours * 60 minutes * 60 seconds * 1000 milliseconds */

var playerTag = "802PRQ2L"
var requestURL = `https://api.brawlstars.com/v1/players/%24${playerTag}/battlelog`;
request.get(requestURL)
    .set('authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjhmN2ZjY2I0LTNmOTUtNDhmOC04NGFhLTg0MmMzNjI2ZjhhYyIsImlhdCI6MTU4NTcwMjg1OSwic3ViIjoiZGV2ZWxvcGVyL2QzZGQzYTQ2LTAxNjMtYmZiZi02NzE5LTQ1MGEwN2FhYmFmMiIsInNjb3BlcyI6WyJicmF3bHN0YXJzIl0sImxpbWl0cyI6W3sidGllciI6ImRldmVsb3Blci9zaWx2ZXIiLCJ0eXBlIjoidGhyb3R0bGluZyJ9LHsiY2lkcnMiOlsiNzEuMTI1Ljg3LjUzIl0sInR5cGUiOiJjbGllbnQifV19.GGGCG2ntMchf80TdqAQk_Vv1Tk1iVOy-G5--QPmxYR-a_-fmZZ_DBnlCpq1KAQ4BWZ6GULiPZ1A6x7J5vXjiHw')
    .then(res => {
        var result = JSON.parse(res.text)['items'];
        db.insert(result);
    })
    .catch(err => { console.log(err) });

// Server stuff ...............................................................
app.listen(port, () => {
    console.log(`listening on port ${port}`)
});

process.on('SIGINT', () => {
    (async() => {
        await db.exit();
        console.log('Received SIGINT');
        process.exit();
    })();
})