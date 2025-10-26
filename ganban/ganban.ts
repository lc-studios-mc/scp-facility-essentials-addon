import {
	build,
	getMinecraftPackageVersions,
	getRequiredEnv,
	getRequiredEnvWithFallback,
	parseVersionString,
	type BuildConfig,
} from "ganban";
import packageConfig from "../package.json" with { type: "json" };
import path from "node:path";

// Referenced environment variables:
// `DEV`                    | Marks as dev build when set to 1.
// `DEV_BEHAVIOR_PACKS_DIR` | Path to your com.mojang/development_behavior_packs folder.
// `DEV_RESOURCE_PACKS_DIR` | Path to your com.mojang/development_resource_packs folder.
// `ADDON_VERSION`          | Sets addon version in `0.6.9` format. Does nothing when `DEV=1`.
// `WATCH`                  | Whether to watch for file changes to rebuild automatically.

const isDevBuild = Boolean(getRequiredEnvWithFallback("DEV", ""));
const addonVersionArray = parseVersionString(getRequiredEnvWithFallback("ADDON_VERSION", "0.0.1"));
const addonVersionForHumans = "v" + addonVersionArray.join(".");

const minEngineVersion = [1, 21, 110];
const behaviorPackUuid = "6a86b644-2398-4320-ab2e-d733a86b6a75";
const resourcePackUuid = "4acb8b91-863b-43b4-be04-e516e634a4f9";

const minecraftPackageVersions = getMinecraftPackageVersions(packageConfig);

const behaviorPackManifest = {
	format_version: 2,
	header: {
		description: "Essential things for an SCP Foundation facility!",
		name: `SCP Facility Essentials BP - ${isDevBuild ? "DEV" : addonVersionForHumans}`,
		uuid: behaviorPackUuid,
		version: addonVersionArray,
		min_engine_version: minEngineVersion,
	},
	modules: [
		{
			type: "data",
			uuid: "98c58919-293a-499a-b3dc-fd0d3abc6b05",
			version: addonVersionArray,
		},
		{
			language: "javascript",
			type: "script",
			uuid: "603d12fa-3a38-4e2a-b354-9ceeb7b6250b",
			version: addonVersionArray,
			entry: "scripts/main.js",
		},
	],
	dependencies: [
		{
			// Resource pack dependency
			uuid: resourcePackUuid,
			version: addonVersionArray,
		},
		{
			module_name: "@minecraft/server",
			version: minecraftPackageVersions["@minecraft/server"],
		},
		{
			module_name: "@minecraft/server-ui",
			version: minecraftPackageVersions["@minecraft/server-ui"],
		},
	],
};

const resourcePackManifest = {
	format_version: 2,
	header: {
		description: "Resource pack of the SCP Facility Essentials add-on.",
		name: `SCP Facility Essentials RP - ${isDevBuild ? "DEV" : addonVersionForHumans}`,
		uuid: resourcePackUuid,
		version: addonVersionArray,
		min_engine_version: minEngineVersion,
	},
	modules: [
		{
			type: "resources",
			uuid: "1c7f32c1-373e-40d7-9fb9-e57f4c09c6e0",
			version: addonVersionArray,
		},
	],
	capabilities: ["pbr"],
};

const buildConfigRaw = {
	behaviorPack: {
		type: "behavior",
		srcDir: "src/bp",
		outDir: isDevBuild ? "build/dev/bp" : `build/${addonVersionForHumans}/bp`,
		targetDirs: [] as string[],
		manifest: behaviorPackManifest,
		scripts: {
			entry: "src/bp/scripts/main.ts",
			bundle: true,
			minify: false,
			sourceMap: isDevBuild,
			tsconfig: "tsconfig.json",
		},
	},
	resourcePack: {
		type: "resource",
		srcDir: "src/rp",
		outDir: isDevBuild ? "build/dev/rp" : `build/${addonVersionForHumans}/rp`,
		targetDirs: [] as string[],
		manifest: resourcePackManifest,
		generateTextureList: true,
	},
	watch: Boolean(getRequiredEnvWithFallback("WATCH", "")),
} satisfies BuildConfig;

const buildConfig: BuildConfig = buildConfigRaw;

if (isDevBuild) {
	const devBehaviorPacksDir = getRequiredEnv("DEV_BEHAVIOR_PACKS_DIR");
	const devResourcePacksDir = getRequiredEnv("DEV_RESOURCE_PACKS_DIR");

	buildConfigRaw.behaviorPack.targetDirs = [
		path.join(devBehaviorPacksDir, "scp-facility-essentials-bp-dev"),
	];
	buildConfigRaw.resourcePack.targetDirs = [
		path.join(devResourcePacksDir, "scp-facility-essentials-rp-dev"),
	];
}

// Create archive for release builds
if (!isDevBuild) {
	const archiveName = `build/${addonVersionForHumans}/scp-facility-essentials-${addonVersionForHumans}`;
	buildConfig.archives = [
		{
			outFile: `${archiveName}.mcaddon`,
		},
		{
			outFile: `${archiveName}.zip`,
		},
	];
}

await build(buildConfig);
