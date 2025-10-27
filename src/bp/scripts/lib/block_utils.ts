import * as mc from "@minecraft/server";

/**
 * Destroys a block by running `setblock` command with "destroy" mode.
 * @param block - The block.
 */
export const destroyBlock = (block: mc.Block): void => {
	const location = `${block.x} ${block.y} ${block.z}`;
	block.dimension.runCommand(`setblock ${location} air destroy`);
};
