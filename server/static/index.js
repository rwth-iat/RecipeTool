//------------------------------- GENERAL FUNCTIONS ---------------------------------------------------------------------------
function getParents(elem) {
    var parents = [];
    while(elem.parentNode && elem.parentNode.nodeName.toLowerCase() != 'body') {
      elem = elem.parentNode;
      parents.push(elem);
    }
    return parents;
  }


//------------------------------DRAG AND DROP FUNCTIONS-----------------------------------------------------------------------
function dragstart_handler(ev) {
    console.log("dragStart");
    // Remove all of the drag data
    ev.dataTransfer.clearData();
    // Change the source element's background color to signify drag has started
    //ev.currentTarget.style.border = "1px dashed black";
    // Add the id of the drag source element to the drag data payload so
    // it is available when the drop event is fired
    ev.dataTransfer.setData("text/plain", ev.target.id);
    console.log("set id to " + ev.target.id.toString());
    // Tell the browser both copy and move are possible
    ev.effectAllowed = "copyMove";
   }

function dragover_handler(ev) {
    console.log("dragOver");
    // Change the target element's border to signify a drag over event
    // has occurred
    // Restore source's border
    // ev.target.style.border = "dashed";
    // ev.currentTarget.style.background = "lightblue";
    ev.preventDefault();
}
function drop_handler(ev) {
    console.log("Drop");
    ev.preventDefault();
    // Get the id of drag source element (that was added to the drag data
    // payload by the dragstart event handler)
    var id = ev.dataTransfer.getData("text");
    element = document.getElementById(id)

    // If element is taken from the side_bar and dropped into the workspace clone the element
    // that way it still is in the side bar to be used multiple times
    if (element.classList.contains("side_bar_element") && ev.target.id == "workspace") {
        //clone the element
        //generate a new unique id for the copied element
        var nodeCopy = element.cloneNode(true);
        nodeCopy.id = Date.now().toString(36) + Math.random().toString(36).substring(2);;
        
        // this is the actual "drag code"
        nodeCopy.style.left = ev.clientX + "px";
        nodeCopy.style.top = ev.clientY + "px";
        nodeCopy.style.background = "white";

        //change classes to signify that the next time it is dragged it should be moved not copied
        //also style is changed, for example is position set to "absolute"
        nodeCopy.classList.remove("side_bar_element");
        nodeCopy.classList.add("workspace_element");

        //reset border of the element
        nodeCopy.style.border = "1px solid black";
        
        //make it draggable 
        //but works for now
        //(the following stackoverflow comment states that for cross browser interoperability you are better off using a js framework to make things dynamically draggable.)
        //https://stackoverflow.com/questions/16296029/adding-ondragstart-handler-to-dynamically-created-images
        nodeCopy.addEventListener('dragstart', dragstart_handler, false);
        nodeCopy.addEventListener('dragend', dragover_handler, false);
        nodeCopy.draggable=true

        //add new clone to document
        ev.target.appendChild(nodeCopy);

        console.log("dragged from sidebar, dropped in workspace at absolute position: " + ev.clientX.toString() + " " + ev.clientY.toString() );
    }

    // if element is in workspace and gets moved to workspace just move it
    // also check if target is itself so it can be sligthly moved
     else if (element.classList.contains("workspace_element") && (ev.target.id == "workspace" || ev.target.id==id)) {
      // this is the actual "drag code"
      element.style.left = ev.clientX +"px";
      element.style.top = ev.clientY +"px";
      
      console.log("dragged from workspace, dropped in workspace at absolute position: " + ev.clientX.toString() + " " + ev.clientY.toString() );

      //reset border of the element
      element.style.border = "1px solid black";
    }

    //if element is in workspace and gets moved to side_bar it gets removed
    else if (element.classList.contains("workspace_element") && getParents(ev.target).some(parent => parent.id == "side_bar")) {
      console.log("dragged from Workspace, dropped outside Workspace");
      element.remove();
    }
    

    console.log("dropped at " + ev.target.id.toString());
    // reset the border of the workspace
    //ev.target.style.border = "1px solid black";
}

function dragend_handler(ev) {
     console.log("dragEnd");
     // Restore source's border
     //ev.target.style.border = "1px solid black";
}


//-----------------------------------functions to open standard process definitions-----------------------------------------------
/*var read_file = async function(path) {
  promise = fetch(path).then((response) => { return response.json()});
  let result1  = await promise.then(result => result.data);
  return result1;
}*/


// function to read in a json file from a specified path
const read_file = async (path, callback) => {
  let result  = await fetch(path);
  //use string literals
  let result_json = await result.json();
  let data  = await result_json.data;
  console.log(result_json);
  return result_json;
}

  // Synchronously read a text file from the web server with Ajax
//
// The filePath is relative to the web page folder.
// Example:   myStuff = loadFile("Chuuk_data.txt");
//
// You can also pass a full URL, like http://sealevel.info/Chuuk1_data.json, but there
// might be Access-Control-Allow-Origin issues. I found it works okay in Firefox, Edge,
// or Opera, and works in IE 11 if the server is configured properly, but in Chrome it only
// works if the domains exactly match (and note that "xyz.com" & "www.xyz.com" don't match).
// Otherwise Chrome reports an error:
//
//   No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'http://sealevel.info' is therefore not allowed access.
//
// That happens even when "Access-Control-Allow-Origin *" is configured in .htaccess,
// and even though I verified the headers returned (you can use a header-checker site like
// http://www.webconfs.com/http-header-check.php to check it). I think it's a Chrome bug.
function request_file(filePath) {
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  xmlhttp.send();
  if (xmlhttp.status==200) {
    result = xmlhttp.responseText;
  }
  return result;
}

//function to add a process
const add_process = async (process, name, parent, margin_left, callback) =>{
  //add spacer div to create whitespace between elements
  const spacer_div = document.createElement("div");
  spacer_div.className = "element_spacer";
  parent.appendChild(spacer_div);

  //create the process div
  const process_div = document.createElement("div");
  process_div.id = name;
  process_div.innerHTML += name;
  process_div.className = "side_bar_element process_element";
  process_div.style.width = "200px";
  process_div.style.height = "auto";
  process_div.style.marginLeft = (margin_left + 10).toString() + "px";
  
  //make it draggable 
  //but works for now
  //(the following stackoverflow comment states that for cross browser interoperability you are better off using a js framework to make things dynamically draggable.)
  //https://stackoverflow.com/questions/16296029/adding-ondragstart-handler-to-dynamically-created-images
  process_div.addEventListener('dragstart', dragstart_handler, false);
  process_div.addEventListener('dragend', dragover_handler, false);
  process_div.draggable=true 

  //process_div.addEventListener('drop', drop_handler, false);
  parent.appendChild(process_div);

}

//function to add a process_package
const add_process_group = async (process_group, name, parent, margin_left, callback) =>{
  console.log(process_package)
  
  //create a container div 
  const container_div = document.createElement("div");
  container_div.id = name;
  container_div.innerHTML += name;
  container_div.className = "side_bar_element process_element";
  container_div.style.width = "200px";
  container_div.style.height = "auto";
  //increase the margin with every hirachy level for improved visability
  container_div.style.marginLeft = (margin_left + 10).toString() + "px";
  parent.appendChild(container_div);

  //recursivly add process groups and processes to allow for multiple levels of grouping
  Object.keys(process_group.children).forEach(key => {
    if (process_group.children[key].type=="process"){
      add_process(process_group.children[key], key, container_div, margin_left);
    }else if(process_group.children[key].type=="process_group"){
      add_process_group(process_group.children[key], key, container_div, margin_left)
    }
  })
}

//function to add a process_package
const add_process_package = async (process_package, name, callback) =>{
  margin_left = 10;
  processes_div = document.getElementById("processes");
  console.log(process_package);
  
  //create a container div 
  const container_div = document.createElement("div");
  container_div.id = name;
  container_div.innerHTML += name;
  container_div.className = "side_bar_element process_element";
  container_div.style.width = "200px";
  container_div.style.height = "auto";
  container_div.style.backgroundColor = "darkgray"
  container_div.style.marginLeft = margin_left.toString() + "px";
  processes_div.appendChild(container_div);

  //recursivly add process groups and processes to not require process groups
  Object.keys(process_package.children).forEach(key => {
    if (process_package.children[key].type=="process"){
      add_process(process_package.children[key], key, processes_div, margin_left);
    }else if(process_package.children[key].type=="process_group"){
      add_process_group(process_package.children[key], key, processes_div, margin_left)
    }
  })

  //add spacer element to create whitespace to next process group
  const spacer_div = document.createElement("div");
  spacer_div.className = "element_spacer";
  processes_div.appendChild(spacer_div);
}

const add_file_package = async (path, callback) =>{
  let process_package = await request_file(path); //changed read_file to request_file to work in server configuration
  process_package = JSON.parse(process_package);
  Object.keys(process_package).forEach(key => {
    console.log(key);
    if(process_package[key].type=="process_package"){
      add_process_package(process_package[key], key);
    }
  });
}



let process_package = add_file_package("../static/input.json")