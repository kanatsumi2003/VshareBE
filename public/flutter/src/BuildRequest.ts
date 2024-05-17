import { Utils } from "./Utils";

export class BuildRequest {
  private dart: string;
  private parameters: any;
  private method: string;
  private consumes: Array<string>;
  private path: string;
  private consume: string;
  private inBodyParameters: any;

  constructor(
    dart: string,
    parameters: any,
    inBodyParameters: any,
    method: string,
    consumes: Array<string>,
    path: string
  ) {
    this.dart = dart;
    this.parameters = parameters;
    this.inBodyParameters = inBodyParameters;
    this.method = method;
    this.consumes = consumes;
    this.path = path;
    this.consume = this.consumes && this.consumes.length && this.consumes[0];
    this.consume = this.consume ?? "application/json";
  }

  parse() {
    this.prepareParameterType();
    if (this.consume.indexOf("multipart") != -1) {
      this.postFile();
    } else {
      this.postNormal();
    }
    return this.dart;
  }

  prepareParameterType() {
    for (var i = 0; i < this.parameters.length; i++) {
      if (this.parameters[i]["type"]) {
        this.parameters[i]["type"] = this.parameters[i]["type"].split(":")[0];
      }
    }
  }

  postFile() {
    let parameters: any = this.parameters;

    var headerTemp = [];
    var formDataTemp = [];
    var formFileTemp = [];
    let ins: any = {};
    for (var i = 0; i < parameters.length; i++) {
      var k = parameters[i].in;
      if (!ins[k]) {
        ins[k] = [];
      }
      ins[k].push(parameters[i]);
    }

    headerTemp = this.addHeaders(ins, true);
    var params = ins["formData"];
    if (this.inBodyParameters) {
      params = this.inBodyParameters;
    }

    if (params) {
      for (var i = 0; i < params.length; i++) {
        var pr = params[i];
        var name = pr["name"];

        if (params[i]["type"] == "file") {
          var fileBytes =
            "file" +
            Utils.strToMethod(Utils.generateControllerName(name)) +
            "Bytes";
          var fileName =
            "file" +
            Utils.strToMethod(Utils.generateControllerName(name)) +
            "Name";
          formFileTemp.push(
            `
                        if(` +
              fileBytes +
              ` != null) {
                            MediaType mimeType = Utils.getMime( ` +
              fileName +
              `!);
                            request.files.add(new http.MultipartFile.fromBytes('` +
              name +
              `', ` +
              fileBytes +
              ` as List<int>, filename:  ` +
              fileName +
              ` , contentType:mimeType ));
                        }
                        `
          );
        } else {
          formDataTemp.push(
            "request.fields['" +
              name +
              "'] = " +
              this.getValue(name, "", params[i]["dataType"]) +
              ";"
          );
        }
      }
    }

    this.dart = this.dart.replace(
      "{buildRequest}",
      this.makeHttpRequestFile(formFileTemp)
    );
    this.dart = this.dart.replace(
      "{prepareDataForUpdate}",
      this.prepareDataForUpdate(formDataTemp)
    );
    this.dart = this.dart.replace(
      "{prepareHeaderForUpdate}",
      this.prepareHeaderForUpdate(headerTemp)
    );

    //    this.dart = this.dart.replace('{buildRequest}', this.makeHttpRequestFile(headerTemp, formDataTemp));
    //    this.dart = this.dart.replace('{prepareDataForSave}', this.parepareDataForUpdate(formDataTemp));

    //    return this.makeHttpRequestFile(formFileTemp, headerTemp, formDataTemp);
  }

  private makeHttpRequestFile(formFileTemp: any[]) {
    return (
      `
        Uri  uri = Uri.parse(getSaveUrl()); 
        var request = new http.MultipartRequest("` +
      this.method +
      `", uri);
        ` +
      (formFileTemp.length ? formFileTemp.join("\n") : "") +
      `
        
            request.send().then((response) async {
                
                if (response.statusCode == 200) {
                
                    String body = await response.stream.bytesToString();
                    saveCallback(jsonDecode(body), response.statusCode);
                    Navigator.pop(context);
                    Utils.showSnackText(context, body);
                } else {
                    Navigator.pop(context);
                    Utils.showSnackText(context, response.statusCode.toString());
                }
            }).catchError((onError) {
                Navigator.pop(context);
                
                Utils.showSnackText(context, onError.message);
            });
        `
    );
  }

  postNormal() {
    let parameters: any = this.parameters;
    var headerTemp = [];
    var formDataTemp = [];
    var ins: any = {};
    for (var i = 0; i < parameters.length; i++) {
      var k = parameters[i].in;
      if (!ins[k]) {
        ins[k] = [];
      }
      ins[k].push(parameters[i]);
    }
    headerTemp = this.addHeaders(ins, false);

    var params = this.method == "get" ? ins["query"] : ins["formData"];

    if (this.inBodyParameters.length > 0) {
      params = this.inBodyParameters;
    }

    if (params) {
      var groupNameValues: any = {};
      formDataTemp.push("var formDatas = <String, dynamic>{};");
      for (var i = 0; i < params.length; i++) {
        var name = params[i]["name"];
        var groupName = params[i]["groupName"];
        if (groupName) {
          if (!groupNameValues[groupName]) {
            groupNameValues[groupName] = [];
          }
          groupNameValues[groupName].push(
            '"' +
              name +
              '": ' +
              this.getValue(name, groupName, params[i]["dataType"])
          );
        } else {
          formDataTemp.push(
            "formDatas['" +
              params[i]["name"] +
              "'] = " +
              this.getValue(name, "", params[i]["dataType"]) +
              ";"
          );
        }
      }
      for (var grName in groupNameValues) {
        formDataTemp.push(
          "formDatas['" +
            grName +
            "'] = {" +
            groupNameValues[grName].join(",") +
            "};"
        );
      }
    }

    this.dart = this.dart.replace(
      "{buildRequest}",
      this.makeHttpRequest(headerTemp, formDataTemp)
    );
    this.dart = this.dart.replace(
      "{prepareDataForUpdate}",
      this.prepareDataForUpdate(formDataTemp)
    );
    this.dart = this.dart.replace(
      "{prepareHeaderForUpdate}",
      this.prepareHeaderForUpdate(headerTemp)
    );
  }

  private makeHttpRequest(headerTemp: string[], formDataTemp: string[]) {
    var body = "formDatas";
    if (this.inBodyParameters) {
      body = "json.encode(formDatas)";
    }

    var httpStr =
      `
           response = await http.{method}(
                uri,
                ` +
      (headerTemp.length ? "headers: headers," : "") +
      `
                ` +
      (formDataTemp.length && !["get", "delete"].includes(this.method)
        ? "body: " + body + ","
        : "") +
      `
            );`;

    var tt =
      this.method == "get"
        ? httpStr
            .replace("{method}", "get")
            .replace(" body: json.encode(formDatas),", "")
        : `if (getMethod() == 'put') {
                ` +
          httpStr.replace("{method}", "put") +
          `
            }
            else {
                ` +
          httpStr.replace("{method}", "post") +
          `
            }`;

    var temp =
      `        
        Uri  uri = Uri.parse(getSaveUrl())` +
      (this.method == "get" ? ".replace(queryParameters: formDatas)" : "") +
      `; 
        http.Response ? response;
       ` +
      tt +
      `
        if(getMethod() == 'put' ) {
          if(response.statusCode == 200)
            Navigator.of(context).pop();
        }
        else {
          Navigator.of(context).pop();
        }
        saveCallback(jsonDecode(response.body), response.statusCode);
        
        Utils.showSnackText(context, response.body);  
        `;
    return temp;
  }

  private prepareDataForUpdate(formDataTemp: string[]) {
    var temp = "var formDatas = <String, dynamic>{};";
    if (formDataTemp.length) {
      temp = formDataTemp.join("\n");
    }

    temp += "\n";
    temp += "return formDatas;";
    return temp;
  }

  private prepareHeaderForUpdate(headerTemp: string[]) {
    var temp = "var headers = <String, dynamic>{};";
    if (headerTemp.length) {
      temp = headerTemp.join("\n");
    }
    temp += "\n";
    temp += "return headers;";
    return temp;
  }

  addHeaders(ins: any, postFile: boolean) {
    var headerTemp = [];
    headerTemp.push("var headers = <String, String>{};");
    headerTemp.push(
      "headers['Content-Type'] = '" + this.consume + ";charset=utf-8';"
    );
    if (ins["header"]) {
      var headers = ins["header"];

      headerTemp.push("const storage = FlutterSecureStorage();");

      for (var i = 0; i < headers.length; i++) {
        headerTemp.push(
          "String? " +
            headers[i]["name"] +
            "Str = await storage.read(key: '" +
            headers[i]["name"] +
            "');"
        );
        headerTemp.push(
          (postFile ? "request." : "") +
            "headers['" +
            headers[i]["name"] +
            "'] = " +
            headers[i]["name"] +
            "Str ?? '';"
        );
      }
    }
    return headerTemp;
  }

  getValue(name: string, groupName?: string, dataType?: string): string {
    var isInt: Boolean = dataType && ["integer", "number"].includes(dataType);
    if (!dataType) {
      dataType = "string";
    }
    let types: any = this.getParamTypes();
    var key = name;
    if (groupName) {
      key += "_" + groupName;
    }
    var type = types[key];
    var controllerName = Utils.generateControllerName(
      groupName ? groupName + "_" + name : name
    );

    var sval = isInt
      ? "Utils.strToInt(" + controllerName + ") : 0"
      : controllerName + ' : ""';
    var val = controllerName + " != null ? " + sval;
    if (type == "multi_file") {
      val = controllerName;
    } else if (type == "multi_select") {
      val = controllerName + " != null ? " + controllerName + " : []";
    } else if (type == "select") {
      var strDef = controllerName + "![0].toString()";
      sval = isInt ? "Utils.strToInt(" + strDef + ") : 0" : strDef + ' : ""';
      val = controllerName + " != null ? " + sval;
    } else if (type == "richtext") {
      val = "await " + controllerName + ".getText()";
    } else if (type == "input") {
      val = isInt
        ? "Utils.strToInt(" + controllerName + ".text" + ")"
        : controllerName + ".text";
    } else if (type == "textarea") {
      val = controllerName + ".text";
    } else if (type == "check") {
      val =
        controllerName +
        " != null ? (" +
        controllerName +
        "! ? true : false) : false";
    } else if (type == "file") {
      val = controllerName + "Src != null ? " + controllerName + 'Src : ""';
    }
    return val;
  }

  getParamTypes(): any {
    var ins: any = {};
    var params =
      this.inBodyParameters.length > 0
        ? this.inBodyParameters
        : this.parameters;

    for (var i = 0; i < params.length; i++) {
      var key = params[i].name;
      if (params[i].groupName) {
        key += "_" + params[i].groupName;
      }
      ins[key] = params[i].type;
    }

    return ins;
  }
}
