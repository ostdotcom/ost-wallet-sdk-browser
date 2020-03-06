import CodeTesterBase from "./CodeTesterBase";

class DeleteSessionsHelper extends CodeTesterBase {
  constructor(currentUser) {
    super("#j-delete-session-container", "#j-method-template");

    const oThis = this;
    oThis.currentUser = currentUser;
    oThis.jBtn = $("#j-delsession-btn");
    oThis.jModal = $("#j-delete-session-modal");
    oThis.jBtn.removeClass('d-none');
    oThis.bindEvents();
  }

  bindEvents() {
    const oThis = this;
    oThis.jBtn.click(() => {
      oThis.jModal.modal();
    });

    oThis.jModal.on('shown.bs.modal', function () {
      oThis.jModal.trigger('focus');
      $("#j-delete-session-container").html("");
      oThis.perform(oThis.currentUser);
    });
  }

  addTesterConfigs() {
    const oThis = this;
    oThis.addTestConfig("deleteLocalSessions", "OstWalletSdk.deleteLocalSessions('{{user_id}}')");
  }

  deleteLocalSessions() {
    const oThis = this;
    const ostUserId = oThis.currentUser.user_id;
    return OstWalletSdk.deleteLocalSessions(ostUserId);
  }
}

export default DeleteSessionsHelper;
