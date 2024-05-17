import { Utils } from "../Utils";
import { Widget } from "./Widget";

export class Check extends Widget {
  private parameter: any;
  private dartTemp: string;

  constructor(parameter: any, dartTemp: string) {
    super();
    this.parameter = parameter;
    this.dartTemp = dartTemp;
  }

  generate(): string {
     
    var match = this.getRawTemp(this.dartTemp);
    var outter = match.outter;
    var inner = match.inner;

    let config: any = {
      "{formElControllerName}": this.generateControllerName(this.parameter),
      "{formElWidgetName}": this.generateWidgetName(this.parameter),
      "{formElCaption}": this.parameter.description
        ? this.parameter.description
        : this.parameter.name,
    };

    inner = Utils.replaceKeyValueRegex(config, inner); 
    return inner;
  }
 
  static widgetKey = 'formCheck';
  public getRawTempKey(): string {
    return Check.widgetKey;
  } 
}
