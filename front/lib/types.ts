export interface ArticleSection {
    heading: string;
    paragraphs: string[];
}

export interface ArticleData {
    source: string;
    title: string;
    authors: string[];
    sections: ArticleSection[];
}

export type WorkflowStatus = "idle" | "loading" | "success" | "error";

export interface WorkflowState<T> {
    status: WorkflowStatus;
    data: T | null;
    error: string | null;
}

export interface KeywordsResult {
    keywords: string[];
}

export interface SummaryResult {
    summary: string;
}

export interface Entity {
    name: string;
    type: string;
    description?: string;
}

export interface EntitiesResult {
    entities: Entity[];
}

export interface BlindSpotsResult {
    blindspots: string[];
}

export interface MediaResult {
    mediaName: string;
    description: string;
    conflicts: string[];
}

export interface OtherMediaItem {
    name: string;
    url?: string;
    angle?: string;
}

export interface OtherMediaResult {
    otherMedia: OtherMediaItem[];
}
