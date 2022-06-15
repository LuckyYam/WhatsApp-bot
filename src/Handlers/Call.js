const chalk = require('chalk')
const Helper = require('../Structures/Helper')

module.exports = class CallHandler {
    /**
     * @param {import('../Structures/Command').client} client
     * @param {Helper} helper
     */

    constructor(client, helper) {
        /**
         * @type {import('../Structures/Command').client}
         */
        this.client = client
        /**
         * @type {Helper}
         */
        this.helper = helper
    }

    /**
     * @param {call} call
     * @returns {Promise<void>}
     */

    handleCall = async (call) => {
        if (call.content[0].tag !== 'offer') return void null
        const caller = call.content[0].attrs['call-creator']
        const { username } = this.helper.contact.getContact(caller)
        this.helper.log(`${chalk.cyanBright('Call')} from ${chalk.blueBright(username)}`)
        await this.client.sendMessage(caller, {
            text: 'You are now banned'
        })
        await this.client.updateBlockStatus(caller, 'block')
        return (
            void (await this.helper.DB.user.updateOne({ jid: caller }, { $set: { ban: true } })) ||
            (await new this.helper.DB.user({
                jid: caller,
                ban: true
            }).save())
        )
    }
}

/**
 * @typedef {{content: {attrs: {'call-creator': string}, tag: string}[]}} call
 */
