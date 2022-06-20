import chalk from 'chalk'
import { Helper } from '../Structures'
import { client, ICall } from '../Types'

export class CallHandler {
    constructor(private client: client, private helper: Helper) {}

    public handleCall = async (call: ICall): Promise<void> => {
        if (call.content[1].tag !== 'offer') return void null
        const caller = call.content[1].attrs['call-creator']
        const { username } = this.helper.contact.getContact(caller)
        this.helper.log(`${chalk.cyanBright('Call')} from ${chalk.blueBright(username)}`)
        await this.client.sendMessage(caller, { text: 'You are now banned' })
        await this.helper.DB.updateBanStatus(caller)
        return void (await this.client.updateBlockStatus(caller, 'block'))
    }
}
