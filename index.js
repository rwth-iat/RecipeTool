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
