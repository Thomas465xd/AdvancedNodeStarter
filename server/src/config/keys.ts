export async function getKeys() {
	if (process.env.NODE_ENV === "production") {
		return import("./prod.js");
	} else if (process.env.NODE_ENV === "ci") {
		return import("./ci.js");
	} else {
		return import("./dev.js");
	}
}
