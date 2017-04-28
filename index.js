/**
 * fis.baidu.com
 */
var _ = fis.util;
var path = require('path');
var prompt = require('prompt');
var Client = require('ssh2').Client;
var streamifier = require('streamifier');



function deploy(options, release, content, file, callback) {
  if (!options.password && !options.privateKey) {
    requirePassword(options, fn);
  } else {
    fn();
  }

  function fn() {
    getSFtpClient(options, function(error, sftp) {
      if (error) {
        return callback(error);
      }

      var filepath = path.join(options.to, release);
      sftp.mkdir(path.dirname(filepath), function(err) {
        // if (err) {
        //   console.log(err, 'Mkdir failed: %s', path.dirname(filepath));
        //   return callback(err);
        // }

        var readStream = streamifier.createReadStream(content);
        var writeStream = sftp.createWriteStream(filepath, {
          encoding: 'utf8',
          autoClose: true
        });

        writeStream.on('close', function() {
          var time = '[' + fis.log.now(true) + ']';
          process.stdout.write(
              '\n - '.green.bold +
              time.grey + ' ' +
              file.subpath.replace(/^\//, '') +
              ' >> '.yellow.bold +
              filepath
          );

          callback();
        });

        writeStream.on('error', callback);
        readStream.pipe(writeStream);
      });
    });
  }
}

var client;
var sftpClient;
function getSFtpClient(options, cb) {
  if (client) {
    return cb(null, sftpClient);
  }

  var conn = new Client();
  conn.on('ready', function() {
    console.log('Client :: ready');
    client = conn;

    conn.sftp(function(error, sftp) {

      if (error) {
        return cb(error);
      }

      console.log('SFTP :: ready');

      sftpClient = sftp;
      cb(null, sftp);
    });
  });
  conn.on('error', cb);
  conn.connect(options);
  console.log('try to connect to %s:%d', options.host, options.port);
};

function requirePassword(options, cb) {
  console.log();
  console.log();
  prompt.start();
  prompt.get({
    properties: {
      pw: {
        description: 'password for ' + options.username + '@' + options.host,
        required: true/*,
        hidden: true*/
      }
    }
  }, function(error, ret) {
    if (error) {
      return cb(error);
    }

    options.password = ret.pw;
    cb(null, options);
  });
}

module.exports = function(options, modified, total, callback) {
  if (!options.to) {
    throw new Error('options.to is required!');
  } else if (!options.host) {
    throw new Error('options.host is required!');
  } else if (!options.username) {
    throw new Error('options.username is required!');
  }

  var steps = [];

  modified.forEach(function(file) {
    var reTryCount = options.retry;

    steps.push(function(next) {
      deploy(options, file.getHashRelease(), file.getContent(), file, function(error) {
        if (error) {
          throw new Error(error);
        } else {
          next();
        }
      });
    });
  });

  _.reduceRight(steps, function(next, current) {
    return function() {
      current(next);
    };
  }, function() {
    client && client.end();
    client = null;
    callback();
  })();
};

module.exports.options = {
  host: '',
  port: 22,
  username: '',
  password: '',
  to: '/tmp'
};
