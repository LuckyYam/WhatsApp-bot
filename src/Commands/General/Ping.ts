import { Command, BaseCommand, Message } from '../../Structures'
import { IArgs } from '../../Types'

@Command('ping', {
    description: 'Tags all of the members/admins in the group',
    usage: 'ping --filter=[admins/members] (--tags=hidden)',
    category: 'general',
    exp: 35,
    cooldown: 15,
    aliases: ['all', 'tagall', 'everyone', 'admins', 'tagadmins']
})
export default class extends BaseCommand {
    public override execute = async (M: Message, { flags, context }: IArgs): Promise<void> => {
        if (!M.groupMetadata) return void M.reply('*Try Again!*')
        const { hidden, tags } = this.getPingOptions(M.sender.isAdmin, flags)
        flags.forEach((flag) => (context = context.replace(flag, '')))
        const message = context ? context.trim() : M.quoted ? M.quoted.content : ''
        if (tags === 'members' && !M.sender.isAdmin)
            return void M.reply("You can't ping all of the members as you're not an admin of this group.")
        let text = `${message !== '' ? `🧧 *Message: ${message}*\n\n` : ''}🍀 *Group:* ${M.groupMetadata.subject}\n${
            tags === 'members'
                ? `🎈 *Members:* ${M.groupMetadata.participants.length}`
                : `👑 *Admins:* ${M.groupMetadata.admins?.length}`
        }\n📣 *Tagger: @${M.sender.jid.split('@')[0]}*\n🔖 *Tags:* ${hidden ? '*[HIDDEN]*' : '\n'}`
        const mentions =
            tags === 'admins'
                ? M.groupMetadata.admins || []
                : M.groupMetadata.participants.map((participant) => participant.id)
        if (mentions.includes(M.sender.jid)) mentions.splice(mentions.indexOf(M.sender.jid, 1))
        if (!hidden) {
            const botJid = this.client.correctJid(this.client.user.id)
            text += `\n🍁 *@${botJid.split('@')[0]}*`
            const mods = mentions.filter((jid) => this.client.config.mods.includes(jid) && jid !== botJid)
            const admins = mentions.filter(
                (jid) =>
                    !this.client.config.mods.includes(jid) &&
                    (M.groupMetadata?.admins || []).includes(jid) &&
                    jid !== botJid
            )
            const members = mentions.filter(
                (jid) =>
                    !this.client.config.mods.includes(jid) &&
                    !(M.groupMetadata?.admins || []).includes(jid) &&
                    jid !== botJid
            )
            for (const jid of mods) text += `${mods.indexOf(jid) === 0 ? '\n\n' : '\n'}🌟 *@${jid.split('@')[0]}*`
            for (const jid of admins) text += `${admins.indexOf(jid) === 0 ? '\n\n' : '\n'}💈 *@${jid.split('@')[0]}*`
            for (const jid of members) text += `${members.indexOf(jid) === 0 ? '\n\n' : '\n'}🎗 *@${jid.split('@')[0]}*`
        }
        return void (await M.reply(text, 'text', undefined, undefined, undefined, [M.sender.jid, ...mentions]))
    }

    private getPingOptions = (isAdmin: boolean, flags: string[]): { hidden: boolean; tags: 'members' | 'admins' } => {
        if (!flags.length)
            return isAdmin
                ? {
                      hidden: false,
                      tags: 'members'
                  }
                : {
                      hidden: false,
                      tags: 'admins'
                  }
        const tagOptions = ['members', 'admins']
        let tags: 'members' | 'admins' = isAdmin ? 'members' : 'admins'
        const filterFlags = flags.filter((flag) => flag.startsWith('--filter='))
        if (filterFlags.length && tagOptions.includes(filterFlags[0].toLowerCase().split('=')[1]))
            tags = filterFlags[0].split('=')[1].toLowerCase() as 'admins' | 'members'
        const taggingFlags = flags.filter((flag) => flag.startsWith('--tags='))
        let hidden = false
        if (taggingFlags.length && taggingFlags[0].split('=')[1].toLowerCase().includes('hidden')) hidden = true
        return {
            hidden,
            tags
        }
    }
}
