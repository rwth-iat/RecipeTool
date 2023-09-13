<template>	
	<aside
		:class="`${is_expanded ? 'is-expanded' : ''}`"
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
			<div class="element_spacer"></div>
				<elementWindow element_type="Materials"> Test </elementWindow>
				<div class="element_spacer"></div>
				<elementWindow element_type="Processes"> Test </elementWindow>
		</div>
	</aside>
</template>

<script setup>
	//import vue from 'vue'
	import { ref } from 'vue'
	import logoURL from '../assets/logo.png'
	import elementWindow from './SidebarComponents/elementWindow.vue'

	const is_expanded = ref(localStorage.getItem("is_expanded") === "true")

	//function to open/close sidebar
	const ToggleMenu = () => {
		is_expanded.value = !is_expanded.value
		localStorage.setItem("is_expanded", is_expanded.value)
	}
</script>


<style lang="scss" scoped>
aside {
	z-index: 2;
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
</style>