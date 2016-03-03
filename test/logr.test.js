/* global describe, it, beforeEach */
'use strict';
const expect = require('chai').expect;
const Logr = require('../');

describe('logr', () => {
  let lastMessage = null;

  beforeEach((done) => {
    const originalConsole = console.log;
    console.log = function(msg) { //eslint-disable-line
      lastMessage = msg;
      originalConsole.apply(null, arguments);
    };
    done();
  });

  describe('init', () => {
    it('should return a function', () => {
      const log = new Logr();
      expect(typeof log).to.equal('function');
    });
  });

  describe('console', () => {
    it('should output to console formatted', () => {
      const log = new Logr();
      log(['tag1', 'tag2'], 'message');
      expect(lastMessage).to.contain('[tag1,tag2] message');
    });
    it('should allow disable timestamp', () => {
      const log = new Logr({
        renderOptions: {
          console: {
            timestamp: false
          }
        }
      });
      log(['tag1', 'tag2'], 'message');
      expect(lastMessage).to.equal('[tag1,tag2] message');
    });

    it('should stringify json', () => {
      const log = new Logr({ renderOptions: { console: { timestamp: false } } });
      log(['tag1'], { message: 'hi there' });
      expect(lastMessage).to.equal('[tag1] {"message":"hi there"}');
    });

    it('should stringify json in a safe way', () => {
      const circularObj = {};
      circularObj.circularRef = circularObj;
      circularObj.list = [circularObj, circularObj];
      const log = new Logr({ renderOptions: { console: { timestamp: false } } });
      log(['tag1'], circularObj);
      expect(lastMessage).to.equal('[tag1] {"circularRef":"[Circular ~]","list":["[Circular ~]","[Circular ~]"]}');
    });

    it('should allow pretty printing json', () => {
      const log = new Logr({
        renderOptions: {
          console: {
            timestamp: false,
            pretty: true
          }
        }
      });
      log(['tag1'], { message: 'hi there' });
      expect(lastMessage).to.equal('[tag1] {\n  "message": "hi there"\n}');
    });

    it('should replace escaped newlines if pretty', () => {
      const log = new Logr({
        renderOptions: {
          console: {
            timestamp: false,
            pretty: true
          }
        }
      });
      log(['tag1'], { message: 'hi\nthere' });
      expect(lastMessage).to.equal('[tag1] {\n  "message": "hi\nthere"\n}');
    });

    it('should color tags', () => {
      const log = new Logr({
        renderOptions: {
          console: {
            timestamp: false,
            pretty: true,
            colors: {
              tag1: 'red'
            }
          }
        }
      });
      log(['tag1'], 'message');
      expect(lastMessage).to.equal('[\u001b[31mtag1\u001b[0m] message');
    });
    it('should default color error, warn, notice', () => {
      const log = new Logr({
        renderOptions: {
          console: {
            timestamp: false,
            pretty: true
          }
        }
      });
      log(['error', 'warn', 'notice'], 'message');
      expect(lastMessage).to.equal('[\u001b[31merror\u001b[0m,\u001b[33mwarn\u001b[0m,\u001b[34mnotice\u001b[0m] message');
    });

    it('should allow to disable colors', () => {
      const log = new Logr({
        renderOptions: {
          console: {
            timestamp: false,
            pretty: true,
            colors: false
          }
        }
      });
      log(['error', 'warn', 'notice'], 'message');
      expect(lastMessage).to.equal('[error,warn,notice] message');
    });

    it('should allow default tags to be set', () => {
      const log = new Logr({
        defaultTags: ['default'],
        renderOptions: {
          console: {
            timestamp: false
          }
        }
      });
      log(['tag1'], 'test');
      expect(lastMessage).to.equal('[default,tag1] test');
    });
  });

  describe('json', () => {
    it('should output to json formatted', () => {
      const log = new Logr({ type: 'json' });
      log(['tag1', 'tag2'], 'message');
      expect(typeof lastMessage).to.equal('string');
      const jsonMessage = JSON.parse(lastMessage);
      expect(jsonMessage.tags).to.deep.equal(['tag1', 'tag2']);
      expect(jsonMessage.message).to.equal('message');
      expect(jsonMessage.timestamp).to.exist;
    });
    it('should output tags as objects if config set', () => {
      const log = new Logr({
        type: 'json',
        renderOptions: {
          json: {
            tagsObject: true
          }
        }
      });
      log(['tag1', 'tag2'], 'message');
      expect(typeof lastMessage).to.equal('string');
      const jsonMessage = JSON.parse(lastMessage);
      expect(jsonMessage.tags).to.deep.equal({ tag1: true, tag2: true });
      expect(jsonMessage.message).to.equal('message');
      expect(jsonMessage.timestamp).to.exist;
    });
    it('should allow additional data to be logged', () => {
      const log = new Logr({
        type: 'json',
        renderOptions: {
          json: {
            additional: {
              host: 'blah.com'
            }
          }
        }
      });
      log(['tag1', 'tag2'], 'message');
      expect(typeof lastMessage).to.equal('string');
      const jsonMessage = JSON.parse(lastMessage);
      expect(jsonMessage.tags).to.deep.equal(['tag1', 'tag2']);
      expect(jsonMessage.message).to.equal('message');
      expect(jsonMessage.host).to.equal('blah.com');
      expect(jsonMessage.timestamp).to.exist;
    });
    it('should stringify json in a safe way', () => {
      const circularObj = {};
      circularObj.circularRef = circularObj;
      circularObj.list = [circularObj, circularObj];
      const log = new Logr({ type: 'json' });
      log(['tag1'], circularObj);
    });
  });

  describe('filter', () => {
    it('should filter based on tags', () => {
      const log = new Logr({ filter: ['tag1'], renderOptions: { console: { timestamp: false } } });
      log(['tag1'], 'message1');
      expect(lastMessage).to.equal('[tag1] message1');
      log(['tag2'], 'message2');
      expect(lastMessage).to.equal('[tag1] message1');
    });
  });
});
