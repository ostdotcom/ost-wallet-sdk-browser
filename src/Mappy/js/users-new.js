import PageInitializer from "./PageInitializer";
import ajaxUtils from "./ajaxUtils";
import Handlebars from "handlebars";
import '../css/users.css';
import BigNumber from 'bignumber.js';
import "jquery.json-viewer/json-viewer/jquery.json-viewer.css";
import "jquery.json-viewer/json-viewer/jquery.json-viewer";
//BigNumber.config({ EXPONENTIAL_AT: 2 })
const jsonViewerSettings = { collapsed: false, withQuotes: true, withLinks: false};
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
        return this.pageInitializer.getApiBaseUrl() + '/users?page=' + page;
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
                    balance_in_lower_unit: 0,
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
                balance = BigNumber(jsonData.balances[app_user_id].available_balance).toString(10);
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
                balance_in_lower_unit: balance,
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
        $("#transaction-json").html('')
        $("#transaction-string").html( '');
        sendTokens(event.data.token_holder_address, "executePayTransaction", '1');
    }

    sendModal(event) {
        $("#transaction-json").html( '');
        $("#transaction-string").html('' );
        var index = document.getElementById("transaction-type");
        var value = index.options[index.selectedIndex].value;
        var amount = document.getElementById("transaction-amount").value;
        if (value === "Direct Transfer") {
            sendTokens(event.data.token_holder_address, "executeDirectTransferTransaction",amount);
        } else {
            sendTokens(event.data.token_holder_address, "executePayTransaction",amount);
        }
    }

    sendDT(event) {
        $("#transaction-json").html('');
        $("#transaction-string").html( '' );
        console.log(event.data.token_holder_address);
        sendTokens(event.data.token_holder_address, "executeDirectTransferTransaction", '1');
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

    convertCentToWei(amount){
        let pricer = new BigNumber(0);
        let amountBN = new BigNumber(amount);
        let rateBN = new BigNumber(10).pow(16);
        pricer = amountBN.multipliedBy(rateBN);
        return pricer.toString();
    }

    convertBtToWei(amount){
        console.log("currentUser :: function", this.getCurrentUser());
        const ostUserId = this.getCurrentUser().user_id;
        let directTransfer = new BigNumber(0);
        return OstJsonApi.getToken( ostUserId )
        .then((data)=>{
            if(!data){
                console.error("Token not found");
                return Promise.resolve('0');
            }
            let decimals = data.data.token.decimals;
            let decimalBN = new BigNumber(decimals);
            let multiplier = new BigNumber(10).pow(decimalBN);
            let amountBN = new BigNumber(amount);
            directTransfer = amountBN.multipliedBy(multiplier);
            return Promise.resolve(directTransfer.toString());
        })
        .catch( (err) => { 
            console.error(err);
            return Promise.resolve('0');
        });
    }
}
var userPage = new UserPage();

function sendTokens(tokenHolderAddress, transactionType, amount) {
    
    $('#transaction-output-modal').modal('show');
    
    const currentUser = userPage.getCurrentUser();
    let mappyCallback = new OstWorkflowDelegate();
    mappyCallback.requestAcknowledged = function(ostWorkflowContext, ostContextEntity) {
        alert("Transaction Acknowledged");
    };

    mappyCallback.flowInterrupt = function(ostWorkflowContext, ostError) {
        console.log(ostError);
        //alert("Transaction Interruped");
        $("#transaction-json").jsonViewer( ostError, jsonViewerSettings);
        $("#transaction-string").html( JSON.stringify(ostError, null, 2) );
    };


    mappyCallback.flowComplete = function(ostWorkflowContext, ostContextEntity) {

        console.log("getQRCode");
        console.log("ostWorkflowContext :: ", ostWorkflowContext);
        console.log("ostContextEntity :: ", ostContextEntity);
        //alert("Transaction Completed");
        $("#transaction-json").jsonViewer( ostContextEntity, jsonViewerSettings);
        $("#transaction-string").html( JSON.stringify(ostContextEntity, null, 2) );
    };
    let workflowId;
    switch (transactionType) {
        case "executeDirectTransferTransaction":
            $('#type-label').text("Direct Transfer");
            $('#amount-label').text(amount);
            $('#address-label').text(tokenHolderAddress);
            userPage.convertBtToWei(amount)
            .then((value)=>{
                const amountBN = value;
                let workflowId = OstWalletSdk.executeDirectTransferTransaction(currentUser.user_id, {
                        token_holder_addresses: [tokenHolderAddress],
                        amounts: [amountBN],
                    },
                    mappyCallback);
            })
            break;
        case "executePayTransaction":
            const amountBN = userPage.convertCentToWei(amount);
            $('#type-label').text("Execute Pay");
            $('#amount-label').text(amount);
            $('#address-label').text(tokenHolderAddress);
            workflowId = OstWalletSdk.executePayTransaction(currentUser.user_id, {
                    token_holder_addresses: [tokenHolderAddress],
                    amounts: [amountBN],
                },
                mappyCallback);
            break;
        default:
            console.log("Not any transaction type");
    }

}

export default UserPage;