import BigNumber from 'bignumber.js';
import "jquery.json-viewer/json-viewer/jquery.json-viewer.css";
import "jquery.json-viewer/json-viewer/jquery.json-viewer";

const LOG_TAG = "CreateSessionHelper :: ";
const jsonViewerSettings = { collapsed: false, withQuotes: true, withLinks: false};

class CreateSessionHelper {
    constructor( currentUser ) {
        const oThis =this;
        oThis.currentUser = currentUser;
        oThis.bindEvents();
    }

    getCurrentUser() {
        const oThis =this;
        return oThis.currentUser;
    }

    bindEvents() {
        const oThis = this;
        for (var k = 1; k < 30; k++) {
            $('#j-duration').append(`<option value="${k}"> ${k} </option>`);
        }

        $('#j-create-session-btn').click(() => {
           $("#flow-complete-json").html("");
           $("#flow-complete-string").html("");
        //    $("#flow-interrupt-json").html("");
        //    $("#flow-interrupt-string").html("");
        });
        $('#j-create-btn').click(() => {
            oThis.perform();
        });
    }
    perform() {
        const oThis = this;
        var value = $('#j-spending-limit').val();
        oThis.higherUnitSpending = value;
        var index = document.getElementById("j-duration");
        var duration = index.options[index.selectedIndex].value;
        oThis.getDate(duration);
        var spendingLimit = parseInt(value, 10);
        $('#createSession').modal('toggle');
        $("#expiry-label").text(oThis.expiry);

        oThis.convertSessionLimit(spendingLimit)
            .then((limit) => {
                oThis.spendingLimit = limit;
                console.log("spending limit", limit);
                $("#spending-limit-label-lower").text(oThis.spendingLimit);
                $("#spending-limit-label-higher").text(value);

                //var html = $("div.changeSession").html();
                //$('#modal-body').html(html);
                //$('#j-create-session-btn').hide();
                $('#afterSession').modal('toggle');
                oThis.createSession();
            })
            .catch((error) => {
                oThis.spendingLimit = 0;
                console.error("error in spending limit function", error);
            })
    }
    makeCode(object) {

        let text = object;
        if (object && typeof object === 'object') {
            text = JSON.stringify(object);
        }
        $("#QrMainDiv").html('');
        $("#QrMainDiv").html('<div id="qrcode" class="QRCodeDiv "></div>');

        var qr = $("#qrcode")[0];
        console.log(qr);
        //$('#qrcode').qrcode(text);
        var qrcode = new QRCode(qr, {
            text: text,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
    createSession() {
        const oThis = this;
        let mappyCallback = new OstWorkflowDelegate();
        var html =  '<div class="text-center"> <div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></div>';
        document.getElementById("flow-complete-json").innerHTML = html;
        document.getElementById("flow-complete-string").innerHTML = html;

        mappyCallback.requestAcknowledged = function (ostWorkflowContext, ostContextEntity) {
            console.log("request ack");
            const entityType = ostContextEntity.entity_type,
                entity = ostContextEntity[entityType];
            oThis.makeCode(entity);
        };

        mappyCallback.flowComplete = function (ostWorkflowContext, ostContextEntity) {
            console.log(LOG_TAG, "createSession");
            console.log(LOG_TAG, "ostWorkflowContext :: ", ostWorkflowContext);
            console.log(LOG_TAG, "ostContextEntity :: ", ostContextEntity);
            html = "<div>" + ostContextEntity + "</div>";
            document.getElementById("flow_status").innerHTML = "Flow Complete";
            document.getElementById("flow-complete-json").innerHTML = html;
            let output = {"Flow Complete": ostContextEntity}
            $("#flow-complete-json").jsonViewer( output, jsonViewerSettings);
            $("#flow-complete-string").html( JSON.stringify(output, null, 2) );
        };

        mappyCallback.flowInterrupt = function (ostWorkflowContext, ostError) {
            console.log(LOG_TAG, "createSession");
            console.log(LOG_TAG, "ostWorkflowContext :: ", ostWorkflowContext);
            console.log(LOG_TAG, "ostError :: ", ostError);
            let output = {"Flow Interrupted": ostError}
            var html = "<div>" + output + "</div>";
            document.getElementById("flow_status").innerHTML = "Flow Interrupt";
            document.getElementById("flow-complete-json").innerHTML = html;
            $("#flow-complete-json").jsonViewer( output, jsonViewerSettings);
            $("#flow-complete-string").html( JSON.stringify(output, null, 2) );
        };

        console.log("Initiating OstWalletSdk.createSession with spendingLimit", oThis.spendingLimit, ". The higherUnitSpendingLimit is", oThis.higherUnitSpending);
        let workflowId = OstWalletSdk.createSession(
            oThis.currentUser.user_id,
            parseInt(oThis.expiryTime.getTime()/1000),
            oThis.spendingLimit,
            mappyCallback);

    }
    getDate(duration) {

        const oThis = this;
        oThis.expiryTime = new Date($.now());
        var days = parseInt(duration, 10);
        oThis.expiryTime.setDate(oThis.expiryTime.getDate() + days);
        oThis.expiry = oThis.expiryTime.toUTCString().slice(0,25);
        console.log("expiry", oThis.expiry);

    }
    convertSessionLimit(amount) {
        console.log("currentUser :: function", this.getCurrentUser());
        const ostUserId = this.getCurrentUser().user_id;
        let directTransfer = new BigNumber(0);
        return OstJsonApi.getToken(ostUserId)
            .then((data) => {
                if (!data) {
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
            .catch((err) => {
                console.error(err);
                return Promise.resolve('0');
            });
    }
}
export default CreateSessionHelper;
