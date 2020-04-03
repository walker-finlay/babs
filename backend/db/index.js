var mongoose = require('mongoose');
var db = mongoose.connection;

// DB connection ..............................................................
mongoose.connect('mongodb://walker:qY5!7t!n4faEViD@ds159493.mlab.com:59493/heroku_thkqjgt1', { useNewUrlParser: true, useUnifiedTopology: true });
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("connected")
});

var battleSchema = new mongoose.Schema({
    battleTime: Date,
    battle: {},
    event: {
        id: Number,
        mode: String,
        map: String,
    },
});
battleSchema.index('battleTime', { unique: true })

var battleModel = mongoose.model('Battle', battleSchema);

function formatDate(date) {
    return date.slice(0, 4) + '-' + date.slice(4, 6) + '-' + date.slice(6, 11) + ':' + date.slice(11, 13) + ':' + date.slice(13);
}

// Methods for backend ........................................................
module.exports = {
    async insert(array) {
        let top;
        let insertBuffer = [];

        // Most recent game in the db
        await battleModel.find().sort({ battleTime: -1 }).limit(1)
            .then(battles => { top = battles[0]; })
            .catch(err => console.err(err));

        console.log(top);

        if (top != undefined) { /* If top is defined */
            for (i in array) {
                array[i].battleTime = Date.parse(formatDate(array[i].battleTime));
                if (array[i].battleTime > top.battleTime) {
                    insertBuffer.push(array[i]);
                }
            }
        } else { /* Top is undefined (edge case) */
            for (i in array) {
                array[i].battleTime = Date.parse(formatDate(array[i].battleTime));
            }
            insertBuffer = array;
        }

        console.log(`adding ${insertBuffer.length} games.`);
        await battleModel.insertMany(insertBuffer);
        console.log('update complete');
    },
    exit() {
        mongoose.disconnect(() => {
            console.log('db disconnected'); /* WHY DOES THIS ONLY WORK SOMETIMES */
        })
    },
    // async insertCurrent(inp) {
    //     for (i in inp) {
    //         inp[i].battleTime = formatDate(inp[i].battleTime);
    //     }
    //     await battleTuple.insertMany(inp);
    //     console.log('here');
    //     console.log('done inserting.');
    // },
};