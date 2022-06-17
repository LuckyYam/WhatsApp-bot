const { join } = require('path')
const { readdirSync } = require('fs-extra')
const chalk = require('chalk')
const Message = require('../Structures/Message')
const Helper = require('../Structures/Helper')
const Command = require('../Structures/Command')
const { Stats } = require('../lib')

module.exports = class MessageHandler {
    /**
     * @param {client} client
     * @param {Helper} helper
     */
    constructor(client, helper) {
        /**
         * @type {client}
         */
        this.client = client
        /**
         * @type {Helper}
         */
        this.helper = helper
    }

    /**
     * @param {Message} M
     * @returns {Promise<void>}
     */

    handleMessage = async (M) => {
        const { prefix } = this.helper.config
        const args = M.content.split(' ')
        let title = 'DM'
        if (M.chat === 'group') {
            try {
                const { subject } = await this.client.groupMetadata(M.from)
                title = subject || 'Group'
            } catch (error) {
                title = 'Group'
            }
        }
        if (!args[0] || !args[0].startsWith(prefix))
            return void this.helper.log(
                `${chalk.cyanBright('Message')} from ${chalk.yellowBright(M.sender.username)} in ${chalk.blueBright(
                    title
                )}`
            )
        this.helper.log(
            `${chalk.cyanBright(`Command ${args[0]}[${args.length - 1}]`)} from ${chalk.yellowBright(
                M.sender.username
            )} in ${chalk.blueBright(title)}`
        )
        const { ban, tag } = await this.helper.DB.getUser(M.sender.jid)
        if (ban) return void M.reply('You are banned from using commands')
        if (!tag)
            await this.helper.DB.user.updateOne(
                { jid: M.sender.jid },
                { $set: { tag: this.helper.utils.generateRandomUniqueTag(4) } }
            )
        const cmd = args[0].toLowerCase().slice(prefix.length)
        const command = this.commands.get(cmd) || this.aliases.get(cmd)
        if (!command) return void M.reply('No such command, Baka!')
        const disabledCommands = await this.helper.DB.getDisabledCommands()
        const index = disabledCommands.findIndex((CMD) => CMD.command === command.name)
        if (index >= 0)
            return void M.reply(
                `*${this.helper.utils.capitalize(cmd)}* is currently disabled by *${
                    disabledCommands[index].disabledBy
                }* in *${disabledCommands[index].time} (GMT)*. ❓ *Reason:* ${disabledCommands[index].reason}`
            )
        if (command.config.category === 'dev' && !this.helper.config.mods.includes(M.sender.jid))
            return void M.reply('This command can only be used by the MODS')
        if (M.chat === 'dm' && !command.config.dm) return void M.reply('This command can only be used in groups')
        const cooldownAmount = (command.config.cooldown ?? 3) * 1000
        const time = cooldownAmount + Date.now()
        if (this.cooldowns.has(`${M.sender.jid}${command.name}`)) {
            const cd = this.cooldowns.get(`${M.sender.jid}${command.name}`)
            const remainingTime = this.helper.utils.convertMs(cd - Date.now())
            return void M.reply(
                `You are on a cooldown. Wait *${remainingTime}* ${
                    remainingTime > 1 ? 'seconds' : 'second'
                } before using this command again`
            )
        } else this.cooldowns.set(`${M.sender.jid}${command.name}`, time)
        setTimeout(() => this.cooldowns.delete(`${M.sender.jid}${command.name}`), cooldownAmount)
        await this.helper.DB.setExp(M.sender.jid, command.config.exp || 10)
        await this.handleUserStats(M)
        try {
            await command.execute(M, this.formatArgs(args))
        } catch (error) {
            this.helper.log(error.message, true)
        }
    }

    /**
     * @returns {void}
     */

    loadCommands = () => {
        this.helper.log('Loading Commands...')
        const files = readdirSync(join(__dirname, '..', 'Commands')).filter((file) => !file.endsWith('___.js'))
        for (const file of files) {
            const Commands = readdirSync(join(__dirname, '..', 'Commands', file))
            for (const Command of Commands) {
                /**
                 * @constant
                 * @type {Command}
                 */
                const command = new (require(`../Commands/${file}/${Command}`))()
                command.client = this.client
                command.helper = this.helper
                command.handler = this
                this.commands.set(command.name, command)
                if (command.config.aliases) command.config.aliases.forEach((alias) => this.aliases.set(alias, command))
                this.helper.log(
                    `Loaded: ${chalk.yellowBright(command.name)} from ${chalk.cyanBright(command.config.category)}`
                )
            }
        }
        return this.helper.log(
            `Successfully loaded ${chalk.cyanBright(this.commands.size)} ${
                this.commands.size > 1 ? 'commands' : 'command'
            } with ${chalk.yellowBright(this.aliases.size)} ${this.aliases.size > 1 ? 'aliases' : 'alias'}`
        )
    }

    /**
     * @private
     * @param {string[]} args
     * @returns {args}
     */

    formatArgs = (args) => {
        args.splice(0, 1)
        return {
            args,
            context: args.join(' ').trim(),
            flags: args.filter((arg) => arg.startsWith('--'))
        }
    }

    /**
     * @private
     * @param {Message} M
     * @returns {Promise<void>}
     */

    handleUserStats = async (M) => {
        const { experience, level } = await this.helper.DB.getUser(M.sender.jid)
        const { requiredXpToLevelUp } = Stats.getStats(level)
        if (requiredXpToLevelUp > experience) return void null
        await this.helper.DB.user.updateOne({ jid: M.sender.jid }, { $inc: { level: 1 } })
    }

    /**
     * @type {Map<string, Command>}
     */

    commands = new Map()

    /**
     * @type {Map<string, Command>}
     */

    aliases = new Map()

    /**
     * @type {Map<string, number>}
     */

    cooldowns = new Map()

    /**
     * @param {{group: string, jid: string}} options
     * @returns {Promise<boolean>}
     */

    isAdmin = async (options) => {
        const data = (await this.client.groupMetadata(options.group)).participants
        const index = data.findIndex((x) => x.id === options.jid)
        if (index < -1) return false
        const admin = !data[index] || !data[index].admin || data[index].admin === null ? false : true
        return admin
    }
}

/**
 * @typedef {import('../Structures/Command').client} client
 */

/**
 * @typedef {import('../Structures/Command').config} config
 */

/**
 * @typedef {{context: string, args: string, flags: string[]}} args
 */
