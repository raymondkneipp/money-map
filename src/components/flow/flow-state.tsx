import type { Edge, Node } from "@xyflow/react";
import {
	createContext,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	createScenario as createScenarioOp,
	deleteScenario as deleteScenarioOp,
	generateScenarioId,
	getActiveScenario,
	renameScenario as renameScenarioOp,
	type Scenario,
	type ScenariosState,
	setActiveEdges,
	setActiveNodes,
	setActiveScenarioId,
} from "#/lib/scenarios";
import { loadJSON, saveJSON } from "#/lib/storage";
import { initialEdges, initialNodes } from "./data";

export type { Scenario };

type FlowStateValue = {
	nodes: Node[];
	edges: Edge[];
	setNodes: Dispatch<SetStateAction<Node[]>>;
	setEdges: Dispatch<SetStateAction<Edge[]>>;
	scenarios: Scenario[];
	activeScenarioId: string;
	setActiveScenario: (id: string) => void;
	createScenario: (opts?: { name?: string; fromId?: string }) => string;
	renameScenario: (id: string, name: string) => void;
	deleteScenario: (id: string) => void;
};

const FlowStateContext = createContext<FlowStateValue | null>(null);

const STORAGE_KEY = "money-map:scenarios:v1";

function defaultState(): ScenariosState {
	const id = "default";
	return {
		scenarios: [
			{ id, name: "Default", nodes: initialNodes, edges: initialEdges },
		],
		activeId: id,
	};
}

function isStoredState(raw: unknown): raw is ScenariosState {
	const v = raw as ScenariosState | null;
	return Boolean(v && Array.isArray(v.scenarios) && v.scenarios.length > 0);
}

function readStorage(): ScenariosState | null {
	const parsed = loadJSON<ScenariosState>(STORAGE_KEY, isStoredState);
	if (!parsed) return null;
	// Active id can drift if scenarios were trimmed in another tab.
	if (!parsed.scenarios.some((s) => s.id === parsed.activeId)) {
		parsed.activeId = parsed.scenarios[0].id;
	}
	return parsed;
}

/**
 * Holds canvas state (nodes/edges) for one or more named "scenarios". The
 * active scenario's nodes/edges are exposed via `useFlowState` so the canvas
 * and other pages stay unaware that they're swapping between saved plans.
 *
 * State persists to localStorage on change. The first render uses the seeded
 * default flow; any saved data hydrates after mount to avoid SSR mismatches.
 */
export function FlowStateProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<ScenariosState>(defaultState);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		const saved = readStorage();
		if (saved) setState(saved);
		setHydrated(true);
	}, []);

	useEffect(() => {
		if (!hydrated) return;
		saveJSON(STORAGE_KEY, state);
	}, [state, hydrated]);

	const active = getActiveScenario(state);

	const setNodes = useCallback<Dispatch<SetStateAction<Node[]>>>((updater) => {
		setState((prev) => {
			const current = getActiveScenario(prev);
			const next =
				typeof updater === "function"
					? (updater as (n: Node[]) => Node[])(current.nodes)
					: updater;
			return setActiveNodes(prev, next);
		});
	}, []);

	const setEdges = useCallback<Dispatch<SetStateAction<Edge[]>>>((updater) => {
		setState((prev) => {
			const current = getActiveScenario(prev);
			const next =
				typeof updater === "function"
					? (updater as (e: Edge[]) => Edge[])(current.edges)
					: updater;
			return setActiveEdges(prev, next);
		});
	}, []);

	const setActiveScenario = useCallback((id: string) => {
		setState((prev) => setActiveScenarioId(prev, id));
	}, []);

	const createScenario = useCallback(
		(opts?: { name?: string; fromId?: string }) => {
			const id = generateScenarioId();
			setState((prev) => createScenarioOp(prev, { id, ...opts }));
			return id;
		},
		[],
	);

	const renameScenario = useCallback((id: string, name: string) => {
		setState((prev) => renameScenarioOp(prev, id, name));
	}, []);

	const deleteScenario = useCallback((id: string) => {
		setState((prev) => deleteScenarioOp(prev, id));
	}, []);

	const value = useMemo<FlowStateValue>(
		() => ({
			nodes: active.nodes,
			edges: active.edges,
			setNodes,
			setEdges,
			scenarios: state.scenarios,
			activeScenarioId: state.activeId,
			setActiveScenario,
			createScenario,
			renameScenario,
			deleteScenario,
		}),
		[
			active,
			state.scenarios,
			state.activeId,
			setNodes,
			setEdges,
			setActiveScenario,
			createScenario,
			renameScenario,
			deleteScenario,
		],
	);

	return (
		<FlowStateContext.Provider value={value}>
			{children}
		</FlowStateContext.Provider>
	);
}

export function useFlowState(): FlowStateValue {
	const ctx = useContext(FlowStateContext);
	if (!ctx) {
		throw new Error("useFlowState must be used inside <FlowStateProvider>");
	}
	return ctx;
}
