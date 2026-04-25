import type { Edge, Node } from "@xyflow/react";
import {
	createContext,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	useContext,
	useState,
} from "react";
import { initialEdges, initialNodes } from "./data";

type FlowStateValue = {
	nodes: Node[];
	edges: Edge[];
	setNodes: Dispatch<SetStateAction<Node[]>>;
	setEdges: Dispatch<SetStateAction<Edge[]>>;
};

const FlowStateContext = createContext<FlowStateValue | null>(null);

/**
 * Holds the canvas state above the route tree so other pages (e.g. /stats)
 * can read the same nodes/edges that the flow editor mutates.
 */
export function FlowStateProvider({ children }: { children: ReactNode }) {
	const [nodes, setNodes] = useState<Node[]>(initialNodes);
	const [edges, setEdges] = useState<Edge[]>(initialEdges);
	return (
		<FlowStateContext.Provider value={{ nodes, edges, setNodes, setEdges }}>
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
