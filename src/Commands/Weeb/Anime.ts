import { Anime } from '@shineiichijo/marika'
import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs } from '../../Types'

@Command('anime', {
    description: 'Searches an anime of the given query in MyAnimeList',
    aliases: ['ani'],
    category: 'weeb',
    usage: 'anime [query]',
    exp: 20,
    cooldown: 20
})
export default class extends BaseCommand {
    public override execute = async (M: Message, { context }: IArgs): Promise<void> => {
        if (!context) return void M.reply('Provide a query for the search, Baka!')
        const query = context.trim()
        await new Anime()
            .searchAnime(query)
            .then(async ({ data }) => {
                const result = data[0]
                let text = `š *Title:* ${result.title}\nš *Format:* ${
                    result.type
                }\nš *Status:* ${this.client.utils.capitalize(
                    result.status.toLowerCase().replace(/\_/g, ' ')
                )}\nš„ *Total episodes:* ${result.episodes}\nš *Duration:* ${
                    result.duration
                }\nš§§ *Genres:* ${result.genres
                    .map((genre) => genre.name)
                    .join(', ')}\nāØ *Based on:* ${this.client.utils.capitalize(
                    result.source.toLowerCase()
                )}\nš *Studios:* ${result.studios
                    .map((studio) => studio.name)
                    .join(', ')}\nš“ *Producers:* ${result.producers
                    .map((producer) => producer.name)
                    .join(', ')}\nš« *Premiered on:* ${result.aired.from}\nš *Ended on:* ${
                    result.aired.to
                }\nš *Popularity:* ${result.popularity}\nš *Favorites:* ${result.favorites}\nš *Rating:* ${
                    result.rating
                }\nš *Rank:* ${result.rank}\n\n`
                if (result.background !== null) text += `š *Background:* ${result.background}*\n\n`
                text += `ā *Description:* ${result.synopsis}`
                const image = await this.client.utils.getBuffer(result.images.jpg.large_image_url)
                return void (await M.reply(image, 'image', undefined, undefined, text, undefined, {
                    title: result.title,
                    mediaType: 1,
                    thumbnail: image,
                    sourceUrl: result.url
                }))
            })
            .catch(() => {
                return void M.reply(`Couldn't find any anime | *"${query}"*`)
            })
    }
}
