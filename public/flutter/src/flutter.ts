import {clazzTemp, dartTemp, getImport} from "./dart_template";  
import { GenFormClazz } from "./GenFormClazz";
import { GenListClazz } from "./GenListClazz";

export class Flutter { 
    private swaggerJson : any;
    private swaggerJsonUrl ? : string; 
    private dartTemp ? : string;
    private flutterWidgets : Array<string> = [];
    private baseFilename = 'package:backend_flutter/backend_generator/base_backend.dart';
    public async init(swaggerJsonUrl : string)  { 
        this.swaggerJsonUrl = swaggerJsonUrl;
        const data = await fetch(swaggerJsonUrl);
        const json = await data.json();
        this.swaggerJson = json; 
        this.dartTemp = dartTemp(); 
    }

    execute() : void {
        var json = this.swaggerJson;
        var paths = json.paths;
        
        this.flutterWidgets.push('<p>' + this.baseFilename + '</p>');
        this.flutterWidgets.push('<textarea>');
        this.flutterWidgets.push(getImport());
        for(var path in paths) {
            var methodParams = paths[path];
            for(var method in methodParams ) {
                this.addBaseClass(path, method, methodParams);   
            } 
        }
        
        this.flutterWidgets.push('</textarea>');
    }
    
    private addBaseClass(path: string, method: string, methodParams: any) { 
        var data = methodParams[method];
        this.generateDartCode(path, method, data); 
    }

    generateDartCode(path : string, method : string, data : any) : void {
         if(method.toLowerCase() != 'delete') {
            if(method == 'get') {
                let clazz = new GenListClazz(
                    this.dartTemp, 
                    path, 
                    method, 
                    data, 
                    this.swaggerJson.definitions
                );
                this.flutterWidgets.push(clazz.generate());
            }
            else {
                if(method == 'put') {                
                    let clazz = new GenFormClazz(
                        this.dartTemp, 
                        path, 
                        method, 
                        data, 
                        this.swaggerJson.definitions
                    );
                    this.flutterWidgets.push(clazz.generate());
                }
            }
            
         } 
    } 

    getFlutterWidgets () : Array<string> {
        return this.flutterWidgets;
    } 
}
 