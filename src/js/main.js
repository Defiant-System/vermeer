
import { createCanvas, loadImage } from "./modules/image-helpers";
import { Editor } from "./classes/editor";

@import "./modules/exif.min.js"
@import "./classes/file.js"
@import "./modules/color.js"
@import "./modules/misc.js"
@import "./modules/ui.js"
@import "./modules/files.js"
@import "./modules/projector.js"


const TOOLS = {
	_active : false,
	move    : @import "./tools/move.js",
};


const vermeer = {
	els: {},
	init() {
		// fast references
		this.els.content = window.find("content");

		// init objects
		UI.init();
		Files.init();
		Projector.init();
		Object.keys(TOOLS).filter(t => TOOLS[t].init).map(t => TOOLS[t].init());

		// init sidebar initial boxes
		["navigator", "presets"].map(item => {
			let box = window.store(`boxes/box-${item}.htm`, `div[data-box="${item}"]`);
			this.box[item].toggle(box, "on");
		});

		// initate editor
		this.editor = new Editor(Projector);
		
		this.dispatch({ type: "select-tool", arg: "move" });

		// temp
		//this.dispatch({ type: "open-file", path: "~/images/pilatus.jpg" });
		//this.dispatch({ type: "open-file", path: "~/images/cup.jpg" });
		// this.dispatch({ type: "open-file", path: "~/images/svetlana-pochatun.jpg" });
		
		//this.els.content.find(".box-head div[data-content='info']").trigger("click");
	},
	dispatch(event) {
		let Self = vermeer,
			name,
			pEl,
			el;
		switch (event.type) {
			// system events
			case "window.resize":
				Projector.reset();
				Projector.file.dispatch({ type: "set-scale" });
				break;
			case "window.close":
				// send "kill" signal to workers
				Self.editor.dispose();
				break;
			case "open.file":
				// Files.open(event.path);
				event.open({ responseType: "blob" })
					.then(file => Files.open(file));
				break;
			// custom events
			case "open-help":
				defiant.shell("fs -u '~/help/index.md'");
				break;
			case "set-clut":
				Self.box.presets.dispatch(event);
				break;
			case "box-head-tab":
				el = $(event.target);
				if (el.hasClass("active") || !el.parent().hasClass("box-head")) return;
				el.parent().find(".active").removeClass("active");
				el.addClass("active");

				let newBox = window.store(`boxes/box-${el.data("content")}.htm`),
					oldBox = el.parent().nextAll(".box-body").find("> div[data-box]");
				
				// notify box state = off
				this.box[oldBox.data("box")].toggle(oldBox, "off");
				// replace box body
				newBox = oldBox.replace(newBox);
				// notify box state = on
				this.box[newBox.data("box")].toggle(newBox, "on");
				break;
			case "select-tool":
				if (TOOLS._active === event.arg) return;
				
				if (TOOLS._active) {
					// disable active tool
					TOOLS[TOOLS._active].dispatch({ type: "disable" });
				}
				if (TOOLS[event.arg]) {
					// enable tool
					TOOLS._active = event.arg;
					TOOLS[TOOLS._active].dispatch({ type: "enable" });
				}
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
		navigator: @import "./boxes/box-navigator.js",
		histogram: @import "./boxes/box-histogram.js",
		info:      @import "./boxes/box-info.js",
		presets:   @import "./boxes/box-presets.js"
	}
};

window.exports = vermeer;
