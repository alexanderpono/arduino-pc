export class ParamsBuilder {
    generate() {
        const fields = Object.getOwnPropertyNames(this);
        const data = {};
        fields.forEach((fieldName) => {
            if (this[fieldName] && typeof this[fieldName] !== 'function') {
                data[fieldName] = this[fieldName];
            }
        });
        return data;
    }
}
