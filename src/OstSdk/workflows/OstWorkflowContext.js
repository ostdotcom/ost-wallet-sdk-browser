import {OstBaseEntity, STORES} from "../entities/OstBaseEntity";

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
		INTERRUPTED: 5
	};

	//Todo:: auto-generate it.
	static STATUS_LOOKUP = ['CREATED', 'INITIATED', 'ACKNOWLEDGED', 'CANCELLED_BY_NAVIGATION', 'COMPLETED', 'INTERRUPTED'];

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

	getJSONObject() {
		return {
			name: this.data.name,
			id: this.data.id,
			user_id: this.data.user_id,
			status: this.data.status,
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

	WORKFLOW_TYPE: OstWorkflowContext.WORKFLOW_TYPE,

	STATUS: OstWorkflowContext.STATUS
}
