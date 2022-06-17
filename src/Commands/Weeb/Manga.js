const { Manga } = require('@shineiichijo/marika')
const Command = require('../../Structures/Command')
const Message = require('../../Structures/Message')

module.exports = class command extends Command {
    constructor() {
        super('manga', {
            description: 'Searches a manga of the given query in MyAnimeList',
            category: 'weeb',
            exp: 10,
            usage: 'manga [query]',
            cooldown: 20
        })
    }

    /**
     * @param {Message} M
     * @param {import('../../Handlers/Message').args} args
     */

    execute = async (M, args) => {
        const { context } = args
        if (!context) return void M.reply('Provide a query for the search, Baka!')
        const query = context.trim()
        await new Manga()
            .searchManga(query)
            .then(async ({ data }) => {
                const result = data[0]
                let text = ''
                text += `🎀 *Title:* ${result.title}\n`
                text += `🎋 *Format:* ${result.type}\n`
                text += `📈 *Status:* ${this.helper.utils.capitalize(result.status.replace(/\_/g, ' '))}\n`
                text += `🍥 *Total chapters:* ${result.chapters}\n`
                text += `🎈 *Total volumes:* ${result.volumes}\n`
                text += `🧧 *Genres:* ${result.genres.map((genre) => genre.name).join(', ')}\n`
                text += `💫 *Published on:* ${result.published.from}\n`
                text += `🎗 *Ended on:* ${result.published.to}\n`
                text += `🎐 *Popularity:* ${result.popularity}\n`
                text += `🎏 *Favorites:* ${result.favorites}\n`
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
                return void M.reply(`No manga found | *"${query}"*`)
            })
    }
}
