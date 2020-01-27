import OstKeyManagerProxy from "../OstKeyManagerProxy";

export default class OstSdkBaseWorkflow {

	constructor(userId, browserMessenger) {
		this.userId = userId;
		this.browserMessenger = browserMessenger;
		this.stateManager = new StateManager();

		this.keyManagerProxy = new OstKeyManagerProxy(this.browserMessenger, this.userId);
	}

	setStateManager() {
		this.stateManager = new StateManager();

		const customStates = [];
	}

	perform() {
		setTimeout(()=>{
			this.processNextState();
		}, 0);
	}

	processNextState() {
		const currentState = this.stateManager.getCurrentState();
		const stateObject = this.stateManager.getStateObject();
		this.onStateChange(currentState, stateObject);
	}

	onStateChange(currentState, stateObject) {

	}
}

class StateManager {
  state = {
    INITIAL: "INITIAL",
    PARAMS_VALIDATED: "PARAMS_VALIDATED",
    INITIALIZED: "INITIALIZED",
    REGISTERED: "REGISTERED",
    DEVICE_VALIDATED: "DEVICE_VALIDATED",
    PIN_AUTHENTICATION_REQUIRED: "PIN_AUTHENTICATION_REQUIRED",
    PIN_INFO_RECEIVED: "PIN_INFO_RECEIVED",
    AUTHENTICATED: "AUTHENTICATED",
    CANCELLED: "CANCELLED",
    COMPLETED: "COMPLETED"
  };

	constructor( states ) {
		let currentIndex = 0;
		this.states = states;
	}

	getNext () {
		
	}

	getCurrentState() {

	}

	getStateObject() {

	}
}
