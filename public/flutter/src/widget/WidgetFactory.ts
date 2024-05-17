import { Utils } from "../Utils";
import { Input } from "./Input";
import { File } from "./File";
import { MultiFile } from "./MultiFile";
import { Select } from "./Select";
import { MultiSelect } from "./MultiSelect";
import { Widget } from "./Widget";
import { Datetime } from "./Datetime";
import { Date } from "./Date";
import { Richtext } from "./Richtext";
import { Check } from "./Check";
import { Textarea } from "./Textarea";
import { TimeWidget } from "./Time";
export class WidgetFactory {
  private parameter: any;
  private dartTemp: string;

  constructor(parameter: any, dartTemp: string) {
    this.parameter = parameter;
    this.dartTemp = dartTemp;
    
  }

  generateWidget(): string {
    return this.getWidget().generate();
  }

  getWidget(): Widget {
    switch (this.parameter.type) {
      case "select":
        return this.generateSelect();
        break;
      case "multi_select":
        return this.generateMutiSelect();
        break;
      case "check":
        return this.generateCheck();
        break;
      case "richtext":
        return this.generateRichtext();
        break;
      case "date":
        return this.generateDate();
        break;
      case "datetime":
        return this.generateDatetime();
        break;
        case "time":
          return this.generateTime();
          break;
      case "file":
        return this.generateFile();
        break;
      case "multi_file":
        return this.generateMultiFile();
        break;
      case "textarea":
          return this.generateTextarea();
          break;
      default:
        return this.generateInput();
        break;
    }
  }

  generateInput(): Widget {
    return new Input(this.parameter, this.dartTemp);
  }

  generateTextarea(): Widget {
    return new Textarea(this.parameter, this.dartTemp);
  }

  generateFile(): Widget {
    return new File(this.parameter, this.dartTemp);
  }
  generateMultiFile(): Widget {
    return new MultiFile(this.parameter, this.dartTemp);
  }
  generateMutiSelect(): Widget {
    return new MultiSelect(this.parameter, this.dartTemp);
  }
  generateSelect(): Widget {
    return new Select(this.parameter, this.dartTemp);
  } 

  generateDatetime(): Widget {
    return new Datetime(this.parameter, this.dartTemp);
  }

  generateTime(): Widget {
    return new TimeWidget(this.parameter, this.dartTemp);
  }

  generateDate(): Widget {
    return new Date(this.parameter, this.dartTemp);
  }
  generateRichtext(): Widget {
    return new Richtext(this.parameter, this.dartTemp);
  }
  generateCheck(): Widget {
    return new Check(this.parameter, this.dartTemp);
  }
}
