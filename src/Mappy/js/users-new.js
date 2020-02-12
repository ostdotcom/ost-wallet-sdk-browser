import PageInitializer from "./PageInitializer";
import ajaxUtils from "./ajaxUtils";
import Handlebars from "handlebars";
import '../css/users.css';
import BigNumber from 'bignumber.js';
BigNumber.config({ EXPONENTIAL_AT: 2 })
class UserPage {
    constructor() {
        const oThis = this;
        // Create Page Initializer
        oThis.pageInitializer = new PageInitializer();
        oThis.pageInitializer.onPageInitialized((currentUser) => {
            oThis.currentUser = currentUser;
            console.log("currentUser", currentUser);
            oThis.onPageInitialized();
        });
        oThis.nextPagePayload = 1;
        oThis.previousPage = 1;
        oThis.bindEvents();
    }
    getCurrentUser() {
        return this.currentUser;
    }
    init() {
        console.log("userpage:init");
        const oThis = this;
        this.validatePage();
        this.setupSdkHelper.perform();
    }
    onPageInitialized() {
        const oThis = this;
        oThis.compileTemplates();
        let apiUrl = oThis.generateUrl(1);
        oThis.loadUsers(apiUrl);
    }
    generateUrl(page) {
        return this.pageInitializer.getBaseUrl() + '/users?page=' + page;
    }
    loadUsers(apiUrl) {
        const oThis = this;
        return ajaxUtils.get(apiUrl)
            .catch(() => {
                console.log("error in get request of users");
            })
            .then((response) => {
                oThis.templateData = {
                    Username: "a",
                    User_Balance: 0,
                    sendDT: 1,
                    sendCent: 1,
                    send: 1,
                    tokenHolderAddress: 1,
                    Token_Holder_Address: 1,
                    sendModal: 1,
                    user_row: "user_row"
                };
                var source = document.getElementById("user-method-template").innerHTML;
                let template = Handlebars.compile(source);
                this.processData(response, template);
            })
    }

    processData(jsonData, template) {
        const oThis = this;
        $('#user-row-div').empty();

        oThis.nextPagePayload = jsonData.meta.next_page_payload.page;
        var viewId = "user_row";
        let balance = 0;
        let jOutputEl;
        let outputHtml;
        oThis.htmlwork;
        let token_holder_address;

        for (var i = 0; i < 10; i++) {
            let app_user_id = jsonData.users[i].app_user_id;
            if (jsonData.balances.hasOwnProperty(app_user_id)) {
                //if balance is available for the app_user_id then show respective available_balance.
                balance = BigNumber(jsonData.balances[app_user_id].available_balance);
                //console.log("balance big",balance);
            } else {
                // for those app_user_id whose balance is not available.
                balance = 0;
            }
            //check if token holder address is present or not .If not present then send click event should throw an error.
            if (jsonData.users[i].token_holder_address == undefined) {
                token_holder_address = "NA";
            } else {
                token_holder_address = jsonData.users[i].token_holder_address;
            }

            oThis.templateData = {
                Username: app_user_id,
                User_Balance: balance,
                sendDT: viewId + "_sendDT_" + i,
                sendCent: viewId + "_sendCent_" + i,
                send: viewId + "_send_" + i,
                token_holder_address: viewId + "_tokenHolderAddress_" + i,
                Token_Holder_Address: token_holder_address,
                sendModal: viewId + "_sendModal_" + i,
                user_row: viewId + i,
                modal_body_id: viewId + "_modal_body_id_" + i
            };

            outputHtml = template(oThis.templateData);
            oThis.htmlwork += outputHtml;

            $('#user-row-div').append(outputHtml);
            jOutputEl = $(outputHtml);

            let sendDT = $('#' + oThis.templateData.user_row).find("#" + oThis.templateData.sendDT)
            let sendCent = $('#' + oThis.templateData.user_row).find("#" + oThis.templateData.sendCent)
            let sendModal = $('#user_row_modal_body_id_0').find("#user_row_sendModal_0").css("color", "#17A2B8");

            oThis.bindingButtonEvents(sendDT, sendCent, sendModal, oThis.templateData.Token_Holder_Address);
        }
    }

    bindingButtonEvents(sendDT, sendCent, sendModal, token_holder_address) {
        const oThis = this;
        sendDT.off().on('click', { token_holder_address: token_holder_address }, oThis.sendDT);
        sendCent.off().on('click', { token_holder_address: token_holder_address }, oThis.sendCent);
        sendModal.off().on('click', { token_holder_address: token_holder_address }, oThis.sendModal);
    }

    sendCent(event) {
        sendTokens(event.data.token_holder_address, "executePayTransaction");
    }

    sendModal(event) {
        var index = document.getElementById("transaction-type");
        var value = index.options[index.selectedIndex].value;
        if (value === "executeDirectTransferTransaction") {
            sendTokens(event.data.token_holder_address, "executeDirectTransferTransaction");
        } else {
            sendTokens(event.data.token_holder_address, "executePayTransaction");
        }
    }

    sendDT(event) {
        console.log(event.data.token_holder_address);
        sendTokens(event.data.token_holder_address, "executeDirectTransferTransaction");
    }

    compileTemplates() {
        const oThis = this;
        let methodTemplateHtml = $("#user-method-template").html();
        oThis.methodTemplate = Handlebars.compile(methodTemplateHtml);
    }

    bindEvents() {
        const oThis = this;

        $(function() {
            $("#previous").disabled = true;
            $("#next").click(function() {
                oThis.nextPageload();
            });
            $("#previous").click(function() {
                oThis.prevPageload();
            });
        })
    }

    nextPageload() {
        const oThis = this;
        if (oThis.nextPagePayload == null) {
            $("#next").disabled = false;
            alert("You have arrived on the last page");
            return;
        }
        $("#previous").disabled = false;

        oThis.previousPage = oThis.nextPagePayload - 1;
        let apiUrl = oThis.generateUrl(oThis.nextPagePayload);
        oThis.loadUsers(apiUrl);
    }
    prevPageload() {
        const oThis = this;
        if (oThis.previousPage <= 0) {
            $("#previous").disabled = false;
            return;
        }
        console.log(oThis.previousPage);
        let apiUrl = oThis.generateUrl(oThis.previousPage);
        oThis.previousPage = oThis.previousPage - 1;
        oThis.loadUsers(apiUrl);
    }


}
var userPage = new UserPage();

function sendTokens(tokenHolderAddress, transactionType) {
    const currentUser = userPage.getCurrentUser();
    let mappyCallback = new OstWorkflowDelegate();
    mappyCallback.requestAcknowledged = function(ostWorkflowContext, ostContextEntity) {
        alert("Transaction Acknowledged");
    };

    mappyCallback.flowInterrupt = function(ostWorkflowContext, ostError) {
        console.log(ostError);
        alert("Transaction Interruped");
    };


    mappyCallback.flowComplete = function(ostWorkflowContext, ostContextEntity) {

        console.log("getQRCode");
        console.log("ostWorkflowContext :: ", ostWorkflowContext);
        console.log("ostContextEntity :: ", ostContextEntity);
    };
    let workflowId;
    switch (transactionType) {
        case "executeDirectTransferTransaction":
            let workflowId = OstWalletSdk.executeDirectTransferTransaction(currentUser.user_id, {
                    token_holder_addresses: [tokenHolderAddress],
                    amounts: ['10'],
                },
                mappyCallback);
            break;
        case "executePayTransaction":
            workflowId = OstWalletSdk.executePayTransaction(currentUser.user_id, {
                    token_holder_addresses: [tokenHolderAddress],
                    amounts: ['10'],
                },
                mappyCallback);
            break;
        default:
            console.log("Not any transaction type");
    }

}

export default UserPage;