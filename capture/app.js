/**
 * app.js
 * author: walker-finlay
 * 
 * Periodically request bs API for all users and update their stats
 */
const db = require('./db');
var request = require('superagent');

var interval = process.env.UPDATE || 4;

async function getHistory(playerTag) {
    let requestURL = `https://api.brawlstars.com/v1/players/%24${playerTag}/battlelog`;
    let result;
    await request.get(requestURL)
        .set('authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjQzNmU0YWU2LWYwODUtNDNjYS1hMDUxLTJkYjZkNDkyMjc5OSIsImlhdCI6MTU4NjU2MjYzMiwic3ViIjoiZGV2ZWxvcGVyL2QzZGQzYTQ2LTAxNjMtYmZiZi02NzE5LTQ1MGEwN2FhYmFmMiIsInNjb3BlcyI6WyJicmF3bHN0YXJzIl0sImxpbWl0cyI6W3sidGllciI6ImRldmVsb3Blci9zaWx2ZXIiLCJ0eXBlIjoidGhyb3R0bGluZyJ9LHsiY2lkcnMiOlsiNzEuMTI1Ljc5LjIyNiJdLCJ0eXBlIjoiY2xpZW50In1dfQ.HnsYrWETQ2gVs-fLRJ3fbOOHMyDkKYQJYNZbauqNVE51Q_c024usKDIh9i_o74M3QP6CDVzrPYOytSty0_apOg')
        .then(res => {
            result = JSON.parse(res.text)['items'];
        })
        .catch(err => { console.log(err.message) });
    return result;
}

function getPlayer(playerTag) {
    let requestURL = `https://api.brawlstars.com/v1/players/%24${playerTag}`;
    return new Promise((resolve, reject) => {
        request.get(requestURL)
            .set('authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjQzNmU0YWU2LWYwODUtNDNjYS1hMDUxLTJkYjZkNDkyMjc5OSIsImlhdCI6MTU4NjU2MjYzMiwic3ViIjoiZGV2ZWxvcGVyL2QzZGQzYTQ2LTAxNjMtYmZiZi02NzE5LTQ1MGEwN2FhYmFmMiIsInNjb3BlcyI6WyJicmF3bHN0YXJzIl0sImxpbWl0cyI6W3sidGllciI6ImRldmVsb3Blci9zaWx2ZXIiLCJ0eXBlIjoidGhyb3R0bGluZyJ9LHsiY2lkcnMiOlsiNzEuMTI1Ljc5LjIyNiJdLCJ0eXBlIjoiY2xpZW50In1dfQ.HnsYrWETQ2gVs-fLRJ3fbOOHMyDkKYQJYNZbauqNVE51Q_c024usKDIh9i_o74M3QP6CDVzrPYOytSty0_apOg')
            .then(res => {
                resolve(JSON.parse(res.text));
            })
            .catch(err => reject(err));
    });
}

/**
 * Get history and insert new ones into db
 * @param {[JSON]} players array of players conforming to schema
 */
function updateGameHistory(players) {
    for (let p of players) {
        getHistory(p.tag)
            .then(result => {
                db.insertBattles(result, p.tag);
            })
            .catch(err => console.log(err));
    }
}

/**
 * Get current trophies for player and all their brawlers and insert
 * @param {[JSON]} players 
 */
function updatePHistory(players) {
    for (let p of players) {
        getPlayer(p.tag)
            .then(res => {
                db.insertPHistory(res, p.tag);
            })
            .catch(err => console.log(err.message));
    }
}

/**
 * Logging info and initial update
 */
var players;
async function init() {
    console.log('[startup] ' + db.dateString());
    db.getPlayers().then(players => {
        updateGameHistory(players);
        updatePHistory(players);
    });
}

// Startup --------------------------------------
init();
setInterval(() => {
    updateGameHistory(players);
}, 1000 * 60 * 60 * interval /* interval hours */ );

// TODO: check player stats once a day

/**
 * Graceful shutdown on SIGINT
 */
process.on('SIGINT', () => {
    (async() => {
        await db.safeExit();
        console.log('Received SIGINT');
        process.exit();
    })();
});