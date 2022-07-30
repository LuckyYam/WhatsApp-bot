import { Client } from './Structures'
import { MessageHandler, AssetHandler, CallHandler, EventHandler } from './Handlers'
;(async (): Promise<void> => {
    const client = new Client()

    await client.start()

    new AssetHandler(client).loadAssets()

    const { handleMessage, loadCommands } = new MessageHandler(client)

    const { handleEvents, sendMessageOnJoiningGroup } = new EventHandler(client)

    const { handleCall } = new CallHandler(client)

    loadCommands()

    client.on('new_message', async (M) => await handleMessage(M))

    client.on('participants_update', async (event) => await handleEvents(event))

    client.on('new_group_joined', async (group) => await sendMessageOnJoiningGroup(group))

    client.on('new_call', async (call) => await handleCall(call))
})()
