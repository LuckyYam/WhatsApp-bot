const Command = require('../../Structures/Command')
const Message = require('../../Structures/Message')

module.exports = class command extends Command {
    constructor() {
        super('ban', {
            description: 'Ban/unban users',
            category: 'dev',
            usage: 'ban [tag/quote users] --action=[ban/unban]',
            cooldown: 5
        })
    }

    /**
     * @param {Message} M
     * @param {import('../../Handlers/Message').args} args
     * @returns {Promise<void>}
     */

    execute = async (M, args) => {
        let { flags } = args
        const users = M.mentioned
        if (M.quoted && !users.includes(M.quoted.sender.jid)) users.push(M.quoted.sender.jid)
        if (users.length < 1) return void M.reply('Tag or quote a user to use this command')
        flags = flags.filter((flag) => flag.startsWith('--action'))
        if (flags.length < 1)
            return void M.reply(
                `Provide the action of the ban. Example: *${this.helper.config.prefix}ban --action=ban*`
            )
        const actions = ['ban', 'unban']
        const action = flags[0].split('=')[1]
        if (!action || action === '')
            return void M.reply(
                `Provide the action of the ban. Example: *${this.helper.config.prefix}ban --action=ban*`
            )
        if (!actions.includes(action.toLowerCase())) return void M.reply('Invalid action')
        let text = `🚦 *State: ${action.toLowerCase() === 'ban' ? 'BANNED' : 'UNBANNED'}*\n⚗ *Users:*\n`
        let Text = '🚦 *State: SKIPPED*\n⚗ *Users:*\n\n'
        let resultText = ''
        let skippedFlag = false
        for (const user of users) {
            const info = await this.helper.DB.getUser(user)
            if ((info.ban && action.toLowerCase() === 'ban') || (!info.ban && action.toLowerCase() === 'unban')) {
                skippedFlag = true
                Text += `*@${user.split('@')[0]}*\n`
                continue
            }
            text += `\n*@${user.split('@')[0]}*`
            await this.helper.DB.user.updateOne({ jid: user }, { $set: { ban: action.toLowerCase() === 'ban' } })
        }
        if (skippedFlag) resultText += `${Text}\n`
        resultText += text
        return void (await M.reply(resultText, 'text', undefined, undefined, undefined, users))
    }
}
