const LOG_TAG = "OST_WALLET_EVENT";
const EventNames = {
  "flowInitiated": "flowInitiated",
  "registerDevice": "registerDevice",
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
    if (!this.isValidEventName(eventName)) {
      //throw new OstError('ows_owsc_s_1');
      return;
    }

    if (!this.isValidCallback(callback)) {
      return;
    }

    const eventSubscriberName = this.getSubscriberNameForWorkflowId(eventName, workflowId);
    this.addEventListener(eventSubscriberName, callback);
  }

  /**
   *
   * @param eventName - can be requestAcknowledged, flowCompleted & flowInterrupted
   * @param callback
   * @param userId
   */
  subscribeAll(eventName, callback, userId = null) {
    if (!this.isValidEventName(eventName)) {
      //throw new OstError('ows_owsc_s_1');
      return;
    }

    if (!this.isValidCallback(callback)) {
      return;
    }

    let eventSubscriberName = eventName;
    if (userId) {
      console.log(LOG_TAG, "subscribing for userId: ", userId);
      eventSubscriberName = this.getSubscriberNameForUserId(eventName, userId);
    }

    this.addEventListener(eventSubscriberName, callback);
  }

  addEventListener(eventSubscriberName, callback) {
    this.eventTarget.addEventListener(eventSubscriberName, (ostCustomEvent) => {
      console.log(LOG_TAG, "ostCustomEvent", ostCustomEvent);
      // Trigger actual callback.
      let callbackArgs = [];
      if (ostCustomEvent.detail && ostCustomEvent.detail.ost_event_args) {
        callbackArgs = ostCustomEvent.detail.ost_event_args;
      }
      callback(...callbackArgs);
    });
  }

  //endregion


  //region post event
  postFlowInitiatedEvent(ostWorkflowContext, ...args) {
    const eventName = EventNames.flowInitiated;
    this.postEvent(eventName, ostWorkflowContext, args);
  }

  postRequestAcknowledgedEvent(ostWorkflowContext, ...args) {
    const eventName = EventNames.requestAcknowledged;
    this.postEvent(eventName, ostWorkflowContext, args);
  }

  postFlowCompleteEvent(ostWorkflowContext, ...args) {
    const eventName = EventNames.flowCompleted;
    this.postEvent(eventName, ostWorkflowContext, args);
  }

  postFlowInterruptEvent(ostWorkflowContext, ...args) {
    const eventName = EventNames.flowInterrupted;
    this.postEvent(eventName, ostWorkflowContext, args);
  }

  postRegisterDeviceEvent(ostWorkflowContext, ...args) {
    const eventName = EventNames.registerDevice;
    this.postEvent(eventName, ostWorkflowContext, args);
  }

  //endregion

  postEvent(eventName, ostWorkflowContext, eventArgs) {
    eventArgs = [ostWorkflowContext].concat(eventArgs || []);
    console.log(LOG_TAG, "postEvent :: eventArgs", eventArgs);
    //create event details;
    const eventDetails = {
      "detail": {
        "ost_event_args": eventArgs
      }
    };

    let event = null
      , eventSubscriberName = eventName
      , workflowId = ostWorkflowContext.id
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
