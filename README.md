elastic-full-search
===
Functions to get full results from elasticsearch searches.
* **searchFull**: Returns the full result as an array in a single callback.
* **searchFullStream**: Returns a stream.Readable instance in **object mode** connected to the full result.
* **searchFullRaw**: Returns the full result as a string (no JSON.parse() inside) in a single callback.
* **searchFullStreamRaw**: Returns a stream.Readable instance in **buffer mode** (no JSON.parse() inside) connected to the full result.

> In order to use *searchFullRaw* and *searchFullStreamRaw*, the elasticsearch client need to be modified as explain in the secction *raw methods*.

## Install
npm install elastic-full-search

## Usage
```javascript
const elasticsearch = require('elasticsearch');
const elasticClient = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'warning'
});

const fullSearch = require('elastic-full-search').fullSearch;
const fullSearchStream = require('elastic-full-search').fullSearchStream;

var params = {
  index: 'myindex',
  type: 'mytype',
  body: { query: { match_all: {}}},
  size: 250 // Max. documents per shard
};
var scroll = '30s';

// Gets everything in the docs array.
fullSearch(elasticClient, params, scroll, (err, docs) => {
  if (err) { throw err; }

  console.log(docs);
});

// Gets everything streamed through the readableStream in object mode.
var readableStream = fullSearchStream(elasticClient, params, scroll);
readableStream.on('data', (docs) => {
  console.log('Streamed documents length: ' + docs.length);
});
readableStream.on('error', (err) => console.error(err));
readableStream.on('end', () => console.log('Stream ended'));
```

## Raw methods
With a small change in the elasticsearch client using reflection, we can get adventage of a better performance and throughput removing unnecessaries *JSON.parse()* calls and using streams in **buffer mode** (the default stream mode).

## Usage
```javascript
const elasticsearch = require('elasticsearch');
const elasticClient = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'warning'
});

const fullSearchRaw = require('../lib/fullSearchRaw');
const fullSearchStreamRaw = require('../lib/fullSearchStreamRaw');
const ElasticClientManager = require('../lib/ElasticClientManager');

// Responses will now be Strings instead of JSON objects
ElasticClientManager.elasticClientToRawResponses(elasticClient);

var params = {
  index: 'myindex',
  type: 'mytype',
  body: { query: { match_all: {} } },
  size: 250 // Max. documents per shard
};
var scroll = '30s';

// Gets everything as a JSON string in "docsString"
fullSearchRaw(elasticClient, params, scroll, (err, docsString) => {
  if (err) { return console.error(err); }

  // Do something with "docsString"
});

// Gets everything streamed through the readableStream.
var readableStream = fullSearchStreamRaw(elasticClient, params, scroll);
readableStream.on('data', (docsBuff) => {
  // Do something with "docsBuff"
});
readableStream.on('error', (err) => console.error(err));
readableStream.on('end', () => console.log('Stream ended'));
```
Check out the folder *example* for more examples.