const { Anime } = require('@shineiichijo/marika')
const Command = require('../../Structures/Command')
const Message = require('../../Structures/Message')

module.exports = class command extends Command {
    constructor() {
        super('anime', {
            description: 'Searches an anime of the given query in MyAnimeList',
            aliases: ['ani'],
            category: 'weeb',
            usage: 'anime [query]',
            exp: 20,
            cooldown: 20
        })
    }

    /**
     * @param {Message} M
     * @param {import('../../Handlers/Message').args} args
     * @returns {Promise<void>}
     */

    execute = async (M, args) => {
        const { context } = args
        if (!context) return void M.reply('Provide a query for the search, Baka!')
        const query = context.trim()
        await new Anime()
            .searchAnime(query)
            .then(async ({ data }) => {
                const result = data[0]
                let text = ''
                text += `🎀 *Title:* ${result.title}\n`
                text += `🎋 *Format:* ${result.type}\n`
                text += `📈 *Status:* ${this.helper.utils.capitalize(result.status.replace(/\_/g, ' '))}\n`
                text += `🍥 *Total episodes:* ${result.episodes}\n`
                text += `🎈 *Duration:* ${result.duration}\n`
                text += `🧧 *Genres:* ${result.genres.map((genre) => genre.name).join(', ')}\n`
                text += `✨ *Based on:* ${this.helper.utils.capitalize(result.source)}\n`
                text += `📍 *Studios:* ${result.studios.map((studio) => studio.name).join(', ')}\n`
                text += `🎴 *Producers:* ${result.producers.map((producer) => producer.name).join(', ')}\n`
                text += `💫 *Premiered on:* ${result.aired.from}\n`
                text += `🎗 *Ended on:* ${result.aired.to}\n`
                text += `🎐 *Popularity:* ${result.popularity}\n`
                text += `🎏 *Favorites:* ${result.favorites}\n`
                text += `🎇 *Rating:* ${result.rating}\n`
                text += `🏅 *Rank:* ${result.rank}\n\n`
                if (result.background !== null) text += `🎆 *Background:* ${result.background}*\n\n`
                text += `❄ *Description:* ${result.synopsis}`
                const image = await this.helper.utils.getBuffer(result.images.jpg.large_image_url)
                return void (await this.client.sendMessage(
                    M.from,
                    {
                        image,
                        caption: text,
                        contextInfo: {
                            externalAdReply: {
                                title: result.title,
                                mediaType: 1,
                                thumbnail: image,
                                sourceUrl: result.url
                            }
                        }
                    },
                    {
                        quoted: M.message
                    }
                ))
            })
            .catch(() => {
                return void M.reply(`Couldn't find any anime | *"${query}"*`)
            })
    }
}
