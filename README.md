# GaiaDown

[Gaia](https://github.com/blockstack/gaia) storage backend for [LevelUP](https://github.com/Level/levelup). The API implements the 
[abstract-leveldown](https://github.com/Level/abstract-leveldown) interface. Specifically, this module needs a [UserSession](https://blockstack.github.io/blockstack.js/classes/usersession.html) object to create the `GaiaDOWN` instance. Furthermore, all the options that `getFile` and `putFile` take can also be used in the LevelDB instance. 
This allows you to encrypt/decrypt and sign/verify your data. 


[![Build Status](https://travis-ci.com/AcidLeroy/gaiadown-ts.svg?branch=master)](https://travis-ci.com/AcidLeroy/gaiadown-ts)
[![npm version](https://badge.fury.io/js/gaiadown-ts.svg)](https://badge.fury.io/js/gaiadown-ts)
# Installation
`npm install gaiadown-ts`

# Example
```ts
import GaiaLevelDOWN, {PutFileOptions, GetFileOptions} from 'gaiadown-ts' 
import levelup from 'levelup'

// Grab the UserSession object after logging in.
const db = levelup(new GaiaLevelDOWN("/prefix/location/", userSession))
  // Can pass encrypt and sign options, same options as UserSession
  let putOpts : PutFileOptions = {
    encrypt: true, 
    sign: false
  }
  db.put('foo', 'bar', putOpts, function (err) {
    if (err) throw err
    // Can pass decrypt and verify options, same options as UserSession
    let getOpts : GetFileOptions = {
      decrypt: true, 
      verify: false,
    }
    db.get('foo', getOpts, function (err, value) {
      if (err) throw err
      console.log(String(value)) // 'bar'
    })
  })

```

# API
Please see [LevelUP](https://github.com/Level/levelup) for API. 

