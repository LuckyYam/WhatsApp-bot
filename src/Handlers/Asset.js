const { readFileSync, readdirSync } = require('fs-extra')
const { join } = require('path')
const chalk = require('chalk')
const Helper = require('../Structures/Helper')

module.exports = class AssetHandler {
    /**
     * @param {Helper} helper
     */
    constructor(helper) {
        /**@type {Helper} */
        this.helper = helper
    }

    loadAssets = () => {
        this.helper.log('Loading Assets...')
        const folders = readdirSync(join(__dirname, '..', '..', 'assets'))
        for (const folder of folders) {
            const assets = readdirSync(join(__dirname, '..', '..', 'assets', folder))
            for (const asset of assets) {
                const buffer = readFileSync(join(__dirname, '..', '..', 'assets', folder, asset))
                this.helper.assets.set(asset.split('.')[0], buffer)
                this.helper.log(`Loaded: ${chalk.redBright(asset.split('.')[0])} from ${chalk.blueBright(folder)}`)
            }
        }
        this.helper.log(`Successfully loaded ${chalk.cyanBright(this.helper.assets.size)} assets`)
    }
}
