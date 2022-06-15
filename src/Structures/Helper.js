const chalk = require('chalk')
const Database = require('./Database')
const Contact = require('./Contact')
const { Utils } = require('../lib')

module.exports = class Helper {
    /**
     * @param {{prefix: string, name: string, mods?: string[], session: string, PORT: number}} config
     */
    constructor(config) {
        this.config = config
        /**
         * @type {Buffer}
         */
        this.QR
        /**
         * @type {'open' | 'connecting' | 'logged_out'}
         */
        this.state
    }

    utils = new Utils()

    contact = new Contact()

    DB = new Database()

    /**
     * @type {Map<string, Buffer>}
     */

    assets = new Map()

    /**
     * @param {string} text
     * @param {boolean} error
     * @returns {void}
     */

    log = (text, error = false) =>
        console.log(chalk[error ? 'red' : 'blue']('[BOT]'), chalk[error ? 'redBright' : 'greenBright'](text))
}
