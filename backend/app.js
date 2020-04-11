const express = require('express');
const app = express();
const db = require('./db');
var request = require('superagent');

var port = process.env.PORT || 3000;

var tags = { jinx: '802PRQ2L', gouda: 'PGR2PP8U' };

async function getHistory(playerTag) {
    let requestURL = `https://api.brawlstars.com/v1/players/%24${playerTag}/battlelog`;
    let result;
    await request.get(requestURL)
        .set('authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjQzNmU0YWU2LWYwODUtNDNjYS1hMDUxLTJkYjZkNDkyMjc5OSIsImlhdCI6MTU4NjU2MjYzMiwic3ViIjoiZGV2ZWxvcGVyL2QzZGQzYTQ2LTAxNjMtYmZiZi02NzE5LTQ1MGEwN2FhYmFmMiIsInNjb3BlcyI6WyJicmF3bHN0YXJzIl0sImxpbWl0cyI6W3sidGllciI6ImRldmVsb3Blci9zaWx2ZXIiLCJ0eXBlIjoidGhyb3R0bGluZyJ9LHsiY2lkcnMiOlsiNzEuMTI1Ljc5LjIyNiJdLCJ0eXBlIjoiY2xpZW50In1dfQ.HnsYrWETQ2gVs-fLRJ3fbOOHMyDkKYQJYNZbauqNVE51Q_c024usKDIh9i_o74M3QP6CDVzrPYOytSty0_apOg')
        .then(res => {
            result = JSON.parse(res.text)['items'];
        })
        .catch(err => { console.log(err) });
    return result;
}

// function update() {
//     for (playerTag in tags) {
//         console.log(tags[playerTag]);
//         getHistory(tags[playerTag]).then(result => {
//             db.insert(result, tags[playerTag]);
//         }).catch(err => {
//             console.log(err);
//         })
//     }
// }

var today = new Date();
var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var dateTime = date + ' ' + time;

console.log('[startup] ' + dateTime);
getHistory(tags.jinx).then(result => {
    db.insert(result, tags.jinx);
}).catch(err => {
    console.log(err);
});
getHistory(tags.gouda).then(result => {
    db.insert(result, tags.gouda);
}).catch(err => {
    console.log(err);
});

// update();

setInterval(
    () => {
        getHistory(tags.jinx).then(result => {
            db.insert(result);
        }).catch(err => {
            console.log(err);
        });

        getHistory(tags.gouda).then(result => {
            db.insert(result, tags.gouda);
        }).catch(err => {
            console.log(err);
        });
        // update();
    }, 3600000 /* =1000 * 60 * 60 Updates every 60 minutes */
);


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