import * as test from "tape";
import * as log from 'loglevel';
import * as blockstack from 'blockstack'; 
import levelup from 'levelup'
const suite = require('abstract-leveldown/test')

import { SessionInterface, GetFileOptions, PutFileOptions } from '../src/blockstack-interfaces';
import GaiaLevelDOWN from '../src/main';
// import LevelUp from 'levelup';

class MockSession implements SessionInterface {

  store: any
  constructor() {
    this.store = {};
  }

  async getFile(path: string, options?: GetFileOptions): Promise<string | ArrayBuffer> {
    
    if (typeof this.store[path] != "undefined"){
      return this.store[path]
    }
    throw new Error(`Key '${path}' does not exist!`)
  }

  async putFile(path: string, content: string | Buffer, options?: PutFileOptions): Promise<string> {
    this.store[path] = content
    return "";
  }

  async deleteFile(path: string, options?: object): Promise<void> {
    delete this.store[path]
  }

  async listFiles(callback: (name: string) => boolean) : Promise<number> {
    let keys = Object.keys(this.store)
    let i = 0; 
    for (; i < keys.length; i++){
      let result = callback(keys[i])
      if (!result){
        return i; 
      }
    }
    return i;  
  }
}

function getSession() {
  if (process.env.LEVEL_DB_INTEGRATION){
    const appConfig = new blockstack.AppConfig(
      ['store_write'], 
      'http://localhost:3000'
    )

    return new blockstack.UserSession({
      appConfig: appConfig, 
      sessionOptions: {
        appPrivateKey: process.env.LEVEL_DB_APP_PRIVATE_KEY,
        username: process.env.LEVEL_DB_USERNAME,
        hubUrl: 'https://hub.blockstack.org',
      }
    })
  } else {
    return new MockSession(); 
  }
}

log.setDefaultLevel('debug')
var testCommon = suite.common({
  test: test,
  factory: function () {
    let session = getSession();
    let gaiaDb = new GaiaLevelDOWN("location", session);
    return gaiaDb
  },
  snapshots: false,
  seek: false,
  bufferKeys: false,
  createIfMissing: false,
  errorIfExists: false
})

suite(testCommon)

test('Example', (t) => {
  let userSession = getSession(); 
  const db = levelup(new GaiaLevelDOWN("Not implemented!", userSession))
  db.put('foo', 'bar', function (err) {
    if (err) throw err
  
    db.get('foo', function (err, value) {
      if (err) throw err
  
      console.log(String(value)) // 'bar'
      t.end()
    })
  })
  
})

