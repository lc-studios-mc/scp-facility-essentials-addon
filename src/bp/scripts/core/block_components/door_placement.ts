import { destroyBlock } from "@/lib/block_utils";
import * as mc from "@minecraft/server";

const COMPONENT: mc.BlockCustomComponent = {
	onPlace({ block }) {
		const isBottomPart = Boolean(block.permutation.getState("scpfe:is_bottom_part"));

		if (!isBottomPart) {
			const blockBelow = block.below();

			if (!blockBelow || blockBelow.typeId === block.typeId) return;

			block.setType("minecraft:air");
			return;
		}

		const blockAbove = block.above();

		if (!blockAbove || !(blockAbove.isAir || block.isLiquid)) {
			destroyBlock(block);
			return;
		}

		const upperPartPermutation = block.permutation.withState("scpfe:is_bottom_part", false);

		blockAbove.setPermutation(upperPartPermutation);
	},
	onPlayerBreak({ block, brokenBlockPermutation }) {
		const isBottomPart = Boolean(brokenBlockPermutation.getState("scpfe:is_bottom_part"));
		const otherPartBlock = isBottomPart ? block.above() : block.below();

		if (!otherPartBlock || otherPartBlock.typeId !== brokenBlockPermutation.type.id) return;

		destroyBlock(otherPartBlock);
	},
};

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpfe:door_placement", COMPONENT);
});
