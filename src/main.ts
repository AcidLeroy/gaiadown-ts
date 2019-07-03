import immediate from 'immediate'
import * as log from 'loglevel';
import {AbstractLevelDOWN,
  ErrorCallback,
  AbstractOpenOptions,
  ErrorValueCallback,
  AbstractGetOptions,
  AbstractOptions,
  AbstractChainedBatch,
  AbstractIteratorOptions,
  AbstractIterator,
  AbstractBatch
} from 'abstract-leveldown'; 
import {
  SessionInterface, 
} from './blockstack-interfaces'



class GaiaLevelDOWN implements AbstractLevelDOWN<string, string | Buffer> {
  location : string;
  userSession: SessionInterface;
  status : string = 'new'

  constructor(location: string, userSession: SessionInterface) {
    this.location = location; 
    this.userSession = userSession; 
    log.info(`You created a GaiaDOWN object at location ${location}.`)
    log.debug('Your userSession is: ', userSession)
  }


  readonly [k: string]: any;  open(cb: ErrorCallback): void;
  open(options: AbstractOpenOptions, cb: ErrorCallback): void;
  open(options: AbstractOpenOptions, cb?: ErrorCallback): void {
    log.debug('open: called open')
    this.status = 'open'
  }
  close(cb: ErrorCallback): void {
    log.debug('close: called close.')
    this.status = 'closed'
  }
  get(key: string, cb: ErrorValueCallback<string | Buffer>): void;
  get(key: string, options: AbstractGetOptions, cb: ErrorValueCallback<string | Buffer>): void;
  get(key: string, options: AbstractGetOptions, cb?: ErrorValueCallback<string | Buffer>) {
    log.debug(`get: Getting key = '${key}. `)
    this.userSession.getFile(key, options).then(x => {
            if(cb) {
              log.debug("get: Succces, callback provided")
              immediate(() => {
                log.debug(`get: key '${key}' = '${x}'.`)
                if (x instanceof ArrayBuffer){
                  log.debug(`get: returned an ArrayBuffer.`)
                  return cb(null, Buffer.from(x))
                } else {
                  log.debug('get: return a string.')
                  return cb(null, x)
                }
              })
            } else {
              log.debug("get: Success, callback was NOT provided.")
            }
          }).catch(err => {
            if(cb) {
              log.error("get: Failure, callback was provided")
              immediate( () => {
                let errorMessage = `get: Error when getting key = '${key}': ${err}`
                log.error(errorMessage)
              return cb(new Error(errorMessage), null)
            })
          } else {
            immediate( () => {
              log.error("get: Failure, callback was NOT provided.")
              let errorMessage = `get: Error when getting key = '${key}': ${err}`
              log.error(errorMessage)
              throw new Error(errorMessage)
            })
          }
          })
  }
  put(key: string, value: string | Buffer, cb: ErrorCallback): void;
  put(key: string, value: string | Buffer, options: AbstractOptions, cb: ErrorCallback): void;
  put(key: string, value: string | Buffer, options: AbstractOptions, cb?: ErrorCallback) {
    log.debug(`put: Putting key = '${key}', with value = '${(value instanceof Buffer) ? String(value): value}'`)
        this.userSession.putFile(key, value, options).then(x => {
          immediate( () => {
            log.debug `put: returned string = ${x}.`
            if (cb) {
              log.debug(`put: Success, callback was provided.`)
              return cb(null); 
            } else {
              log.debug('put: Success, callbak was NOT provided.')
              return 
            }
          })
    }).catch(e => {
      immediate( () => {
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
  del(key: string, cb: ErrorCallback): void;
  del(key: string, options: AbstractOptions, cb: ErrorCallback): void;
  del(key: string, options: AbstractOptions, cb?: ErrorCallback) {
    throw new Error("Method not implemented.");
  }
  batch(): AbstractChainedBatch<string, string | Buffer>;
  batch(array:  AbstractBatch<string, string | Buffer>[], cb: ErrorCallback): AbstractChainedBatch<string, string | Buffer>;
  batch(array:  AbstractBatch<string, string | Buffer>[], options: AbstractOptions, cb: ErrorCallback): AbstractChainedBatch<string, string | Buffer>;
  batch(array?: any, options?: any, cb?: any) : AbstractChainedBatch<string, string | Buffer> {
    throw new Error("Method not implemented.");
  }
  
  iterator(options?: AbstractIteratorOptions<string>): AbstractIterator<string, string | Buffer> {
    throw new Error("Method not implemented.");
  }

}

export default GaiaLevelDOWN; 
