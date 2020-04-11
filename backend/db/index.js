var mongoose = require('mongoose');
var db = mongoose.connection;


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
battleSchema.index('battleTime', { unique: true });
battleSchema.index('player');
var battleModel = mongoose.model('Battle', battleSchema);

function formatDate(date) {
    return date.slice(0, 4) + '-' + date.slice(4, 6) + '-' + date.slice(6, 11) + ':' + date.slice(11, 13) + ':' + date.slice(13);
}

// Methods for backend ........................................................
module.exports = {
    /**
     * Input the API response and which player's record to add it to
     * @param {[Battle]} array API response
     * @param {String} player jinx or gouda player tag
     */
    async insert(array, player) {
        let top = { battleTime: Date.parse('2019-01-01T00:00:00.000Z') };
        let insertBuffer = [];

        // Most recent game in the db
        await battleModel.find().sort({ battleTime: -1 }).limit(1)
            .then(battles => { if (battles[0] != undefined) top = battles[0]; })
            .catch(err => console.err(err));

        for (i in array) {
            array[i].player = player;
            array[i].battleTime = Date.parse(formatDate(array[i].battleTime));
            if (array[i].battleTime > top.battleTime) insertBuffer.push(array[i]);
        }

        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date + ' ' + time;

        console.log(`${dateTime} Inserting ${insertBuffer.length} game(s).`);
        await battleModel.insertMany(insertBuffer);
        console.log('update complete');
    },
    exit() {
        mongoose.disconnect(() => {
            console.log('db disconnected'); /* WHY DOES THIS ONLY WORK SOMETIMES */
        })
    },
};