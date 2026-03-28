import { type NextRequest, NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production";

if (isProd && !process.env.MASTRA_URL) {
    throw new Error("MASTRA_URL must be set in production");
}

const MASTRA_BASE = (
    process.env.MASTRA_URL || "http://localhost:4111/api"
).replace(/\/$/, "");

async function proxy(req: NextRequest, params: { path: string[] }) {
    const path = params.path.join("/");
    const url = `${MASTRA_BASE}/${path}${req.nextUrl.search}`;

    const headers = new Headers(req.headers);
    headers.delete("host");

    const res = await fetch(url, {
        method: req.method,
        headers,
        body:
            req.method !== "GET" && req.method !== "HEAD"
                ? req.body
                : undefined,
        // @ts-expect-error -- Node.js fetch supports duplex for streaming request bodies
        duplex: "half"
    });

    return new NextResponse(res.body, {
        status: res.status,
        headers: res.headers
    });
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    return proxy(req, await params);
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    return proxy(req, await params);
}
