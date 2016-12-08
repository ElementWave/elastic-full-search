'use strict';

const Writable = require('stream').Writable;
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
readableStream.pipe(writableStream());

function writableStream() {
  return new Writable({
    write: function (docs, encoding, callback) {
      console.log('Streamed documents length: ' + docs.length);
      callback();
    },

    objectMode: true
  });
}
