const { Rank } = require('canvacord')
const Message = require('../../Structures/Message')
const Command = require('../../Structures/Command')
const { Stats } = require('../../lib')

module.exports = class command extends Command {
    constructor() {
        super('rank', {
            description: "Displays user's rank",
            category: 'general',
            aliases: ['card'],
            usage: 'rank [tag/quote users]',
            exp: 25,
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
        const { experience, level, tag } = await this.helper.DB.getUser(user)
        const { requiredXpToLevelUp, rank } = Stats.getStats(level)
        const card = await new Rank()
            .setAvatar(pfp)
            .setLevel(1, '', false)
            .setCurrentXP(experience)
            .setRequiredXP(requiredXpToLevelUp)
            .setProgressBar(this.helper.utils.generateRandomHex())
            .setDiscriminator(tag, this.helper.utils.generateRandomHex())
            .setUsername(username, this.helper.utils.generateRandomHex())
            .setBackground('COLOR', this.helper.utils.generateRandomHex())
            .setRank(1, '', false)
            .renderEmojis(true)
            .build()
        return void (await M.reply(
            card,
            'image',
            undefined,
            undefined,
            `🏮 *Username:* ${username}#${tag}\n\n🌟 *Experience: ${experience} / ${requiredXpToLevelUp}*\n\n🥇 *Rank:* ${rank}\n\n🍀 *Level:* ${level}`
        ))
    }
}
