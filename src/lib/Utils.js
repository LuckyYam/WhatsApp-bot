const axios = require('axios').default
const { tmpdir } = require('os')
const { promisify } = require('util')
const { exec } = require('child_process')
const { readFile, unlink, writeFile } = require('fs-extra')

module.exports = class Utils {
    constructor() {}

    /**
     * @param {string} url
     * @returns {Promise<Buffer>}
     */

    getBuffer = async (url) =>
        (
            await axios.get(url, {
                responseType: 'arraybuffer'
            })
        ).data

    /**
     * @param {string} content
     * @param {boolean} all
     * @returns {string}
     */

    capitalize = (content, all = false) => {
        if (!all) return `${content.charAt(0).toUpperCase()}${content.slice(1)}`
        return `${content
            .split(' ')
            .map((text) => `${text.charAt(0).toUpperCase()}${text.slice(1)}`)
            .join(' ')}`
    }

    /**
     * @returns {string}
     */

    generateRandomHex = () => `#${(~~(Math.random() * (1 << 24))).toString(16)}`

    /**
     * @param {number} length
     * @returns {string}
     */

    generateRandomUniqueTag = (length) => {
        let max = 12 - 1
        if (length > max) return this.generateRandomUniqueTag(max) + this.generateRandomUniqueTag(length - max)
        max = Math.pow(10, length + 1)
        const min = max / 10
        const number = Math.floor(Math.random() * (max - min + 1)) + min
        return number.toString().substring(1)
    }

    /**
     * @param {string} content
     * @returns {number[]}
     */

    extractNumbers = (content) => {
        const search = content.match(/(-\d+|\d+)/g)
        if (search !== null) return search.map((string) => parseInt(string)) || []
        return []
    }

    /**
     *
     * @param {number} ms
     * @param {'seconds' | 'minutes' | 'hours' | 'days' | 'format'} to
     * @returns {number | { days: number; hours: number; minutes: number; seconds: number }}
     */

    convertMs = (ms, to = 'seconds') => {
        let seconds = parseInt(
            Math.floor(ms / 1000)
                .toString()
                .split('.')[0]
        )
        let minutes = parseInt(
            Math.floor(seconds / 60)
                .toString()
                .split('.')[0]
        )
        let hours = parseInt(
            Math.floor(minutes / 60)
                .toString()
                .split('.')[0]
        )
        let days = parseInt(
            Math.floor(hours / 24)
                .toString()
                .split('.')[0]
        )
        if (to === 'seconds') return seconds
        if (to === 'minutes') return minutes
        if (to === 'hours') return hours
        if (to === 'days') return days
        seconds = parseInt((seconds % 60).toString().split('.')[0])
        minutes = parseInt((minutes % 60).toString().split('.')[0])
        hours = parseInt((hours % 24).toString().split('.')[0])
        return {
            days,
            seconds,
            minutes,
            hours
        }
    }

    /**
     * @param {string} url
     */

    fetch = async (url) => (await axios.get(url)).data

    /**
     * @param {Buffer} webp
     * @returns {Promise<Buffer>}
     */

    webpToPng = async (webp) => {
        const filename = `${tmpdir()}/${Math.random().toString(36)}`
        await writeFile(`${filename}.webp`, webp)
        await this.exec(`dwebp "${filename}.webp" -o "${filename}.png"`)
        const buffer = await readFile(`${filename}.png`)
        Promise.all([unlink(`${filename}.png`), unlink(`${filename}.webp`)])
        return buffer
    }

    /**
     * @param {Buffer} webp
     * @returns {Promise<Buffer>}
     */

    webpToMp4 = async (webp) => {
        const filename = `${tmpdir()}/${Math.random().toString(36)}`
        await writeFile(`${filename}.webp`, webp)
        await this.exec(`magick mogrify -format gif ${filename}.webp`)
        const mp4 = await this.gifToMp4(await readFile(`${filename}.gif`), true)
        const buffer = await readFile(mp4)
        Promise.all([unlink(mp4), unlink(`${filename}.gif`), unlink(`${filename}.gif`)])
        return buffer
    }

    /**
     * @param {Buffer} gif
     * @param {boolean} write
     * @returns {Promise<Buffer | string>}
     */

    gifToMp4 = async (gif, write = false) => {
        const filename = `${tmpdir()}/${Math.random().toString(36)}`
        await writeFile(`${filename}.gif`, gif)
        await this.exec(
            `ffmpeg -f gif -i ${filename}.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${filename}.mp4`
        )
        if (write) return `${filename}.mp4`
        const buffer = await readFile(`${filename}.mp4`)
        Promise.all([unlink(`${filename}.mp4`), unlink(`${filename}.gif`)])
        return buffer
    }

    exec = promisify(exec)
}
