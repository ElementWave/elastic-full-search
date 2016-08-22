elastic-full-search
===
Functions to get full results from elasticsearch searches.
* searchFull: Returns the full result as an array in a single callback.
* searchFullStream: Returns a stream.Readable instance connected to the full result.

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

// Gets everything streamed through the readableStream.
var readableStream = fullSearchStream(elasticClient, params, scroll);
readableStream.on('data', (docs) => {
  console.log('Streamed documents length: ' + docs.length);
});
readableStream.on('error', (err) => console.error(err));
readableStream.on('end', () => console.log('Stream ended'));
```