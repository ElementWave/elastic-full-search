/* jshint expr: true */

'use strict';

const describe = require('mocha').describe;
const it = require('mocha').it;
const expect = require('chai').expect;
const sinon = require('sinon');

const fullSearch = require('../lib/fullSearch');
const fullSearchStream = require('../lib/fullSearchStream');

describe('fullSearch', () => {
  it('should return an error in the callback', () => {
    var elasticClient = { search: sinon.stub() };
    elasticClient.search.yields(new Error());

    fullSearch(elasticClient, {}, '5s', (err, docs) => {
      expect(err).to.be.instanceof(Error);
    });
  });

  it('should configure the params', () => {
    var elasticClient = { search: sinon.stub(), scroll: sinon.stub() };
    elasticClient.search.yields(null, { hits: { hits: [], total: 0 } });

    var params = {};
    fullSearch(elasticClient, params, '5s', (err, docs) => {
      expect(params).to.have.property('scroll', '5s');
      expect(params).to.have.property('search_type', 'scan');
    });
  });

  it('should return five hits', () => {
    var elasticClient = { search: sinon.stub(), scroll: sinon.stub() };
    elasticClient.search.yields(null, { hits: { hits: [{ a: 1 }, { a: 2 }], total: 3 } });
    elasticClient.scroll.yields(null, { hits: { hits: [{ a: 3 }], total: 3 } });

    fullSearch(elasticClient, {}, '5s', (err, docs) => {
      expect(err).to.be.not.ok;
      expect(docs).to.have.lengthOf(3);
    });
  });
});

describe('fullSearchStream', () => {
  it('should return an error in the callback', (done) => {
    var elasticClient = { search: sinon.stub() };
    elasticClient.search.yields(new Error());

    var stream = fullSearchStream(elasticClient, {}, '5s');
    stream.pipe(process.stdout);
    stream.on('error', (err) => {
      expect(err).to.be.instanceof(Error);
      done();
    });
  });

  it('should configure the params', (done) => {
    var elasticClient = { search: sinon.stub(), scroll: sinon.stub() };
    elasticClient.search.yields(null, { hits: { hits: [], total: 0 } });

    var params = {};
    var stream = fullSearchStream(elasticClient, params, '5s');
    stream.pipe(process.stdout);
    stream.on('end', () => {
      expect(params).to.have.property('scroll', '5s');
      expect(params).to.have.property('search_type', 'scan');
      done();
    });
  });

  it('should return five hits', (done) => {
    var elasticClient = { search: sinon.stub(), scroll: sinon.stub() };
    elasticClient.search.yields(null, { hits: { hits: [{ a: 1 }, { a: 2 }], total: 3 } });
    elasticClient.scroll.yields(null, { hits: { hits: [{ a: 3 }], total: 3 } });

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
