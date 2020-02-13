import PageInitializer from "./PageInitializer";
import CodeTesterBase from "./CodeTesterBase";
class CodeTesterPageBase extends CodeTesterBase {
  constructor(jqsContainer = ".container", jqsTemplate = "#j-method-template") {
    super(jqsContainer, jqsTemplate);

    const oThis = this;

    oThis.pageInitializer = new PageInitializer();
    oThis.pageInitializer.onPageInitialized( ( currentUser ) => {
      oThis.onPageInitialized( currentUser );
    });
  }

  onPageInitialized( currentUser ) {
    const oThis = this;
    oThis.currentUser = currentUser;
    console.log("currentUser", currentUser);
    oThis.perform( currentUser );
  }
}

export default CodeTesterPageBase;