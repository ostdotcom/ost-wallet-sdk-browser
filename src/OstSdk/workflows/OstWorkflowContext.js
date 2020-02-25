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

  setContextEntityType(type) {
    this.data.context_entity_type = type;
    return this;
  }

  setWorkflowStatus(workflowStatus) {
    this.data.status = workflowStatus;
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
  newInstanceFromObject: function(jsonDbObject) {
    return new OstWorkflowContext(jsonDbObject);
  },

  //@Deprecated
  //use newInstanceFromObject method to create instance of OstWorkflowContext
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
