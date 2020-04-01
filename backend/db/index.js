var mongoose = require('mongoose');
var db = mongoose.connection;

// DB connection ..............................................................
mongoose.connect('mongodb://walker:qY5!7t!n4faEViD@ds159493.mlab.com:59493/heroku_thkqjgt1', { useNewUrlParser: true, useUnifiedTopology: true });
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("connected")
});

var battleSchema = new mongoose.Schema({
    battleTime: { type: Date, index: true },
    battle: {},
    event: {
        id: Number,
        mode: String,
        map: String,
    },
});

function formatDate(date) {
    return date.slice(0, 4) + '-' + date.slice(4, 6) + '-' + date.slice(6, 11) + ':' + date.slice(11, 13) + ':' + date.slice(13);
}

var battleTuple = mongoose.model('Battle', battleSchema);

// Methods for backend ........................................................
module.exports = {
    insert() {
        // for each battle: parse its timestamp, compare with most recent, break; insertmany or create
    },
    exit() {
        mongoose.disconnect(() => {
            console.log('db disconnected'); /* WHY DOES THIS ONLY WORK SOMETIMES */
        })
    },
    // TODO: delete this
    async insertCurrent(inp) {
        for (i in inp) {
            inp[i].battleTime = formatDate(inp[i].battleTime);
        }
        await battleTuple.insertMany(inp);
        console.log('here');
        console.log('done inserting.');
    },
};