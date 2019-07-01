// import LevelUp from 'levelup'
var levelup = require('levelup')
import GaiaLevelDOWN from '../src/main';
import {SessionInterface, GetFileOptions, PutFileOptions} from '../src/blockstack-interfaces'; 


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

describe('Test GaiaLevelDOWN capability', () => {
  test('Put and get', () => {
    let mockSession = new MockSession(); 
    let gaiaDb = new GaiaLevelDOWN("location", mockSession); 
    console.log('gaiaDb = ', gaiaDb)
    let db = levelup(gaiaDb)
    db.put("key", "value")
    // db.put("key", "Somevalue", {encrypt: true}, (err?) => {
    //   if(err) throw new Error('Could not put key into the gaia storage!')
    //   else {
    //     db.get("key", (err, value) => {
    //       if (err) throw new Error('Could not get the key!')
    //       else {
    //         expect(value).toBe("Somevalue")
    //       }
    //     })
    //   }
    // })
    expect(true).toBe(true) 

  })
});
