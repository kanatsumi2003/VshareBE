import { Utils } from "../Utils";


export abstract class Widget {
  
  public abstract generate() : string;

  public abstract getRawTempKey() : string;

  public getRawTemp(dartTemp : string) : any {
      var tagName = this.getRawTempKey();
      return Utils.getRawWidgetTemp(tagName, dartTemp);  
  };

  protected generateControllerName(parameter : any) : string {
    var widetName = parameter.name;
    widetName = parameter.groupName ? parameter.groupName+'_'+widetName : widetName;
    return widetName+'Controller';
  }

  protected generateWidgetName(parameter: any) : string {
    var widetName = parameter.name;
    widetName = parameter.groupName ? parameter.groupName+'_'+widetName : widetName;
    return 'gen'+Utils.strToMethod(widetName)+'Widget';
  }
 
}