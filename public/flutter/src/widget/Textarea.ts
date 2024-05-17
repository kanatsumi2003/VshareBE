 
import { Input } from "./Input"; 

export class Textarea extends Input {
  static widgetKey = 'formTextarea';
  public getRawTempKey(): string {
    return Textarea.widgetKey;
  }
}
