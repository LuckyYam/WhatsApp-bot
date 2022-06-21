import { Command, BaseCommand, Message } from '../../Structures'

@Command('waifu', {
    description: 'Sends a random waifu image',
    category: 'weeb',
    usage: 'waifu',
    exp: 10,
    cooldown: 5
})
export default class extends BaseCommand {
    public override execute = async ({ reply }: Message): Promise<void> => {
        const { images } = await this.client.utils.fetch<{ images: { url: string }[] }>(
            'https://api.waifu.im/random/?selected_tags=waifu'
        )
        return void (await reply(await this.client.utils.getBuffer(images[0].url), 'image'))
    }
}
