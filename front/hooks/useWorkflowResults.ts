import { useReducer, useCallback, useRef } from "react";
import type {
    ArticleData,
    WorkflowState,
    KeywordsResult,
    SummaryResult,
    EntitiesResult,
    BlindSpotsResult,
    MediaResult,
    OtherMediaResult,
    CognitiveBiasResult
} from "@/lib/types";

export interface WorkflowResults {
    keywords: WorkflowState<KeywordsResult>;
    summary: WorkflowState<SummaryResult>;
    entities: WorkflowState<EntitiesResult>;
    blindspots: WorkflowState<BlindSpotsResult>;
    media: WorkflowState<MediaResult>;
    otherMedia: WorkflowState<OtherMediaResult>;
    cognitiveBias: WorkflowState<CognitiveBiasResult>;
}

type WorkflowKey = keyof WorkflowResults;

type Action =
    | { type: "LOADING"; workflow: WorkflowKey }
    | { type: "SUCCESS"; workflow: WorkflowKey; data: unknown }
    | { type: "ERROR"; workflow: WorkflowKey; error: string };

function makeIdle(): WorkflowState<never> {
    return { status: "idle", data: null, error: null };
}

const initialState: WorkflowResults = {
    keywords: makeIdle(),
    summary: makeIdle(),
    entities: makeIdle(),
    blindspots: makeIdle(),
    media: makeIdle(),
    otherMedia: makeIdle(),
    cognitiveBias: makeIdle()
};

function reducer(state: WorkflowResults, action: Action): WorkflowResults {
    switch (action.type) {
        case "LOADING":
            return {
                ...state,
                [action.workflow]: {
                    status: "loading",
                    data: null,
                    error: null
                }
            };
        case "SUCCESS":
            return {
                ...state,
                [action.workflow]: {
                    status: "success",
                    data: action.data,
                    error: null
                }
            };
        case "ERROR":
            return {
                ...state,
                [action.workflow]: {
                    status: "error",
                    data: null,
                    error: action.error
                }
            };
    }
}

const WORKFLOWS: { key: WorkflowKey; endpoint: string }[] = [
    {
        key: "keywords",
        endpoint: "/api/mastra/workflows/keywords-extraction/start-async"
    },
    {
        key: "summary",
        endpoint: "/api/mastra/workflows/article-summary/start-async"
    },
    {
        key: "entities",
        endpoint: "/api/mastra/workflows/entities-analysis/start-async"
    },
    {
        key: "blindspots",
        endpoint: "/api/mastra/workflows/blindspots-analysis/start-async"
    },
    {
        key: "media",
        endpoint: "/api/mastra/workflows/media-research/start-async"
    },
    {
        key: "otherMedia",
        endpoint: "/api/mastra/workflows/other-media/start-async"
    },
    {
        key: "cognitiveBias",
        endpoint: "/api/mastra/workflows/cognitive-bias-analysis/start-async"
    }
];

export function useWorkflowResults(articleData: ArticleData): {
    results: WorkflowResults;
    start: () => void;
} {
    const [results, dispatch] = useReducer(reducer, initialState);
    const controllersRef = useRef<AbortController[]>([]);

    const start = useCallback(() => {
        controllersRef.current.forEach((c) => c.abort());

        const controllers = WORKFLOWS.map(({ key, endpoint }) => {
            const controller = new AbortController();

            dispatch({ type: "LOADING", workflow: key });

            fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inputData: articleData }),
                signal: controller.signal
            })
                .then((res) => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return res.json();
                })
                .then((json) => {
                    dispatch({
                        type: "SUCCESS",
                        workflow: key,
                        data: json.result
                    });
                })
                .catch((err: unknown) => {
                    if (err instanceof Error && err.name === "AbortError")
                        return;
                    dispatch({
                        type: "ERROR",
                        workflow: key,
                        error:
                            err instanceof Error ? err.message : "Unknown error"
                    });
                });

            return controller;
        });

        controllersRef.current = controllers;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { results, start };
}
