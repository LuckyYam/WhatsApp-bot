import { join } from 'path'
import { readdirSync } from 'fs-extra'
import chalk from 'chalk'
import { Message, Helper, BaseCommand } from '../Structures'
import { getStats } from '../lib'
import { client, ICommand, IArgs } from '../Types'

export class MessageHandler {
    constructor(private client: client, private helper: Helper) {}

    public handleMessage = async (M: Message): Promise<void> => {
        const { prefix } = this.helper.config
        const args = M.content.split(' ')
        let title = 'DM'
        if (M.chat === 'group')
            await this.client
                .groupMetadata(M.from)
                .then(({ subject }) => (title = subject))
                .catch(() => (title = 'Group'))
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
        const { banned, tag } = await this.helper.DB.getUser(M.sender.jid)
        if (banned) return void M.reply('You are banned from using commands')
        if (!tag)
            await this.helper.DB.updateUser(M.sender.jid, 'tag', 'set', this.helper.utils.generateRandomUniqueTag())
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
            const remainingTime = this.helper.utils.convertMs((cd as number) - Date.now())
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
            this.helper.log((error as any).message, true)
        }
    }

    private formatArgs = (args: string[]): IArgs => {
        args.splice(0, 1)
        return {
            args,
            context: args.join(' ').trim(),
            flags: args.filter((arg) => arg.startsWith('--'))
        }
    }

    public loadCommands = (): void => {
        this.helper.log('Loading Commands...')
        const files = readdirSync(join(...this.path)).filter((file) => !file.startsWith('_'))
        for (const file of files) {
            this.path.push(file)
            const Commands = readdirSync(join(...this.path))
            for (const Command of Commands) {
                this.path.push(Command)
                const command: BaseCommand = new (require(join(...this.path)).default)()
                command.client = this.client
                command.helper = this.helper
                command.handler = this
                this.commands.set(command.name, command)
                if (command.config.aliases) command.config.aliases.forEach((alias) => this.aliases.set(alias, command))
                this.helper.log(
                    `Loaded: ${chalk.yellowBright(command.name)} from ${chalk.cyanBright(command.config.category)}`
                )
                this.path.splice(this.path.indexOf(Command), 1)
            }
            this.path.splice(this.path.indexOf(file), 1)
        }
        return this.helper.log(
            `Successfully loaded ${chalk.cyanBright(this.commands.size)} ${
                this.commands.size > 1 ? 'commands' : 'command'
            } with ${chalk.yellowBright(this.aliases.size)} ${this.aliases.size > 1 ? 'aliases' : 'alias'}`
        )
    }

    private handleUserStats = async (M: Message): Promise<void> => {
        const { experience, level } = await this.helper.DB.getUser(M.sender.jid)
        const { requiredXpToLevelUp } = getStats(level)
        if (requiredXpToLevelUp > experience) return void null
        await this.helper.DB.updateUser(M.sender.jid, 'level', 'inc', 1)
    }

    public isAdmin = async (options: { group: string; jid: string }): Promise<boolean> => {
        const data = (await this.client.groupMetadata(options.group)).participants
        const index = data.findIndex((x) => x.id === options.jid)
        if (index < -1) return false
        const admin = !data[index] || !data[index].admin || data[index].admin !== null
        return admin
    }

    public commands = new Map<string, ICommand>()

    public aliases = new Map<string, ICommand>()

    private cooldowns = new Map<string, number>()

    private path = [__dirname, '..', 'Commands']
}
