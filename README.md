elastic-full-search
===
Functions to get full results from elasticsearch searches.
* searchFull: Returns the full result as an array in a single callback.
* searchFullStream: Returns a stream.Readable instance connected to the full result.

## Install
npm install elastic-full-search
## Usage
```javascript
const fullSearch = require('elastic-full-search').fullSearch;
const fullSearchStream = require('elastic-full-search').fullSearchStream;

// Should be a real elasticsearch.Client instance
var elasticClient = null;
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
```