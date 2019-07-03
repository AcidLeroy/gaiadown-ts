import * as test from "tape";
const suite = require('abstract-leveldown/test')

import { SessionInterface, GetFileOptions, PutFileOptions } from '../src/blockstack-interfaces';
import GaiaLevelDOWN from '../src/main';
import LevelUp from 'levelup';

class MockSession implements SessionInterface {

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

var testCommon = suite.common({
  test: test,
  factory: function () {
    let mockSession = new MockSession();
    let gaiaDb = new GaiaLevelDOWN("location", mockSession);
    let db = LevelUp(gaiaDb)
    return db
  },
  snapshots: false,
  seek: false,
  bufferKeys: false,
  createIfMissing: false,
  errorIfExists: false
})

suite(testCommon)


// import LevelUp from 'levelup'
// import GaiaLevelDOWN from '../src/main';
// import { SessionInterface, GetFileOptions, PutFileOptions } from '../src/blockstack-interfaces';

// import * as log from 'loglevel';

// jest.setTimeout(15000)
// export class MockSession implements SessionInterface {

//   store: any
//   constructor() {
//     this.store = {};
//   }

//   async getFile(path: string, options?: GetFileOptions): Promise<string | ArrayBuffer> {
//     return this.store[path];
//   }

//   async putFile(path: string, content: string | Buffer, options?: PutFileOptions): Promise<string> {
//     this.store[path] = content
//     return "";
//   }

//   async deleteFile(path: string, options?: object): Promise<void> {
//     delete this.store[path]
//   }
// }

// describe('Test GaiaLevelDOWN get/put', () => {
//   test('Put and get', (done) => {
//     log.setDefaultLevel('DEBUG')
//     let mockSession = new MockSession();
//     let gaiaDb = new GaiaLevelDOWN("location", mockSession);
//     console.log('gaiaDb = ', gaiaDb)
//     let db = LevelUp(gaiaDb)
//     db.put("key", "Somevalue", { encrypt: true }, (err?) => {
//       if (err) throw new Error('Could not put key into the gaia storage!')
//       else {
//         db.get("key", (err, value) => {
//           if (err) throw new Error('Could not get the key!')
//           else {
//             expect(value).toBe("Somevalue")


            
//           }
//           done()
//         })
//       }
//     })
//     expect(true).toBe(true)
//   })

//   test('put, get and delete.', async () => {

//   })


// });



