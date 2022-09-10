import { BaseCommand, Command, Message } from '../../Structures'

@Command('promote', {
    description: 'Promotes an user',
    category: 'moderation',
    usage: 'promote <tag/mantion user>',
    cooldown: 5,
    dm: false
})

export default class extends BaseCommand {
    public override execute = async (M: Message): Promise<void> => {
        const users = M.mentioned
        if (M.quoted && !users.includes(M.quoted.sender.jid)) users.push(M.quoted.sender.jid)
        while (users.length < 1) return void (await M.reply('Tag/mention a user to promote'))
         const weeb = users[0]
         if (weeb === this.client.user?.id) return void (await M.reply('I can\'t promote myself'))
      await this.client.groupParticipantsUpdate(
      M.from, [weeb],"promote" 
      )
       M.reply('🌟Successfully promoted')
    }
}
