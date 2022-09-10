import { BaseCommand, Command, Message } from '../../Structures'

@Command('delete', {
    description: 'Deletes bot\'s messages',
    category: 'moderation',
    usage: 'delete (reply to the message that has to be deleted)',
    aliases: ['del'],
    cooldown: 5,
    dm: false
})
export default class extends BaseCommand {
    public override execute = async (M: Message, args: IArgs): Promise<void> => {
         if(!M.quoted) return void (await M.reply('Tag the message you want to delete'))
         if(!M.quoted.key.fromMe) return void (await M.reply('Well I can\'t delete other\'s messages'))
         this.client.sendMessage(M.from, {delete: M.quoted.key})
    }
}
