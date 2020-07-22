
defiant.require("modules/exif.min.js");

import { loadImage } from "./modules/image-helpers";
import { Editor } from "./classes/editor";

const vermeer = {
	async init() {
		// fast references
		this.content = window.find("content");

		let cvs = window.find("canvas")[0];
		this.editor = new Editor(cvs);

		let img = await loadImage("~/images/svetlana-pochatun.jpg");
		this.editor.setImage(img);
	},
	dispatch(event) {
		switch (event.type) {
			case "window.open":
				break;
		}
	}
};

window.exports = vermeer;
