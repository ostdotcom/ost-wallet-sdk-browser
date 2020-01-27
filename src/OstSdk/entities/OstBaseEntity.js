import OstIndexDB from "../../common-js/OstIndexedDB";

let dbInstance = null;

const ENTITIES_DB_VERSION = 1;
const ENTITIES_DB_NAME = 'EntitiesDB';
const STORES = {
	OST_DEVICE : 'OST_DEVICE',
	OST_USER: 'OST_USER',
	OST_TOKEN: 'OST_TOKEN'
};

class OstBaseEntity {
	constructor(jsonObject) {
		this.id = jsonObject.id;
		this.data = jsonObject;
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
				return dbInstance.putData(oThis.getStoreName(), oThis.getData())
					.then(() => {
						return oThis;
					});
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
