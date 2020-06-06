/**
 * db/index.js
 * author: walker-finlay
 * 
 * All the methods needed for contact and CRUD with the mlab mongodb
 */
var mongoose = require('mongoose');
var db = mongoose.connection;

// ~ db stuff .................................................................
mongoose.connect('mongodb://walker:qY5!7t!n4faEViD@ds159493.mlab.com:59493/heroku_thkqjgt1', { useNewUrlParser: true, useUnifiedTopology: true });
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("connected");
});
const battleSchema = new mongoose.Schema({
    player: String,
    battleTime: Date,
    battle: {},
    event: {
        id: Number,
        mode: String,
        map: String,
    },
});
battleSchema.index('battleTime'); /* schema.index() is idempotent */
battleSchema.index('player');
var battleModel = mongoose.model('Battle', battleSchema);

const playerSchema = new mongoose.Schema({
    name: String,
    tag: String,
});
const playerModel = new mongoose.model('Player', playerSchema);

const brawlerSchema = new mongoose.Schema({
    tag: String,
    id: Number,
    trophies: Number,
}, { strict: true });

/**
 * Keeps track of user's total trophies and individual brawler trophies
 */
const pHistorySchema = new mongoose.Schema({
    player: String,
    date: Date,
    trophies: Number,
    brawlers: [brawlerSchema],
}, { strict: true });

const pHistoryModel = new mongoose.model('PHistory', pHistorySchema);

// Helper methods -------------------------------
function formatDate(date) {
    return date.slice(0, 4) + '-' + date.slice(4, 6) + '-' + date.slice(6, 11) + ':' + date.slice(11, 13) + ':' + date.slice(13);
}

function getTopGame(whose) {
    return battleModel.find({ player: whose })
        .sort({ battleTime: -1 }).limit(1)
        .then(battles => {
            if (battles[0] != undefined) { /* Are they in the database? (edge case) */
                return battles[0];
            } else return { battleTime: Date.parse('2019-01-01T00:00:00.000Z') }
        })
        .catch(err => console.log(err));
}

function getTopPHistory(whose) {
    return playerModel.find({ player: whose })
        .sort({ date: -1 }).limit(1)
        .then(PHistories => {
            if (PHistories[0] != undefined) {
                return PHistories[0].date;
            } else return Date.parse('2019-01-01T00:00:00.000Z');
        })
}

// Methods for backend ........................................................
module.exports = {
    dateString() {
        const today = new Date();
        const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        return date + ' ' + time;
    },
    /**
     * Input the battlelog API response and player associated with the documents
     * @param {[Battle]} array 25 battle entries from bs API
     * @param {String} player player tag
     */
    async insertBattles(array, player) {
        let insertBuffer = [];
        const top = await getTopGame(player);

        for (i in array) {
            array[i].player = player;
            array[i].battleTime = Date.parse(formatDate(array[i].battleTime));
            if (array[i].battleTime > top.battleTime) insertBuffer.push(array[i]);
        }

        const dateTime = this.dateString();

        // Actual insertion
        await battleModel.insertMany(insertBuffer)
            .catch(err => console.log(err));

        if (insertBuffer.length > 0) { /* Log only if there was anything new */
            console.log(`${dateTime} Inserted ${insertBuffer.length} ${player} game(s).`);
        }

        return insertBuffer.length;
    },
    /**
     * Input the truncated (by strict mode) player API response
     * @param {JSON} data raw API response with trophy & brawler data
     */
    async insertPHistory(data, player) { /* FIXME: don't let this add more than once a day (might happen during dev)*/
        const top = await getTopPHistory(player);
        const today = new Date();
        const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        let diff = Date.parse(today) - top;

        if (diff > 86400000) {
            data.date = date;
            data.player = player;
            pHistoryModel.create(data)
                .then(console.log(`Inserted phistory for ${data.tag}`))
                .catch(err => console.log(err));
        }
    },
    async newPlayer(playerName, playerTag) { /* Does this need to be async? */
        await playerModel.create({ tag: playerTag, name: playerName })
            .then(inserted => {
                console.log(`${dateString()} new player \n${inserted}.`);
            })
            .catch(err => {
                console.log(err);
            });
        return 0;
    },
    async getPlayers() {
        let result = await playerModel.find({});
        return result;
    },
    safeExit() {
        mongoose.disconnect(() => {
            console.log('db disconnected'); /* Only outputs sometimes? */
        })
        return 0;
    },
};