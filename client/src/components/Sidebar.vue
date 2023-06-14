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
				<div id="side_bar" v-show="is_expanded" ondrop="drop_handler(event);" ondragover="dragover_handler(event);">
				<div id="material_window">
					<div id="material_heading" class="heading"><h4>Materialien</h4></div>
					<div class="element_spacer"></div>
					<div id="materials">
						<div id="start_material" class="material_element side_bar_element" draggable="true" ondragstart="dragstart_handler(event);" ondragend="dragend_handler(event);">Eingangsmaterial</div>
						<div class="element_spacer"></div>
						<div id="intermediate_produkt" class="material_element side_bar_element" draggable="true" ondragstart="dragstart_handler(event);" ondragend="dragend_handler(event);">Zwischenprodukt</div>
						<div class="element_spacer"></div>
						<div id="final_produkt" class="material_element side_bar_element" draggable="true" ondragstart="dragstart_handler(event);" ondragend="dragend_handler(event);">Endprodukt</div>
						<div class="element_spacer"></div>
					</div>	
				</div>
				<div id="processes_window">
					<div id="processes_heading" class="heading"><h4>Prozessschritte</h4></div>
					<div id="processes">
						<!-- into here get the process packages imported via the javascript script-->
					</div>
				</div>
			</div>
		</div>
		
	</aside>
</template>

<script setup>
import { ref } from 'vue'
import logoURL from '../assets/logo.png'
const is_expanded = ref(localStorage.getItem("is_expanded") === "true")
const ToggleMenu = () => {
	is_expanded.value = !is_expanded.value
	localStorage.setItem("is_expanded", is_expanded.value)
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