import { Client, Server } from './Structures'
import { MessageHandler, AssetHandler, CallHandler } from './Handlers'

const client = new Client()

new Server(client)

const start = async (): Promise<void> => {
    await client.start()

    new AssetHandler(client).loadAssets()

    const { handleMessage, loadCommands } = new MessageHandler(client)

    const { handleCall } = new CallHandler(client)

    loadCommands()

    client.on('new_message', async (M) => await handleMessage(M))

    client.on('new_call', async (call) => await handleCall(call))
}

start()
