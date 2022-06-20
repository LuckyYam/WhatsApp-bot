import { readdirSync, readFileSync } from 'fs-extra'
import { join } from 'path'
import chalk from 'chalk'
import { Helper } from '../Structures'

export class AssetHandler {
    constructor(private helper: Helper) {}

    public loadAssets = (): void => {
        this.helper.log('Loading Assets...')
        const folders = readdirSync(join(...this.path))
        for (const folder of folders) {
            this.path.push(folder)
            const assets = readdirSync(join(...this.path))
            for (const asset of assets) {
                this.path.push(asset)
                const buffer = readFileSync(join(...this.path))
                this.helper.assets.set(asset.split('.')[0], buffer)
                this.helper.log(`Loaded: ${chalk.redBright(asset.split('.')[0])} from ${chalk.blueBright(folder)}`)
                this.path.splice(this.path.indexOf(asset), 1)
            }
            this.path.splice(this.path.indexOf(folder), 1)
        }
        return this.helper.log(`Successfully loaded ${chalk.cyanBright(this.helper.assets.size)} assets`)
    }

    private path = [__dirname, '..', '..', 'assets']
}
