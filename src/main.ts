const immediate = require('immediate')
const ltgt = require('ltgt')
import * as log from 'loglevel';
import {
  AbstractLevelDOWN,
  ErrorCallback,
  // AbstractOpenOptions,
  ErrorValueCallback,
  ErrorKeyValueCallback,
  AbstractGetOptions,
  AbstractOptions,
  AbstractIteratorOptions,
  AbstractIterator,
  AbstractBatch,
} from 'abstract-leveldown';
import {
  SessionInterface,
} from './blockstack-interfaces'

class GaiaIterator extends AbstractIterator<string, string | Buffer> {

  db: GaiaLevelDOWN;
  limit: number = Infinity;
  keyAsBuffer: boolean;
  valueAsBuffer: boolean;
  reverse: boolean = false;
  done: number = 0;
  sortedKeys: string[] = [];
  fetchedFileNames: boolean = false;
  options : AbstractIteratorOptions<string>; 

  constructor(db: GaiaLevelDOWN, options: AbstractIteratorOptions<string>) {
    super(db)
    this.db = db
    log.debug('GaiaIterator options = ', options)
    if (options.limit != -1 && (typeof options.limit !== 'undefined')) {
      this.limit = options.limit
    }

    this.keyAsBuffer = options.keyAsBuffer !== false;
    this.valueAsBuffer = options.valueAsBuffer !== false;
    this.reverse = options.reverse;
    this.options = options; 
  }

  fetchAllKeys() : Promise<string[]> {
    let keys = []
      return this.db.userSession.listFiles((filename): boolean => {
        keys.push(filename);
        return true
      }).then(n => {
        log.debug('Took a snap shot of ', n, 'files')
        keys = keys.filter(x => x.startsWith(this.db.location))
        this.reverse ? keys.sort().reverse() : keys.sort()
        let temp = keys.filter(ltgt.filter(this.options))
        console.log(`temp = , ${temp}`)
        Object.assign(this.sortedKeys, temp)
        log.debug(`The sorted keys are :  ${this.sortedKeys}`)
        return this.sortedKeys
      })
  }


  fetchNext(cb: ErrorKeyValueCallback<string | Buffer, string | Buffer>) {
    let key = this.sortedKeys[this.done]
    if (this.done++ >= this.limit) {
      return immediate(cb);
    }
    if (!key) {
      log.debug('fetchNext: no more keys.')
      return immediate(cb)
    }

    var re = new RegExp(this.db.location+"(.*)")
    let fixedKey = key.match(re)[1]
    let returnedKey = this.keyAsBuffer? Buffer.from(fixedKey) : fixedKey

    let options = {} // TODO: how to handle encryption
    
    this.db.userSession.getFile(key, options).then( val => {
      if(cb) {
        log.debug('iterator.next: Success getting key: ', key)
        if ( val instanceof ArrayBuffer){
          log.debug('iterator.next: Value is an instance of an ArrayBuffer.')
          return cb(null, returnedKey, Buffer.from(val))

        } else {
          if (this.valueAsBuffer && !Buffer.isBuffer(val)) {
            let a = Buffer.from(String(val))
            return cb(null, returnedKey, a)
          }
          return cb(null, returnedKey, val)
        }
      }
    }).catch(e => {
      log.error(`Iterator.next: Recevied an error fetching key = ${key}: ${e}`)
      if (cb) {
        immediate(cb) //cb(undefined, null, null)
      } else {
        log.error('Iterator.next: Callback was not set.')
        throw new Error(`Iterator.next: Recevied an error fetching key = ${key}: ${e}`)
      }
    }) 
  }
  _next(cb: ErrorKeyValueCallback<string | Buffer, string | Buffer>) {
    if (this.limit == 0) return immediate(cb)
    // This is where things might get a bit wonky. In order to iterate
    // over files, I have no choice but to fetch all of the file names 
    // in Gaia an then iterate over those.
    if (!this.fetchedFileNames) {
      this.fetchedFileNames = true;
      this.fetchAllKeys().then(keys => {
        this.fetchNext(cb); 
      })
    } else {
      this.fetchNext(cb); 
    }
  }

}

class GaiaLevelDOWN extends AbstractLevelDOWN<string, string | Buffer> {
  location: string;
  userSession: SessionInterface;

  constructor(location: string, userSession: SessionInterface) {
    super(location)
    this.location = location.trim();
    this.location += (this.location[this.location.length-1] == '/') ? "" : '/'
    this.userSession = userSession;
    log.info(`You created a GaiaDOWN object at location '${this.location}.'`)
    log.debug('Your userSession is: ', userSession)
  }

  _serializeKey(key: string) {
    return this.location + key
  }

  _get(key: string, options: AbstractGetOptions, cb?: ErrorValueCallback<string | Buffer>) {
    log.debug(`get: Getting key = '${key}'. `)
    this.userSession.getFile(key, options).then(x => {
      if (cb) {
        log.debug("get: Succces, callback provided")
        immediate(() => {
          log.debug(`get: key '${key}' = '${x}'.`)
          if (x instanceof ArrayBuffer) {
            log.debug(`get: returned an ArrayBuffer.`)

            return cb(null, Buffer.from(x))
          } else {
            log.debug('get: return a string.')
            if (options.asBuffer !== false && !Buffer.isBuffer(x)) {
              let a = Buffer.from(String(x))
              return cb(null, a)
            }
            return cb(null, x)
          }
        })
      } else {
        log.debug("get: Success, callback was NOT provided.")
      }
    }).catch(err => {
      if (cb) {
        log.error("get: Failure, callback was provided")
        immediate(() => {
          let errorMessage = `get: NotFound error, key = '${key}': ${err}`
          log.error(errorMessage)
          return cb(new Error('NotFound'), undefined)
        })
      } else {
        immediate(() => {
          log.error("get: Failure, callback was NOT provided.")
          let errorMessage = `get: NotFound error when getting key = '${key}': ${err}`
          log.error(errorMessage)
          throw new Error('NotFound')
        })
      }
    })
  }

  _put(key: string, value: string | Buffer, options: AbstractOptions, cb?: ErrorCallback) {
    log.debug(`put: Putting key = '${key}', with value = '${(value instanceof Buffer) ? String(value) : value}'`)
    this.userSession.putFile(key, value, options).then(x => {
      immediate(() => {
        log.debug(`put: returned string = ${x}.`)
        if (cb) {
          log.debug(`put: Success, callback was provided.`)
          return cb(null);
        } else {
          log.debug('put: Success, callbak was NOT provided.')
          return
        }
      })
    }).catch(e => {
      immediate(() => {
        let errorMessage = `put: Error when putting key = '${key}' with value = ${value}: ${e}`;
        log.error(errorMessage)
        if (cb) {
          log.error('put: Failure, callback was provided. ')
          return cb(new Error(errorMessage))
        } else {
          log.error('put: Failure, callback was NOT provided. ')
        }
      })
    })
  }

  _del(key: string, options: AbstractOptions, cb?: ErrorCallback) {
    log.debug(`del: Deleting key: '${key}.`)
    this.userSession.deleteFile(key, options).then(x => {
      if (cb) {
        log.debug(`del: Successfully deleted key '${key} with a callback.`)
        immediate(() => cb(null))
      } else {
        log.debug(`delete: Successfully deleted key '${key}' with no callback.`)
      }
    }).catch(err => {
      log.error(`del: Failure deleting key '${key}': ${err}`)
      if (cb) {
        cb(new Error(`Could not delete key '${key}': ${err}`))
      } else {
        throw new Error(`Coudl not delete key '${key}': ${err}`)
      }
    })
  }

  _batch(array?: ReadonlyArray<AbstractBatch<string, string | Buffer>>, options?: AbstractOptions, cb?: ErrorCallback): void {
    let p = []
    array.forEach(x => {
      if (x.type == 'put') {
        p.push(this.userSession.putFile(x.key, x.value, options))
      } else if (x.type == 'del') {
        p.push(this.userSession.deleteFile(x.key, options))
      }
    })
    Promise.all(p).then(x => {
      log.debug('batch: Successfully ran batch: ', x)
      if (cb) {
        return immediate(cb)
      } else {
        log.debug(`batch: No call back provided`)
      }
    }).catch(e => {
      log.error(`batch: Failed to batch call: ${e}`)
      if (cb) {
        return immediate(() => cb(new Error(`Batch failed: ${e}`)))
      } else {
        throw new Error(`Batch failed: ${e}`)
      }
    })
  }


  _iterator(options?: AbstractIteratorOptions<string>): AbstractIterator<string, string | Buffer> {
    return new GaiaIterator(this, options);
  }

}

export default GaiaLevelDOWN; 
