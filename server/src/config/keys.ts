export async function getKeys() {
	if (process.env.NODE_ENV === "production") {
		return await import("./prod.js");
	} else if (process.env.NODE_ENV === "ci") {
		return await import("./ci.js");
	} else {
		return await import("./dev.js");
	}
}
