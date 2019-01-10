const nock = require('nock');
const SchemaRegistry = require('../SchemaRegistry');

const schemaRegistryApiStub = nock('https://schema.fakeurl');

it('Gets schema from registry', function (done) {
    schemaRegistryApiStub
        .get('/schemas/ids/1')
        .reply(200, {schema: '{"test": "schema"}'});

    const schemaRegistry = new SchemaRegistry('https://schema.fakeurl', false, 10);

    schemaRegistry.getSchema(1).then(schema => {
        expect(schema).toEqual({"test": "schema"});
        done();
    });
});

it('Caches response', async function (done) {
    schemaRegistryApiStub
        .get('/schemas/ids/1')
        .reply(200, {schema: '{"test": "schema"}'});


    const schemaRegistry = new SchemaRegistry('https://schema.fakeurl', false, 10);

    // Nock will throw an error if the same URL is called twice
    await schemaRegistry.getSchema(1);
    const schema = await schemaRegistry.getSchema(1);
    expect(schema).toEqual({"test": "schema"});
    done();
});

it('Expires cache after set time', async function (done) {
    schemaRegistryApiStub
        .get('/schemas/ids/1')
        .reply(200, {schema: '{"test": "schema"}'});

    const oneSecond = 1;
    const twoSecondsInMilliseconds = 2000;
    const schemaRegistry = new SchemaRegistry('https://schema.fakeurl', false, oneSecond);

    await schemaRegistry.getSchema(1);
    setTimeout(async function () {
        await expect(schemaRegistry.getSchema((1))).rejects.toThrow('Nock: No match for request');
        done();
    }, twoSecondsInMilliseconds)
});

// TODO
// it('Does not cache calls with different IDs', function (done) {
// });

it('Authenticates with schema registry using basic auth', function (done) {
    schemaRegistryApiStub
        .get('/schemas/ids/1')
        .basicAuth({
            user: 'john',
            pass: 'doe'
        })
        .reply(200, {schema: '{"test": "schema"}'});


    const creds = {username: 'john', password: 'doe'};
    const schemaRegistry = new SchemaRegistry('https://schema.fakeurl', creds, 10);

    schemaRegistry.getSchema(1).then(schema => {
        expect(schema).toEqual({"test": "schema"});
        done();
    });
});

it('Throws error when failing to load schema from registry', async function (done) {
    schemaRegistryApiStub
        .get('/schemas/ids/1')
        .reply(400);

    const schemaRegistry = new SchemaRegistry('https://schema.fakeurl', null, 10);
    await expect(schemaRegistry.getSchema(1)).rejects.toThrow('Request failed with status code 400');
    done()
});
