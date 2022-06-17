const Command = require('../../Structures/Command')
const Message = require('../../Structures/Message')

module.exports = class command extends Command {
    constructor() {
        super('kitsune', {
            description: 'Sends random kitsune image',
            category: 'weeb',
            usage: 'kitsune',
            exp: 20,
            cooldown: 5
        })
    }

    /**
     * @param {Message} M
     * @returns {Promise<void>}
     */

    execute = async (M) => {
        const { results } = await this.helper.utils.fetch('https://nekos.best/api/v2/kitsune')
        return void (await M.reply(await this.helper.utils.getBuffer(results[0].url), 'image'))
    }
}
