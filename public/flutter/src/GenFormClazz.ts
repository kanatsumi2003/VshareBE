import { Utils } from "./Utils";
import { WidgetFactory } from "./widget/WidgetFactory";
import { BuildRequest } from "./BuildRequest";
import { Input } from "./widget/Input";
import { Select } from "./widget/Select";
import { MultiSelect } from "./widget/MultiSelect";
import { Date } from "./widget/Date";
import { Datetime } from "./widget/Datetime";
import { Check } from "./widget/Check";
import { Richtext } from "./widget/Richtext";
import { File } from "./widget/File";
import { MultiFile } from "./widget/MultiFile";
import { Textarea } from "./widget/Textarea";
import { prepareSelectData } from "./PrepareSelectData";
import { TimeWidget } from "./widget/Time";
const defType: string = "input";

export class GenFormClazz {
  protected dartTemp: string;
  protected dart: string;
  protected path: string;
  protected method: string;
  protected data: any;
  protected ppp: any;
  protected parameters: any;
  protected definitions: any;
  protected rawControllerWidgetTemp: any = {};
  protected bodyParameters: any[] = [];
  protected requiredParams: any[];
  protected groupNameTitles: any = {};

  constructor(
    dartTemp: string,
    path: string,
    method: string,
    data: any,
    definitions: any
  ) {
    this.dartTemp = dartTemp;
    this.dart = this.dartTemp;
    this.data = data;
    this.path = path;
    this.method = method;
    this.parameters = data.parameters;
    this.definitions = definitions;
  }

  generate(): string {
    this.generateMain();
    this.process3pParams();
    this.generateWidgets();
    this.parseFormElementMethods();

    this.prepareDataForSelect();
    this.assignPutForm();

    this.dart = new BuildRequest(
      this.dart,
      this.parameters,
      this.bodyParameters,
      this.method,
      this.data.consumes,
      this.path
    ).parse();

    this.replaceBuild();
    this.dart = this.dart.replace("{saveLabelText}", this.getSaveLabelText());
    return this.dart;
  }

  protected generateMain() {
    let config: any = {
      "{className}":
        "Base" + Utils.strToMethod(this.path + ":" + this.method) + "Page",
      "{routeName}": this.path,
      "{pageTitle}": this.data.summary,
      "{method}": this.method,
    };

    this.dart = Utils.replaceKeyValueRegex(config, this.dart);
  }

  protected replaceBuild() {
    var temp = Utils.getRawWidgetTemp("buildListTable", this.dart);

    this.dart = this.dart.replace(temp.outter, "");
    var key =
      this.method == "post"
        ? "buildPostForm"
        : this.method == "put"
        ? "buildPutForm"
        : "";
    if (!["post", "put"].includes(this.method)) {
      var tempForm = Utils.getRawWidgetTemp("buildPostForm", this.dart);
      this.dart = this.dart.replace(tempForm.outter, "");
      tempForm = Utils.getRawWidgetTemp("buildPutForm", this.dart);
      this.dart = this.dart.replace(tempForm.outter, "");
    } else if (this.method == "post") {
      var tempForm = Utils.getRawWidgetTemp("buildPostForm", this.dart);
      this.dart = this.dart.replace(tempForm.outter, tempForm.inner);
      tempForm = Utils.getRawWidgetTemp("buildPutForm", this.dart);
      this.dart = this.dart.replace(tempForm.outter, "");
    } else {
      var tempForm = Utils.getRawWidgetTemp("buildPutForm", this.dart);
      this.dart = this.dart.replace(tempForm.outter, tempForm.inner);
      tempForm = Utils.getRawWidgetTemp("buildPostForm", this.dart);
      this.dart = this.dart.replace(tempForm.outter, "");
    }
  }

  protected generateWidgets() {
    let newParameters = this.parameters;

    for (var i = 0; i < newParameters.length; i++) {
      var inx = newParameters[i].in;
      const name = newParameters[i].name;
      if (inx == "body" && name == "body") {
        this.processBodyInBody(newParameters[i].schema);
        newParameters = newParameters.concat(this.bodyParameters);
        newParameters.splice(i, 1);
        break;
      }
    }
    var widgets: any = {};
    for (var i = 0; i < newParameters.length; i++) {
      var inx = newParameters[i].in;
      const name = newParameters[i].name;
      if (
        inx == "header" ||
        inx == "path" ||
        (name == "body" && inx == "body")
      ) {
        continue;
      }

      if (this.ppp) {
        if (Object.keys(this.ppp).includes(name)) {
          newParameters[i].type = this.ppp[name].split(":")[0];
        } else {
          for (var pppName in this.ppp) {
            if (pppName.indexOf(".") != -1) {
              var pppNames = pppName.split(".");
              if (pppNames.length > 1) {
                var newPppName = pppNames[1];
                var newPppGroupName = pppNames[0];
                if (
                  name == newPppName &&
                  newParameters[i].groupName == newPppGroupName
                ) {
                  newParameters[i].type = this.ppp[pppName].split(":")[0];
                  break;
                }
              }
            } else {
              newParameters[i].type = "input";
            }
          }
        }
      } else if (newParameters[i].type != "file") {
        newParameters[i].type = defType;
      }

      var type = newParameters[i].type;

      if (!widgets[type]) {
        widgets[type] = [];
      }
      widgets[type].push(this.generateWidget(newParameters[i], type));
    }

    for (var controllerType in widgets) {
      this.dart = this.dart.replace(
        this.rawControllerWidgetTemp[controllerType].outter,
        widgets[controllerType].join("\n")
      );
    }

    this.clearUnUseWidget();
  }

  isTest() {
    return this.method == "put" && this.path == "/owner-contracts/{id}";
  }
  processBodyInBody(schema: any) {
    if (schema.allOf) {
      var all = schema.allOf;

      for (var i = 0; i < all.length; i++) {
        if (all[i]["$ref"]) {
          this.processDefinition(all[i]["$ref"]);
        } else if (all[i].required) {
          this.requiredParams = all[i].required;
        }
      }
    } else if (schema["$ref"]) {
      this.processDefinition(schema["$ref"]);
    }

    for (var i = 0; i < this.bodyParameters.length; i++) {
      if (
        this.requiredParams &&
        this.requiredParams.includes(this.bodyParameters[i].name)
      ) {
        this.bodyParameters[i].required = true;
      }
    }
  }

  processDefinition(ref: string, groupName?: string) {
    ref = ref.replace("#/definitions/", "");

    var definitions = this.definitions[ref];

    var list = definitions.allOf;

    if (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i]["$ref"]) {
          var reff = list[i]["$ref"];

          this.processDefinition(reff);
        } else if (definitions.properties) {
          var properties = definitions.properties;
          for (var name in properties) {
            this.bodyParameters.push({
              name: name,
              in: "body",
              groupName: groupName,
              type: properties[name].type,
              dataType: properties[name].type,
              description: properties[name].description,
            });
          }
        }
      }
    } else if (definitions.properties) {
      var properties = definitions.properties;

      for (var name in properties) {
        if (properties[name]["$ref"]) {
          var reff = properties[name]["$ref"];
          this.processDefinition(reff, name);
          this.groupNameTitles[name] = properties[name].description
            ? properties[name].description
            : name;
        } else {
          if (properties[name]["properties"]) {
            const subItems = properties[name]["properties"];
            this.groupNameTitles[name] = properties[name].description
              ? properties[name].description
              : name;
            for (var subName in subItems) {
              this.bodyParameters.push({
                name: subName,
                in: "body",
                groupName: name,
                type: subItems[subName].type,
                dataType: subItems[subName].type,
                description: subItems[subName].description,
              });
            }
          } else {
            this.bodyParameters.push({
              name: name,
              in: "body",
              groupName: groupName,
              type: properties[name].type,
              dataType: properties[name].type,
              description: properties[name].description,
            });
          }
        }
      }
    }
  }

  clearUnUseWidget() {
    var widgetKeys = [
      Input.widgetKey,
      Select.widgetKey,
      MultiSelect.widgetKey,
      Date.widgetKey,
      Datetime.widgetKey,
      Check.widgetKey,
      Richtext.widgetKey,
      File.widgetKey,
      MultiFile.widgetKey,
      Textarea.widgetKey,
      TimeWidget.widgetKey,
    ];
    for (var i = 0; i < widgetKeys.length; i++) {
      var unUse = Utils.getRawWidgetTemp(widgetKeys[i], this.dart);
      if (unUse) {
        this.dart = this.dart.replace(unUse.outter, "");
      }
    }
  }

  process3pParams(): void {
    let parameters = this.parameters;
    let newParameters: Array<any> = [];
    for (var k in parameters) {
      let parameter = parameters[k];
      if (parameter.name == "3p") {
        this.ppp = parameter.default;
        for (var name in this.ppp) {
          this.ppp[name] =
            this.ppp[name] == "richtext" ? "textarea" : this.ppp[name];
          this.ppp[name] = this.ppp[name] == "image" ? "file" : this.ppp[name];
        }
      } else {
        newParameters.push(parameter);
      }
    }

    this.parameters = newParameters;
  }

  protected generateWidget(parameter: any, type: string) {
    let wf: WidgetFactory = new WidgetFactory(parameter, this.dartTemp);

    this.rawControllerWidgetTemp[type] = wf.getWidget().getRawTemp(this.dart);
    return wf.generateWidget();
  }

  protected parseFormElementMethods() {
    let invisibleSearchFieldCount = 0;
    let parameters =
      this.bodyParameters.length > 0 ? this.bodyParameters : this.parameters;

    var methods = [];
    var methodsGroup: any = {};
    var lastGroupName = "";

    for (var i = 0; i < parameters.length; i++) {
      if (!["header", "path"].includes(parameters[i].in)) {
        var groupName = parameters[i].groupName;
        var name = parameters[i].name;
        this.assignDataForPutForm(parameters[i]);
        if (groupName) {
          name = groupName + "_" + name;
        }

        if (groupName) {
          if (lastGroupName != groupName) {
            methods.push("group:" + groupName);
            lastGroupName = groupName;
            methodsGroup[groupName] = [];
          }
          methodsGroup[groupName].push(
            "gen" + Utils.strToMethod(name) + "Widget()"
          );
        } else {
          if (this.method == "get") {
            var invisibleFields = this.getInvisibleFormFields();
            var visible = "true";
            if (invisibleFields.includes(name)) {
              visible = "false";
              invisibleSearchFieldCount++;
            }
            methods.push(
              "Visibility( child: SizedBox( width: 240, child: gen" +
                Utils.strToMethod(name) +
                "Widget()), visible: " +
                visible +
                ")"
            );
          } else {
            methods.push("gen" + Utils.strToMethod(name) + "Widget()");
          }
        }
      }
    }

    if (methodsGroup) {
      var temp = `
      TitledContainer(
        titleText: '{title}',
        child: Column(
          children: [{list}]))
      `;
      for (var i = 0; i < methods.length; i++) {
        if (methods[i].substring(0, "group:".length) == "group:") {
          var gName: any = methods[i].split(":")[1];

          methods[i] = temp.replace("{list}", methodsGroup[gName].join(","));
          methods[i] = methods[i].replace(
            "{title}",
            this.groupNameTitles[gName]
          );
        }
      }
    }
    this.dart = this.dart.replace(
      "{invisibleSearchFormField}",
      invisibleSearchFieldCount + ""
    );
    this.dart = this.dart.replace("{formElementMethods}", methods.join(", "));
  }

  protected getInvisibleFormFields(): string[] {
    return [];
  }
  protected prepareDataForSelect(): void {
    this.dart = new prepareSelectData(this.dart, this.ppp, this.method).parse();
  }

  protected assignPutForm() {
    this.dart = this.dart.replace(
      "{assignDataForPutForm}",
      this.assignPutFormData ? this.assignPutFormData.join("\n") : ""
    );
  }

  private assignPutFormData: Array<any> = [];
  protected assignDataForPutForm(parameter: any): void {
    if (this.method == "put") {
      var name = parameter.name;
      var groupName = parameter.groupName;
      this.assignPutFormData.push(
        this.setValue(parameter).replace(
          /{value}/g,
          'json["data"]' +
            (groupName ? '["' + groupName + '"]' : "") +
            '["' +
            name +
            '"]'
        )
      );
    }
  }

  setValue(parameter: any): string {
    var name = parameter.name;
    var groupName = parameter.groupName;
    var dataType = parameter.dataType;
    var widgetType = parameter.type;
    var isInt: Boolean = dataType && ["integer", "number"].includes(dataType);
    if (!dataType) {
      dataType = "string";
    }

    var controllerName = Utils.generateControllerName(
      groupName ? groupName + "_" + name : name
    );

    var val = isInt
      ? controllerName + " = Utils.strToInt({value})"
      : controllerName + " = {value}";
    if (["multi_select", "select"].includes(widgetType)) {
      val =
        controllerName +
        " = " +
        (widgetType == "multi_select"
          ? "{value}"
          : "{value} != null ? [{value}] : {value}");
    } else if (widgetType == "richtext") {
      val = controllerName + ".setText({value})";
    } else if (widgetType == "input" || widgetType == "textarea") {
      val =
        controllerName +
        ".text = " +
        (isInt
          ? "Utils.formatNumberText({value})"
          : "Utils.strNullToEmpty({value}.toString())");
    } else if (widgetType == "check") {
      val = controllerName + " = {value}";
    } else if (widgetType == "file") {
      val = "assign" + controllerName + "ForPutForm({value})";
    }
    return val + ";";
  }

  getSaveLabelText(): string {
    return "Save";
  }
}
