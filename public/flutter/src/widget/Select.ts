import { Utils } from "../Utils";
import { Widget } from "./Widget";

export class Select extends Widget {
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
    var ctrlName = this.generateControllerName(this.parameter);
    let config: any = {
      "{formElControllerName}": ctrlName,
      "{formElWidgetName}": this.generateWidgetName(this.parameter),
      "{formElCaption}": this.parameter.description
        ? this.parameter.description
        : this.parameter.name, 
        "{selectedIds}" : ctrlName
    };

    inner = Utils.replaceKeyValueRegex(config, inner); 
    return inner;
  }
   
  
  static widgetKey = 'formElSelect';
  public getRawTempKey(): string {
    return Select.widgetKey;
  }   
  
}
