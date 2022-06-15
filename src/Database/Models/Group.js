const { model, Schema } = require('mongoose')

const schema = new Schema({
    jid: {
        type: String,
        required: true,
        unique: true
    },

    mods: {
        type: Boolean,
        required: true,
        default: false
    },

    events: {
        type: Boolean,
        required: true,
        default: false
    },

    nsfw: {
        type: Boolean,
        required: true,
        default: false
    }
})

module.exports = model('groups', schema)
