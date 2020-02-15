import OstError from "./OstError"
import OstErrorCodes from './OstErrorCodes'

const LOG_TAG = 'OstIndexedDB';

const STORES = {
	KEY_STORE_TABLE : 'KEY_STORE_TABLE'
};

class OstIndexedDB {
	constructor(name ,version, stores) {
		this.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

		if (!name || !version) {
			throw new OstError("oidb_cons_1", OstErrorCodes.ILLEAGAL_ARGUMENT);
		} else {
			this.dbName = name;
			this.version = version;
			this.stores = stores || STORES;
		}

		this.dbObject = null;
	}

	createDatabase() {
		const oThis = this;

		if (!oThis.indexedDB) {
			let err = new Error("indexed Db not supported");
			return Promise.reject( err );
		}
		
		return new Promise(function (resolve, reject) {

			const request = oThis.indexedDB.open(oThis.dbName, oThis.version);

			request.onsuccess = (event) => {
				console.log(LOG_TAG, oThis.dbName, "version", oThis.version, "DB got created ", event);
				oThis.dbObject = request.result;
				resolve(event);
			};

			request.onerror = (err) => {
				console.log(LOG_TAG, oThis.dbName, "version", oThis.version, "DB creation failed", err);
				oThis.dbObject = null;
				reject(err);
			};

			request.onupgradeneeded = (event) => {
				// Save the IDBDatabase interface
				const db = event.target.result;

				let array = [];
				for (let key in oThis.stores) {
					if (oThis.stores.hasOwnProperty(key)) {
						array.push(oThis.createTable(db, oThis.stores[key]));
					}
				}

				return Promise.all(array);
			};
		});
	}


	createTable(db, name) {
		return new Promise((resolve) => {
			if (!db.objectStoreNames.contains(name)) {
				let store = db.createObjectStore(name, {keypath: "id"});
				console.log(LOG_TAG, name, "Store got created", store);
			} else {
				console.log(LOG_TAG, name, "Store already exists");
			}
			resolve();
		});
	}

	insertData(name, data) {
		const oThis = this;

		return new Promise(function (resolve, reject) {

			const objectStore = oThis.dbObject
				.transaction(name, "readwrite")
				.objectStore(name);

			const request = objectStore.add(data, String(data.id).toLowerCase());

			request.onsuccess = (event) => {
				console.log(LOG_TAG, "Date inserted successfully", event);
				resolve(event);
			};

			request.onerror = (err) => {
				console.error(LOG_TAG, "Date insertion fail", err);
				reject(err);
			};

		});
	}

	putData(name, data) {
		const oThis = this;

		return new Promise(function (resolve, reject) {

			const objectStore = oThis.dbObject
				.transaction(name, "readwrite")
				.objectStore(name);

			const request = objectStore.put(data,  String(data.id).toLowerCase());

			request.onsuccess = (event) => {
				console.log(LOG_TAG, "Date inserted successfully", event);
				resolve(event);
			};

			request.onerror = (err) => {
				console.error(LOG_TAG, "Date insertion fail", err);
				reject(err);
			};

		});
	}

	getData(name, key) {
		const oThis = this;

		return new Promise (function (resolve, reject) {
			const objectStore = oThis.dbObject
				.transaction(name)
				.objectStore(name);

			const request = objectStore.get(String(key).toLowerCase());

			request.onsuccess = (event) => {
				console.log(LOG_TAG, "Data fetched successfully", event.target.result);
				resolve(event.target.result);
			};

			request.onerror = (err) => {
				console.error(LOG_TAG, "Data fetching fail", err);
				reject(err);
			};
		});
	}

	getAllRows(name) {
		const oThis = this;

		return new Promise (function (resolve, reject) {
			const objectStore = oThis.dbObject
			.transaction(name)
			.objectStore(name);

			const request = objectStore.getAll();

			request.onsuccess = (event) => {
				console.log(LOG_TAG, "Data fetched successfully", event.target.result);
				resolve(event.target.result);
			};

			request.onerror = (err) => {
				console.error(LOG_TAG, "Data fetching fail", err);
				reject(err);
			};
		});
	}

  deleteData(name, key) {
    const oThis = this;

    return new Promise (function (resolve, reject) {
      const objectStore = oThis.dbObject
        .transaction(name, "readwrite")
        .objectStore(name)
	  ;
      const request = objectStore.delete(String(key).toLowerCase());

      request.onsuccess = (event) => {
        console.log(LOG_TAG, "Data deleted successfully", event.target.result);
        resolve(event.target.result);
      };

      request.onerror = (err) => {
        console.error(LOG_TAG, "Data deletion fail", err);
        reject(err);
      };
    });
  }
}

export default {
	newInstance: (name, version, stores) => {
		return new OstIndexedDB(name, version, stores);
	}
};
