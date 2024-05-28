import { system, world, EntityItemComponent, ItemStack } from '@minecraft/server'

const infuser: string = "magma"

class InfusionRecipe {
	first: string = "";
	second: string = "";
	result: string = ""

	constructor(first: string, second: string, result: string) {
		this.first = first;
		this.second = second;
		this.result = result;
	}

	match(a: EntityItemComponent, b: EntityItemComponent) {
		return (a.itemStack.typeId == this.first && b.itemStack.typeId == this.second) || (a.itemStack.typeId == this.second && b.itemStack.typeId == this.first);
	}
}

export var infusion_recipes: InfusionRecipe[] = [
	new InfusionRecipe("heo:lead_ingot", "minecraft:gold_ingot", "heo:zinc_ingot"),
	new InfusionRecipe("heo:lead_ingot", "minecraft:iron_ingot", "heo:tin_ingot"),
	new InfusionRecipe("heo:zinc_ingot", "heo:tin_ingot", "heo:aluminium_ingot"),
	new InfusionRecipe("minecraft:coal", "minecraft:iron_ingot", "heo:steel_ingot"),
	new InfusionRecipe("minecraft:copper_ingot", "heo:tin_ingot", "heo:bronze_ingot"),
	new InfusionRecipe("minecraft:copper_ingot", "heo:zinc_ingot", "heo:brass_ingot"),
	new InfusionRecipe("heo:silver_ingot", "minecraft:gold_ingot", "heo:electrum_ingot"),
	new InfusionRecipe("heo:silver_ingot", "minecraft:copper_ingot", "heo:platinum_ingot"),
	new InfusionRecipe("heo:platinum_ingot", "minecraft:netherite_ingot", "heo:nethersteel_ingot")
]

function findMatchingInfusion(first: EntityItemComponent, second: EntityItemComponent) {
	return infusion_recipes.find(recipe => {
		return recipe.match(first, second);
	});
}

export function setupInfusion() {
	console.warn("Loading infusion")
	world.afterEvents.entitySpawn.subscribe((event) => {
		system.runTimeout(() => {

			var entity = event.entity;
			var itemComp = entity.getComponent("minecraft:item") as EntityItemComponent;
			if (!itemComp) {
				return;
			}

			var dim = entity.dimension;
			var block = dim.getBlock(entity.location).below(1);
			if (!block.permutation.matches(infuser)) {
				return;
			}

			var entities = dim.getEntitiesAtBlockLocation(entity.location);
			if (!entities) return;

			entities.forEach(near => {
				var nearComp = near.getComponent("minecraft:item") as EntityItemComponent;
				if (nearComp) {
					var infusion = findMatchingInfusion(itemComp, nearComp)
					if (!infusion)
						return;
					var result = infusion.result;

					// Spawn the result item
					dim.spawnItem(new ItemStack(result, 1), entity.location);

					// Destroy the input items
					entity.kill();
					near.kill();

					return;
				}
			});
		}, 20 * 2);
	});
}

setupInfusion();