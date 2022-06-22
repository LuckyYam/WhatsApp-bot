import ytdl, { validateURL, getInfo } from 'ytdl-core'
import { createWriteStream, readFile, unlink } from 'fs-extra'
import { tmpdir } from 'os'
import { Utils } from '.'

export class YT {
    constructor(private url: string, private type: 'video' | 'audio' = 'video') {}

    public validate = (): boolean => validateURL(this.url)

    public getInfo = async (): Promise<ytdl.videoInfo> => await getInfo(this.url)

    public download = async (quality: 'high' | 'medium' | 'low' = 'medium'): Promise<Buffer> => {
        let filename = `${tmpdir()}/${Math.random().toString(36)}`
        if (this.type === 'audio' || quality === 'medium') {
            filename = `${filename}.${this.type === 'audio' ? 'mp3' : 'mp4'}`
            const stream = createWriteStream(filename)
            ytdl(this.url, {
                quality: this.type === 'audio' ? 'highestaudio' : 'highest'
            }).pipe(stream)
            filename = await new Promise((resolve, reject) => {
                stream.on('finish', () => resolve(filename))
                stream.on('error', (error) => reject(error && console.log(error)))
            })
            const buffer = await readFile(filename)
            await unlink(filename)
            return buffer
        }
        let audioFilename = `${filename}.mp3`
        let videoFilename = `${filename}.mp4`
        const audioStream = createWriteStream(audioFilename)
        ytdl(this.url, {
            quality: 'highestaudio'
        }).pipe(audioStream)
        audioFilename = await new Promise((resolve, reject) => {
            audioStream.on('finish', () => resolve(audioFilename))
            audioStream.on('error', (error) => reject(error && console.log(error)))
        })
        const stream = createWriteStream(videoFilename)
        ytdl(this.url, {
            quality: 'highestvideo'
        }).pipe(stream)
        videoFilename = await new Promise((resolve, reject) => {
            stream.on('finish', () => resolve(videoFilename))
            stream.on('error', (error) => reject(error && console.log(error)))
        })
        filename = `${filename}.mp4`
        await this.utils.exec(
            `ffmpeg -i ${audioFilename} -i ${videoFilename} -acodec copy -vcodec copy ${filename}`
        )
        const buffer = await readFile(filename)
        Promise.all([unlink(videoFilename), unlink(audioFilename), unlink(filename)])
        return buffer
    }

    private utils = new Utils()
}
