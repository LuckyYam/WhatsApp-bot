import { Utils } from '.'

enum baseUrls {
    'waifu.pics' = 'https://api.waifu.pics/type/',
    'nekos.life' = 'https://nekos.life/api/v2/img/'
}

export enum Reactions {
    bully = baseUrls['waifu.pics'],
    cuddle = baseUrls['nekos.life'],
    cry = baseUrls['waifu.pics'],
    hug = baseUrls['nekos.life'],
    kiss = baseUrls['nekos.life'],
    lick = baseUrls['waifu.pics'],
    pat = baseUrls['nekos.life'],
    smug = baseUrls['nekos.life'],
    yeet = baseUrls['waifu.pics'],
    blush = baseUrls['waifu.pics'],
    bonk = baseUrls['waifu.pics'],
    smile = baseUrls['waifu.pics'],
    wave = baseUrls['waifu.pics'],
    highfive = baseUrls['waifu.pics'],
    bite = baseUrls['waifu.pics'],
    handhold = baseUrls['waifu.pics'],
    nom = baseUrls['waifu.pics'],
    glomp = baseUrls['waifu.pics'],
    kill = baseUrls['waifu.pics'],
    kick = baseUrls['waifu.pics'],
    slap = baseUrls['nekos.life'],
    happy = baseUrls['waifu.pics'],
    wink = baseUrls['waifu.pics'],
    poke = baseUrls['waifu.pics'],
    dance = baseUrls['waifu.pics'],
    cringe = baseUrls['waifu.pics'],
    tickle = baseUrls['nekos.life']
}

export type reaction = keyof typeof Reactions

export class Reaction {
    public getReaction = async (reaction: reaction, single: boolean = true) => {
        const { url } = await this.utils.fetch<{ url: string }>(`${Reactions[reaction]}${reaction}`)
        const words = this.getSuitableWords(reaction, single)
        return {
            url,
            words
        }
    }

    private getSuitableWords = (reaction: reaction, single: boolean = true): string => {
        switch (reaction) {
            case 'bite':
                return 'Bit'
            case 'blush':
                return 'Blushed at'
            case 'bonk':
                return 'Bonked'
            case 'bully':
                return 'Bullied'
            case 'cringe':
                return 'Cringed at'
            case 'cry':
                return single ? 'Cried by' : 'Cried in front of'
            case 'cuddle':
                return 'Cuddled'
            case 'dance':
                return 'Danced with'
            case 'glomp':
                return 'Glomped at'
            case 'handhold':
                return 'Held the hands of'
            case 'happy':
                return single ? 'is Happied by' : 'is Happied with'
            case 'highfive':
                return 'High-fived'
            case 'hug':
                return 'Hugged'
            case 'kick':
                return 'Kicked'
            case 'kill':
                return 'Killed'
            case 'kiss':
                return 'Kissed'
            case 'lick':
                return 'Licked'
            case 'nom':
                return 'Nomed'
            case 'pat':
                return 'Patted'
            case 'poke':
                return 'Poked'
            case 'slap':
                return 'Slapped'
            case 'smile':
                return 'Smiled at'
            case 'smug':
                return 'Smugged'
            case 'tickle':
                return 'Tickled'
            case 'wave':
                return 'Waved at'
            case 'wink':
                return 'Winked at'
            case 'yeet':
                return 'Yeeted at'
        }
    }

    private utils = new Utils()
}
