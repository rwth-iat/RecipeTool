<script setup>
	import { ref } from 'vue'
	import logoURL from '../assets/logo.png'
	import json from '../input/input.json'
	import draggable from 'vuedraggable'

	let input = json
	let materials_list = [{name:"Eingangsmaterial"}, {name:"Zwischenprodukt"}, {name:"Endprodukt"}]
	const is_expanded = ref(localStorage.getItem("is_expanded") === "true")
	let templist = []

	const ToggleMenu = () => {
		is_expanded.value = !is_expanded.value
		localStorage.setItem("is_expanded", is_expanded.value)
	}

	const dragstart = (event, id, name, classes) =>{
		console.log("dragstart")
		event.dataTransfer.dropEffect = "copy"
		event.dataTransfer.effectAllowed = "copy"
		event.dataTransfer.setData("itemID", id)
		event.dataTransfer.setData("itemName", name)
		event.dataTransfer.setData("itemClasses", classes)
	}
	const dragend = (event, item) =>{
		console.log("dragend")
		event.dataTransfer.dropEffect = "copy"
		event.dataTransfer.effectAllowed = "copy"
		//event.dataTransfer.setData("itemID", item.id)
	}
	const onDrop = (event) =>{
		event.dataTransfer.dropEffect = 'delete';
		var workspace_items = event.dataTransfer.getData("workspaceItems")
		var id = event.dataTransfer.getData("itemID")
		workspace_items.value.pop(workspace_items.value.find(b => b.id === id))
		console.log("drop sidebar")
	}
</script>

<template>
	<aside
		:class="`${is_expanded ? 'is-expanded' : ''}`"
		@drop="$event => onDrop($event)"
		@dragenter.prevent
		@dragover.prevent
	>
		<div class="logo">
			<img :src="logoURL" alt="Vue" /> 
		</div>

		<div class="menu-toggle-wrap">
			<button class="menu-toggle" @click="ToggleMenu">
				<span class="material-icons">>></span>
			</button>
		</div>

		<div v-show="is_expanded">
			<div id="material_window">
				<div id="material_heading" class="heading"><h4>Materialien</h4></div>
				<div class="element_spacer"></div>
				<div id="materials"
							v-for="element in materials_list"
				>
					<div id="{{element.name}}" 
						class="material_element sidebar_element"
						draggable="true"
						@dragstart.preventDefault="$event => dragstart($event, 'testId', element.name, 'sidebar_element')"
					>
							{{element.name}}
					</div>
					<div class="element_spacer"></div>
				</div>
			</div>
			<div id="processes_window">
				<div id="processes_heading" class="heading"><h4>Prozessschritte</h4></div>
				<div id="processes">
					<!-- into here get the process packages imported via the javascript script-->
					<div  v-for="(process_package, process_package_name) in input">
						<div>{{ process_package_name }}</div>
						<div class="element_spacer"></div>
						<div id="child_wrapper" v-for="element in process_package.children">
							<div id={{element.name}} class="process_element sidebar_element" 
								@dragstart.preventDefault="$event => dragstart($event, 'testId', element.name, 'sidebar_element')"
								draggable="true"
							> 
								{{element.name}}
							</div>
							<div class="element_spacer"></div>
						</div>
						<div class="element_spacer"></div>
					</div>
				</div>
			</div>
		</div>
	</aside>
</template>


<style lang="scss" scoped>
aside {
	display: flex;
	flex-direction: column;
	background-color: var(--dark);
	color: var(--light);
	width: calc(2rem + 32px);
	overflow-y: scroll;
	min-height: calc(100vh - var(--topbar-height));
	padding: 1rem;
	transition: 0.2s ease-in-out;
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
.sidebar_element{
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
    height: var(--element-height);
}
</style>