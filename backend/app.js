const express = require('express');
const app = express();
const db = require('./db');
var request = require('superagent');


// Record keeping .............................................................
var tags = { jinx: '802PRQ2L', gouda: 'PGR2PP8U' }; /* TODO: get rid of this - put it in db and assign on startup */

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

/**
 * Get history and insert it for some players
 * @param  {...any} players Array of players to update
 */
function update(players) {
    for (let i in players) {
        getHistory(players[i].tag)
            .then(result => db.insert(result, players[i].tag))
            .catch(err => console.log(err));
    }
}

/**
 * Logging info and initial update
 */
async function init() {
    console.log('[startup] ' + db.dateString());
    var players = await db.getPlayers();
    update(players);
}

/* Update once and start update cycle */
init();
var interval = process.env.UPDATE || 8;
setInterval(() => {
    update(players);
}, 1000 * 60 * 60 * interval /* 8 hours */ );

// Server stuff ...............................................................
var port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

process.on('SIGINT', () => {
    (async() => {
        await db.safeExit();
        console.log('Received SIGINT');
        process.exit();
    })();
});