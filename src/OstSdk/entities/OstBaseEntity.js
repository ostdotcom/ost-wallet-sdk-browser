import OstIndexDB from "../../common-js/OstIndexedDB";

let dbInstance = null;
let LOG_TAG = "OstBaseEntity :: " 

const ENTITIES_DB_VERSION = 1;
const ENTITIES_DB_NAME = 'EntitiesDB';
const STORES = {
	OST_DEVICE : 'OST_DEVICE',
	OST_USER: 'OST_USER',
	OST_TOKEN: 'OST_TOKEN',
	OST_SESSION: 'OST_SESSION'
};

class OstBaseEntity {
	constructor(jsonObject) {
		//Get value of the entity Id
		const idValue = jsonObject[this.getIdKey()];

		//Create data having id key
		this.data = Object.assign({}, jsonObject, {id: idValue});

		//Assign id value
		this.id = this.data[this.getIdKey()];
	}

	getIdKey() {
		throw "Please override getIdKey method";
	}

	getId() {
		return this.id;
	}

	getData() {
		return this.data;
	}

	getStatus() {
		return this.data.status;
	}

	sync() {
		const oThis = this;
		return this.getInstance()
			.then((dbInstance) => {
				return dbInstance.getData(oThis.getStoreName(), oThis.getData().id)
					.then((data) => {
						if (!data) {
							return null;
						}
						oThis.data = data;
						return oThis;
					});
			});
	}

	commit() {
		const oThis = this;
		return this.getInstance()
			.then((dbInstance) => {
				return dbInstance.insertData(oThis.getStoreName(), oThis.getData())
					.then(() => {
						return oThis;
					});
			});
	}

	forceCommit() {
		const oThis = this;
		return this.getInstance()
			.then((dbInstance) => {
				return dbInstance.putData(oThis.getStoreName(), oThis.getData())
					.then(() => {
						return oThis;
					});
			});
	}

	getAll() {
		const oThis = this;
		return this.getInstance()
			.then((dbInstance) => {
				return dbInstance.getAllRows(oThis.getStoreName());
			});
	}

	getStoreName() {
		throw "Please override getStoreName method";
	}

	getInstance() {
		if (dbInstance) {
			return Promise.resolve(dbInstance);
		} else {
			let instance = OstIndexDB.newInstance(ENTITIES_DB_NAME, ENTITIES_DB_VERSION, STORES);
			return instance.createDatabase()
				.then(() => {
					dbInstance = instance;
					return dbInstance;
				})
				.catch((err) => {
					console.err(LOG_TAG, "Error while creating db for Entities", err);
				});
		}
	}
}

export {OstBaseEntity, STORES};
