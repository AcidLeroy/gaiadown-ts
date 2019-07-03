import { AbstractGetOptions } from 'abstract-leveldown';

export interface GetFileUrlOptions {
    username?: string;
    app?: string;
    zoneFileLookupURL?: string;
  }
  export interface GetFileOptions extends GetFileUrlOptions, AbstractGetOptions {
    /**
     * Try to decrypt the data with the app private key.
     * @default true
     */
    decrypt?: boolean;
    /**
     * Whether the content should be verified, only to be used 
     * when [[UserSession.putFile]] was set to `sign = true`.
     * @default false
     */
    verify?: boolean;
  }
  
  
  /**
   * Specify a valid MIME type, encryption, and whether to sign the [[UserSession.putFile]].
   */
  export interface PutFileOptions {
    /**
    * Encrypt the data with the app public key. 
    * If a string is specified, it is used as the public key. 
    * If the boolean `true` is specified then the current user's app public key is used. 
     * @default true
     */
    encrypt?: boolean | string;
    /**
     * Sign the data using ECDSA on SHA256 hashes with the user's app private key. 
     * If a string is specified, it is used as the private key. 
     * @default false
     */
    sign?: boolean | string;
    /**
     * Set a Content-Type header for unencrypted data. 
     */
    contentType?: string;
  }
  
  export interface SessionInterface {
    getFile(path: string, Options?: GetFileOptions) : Promise<string | ArrayBuffer> 
    putFile(path: string, content: string | Buffer, options?: PutFileOptions): Promise<string>
    deleteFile(path: string, options?: object): Promise<void>
  }