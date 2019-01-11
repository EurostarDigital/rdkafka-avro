const encode = require('../encode');
const getSchemaVersion = require('../getSchemaVersion');
const decode = require('../decode');
const schema = require('./testSchema.avsc');

it('Avro encodes and decodes data with a schema version', function () {
    const input = {
        title: "King",
        name: "Henry"
    };
    const schemaId = 123;

    // Encode
    const encodedMessage = encode(input, schema, schemaId);
    expect(encodedMessage.readIntBE(0, 5)).toEqual(123);

    // Get schema ID
    expect(getSchemaVersion(encodedMessage)).toEqual(schemaId);

    // Decode - Avro validates the data and will throw error if it does not match the schema.
    const decodedResult = decode(encodedMessage, schema);
    expect(decodedResult).toEqual(input);
});
