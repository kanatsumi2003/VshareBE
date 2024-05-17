import { isBuffer } from "lodash";
import { Utils } from "../Utils";
import { Widget } from "./Widget";

export class MultiFile extends Widget {
  private parameter: any;
  private dartTemp: string;

  constructor(parameter: any, dartTemp: string) {
    super();
    this.parameter = parameter;
    this.dartTemp = dartTemp;
  }

  generate(): string { 
    var match = this.getRawTemp(this.dartTemp); 
    var inner = match.inner;
     
    let config: any = {
      "{formElControllerName}": this.generateControllerName(this.parameter),
      "{formElWidgetName}": this.generateWidgetName(this.parameter),
      "{formElCaption}": this.parameter.description
        ? this.parameter.description
        : this.parameter.name,
      "{formElRequired}": this.parameter.required ? "true" : "false"
    };

    inner = Utils.replaceKeyValueRegex(config, inner); 
      
    return inner;
  }
 
  public static widgetKey = 'formElMultiFile';
  public getRawTempKey(): string {
    return MultiFile.widgetKey;
  }  
 
}
