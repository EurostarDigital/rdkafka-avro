const getSchemaVersion = require('./src/getSchemaVersion');
const SchemaRegistry = require('./src/SchemaRegistry');
const encode = require('./src/encode');
const decode = require('./src/decode');

module.exports = {
    getSchemaVersion: getSchemaVersion,
    SchemaRegistry: SchemaRegistry,
    encode: encode,
    decode: decode
};
