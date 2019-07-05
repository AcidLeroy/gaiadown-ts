import * as test from "tape";
import * as log from 'loglevel';

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
}

log.setDefaultLevel('debug')
var testCommon = suite.common({
  test: test,
  factory: function () {
    let mockSession = new MockSession();
    let gaiaDb = new GaiaLevelDOWN("location", mockSession);
    // let db = LevelUp(gaiaDb)
    return gaiaDb
  },
  snapshots: false,
  seek: false,
  bufferKeys: false,
  createIfMissing: false,
  errorIfExists: false
})

suite(testCommon)

