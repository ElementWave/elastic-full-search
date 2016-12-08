'use strict';

/**
 * Overrides per default deserialize method without JSON.parse().
 *
 * @param {elasticsearch.Client} elasticClient The elasticsearch client.
 */
function elasticClientToRawResponses(elasticClient) {
  if (elasticClient.transport || elasticClient.transport.serializer ||
      typeof elasticClient.transport.serializer.deserialize === 'function') {
    elasticClient.transport.serializer.deserialize = function (str) {
      if (typeof str === 'string') {
        return str;
      }
    };
  }
}

/**
 * Reset to the default deserialize method with JSON.parse().
 *
 * @param {elasticsearch.Client} elasticClient The elasticsearch client.
 */
function elasticClientToJsonResponses(elasticClient) {
  if (elasticClient.transport || elasticClient.transport.serializer ||
      typeof elasticClient.transport.serializer.deserialize === 'function') {
    elasticClient.transport.serializer.deserialize = function (str) {
      if (typeof str === 'string') {
        return JSON.parse(str);
      }
    };
  }
}

module.exports.elasticClientToRawResponses = elasticClientToRawResponses;
module.exports.elasticClientToJsonResponses = elasticClientToJsonResponses;
