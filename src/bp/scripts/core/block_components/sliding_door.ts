import * as mc from "@minecraft/server";

const COMPONENT: mc.BlockCustomComponent = {};

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpfe:sliding_door", COMPONENT);
});
