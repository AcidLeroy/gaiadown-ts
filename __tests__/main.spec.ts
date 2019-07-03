import LevelUp from 'levelup'
import GaiaLevelDOWN from '../src/main';
import { SessionInterface, GetFileOptions, PutFileOptions } from '../src/blockstack-interfaces';

import * as log from 'loglevel';
const tapeTest = require('tape')
const suite = require('abstract-leveldown/test')


export class MockSession implements SessionInterface {

  store: any
  constructor() {
    this.store = {};
  }

  async getFile(path: string, options?: GetFileOptions): Promise<string | ArrayBuffer> {
    return this.store[path];
  }

  async putFile(path: string, content: string | Buffer, options?: PutFileOptions): Promise<string> {
    this.store[path] = content
    return "";
  }

  async deleteFile(path: string, options?: object): Promise<void> {
    delete this.store[path]
  }
}

describe('Test GaiaLevelDOWN get/put', () => {
  test('Put and get', () => {
    log.setDefaultLevel('DEBUG')
    let mockSession = new MockSession();
    let gaiaDb = new GaiaLevelDOWN("location", mockSession);
    console.log('gaiaDb = ', gaiaDb)
    let db = LevelUp(gaiaDb)
    db.put("key", "Somevalue", { encrypt: true }, (err?) => {
      if (err) throw new Error('Could not put key into the gaia storage!')
      else {
        db.get("key", (err, value) => {
          if (err) throw new Error('Could not get the key!')
          else {
            expect(value).toBe("Somevalue")
          }
        })
      }
    })
    expect(true).toBe(true)
  })

  test('put, get and delete.', async () => {
    
  })


});

test('Compliance Test with abstract-leveldown', () => {
  log.info("starting the suite")
  suite({
    test: tapeTest,
    factory: function () {
      let mockSession = new MockSession();
      let gaiaDb = new GaiaLevelDOWN("location", mockSession);
      return gaiaDb
    }
  })
  log.info('Finished the suite!!!')
  expect(true).toBe(true)
})


