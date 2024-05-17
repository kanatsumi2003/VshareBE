import {Flutter} from "./flutter";
 
const flutter = new Flutter();

flutter.init('http://localhost:8800/api-docs').then((data) => {
    flutter.execute(); 
    document.getElementById('flutter_widget').innerHTML = flutter.getFlutterWidgets().join("\n"); 
}); 