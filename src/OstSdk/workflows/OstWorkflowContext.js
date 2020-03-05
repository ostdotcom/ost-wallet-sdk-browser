import {OstBaseEntity, STORES} from "../entities/OstBaseEntity";

const LOG_TAG = 'OstWorkflowContext';
let COUNT_TO_PRESERVE = 50;
class OstWorkflowContext extends OstBaseEntity {

	static WORKFLOW_TYPE = {
		SETUP_DEVICE: 'SETUP_DEVICE',
		CREATE_SESSION: 'CREATE_SESSION',
		EXECUTE_TRANSACTION: 'EXECUTE_TRANSACTION'
	};

	static STATUS = {
		CREATED: 0,
		INITIATED: 1,
		ACKNOWLEDGED: 2,
		CANCELLED_BY_NAVIGATION: 3,
		COMPLETED: 4,
		INTERRUPTED: 5,
		QR_TIMEDOUT: 6
	};

	static STATUS_LOOKUP = Object.keys(OstWorkflowContext.STATUS);

	constructor(workflowObject) {
		//Current time stamp in seconds.
		const currentTimeStamp = parseInt(Date.now() / 1000);

		workflowObject.created_at = workflowObject.created_at || currentTimeStamp;
		workflowObject.updated_at = workflowObject.updated_at || currentTimeStamp;

		super(workflowObject);

	}

	getName() {
		return this.data.name;
	}

	setContextEntityId(id) {
		this.data.context_entity_id = id;
		this.setUpdatedTimestamp();
		return this;
	}

	setContextEntityType(type) {
		this.data.context_entity_type = type;
		this.setUpdatedTimestamp();
		return this;
	}

	setWorkflowStatus(workflowStatus) {
		this.data.status = workflowStatus;
		this.setUpdatedTimestamp();
		return this;
	}

	setUpdatedTimestamp() {
		this.data.updated_at = parseInt(Date.now() / 1000);
		return this;
	}

	getWorkflowStatus() {
		return this.STATUS_LOOKUP[this.data.status];
	}

	getIdKey() {
		return 'id';
	}

	getStoreName() {
		return STORES.OST_WORKFLOW_CONTEXT;
	}

	getUserId() {
		return this.getData().user_id;
	}

	getArgs() {
		return this.getData().args;
	}

	getCreatedAt() {
		return this.getData().created_at;
	}

	getUpdatedAt() {
		return this.getData().updated_at;
	}

	getJSONObject() {
		return {
			name: this.data.name,
			id: this.data.id,
			user_id: this.data.user_id,
			status: OstWorkflowContext.STATUS_LOOKUP[this.data.status],
			args: this.data.args,
			context_entity_id: this.data.context_entity_id,
			context_entity_type: this.data.context_entity_type,
			created_at: this.data.created_at,
			updated_at: this.data.updated_at
		}
	}
}

export default {
	newInstanceFromObject: function (jsonDbObject) {
		return new OstWorkflowContext(jsonDbObject);
	},

	//@Deprecated
	//use newInstanceFromObject method to create instance of OstWorkflowContext
	newInstanceFromParams: function (workflowName, workflowId) {
		const oThis = this
			, jsonDbObject = {
				name: workflowName,
				id: workflowId
			}
		;

		return oThis.newInstanceFromObject(jsonDbObject);
	},

	getById: function (workflowId) {
		const ostWorkflowContext = new OstWorkflowContext(
			{id: workflowId}
		);
		return ostWorkflowContext.sync();
	},

	getPendingWorkflows: function (userId) {
		const dummyInstance = this.newInstanceFromParams('dummyWorkflowName', 'dummyId');
		return dummyInstance.getAll()
			.then((entitiesArray) => {
				if (!entitiesArray || entitiesArray.length < 1) {
					return [];
				}

				return entitiesArray.filter(function (entity) {
					// Check userId
					if (userId !== entity.user_id) {
						return false;
					}

					// filter based on workflow status which at most acknowledged
					if (OstWorkflowContext.STATUS.ACKNOWLEDGED < entity.status) {
						return false;
					}

					return true;
				});
			})
			.then((filteredWorkflows) => {
				return filteredWorkflows.map((workflowObj) => {
					return new OstWorkflowContext(workflowObj);
				});
			});
	},

	deleteStaleWorkflows: function(userId) {
		const dummyInstance = this.newInstanceFromParams('dummyWorkflowName', 'dummyId');
		return dummyInstance.getAll()
			.then((entitiesArray) => {
				if (!entitiesArray || entitiesArray.length < 1) {
					return;
				}

				return entitiesArray.filter(function (entity) {
					// Check userId
					if (userId !== entity.user_id) {
						return false;
					}

					// filter based on workflow status which at most acknowledged
					if (OstWorkflowContext.STATUS.CANCELLED_BY_NAVIGATION > entity.status) {
						return false;
					}

					return true;
				});
			})
			.then((workflowsToDelete) => {
				return workflowsToDelete.map((workflowObj) => {
					return new OstWorkflowContext(workflowObj);
				});
			})
			.then((workflowsToDeleteArray) => {
				workflowsToDeleteArray = workflowsToDeleteArray.sort((obj1, obj2) => {
					return parseInt(obj2.getUpdatedAt()) - parseInt(obj1.getUpdatedAt());
				});

				const countToPreserve = COUNT_TO_PRESERVE || 50;

				//Check whether there exist anything to delete
				if (!workflowsToDeleteArray[countToPreserve]) {
					return;
				}

				for (let index = countToPreserve; index<workflowsToDeleteArray.length; index++) {
					const worflowContext = workflowsToDeleteArray[index];
					worflowContext.deleteData();
				}
			})
			.catch((err) => {
				console.error(LOG_TAG, 'deleteStaleWorkflows', err);
			});
	},

	setMaxWorkflowCount: function(countToPreserve) {
		COUNT_TO_PRESERVE = countToPreserve;
	},

	WORKFLOW_TYPE: OstWorkflowContext.WORKFLOW_TYPE,

	STATUS: OstWorkflowContext.STATUS
}
