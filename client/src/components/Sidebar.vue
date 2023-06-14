<script setup>
	import { ref } from 'vue'
	import logoURL from '../assets/logo.png'
	const is_expanded = ref(localStorage.getItem("is_expanded") === "true")

	const ToggleMenu = () => {
		is_expanded.value = !is_expanded.value
		localStorage.setItem("is_expanded", is_expanded.value)
	}
</script>

<template>
	<aside :class="`${is_expanded ? 'is-expanded' : ''}`">
		<div class="logo">
			<img :src="logoURL" alt="Vue" /> 
		</div>

		<div class="menu-toggle-wrap">
			<button class="menu-toggle" @click="ToggleMenu">
				<span class="material-icons">>></span>
			</button>
		</div>

		<h3>Menu</h3>
			<div class="flex">
				<div id="side_bar" v-show="is_expanded" @drop.prevent="drop_handler" @dragover.prevent="dragover_handler($event)">
				<div id="material_window">
					<div id="material_heading" class="heading"><h4>Materialien</h4></div>
					<div class="element_spacer"></div>
					<div id="materials">
						<div id="start_material" class="material_element side_bar_element" draggable="true" @dragstart.prevent="dragstart_handler(event);" @dragend.prevent="dragend_handler(event);">Eingangsmaterial</div>
						<div class="element_spacer"></div>
						<div id="intermediate_produkt" class="material_element side_bar_element" draggable="true" @dragstart.prevent="dragstart_handler(event);" @dragend.prevent="dragend_handler(event);">Zwischenprodukt</div>
						<div class="element_spacer"></div>
						<div id="final_produkt" class="material_element side_bar_element" draggable="true" @dragstart.prevent="dragstart_handler(event);" @dragend.prevent="dragend_handler(event);">Endprodukt</div>
						<div class="element_spacer"></div>
					</div>	
				</div>
				<div id="processes_window">
					<div id="processes_heading" class="heading"><h4>Prozessschritte</h4></div>
					<div id="processes">
						<!-- into here get the process packages imported via the javascript script-->
						<div class="side_bar_element" v-for="(process_package, process_package_name) in input">
							<div class="side_bar_element">{{ process_package_name }}</div>
							<div class="element_spacer"></div>
							<div v-for="(value, key) in process_package.children">
								<div class="side_bar_element">{{ key }}</div>
								<div class="element_spacer"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		
	</aside>
</template>

<script>
	import json from '../input/input.json'
    export default{
          data(){
              return{
                  input: json
              }
          }
      }
	function dragstart_handler(ev){
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

	function dragover_handler(event) {
		console.log("dragOver");
		// Change the target element's border to signify a drag over event
		// has occurred
		// Restore source's border
		// ev.target.style.border = "dashed";
		// ev.currentTarget.style.background = "lightblue";
		//event.preventDefault();
	}
	function drop_handler(ev) {
		console.log("Drop");
		if (ev){
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
		}
	}
</script>


<style lang="scss" scoped>
aside {
	display: flex;
	flex-direction: column;
	background-color: var(--dark);
	color: var(--light);
	width: calc(2rem + 32px);
	overflow: hidden;
	min-height: 100vh;
	padding: 1rem;
	transition: 0.2s ease-in-out;
	.flex {
		flex: 1 1 0%;
	}
	.logo {
		margin-bottom: 1rem;
		img {
			width: 2rem;
		}
	}
	.menu-toggle-wrap {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
		position: relative;
		top: 0;
		transition: 0.2s ease-in-out;
		.menu-toggle {
			transition: 0.2s ease-in-out;
			.material-icons {
				font-size: 2rem;
				color: var(--light);
				transition: 0.2s ease-out;
			}
			
			&:hover {
				.material-icons {
					color: var(--primary);
					transform: translateX(0.5rem);
				}
			}
		}
	}
	h3, .button .text {
		opacity: 0;
		transition: opacity 0.3s ease-in-out;
	}
	h3 {
		color: var(--grey);
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
		text-transform: uppercase;
	}
	.menu {
		margin: 0 -1rem;
		.button {
			display: flex;
			align-items: center;
			text-decoration: none;
			transition: 0.2s ease-in-out;
			padding: 0.5rem 1rem;
			.material-icons {
				font-size: 2rem;
				color: var(--light);
				transition: 0.2s ease-in-out;
			}
			.text {
				color: var(--light);
				transition: 0.2s ease-in-out;
			}
			&:hover {
				background-color: var(--dark-alt);
				.material-icons, .text {
					color: var(--primary);
				}
			}
		}
	}
	.footer {
		opacity: 0;
		transition: opacity 0.3s ease-in-out;
		p {
			font-size: 0.875rem;
			color: var(--grey);
		}
	}
	&.is-expanded {
		width: var(--sidebar-width);
		.menu-toggle-wrap {
			top: -3rem;
			
			.menu-toggle {
				transform: rotate(-180deg);
			}
		}
	}
	@media (max-width: 1024px) {
		position: absolute;
		z-index: 99;
	}
}


/*container for material*/
#material_window{
    box-sizing: border-box;
    width: var(--sidebar-width);
    height: auto;
    float:left;
    vertical-align: top;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    border-width:1px;
    border-style:solid;
    border-color:black;
}

#materials{
    box-sizing: border-box;
    align-items: center;
}

/*container for processes*/
#processes_window{
    box-sizing: border-box;
    width: var(--sidebar-width);
    height: auto;
    float:left;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    border-width:1px;
    border-style:solid;
    border-color:black;
}
.side_bar_element{
    width: 200px;
    height: auto;
    text-align: center;
    border-radius: 5px;
    border-width:1px;
    border-style:solid;
    border-color:black;

    /*center this horizontally in the middle*/
    display: block;
    margin-left: auto;
    margin-right: auto;
}
.heading{
    text-align: center;
}
.element_spacer{
    height: 10px;
}
</style>