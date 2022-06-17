const Command = require('../../Structures/Command')
const Message = require('../../Structures/Message')
const { Stats } = require('../../lib')

module.exports = class command extends Command {
    constructor() {
        super('profile', {
            description: "Displays user's profile",
            category: 'general',
            usage: 'profile || profile [tag/quote user]',
            exp: 25,
            aliases: ['p'],
            cooldown: 15
        })
    }

    /**
     * @param {Message} M
     * @returns {Promise<void>}
     */

    execute = async (M) => {
        const users = M.mentioned
        if (M.quoted && !users.includes(M.quoted.sender.jid)) users.push(M.quoted.sender.jid)
        while (users.length < 1) users.push(M.sender.jid)
        const user = users[0]
        const username = user === M.sender.jid ? M.sender.username : this.helper.contact.getContact(user).username
        let pfp
        try {
            pfp = await this.helper.utils.getBuffer(await this.client.profilePictureUrl(user, 'image'))
        } catch {
            pfp = this.helper.assets.get('404')
        }
        let bio
        try {
            bio = (await this.client.fetchStatus(user)).status
        } catch (error) {
            bio = ''
        }
        const { ban, experience, level, tag } = await this.helper.DB.getUser(user)
        const admin = this.helper.utils.capitalize(`${await this.handler.isAdmin({ group: M.from, jid: user })}`)
        const { rank } = Stats.getStats(level)
        return void M.reply(
            pfp,
            'image',
            undefined,
            undefined,
            `🏮 *Username:* ${username}#${tag}\n\n🎫 *Bio:* ${bio}\n\n🌟 *Experience:* ${experience}\n\n🥇 *Rank:* ${rank}\n\n🍀 *Level:* ${level}\n\n👑 *Admin:* ${admin}\n\n🟥 *Banned:* ${this.helper.utils.capitalize(
                `${ban || false}`
            )}`
        )
    }
}
