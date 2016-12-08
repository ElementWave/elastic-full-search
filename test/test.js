/* jshint expr: true */

'use strict';

const describe = require('mocha').describe;
const it = require('mocha').it;
const expect = require('chai').expect;
const sinon = require('sinon');

const fullSearch = require('../lib/fullSearch');
const fullSearchStream = require('../lib/fullSearchStream');
const fullSearchRaw = require('../lib/fullSearchRaw');
const fullSearchStreamRaw = require('../lib/fullSearchStreamRaw');

describe('fullSearch', () => {
  it('should return an error in the callback', (done) => {
    var elasticClient = createStubElasticClient(new Error('sample'));

    fullSearch(elasticClient, {}, '5s', (err, docs) => {
      expect(err).to.be.instanceof(Error);
      expect(err.message).to.be.equal('sample');
      done();
    });
  });

  it('should auto configure the params for scroll search', (done) => {
    var elasticClient = createStubElasticClient();

    var params = {};
    fullSearch(elasticClient, params, '5s', (err, docs) => {
      expect(params).to.have.property('scroll', '5s');
      expect(params).to.have.property('search_type', 'scan');
      done();
    });
  });

  it('should return 3 hits', (done) => {
    var elasticClient = createStubElasticClient(null, [[{ a: 1 }, { a: 2 }], [{ a: 3 }]]);

    fullSearch(elasticClient, {}, '5s', (err, docs) => {
      expect(err).to.be.not.ok;
      expect(docs).to.have.lengthOf(3);
      done();
    });
  });
});

describe('fullSearchStream', () => {
  it('should return an error in the callback', (done) => {
    var elasticClient = createStubElasticClient(new Error('sample'));

    var stream = fullSearchStream(elasticClient, {}, '5s');
    stream.pipe(process.stdout);
    stream.on('error', (err) => {
      expect(err).to.be.instanceof(Error);
      expect(err.message).to.be.equal('sample');
      done();
    });
  });

  it('should configure the params', (done) => {
    var elasticClient = createStubElasticClient();

    var params = {};
    var stream = fullSearchStream(elasticClient, params, '5s');
    stream.pipe(process.stdout);
    stream.on('end', () => {
      expect(params).to.have.property('scroll', '5s');
      expect(params).to.have.property('search_type', 'scan');
      done();
    });
  });

  it('should return 3 hits', (done) => {
    var elasticClient = createStubElasticClient(null, [[{ a: 1 }, { a: 2 }], [{ a: 3 }]]);

    var stream = fullSearchStream(elasticClient, {}, '5s');
    var totalDocs = [];
    stream.on('data', (docs) => {
      totalDocs = totalDocs.concat(docs);
    });
    stream.on('end', () => {
      expect(totalDocs).to.have.lengthOf(3);
      done();
    });
  });
});

describe('fullSearchRaw', () => {
  it('should return an error in the callback', (done) => {
    var elasticClient = createStubElasticRawClient(new Error('sample'));

    fullSearchRaw(elasticClient, {}, '5s', (err, docs) => {
      expect(err).to.be.instanceof(Error);
      expect(err.message).to.be.equal('sample');
      done();
    });
  });

  it('should configure the params', (done) => {
    var elasticClient = createStubElasticRawClient();

    var params = {};
    fullSearchRaw(elasticClient, params, '5s', (err, docs) => {
      expect(params).to.have.property('scroll', '5s');
      expect(params).to.have.property('search_type', 'scan');
      done();
    });
  });

  it('should return 3 hits', (done) => {
    var elasticClient = createStubElasticRawClient(null, [[{ a: 1 }, { a: 2 }], [{ a: 3 }]]);

    fullSearchRaw(elasticClient, {}, '5s', (err, docsString) => {
      expect(err).to.be.not.ok;
      expect(docsString).to.be.a('string');
      expect(JSON.parse(docsString)).to.have.lengthOf(3);
      done();
    });
  });
});

describe('fullSearchStreamRaw', () => {
  it('should return an error in the callback', (done) => {
    var elasticClient = createStubElasticRawClient(new Error('sample'));

    var stream = fullSearchStreamRaw(elasticClient, {}, '5s');
    stream.pipe(process.stdout);
    stream.on('error', (err) => {
      expect(err).to.be.instanceof(Error);
      expect(err.message).to.be.equal('sample');
      done();
    });
  });

  it('should configure the params', (done) => {
    var elasticClient = createStubElasticRawClient();

    var params = {};
    var stream = fullSearchStreamRaw(elasticClient, params, '5s');
    stream.pipe(process.stdout);
    stream.on('end', () => {
      expect(params).to.have.property('scroll', '5s');
      expect(params).to.have.property('search_type', 'scan');
      done();
    });
  });

  it('should return 3 hits', (done) => {
    var elasticClient = createStubElasticRawClient(null, [[{ a: 1 }, { a: 2 }], [{ a: 3 }]]);

    var stream = fullSearchStreamRaw(elasticClient, {}, '5s');
    var totalDocs = [];
    stream.on('data', (docsBuff) => {
      totalDocs = totalDocs.concat(JSON.parse(docsBuff.toString()));
    });
    stream.on('end', () => {
      expect(totalDocs).to.have.lengthOf(3);
      done();
    });
  });
});

function createStubElasticClient(error, hitsArray) {
  error = error || null;
  hitsArray = hitsArray || [];

  var total = 0;
  hitsArray.forEach((hits) => total += hits.length);

  var elasticClient = { search: sinon.stub(), scroll: sinon.stub() };
  elasticClient.search.yieldsAsync(error,
      { _scroll_id: 'scroll_id', hits: { hits: [], total: total } });

  hitsArray.forEach((hits, index) => {
    elasticClient.scroll.onCall(index).yieldsAsync(null, { _scroll_id: 'scroll_id',
      hits: { hits: hits, total: total } });
  });

  elasticClient.scroll.onCall(hitsArray.length).yieldsAsync(null, { _scroll_id: 'scroll_id',
    hits: { hits: [], total: total } });

  return elasticClient;
}

function createStubElasticRawClient(error, hitsArray) {
  error = error || null;
  hitsArray = hitsArray || [];

  var total = 0;
  hitsArray.forEach((hits) => total += hits.length);

  var elasticClient = { search: sinon.stub(), scroll: sinon.stub() };
  elasticClient.search.yieldsAsync(error,
      JSON.stringify({ _scroll_id: 'scroll_id', hits: { hits: [], total: total } }));

  hitsArray.forEach((hits, index) => {
    elasticClient.scroll.onCall(index).yieldsAsync(null, JSON.stringify({
      _scroll_id: 'scroll_id',
      hits: { hits: hits, total: total }
    }));
  });

  elasticClient.scroll.onCall(hitsArray.length).yieldsAsync(null, JSON.stringify({
    _scroll_id: 'scroll_id',
    hits: { hits: [], total: total }
  }));

  return elasticClient;
}
