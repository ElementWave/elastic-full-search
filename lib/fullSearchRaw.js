'use strict';

const FastJson = require('fast-json');

/**
 * Perform a full search using the scroll feature and a modified elastic client to
 * response as String.
 *
 * @param {object}   elasticClient The modified elastic client to response as String.
 * @param {object}   params        The params used in search method.
 * @param {string}   scroll        The scroll value ex: '30s'.
 * @param {function} cb            The callback.
 */
function fullSearchRaw(elasticClient, params, scroll, cb) {
  var documents = [];

  params.scroll = scroll;
  params.search_type = 'scan';

  var scrollId = null;
  var firstIt = true;

  elasticClient.search(params, cursorIterator);

  var fastJson = new FastJson();
  fastJson.on('_scroll_id', (id) => {
    scrollId = id;
  });

  fastJson.on('hits.hits', (hits) => {
    if (hits === '[]') {
      if (!firstIt) {
        return cb(null, '[' + documents.join(',') + ']');
      }
    } else {
      documents.push(hits.substring(1, hits.length - 1));
    }

    firstIt = false;
    elasticClient.scroll({ scrollId: scrollId, scroll: scroll }, cursorIterator);
  });

  function cursorIterator(err, result) {
    if (err) { return cb(err); }

    fastJson.write(result);
  }
}

module.exports = fullSearchRaw;
