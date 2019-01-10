const avro = require('avsc');
const MAGIC_BYTE = 0;

const decode = function (encodedMessage, schema) {
    if (encodedMessage[0] !== MAGIC_BYTE) {
        throw new Error('Message not serialized with magic byte');
    }

    const type = avro.Type.forSchema(schema);
    const messageWithoutMagicByte = encodedMessage.slice(5);

    return type.fromBuffer(messageWithoutMagicByte);
};

module.exports = decode;
