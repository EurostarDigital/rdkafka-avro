const axios = require('axios');
const NodeCache = require("node-cache");

class SchemaRegistry {
    constructor(baseUrl, auth, ttl = null) {
        if (ttl === null) {
            const fiveMinutesInSeconds = 300;
            ttl = fiveMinutesInSeconds;
        }

        this.cache = new NodeCache({stdTTL: ttl, checkperiod: ttl / 2});

        this.baseUrl = baseUrl;
        this.auth = auth;
    }

    getSchema(version) {
        // Load from cache, if set.
        const cacheKey = version;
        const schemaFromCache = this.cache.get(cacheKey);
        if (schemaFromCache !== undefined) {
            return Promise.resolve(schemaFromCache);
        }

        const instance = this._getInstance();
        return instance.get(`/schemas/ids/${version}`)
            .then(res => {
                const schema = JSON.parse(res.data.schema); // Comes through as string.

                this.cache.set(cacheKey, schema);
                return schema;
            })
    }

    _getInstance() {
        const config = {
            baseURL: this.baseUrl,
            timeout: 10000,
        };

        if (this.auth) {
            config.auth = {
                username: this.auth.username,
                password: this.auth.password
            }
        }

        return axios.create(config);
    }
}

module.exports = SchemaRegistry;
