import axios from 'axios'
import { load } from 'cheerio'

export class Lyrics {
    public search = async (query: string, page: number = 1): Promise<ILyrics[]> =>
        await axios.get(`https://genius.com/api/search/song?q=${query}&page=${page}`).then((res) => {
            //@ts-ignore
            const results = res.data.response.sections[0].hits.map((x) => x.result)
            const data: ILyrics[] = []
            for (const result of results)
                data.push({
                    title: result.title as string,
                    fullTitle: result.full_title as string,
                    artist: result.artist_names as string,
                    image: result.header_image_url as string,
                    url: result.url as string
                })
            return data
        })

    public parseLyrics = async (url: string): Promise<string> =>
        await axios.get<string>(url).then(({ data }) => {
            const $ = load(data)
            let text = ''
            $('.Lyrics__Container-sc-1ynbvzw-6.YYrds').each((i, el) => {
                const t = ($(el).html() || '').replace(/<(?:.|\n)*?>/gm, '\n')
                const $$ = load(t)
                text += $$.text().replace(/\(\n/g, '(').replace(/\n[)]/g, ')')
            })
            return text
                .split('\n\n\n\n\n\n\n\n\n\n\n\n')
                .join('\n\n')
                .split('\n\n\n\n\n\n\n\n\n\n')
                .join('\n\n')
                .split('\n\n\n')
                .join('\n')
                .trim()
        })
}

export interface ILyrics {
    title: string
    fullTitle: string
    artist: string
    image: string
    url: string
}
