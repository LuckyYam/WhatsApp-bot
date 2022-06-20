import { BaseCommand, Command, Message } from '../Structures'
import { IArgs } from '../Types'

@Command('command_name', {
    description: 'Description of the command',
    category: 'category',
    usage: 'example on using the command',
    cooldown: 5,
    exp: 10,
    dm: false
})
export default class extends BaseCommand {
    public override execute = async (M: Message, args: IArgs): Promise<void> => {
        //do something
    }
}
