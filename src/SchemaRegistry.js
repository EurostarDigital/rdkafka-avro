const NodeCache = require("node-cache");
const url = require('url');
const https = require('https');

const DEFAULT_TIMEOUT = 6000;
const DEFAULT_TTL = 300;

class SchemaRegistry {
    constructor(baseUrl, auth, ttl = DEFAULT_TTL, defaultTimeout = DEFAULT_TIMEOUT) {
        this._cache = new NodeCache({stdTTL: ttl, checkperiod: ttl / 2});
        this._timeout = defaultTimeout;
        this._baseUrl = baseUrl;
        this._auth = auth;
    }

    getSchema(id) {
        const schemaFromCache = this._cache.get(id);
        if (schemaFromCache !== undefined) {
            return Promise.resolve(schemaFromCache);
        }

        return this._getSchemaFromRegistry(id)
            .then(schema => {
                this._cache.set(id, schema);
                return schema;
            })
    }

    _getSchemaFromRegistry(id) {
        const urlObject = url.parse(this._baseUrl);

        let options = {
            host: urlObject.hostname,
            port: urlObject.port || 443,
            path: `/schemas/ids/${id}`,
            timeout: this._timeout,
        };

        if (this._auth) {
            options.headers = {
                Authorization: 'Basic ' + new Buffer(this._auth.username + ':' + this._auth.password).toString('base64')
            }
        }

        return new Promise((resolve, reject) => {
            https.get(options, (resp) => {
                if (resp.statusCode >= 400) {
                    return reject(new Error(`Request failed with status code ${resp.statusCode}`));
                }

                let data = '';

                resp.on('data', (chunk) => {
                    data += chunk;
                });

                resp.on('end', () => {
                    return resolve(JSON.parse(JSON.parse(data).schema));
                });

            }).on('timeout', () => {
                return reject(new Error("Timeout - connection to schema registry timed out"));
            }).on("error", (err) => {
                return reject(err);
            }).on('socket', (socket) => {
                socket.setTimeout(this._timeout, () => {
                    socket.destroy();
                })
            });
        })
    }
}

module.exports = SchemaRegistry;
