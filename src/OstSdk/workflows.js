import SetupDevice from "./workflows/SetupDevice";

class Workflows {
  constructor(userId, tokenId, baseUrl, config) {
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
