import { apiProvider } from './framework/services';
import { ParamsBuilder } from './framework/ParamsBuilder';
import { RGB } from '../src/ports/RestServer.types';

const getProjection = (items, projection) => {
    const projectionAr = projection.split(' ');
    if (Array.isArray(items)) {
        return items.map((item) => {
            const result = {};
            projectionAr.forEach((field) => {
                result[field] = item[field];
                if (Array.isArray(item[field])) {
                    result[field] = [];
                    item[field].forEach((item) => {
                        const itemToPush = { ...item };
                        delete itemToPush._id;
                        result[field].push(itemToPush);
                    });
                }
            });
            return result;
        });
    }
    const result = {};
    projectionAr.forEach((field) => {
        result[field] = items[field];
        if (Array.isArray(items[field])) {
            result[field] = [];
            items[field].forEach((item) => {
                const itemToPush = { ...item };
                delete itemToPush._id;
                result[field].push(itemToPush);
            });
        }
    });
    return result;
};

const wait = (msec: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, msec);
    });
};

describe('api', () => {
    const builder = ParamsBuilder;
    beforeAll(async () => {
        // const params = new builder().generate();
        await wait(3500);
        await apiProvider().reset().reset();
    });

    test('1+1', () => {
        expect(1).toBe(1);
    });
    describe('API', () => {
        const black: RGB = { r: 0, g: 0, b: 0 };
        const red: RGB = { r: 255, g: 0, b: 0 };
        test.each`
            api                        | params | testName                      | expectedHttpCode | projection | expectedVal
            ${apiProvider().rgb().get} | ${{}}  | ${'GET /api/rgb returns red'} | ${200}           | ${'r g b'} | ${black}
            ${apiProvider().rgb().put} | ${red} | ${'PUT /api/rgb returns red'} | ${200}           | ${'r g b'} | ${red}
        `('$testName', async ({ api, params, projection, expectedHttpCode, expectedVal }) => {
            const r = await api(params);
            expect(r.status).toEqual(expectedHttpCode);
            if (projection !== null) {
                console.log('test r.body=', r.body);
                expect(getProjection(r.body, projection)).toEqual(expectedVal);
            }
        });
    });
});
