const { Character } = require('@shineiichijo/marika')
const Command = require('../../Structures/Command')
const Message = require('../../Structures/Message')

module.exports = class command extends Command {
    constructor() {
        super('character', {
            description: 'Searches a character of the given query in MyAnimeList',
            usage: 'character [query]',
            category: 'weeb',
            aliases: ['chara'],
            exp: 20,
            cooldown: 15
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
        await new Character()
            .searchCharacter(query)
            .then(async ({ data }) => {
                const chara = data[0]
                /**@type {string} */
                let source
                await new Character()
                    .getCharacterAnime(chara.mal_id)
                    .then((res) => (source = res.data[0].anime.title))
                    .catch(async () => {
                        await new Character()
                            .getCharacterManga(chara.mal_id)
                            .then((res) => (source = res.data[0].manga.title))
                            .catch(() => (source = ''))
                    })
                let text = `💙 *Name:* ${chara.name}\n`
                if (chara.nicknames.length > 0) text += `💚 *Nicknames:* ${chara.nicknames.join(', ')}\n`
                text += `💛 *Source:* ${source}`
                if (chara.about !== null) text += `\n\n❤ *Description:* ${chara.about}`
                const image = await this.helper.utils.getBuffer(chara.images.jpg.image_url)
                return void (await this.client.sendMessage(
                    M.from,
                    {
                        image,
                        caption: text,
                        contextInfo: {
                            externalAdReply: {
                                title: chara.name,
                                mediaType: 1,
                                thumbnail: image,
                                sourceUrl: chara.url
                            }
                        }
                    },
                    {
                        quoted: M.message
                    }
                ))
            })
            .catch(() => {
                return void M.reply(`No character found | *"${query}"*`)
            })
    }
}
