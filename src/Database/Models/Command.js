const { Schema, model } = require('mongoose')

const schema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },

    disabledCommands: [
        {
            command: String,
            reason: String,
            disabledBy: String,
            time: String
        }
    ]
})

module.exports = model('disabledcommands', schema)
