import { Utils } from "./Utils";
import { GenFormClazz } from "./GenFormClazz";

export class GenListClazz extends GenFormClazz {

  protected replaceBuild() {
    var temp = Utils.getRawWidgetTemp('buildPostForm', this.dart);
    this.dart = this.dart.replace(temp.outter, '');
    var temp = Utils.getRawWidgetTemp('buildPutForm', this.dart);
    this.dart = this.dart.replace(temp.outter, '');

    temp = Utils.getRawWidgetTemp('buildListTable', this.dart);

    this.dart = this.dart.replace(temp.outter, temp.inner);
  }

  protected generateMain() {
     
    super.generateMain();
    this.assignColumnNames(); 
     
    let config: any = {
       "{genColList}": this.columns.length > 0 ? '{'+this.columns.join(",")+'}' : "{}", //"['Id', 'Name', 'Code', 'Position']",
       
      "{path}": this.path,
    };

    this.dart = Utils.replaceKeyValueRegex(config, this.dart);
  }
  
  private columns: any = [];
  assignColumnNames() {
    try { 
      const props =this.getResponseProps()

      Object.keys(props).forEach((colName, specs) => {
        //@ts-ignore
        var desc = props[colName]['description'];
        // console.log(items.properties[colName]);
        var onSearch = '';
        const method = Utils.strToMethod(colName)
        const controller = Utils.generateControllerName(colName)
        if(this.getColumnsHasSearch().includes(colName)) {            
          onSearch = `,searchWidget: gen`+method+`Widget(),
          searchController: `+controller;
        }
        var colType = '';
        const colTypes = this.getInQueryColSpecs()
        
        if(colTypes[colName]) {
          colType = ', colType: "'+colTypes[colName]+'"'
        }
        this.columns.push(
          "'"+colName+"': "+
              "ColSpecs(name: '"+(desc ? desc : colName)+"'"+
                (colName == 'id' ? ',width: 100, alignment: Alignment.center': '')+
                colType+
                onSearch+
          ")");
         
      }) ; 
       
    } catch (error) { 
      console.error(error);
    }
  } 


  inQueryColSpecs: Record<string, string> = null;
  getInQueryColSpecs() {
    if(!this.inQueryColSpecs){ 
      this.inQueryColSpecs = {}
      if (this.parameters) {
        for(var i = 0; i < this.parameters.length; i++) {
          if(this.parameters[i].name == '3p') { 
            this.inQueryColSpecs = this.parameters[i].default
          }
        }
      }
    }
    return this.inQueryColSpecs;
  }

  colsHasSearch: any = []
  getColumnsHasSearch() : string [] {

    if(this.colsHasSearch.length == 0) { 

      if(this.parameters) {
        for(var i = 0; i < this.parameters.length; i++) {
          if(this.parameters[i].in == 'query') {
            this.colsHasSearch.push(this.parameters[i]);
          }
        }   
      }
    }
    
    if(this.colsHasSearch.length > 0) {
      return this.colsHasSearch.map((item: { name: any; } ) => item.name); 
    }
    return [];
  }
  
  protected getInvisibleFormFields(): string[] {
    
      return Object.keys(this.getResponseProps()) 
  }

  protected getResponseProps() {
    if (!this.data.responses[200].schema) return {};
    var items = this.data.responses[200].schema.items;
        
      let props = {};
      if (items ) { 
       if(items.properties) {
          props = items.properties;
          
        }
        else if(items.$ref) {
          const ref = items.$ref.replace('#/definitions/', '');
          props = this.definitions[ref].properties;
        }
      }  
      return props;
  }
  getSaveLabelText(): string { 
    return 'Search'
  }
}
