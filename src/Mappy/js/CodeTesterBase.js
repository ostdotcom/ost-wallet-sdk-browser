import codeHighlighter from "highlight.js";
import PageInitializer from "./PageInitializer";
import Handlebars from "handlebars";
import CodeHighlight from "highlight.js";
import CodeHighlightJSLanguageSupport from "highlight.js/lib/languages/javascript";
import "highlight.js/styles/vs.css";
import "jquery.json-viewer/json-viewer/jquery.json-viewer.css";
import "jquery.json-viewer/json-viewer/jquery.json-viewer";


CodeHighlight.registerLanguage('javascript', CodeHighlightJSLanguageSupport);
const jsonViewerSettings = { collapsed: false, withQuotes: true, withLinks: false};
class CodeTesterBase {
  constructor() {
    const oThis = this;
    // Create Page Initializer
    oThis.pageInitializer = new PageInitializer();
    oThis.pageInitializer.onPageInitialized( ( currentUser ) => {
      oThis.currentUser = currentUser;
      console.log("currentUser", currentUser);
      oThis.onPageInitialized( currentUser );
    });

    //
    oThis.methods = [];

    oThis.addTesterConfigs();
  }

  init() {
    const oThis = this;
    this.validatePage();
    this.setupSdkHelper.perform();
  }

  onPageInitialized( ) {
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
      Object.assign(templateData, oThis.currentUser);

      let finalDisplayCode = displayCodeTemplate( templateData );
      templateData.displayCode = finalDisplayCode;

      let outputHtml = oThis.methodTemplate( templateData );
      let jOutputEl = $( outputHtml );
      
      let codeEl = jOutputEl.find("#" + templateData.displayCodeViewId)[ 0 ];
      codeEl && CodeHighlight.highlightBlock( codeEl );

      $(".container").first().append( jOutputEl );
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
        jsonEl.jsonViewer( error, jsonViewerSettings);
        jsonEl.css({
          backgroundColor: "yellow"
        })
        strEl.html( JSON.stringify(error, null, 2) );
        strEl.css({
          backgroundColor: "yellow"
        })
      })

  }

  compileTemplates() {
    const oThis = this;
    let methodTemplateHtml = $("#j-method-template").html();
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