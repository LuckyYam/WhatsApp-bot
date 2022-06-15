const Command = require('../../Structures/Command')
const Message = require('../../Structures/Message')

module.exports = class command extends Command {
    constructor() {
        super('help', {
            description: "Displays the bot's usable commands",
            category: 'general',
            exp: 20,
            usage: 'help || help <option_number>',
            aliases: ['h']
        })
    }

    /**
     * @param {Message} M
     * @returns {Promise<void>}
     */

    execute = async (M) => {
        const categories = []
        const commands = Array.from(this.handler.commands, ([command, data]) => ({
            command,
            data
        })).filter((command) => command.data.config.category !== 'dev')
        for (const { data } of commands) {
            if (categories.includes(data.config.category)) continue
            categories.push(data.config.category)
        }
        if (M.numbers.length < 1) {
            let text = `👋🏻 (💙ω💙) Konichiwa! *@${M.sender.jid.split('@')[0]}*, I'm ${
                this.helper.config.name
            }.\n\nMy prefix is - "${this.helper.config.prefix}".\n\n📕 *Note:* Use *${
                this.helper.config.prefix
            }help <index_number>* to see all of the commands in the category.\n\n🎗 *Example:* ${
                this.helper.config.prefix
            }help 1\n\n❓ *Categories: ${categories.length}*\n\n📚 *Total Commands: ${
                commands.length
            }*\n\n*━━❰ Categories ❱━━*`
            const sections = []
            categories.forEach((category, index) => {
                const rows = []
                rows.push({
                    title: `${this.helper.config.prefix}help ${index + 1}`,
                    rowId: `${this.helper.config.prefix}help ${index + 1}`
                })
                sections.push({
                    title: `${this.helper.utils.capitalize(category)}`,
                    rows
                })
                text += `\n\n🧧 *Category:* ${this.helper.utils.capitalize(category)} ${
                    this.emojis[index]
                }\n🔖 *Index:* ${index + 1}\n🔗 *Commands:* ${
                    commands.filter((command) => command.data.config.category === category).length
                }`
            })
            return void (await this.client.sendMessage(
                M.from,
                {
                    text,
                    footer: `🌟 ${this.helper.config.name} 🌟`,
                    buttonText: 'Categories',
                    sections,
                    mentions: [M.sender.jid]
                },
                {
                    quoted: M.message
                }
            ))
        }
        const index = M.numbers[0]
        if (index > categories.length || index < 1) return void M.reply('Invalid index number')
        let text = `${this.emojis[index - 1]} *${this.helper.utils.capitalize(categories[index - 1])}* ${
            this.emojis[index - 1]
        }`
        const filteredCommands = commands.filter((command) => command.data.config.category === categories[index - 1])
        filteredCommands.forEach(
            (command) =>
                (text += `\n\n*❯ Command:* ${this.helper.utils.capitalize(command.data.name)}\n❯ *Aliases:* ${
                    command.data.config.aliases
                        ? command.data.config.aliases.map((alias) => this.helper.utils.capitalize(alias)).join(', ')
                        : ''
                }\n*❯ Category:* ${this.helper.utils.capitalize(
                    command.data.config.category
                )}\n*❯ Usage:* ${command.data.config.usage
                    .split('||')
                    .map((usage) => `${this.helper.config.prefix}${usage.trim()}`)
                    .join(' | ')}\n*❯ Description:* ${command.data.config.description}`)
        )
        return void M.reply(text)
    }

    /**
     * @private
     * @type {string[]}
     */

    emojis = ['🍀']
}
