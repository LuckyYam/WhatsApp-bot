export interface IConfig {
    /**name of your bot */
    name: string
    /**prefix of your bot */
    prefix: string
    /**session of your bot */
    session: string
    /**number of the users who's the bot admins of the bot */
    mods: string[]
    /**port where the server is started */
    PORT: number
}
