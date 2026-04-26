import { describe, expect, it } from "vitest";
import {
	createScenario,
	deleteScenario,
	generateScenarioId,
	getActiveScenario,
	renameScenario,
	type ScenariosState,
	setActiveEdges,
	setActiveNodes,
	setActiveScenarioId,
} from "./scenarios";

function seed(): ScenariosState {
	return {
		scenarios: [
			{ id: "a", name: "A", nodes: [], edges: [] },
			{ id: "b", name: "B", nodes: [], edges: [] },
		],
		activeId: "a",
	};
}

describe("generateScenarioId", () => {
	it("returns a unique string", () => {
		const ids = new Set(Array.from({ length: 50 }, () => generateScenarioId()));
		expect(ids.size).toBe(50);
	});
});

describe("getActiveScenario", () => {
	it("returns the active scenario", () => {
		expect(getActiveScenario(seed()).id).toBe("a");
	});

	it("falls back to the first when activeId is stale", () => {
		const s = seed();
		s.activeId = "ghost";
		expect(getActiveScenario(s).id).toBe("a");
	});
});

describe("setActiveNodes / setActiveEdges", () => {
	it("only updates the active scenario", () => {
		const s = seed();
		const next = setActiveNodes(s, [{ id: "n1" } as never]);
		expect(next.scenarios[0].nodes.length).toBe(1);
		expect(next.scenarios[1].nodes.length).toBe(0);
	});

	it("returns the same state when active id is missing", () => {
		const s = { ...seed(), activeId: "ghost" };
		expect(setActiveEdges(s, [{ id: "e" } as never])).toBe(s);
	});
});

describe("setActiveScenarioId", () => {
	it("switches to a real id", () => {
		expect(setActiveScenarioId(seed(), "b").activeId).toBe("b");
	});

	it("ignores unknown ids", () => {
		const s = seed();
		expect(setActiveScenarioId(s, "ghost")).toBe(s);
	});
});

describe("createScenario", () => {
	it("appends a fresh scenario and activates it", () => {
		const next = createScenario(seed(), { id: "c" });
		expect(next.scenarios).toHaveLength(3);
		expect(next.activeId).toBe("c");
		expect(next.scenarios[2].name).toBe("New scenario");
	});

	it("clones the source when fromId is provided and names it '<src> copy'", () => {
		const s: ScenariosState = {
			scenarios: [
				{
					id: "a",
					name: "A",
					nodes: [{ id: "n" } as never],
					edges: [{ id: "e" } as never],
				},
			],
			activeId: "a",
		};
		const next = createScenario(s, { id: "c", fromId: "a" });
		expect(next.scenarios[1].name).toBe("A copy");
		expect(next.scenarios[1].nodes).toEqual(s.scenarios[0].nodes);
		expect(next.scenarios[1].edges).toEqual(s.scenarios[0].edges);
	});
});

describe("renameScenario", () => {
	it("renames a scenario with trim", () => {
		const next = renameScenario(seed(), "a", "  Renamed  ");
		expect(next.scenarios[0].name).toBe("Renamed");
	});

	it("ignores empty / whitespace-only names", () => {
		const s = seed();
		expect(renameScenario(s, "a", "   ")).toBe(s);
	});
});

describe("deleteScenario", () => {
	it("removes a scenario and reassigns active when needed", () => {
		const next = deleteScenario(seed(), "a");
		expect(next.scenarios).toHaveLength(1);
		expect(next.activeId).toBe("b");
	});

	it("refuses to delete the last scenario", () => {
		const s: ScenariosState = {
			scenarios: [{ id: "a", name: "A", nodes: [], edges: [] }],
			activeId: "a",
		};
		expect(deleteScenario(s, "a")).toBe(s);
	});

	it("preserves activeId when a non-active scenario is removed", () => {
		const next = deleteScenario(seed(), "b");
		expect(next.activeId).toBe("a");
	});
});
