
'use strict';

// import masterView from './views/views.master'

class App {
	constructor() {
		// this.controller()
		console.log('%cscripts Initialize successfully', 'padding: 5px 15px; background: green; color: white; display: block;')
	}
	controller() {
		// new masterView()
	} // controller
} // app

const app = new App()
window.addEventListener('DOMContentLoaded', app)
