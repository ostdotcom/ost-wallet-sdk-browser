export default class OstBaseEntity {
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

	getById(id) {
		return OstBaseEntity(id);
	}

	getStatus() {
		return this.data.status;
	}
}
