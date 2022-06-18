const Command = require('../../Structures/Command')
const Message = require('../../Structures/Message')
const Carbon = require('unofficial-carbon-now')

module.exports = class command extends Command {
    constructor() {
        super('carbon', {
            description: 'Sends ',
            category: 'utils',
            usage: 'carbon [provide code/quote the message containing the code]',
            exp: 20,
            cooldown: 15
        })
    }

    /**
     * @param {Message} M
     * @param {import('../../Handlers/Message').args} args
     * @returns {Promise<void>}
     */

    execute = async (M, args) => {
        const { context } = args
        const code = context || M.quoted.content
        if (!code) return void M.reply('Provide the code you want as a carbon image, Baka!')
        try {
            const carbon = new Carbon.createCarbon()
                .setCode(code.replace(/\```/g, ''))
                .setBackgroundColor(this.helper.utils.generateRandomHex())
                .setExportSize(3)
            const buffer = await Carbon.generateCarbon(carbon)
            return void (await M.reply(buffer, 'image'))
        } catch (err) {
            this.helper.log(err.message, true)
            return void (await M.reply('An error occurred. Try again later'))
        }
    }
}
