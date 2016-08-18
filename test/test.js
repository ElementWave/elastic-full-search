'use strict';

const describe = require('mocha').describe;
const it = require('mocha').it;
const chai = require('chai');

describe('test', () => {
  it('should be true', () => {
    chai.assert(true, 'true');
  });
});
