import PageInitializer from "./PageInitializer";
import ajaxUtils from "./ajaxUtils";
import Handlebars from "handlebars";
import '../css/users.css';
import BigNumber from 'bignumber.js';
import "jquery.json-viewer/json-viewer/jquery.json-viewer.css";
import "jquery.json-viewer/json-viewer/jquery.json-viewer";


import workflowSubscriberService from "./WorkflowSubscriberService";

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
        oThis.pageData = {};

        oThis.nextPagePayload = 1;
        oThis.previousPage = 1;
        oThis.bindEvents();
    }
    getCurrentUser() {
        return this.currentUser;
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
                var source = document.getElementById("user-method-template").innerHTML;
                let template = Handlebars.compile(source);
                this.processData(response, template);
            })
    }
    toggleTxCurrencyOptionDisplay(){
        let jTxType = $("#custom_tx_type");
        let tx_type = jTxType.val();
        if (tx_type === "executePayTransaction") {
            $("#custom_tx_currency_wrap").removeClass("d-none");
        } else{
            $("#custom_tx_currency_wrap").addClass("d-none");
        }
    }

    processData(jsonData, template) {
        const oThis = this;
        $('#user-row-div').empty();

        oThis.nextPagePayload = jsonData.meta.next_page_payload.page;
        var viewId = "user_row";
        let balance = 0;
        let jOutputEl;
        let outputHtml;
        let token_holder_address;

        for (var i = 0; i < 10; i++) {
            let userInfo = jsonData.users[i];
            let app_user_id = jsonData.users[i].app_user_id;
            let userBalanceInfo = jsonData.balances[app_user_id] || {};
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

            let templateData = {
                "row_id": "user-" + userInfo.app_user_id,
                ...userBalanceInfo,
                ...userInfo
            };
            oThis.pageData[ userInfo.app_user_id ] = templateData;
            

            outputHtml = template(templateData);
            oThis.htmlwork += outputHtml;

            $('#user-row-div').append(outputHtml);
            jOutputEl = $(outputHtml);

        }
        $( "#transaction-type" ).change(function() {
            var index = document.getElementById("transaction-type");
            var value = index.options[index.selectedIndex].value;
            if (value === "Pay") {
                $("#select-currency-label").removeClass("d-none");
                $("#transaction-currency-type").removeClass("d-none");
            } else{
                $("#select-currency-label").addClass("d-none");
                $("#transaction-currency-type").addClass("d-none");
            }
          });
    }

    sendOneBT(token_holder_address) {
        const oThis = this;
        oThis.sendTokens(token_holder_address, "executeDirectTransferTransaction", '1' ,'USD');
    }

    sendOneCent( token_holder_address ) {
        const oThis = this;
        oThis.sendTokens(token_holder_address, "executePayTransaction", '1','USD');
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

            $("body").on('click', ".j-send-1-bt", function(event) {
                let jEl = $(this);
                let data = jEl.data();
                let appUserId = data.appUserId;
                let userData = oThis.pageData[ appUserId ];
                oThis.sendOneBT( userData.token_holder_address );
            });

            $("body").on('click', ".j-send-1-cent", function(event) {
                let jEl = $(this);
                let data = jEl.data();
                let appUserId = data.appUserId;
                let userData = oThis.pageData[ appUserId ];
                oThis.sendOneCent( userData.token_holder_address );
            });

            $("body").on('click', ".j-send-custom", function(event) {
                let jEl = $(this);
                let data = jEl.data();
                let appUserId = data.appUserId;
                let userData = oThis.pageData[ appUserId ];
                oThis.openCustomTxModal( userData.token_holder_address );
            });

            $("#custom_tx_type").change(function() {
                
                let jEl = $( this );
                let val = jEl.val();
                
                oThis.toggleTxCurrencyOptionDisplay();

            });
            $("#custom_tx_perform").click(function () {
                oThis.performCustomTx();
            });
        })
    }
    

    openCustomTxModal( token_holder_address ) {
        const oThis =this;
        let jTxModal = $("#custom_tx_modal");
        let jTxType = $("#custom_tx_type");
        let jTxCurrency = $("#custom_tx_currency");
        let jTxAmount = $("#custom_tx_amount");
        let jTxTokenHolder = $("#custom_tx_token_holder");

        // Set token holder address.
        jTxTokenHolder.val( token_holder_address );

        // Set default tx type.
        jTxType.val( "executeDirectTransferTransaction" );

        oThis.toggleTxCurrencyOptionDisplay();

        // Set default tx currency.
        jTxCurrency.val("USD");

        // Set default 
        jTxAmount.val("0.01");

        // Show the modal
        jTxModal.modal('show');
    }

    performCustomTx() {
        const oThis = this;
        let jTxModal = $("#custom_tx_modal");
        let jTxType = $("#custom_tx_type");
        let jTxCurrency = $("#custom_tx_currency");
        let jTxAmount = $("#custom_tx_amount");
        let jTxTokenHolder = $("#custom_tx_token_holder");

        let txType = jTxType.val();

        let txCurrency = jTxCurrency.val();
        let txAmount = jTxAmount.val();
        let txTokenHolder = jTxTokenHolder.val();

        // Hide the modal
        jTxModal.modal('hide');

        
        // tokenHolderAddress, transactionType, amount, currency_type        
        oThis.sendTokens(txTokenHolder, txType, txAmount, txCurrency);
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
        const currentUser = this.getCurrentUser();
        const tokenId = currentUser.token_id;
        let directTransfer = new BigNumber(0);
        return OstWalletSdk.getToken( tokenId )
        .then((token) => {
            if(!token){
                console.error("Token not found");
                throw new Error("Invalid reponse from OstJsonApi.getToken");
            }

            console.log("||*","token", token);
            let decimals = token.decimals;
            console.log("||*","decimals", decimals);

            let decimalBN = new BigNumber(decimals);
            console.log("||*","decimalBN", decimalBN);
            let multiplier = new BigNumber(10).pow(decimalBN);
            console.log("||*","multiplier", multiplier);
            let amountBN = new BigNumber(amount);
            console.log("||*","amountBN", amountBN);
            directTransfer = amountBN.multipliedBy(multiplier);
            console.log("||*","directTransfer", directTransfer);
            console.log("||*","directTransfer.toString()", directTransfer.toString());
            return Promise.resolve(directTransfer.toString( 10 ));
        })
        .catch( (err) => {
            console.log("||*", err);
            throw err;
        });
    }

    prepareTxModal() {
        $("#transaction-json").html('');
        $("#transaction-string").html( '');
        $("#transaction-req-json").html('');
        $("#transaction-req-string").html('');        
    }

    sendTokens(tokenHolderAddress, transactionType, amount, currency_type) {

        const oThis = this;
        oThis.prepareTxModal();

        $('#transaction-output-modal').modal('show');

        const currentUser = userPage.getCurrentUser();
        let mappyCallback = new OstWorkflowDelegate();
        
        mappyCallback.requestAcknowledged = function(ostWorkflowContext, ostContextEntity) {
            //alert("Transaction Acknowledged");
            $("#transaction-req-json").jsonViewer( ostContextEntity, jsonViewerSettings);
            $("#transaction-req-string").html( JSON.stringify(ostContextEntity, null, 2) );
            $("#req-ack-output-label").text("Request Acknowledgement:");
        };

        mappyCallback.flowInterrupt = function(ostWorkflowContext, ostError) {
            console.log(ostError);
            //alert("Transaction Interruped");
            $("#transaction-json").jsonViewer( ostError, jsonViewerSettings);
            $("#transaction-string").html( JSON.stringify(ostError, null, 2) );
            $("#flow-transaction-output-label").text("Flow Interrupt:");
        };


        mappyCallback.flowComplete = function(ostWorkflowContext, ostContextEntity) {

            console.log("getQRCode");
            console.log("ostWorkflowContext :: ", ostWorkflowContext);
            console.log("ostContextEntity :: ", ostContextEntity);
            //alert("Transaction Completed");
            $("#transaction-json").jsonViewer( ostContextEntity, jsonViewerSettings);
            $("#transaction-string").html( JSON.stringify(ostContextEntity, null, 2) );
            $("#flow-transaction-output-label").text("Flow Complete:");
        };
        let workflowId;
        switch (transactionType) {
            case "executeDirectTransferTransaction":
                $('#type-label').text("Direct Transfer");
                $('#amount-label').text(amount + " BT");
                $('#address-label').text(tokenHolderAddress);
                userPage.convertBtToWei(amount)
                .then((value) => {
                    const amountBN = value;
                    let workflowId = OstWalletSdk.executeDirectTransferTransaction(currentUser.user_id, {
                            token_holder_addresses: [tokenHolderAddress],
                            amounts: [amountBN],

                        },
                        mappyCallback);
                });
                break;
            case "executePayTransaction":
                const amountBN = userPage.convertCentToWei(amount);
                $('#type-label').text("Execute Pay");
                $('#amount-label').text(amount);
                $('#address-label').text(tokenHolderAddress);
                let workflowId = OstWalletSdk.executePayTransaction(currentUser.user_id, {
                        token_holder_addresses: [tokenHolderAddress],
                        amounts: [amountBN],
                        options: {
                            currency_code: currency_type
                        }
                    },
                    mappyCallback);
                    workflowSubscriberService.addWorkflow(workflowId);
                break;
            default:
                console.log("Not any transaction type");
        }
    }
}
var userPage = new UserPage();



export default UserPage;
