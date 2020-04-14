var mongoose = require('mongoose');
var db = mongoose.connection;

var tags = { jinx: '802PRQ2L', gouda: 'PGR2PP8U' };

// DB stuff ...................................................................
mongoose.connect('mongodb://walker:qY5!7t!n4faEViD@ds159493.mlab.com:59493/heroku_thkqjgt1', { useNewUrlParser: true, useUnifiedTopology: true });
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("connected");
});
var battleSchema = new mongoose.Schema({
    player: String,
    battleTime: Date,
    battle: {},
    event: {
        id: Number,
        mode: String,
        map: String,
    },
});
battleSchema.index('battleTime');
battleSchema.index('player');
var battleModel = mongoose.model('Battle', battleSchema);

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

// Methods for backend ........................................................
module.exports = {
    /**
     * Input the API response and which player's record to add it to
     * @param {[Battle]} array API response
     * @param {String} player jinx or gouda player tag
     */
    async insert(array, player) {
        let insertBuffer = [];
        const top = await getTopGame(player);

        for (i in array) {
            array[i].player = player;
            array[i].battleTime = Date.parse(formatDate(array[i].battleTime));
            if (array[i].battleTime > top.battleTime) insertBuffer.push(array[i]);
        }

        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date + ' ' + time;

        await battleModel.insertMany(insertBuffer)
            .catch(err => console.log(err));

        console.log(`${dateTime} Inserted ${insertBuffer.length} ${player} game(s).`);
    },
    exit() {
        mongoose.disconnect(() => {
            console.log('db disconnected'); /* Only outputs sometimes? */
        })
    },
};