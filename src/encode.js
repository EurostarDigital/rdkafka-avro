const avro = require('avsc');
const MAGIC_BYTE = 0;

const toMessageBuffer = function (value, schema, schemaId, initialBufferLength) {
    const length = initialBufferLength || 1024;
    const buffer = new Buffer(length);
    const type = avro.Type.forSchema(schema);

    buffer[0] = MAGIC_BYTE;
    buffer.writeInt32BE(schemaId, 1);

    const bufferPosition = type.encode(value, buffer, 5);

    if (bufferPosition < 0) {
        // Recursively adjust buffer size.
        return toMessageBuffer(value, schema, schemaId, length - bufferPosition);
    }

    return buffer.slice(0, bufferPosition);
};

module.exports = toMessageBuffer;
