import {OstBaseEntity, STORES} from "../entities/OstBaseEntity";

class OstWorkflowContext extends OstBaseEntity {

  static WORKFLOW_TYPE = {
    SETUP_DEVICE: 'SETUP_DEVICE',
    CREATE_SESSION: 'CREATE_SESSION',
		EXECUTE_TRANSACTION: 'EXECUTE_TRANSACTION'
  };

	static STATUS = {
		INITIATED: 0,
		ACKNOWLEDGED: 1,
		CANCELLED_BY_NAVIGATION: 2,
		COMPLETED: 3,
		INTERRUPTED: 4
	};

	//Todo:: auto-generate it.
	static STATUS_LOOKUP = ['INITIATED', 'ACKNOWLEDGED', 'CANCELLED_BY_NAVIGATION', 'COMPLETED', 'INTERRUPTED'];

	constructor(workflowObject) {
    super(workflowObject);

		this.workflowName = workflowObject.name;
		this.workflowId = workflowObject.id;
		this.userId = workflowObject.user_id;
		this.status = workflowObject.status;
		this.args = workflowObject.args;
    this.contextEntityId = workflowObject.context_entity_id;
		this.contextEntityType = workflowObject.context_entity_type;

		//Current time stamp in seconds.
		const currentTimeStamp = parseInt(Date.now()/1000);

		this.created_at = workflowObject.created_at || currentTimeStamp;
		this.updated_at = workflowObject.updated_at || currentTimeStamp;
  }

	static getById(workflowId) {
		const ostWorkflowContext = new OstWorkflowContext(
			{id: workflowId}
		);
		return ostWorkflowContext.sync();
	}

  getName() {
  	return this.data.name;
	}

	setContextEntityId(id) {
		this.data.context_entity_id = id;
		return this;
	}

	setWorkflowStatus(workflowStatus) {
		this.data.status = workflowStatus;
		return this;
	}

	setArgs(args) {
		this.data.args = args;
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

  getJSONObject() {
    return {
      name: this.workflowName,
      id: this.workflowId,
      user_id: this.userId,
      status: this.status,
      args: this.args,
      context_entity_id: this.contextEntityId,
      context_entity_type: this.contextEntityType,
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  }
}

export default {
  newInstanceFromObject: function(jsonDbObject) {
      return new OstWorkflowContext(jsonDbObject);
  },

  newInstanceFromParams: function(workflowName, workflowId) {
    const oThis = this
      , jsonDbObject = {
				name: workflowName,
				id: workflowId
			}
    ;

    return oThis.newInstanceFromObject(jsonDbObject);
  },

	getById: OstWorkflowContext.getById,
	WORKFLOW_TYPE: OstWorkflowContext.WORKFLOW_TYPE,
	STATUS: OstWorkflowContext.STATUS
}
