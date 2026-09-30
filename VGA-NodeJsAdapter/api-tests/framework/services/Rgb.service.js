import supertest from 'supertest';
import { url } from '../config';

export class RgbApi {
    async get() {
        const r = await supertest(`${url.localArduinoApi}`)
            .get(`/api/rgb`)
            .set('Accept', 'application/json');
        return r;
    }

    async put(params) {
        const r = await supertest(`${url.localArduinoApi}`)
            .put(`/api/rgb`)
            .set('Accept', 'application/json')
            .send(params);

        return r;
    }
}
