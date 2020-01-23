
export default class BaseWorkflow {

	constructor(userId, delegate) {
		this.userId = userId;
		this.delegate = delegate;
		this.stateManager = new StateManager();
	}

	setStateManager() {
		this.stateManager = new StateManager();
		//Add custom states.
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
	constructor() {

	}

	static state = {
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

	getCurrentState() {

	}

	getStateObject() {

	}
}
