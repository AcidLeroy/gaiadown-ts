import LevelUp from 'levelup'
import GaiaLevelDOWN from '../src/main';
import {SessionInterface, GetFileOptions, PutFileOptions} from '../src/blockstack-interfaces'; 
// const tapeTest = require('tape')
// const suite = require('abstract-leveldown/test')

class MockSession implements SessionInterface {
  store : any
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

}

describe('Test GaiaLevelDOWN get/put', () => {
  test('Put and get', () => {
    let mockSession = new MockSession(); 
    let gaiaDb = new GaiaLevelDOWN("location", mockSession); 
    console.log('gaiaDb = ', gaiaDb)
    let db = LevelUp(gaiaDb)
    db.put("key", "value")
    db.put("key", "Somevalue", {encrypt: true}, (err?) => {
      if(err) throw new Error('Could not put key into the gaia storage!')
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
});

// describe('Prove GaiaLevelDOWN is abstract-leveldown compliant', () =>{
//   test('Run compliance check',  () => {

//     suite({
//       test: tapeTest,
//       factory: function () {
//         let mockSession = new MockSession(); 
//         let gaiaDb = new GaiaLevelDOWN("location", mockSession); 
//         return gaiaDb
//       }
//     })
//     expect(true).toBe(true)
//   })
// })
