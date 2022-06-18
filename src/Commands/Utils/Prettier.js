const { format } = require('prettier')
const Command = require('../../Structures/Command')
const Message = require('../../Structures/Message')

const supportedLang = ['json', 'ts', 'js', 'css', 'md', 'yaml', 'html']

module.exports = class command extends Command {
    constructor() {
        super('prettier', {
            description: 'Runs prettier of the given code',
            category: 'utils',
            cooldown: 10,
            exp: 35,
            usage: `prettier [provide the code/quote the message containing the code] --lang=[${supportedLang.join(
                '/'
            )}] [options]`,
            aliases: ['format']
        })
    }

    /**
     * @param {Message} M
     * @param {import('../../Handlers/Message').args} args
     * @returns {Promise<void>}
     */

    execute = async (M, args) => {
        args.flags.forEach((flag) => (args.context = args.context.replace(flag, '')))
        const { context, flags } = args
        if (!context && (!M.quoted || M.quoted.content === ''))
            return void M.reply(
                `Provide or quote a message containing the code that you want to run prettier along with the language and options. Example: *${this.helper.config.prefix}prettier --lang=ts --no-semi --single-quote *[quotes a message containing the code]**`
            )
        const langFlag = flags.filter((flag) => flag.startsWith('--lang=') || flag.startsWith('--language='))[0]
        let lang = 'js'
        if (langFlag) lang = langFlag.split('=')[1]
        const parser = this.getParserFromLanguage(lang)
        try {
            const formattedCode = format(context || M.quoted.content, {
                parser,
                semi: !flags.includes('--no-semi'),
                singleQuote: flags.includes('--single-quote')
            })
            return void (await M.reply(`\`\`\`${formattedCode}\`\`\``))
        } catch (error) {
            await M.reply(`${error.message}`)
            return void (await M.reply(
                `If the code's not wrong, try changing the languages to: \`\`\`${supportedLang.join(', ')}\`\`\``
            ))
        }
    }

    /**
     * @private
     * @param {string} lang
     * @returns {parser}
     */

    getParserFromLanguage = (lang) => {
        /**@type {parser} */
        let parser
        switch (lang.toLowerCase().trim()) {
            default:
            case 'js':
            case 'javascript':
                parser = 'babel'
                break
            case 'css':
                parser = 'css'
                break
            case 'html':
                parser = 'html'
                break
            case 'json':
                parser = 'json'
                break
            case 'ts':
            case 'typescript':
                parser = 'babel-ts'
                break
            case 'md':
            case 'markdown':
                parser = 'markdown'
                break
            case 'yaml':
                parser = 'markdown'
                break
        }
        return parser
    }
}

/**
 * @typedef {import('prettier').LiteralUnion<import('prettier').BuiltInParserName, string>} parser
 */
