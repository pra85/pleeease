'use strict';

var Options  = require('../lib/options');
var fs       = require('fs');

/**
 *
 * Describe Options
 *
 */
describe('Options', function () {

  var opts;

  beforeEach(function () {
    opts = {};
  });

  it('creates options', function () {
    opts = new Options();
    opts.should.have.property('options');
    opts.options.should.not.eql({});
  });

  it('creates options with default values', function () {
    opts = new Options();
    opts = opts.options;
    opts.should.have.property('autoprefixer').eql({});
  });

  it('extends values', function () {
    opts.autoprefixer = {
      browsers: ['last 20 versions']
    };
    opts = new Options().extend(opts);
    opts.autoprefixer.browsers.should.eql(['last 20 versions']);

    opts = {
      rem: {rootValue: '10px', replace: true}
    };
    opts = new Options().extend(opts);
    opts.rem.should.eql({rootValue: '10px', replace: true});
  });

  it('extends values when set to true', function () {
    opts.autoprefixer = true;
    opts = new Options().extend(opts);
    opts.autoprefixer.should.eql({});

    opts.minifier = true;
    opts = new Options().extend(opts);
    opts.minifier.should.have.property('preserveHacks').eql(true);

    opts.mqpacker = true;
    opts = new Options().extend(opts);
    opts.mqpacker.should.eql({});
  });

  it('extends values when an object is set', function () {
    opts.minifier = {
      removeAllComments: true
    };
    opts = new Options().extend(opts);
    opts.minifier.should.have.property('removeAllComments').eql(true);
    opts.minifier.should.have.property('preserveHacks').eql(true);
  });

  it('extends values when an object containing a default value is set', function () {
    opts.minifier = {
      preserveHacks: false,
      removeAllComments: true
    };
    opts = new Options().extend(opts);
    opts.minifier.should.have.property('removeAllComments').eql(true);
    opts.minifier.should.have.property('preserveHacks').eql(false);
  });

  it('does not extend values for old pleeease.next', function () {
    opts.next = true;
    opts = new Options().extend(opts);
    opts.next.should.not.have.property('customProperties');
    opts.next.should.not.have.property('calc').eql(true);
  });

  it('does not extend options/values from configuration file', function () {
    var json = '{"minifier": false}';
    fs.writeFileSync('test/.pleeeaserc', json);
    opts = new Options().extend({});
    opts.minifier.should.not.eql(false);
    fs.unlinkSync('test/.pleeeaserc');
  });

  it('overrides multiple options when `browsers` option is set', function () {
    opts.rem = true;
    opts.opacity = true;
    opts.pseudoElements = true;
    opts.browsers = ['ie 9'];
    opts = new Options().extend(opts);
    opts.rem.should.eql(false);
    opts.opacity.should.eql(false);
    opts.pseudoElements.should.eql(false);
  });

  it('copies values in autoprefixer.browsers only if undefined', function () {
    opts.browsers = ['ie 9'];
    opts.autoprefixer = false;
    opts = new Options().extend(opts);
    opts.autoprefixer.should.eql(false);

    opts.autoprefixer = true;
    opts = new Options().extend(opts);
    opts.autoprefixer.should.eql({browsers: ['ie 9']});

    opts.autoprefixer = {browsers: ['ie 8']};
    opts = new Options().extend(opts);
    opts.autoprefixer.should.have.property('browsers').eql(['ie 8']);
  });

  it('has correct values when multiple browsers are set', function () {
    opts.browsers = ['last 99 versions'];
    opts = new Options().extend(opts);
    opts.rem.should.eql({rootValue: '16px'});
    opts.opacity.should.eql(true);
    opts.pseudoElements.should.eql(true);
  });

  it('doesn\'t override values when `browsers` option is set in `autoprefixer`', function () {
    opts.autoprefixer = {browsers: ['ie 9']};
    opts.rem = {rootValue: '20px'};
    opts = new Options().extend(opts);
    opts.rem.should.eql({rootValue: '20px'});
  });

  it('doesn\'t use `autoprefixer.browsers` key', function () {
    opts.autoprefixer = {browsers: ['ie 8']};
    opts.browsers = ['ie 9'];
    opts = new Options().extend(opts);
    opts.rem.should.eql(false);
  });

  it('converts `browsers` option to Array if it\'s not', function () {
    opts.browsers = 'ie 9';
    opts = new Options().extend(opts);
    opts.autoprefixer.should.have.property('browsers').eql(['ie 9']);
  });

  it('errors when using multiple preprocessors', function () {
    opts.sass = true;
    opts.less = true;
    (function () {
      return new Options().extend(opts);
    }).should.throwError();
  });

});
