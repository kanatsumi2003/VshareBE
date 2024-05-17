 
import { Date } from "./Date"; 

export class Datetime extends Date {
  
  static widgetKey = 'formDatetime';
  public getRawTempKey(): string {
    return Datetime.widgetKey;
  } 
 
}
