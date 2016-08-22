'use strict';

const elasticsearch = require('elasticsearch');
const elasticClient = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'warning'
});

const fullSearch = require('../index').fullSearch;

var params = {
  index: 'myindex',
  type: 'mytype',
  body: { query: { match_all: {} } },
  size: 250 // Max. documents per shard
};
var scroll = '30s';

fullSearch(elasticClient, params, scroll, (err, docs) => {
  if (err) { return console.error(err); }

  console.log('Documents length: ' + docs.length);
});
