'use strict';

var Writable = require('stream').Writable;
var elasticsearch = require('elasticsearch');
var elasticClient = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'warning'
});

var fullSearchRaw = require('../lib/fullSearchRaw');
var fullSearchStreamRaw = require('../lib/fullSearchStreamRaw');
var ElasticClientManager = require('../lib/ElasticClientManager');

// Responses will now be Strings instead of JSON objects
ElasticClientManager.elasticClientToRawResponses(elasticClient);

var params = {
  index: 'speed-test',
  type: 'dev',
  body: { query: { match_all: {} } },
  size: 250 // Max. documents per shard
};
var scroll = '30s';

fullSearchRaw(elasticClient, params, scroll, (err, docsString) => {
  if (err) { return console.error(err); }

  console.log('Documents as string: ' + docsString.substring(0, 50) + '...');
});

var readableStream = fullSearchStreamRaw(elasticClient, params, scroll);
readableStream.pipe(writableStream());

function writableStream() {
  return new Writable({
    // Raw streams always return buffers
    write: function (docsBuff, encoding, callback) {
      console.log('Streamed documents as buffer: ' + docsBuff.toString().substring(0, 50) + '...');
      callback();
    }
  });
}
