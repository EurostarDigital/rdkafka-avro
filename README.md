# rdkafka-avro
This library includes functionality to integrate node-rdkafka with the Kafka Schema Registry using Apache avro.

Additional Features:
 - Basic auth with Schema Registry
 - In memory caching (default TTL 5 minutes)
 - Magic byte encoding (the schema registry will not recognise the avro format without this)
 


## Examples

##### Fetching a schema:
```
const { SchemaRegistry } = require('rdkafka-avro');

// Get schema with with ID 1
schemaRegistry = new SchemaRegistry('KAFKA-SCHEMA-REGISTRY-URL', {
    username: 'basic-auth-user',
    password: 'Password123'
});

const schemaId = 1;
schemaRegistry.getSchema(schemaId)
    .then((schema) => {
        console.log(schema)
    }); 
```

##### Producing (using a kafka write stream + json defined schema): 
```
const Kafka = require("node-rdkafka");
const { encode } = require('rdkafka-avro');

// Setup Kafka
const kafkaConfig = {
    "metadata.broker.list": 'KAFKA-BROKER-URL',
    "group.id": "demo-group",
    "enable.auto.commit": true
};

const writeStream = Kafka.Producer.createWriteStream(kafkaConfig, {}, {topic: 'DEMO-TOPIC'});

// Define schema (Or get it from the schema registry).
const schema = {
    "type": "record",
    "name": "customer",
    "namespace": "org.customer",
    "doc": "A single customer",
    "fields": [
        {
            "name": "title",
            "type": "string"
        },
        {
            "name": "name",
            "type": "string"
        }
    ]
};


const input = {
    title: "King",
    name: "Henry"
};

// Encode
const schemaId = 1;
const encodedMessageBuffer = encode(input, schema, schemaId);

// Send to kafka
const queuedSuccess = writeStream.write(encodedMessageBuffer);
if (queuedSuccess) {
    console.log('Message queued');
} else {
    // Note that this only tells us if the stream's queue is full, it does NOT tell us if the message got to Kafka!  See below...
    console.log('Too many messages in our queue already');
}
```

##### Consuming an avro encoded message:
```
const Kafka = require("node-rdkafka");
const { SchemaRegistry, decode, getSchemaVersion } = require('rdkafka-avro');

// Setup Kafka
const kafkaConfig = {
    "metadata.broker.list": 'KAFKA-BROKER-URL',
    "group.id": "demo-group",
    "enable.auto.commit": true
};

const readStream = new Kafka.createReadStream(kafkaConfig, {}, {"topics": ['DEMO-TOPIC']});

schemaRegistry = new SchemaRegistry('KAFKA-SCHEMA-REGISTRY-URL');

readStream.on("data", function (message) {
    const encodedMessageBuffer = message.value;
    const schemaId = getSchemaVersion(encodedMessageBuffer);

    schemaRegistry.getSchema(schemaId)
        .then((schema) => {
            // JSON.parse providing the message is encoded in JSON, of course...
            message = JSON.parse(decode(encodedMessageBuffer, schema));
            // Do stuff with the message...
        });
});
```
