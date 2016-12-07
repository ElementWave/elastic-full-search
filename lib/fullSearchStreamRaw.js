'use strict';

const Readable = require('stream').Readable;

const FastJson = require('fast-json');

/**
 * Perform a full search using the scroll feature and returns a stream.Readable instance.
 * This function requires a modified elastic client to response as String.
 *
 * @param  {Object} elasticClient The modified elastic client to response as String.
 * @param  {Object} params        The params used in search method.
 * @param  {String} scroll        The scroll value ex: '30s'.
 * @return {stream.Readable}      A readable stream.
 */
function fullSearchStream(elasticClient, params, scroll) {
  var scrollId = null;
  var keepSending = false;
  var firstIt = true;

  var stream = new Readable({
    read: (size) => {
      if (!keepSending) {
        read(size);
        keepSending = true;
      }
    }
  });

  params.scroll = scroll;
  params.search_type = 'scan';

  var fastJson = new FastJson();
  fastJson.on('_scroll_id', (id) => {
    scrollId = id;
  });

  fastJson.on('hits.hits', (hits) => {
    if (hits === '[]') {
      if (!firstIt) {
        return stream.push(null);
      }
    } else {
      keepSending = stream.push(hits);
    }

    firstIt = false;
    if (keepSending) {
      elasticClient.scroll({ scrollId: scrollId, scroll: scroll }, cursorIterator);
    }
  });

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

    fastJson.write(result);
  }

  return stream;
}

module.exports = fullSearchStream;
