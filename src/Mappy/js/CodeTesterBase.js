import Handlebars from "handlebars";
import CodeHighlight from "highlight.js";
import CodeHighlightJSLanguageSupport from "highlight.js/lib/languages/javascript";
import "highlight.js/styles/vs.css";
import "jquery.json-viewer/json-viewer/jquery.json-viewer.css";
import "jquery.json-viewer/json-viewer/jquery.json-viewer";


CodeHighlight.registerLanguage('javascript', CodeHighlightJSLanguageSupport);
const jsonViewerSettings = { collapsed: false, withQuotes: true, withLinks: false};
class CodeTesterBase {
  constructor(jqsContainer = "#page-container", jqsTemplate = "#j-method-template") {
    const oThis = this;
    // Create Page Initializer
    oThis.jqsContainer = jqsContainer;
    oThis.jqsTemplate = jqsTemplate;

    //
    oThis.methods = [];

    oThis.addTesterConfigs();
  }

  perform( currentUser ) {
    const oThis = this;
    oThis.compileTemplates();

    let cnt, len = oThis.methods.length;
    for( cnt = 0; cnt < len; cnt++ ) {

      let methodData = oThis.methods[ cnt ];
      let methodName = methodData.selfMethodName;
      let displayCode = methodData.displayCode + oThis.getMethodDisplayAppendText();
      let displayCodeTemplate = Handlebars.compile( displayCode );


      let viewId = "method-" + methodName + "-" + cnt;
      let templateData = {
        methodName: methodName,
        displayCode: displayCode,
        viewId: viewId,
        jsonViewId: "json-view-" + viewId,
        stringViewId: "string-view-" + viewId,
        displayCodeViewId: "display-code-" + viewId,
      };

      // Copy current user info.
      Object.assign(templateData, currentUser || oThis.currentUser);

      let finalDisplayCode = displayCodeTemplate( templateData );
      templateData.displayCode = finalDisplayCode;

      let outputHtml = oThis.methodTemplate( templateData );
      let jOutputEl = $( outputHtml );

      let codeEl = jOutputEl.find("#" + templateData.displayCodeViewId)[ 0 ];
      codeEl && CodeHighlight.highlightBlock( codeEl );

      $(oThis.jqsContainer).first().append( jOutputEl );
      oThis.makeMethodCall(templateData, jOutputEl);
    }
  }

  makeMethodCall(templateData, jOutputEl) {
    const oThis = this;

    let methodName = templateData.methodName;
    let jsonViewId = templateData.jsonViewId;
    let stringViewId = templateData.stringViewId;

    let jsonEl  = jOutputEl.find("#" + jsonViewId);
    let strEl   = jOutputEl.find("#" + stringViewId);

    if ("function" != typeof oThis[ methodName ]) {
      console.log("oThis.", methodName, "is not a function.\n", oThis[ methodName ]);
      return;
    }
    oThis[ methodName ]()
      .then((response) => {
        jsonEl.jsonViewer( response, jsonViewerSettings);
        strEl.html( JSON.stringify(response, null, 2) );
      })
      .catch( (error) => {
        let dataToPrint = error;

        if (error instanceof OstError) {
          dataToPrint = error.getJSONObject();
        }

        jsonEl.jsonViewer( dataToPrint, jsonViewerSettings);
        jsonEl.addClass("alert alert-warning");
        strEl.html( JSON.stringify(dataToPrint, null, 2) );
        strEl.addClass("alert alert-warning");
      })

  }

  compileTemplates() {
    const oThis = this;
    let methodTemplateHtml = $(oThis.jqsTemplate).html();
    oThis.methodTemplate = Handlebars.compile( methodTemplateHtml );
  }

  getMethodDisplayAppendText() {
    return '.then( (result) => { console.log( result ); }).catch( (err) => { console.log(err); });';
  }

  addTesterConfigs() {
    const oThis = this;
    throw new Error("Derived classes Must implement addTesterConfigs");
  }

  validatePage() {
    const oThis = this;
  }

  addTestConfig(selfMethodName, displayCode) {
    const oThis = this;
    oThis.methods.push({
      displayCode: displayCode,
      selfMethodName: selfMethodName
    });
  }
}
export default CodeTesterBase;
