'use strict';

const elasticsearch = require('elasticsearch');
const elasticClient = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'warning'
});

const fullSearchStream = require('../index').fullSearchStream;

var params = {
  index: 'myindex',
  type: 'mytype',
  body: { query: { match_all: {} } },
  size: 250 // Max. documents per shard
};
var scroll = '30s';

var readableStream = fullSearchStream(elasticClient, params, scroll);
readableStream.on('data', (docs) => {
  console.log('Streamed documents length: ' + docs.length);
});
readableStream.on('error', (err) => console.error(err));
readableStream.on('end', () => console.log('Stream ended'));
