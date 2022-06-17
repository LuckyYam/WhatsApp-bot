const Command = require('../Structures/Command')
const Message = require('../Structures/Message')

module.exports = class command extends Command {
    constructor() {
        super('command_name', {
            description: 'command_description',
            usage: 'example_of_using_the_command',
            category: 'category',
            exp: 20,
            dm: false,
            cooldown: 10
        })
    }

    /**
     * @param {Message} M
     * @param {args} args
     * @returns {Promise<void>}
     */

    execute = async (M, args) => {
        //do something
    }
}

/**
 * @typedef {import('../Handlers/Message').args} args
 */
