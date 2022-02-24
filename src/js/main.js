
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
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			blankView: window.find(".blank-view"),
			toolbar: {
				sidebar: window.find(`.toolbar-tool_[data-click="toggle-sidebar"]`),
			}
		};

		// init objects
		UI.init();
		Files.init();
		Projector.init();
		Object.keys(TOOLS).filter(t => TOOLS[t].init).map(t => TOOLS[t].init());

		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init(this));

		// initate editor
		this.editor = new Editor(Projector);
		// default tool; move
		this.dispatch({ type: "select-tool", arg: "move" });

		// temp
		// setTimeout(() => this.els.blankView.find(".recent-file:nth(1)").trigger("click"), 500);
		// setTimeout(() => this.els.content.find(".box-head div[data-content='info']").trigger("click"), 700);
		// setTimeout(() => this.dispatch({ type: "save-file" }), 700);
	},
	dispatch(event) {
		let Self = vermeer,
			file,
			name,
			pEl,
			el;
		switch (event.type) {
			// system events
			case "window.init":
				// reset app by default - show initial view
				Self.dispatch({ type: "reset-app" });
				break;
			case "window.resize":
				Projector.reset();
				Projector.file.dispatch({ type: "set-scale" });
				break;
			case "window.close":
				// send "kill" signal to workers
				if (Self.editor) Self.editor.dispose();
				break;
			case "open.file":
				// Files.open(event.path);
				event.open({ responseType: "blob" })
					.then(file => {
						// set up workspace
						Self.dispatch({ type: "setup-workspace" });
						// open file with Files
						Files.open(file);
					});
				break;
			// custom events
			case "setup-workspace":
				// hide blank view
				Self.els.content.removeClass("show-blank-view");
				// enable & click on show sidebar
				Self.els.toolbar.sidebar
					.removeClass("tool-disabled_")
					.trigger("click");
				break;
			case "reset-app":
				// render blank view
				window.render({
					template: "blank-view",
					match: `//Data`,
					target: Self.els.blankView
				});
				// show blank view
				Self.els.content.addClass("show-blank-view");
				break;
			case "open-file":
				window.dialog.open({
					jpg: item => Self.dispatch(item),
					jpeg: item => Self.dispatch(item),
					png: item => Self.dispatch(item),
				});
				break;
			case "save-file":
				file = Files.activeFile;
				// create blob and save file
				file.toBlob(file._file.blob.type, .95)
					.then(blob => window.dialog.save(file._file, blob));
				break;
			case "save-file-as":
				file = Files.activeFile;
				// pass on available file types
				window.dialog.saveAs(file._file, {
					png: () => file.toBlob("image/png"),
					jpg: () => file.toBlob("image/jpeg", .95),
					webp: () => file.toBlob("image/webp"),
				});
				break;
			case "open-help":
				defiant.shell("fs -u '~/help/index.md'");
				break;
			case "toggle-sidebar":
				return Self.sidebar.dispatch(event);
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
					pEl = event.el.parents(`div[data-area]`);
					if (pEl.length) {
						name = pEl.data("area");
						Self[name].dispatch(event);
					}
				}
		}
	},
	blankView: @import "modules/blankView.js",
	sidebar: @import "sidebar/sidebar.js"
};

window.exports = vermeer;
