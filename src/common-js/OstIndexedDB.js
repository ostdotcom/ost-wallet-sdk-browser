import OstError from "./OstError"
import OstErrorMessages from './OstErrorMessages'

class OstIndexedDB{
    constructor(name) {
        this.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        
        if( !name ) {
            throw new OstError("oidb_cons_1","ILLEAGAL_ARGUMENT");
        }else{
            this.dbName = name;
        }

    }
}