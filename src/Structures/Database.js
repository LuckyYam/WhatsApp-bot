const { userSchema, groupSchema, contactSchema, sessionSchema, commandSchema } = require('../Database')
const { Utils } = require('../lib')

module.exports = class Database {
    constructor() {}

    /**
     * @param {string} jid
     * @returns {Promise<user>}
     */

    getUser = async (jid) =>
        (await this.user.findOne({ jid })) ||
        (await new this.user({
            jid,
            tag: this.utils.generateRandomUniqueTag(4)
        }).save())

    /**
     * @param {string} jid
     * @param {number} experience
     */

    setExp = async (jid, experience) => {
        await this.getUser(jid)
        experience = experience + Math.floor(Math.random() * 25)
        await this.user.updateOne({ jid }, { $inc: { experience } })
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

    /**
     * @returns {Promise<{ command: string, reason: string, time: string, disabledBy: string }[]>}
     */

    getDisabledCommands = async () => {
        let result = await this.disabledCommands.findOne({ title: 'commands' })
        if (!result)
            result = await new this.disabledCommands({
                title: 'commands',
                disabledCommands: []
            }).save()
        return result.disabledCommands
    }

    user = userSchema

    group = groupSchema

    contact = contactSchema

    session = sessionSchema

    disabledCommands = commandSchema

    /**
     * @private
     */

    utils = new Utils()
}

/**
 * @typedef {{jid: string, experience: number, ban: boolean, level: number, tag: string}} user
 */

/**
 * @typedef {{jid: string, events: boolean, nsfw: boolean, mods: boolean}} group
 */

/**
 * @typedef {import('@adiwajshing/baileys').Contact} contact
 */
