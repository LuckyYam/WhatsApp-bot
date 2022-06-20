import { Command, BaseCommand, Message } from '../../Structures'
import { IArgs } from '../../Types'
import { Reaction, Reactions, reaction } from '../../lib'

const reactions = Object.keys(Reactions)

@Command('react', {
    description: 'React!',
    category: 'fun',
    cooldown: 10,
    exp: 20,
    usage: 'react [reaction] [tag/quote user] || [reaction] [tag/quote user]',
    aliases: ['r', ...reactions]
})
export default class extends BaseCommand {
    public override execute = async (M: Message, { context }: IArgs): Promise<void> => {
        const command = M.content.split(' ')[0].toLowerCase().slice(this.helper.config.prefix.length).trim()
        let flag = true
        if (command === 'r' || command === 'react') flag = false
        if (!flag && !context)
            return void M.reply(
                `💫 *Available Reactions:*\n\n- ${reactions
                    .map((reaction) => this.helper.utils.capitalize(reaction))
                    .join('\n- ')}`
            )
        const reaction = (flag ? command : context.split(' ')[0].trim().toLowerCase()) as reaction
        if (!flag && !reactions.includes(reaction))
            return void M.reply(
                `Invalid reaction. Use *${this.helper.config.prefix}react* to see all of the available reactions`
            )
        const users = M.mentioned
        if (M.quoted && !users.includes(M.quoted.sender.jid)) users.push(M.quoted.sender.jid)
        while (users.length < 1) users.push(M.sender.jid)
        const reactant = users[0]
        const single = reactant === M.sender.jid
        const { url, words } = await new Reaction().getReaction(reaction, single)
        return void (await M.reply(
            await this.helper.utils.gifToMp4(await this.helper.utils.getBuffer(url)),
            'video',
            true,
            undefined,
            `*@${M.sender.jid.split('@')[0]} ${words} ${single ? 'Themselves' : `@${reactant.split('@')[0]}`}*`,
            [M.sender.jid, reactant]
        ))
    }
}
