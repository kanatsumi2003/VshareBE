import { Utils } from "../Utils";
import { Select } from "./Select";

export class MultiSelect extends Select { 

  static widgetKey = 'formElMultiSelect';
  public getRawTempKey(): string {
    return MultiSelect.widgetKey;
  }   
}
