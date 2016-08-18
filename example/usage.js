'use strict';

const fullSearch = require('../index').fullSearch;
const fullSearchStream = require('../index').fullSearchStream;

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
