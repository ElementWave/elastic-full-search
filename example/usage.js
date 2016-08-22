'use strict';

const elasticsearch = require('elasticsearch');
const elasticClient = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'warning'
});

const fullSearch = require('../index').fullSearch;
const fullSearchStream = require('../index').fullSearchStream;

var params = {
  index: 'myindex',
  type: 'mytype',
  body: { query: { match_all: {} } },
  size: 250 // Max. documents per shard
};
var scroll = '30s';

// Gets everything in the docs array.
fullSearch(elasticClient, params, scroll, (err, docs) => {
  if (err) { throw err; }

  console.log('Documents length: ' + docs.length);
});

// Gets everything streamed through the readableStream.
var readableStream = fullSearchStream(elasticClient, params, scroll);
readableStream.on('data', (docs) => {
  console.log('Streamed documents length: ' + docs.length);
});
readableStream.on('error', (err) => console.error(err));
readableStream.on('end', () => console.log('Stream ended'));
