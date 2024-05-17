import { Utils } from "./Utils";

export class prepareSelectData {
    private dart : string;
    private method : string;
    private ppp : any; 
    
    constructor(dart : string, ppp : any, method: string)  {
        this.dart = dart; 
        this.ppp = ppp;  
        this.method = method;
    }

    parse( ) : string {
        var pppKeys = this.ppp ? Object.keys(this.ppp) : [];
        var widgetTemp = Utils.getRawWidgetTemp('prepareDataForSelect', this.dart);  
         
        var tableFields = [];
        var configFields = []; 
        var data = widgetTemp.inner; 
        var list: any[] = [];

        for(var i = 0; i < pppKeys.length; i++) {
            var fieldName = pppKeys[i]; 
            var type = this.ppp[fieldName];
            if(type.indexOf('select') != -1) {  
                var hasconfigFields = type.split(':').length > 1;
                var bodyName = "bodyTable";
                if(hasconfigFields) {
                    bodyName = "bodyConfig";
                    configFields.push(fieldName);
                }
                else {
                    tableFields.push(fieldName);
                }
                list.push(this.assign(fieldName, bodyName));
            }
        }
        if(list.length > 0) {
            data = data.replace('{assign}', list.join("\n"));             
            this.dart = this.dart.replace(widgetTemp.outter, data);
            this.dart = Utils.replaceKeyValueRegex(
            {
                "{configFields}": configFields.length > 0 ? '"'+configFields.join('", "')+'"' : "", 
                "{tableFields}": tableFields.length > 0 ? '"'+tableFields.join('", "')+'"' : "", 
            }, this.dart);
            
        }
        else {
            if(this.method == 'put') {
                data = data.replace('{assign}', ""); 
                this.dart = this.dart.replace(widgetTemp.outter, data);
                this.dart = Utils.replaceKeyValueRegex( {
                    "{configFields}":  "", 
                    "{tableFields}": "", 
                }, this.dart);
            }
            else {
                this.dart = this.dart.replace(widgetTemp.outter, "bool loadedSelectData = true;");
            }
        } 

        return this.dart;
        
    } 

    private assign(key: string, bodyName: string) {
        var list = []; 
        var controllerName = Utils.generateControllerName(key); 
        list.push('list' + controllerName + ' = jsonArrayToList('+bodyName+'["data"]["' + key + '"]);'); 
        return list.join("\n");
    }
}