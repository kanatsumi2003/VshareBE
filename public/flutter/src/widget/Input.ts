import { isBuffer } from "lodash";
import { Utils } from "../Utils";
import { Widget } from "./Widget";

export class Input extends Widget {
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
    inner = this.parseValidator(inner);
     
    inner = this.parseNumberOnly(inner);
    return inner;
  }

  private parseValidator(inner: string) {
    var regexValidator = /{formElValidator}([\s\S]*?){\/formElValidator}/g;
    var match = regexValidator.exec(inner);
    var outterValid = match[1];
    var innerValid = match[0];

    if (this.parameter.required) {
      inner = inner.replace(innerValid, outterValid);
    } else {
      inner = inner.replace(innerValid, "");
    }
    return inner;
  }

  private parseNumberOnly(inner: string) {
    var match = Utils.getRawWidgetTemp('formElNumberOnly', inner);
     
    var outterValid = match.outter;
    var innerValid = match.inner;

    if (this.parameter.dataType == 'integer') {
      inner = inner.replace(outterValid, innerValid);
    } else {
      inner = inner.replace(outterValid, "");
    }
    return inner;
  }
 
  public static widgetKey = 'formInput';
  public getRawTempKey(): string {
    return Input.widgetKey;
  }  
 
}
