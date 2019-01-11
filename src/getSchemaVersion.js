function getSchemaVersion(messageBuffer) {
    return messageBuffer.readInt32BE(1)
}

module.exports = getSchemaVersion;
