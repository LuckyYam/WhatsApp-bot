const Database = require('./Database')

module.exports = class Contact {
    constructor() {}

    /**
     * @param {string} jid
     * @returns {{username: string, jid: string}}
     */

    getContact = (jid) => {
        const contact = this.contacts.get('contacts')
        if (!contact)
            return {
                username: 'User',
                jid
            }
        const index = contact.findIndex((user) => jid === user.id)
        if (index < 0)
            return {
                username: 'User',
                jid
            }
        return {
            username: contact[index].notify || contact[index].verifiedName || contact[index].name || 'User',
            jid
        }
    }

    /**
     * @param {Partial<contact>[]} contacts
     */

    saveContacts = async (contacts) => {
        if (!this.contacts.has('contacts')) {
            const data = await this.DB.getContacts()
            this.contacts.set('contacts', data)
        }
        const arr = this.contacts.get('contacts')
        for (const contact of contacts) {
            if (contact.id) {
                const index = arr.findIndex((x) => x.id === contact.id)
                if (index >= 0) {
                    if (arr[index].notify === contact.notify) continue
                    arr[index].notify = contact.notify
                    continue
                }
                const data = {
                    id: contact.id,
                    notify: contact.notify,
                    status: contact.status,
                    imgUrl: contact.imgUrl,
                    name: contact.name,
                    verifiedName: contact.verifiedName
                }
                arr.push(data)
            }
        }
        this.contacts.set('contacts', arr)
        await this.DB.contact.updateOne({ title: 'contacts' }, { $set: { data: arr } })
    }

    /**
     * @type {Map<'contacts', contact[]>}
     * @private
     */

    contacts = new Map()

    /**
     * @private
     */

    DB = new Database()
}

/**
 * @typedef {import('@adiwajshing/baileys').Contact} contact
 */
