import chalk from 'chalk'
import EventEmitter from 'events'
import { Utils } from '../lib'
import { Database, Contact } from '.'
import { IConfig } from '../Types'

export class Helper extends EventEmitter {
    /**
     * Constructs the configuration of your bot
     * @param {IConfig} config Configuration of your bot
     */
    constructor(public config: IConfig) {
        super()
    }

    public utils = new Utils()

    public DB = new Database()

    public contact = new Contact()

    public assets = new Map<string, Buffer>()

    public log = (text: string, error: boolean = false): void =>
        console.log(
            chalk[error ? 'red' : 'blue'](`[${this.config.name.toUpperCase()}]`),
            chalk[error ? 'redBright' : 'greenBright'](text)
        )

    public state!: 'connected' | 'connecting' | 'logged_out'

    public QR!: Buffer
}
