import express, { Request, Response } from 'express'
import { join } from 'path'
import { Helper } from '.'

export class Server {
    constructor(private helper: Helper) {
        this.app.use('/', express.static(this.path))

        this.app.get('/wa/qr', async (req: Request, res: Response) => {
            const { session } = req.query
            if (!session || this.helper.config.session !== (req.query.session as string))
                return void res.status(404).setHeader('Content-Type', 'text/plain').send('Invalid Session').end()
            if (!this.helper.QR)
                return void res
                    .status(404)
                    .setHeader('Content-Type', 'text/plain')
                    .send(
                        this.helper.state === 'connected' ? 'You are already connected to WhatsApp' : 'QR not generated'
                    )
                    .end()
            res.status(200).contentType('image/png').send(this.helper.QR)
        })

        this.app.all('*', (req: Request, res: Response) => res.sendStatus(404))

        this.app.listen(this.helper.config.PORT, () =>
            helper.log(`Server started on PORT : ${this.helper.config.PORT}`)
        )
    }

    private path = join(__dirname, '..', '..', 'public')

    private app = express()
}
