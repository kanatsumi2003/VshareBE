import { Utils } from "../Utils";
import { Widget } from "./Widget";

export class File extends Widget {
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
    var controllerName = this.generateControllerName(this.parameter); 
    let config: any = {
      "{formElControllerName}": controllerName,
      "{formElWidgetName}": this.generateWidgetName(this.parameter),
      
      "{fileBytes}": controllerName + "Bytes",
      "{fileName}": controllerName,
      "{fileDesc}": this.parameter.description
        ? this.parameter.description
        : this.parameter.name,
    };

    inner = Utils.replaceKeyValueRegex(config, inner);
    return inner;
  }

  static widgetKey = 'formElFile';
  public getRawTempKey(): string {
    return File.widgetKey;
  }  
}
