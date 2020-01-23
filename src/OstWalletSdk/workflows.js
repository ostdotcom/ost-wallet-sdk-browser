class Workflows {
	constructor() {
		this.userId = userId;
		this.tokenId = tokenId;
		this.baseUrl = baseUrl;
		this.config = config;

		//Need to initialize the sdk
	}

	setupDevice(delegate) {
		const setUpDevice = new SetupDevice(this.userId, this.tokenId, false, delegate);
	}
}

export default new Workflows();
