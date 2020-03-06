import OstError from "./OstError"
import OstErrorCodes from './OstErrorCodes'
import * as localForage from "localforage";

const LOG_TAG = 'OstIndexedDB';

const STORES = {
  KEY_STORE_TABLE: 'KEY_STORE_TABLE'
};

const DB_VERSION = 10;

class OstIndexedDB {
  constructor(name) {
    this.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

    if (!name || !DB_VERSION) {
      throw new OstError("oidb_cons_1", OstErrorCodes.ILLEAGAL_ARGUMENT);
    } else {
      this.dbName = name;
      this.version = DB_VERSION;
    }
  }

  getConfigForStore(storeName) {
    const oThis = this
    ;
    return {
      driver: [
        localForage.INDEXEDDB
      ],
      name: oThis.dbName,
      version: oThis.version,
      size: 4980736, // Size of database, in bytes.
      storeName: storeName, // Should be alphanumeric, with underscores.
      description: 'Description'
    }
  }

  createDatabase() {
    const oThis = this;

    if (!this.indexedDB) {
      alert("indexed Db not supported");
    }
    return Promise.resolve();
  }

  insertData(name, data) {
    const oThis = this;

    let instance = localForage.createInstance(oThis.getConfigForStore(name));

    return instance.setItem(String(data.id).toLowerCase(), data);
  }

  putData(name, data) {
    const oThis = this;

    let instance = localForage.createInstance(oThis.getConfigForStore(name));

    return instance.setItem(String(data.id).toLowerCase(), data);
  }

  getData(name, key) {
    const oThis = this;

    let instance = localForage.createInstance(oThis.getConfigForStore(name));

    return instance.getItem(String(key).toLowerCase());
  }

  getAllRows(name) {
    const oThis = this
      , responseArray = []
    ;

    let instance = localForage.createInstance(oThis.getConfigForStore(name));

    return instance.iterate(function (value, key, iterationNumber) {
      console.log(LOG_TAG, value, key, iterationNumber);
      responseArray.push(value);
    }).then(() => {
      return responseArray;
    });
  }

  deleteData(name, key) {
    const oThis = this;

    let instance = localForage.createInstance(oThis.getConfigForStore(name));

    return instance.removeItem(String(key).toLowerCase());
  }
}

export default {
  newInstance: (name) => {
    return new OstIndexedDB(name);
  }
};
