import supertest from 'supertest';
import { url } from '../config';

export class ResetApi {
    async reset() {
        console.log('reset!');
        const r = await supertest(`${url.localArduinoApi}`)
            .post(`/api/reset`)
            .set('Accept', 'application/json');

        return r;
    }
}
