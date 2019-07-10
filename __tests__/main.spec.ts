import * as test from "tape";
import * as log from 'loglevel';
import * as blockstack from 'blockstack'; 
import levelup from 'levelup'
const suite = require('abstract-leveldown/test')

import { SessionInterface, GetFileOptions, PutFileOptions } from '../src/blockstack-interfaces';
import GaiaLevelDOWN from '../src/main';
// import LevelUp from 'levelup';

const ENCRYPTED : string = "ENCRYPTED"

function encrypt(val : string | Buffer): string | Buffer{
  if (val instanceof Buffer) {
    return Buffer.from(String(val)+ ENCRYPTED) 
  } else {
    return String(val) + ENCRYPTED
  }
}

function decrypt(val : string | Buffer) : string | Buffer {
  if (val instanceof Buffer) {
    let newVal = String(val)
    newVal = newVal.replace(ENCRYPTED, "")
    return Buffer.from(newVal)
  } else {
    let newVal = val.replace(ENCRYPTED, "")
    return newVal;
  }
}

class MockSession implements SessionInterface {

  store: any
  constructor() {
    this.store = {};
  }

  async getFile(path: string, options?: GetFileOptions): Promise<string | ArrayBuffer > {
    
    if (typeof this.store[path] == "undefined"){
      return null; 
    }
      if (options && options.decrypt) return decrypt(this.store[path])
      else return this.store[path]
    
  }

  async putFile(path: string, content: string | Buffer, options?: PutFileOptions): Promise<string> {

    if(!(content instanceof Buffer) && (typeof content !== "string")){
      throw new Error('Value must be a string or a Buffer!')
    }
    if (options && options.encrypt) this.store[path] = encrypt(content)
    else this.store[path] = content
    return "";
  }

  async deleteFile(path: string, options?: object): Promise<void> {
    if (typeof this.store[path] == "undefined") {
      log.error('deleteFile: this is an issue!')
      throw new Error('Gaia failed!')
    }
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
  const db = levelup(new GaiaLevelDOWN("/prefix/location/", userSession))
  let putOpts : PutFileOptions = {
    encrypt: true, 
    sign: false
  }
  db.put('foo', 'bar', putOpts, function (err) {
    if (err) throw err
  
    let getOpts : GetFileOptions = {
      decrypt: true, 
      verify: false,
    }
    db.get('foo', getOpts, function (err, value) {
      if (err) throw err
  
      console.log(String(value)) // 'bar'
      t.equal(String(value), 'bar', 'Got the same value')
      t.end()
    })
  })
  
})

