

class OstApiSigner {
	constructor(userId) {
		this.userId = userId;
	}

	init() {
		return Promise.resolve();
	}
}

let apiSigner = null;
let apiSignerUserId = null;

const getInstance = (userId) => {
	if (apiSigner && apiSignerUserId === userId) {
		return Promise.resolve(apiSigner);
	}

	console.debug(LOG_TAG,'Creating new Api signer instance for userId ', userId);
	apiSignerUserId = userId;
	apiSigner = new OstApiSigner(userId);

	return apiSigner.init()
		.then(()=> {
			return apiSigner;
		})
		.catch(()=> {
			return apiSigner;
		})
};

export default {
	sign(userId, dataToSign) {
		return getInstance(userId)
			.then( (instance) => {
				return instance.sign(dataToSign);
			});
	}
}

