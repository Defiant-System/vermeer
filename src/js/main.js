
// import * as ImageProcessing from "./modules/image-processing";
// console.log( ImageProcessing );

const filmsim = {
	init() {
		// fast references
		this.content = window.find("content");
	},
	dispatch(event) {
		switch (event.type) {
			case "window.open":
				break;
		}
	}
};

window.exports = filmsim;
