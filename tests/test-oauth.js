'use strict'

var oauth = require('oauth-sign')
  , qs = require('querystring')
  , fs = require('fs')
  , path = require('path')
  , request = require('../index')
  , tape = require('tape')

function getSignature(r) {
  var sign
  r.headers.Authorization.slice('OAuth '.length).replace(/,\ /g, ',').split(',').forEach(function(v) {
    if (v.slice(0, 'oauth_signature="'.length) === 'oauth_signature="') {
      sign = v.slice('oauth_signature="'.length, -1)
    }
  })
  return decodeURIComponent(sign)
}

// Tests from Twitter documentation https://dev.twitter.com/docs/auth/oauth

var hmacsign = oauth.hmacsign
  , rsasign = oauth.rsasign
  , rsa_private_pem = fs.readFileSync(path.join(__dirname, 'ssl', 'test.key'))
  , reqsign
  , reqsign_rsa
  , accsign
  , accsign_rsa
  , upsign
  , upsign_rsa

tape('reqsign', function(t) {
  reqsign = hmacsign('POST', 'https://api.twitter.com/oauth/request_token',
    { oauth_callback: 'http://localhost:3005/the_dance/process_callback?service_provider_id=11'
    , oauth_consumer_key: 'GDdmIQH6jhtmLUypg82g'
    , oauth_nonce: 'QP70eNmVz8jvdPevU3oJD2AfF7R7odC2XJcn4XlZJqk'
    , oauth_signature_method: 'HMAC-SHA1'
    , oauth_timestamp: '1272323042'
    , oauth_version: '1.0'
    }, 'MCD8BKwGdgPHvAuvgvz4EQpqDAtx89grbuNMRd7Eh98')

  t.equal(reqsign, '8wUi7m5HFQy76nowoCThusfgB+Q=')
  t.end()
})

tape('reqsign_rsa', function(t) {
  reqsign_rsa = rsasign('POST', 'https://api.twitter.com/oauth/request_token',
    { oauth_callback: 'http://localhost:3005/the_dance/process_callback?service_provider_id=11'
    , oauth_consumer_key: 'GDdmIQH6jhtmLUypg82g'
    , oauth_nonce: 'QP70eNmVz8jvdPevU3oJD2AfF7R7odC2XJcn4XlZJqk'
    , oauth_signature_method: 'RSA-SHA1'
    , oauth_timestamp: '1272323042'
    , oauth_version: '1.0'
    }, rsa_private_pem, 'this parameter is not used for RSA signing')

  t.equal(reqsign_rsa, 'MXdzEnIrQco3ACPoVWxCwv5pxYrm5MFRXbsP3LfRV+zfcRr+WMp/dOPS/3r+Wcb+17Z2IK3uJ8dMHfzb5LiDNCTUIj7SWBrbxOpy3Y6SA6z3vcrtjSekkTHLek1j+mzxOi3r3fkbYaNwjHx3PyoFSazbEstnkQQotbITeFt5FBE=')
  t.end()
})

tape('accsign', function(t) {
  accsign = hmacsign('POST', 'https://api.twitter.com/oauth/access_token',
    { oauth_consumer_key: 'GDdmIQH6jhtmLUypg82g'
    , oauth_nonce: '9zWH6qe0qG7Lc1telCn7FhUbLyVdjEaL3MO5uHxn8'
    , oauth_signature_method: 'HMAC-SHA1'
    , oauth_token: '8ldIZyxQeVrFZXFOZH5tAwj6vzJYuLQpl0WUEYtWc'
    , oauth_timestamp: '1272323047'
    , oauth_verifier: 'pDNg57prOHapMbhv25RNf75lVRd6JDsni1AJJIDYoTY'
    , oauth_version: '1.0'
    }, 'MCD8BKwGdgPHvAuvgvz4EQpqDAtx89grbuNMRd7Eh98', 'x6qpRnlEmW9JbQn4PQVVeVG8ZLPEx6A0TOebgwcuA')

  t.equal(accsign, 'PUw/dHA4fnlJYM6RhXk5IU/0fCc=')
  t.end()
})

tape('accsign_rsa', function(t) {
  accsign_rsa = rsasign('POST', 'https://api.twitter.com/oauth/access_token',
    { oauth_consumer_key: 'GDdmIQH6jhtmLUypg82g'
    , oauth_nonce: '9zWH6qe0qG7Lc1telCn7FhUbLyVdjEaL3MO5uHxn8'
    , oauth_signature_method: 'RSA-SHA1'
    , oauth_token: '8ldIZyxQeVrFZXFOZH5tAwj6vzJYuLQpl0WUEYtWc'
    , oauth_timestamp: '1272323047'
    , oauth_verifier: 'pDNg57prOHapMbhv25RNf75lVRd6JDsni1AJJIDYoTY'
    , oauth_version: '1.0'
    }, rsa_private_pem)

  t.equal(accsign_rsa, 'gZrMPexdgGMVUl9H6RxK0MbR6Db8tzf2kIIj52kOrDFcMgh4BunMBgUZAO1msUwz6oqZIvkVqyfyDAOP2wIrpYem0mBg3vqwPIroSE1AlUWo+TtQxOTuqrU+3kDcXpdvJe7CAX5hUx9Np/iGRqaCcgByqb9DaCcQ9ViQ+0wJiXI=')
  t.end()
})

tape('upsign', function(t) {
  upsign = hmacsign('POST', 'http://api.twitter.com/1/statuses/update.json',
    { oauth_consumer_key: 'GDdmIQH6jhtmLUypg82g'
    , oauth_nonce: 'oElnnMTQIZvqvlfXM56aBLAf5noGD0AQR3Fmi7Q6Y'
    , oauth_signature_method: 'HMAC-SHA1'
    , oauth_token: '819797-Jxq8aYUDRmykzVKrgoLhXSq67TEa5ruc4GJC2rWimw'
    , oauth_timestamp: '1272325550'
    , oauth_version: '1.0'
    , status: 'setting up my twitter 私のさえずりを設定する'
    }, 'MCD8BKwGdgPHvAuvgvz4EQpqDAtx89grbuNMRd7Eh98', 'J6zix3FfA9LofH0awS24M3HcBYXO5nI1iYe8EfBA')

  t.equal(upsign, 'yOahq5m0YjDDjfjxHaXEsW9D+X0=')
  t.end()
})

tape('upsign_rsa', function(t) {
  upsign_rsa = rsasign('POST', 'http://api.twitter.com/1/statuses/update.json',
    { oauth_consumer_key: 'GDdmIQH6jhtmLUypg82g'
    , oauth_nonce: 'oElnnMTQIZvqvlfXM56aBLAf5noGD0AQR3Fmi7Q6Y'
    , oauth_signature_method: 'RSA-SHA1'
    , oauth_token: '819797-Jxq8aYUDRmykzVKrgoLhXSq67TEa5ruc4GJC2rWimw'
    , oauth_timestamp: '1272325550'
    , oauth_version: '1.0'
    , status: 'setting up my twitter 私のさえずりを設定する'
    }, rsa_private_pem)

  t.equal(upsign_rsa, 'fF4G9BNzDxPu/htctzh9CWzGhtXo9DYYl+ZyRO1/QNOhOZPqnWVUOT+CGUKxmAeJSzLKMAH8y/MFSHI0lzihqwgfZr7nUhTx6kH7lUChcVasr+TZ4qPqvGGEhfJ8Av8D5dF5fytfCSzct62uONU0iHYVqainP+zefk1K7Ptb6hI=')
  t.end()
})

tape('rsign', function(t) {
  var rsign = request.post(
    { url: 'https://api.twitter.com/oauth/request_token'
    , oauth:
      { callback: 'http://localhost:3005/the_dance/process_callback?service_provider_id=11'
      , consumer_key: 'GDdmIQH6jhtmLUypg82g'
      , nonce: 'QP70eNmVz8jvdPevU3oJD2AfF7R7odC2XJcn4XlZJqk'
      , timestamp: '1272323042'
      , version: '1.0'
      , consumer_secret: 'MCD8BKwGdgPHvAuvgvz4EQpqDAtx89grbuNMRd7Eh98'
      }
    })

  process.nextTick(function() {
    t.equal(reqsign, getSignature(rsign))
    rsign.abort()
    t.end()
  })
})

tape('rsign_rsa', function(t) {
  var rsign_rsa = request.post(
    { url: 'https://api.twitter.com/oauth/request_token'
    , oauth:
      { callback: 'http://localhost:3005/the_dance/process_callback?service_provider_id=11'
      , consumer_key: 'GDdmIQH6jhtmLUypg82g'
      , nonce: 'QP70eNmVz8jvdPevU3oJD2AfF7R7odC2XJcn4XlZJqk'
      , timestamp: '1272323042'
      , version: '1.0'
      , private_key: rsa_private_pem
      , signature_method: 'RSA-SHA1'
      }
    })

  process.nextTick(function() {
    t.equal(reqsign_rsa, getSignature(rsign_rsa))
    rsign_rsa.abort()
    t.end()
  })
})

tape('raccsign', function(t) {
  var raccsign = request.post(
    { url: 'https://api.twitter.com/oauth/access_token'
    , oauth:
      { consumer_key: 'GDdmIQH6jhtmLUypg82g'
      , nonce: '9zWH6qe0qG7Lc1telCn7FhUbLyVdjEaL3MO5uHxn8'
      , signature_method: 'HMAC-SHA1'
      , token: '8ldIZyxQeVrFZXFOZH5tAwj6vzJYuLQpl0WUEYtWc'
      , timestamp: '1272323047'
      , verifier: 'pDNg57prOHapMbhv25RNf75lVRd6JDsni1AJJIDYoTY'
      , version: '1.0'
      , consumer_secret: 'MCD8BKwGdgPHvAuvgvz4EQpqDAtx89grbuNMRd7Eh98'
      , token_secret: 'x6qpRnlEmW9JbQn4PQVVeVG8ZLPEx6A0TOebgwcuA'
      }
    })

  process.nextTick(function() {
    t.equal(accsign, getSignature(raccsign))
    raccsign.abort()
    t.end()
  })
})

tape('raccsign_rsa', function(t) {
  var raccsign_rsa = request.post(
    { url: 'https://api.twitter.com/oauth/access_token'
    , oauth:
      { consumer_key: 'GDdmIQH6jhtmLUypg82g'
      , nonce: '9zWH6qe0qG7Lc1telCn7FhUbLyVdjEaL3MO5uHxn8'
      , signature_method: 'RSA-SHA1'
      , token: '8ldIZyxQeVrFZXFOZH5tAwj6vzJYuLQpl0WUEYtWc'
      , timestamp: '1272323047'
      , verifier: 'pDNg57prOHapMbhv25RNf75lVRd6JDsni1AJJIDYoTY'
      , version: '1.0'
      , private_key: rsa_private_pem
      , token_secret: 'x6qpRnlEmW9JbQn4PQVVeVG8ZLPEx6A0TOebgwcuA'
      }
    })

  process.nextTick(function() {
    t.equal(accsign_rsa, getSignature(raccsign_rsa))
    raccsign_rsa.abort()
    t.end()
  })
})

tape('rupsign', function(t) {
  var rupsign = request.post(
    { url: 'http://api.twitter.com/1/statuses/update.json'
    , oauth:
      { consumer_key: 'GDdmIQH6jhtmLUypg82g'
      , nonce: 'oElnnMTQIZvqvlfXM56aBLAf5noGD0AQR3Fmi7Q6Y'
      , signature_method: 'HMAC-SHA1'
      , token: '819797-Jxq8aYUDRmykzVKrgoLhXSq67TEa5ruc4GJC2rWimw'
      , timestamp: '1272325550'
      , version: '1.0'
      , consumer_secret: 'MCD8BKwGdgPHvAuvgvz4EQpqDAtx89grbuNMRd7Eh98'
      , token_secret: 'J6zix3FfA9LofH0awS24M3HcBYXO5nI1iYe8EfBA'
      }
    , form: {status: 'setting up my twitter 私のさえずりを設定する'}
    })
  process.nextTick(function() {
    t.equal(upsign, getSignature(rupsign))
    rupsign.abort()
    t.end()
  })
})

tape('rupsign_rsa', function(t) {
  var rupsign_rsa = request.post(
    { url: 'http://api.twitter.com/1/statuses/update.json'
    , oauth:
      { consumer_key: 'GDdmIQH6jhtmLUypg82g'
      , nonce: 'oElnnMTQIZvqvlfXM56aBLAf5noGD0AQR3Fmi7Q6Y'
      , signature_method: 'RSA-SHA1'
      , token: '819797-Jxq8aYUDRmykzVKrgoLhXSq67TEa5ruc4GJC2rWimw'
      , timestamp: '1272325550'
      , version: '1.0'
      , private_key: rsa_private_pem
      , token_secret: 'J6zix3FfA9LofH0awS24M3HcBYXO5nI1iYe8EfBA'
      }
    , form: {status: 'setting up my twitter 私のさえずりを設定する'}
    })
  process.nextTick(function() {
    t.equal(upsign_rsa, getSignature(rupsign_rsa))
    rupsign_rsa.abort()
    t.end()
  })
})

tape('rfc5849 example', function(t) {
  var rfc5849 = request.post(
    { url: 'http://example.com/request?b5=%3D%253D&a3=a&c%40=&a2=r%20b'
    , oauth:
      { consumer_key: '9djdj82h48djs9d2'
      , nonce: '7d8f3e4a'
      , signature_method: 'HMAC-SHA1'
      , token: 'kkk9d7dh3k39sjv7'
      , timestamp: '137131201'
      , consumer_secret: 'j49sk3j29djd'
      , token_secret: 'dh893hdasih9'
      , realm: 'Example'
      }
    , form: {
        c2: '',
        a3: '2 q'
      }
    })

  process.nextTick(function() {
    // different signature in rfc5849 because request sets oauth_version by default
    t.equal('OB33pYjWAnf+xtOHN4Gmbdil168=', getSignature(rfc5849))
    rfc5849.abort()
    t.end()
  })
})

tape('rfc5849 RSA example', function(t) {
  var rfc5849_rsa = request.post(
    { url: 'http://example.com/request?b5=%3D%253D&a3=a&c%40=&a2=r%20b'
    , oauth:
      { consumer_key: '9djdj82h48djs9d2'
      , nonce: '7d8f3e4a'
      , signature_method: 'RSA-SHA1'
      , token: 'kkk9d7dh3k39sjv7'
      , timestamp: '137131201'
      , private_key: rsa_private_pem
      , token_secret: 'dh893hdasih9'
      , realm: 'Example'
      }
    , form: {
        c2: '',
        a3: '2 q'
      }
    })

  process.nextTick(function() {
    // different signature in rfc5849 because request sets oauth_version by default
    t.equal('ThNYfZhYogcAU6rWgI3ZFlPEhoIXHMZcuMzl+jykJZW/ab+AxyefS03dyd64CclIZ0u8JEW64TQ5SHthoQS8aM8qir4t+t88lRF3LDkD2KtS1krgCZTUQxkDL5BO5pxsqAQ2Zfdcrzaxb6VMGD1Hf+Pno+fsHQo/UUKjq4V3RMo=', getSignature(rfc5849_rsa))
    rfc5849_rsa.abort()
    t.end()
  })
})

tape('plaintext signature method', function(t) {
  var plaintext = request.post(
    { url: 'https://dummy.com'
    , oauth:
      { consumer_secret: 'consumer_secret'
      , token_secret: 'token_secret'
      , signature_method: 'PLAINTEXT'
      }
    })

  process.nextTick(function() {
    t.equal('consumer_secret&token_secret', getSignature(plaintext))
    plaintext.abort()
    t.end()
  })
})

tape('invalid transport_method', function(t) {
  t.throws(
    function () {
      request.post(
      { url: 'http://example.com/'
      , oauth:
        { transport_method: 'some random string'
        }
      })
    }, /transport_method invalid/)

  t.throws(
    function () {
      request.post(
      { url: 'http://example.com/'
      , oauth:
        { transport_method: 'headerquery'
        }
      })
    }, /transport_method invalid/)
  t.end()
})

tape('invalid method while using transport_method \'body\'', function(t) {
  t.throws(
    function () {
      request.get(
      { url: 'http://example.com/'
      , headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' }
      , oauth:
        { transport_method: 'body'
        }
      })
    }, /requires 'POST'/)
  t.end()
})

tape('invalid content-type while using transport_method \'body\'', function(t) {
  t.throws(
    function () {
      request.post(
      { url: 'http://example.com/'
      , headers: { 'content-type': 'application/json; charset=UTF-8' }
      , oauth:
        { transport_method: 'body'
        }
      })
    }, /requires 'POST'/)
  t.end()
})

tape('query transport_method simple url', function(t) {
  var r = request.post(
    { url: 'https://api.twitter.com/oauth/access_token'
    , oauth:
      { consumer_key: 'GDdmIQH6jhtmLUypg82g'
      , nonce: '9zWH6qe0qG7Lc1telCn7FhUbLyVdjEaL3MO5uHxn8'
      , signature_method: 'HMAC-SHA1'
      , token: '8ldIZyxQeVrFZXFOZH5tAwj6vzJYuLQpl0WUEYtWc'
      , timestamp: '1272323047'
      , verifier: 'pDNg57prOHapMbhv25RNf75lVRd6JDsni1AJJIDYoTY'
      , version: '1.0'
      , consumer_secret: 'MCD8BKwGdgPHvAuvgvz4EQpqDAtx89grbuNMRd7Eh98'
      , token_secret: 'x6qpRnlEmW9JbQn4PQVVeVG8ZLPEx6A0TOebgwcuA'
      , transport_method: 'query'
      }
    })

  process.nextTick(function() {
    t.notOk(r.headers.Authorization, 'oauth Authorization header should not be present with transport_method \'query\'')
    t.equal(accsign, qs.parse(r.path).oauth_signature)
    t.notOk(r.path.match(/\?&/), 'there should be no ampersand at the beginning of the query')
    r.abort()
    t.end()
  })
})

tape('query transport_method with prexisting url params', function(t) {
  var r = request.post(
    { url: 'http://example.com/request?b5=%3D%253D&a3=a&c%40=&a2=r%20b'
    , oauth:
      { consumer_key: '9djdj82h48djs9d2'
      , nonce: '7d8f3e4a'
      , signature_method: 'HMAC-SHA1'
      , token: 'kkk9d7dh3k39sjv7'
      , timestamp: '137131201'
      , consumer_secret: 'j49sk3j29djd'
      , token_secret: 'dh893hdasih9'
      , realm: 'Example'
      , transport_method: 'query'
      }
    , form: {
        c2: '',
        a3: '2 q'
      }
    })

  process.nextTick(function() {
    t.notOk(r.headers.Authorization, 'oauth Authorization header should not be present with transport_method \'query\'')
    t.notOk(r.path.match(/\?&/), 'there should be no ampersand at the beginning of the query')
    t.equal('OB33pYjWAnf+xtOHN4Gmbdil168=', qs.parse(r.path).oauth_signature)
    r.abort()
    t.end()
  })
})

tape('query transport_method with qs parameter and existing query string in url', function(t) {
  var r = request.post(
    { url: 'http://example.com/request?a2=r%20b'
    , oauth:
      { consumer_key: '9djdj82h48djs9d2'
      , nonce: '7d8f3e4a'
      , signature_method: 'HMAC-SHA1'
      , token: 'kkk9d7dh3k39sjv7'
      , timestamp: '137131201'
      , consumer_secret: 'j49sk3j29djd'
      , token_secret: 'dh893hdasih9'
      , realm: 'Example'
      , transport_method: 'query'
      }
    , qs: {
        b5: '=%3D',
        a3: ['a', '2 q'],
        'c@': '',
        c2: ''
    }
  })

  process.nextTick(function() {
    t.notOk(r.headers.Authorization, 'oauth Authorization header should not be present with transport_method \'query\'')
    t.notOk(r.path.match(/\?&/), 'there should be no ampersand at the beginning of the query')
    t.equal('OB33pYjWAnf+xtOHN4Gmbdil168=', qs.parse(r.path).oauth_signature)

    var params = qs.parse(r.path.split('?')[1])
      , keys = Object.keys(params)

    var paramNames = [
      'a2', 'b5', 'a3[0]', 'a3[1]', 'c@', 'c2',
      'realm', 'oauth_nonce', 'oauth_signature_method', 'oauth_timestamp',
      'oauth_token', 'oauth_version', 'oauth_signature'
    ]

    for (var i = 0; i < keys.length; i++) {
      t.ok(keys[i] === paramNames[i],
        'Non-oauth query params should be first, ' +
        'OAuth query params should be second in query string')
    }

    r.abort()
    t.end()
  })
})

tape('body transport_method empty body', function(t) {
  var r = request.post(
    { url: 'https://api.twitter.com/oauth/access_token'
    , headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' }
    , oauth:
      { consumer_key: 'GDdmIQH6jhtmLUypg82g'
      , nonce: '9zWH6qe0qG7Lc1telCn7FhUbLyVdjEaL3MO5uHxn8'
      , signature_method: 'HMAC-SHA1'
      , token: '8ldIZyxQeVrFZXFOZH5tAwj6vzJYuLQpl0WUEYtWc'
      , timestamp: '1272323047'
      , verifier: 'pDNg57prOHapMbhv25RNf75lVRd6JDsni1AJJIDYoTY'
      , version: '1.0'
      , consumer_secret: 'MCD8BKwGdgPHvAuvgvz4EQpqDAtx89grbuNMRd7Eh98'
      , token_secret: 'x6qpRnlEmW9JbQn4PQVVeVG8ZLPEx6A0TOebgwcuA'
      , transport_method: 'body'
      }
    })

  process.nextTick(function() {
    t.notOk(r.headers.Authorization, 'oauth Authorization header should not be present with transport_method \'body\'')
    t.equal(accsign, qs.parse(r.body.toString()).oauth_signature)
    t.notOk(r.body.toString().match(/^&/), 'there should be no ampersand at the beginning of the body')
    r.abort()
    t.end()
  })
})

tape('body transport_method with prexisting body params', function(t) {
  var r = request.post(
    { url: 'http://example.com/request?b5=%3D%253D&a3=a&c%40=&a2=r%20b'
    , oauth:
      { consumer_key: '9djdj82h48djs9d2'
      , nonce: '7d8f3e4a'
      , signature_method: 'HMAC-SHA1'
      , token: 'kkk9d7dh3k39sjv7'
      , timestamp: '137131201'
      , consumer_secret: 'j49sk3j29djd'
      , token_secret: 'dh893hdasih9'
      , realm: 'Example'
      , transport_method: 'body'
      }
    , form: {
        c2: '',
        a3: '2 q'
      }
    })

  process.nextTick(function() {
    t.notOk(r.headers.Authorization, 'oauth Authorization header should not be present with transport_method \'body\'')
    t.notOk(r.body.toString().match(/^&/), 'there should be no ampersand at the beginning of the body')
    t.equal('OB33pYjWAnf+xtOHN4Gmbdil168=', qs.parse(r.body.toString()).oauth_signature)
    r.abort()
    t.end()
  })
})
