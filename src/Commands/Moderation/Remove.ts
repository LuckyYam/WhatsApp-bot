import { BaseCommand, Command, Message } from '../../Structures'

@Command('remove', {
    description: 'Removes an user',
    category: 'moderation',
    usage: 'remove <tag/mention a user>',
    aliases: ['bye'],
    exp: 10,
    dm: false
})

export default class extends BaseCommand {
    public override execute = async (M: Message): Promise<void> => {
        const users = M.mentioned
        if (M.quoted && !users.includes(M.quoted.sender.jid)) users.push(M.quoted.sender.jid)
        while (users.length < 1) return void (await M.reply('Tag/mention whom you want to remove'))
      const weeb = users[0]
      const jid = M.from
      if (weeb === this.client.user?.id) return void (await M.reply('I can\'t promote myself'))
      await this.client.groupParticipantsUpdate(
      jid, [weeb], "remove"
      )
       M.reply('🛑Successfully removed')
    }
}
