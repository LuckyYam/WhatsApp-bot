const { userSchema, groupSchema, contactSchema, sessionSchema } = require('../Database')

module.exports = class Database {
    constructor() {}

    /**
     * @param {string} jid
     * @returns {Promise<user>}
     */

    getUser = async (jid) =>
        (await this.user.findOne({ jid })) ||
        (await new this.user({
            jid
        }).save())

    /**
     * @param {string} jid
     * @param {'ban' | 'unban'} update
     */

    updateUserBanStatus = async (jid, update = 'ban') => {
        await this.getUser(jid)
        await this.user.updateOne({ jid }, { $set: { ban: update === 'ban' ? true : false } })
    }

    /**
     * @param {string} jid
     * @param {number} experience
     */

    setExp = async (jid, experience) => {
        await this.getUser(jid)
        experience = experience + Math.floor(Math.random() * 25)
        await this.user.updateOne({ jid }, { $set: { experience } })
    }

    /**
     * @param {string} jid
     * @returns {Promise<group>}
     */

    getGroup = async (jid) =>
        (await this.group.findOne({ jid })) ||
        (await new this.group({
            jid
        }).save())

    /**
     * @returns {Promise<contact[]>}
     */

    getContacts = async () => {
        let result = await this.contact.findOne({ ID: 'contacts' })
        if (!result)
            result = await new this.contact({
                ID: 'contacts',
                data: []
            }).save()
        return result.data
    }

    /**
     * @param {string} sessionId
     * @returns {Promise<{sessionId: string, session: string}>}
     */

    getSession = async (sessionId) => await this.session.findOne({ sessionId })

    user = userSchema

    group = groupSchema

    contact = contactSchema

    session = sessionSchema
}

/**
 * @typedef {{jid: string, experience: number, ban: boolean}} user
 */

/**
 * @typedef {{jid: string, events: boolean, nsfw: boolean, mods: boolean}} group
 */

/**
 * @typedef {import('@adiwajshing/baileys').Contact} contact
 */
