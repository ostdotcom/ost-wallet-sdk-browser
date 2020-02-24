const EventNames = {
  "requestAcknowledged": "requestAcknowledged",
  "flowCompleted": "flowCompleted",
  "flowInterrupted": "flowInterrupted"
};


class OstWorkflowEvents {
  constructor() {
    this.eventTarget = window;
  }

  getSubscriberNameForWorkflowId(eventName, workflowId) {
    return eventName + "_for_workflow_id_" + workflowId;
  }

  getSubscriberNameForUserId(eventName, userId) {
    return eventName + "_for_user_id_" + userId;
  }

  isValidCallback(callback) {
    return typeof callback === 'function';
  }

  isValidEventName(eventName) {
    return EventNames[eventName];
  }

  //region subscribe
  /**
   *
   * @param eventName - can be requestAcknowledged, flowCompleted & flowInterrupted
   * @param workflowId
   * @param callback
   */
  subscribe(eventName, workflowId, callback) {
    if ( !this.isValidEventName(eventName) ) {
      //throw new OstError('ows_owsc_s_1');
      return;
    }

    if (!this.isValidCallback(callback)) {
      return;
    }

    const eventSubscriberName = this.getSubscriberNameForWorkflowId(eventName, workflowId);
    this.eventTarget.addEventListener(eventSubscriberName, callback);
  }

  /**
   *
   * @param eventName - can be requestAcknowledged, flowCompleted & flowInterrupted
   * @param callback
   * @param userId
   */
  subscribeAll(eventName, callback, userId = null) {
    if ( !this.isValidEventName(eventName) ) {
      //throw new OstError('ows_owsc_s_1');
      return;
    }

    if (!this.isValidCallback(callback)) {
      return;
    }

    let eventSubscriberName = eventName;
    if(userId) {
      console.log("subscribing for userId: ", userId);
      eventSubscriberName = this.getSubscriberNameForUserId(eventName, userId);
    }

    this.eventTarget.addEventListener(eventSubscriberName, callback);
  }
  //endregion


  //region post event
  postRequestAcknowledgedEvent(ostWorkflowContext, ostContextEntity) {
    const eventName = EventNames.requestAcknowledged;
    this.postEvent(eventName, ostWorkflowContext, ostContextEntity)
  }

  postFlowCompleteEvent(ostWorkflowContext, ostContextEntity) {
    const eventName = EventNames.flowCompleted;
    this.postEvent(eventName, ostWorkflowContext, ostContextEntity)
  }

  postFlowInterruptEvent(ostWorkflowContext, ostError) {
    const eventName = EventNames.flowInterrupted;
    this.postEvent(eventName, ostWorkflowContext, null, ostError);
  }
  //endregion

  postEvent(eventName, ostWorkflowContext, ostContextEntity, ostError= null) {
    //create event details;
    let detail = {ost_workflow_context: ostWorkflowContext};
    if (ostContextEntity) {
      detail["ost_context_entity"] = ostContextEntity;
    }
    if (ostError) {
      detail["ost_error"] = ostError;
    }

    const eventDetails = {
      detail: detail
    };

    let event = null
      , eventSubscriberName = eventName
      , workflowId = ostWorkflowContext.workflow_id
      , userId = ostWorkflowContext.user_id
    ;

    //dispatch event for eventName

    event = new CustomEvent(eventSubscriberName, eventDetails);
    this.eventTarget.dispatchEvent(event);


    //dispatch event for eventName + "_for_workflow_id_" + workflowId

    eventSubscriberName = this.getSubscriberNameForWorkflowId(eventName, workflowId);
    event = new CustomEvent(eventSubscriberName, eventDetails);
    this.eventTarget.dispatchEvent(event);


    //dispatch event for eventName + "_for_user_id_" + userId

    eventSubscriberName = this.getSubscriberNameForUserId(eventName, userId);
    event = new CustomEvent(eventSubscriberName, eventDetails);
    this.eventTarget.dispatchEvent(event);
  }
}

export {EventNames, OstWorkflowEvents};

/*
  1. subscribeAll - event-name
  2. subscribeAll - event-name, user-id
  3. subscribe    - event-name, workflow-id

  if workflowId = "wf-id-1"
  and userId = "wf-uid-1"
  and eventName = requestAcknowledged,
  Three events need to be fired:

  1. requestAcknowledged
  2. requestAcknowledged + "_for_user_id_" + userId
  3. requestAcknowledged + "_for_workflow_id_" + workflowId
 */