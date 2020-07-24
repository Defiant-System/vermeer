
defiant.require("classes/file.js")

defiant.require("modules/misc.js")
defiant.require("modules/ui.js")
defiant.require("modules/files.js")
defiant.require("modules/projector.js");
defiant.require("modules/exif.min.js");

import { loadImage } from "./modules/image-helpers";
import { Editor } from "./classes/editor";

const vermeer = {
	els: {},
	init() {
		// fast references
		this.els.content = window.find("content");

		// init objects
		UI.init();
		Files.init();
		Projector.init();

		// init sidebar initial boxes
		["navigator", "presets"].map(item => {
			let box = window.store(`boxes/box-${item}.htm`, `div[data-box="${item}"]`);
			this.box[item].toggle(box, "on");
		});

		// initate editor
		this.editor = new Editor();
		
		// temp
		//this.dispatch({ type: "open-file", path: "~/images/pilatus.jpg" });
		//this.dispatch({ type: "open-file", path: "~/images/cup.jpg" });
		this.dispatch({ type: "open-file", path: "~/images/svetlana-pochatun.jpg" });
	},
	dispatch(event) {
		let Self = vermeer,
			name,
			el;
		switch (event.type) {
			case "open-file":
				Files.open(event.path);
				break;
			case "set-clut":
				console.log(event);
				break;
			case "box-head-tab":
				el = $(event.target);
				if (el.hasClass("active")) return;
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
		navigator: defiant.require("boxes/box-navigator.js"),
		adjust:    defiant.require("boxes/box-adjust.js"),
		info:      defiant.require("boxes/box-info.js"),
		presets:   defiant.require("boxes/box-presets.js")
	}
};

window.exports = vermeer;
