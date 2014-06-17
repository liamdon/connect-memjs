
# connect-memjs

  Memcached session store forked from using [connect-memcached](https://github.com/balor/connect-memcached), using [memjs](https://github.com/alevy/memjs) as the underlying memcached client.

  This enables faster binary transport and authentication, which is needed to use the [Memcachier](https://www.memcachier.com) service.

  Many thanks to [balor](https://github.com/balor) who wrote the original implementation - this module simply swaps out the memcached client.

## Installation

  via npm:

      $ npm install connect-memjs

## Example

      /**
      * Module dependencies.
      */

      var express = require('express')
        , session = require('express-session')
        , favicon = require('serve-favicon')
        , logger = require('morgan')
        , cookieParser = require('cookie-parser')
        , http = require('http')
        , app = express();

      // pass the express to the connect memcached module
      // allowing it to inherit from express.session.Store
      var MemcachedStore = require('connect-memjs')(session);

      app.use(favicon());

      // request logging
      app.use(logger());

      // required to parse the session cookie
      app.use(cookieParser());

      // Populates:
      // - req.session
      // - req.sessionStore
      // - req.sessionID (or req.session.id)

      var store = new MemcachedStore({servers: ['127.0.0.1:1121'], username: 'liam', password: 'hunter2'});
      app.use(session({ 
        secret: 'CatOnTheKeyboard', 
        store:  
      }));

      app.get('/', function(req, res){
        if (req.session.views) {
          ++req.session.views;
        } else {
          req.session.views = 1;
        }
        res.send('Viewed <strong>' + req.session.views + '</strong> times.');
      });

      http.createServer(app).listen(3000, function(){
        console.log('Express app started on port 3000');
      });

## Options

    - `servers` Memcached servers locations, as an array of strings.
    - `username` An optional username to authenticate with
    - `password` An optional password to authenticate with
    - `prefix` An optional prefix for each memcache key, in case you are sharing 
               your memcached servers with something generating its own keys. 
    - ...     Rest of given option will be passed directly to the node-memcached constructor.

  For details see [memjs](https://github.com/alevy/memjs).

## License 

(The MIT License)

Copyright (c) 2013 Liam Don &lt;liamdon@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
