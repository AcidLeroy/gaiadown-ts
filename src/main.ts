import {AbstractLevelDOWN,
  ErrorCallback,
  AbstractOpenOptions,
  ErrorValueCallback,
  AbstractGetOptions,
  AbstractOptions,
  AbstractChainedBatch,
  AbstractIteratorOptions,
  AbstractIterator
} from 'abstract-leveldown'; 
import {
  SessionInterface, 
} from './blockstack-interfaces'


class GaiaLevelDOWN implements AbstractLevelDOWN {
  location : string;
  userSession: SessionInterface;

  constructor(location: string, userSession: SessionInterface) {
    this.location = location; 
    this.userSession = userSession; 
    console.log("You created a GaiaLevelDOWN object!")
  }

  status() : string{
    return 'open';
  }

  readonly [k: string]: any;
  open(cb: ErrorCallback): void;
  open(options: AbstractOpenOptions, cb: ErrorCallback): void;
  open(options: any, cb?: any) {
    throw new Error("'Open' Method not implemented.");
  }
  close(cb: ErrorCallback): void {
    throw new Error("'close' Method not implemented.");
  }
  get(key: any, cb: ErrorValueCallback<any>): void;
  get(key: any, options: AbstractGetOptions, cb: ErrorValueCallback<any>): void;
  get(key: any, options: any, cb?: ErrorValueCallback<any>) {
    this.userSession.getFile(key, options).then(x => {
      if(cb) cb(null, x)
    }).catch(err => {
      if(cb) cb(err, null)
    })
  }
  put(key: any, value: any, cb: ErrorCallback): void;
  put(key: any, value: any, options: AbstractOptions, cb: ErrorCallback): void;
  put(key: any, value: any, options: AbstractOptions, cb?: ErrorCallback) {
    this.userSession.putFile(key, value, options).then(x => {
      if (cb) cb(null)
    }).catch(e => {
      if (cb) cb(e)
    })
  }
  del(key: any, cb: ErrorCallback): void;
  del(key: any, options: AbstractOptions, cb: ErrorCallback): void;
  del(key: any, options: any, cb?: any) {
    throw new Error("Method not implemented.");
  }
  batch(): AbstractChainedBatch<any, any>{
    throw new Error("Method not implemented.");
  }

  iterator(options?: AbstractIteratorOptions<any>): AbstractIterator<any, any> {
    throw new Error("Method not implemented.");
  }

}

export default GaiaLevelDOWN; 
