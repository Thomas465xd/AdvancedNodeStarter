export async function getKeys() {
	if (process.env.NODE_ENV === "production") {
		return await import("./prod");
	} else if (process.env.NODE_ENV === "ci") {
		return await import("./ci");
	} else {
		return await import("./dev");
	}
}
