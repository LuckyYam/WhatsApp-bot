const Command = require('../../Structures/Command')
const Message = require('../../Structures/Message')

module.exports = class command extends Command {
    constructor() {
        super('hi', {
            description: 'Says hi to the bot',
            category: 'general',
            usage: 'hi',
            aliases: ['hello'],
            exp: 15,
            cooldown: 5
        })
    }

    /**
     * @param {Message} M
     * @returns {Promise<void>}
     */

    execute = async (M) => {
        return void M.reply(`Hello! ${M.sender.username}`)
    }
}
