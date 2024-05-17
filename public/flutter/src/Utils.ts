export class Utils {
  static strToMethod(str: string, sperator: string = ""): string {
    var ss = str.match(/[a-zA-Z]+/g);
    for (var i = 0; i < ss.length; i++) {
      ss[i] = this.ucfirst(ss[i]);
    }
    return ss.join(sperator);
  }

  static ucfirst(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  static replaceKeyValueRegex(kv : any, s : string) : string  {
    for (var k in kv) {
        var find = new RegExp(k, "g");
        s = s.replace(find, kv[k]);
    }
    return s;
  }

  static generateControllerName(name : string, groupName ?: string) : string {
    
    if(name.indexOf('.')) {
      
      name = name.replace('.','_');
    }
    name = groupName ? groupName+'_'+name : name;
    return name+'Controller';
  }

  static getRawWidgetTemp(tagName : string, dartTemp : string) {
    var dynamicPart = "{"+tagName+"}([\\s\\S]*?){/"+tagName+"}"; 
      var regex = new RegExp(dynamicPart, 'g'); 
      
      var match = regex.exec(dartTemp);  
      if(match) {
        return { outter: match[0], inner: match[1] };
      }
      return null;
  }
 
}
