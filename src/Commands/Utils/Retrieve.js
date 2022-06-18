const Command = require('../../Structures/Command')
const Message = require('../../Structures/Message')

module.exports = class command extends Command {
    constructor() {
        super('retrieve', {
            description: 'Retrieves a view once message',
            usage: 'retrieve [quote view once message]',
            cooldown: 10,
            category: 'utils',
            exp: 25
        })
    }

    /**
     * @param {Message} M
     * @returns {Promise<void>}
     */

    execute = async (M) => {
        if (!M.quoted || M.quoted.type !== 'viewOnceMessage')
            return void M.reply('Quote a view once message to retrieve, Baka!')
        const buffer = await M.downloadMediaMessage(M.quoted.message)
        const type = Object.keys(M.quoted.message.viewOnceMessage.message)[0].replace('Message', '')
        return void (await M.reply(buffer, type))
    }
}
