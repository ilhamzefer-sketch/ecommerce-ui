import { apiRequest } from "./api-client";

describe("apiRequest", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses successful plain text responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("Auth service is up", {
          status: 200,
          headers: { "content-type": "text/plain" }
        })
      )
    );

    await expect(apiRequest<string>("/api/auth/status")).resolves.toBe("Auth service is up");
  });

  it("adds bearer token for protected requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ username: "user" }), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("/api/users/me", { token: "token-value" });

    const request = fetchMock.mock.calls[0][1] as RequestInit;
    expect((request.headers as Headers).get("Authorization")).toBe("Bearer token-value");
  });

  it("normalizes validation error details", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: "Input validation failed",
            details: { email: "Email should be valid" }
          }),
          {
            status: 400,
            headers: { "content-type": "application/json" }
          }
        )
      )
    );

    await expect(apiRequest("/api/auth/register")).rejects.toMatchObject({
      status: 400,
      message: "Input validation failed",
      details: { email: "Email should be valid" }
    });
  });

  it("normalizes network errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(apiRequest("/api/auth/status")).rejects.toMatchObject({
      status: 0,
      isNetworkError: true
    });
  });
});
