'use strict';

const ut = require('utjs');

/**
 * Perform a full search using the scroll feature.
 *
 * @param {object}   elasticClient The elastic client.
 * @param {object}   params        The params used in search method.
 * @param {string}   scroll        The scroll value ex: '30s'.
 * @param {function} cb            The callback.
 */
function fullSearch(elasticClient, params, scroll, cb) {
  var documents = [];

  params.scroll = scroll;
  params.search_type = 'scan';

  elasticClient.search(params, function cursorIterator(err, result) {
    if (err) { return cb(err); }

    var hits = result.hits.hits;
    var total = result.hits.total;
    var scrollId = result._scroll_id;

    ut.concatArrays(documents, hits);

    if (total > documents.length) {
      elasticClient.scroll({ scrollId: scrollId, scroll: scroll }, cursorIterator);
    } else {
      cb(null, documents);
    }
  });
}

module.exports = fullSearch;
