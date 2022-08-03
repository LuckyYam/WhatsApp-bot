import { NHentai } from '@shineiichijo/nhentai-ts'
import { delay, proto } from '@adiwajshing/baileys'
import { Command, BaseCommand, Message } from '../../Structures'
import { IArgs } from '../../Types'

@Command('nhentai', {
    description: 'Search or download a doujin from nhentai',
    cooldown: 15,
    exp: 40,
    category: 'nsfw',
    aliases: ['doujin', 'doujinshi'],
    usage: 'nhentai [query]'
})
export default class command extends BaseCommand {
    public override execute = async (M: Message, args: IArgs): Promise<void> => {
        args.flags.forEach((flag) => (args.context = args.context.replace(flag, '')))
        args.flags = args.flags.filter(
            (flag) =>
                flag.startsWith('--type=') ||
                flag.startsWith('--get=') ||
                flag.startsWith('--id=') ||
                flag.startsWith('--page=')
        )
        const options = this.getOptions(args.flags)
        const nhentai = new NHentai()
        switch (options.type) {
            case 'search':
                return await this.handleSearch(M, args, options, nhentai)
            case 'get':
                return await this.handleDownload(M, options, nhentai)
        }
    }

    private handleSearch = async (
        M: Message,
        { context }: IArgs,
        { page }: TOption,
        nhentai: NHentai
    ): Promise<void> => {
        if (!context) return void M.reply('Provide a query for the search')
        return await nhentai
            .search(context.trim(), { page })
            .then(async ({ data, pagination }) => {
                const sections: proto.ISection[] = []
                const paginationRows: proto.IRow[] = []
                if (pagination.currentPage > 1)
                    paginationRows.push({
                        title: 'Previous Page',
                        rowId: `${this.client.config.prefix}nhentai ${context.trim()} --type=search --page=${
                            pagination.currentPage - 1
                        }`,
                        description: 'Returns to the previous page of the search'
                    })
                if (pagination.hasNextPage)
                    paginationRows.push({
                        title: 'Next Page',
                        rowId: `${this.client.config.prefix}nhentai ${context.trim()} --type=search --page=${
                            pagination.currentPage + 1
                        }`,
                        description: 'Goes to the next page of the search'
                    })
                if (paginationRows.length) sections.push({ title: 'Pagination', rows: paginationRows })
                let text = ''
                data.forEach((content, i) => {
                    const rows: proto.IRow[] = []
                    rows.push(
                        {
                            title: 'Get PDF',
                            rowId: `${this.client.config.prefix}nhentai --type=get --id=${content.id} --get=pdf`
                        },
                        {
                            title: 'Get ZIP',
                            rowId: `${this.client.config.prefix}nhentai --type=get --id=${content.id} --get=zip`
                        }
                    )
                    text += `${i === 0 ? '' : '\n\n'}*#${i + 1}*\n📕 *Title:* ${
                        content.title
                    }\n🌐 *URL: ${content.url.replace('to', 'net')}*`
                    sections.push({ title: content.title, rows })
                })
                return void (await M.reply(
                    text,
                    'text',
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    {
                        sections,
                        buttonText: 'Search Results'
                    }
                ))
            })
            .catch(async () => void (await M.reply(`Couldn't find any doujin | *"${context.trim()}"*`)))
    }

    private handleDownload = async (M: Message, { id, output }: TOption, nhentai: NHentai): Promise<void> => {
        if (id === '') return void M.reply('Provide the id of the doujin that you want to download')
        if (output === '') output = 'pdf'
        const valid = await nhentai.validate(id)
        if (!valid) return void M.reply(`Invaid Doujin ID | *"${id}"*`)
        await delay(1500)
        return await nhentai
            .getDoujin(id)
            .then(async (res) => {
                const { title, originalTitle, cover, url, tags, images, artists } = res
                const thumbnail = await this.client.utils.getBuffer(cover || 'https://i.imgur.com/uLAimaY.png')
                await M.reply(
                    thumbnail,
                    'image',
                    undefined,
                    undefined,
                    `📕 *Title:* ${title} *(${originalTitle})*\n✍ *Artists:* ${artists}\n🔖 *Tags:* ${tags
                        .map(this.client.utils.capitalize)
                        .join(', ')}\n📚 *Pages:* ${images.pages.length}`,
                    undefined,
                    {
                        title,
                        body: originalTitle,
                        thumbnail,
                        mediaType: 1,
                        sourceUrl: url.replace('to', 'net')
                    }
                )
                const buffer = await images[output === 'zip' ? 'zip' : 'PDF']()
                return void (await M.reply(
                    buffer,
                    'document',
                    undefined,
                    `application/${output}`,
                    undefined,
                    undefined,
                    undefined,
                    thumbnail,
                    `${title}.${output}`
                ))
            })
            .catch(async () => void (await M.reply(`*Try Again!*`)))
    }

    private getOptions = (
        flags: string[]
    ): { type: 'search' | 'get'; page: number; id: string; output: '' | 'pdf' | 'zip' } => {
        return {
            type: this.getType(flags),
            page: this.getPage(flags),
            id: this.getID(flags),
            output: this.getOutput(flags)
        }
    }
    private getType = (flags: string[]): 'search' | 'get' => {
        const index = this.getIndex(flags, '--type=')
        if (index < 0 || !['search', 'get'].includes(flags[index].split('=')[1].toLowerCase())) return 'search'
        return flags[index].split('=')[1].toLowerCase() as 'search' | 'get'
    }

    private getPage = (flags: string[]): number => {
        const index = this.getIndex(flags, '--page=')
        if (
            index < 0 ||
            isNaN(Number(flags[index].split('--page=')[1])) ||
            Number(flags[index].split('--page=')[1]) < 1
        )
            return 1
        return Number(flags[index].split('--page=')[1])
    }

    private getID = (flags: string[]): string => {
        const index = this.getIndex(flags, '--id=')
        if (index < 0 || flags[index].split('--id=')[1] === '') return ''
        return flags[index].split('--id=')[1]
    }

    private getOutput = (flags: string[]): '' | 'zip' | 'pdf' => {
        const index = this.getIndex(flags, '--get=')
        if (index < 0 || !['zip', 'pdf'].includes(flags[index].split('--get=')[1].toLowerCase())) return ''
        return flags[index].split('--get=')[1].toLowerCase() as 'zip' | 'pdf'
    }

    private getIndex = (array: string[], search: string): number => array.findIndex((el) => el.startsWith(search))
}

type TOption = ReturnType<command['getOptions']>
