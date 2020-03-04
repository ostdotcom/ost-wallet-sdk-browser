import Handlebars from "handlebars";

/*
  Uses subcriber events and creates workflow mapping
*/
const LOG_TAG = "MAPPY_WSS";

/**
 * Each Map has key = workflow-id and value with following structure:
{
  "id": "WORKFLOW_ID",
  "last_known_status": "last_known_status",

  "flowInitiated": {
    "wf_context": {

    },
    "wf_context_entity": {

    }
  },
  "requestAcknowledged": {
    "wf_context": {

    },
    "wf_context_entity": {

    }
  },
  "flowCompleted": {
    "wf_context": {

    },
    "wf_context_entity": {

    }
  },
  "flowInterrupted": {
    "wf_context": {

    },
    "ost_error": {

    }
  }
}
*/

/**
 * Meta Map. Key - WorkflowId, Value - the object below:
  {
    "id": workflowId,
    "name": workflowName,
    "last_known_status": workflowStatus,
    "last_context": workflow,
    "is_validated": false,
    "is_panding_workflow": isPending,
    "is_auto_added": isAutoAdded,
    "events_validity_flags": {
      "flowInitiated": STATUS_MAP.unknown,
      "requestAcknowledged": STATUS_MAP.unknown,
      "flowCompleted": STATUS_MAP.unknown,
      "flowInterrupted": STATUS_MAP.unknown
    }
  }
*/

const STATUS_MAP = {
  "true": true,
  "false": false,
  "unknown": "NA"
};

const SUBSCRIPTION_TYPE = {
  "ALL": "ALL",
  "USER_ID": "USER_ID",
  "WORKFLOW_ID": "WORKFLOW_ID"
}

const UI_UPDATE_THROTTLE_TIMEOUT = 500;

const jsonViewerSettings = { collapsed: false, withQuotes: true, withLinks: false};

class WorkflowSubscriberService {
  constructor() {
    const oThis = this;

    oThis.subscribeAllMap = {};
    oThis.subscribeAllUserIdMap = {};
    oThis.subscribeWorkflowIdMap = {};
    oThis.workflowMetaMap = {};


    $(() => {

      oThis.bindEvents();
    });
  }

  init( currentUser ) {
    const oThis = this;

    oThis.compileTemplates();

    oThis.currentUser = currentUser;

    // 1. OstWalletSdk.subscribeAll
    try {
      oThis.subscribeAll(oThis.subscribeAllMap);
      oThis.subscribeAllForUserId();
    } catch( e ) {
      return Promise.reject(e);
    }

    // Load Pending Workflows for current user.
    return OstWalletSdk.getPendingWorkflows(currentUser.user_id)
      .then((workflows) => {
        oThis.subscribeToPendingWorkflows( workflows );
        return true;
      });
  }

  subscribeAll(eventDataMap, userId = null, subscriptionType = SUBSCRIPTION_TYPE.ALL) {
    const oThis = this;
    OstWalletSdk.subscribeAll("flowInitiated", (workflowContext) => {
      let eventName = "flowInitiated";
      let eventData = oThis.processEvent(eventDataMap, workflowContext, eventName, subscriptionType);
      oThis.workflowDataUpdated(workflowContext, eventName);
    }, userId);

    OstWalletSdk.subscribeAll("requestAcknowledged", (workflowContext, contextEntity) => {
      let eventName = "requestAcknowledged";
      let eventData = oThis.processEvent(eventDataMap, workflowContext, eventName, subscriptionType);
      eventData["wf_context_entity"] = contextEntity;
      oThis.workflowDataUpdated(workflowContext, eventName);
    }, userId);

    OstWalletSdk.subscribeAll("flowCompleted", (workflowContext, contextEntity) => {
      let eventName = "flowCompleted";
      let eventData = oThis.processEvent(eventDataMap, workflowContext, eventName, subscriptionType);
      eventData["wf_context_entity"] = contextEntity;
      oThis.workflowDataUpdated(workflowContext, eventName);
    }, userId);

    OstWalletSdk.subscribeAll("flowInterrupted", (workflowContext, ostError) => {
      let eventName = "flowInterrupted";
      let eventData = oThis.processEvent(eventDataMap, workflowContext, eventName, subscriptionType);
      eventData["ost_error"] = ostError.getJSONObject();
      oThis.workflowDataUpdated(workflowContext, eventName);
    }, userId);
  }

  subscribeAllForUserId() {
    const oThis = this;
    let userId = oThis.currentUser.user_id;
    let eventDataMap = oThis.subscribeAllUserIdMap;
    oThis.subscribeAll(eventDataMap, userId, SUBSCRIPTION_TYPE.USER_ID);
  }

  subscribeToWorkflow(workflow, isPending = false) {
    const oThis = this;
    const subscriptionType = SUBSCRIPTION_TYPE.WORKFLOW_ID;

    const workflowId = workflow.id;
    // Create Initial Data.
    oThis.ensureWorkflowData(workflow, isPending, false);

    // Subscribe to event.
    let eventDataMap = oThis.subscribeWorkflowIdMap;
    OstWalletSdk.subscribe("flowInitiated", workflowId, (workflowContext) => {
      let eventName = "flowInitiated";
      let eventData = oThis.processEvent(eventDataMap, workflowContext, eventName, subscriptionType);
      oThis.workflowDataUpdated(workflowContext, eventName);
    });

    OstWalletSdk.subscribe("requestAcknowledged", workflowId, (workflowContext, contextEntity) => {
      let eventName = "requestAcknowledged";
      let eventData = oThis.processEvent(eventDataMap, workflowContext, eventName, subscriptionType);
      eventData["wf_context_entity"] = contextEntity;
      oThis.workflowDataUpdated(workflowContext, eventName);
    });

    OstWalletSdk.subscribe("flowCompleted", workflowId, (workflowContext, contextEntity) => {
      let eventName = "flowCompleted";
      let eventData = oThis.processEvent(eventDataMap, workflowContext, eventName, subscriptionType);
      eventData["wf_context_entity"] = contextEntity;
      oThis.workflowDataUpdated(workflowContext, eventName);
    });

    OstWalletSdk.subscribe("flowInterrupted", workflowId, (workflowContext, ostError) => {
      let eventName = "flowInterrupted";
      let eventData = oThis.processEvent(eventDataMap, workflowContext, eventName, subscriptionType);
      eventData["ost_error"] = ostError.getJSONObject();
      oThis.workflowDataUpdated(workflowContext, eventName);
    });
  }

  processEvent(eventDataMap, workflowContext, eventName, subscriptionType) {
    const oThis = this;
    const workflowId = workflowContext.id;
    const wfStatus = workflowContext.status;

    oThis.ensureWorkflowData( workflowContext );


    // Update last_known_status
    let wfMetaData = oThis.workflowMetaMap[ workflowId ];
    wfMetaData.last_known_status = wfStatus;
    wfMetaData.last_context = workflowContext;

    let wfEventData = eventDataMap[ workflowId ];
    wfEventData.last_known_status = wfStatus;

    // Update MetaData Checklist
    const checkListData = oThis.getChecklistDataForEvent(workflowContext, eventName);
    switch( subscriptionType ) {
      case SUBSCRIPTION_TYPE.WORKFLOW_ID:
        checkListData.has_received_subscribe = true;
        break;
      case SUBSCRIPTION_TYPE.ALL:
        checkListData.has_received_subscribe_all = true;
        break;
      case SUBSCRIPTION_TYPE.USER_ID:
        checkListData.has_received_subscribe_all_user_id = true;
        break;
    }

    // Update EventData w.r.t. event-name
    let eventData = wfEventData[ eventName ] || {};
    eventData["wf_context"] = workflowContext;

    return eventData;
  }


  subscribeToPendingWorkflows( workflows ) {
    const oThis = this;

    let len = workflows.length;
    const isPending = true;
    for(let cnt =0; cnt < len; cnt++ ) {
      let currentWorkflow = workflows[ cnt ];
      oThis.subscribeToWorkflow( currentWorkflow, isPending );
    }
  }

  subscribeToWorkflowId(workflowId) {
    const oThis = this;


    console.log(LOG_TAG, ":subscribeToWorkflowId: workflowId", workflowId);
		OstWalletSdk.getWorkflowInfo(oThis.currentUser.user_id, workflowId)
			.then((workflowContext) => {
				oThis.subscribeToWorkflow( workflowContext );
			})
			.catch((err) => {
				console.error(LOG_TAG, "subscribeToWorkflowId" ,err);
			})
  }

  ensureWorkflowData( workflow, isPending, isAutoAdded ) {
    const oThis = this;
    oThis.ensureWorkflowMetaData( workflow, isPending, isAutoAdded );
    oThis.ensureWorkflowEventData( workflow );
  }

  ensureWorkflowEventData( workflow ) {
    const oThis = this;

    let workflowId = workflow.id;
    let workflowName = workflow.name;
    let workflowStatus = workflow.status;

    if ( oThis.subscribeAllMap[ workflowId ] && oThis.subscribeAllUserIdMap[ workflowId ] && oThis.subscribeWorkflowIdMap[ workflowId ] ) {
      return;
    }

    let eventData = {
      "id": workflowId,
      "last_known_status": workflowStatus,
      "flowInitiated": null,
      "requestAcknowledged": null,
      "flowCompleted": null,
      "flowInterrupted": null
    };

    // Add Event Data to maps.
    if ( !oThis.subscribeAllMap[ workflowId ] ) {
      let subscribeAllEventData = Object.assign({}, eventData);
      oThis.subscribeAllMap[ workflowId ] = subscribeAllEventData;
    }

    if ( !oThis.subscribeAllUserIdMap[ workflowId ] ) {
      let subscribeAllWithUserIdEventData = Object.assign({}, eventData);
      oThis.subscribeAllUserIdMap[ workflowId ] = subscribeAllWithUserIdEventData;
    }

    if ( !oThis.subscribeWorkflowIdMap[ workflowId ] ) {
      let subscribeWithWorkflowIdData = Object.assign({}, eventData);
      oThis.subscribeWorkflowIdMap[ workflowId ] = subscribeWithWorkflowIdData;
    }
  }

  ensureWorkflowMetaData( workflowContext, isPending = false, isAutoAdded = true ) {
    const oThis = this;

    let workflowId = workflowContext.id;
    let workflowName = workflowContext.name;
    let workflowStatus = workflowContext.status;
    if ( !oThis.workflowMetaMap[ workflowId ] ) {
      let workflowMeta = {
        "id": workflowId,
        "name": workflowName,
        "last_known_status": workflowStatus,
        "user_id": workflowContext.user_id,
        "last_context": workflowContext,
        "is_validated": false,
        "is_panding_workflow": isPending,
        "is_auto_added": isAutoAdded,
        "is_rendered": false,
      };

      oThis.workflowMetaMap[ workflowId ] = workflowMeta;
      oThis.workflowAdded();
    }
  }

  getChecklistDataForEvent(workflowContext, eventName) {
    const oThis = this;
    const meta = oThis.workflowMetaMap[ workflowContext.id ];
    meta.checkListData = meta.checkListData || {};

    meta.checkListData[ eventName ] = meta.checkListData[ eventName ] || {
      "event_name": eventName,
      "has_received_subscribe_all": false,
      "has_received_subscribe_all_user_id": false,
      "has_received_subscribe": false,
      "is_consistent": true
    };

    return meta.checkListData[ eventName ];
  }

  getChecklistData( workflowId ) {
    const oThis = this;
    console.log(LOG_TAG, "oThis.workflowMetaMap", oThis.workflowMetaMap, "workflowId", workflowId);
    const meta = oThis.workflowMetaMap[ workflowId ];
    meta.checkListData = meta.checkListData || {};
    return meta.checkListData;
  }

  updateEventConsistency(workflowContext, eventName) {
    const oThis = this;

    let workflowId = workflowContext.id;
    const checkListData = oThis.getChecklistDataForEvent(workflowContext, eventName);

    const allEventsReceived = checkListData.has_received_subscribe
      && checkListData.has_received_subscribe_all
      && checkListData.has_received_subscribe_all_user_id
    ;
    if ( !allEventsReceived ) {
      // Has received at-least one event
      const atLeastOneEventReceived = checkListData.has_received_subscribe
        || checkListData.has_received_subscribe_all
        || checkListData.has_received_subscribe_all_user_id
      ;

      // Wait for other events to come in. For now, it's not consisitent.
      checkListData.is_consistent = atLeastOneEventReceived ? false : true;
      return;
    }

    const allWFData = oThis.subscribeAllMap[ workflowId ];
    const userIdWFData = oThis.subscribeAllUserIdMap[ workflowId ];
    const workflowIdWFData = oThis.subscribeWorkflowIdMap[ workflowId ];

    if ( !allWFData ) {
      console.error(LOG_TAG, "coding error. allWFData is null. workflowId:",workflowId, " oThis.subscribeAllMap", oThis.subscribeAllMap);
      checkListData.is_consistent = false;
      return;
    }

    if ( !userIdWFData ) {
      console.error(LOG_TAG, "coding error. userIdWFData is null. workflowId:",workflowId, " oThis.subscribeAllUserIdMap", oThis.subscribeAllUserIdMap);
      checkListData.is_consistent = false;
      return;
    }

    if ( !workflowIdWFData ) {
      console.error(LOG_TAG, "coding error. workflowIdWFData is null. workflowId:",workflowId, " oThis.subscribeWorkflowIdMap", oThis.subscribeWorkflowIdMap);
      checkListData.is_consistent = false;
      return;
    }

    const allEventData = allWFData[ eventName ];
    const userIdEventData = userIdWFData[ eventName ];
    const wfIdEventData  = workflowIdWFData[ eventName ];

    if ( !allEventData ) {
      console.error(LOG_TAG, "coding error. allEventData is null. workflowId:",workflowId, "allEventData", allEventData);
      checkListData.is_consistent = false;
      return;
    }

    if ( !userIdEventData ) {
      console.error(LOG_TAG, "coding error. userIdEventData is null. workflowId:",workflowId, "userIdEventData", userIdEventData);
      checkListData.is_consistent = false;
      return;
    }

    if ( !wfIdEventData ) {
      console.error(LOG_TAG, "coding error. wfIdEventData is null. workflowId:",workflowId, "wfIdEventData", wfIdEventData);
      checkListData.is_consistent = false;
      return;
    }

    let jAll, jUserId, jWorkflowId;
    try {
      jAll = JSON.stringify( allEventData );
      jUserId = JSON.stringify( userIdEventData );
      jWorkflowId = JSON.stringify( wfIdEventData );
    } catch(e) {
      console.error(LOG_TAG, "Codding Error.", e);
      checkListData.is_consistent = false;
      return;
    }

    if ( jAll === jUserId && jUserId === jWorkflowId) {
      checkListData.is_consistent = true;
      return;
    }

    console.error(LOG_TAG, "Inconsistent Data detected.", "\njAll\n-----\n", jAll, "\njUserId\n-----\n", jUserId, "\njWorkflowId\n-----\n", jWorkflowId)
    checkListData.is_consistent = false;
  }



  workflowAdded() {
    const oThis = this;
    oThis.updateWorkflowList();
  }

  workflowDataUpdated( workflowContext, eventName ) {
    const oThis = this;

    // Update the consistency flag.
    oThis.updateEventConsistency(workflowContext, eventName);

    const workflowId = workflowContext.id;
    oThis.updateWorkflowView( workflowId, workflowContext, eventName );
  }

  updateWorkflowList() {
    const  oThis = this;

    console.log(LOG_TAG, "updateWorkflowList :: New workflow(s) have been added ");
    console.log(LOG_TAG, "updateWorkflowList :: oThis.workflowMetaMap", oThis.workflowMetaMap);

    const jParent = $("#workflow-accordion");

    for(let wfId in oThis.workflowMetaMap ) { if ( oThis.workflowMetaMap.hasOwnProperty( wfId ) ) {
      let meta = oThis.workflowMetaMap[ wfId ];
      if ( meta.is_rendered ) {
        continue;
      }

      let cardHtml = oThis.cardTemplate( meta );
      let jCard = $(cardHtml);
      jCard.data("workflowId", meta.id);
      jParent.append( jCard );
      jCard.collapse();
      meta.is_rendered = true;
    }}
  }

  updateWorkflowView( workflowId, workflowContext ) {
    const oThis = this;
    oThis.updateLastKnownStatus( workflowId, workflowContext );
    oThis.updateCheckList( workflowId );
  }

  bindEvents() {
    const oThis = this;
  }

  updateLastKnownStatus( workflowId, workflowContext ) {
    const oThis = this;
    const jParent = $(`#j-wf-card-body-${workflowId} .j-workflow-details-last_known_status`);
    console.log(LOG_TAG, "updateLastKnownStatus :: jParent", jParent)
    jParent.html(workflowContext.status);
  }

  updateCheckList( workflowId ) {
    const oThis = this;
    const jParent = $(`#j-wf-card-body-${workflowId} .j-wf-checklist`);
    jParent.html('');

    const checkListData = oThis.getChecklistData( workflowId );
    const data = [];
    for(let eventName in checkListData) {
      data.push( checkListData[ eventName ] );
    }

    console.log(LOG_TAG, ":displayCheckList: data", data);
    let htmlStr = oThis.checkListTemplate( data );
    jParent.html( htmlStr );
  }


  compileTemplates() {
    const oThis = this;
    let checkListTemplateHtml = $("#j-wf-checklist-template").html();
    oThis.checkListTemplate = Handlebars.compile( checkListTemplateHtml );

    let cardTemplateHtml = $("#j-wf-card-template").html();
    oThis.cardTemplate = Handlebars.compile( cardTemplateHtml );
  }

}

export default new WorkflowSubscriberService();
