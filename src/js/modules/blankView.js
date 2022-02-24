
// vermeer.blankView

{
	init() {
		// fast references
		this.els = {
			doc: $(document),
			content: window.find("content"),
			el: window.find(".blank-view"),
		};

		// window.settings.clear();
		
		/*
		// get settings, if any
		let xList = $.xmlFromString(`<Recents/>`);
		let xPreset = window.bluePrint.selectSingleNode(`//Presets`);

		this.xRecent = window.settings.getItem("recents") || xList.documentElement;
		// add recent files in to data-section
		xPreset.parentNode.append(this.xRecent);

		// setTimeout(() => {
		// 	window.find(".preset:nth(0)").trigger("click");
		// }, 500);
		*/
	},
	dispatch(event) {
		let APP = vermeer,
			Self = APP.blankView,
			name,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			/*
			case "add-recent-file":
				let str = `<i name="${event.file.base}" filepath="${event.file.path}"/>`,
					xFile = $.nodeFromString(str),
					xExist = Self.xRecent.selectSingleNode(`//Recents/*[@filepath="${event.file.path}"]`);
				// remove entry if already exist
				if (xExist) xExist.parentNode.removeChild(xExist);
				// insert new entry at first position
				Self.xRecent.insertBefore(xFile, Self.xRecent.firstChild);
				break;
			case "open-filesystem":
				window.dialog.open({
					jpg: item => Self.dispatch(item),
					jpeg: item => Self.dispatch(item),
					png: item => Self.dispatch(item),
				});
				break;
			case "from-clipboard":
				// TODO
				break;
			case "select-preset":
				el = $(event.target);
				if (!el.hasClass("preset")) return;
				// window.tabs.add("test");

				value = {
					bg: el.data("bg"),
					width: +el.data("width"),
					height: +el.data("height"),
				};
				APP.dispatch({ type: "new-file", value });
				break;
			case "select-recent-file":
				el = $(event.target);
				if (!el.hasClass("recent-file")) return;
				
				defiant.shell(`fs -o '${el.data("file")}' null`)
					.then(exec => APP.dispatch(exec.result));
				break;
				*/
		}
	}
}