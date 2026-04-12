import * as prodKeys from "./prod.js";
import * as ciKeys from "./ci.js";
import * as devKeys from "./dev.js";

export function getKeys() {
	if (process.env.NODE_ENV === "production") return prodKeys;
	if (process.env.NODE_ENV === "ci") return ciKeys;
	return devKeys;
}
