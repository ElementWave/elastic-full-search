'use strict';

const Readable = require('stream').Readable;

/**
 * Perform a full search using the scroll feature and returns a stream.Readable instance.
 *
 * @param  {Object} elasticClient The elastic client.
 * @param  {Object} params        The params used in search method.
 * @param  {String} scroll        The scroll value ex: '30s'.
 * @return {stream.Readable}      A readable stream.
 */
function fullSearchStream(elasticClient, params, scroll) {
  var documentsRead = 0;
  var scrollId = null;
  var keepSending = false;

  var stream = new Readable({
    read: (size) => {
      if (!keepSending) {
        read(size);
        keepSending = true;
      }
    },

    objectMode: true
  });

  params.scroll = scroll;
  params.search_type = 'scan';

  function read(size) {
    if (!scrollId) {
      elasticClient.search(params, cursorIterator);
    } else {
      elasticClient.scroll({ scrollId: scrollId, scroll: scroll }, cursorIterator);
    }
  }

  function cursorIterator(err, result) {
    if (err) {
      process.nextTick(() => stream.emit('error', err));
      return;
    }

    var hits = result.hits.hits;
    var total = result.hits.total;

    scrollId = result._scroll_id;
    documentsRead += hits.length;

    if (hits.length > 0) {
      keepSending = stream.push(hits);
    }

    if (total > documentsRead) {
      if (keepSending) {
        elasticClient.scroll({ scrollId: scrollId, scroll: scroll }, cursorIterator);
      }
    } else {
      stream.push(null);
    }
  }

  return stream;
}

module.exports = fullSearchStream;
