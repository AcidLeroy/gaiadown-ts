# GaiaDown

[Gaia](https://github.com/blockstack/gaia) storage backend for [LevelUP](https://github.com/Level/levelup). The API implements the 
[abstract-leveldown](https://github.com/Level/abstract-leveldown) interface. 

# Example

```ts
import GaiaDOWN from 'gaiadown-ts' 
import levelup from 'levelup'

const db = levelup(new GaiaLevelDOWN("Not implemented!", userSession))
  db.put('foo', 'bar', function (err) {
    if (err) throw err
  
    db.get('foo', function (err, value) {
      if (err) throw err
      console.log(String(value)) // 'bar'
    })

  })

```

# API
Please see [LevelUP](https://github.com/Level/levelup) for API. 

