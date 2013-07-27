/*!
 * connect-memcached
 * Copyright(c) 2012 Michał Thoma <michal@balor.pl>
 * MIT Licensed
 */

/**
 * Library version.
 */

exports.version = '0.0.3';


/**
 * Module dependencies.
 */

var memjs = require('memjs');

/**
 * One day in seconds.
 */

var oneDay = 86400;
var thirtyDays = 2592000;



/**
 * Return the `MemcachedStore` extending `connect`'s session Store.
 * 
 * @param {object} connect
 * @return {Function}
 * @api public
 */

module.exports = function(connect){

  /**
   * Connect's Store.
   */

  var Store = connect.session.Store;

  /**
   * Initialize MemcachedStore with the given `options`.
   *
   * @param {Object} options
   * @api public
   */

  function MemcachedStore(options) {
    var log = options.loggingFunction || console.log;

    options = options || {};
    Store.call(this, options);
    if (!options.servers) {
        options.servers = ['127.0.0.1:11211'];
    }
    var servers = options.servers.join(',')

    if (options.prefix) {
        this.prefix = options.prefix;
    }

    this.client = new memjs.Client.create(servers, options)
    log("memjs initialized for servers: " + servers);

    //this.client.on("issue", function(issue) {
    //    log("memjs::Issue @ " + issue.server + ": " + 
    //        issue.messages + ", " + issue.retries  + " attempts left");
    //});
  };

  /**
   * Inherit from `Store`.
   */

  MemcachedStore.prototype.__proto__ = Store.prototype;

  /**
   * A string prefixed to every memcached key, in case you want to share servers
   * with something generating its own keys.
   * @api private
   */
  MemcachedStore.prototype.prefix = '';

   /**
   * Translates the given `sid` into a memcached key, optionally with prefix.
   * 
   * @param {String} sid
   * @api private
   */
  MemcachedStore.prototype.getKey = function getKey(sid) {
    return this.prefix + sid;
  };

  /**
   * Attempt to fetch session by the given `sid`.
   * 
   * @param {String} sid
   * @param {Function} fn
   * @api public
   */

  MemcachedStore.prototype.get = function(sid, fn) {
      sid = this.getKey(sid);

      this.client.get(sid, function(err, data) {
          try {
              if (!data) {
                 return fn();
              }
              fn(null, JSON.parse(data.toString()));
          } catch (err) {
              fn(err);
          } 
      });
  };

  /**
   * Commit the given `sess` object associated with the given `sid`.
   *
   * @param {String} sid
   * @param {Session} sess
   * @param {Function} fn
   * @api public
   */

  MemcachedStore.prototype.set = function(sid, sess, fn) {
      sid = this.getKey(sid);

      try {
          var maxAge = sess.cookie.maxAge
          var ttl = 'number' == typeof maxAge ? maxAge / 1000 | 0 : oneDay
          // If the ttl is longer than memcached's limit of 30 days,
          // do not set a ttl.
          if (ttl >= thirtyDays) {
            ttl = 0;
          }
          var sess = JSON.stringify(sess);

          this.client.set(sid, sess, function() {
              fn && fn.apply(this, arguments);
          }, ttl);
      } catch (err) {
          fn && fn(err);
      } 
  };

  /**
   * Destroy the session associated with the given `sid`.
   * 
   * @param {String} sid
   * @api public
   */

  MemcachedStore.prototype.destroy = function(sid, fn) {
        sid = this.getKey(sid);

        this.client.delete(sid, fn);
  };

  /**
   * Fetch number of sessions.
   *
   * @param {Function} fn
   * @api public
   */

  MemcachedStore.prototype.length = function(fn) {
        // memjs doesn't have this function
        return fn(null);
  };

  /**
   * Clear all sessions.
   * 
   * @param {Function} fn
   * @api public
   */ 

  MemcachedStore.prototype.clear = function(fn) {
        this.client.flush(fn);
  };

  return MemcachedStore;
};
