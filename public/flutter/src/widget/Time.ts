 
import { Date } from "./Date"; 

export class TimeWidget extends Date {
  
  static widgetKey = 'formTime';
  public getRawTempKey(): string {
    return TimeWidget.widgetKey;
  } 
 
}
