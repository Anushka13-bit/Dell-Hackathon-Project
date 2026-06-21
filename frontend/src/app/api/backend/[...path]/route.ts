import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function buildBackendUrl(path: string[], search: string) {
  const backendUrl = getBackendUrl().replace(/\/$/, "");
  const pathname = path.join("/");
  const needsTrailingSlash = path.length === 1;
  const suffix = needsTrailingSlash ? "/" : "";
  return `${backendUrl}/${pathname}${suffix}${search}`;
}

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const targetUrl = buildBackendUrl(path, request.nextUrl.search);

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  try {
    const response = await fetch(targetUrl, init);
    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("Backend proxy failed:", error);
    return NextResponse.json(
      { error: "Unable to reach the backend API. Is uvicorn running?" },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
