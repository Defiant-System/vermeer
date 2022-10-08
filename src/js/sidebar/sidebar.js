
// vermeer.sidebar

{
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			el: window.find(".sidebar-wrapper"),
		};
		
		// init all sub-objects
		Object.keys(this.box)
			.filter(i => typeof this.box[i].init === "function")
			.map(i => this.box[i].init(this));

		// temp
		// setTimeout(() => window.find(`.toolbar-tool_[data-click="toggle-sidebar"]`).trigger("click"), 300);
		// setTimeout(() => window.find(`.box-head div[data-content="info"]`).trigger("click"), 300);
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
			case "box-head-tab":
				el = $(event.target);
				if (el.hasClass("active") || !el.parent().hasClass("box-head")) return;
				el.parent().find(".active").removeClass("active");
				el.addClass("active");

				pEl = el.parents(".sidebar-box");
				pEl.find(".box-body .active").removeClass("active");
				pEl.find(`.box-body > div[data-box="${el.data("content")}"]`).addClass("active");
				break;
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