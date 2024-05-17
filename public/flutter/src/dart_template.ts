export function getImport() {
  return (
    "" +
    `import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:backend_flutter/views/layout/layout.dart';
import 'package:http/http.dart' as http;
import 'package:backend_flutter/utils/Template.dart';
import 'package:backend_flutter/views/widgets/EButton.dart';
import 'package:backend_flutter/utils/Utils.dart';
import 'package:backend_flutter/consts/consts.dart';
import 'package:backend_flutter/views/widgets/ButtonSelectDialog.dart';
import 'package:backend_flutter/views/widgets/Check.dart';
import 'package:backend_flutter/views/widgets/TitleContainer.dart';
import 'package:backend_flutter/views/widgets/Time.dart';
import 'package:backend_flutter/views/widgets/Date.dart';
import 'package:backend_flutter/views/widgets/ImageUploadFile.dart';
import '../views/widgets/TableGrid.dart';
import '../views/widgets/MultipleUpload.dart';
`
  );
}

export function dartTemp(): string {
  return (
    "" +
    `
class {className} extends StatefulWidget {
    static const String routeName = '{routeName}';
    const {className}({Key? key}) : super(key: key);
    @override
    State<{className}> createState() => {className}State();
}

class {className}State extends State<{className}> {
    final _formKey = GlobalKey<FormState>();
    String getMethod() {
        return '{method}';
    }
    {buildPostForm} 
    @override
    Widget build(BuildContext context) {
        return Layout(
            title: '{pageTitle}',
            page: SingleChildScrollView(
                child: Row(children: [
                colLeftRight(),
                Expanded(flex: 3, child:  genForm() ),
                colLeftRight(),
            ])));
    }
    Widget colLeftRight() {
        return Expanded(
            flex: Utils.isSmallScreen(context) ? 0 : 1,
            child: const SizedBox(),
        );
    }
    
    {/buildPostForm}

    {buildPutForm} 
    
    @override
    Widget build(BuildContext context) { 
        if(getMethod() == 'put') { 
            return FutureBuilder<dynamic>(
                future: assignDataForPutForm(),
                builder: (context, snapshot) {
                if (snapshot.hasError) {
                    print(snapshot.error);
                    return Text('There was an error :(');
                } else if (snapshot.hasData) {
                    return genForm();
                } else {
                    return Column(children: [SizedBox(child: CircularProgressIndicator(), width: 50, height: 50)]);
                }
            });
        } 
        return Layout(
            title: '{pageTitle}',
            page:   SingleChildScrollView(
                    child: Row(children: [
                    colLeftRight(),
                    Expanded(flex: 5, child: genForm()),
                    colLeftRight(),
                ]))
            ); 
    }

    Widget colLeftRight() {
        return Expanded(
            flex: Utils.isSmallScreen(context) ? 0 : 1,
            child: const SizedBox(),
        );
    }
    void save () async {
        Template.showLoading(context);
        var formDatas = prepareDataForUpdate();
        var headers = prepareHeaderForUpdate();
        {buildRequest} 
    }
    Widget genForm() {
        List<Widget> elements = [];
        elements.addAll(formElements());
        elements.add(formButton());

        return Form(
            key: _formKey,
            child: Padding(
                padding: const EdgeInsets.all(16),
                child:  Column(
                    crossAxisAlignment: CrossAxisAlignment.start, 
                    children: elements
                )
                 
            )
        );
    }
    
    Widget formButton() {
        return Center(
            child: EButton(
                text: "{saveLabelText}",
                onPress: () {
                    if (_formKey.currentState!.validate()) {
                        save(); 
                    }
                }
            )
        );
    }

    {/buildPutForm}
    
    {buildListTable}
    @override
    Widget build(BuildContext context) {
        return Layout(
            title: '{pageTitle}',
            hasSearch: formElements().isNotEmpty && invisibleSearchFormField != formElements().length,
            searchForm:  genForm(),
            exportWidget: exportWidget(),
            hasCreateButton: true,
            createRouteName: getCreatePageRouteName(),
            page:  getTableGrid()
        );
    }  
    exportWidget() {
        return null;
    }

    
    Widget getTableGrid() {
        return loadedSelectData
        ? TableGrid(
            listCol: getListCol(),
            listUrl: '$apiBasePath{path}',
            deleteUrl: '$apiBasePath{path}',
            onDelete: (id) {
                Utils.showSnackText(context, 'Deleted id $id');
            },
            onEdit: (id) {
                onEditRow(id);
            },
            queryParameters: prepareDataForUpdate(),
            refesh: () => refresh()
            
        )
        : SizedBox();
    }
    

    Map<String, ColSpecs> getListCol() {
        return {genColList};
    }
    void onEditRow(dynamic id) {}
   
    refresh() {
         
        setState(() {});
    } 
    String ? getCreatePageRouteName() {
        return null;
    }

    void save () async {
        refresh();
    }

    Widget genForm() {
        List<Widget> elements = [];
        elements.addAll(formElements()); 
        return Form(key: _formKey, child: Row(children: elements));
    }
    
    Widget formButton() {
        return SizedBox(
            width: 120,
            child: EButton(
                icon: const Icon(Icons.search),
                text: "Search",
                onPress: () {
                    if (_formKey.currentState!.validate()) {
                    save();
                    }
                }));
    }
    {/buildListTable}

   
    {prepareDataForSelect} 
    bool loadedSelectData = false;
    @override
    void initState() {
        super.initState();  
        Future process = prepareDataForSelect();
         
        Utils.callbackAffterBuilded(() {
            process.then(
                (value) {
                    loadedSelectData = true; 
                    setState(() {}); 
                },
            );
           
        });
    }

    Map<String, dynamic>? jsonFormData;
    Future assignDataForPutForm() async {
       
        if (jsonFormData != null) {
            return jsonFormData;
          }
        String token = await Utils.getToken();
        String res = await Utils.httpGet(
        url: getSaveUrl(),
            headers: {"token": token},
        );
        Map<String, dynamic> json = jsonDecode(res);
        {assignDataForPutForm}
        jsonFormData = json;
        return json;
    }

    late Map<String, dynamic> bodyConfig;
    late Map<String, dynamic> bodyTable;

    Future prepareDataForSelect () async {
        try {
            String token = await Utils.getToken();
 
            List configFields = [{configFields}];//["phone", "email"];
            List tableFields = [{tableFields}];
            if (configFields.length > 0) {
                String resConfigData = await Utils.httpGet(
                    url: apiSystemConfigPath,
                    headers: {"token": token},
                    params: {"fields": configFields.join(",")});
                bodyConfig = jsonDecode(resConfigData);
            }
            if(tableFields.length > 0) {
                String resTableData = await Utils.httpGet(
                url: apiTableDataPath,
                headers: {"token": token},
                params: {"fields": tableFields.join(",")});
                bodyTable = jsonDecode(resTableData);
            }
            {assign}
        } catch (e) {}
    }
    
    List<ButtonSelectDialogItem> jsonArrayToList(jas) {
        List<ButtonSelectDialogItem> list = [];

        if (jas != null) {
            for (int i = 0; i < jas.length; i++) {
                if (jas[i]['disabled'] != true)
                    list.add(ButtonSelectDialogItem(
                        id:  jas[i]['id'] != null ? jas[i]['id'] : jas[i]['code'] , 
                        name: jas[i]['name'] != null ? jas[i]['name'] : (jas[i]['fullname'] ?? jas[i]['username'] ?? ''),
                        data: jas[i],
                    ));
            }
        }
        return list;
    }
    {/prepareDataForSelect}
  
    prepareDataForUpdate()  {
        {prepareDataForUpdate} 
    }

    prepareHeaderForUpdate() {
        {prepareHeaderForUpdate} 
    }
    
    saveCallback(body, statusCode) {}

    String getSaveUrl() {
        return '$apiBasePath{routeName}';
    }

    int invisibleSearchFormField = {invisibleSearchFormField};
    List<Widget> formElements() {
        return [{formElementMethods}];
    }

    
    {formInput}
    final TextEditingController {formElControllerName} = TextEditingController();
    String {formElControllerName}Value = '';
    
    Widget {formElWidgetName}() {
        return Template.genTextFormFieldWidget(
            controller: {formElControllerName},
            label: '{formElCaption}',
            onChange:  () => onWidgetChange(widgetMethod: '{formElWidgetName}', widgetController: {formElControllerName}),
            onClear:  () => onWidgetChange(delay: false),
            {formElNumberOnly}
            keyboardType: TextInputType.number,
            {/formElNumberOnly}
            {formElValidator}
            validator: (value) {
                if (value == null || value.isEmpty) {
                    return '{formElCaption} không được bỏ trống';
                }
                return null;
            }
            {/formElValidator}
        );
    }

    {/formInput}
    
    Timer? debounce;
    onWidgetChange({delay = true, String widgetMethod = '', widgetController}) {
        if (getMethod() == 'get') {
          if (!delay) {
            save();
          } else {
            if (debounce?.isActive ?? false) debounce!.cancel();
            debounce = Timer(const Duration(milliseconds: 500), () {
              save();
            });
          }
        } else {
          setState(() {});
        }
    }    


    {formTextarea}
    final TextEditingController {formElControllerName} = TextEditingController();
    Widget {formElWidgetName}() {
        return Template.genTextFormFieldWidget(
            controller: {formElControllerName},
            maxLines: 3,
            label: '{formElCaption}',
            onChange:  () => onWidgetChange(widgetMethod: '{formElWidgetName}', widgetController: {formElControllerName}),
            onClear:  () => onWidgetChange(delay: false),
            {formElNumberOnly}
            keyboardType: TextInputType.number,
            {/formElNumberOnly}
            {formElValidator}
            validator: (value) {
                if (value == null || value.isEmpty) {
                    return '{formElCaption} không được bỏ trống';
                }
                return null;
            }
            {/formElValidator}
        );
    }
    {/formTextarea}

    {formCheck}
    bool ? {formElControllerName};
    Widget {formElWidgetName}() {
        return Padding(
            padding: getWidgetPadding(),
            child: CheckWidget(
                text: '{formElCaption}',
                checked: {formElControllerName},
                onChange: (val) {
                    {formElControllerName}Change(val);
                },
            )
        );
    }

    {formElControllerName}Change(bool ? val) {
        {formElControllerName} = val;
    }

    {/formCheck}

    {formDate}
    String ?   {formElControllerName};
    Widget {formElWidgetName}() {
        return Padding(
            padding: getWidgetPadding(),
            child: DateWidget(
                hintText: '{hintText}',
                withTime: false,
                initValue: {formElControllerName},
                onChange: (value) {
                    {formElControllerName}Change(value); 
                    if (getMethod() == 'get') {
                        save();
                    } 
                },
              )
        );
    }

    {formElControllerName}Change(String ? value) {
        {formElControllerName} = value;
        print(value);
    }
    {/formDate}

    {formDatetime}
    String ?   {formElControllerName};
    Widget {formElWidgetName}() {
        return Padding(
            padding: getWidgetPadding(),
            child: DateWidget(
                hintText: '{hintText}',
                withTime: true,
                initValue: {formElControllerName},
                onChange: (value) {
                    {formElControllerName}Change(value);
                    if (getMethod() == 'get') {
                        save();
                    } 
                },
              )
        );
    }
    {formElControllerName}Change(String ? value) {
        {formElControllerName} = value;
        print(value);
    }
    {/formDatetime}

    {formTime}
    String ?   {formElControllerName};
    Widget {formElWidgetName}() {
        return Padding(
            padding: getWidgetPadding(),
            child: TimeWidget(
                hintText: '{hintText}', 
                initValue: {formElControllerName},
                onChange: (value) {
                    {formElControllerName}Change(value);
                    if (getMethod() == 'get') {
                        save();
                    } 
                },
              )
        );
    }
    {formElControllerName}Change(String ? value) {
        {formElControllerName} = value;
        print(value);
    }
    {/formTime}

    {formRichtext}
    final HtmlEditorController {formElControllerName} = HtmlEditorController();
    Widget {formElWidgetName}() {
        return Padding(
            padding: getWidgetPadding(),
            child: Container(
            decoration: BoxDecoration(
                border: Border.all(
                width: 1,
                color: borderColor,
                ),
                borderRadius: BorderRadius.circular(5),
            ),
            child: HtmlEditor(
                controller: {formElControllerName},
                htmlEditorOptions: const HtmlEditorOptions(
                    hint: 'Nhập {formElCaption} ...',
                    shouldEnsureVisible: true,
                    initialText: "{initialText}",
                ),
                otherOptions:
                    OtherOptions(height: 250),
            ),
            ));
    }
    {/formRichtext}

    
    {formElFile}
    String ? {fileName};
    String ? {fileName}Src;
    Key {fileName}Key = Key('{fileName}');
    Widget {formElWidgetName}() {
        return Padding(
            padding: getWidgetPadding(),
            child: ImageUploadFile(
                key: {fileName}Key,
                label: '{fileDesc}',
                initialValue: {fileName}Src,
                onChange: (src) => {fileName}Src = src.toString().replaceAll('undefined', '')
            ),
        );
    }
    
    assign{fileName}ForPutForm(dynamic val) {
        if(val != null) {
            {fileName}Src = val;
            {fileName} = val.toString().split("/").last;
        }
        else {
            {fileName}Src = null;
            {fileName} = null;
        }
    }
    {/formElFile} 

    {formElMultiFile}
    List<dynamic> ? {formElControllerName};
    Widget {formElWidgetName}() {
        return MultipleUpload(
            initialValue: {formElControllerName} != null
            ? ({formElControllerName} as List)
                .map((item) => item as String)
                .toList()
            : null,
            label: '{formElCaption}',
            required: {formElRequired},
            onChange: (srcs) {
                {formElControllerName} = srcs;
            },
        );
    } 
    {/formElMultiFile} 
 
    {formElSelect}
    List<dynamic> ? {formElControllerName};
    List<ButtonSelectDialogItem>  ? list{formElControllerName};
    Widget {formElWidgetName}() {
            
        return Padding(
            padding: getWidgetPadding(),
            child: ButtonSelectDialog(
            multiple: false,
            hintText: '{formElCaption}',
            dialogTitle: '{formElCaption}',
            selectedIds: {selectedIds},
            data: list{formElControllerName} != null ? list{formElControllerName}! : [],
            onChange: (List<dynamic>? selectedIds) {
                {formElControllerName}Change(selectedIds);
                if (getMethod() == 'get') {
                    save();
                } 
            },
        )); 
    }
    {formElControllerName}Change(List<dynamic>? selectedIds) {
        this.{formElControllerName} = selectedIds;
        print(selectedIds.toString());
    }
    {/formElSelect}

    {formElMultiSelect}
    List<dynamic> ? {formElControllerName};
    List<ButtonSelectDialogItem>  ? list{formElControllerName};
    Widget {formElWidgetName}() {
            
        return Padding(
            padding: getWidgetPadding(),
            child: ButtonSelectDialog(
            multiple: true,
            hintText: '{formElCaption}',
            dialogTitle: 'Danh sách {formElCaption}',
            selectedIds: {selectedIds},
            data: list{formElControllerName} != null ? list{formElControllerName}! : [],
            onChange: (List<dynamic>? selectedIds) {
                {formElControllerName}Change(selectedIds);
                if (getMethod() == 'get') {
                    save();
                } 
            },
        )); 
    }
    
    {formElControllerName}Change(List<dynamic>? selectedIds) {
        this.{formElControllerName} = selectedIds;
        print(selectedIds.toString());
    }

    {/formElMultiSelect} 

    getWidgetPadding() {
        return const EdgeInsets.all(10);
    }
}`
  );
}

export function clazzTemp() {
  return (
    "" +
    `import 'package:backend_flutter/backend_generator/{fileName}';
        import 'package:flutter/material.dart';

        class {className} extends Base{className} {
        static const String routeName = '{path}';
        @override
        State<Base{className}> createState() => {className}State();
        }

        class {className}State extends Base{className}State {}`
  );
}
