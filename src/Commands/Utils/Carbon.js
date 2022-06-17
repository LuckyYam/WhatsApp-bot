const Command = require('../../Structures/Command')
const Message = require('../../Structures/Message')
const Carbon = require('unofficial-carbon-now')

module.exports = class command extends Command {
    constructor() {
        super('carbon', {
            description: 'Will send you the given code as carbon image.',
            category: 'utils',
            usage: 'carbon hello world',
            aliases: ['code'],
            exp: 20,
            cooldown: 10
        })
    }

    /**
     * @param {Message} M
     * @returns {Promise<void>}
     */

    execute = async (M, { context }) => {
        const texas = context.trim()

        if (!context) return void M.reply('Provide the code you want as carbon image, Baka!')

        try {
            const carbon = new Carbon.createCarbon()
                .setCode(texas)
                .setBackgroundColor(this.helper.utils.generateRandomHex())
                .setExportSize(3)

            const buffer = await Carbon.generateCarbon(carbon)
            return void (await M.reply(buffer, 'image'))
        } catch (err) {
            console.log(`Error Occurred`)
            return void (await M.reply(`_Error can't generate image, Baka!_`))
        }
    }
}
