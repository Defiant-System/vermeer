
// vermeer.sidebar

{
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			el: window.find(".sidebar-wrapper"),
		};
		
		// init sidebar initial boxes
		["navigator", "presets"].map(item => {
			let box = window.store(`boxes/box-${item}.htm`, `div[data-box="${item}"]`);
			this.box[item].toggle(box, "on");
		});

		// temp
		// setTimeout(() => window.find(`.toolbar-tool_[data-click="toggle-sidebar"]`).trigger("click"), 300);
	},
	dispatch(event) {
		let APP = vermeer,
			Self = APP.sidebar,
			name,
			value,
			pEl,
			el;
		// console.log(event);
		switch (event.type) {
			case "toggle-sidebar":
				value = Self.els.content.hasClass("show-sidebar");
				Self.els.content.toggleClass("show-sidebar", value);
				return !value;
			default:
				if (event.el) {
					pEl = event.el.parents("div[data-box]");
					name = pEl.data("box");
					if (pEl.length && Self.box[name].dispatch) {
						Self.box[name].dispatch(event);
					}
				}
		}
	},
	box: {
		navigator: @import "./box-navigator.js",
		histogram: @import "./box-histogram.js",
		info:      @import "./box-info.js",
		presets:   @import "./box-presets.js"
	}
}