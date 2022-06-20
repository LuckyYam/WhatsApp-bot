import { config } from 'dotenv'
import Baileys, { DisconnectReason, fetchLatestBaileysVersion } from '@adiwajshing/baileys'
import { Boom } from '@hapi/boom'
import qr from 'qr-image'
import P from 'pino'
import { connect } from 'mongoose'
import { Message, Helper, AuthenticationFromDatabase, Server } from './Structures'
import { MessageHandler, AssetHandler, CallHandler } from './Handlers'
import { client, ICall } from './Types'

config()

const helper = new Helper({
    prefix: process.env.PREFIX || ':',
    name: process.env.NAME || 'Bot',
    mods: (process.env.MODS || '').split(', ').map((user) => `${user}@s.whatsapp.net`),
    session: process.env.SESSION || 'SESSION',
    PORT: Number(process.env.PORT || 3000)
})

new Server(helper)

const start = async (): Promise<client> => {
    if (!process.env.MONGO_URI || process.env.MONGO_URI === '') {
        throw new Error('No MongoDB URI provided')
    }

    await connect(process.env.MONGO_URI)

    helper.log('Connected to the Database')

    const { useDatabaseAuth } = new AuthenticationFromDatabase(helper.config.session)
    const { state, saveState, clearState } = await useDatabaseAuth()
    const client = Baileys({
        version: (await fetchLatestBaileysVersion()).version,
        printQRInTerminal: true,
        auth: state,
        logger: P({ level: 'fatal' }),
        browser: ['WhatsApp-bot', 'fatal', '1.0.0']
    })

    new AssetHandler(helper).loadAssets()
    const { handleMessage, loadCommands } = new MessageHandler(client, helper)
    const { handleCall } = new CallHandler(client, helper)

    loadCommands()

    client.ev.on('messages.upsert', async ({ messages }) => {
        const M = new Message(messages[0], client)
        M.helper = helper
        await handleMessage(M)
    })

    client.ws.on('CB:call', async (call: ICall) => await handleCall(call))

    client.ev.on('contacts.update', async (contacts) => await helper.contact.saveContacts(contacts))

    client.ev.on('connection.update', (update) => {
        if (update.qr) {
            helper.log(
                `QR code generated. Scan it to continue | You can also authenicate in http://localhost:${helper.config.PORT}`
            )
            helper.QR = qr.imageSync(update.qr)
        }
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
                helper.log('Reconnecting...')
                setTimeout(() => start(), 3000)
            } else {
                helper.log('Disconnected.', true)
                helper.log('Deleting session and restarting')
                clearState()
                helper.log('Session deleted')
                helper.log('Starting...')
                setTimeout(() => start(), 3000)
            }
        }
        if (connection === 'connecting') {
            helper.state = 'connecting'
            helper.log('Connecting to WhatsApp...')
        }
        if (connection === 'open') {
            helper.state = 'connected'
            helper.log('Connected to WhatsApp')
        }
    })

    client.ev.on('creds.update', saveState)

    return client
}

start()
