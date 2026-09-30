import express from 'express';
import morgan from 'morgan';

export interface RestController {
    onRestGetLight: (req, res) => void;
    onRestPutLight: (req, res) => void;
    onRestGetReset: (req, res) => void;
}
export class RestServer {
    private app;
    constructor(private port: number, private ctrl: RestController) {}

    run = () => {
        this.app = express();
        this.app.use(express.json());

        morgan.token('req-body', function (req, res) {
            return JSON.stringify(req.body);
        });
        morgan.token('res-body', function (req, res) {
            return JSON.stringify(res.__custombody__);
        });

        this.app.use(
            morgan(
                ':method :url :status :response-time ms - "REQL:req[content-length]" - REQB:req-body - RESL::res[content-length] - RESB::res-body \n',
                {
                    stream: morgan.successLogStream,
                    skip: function (req, res) {
                        return res.statusCode >= 400;
                    }
                }
            )
        );

        this.app.use(
            morgan(
                ':method :url :status :response-time ms - "REQL:req[content-length]" - REQB:req-body - RESL::res[content-length] - RESB::res-body \n',
                {
                    stream: morgan.errorLogStream,
                    skip: function (req, res) {
                        return res.statusCode < 400;
                    }
                }
            )
        );
        this.app.get('/api/rgb', this.ctrl.onRestGetLight);
        this.app.put('/api/rgb', this.ctrl.onRestPutLight);
        this.app.post('/api/reset', this.ctrl.onRestGetReset);

        this.app.listen(this.port);
    };
}
