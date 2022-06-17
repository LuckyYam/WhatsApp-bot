const Command = require('../../Structures/Command')
const Message = require('../../Structures/Message')
const {Sticker, createSticker, StickerTypes} = require('wa-sticker-formatter')

module.exports = class command extends Command {
    constructor() {
        super('emoji', {
            description: 'Will send you a given emoji into sticker.',
            category: 'utils',
            usage: 'emoji 😗',
            aliases: ['emoj','ejs'],
            exp: 20
        })
    }

    /**
     * @param {Message} M
     * @returns {Promise<void>}
     */

    execute = async (M, { context }) => {
    const code = context.trim()
    
    let ent = `${code}`
    let hex = ent.codePointAt(0).toString(16)
    let emo = String.fromCodePoint("0x"+hex);

  if (!context)
        return void M.reply('Provide the Emoji you want as sticker, Baka!')

  try {
    const b = await this.helper.utils.getBuffer(`https://emojiapi.dev/api/v1/${hex}/512.webp`)
    
 let sticker = new Sticker(b, {
    pack: "Emoji Sticker By",
    author: "${this.helper.config.name} 🌟",
    type: StickerTypes.FULL, 
    categories: ['🤩', '🎉'],
    id: '12345', 
    quality: 50, 
    background: 'transparent'
    })

    const buffer = await sticker.toBuffer()
    await M.reply(buffer, 'sticker');

} catch(err) {
    console.log(`Emoji Error Occurred`);
    return void (await M.reply(`*Invalid Input, Baka!*`));
             }
}}
