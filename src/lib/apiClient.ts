export function getApiKey(): string | null {
    return sessionStorage.getItem("kronos_api_key") || null;
}

export async function apiFetch(input: RequestInfo, init?: RequestInit) {
    const apiKey = getApiKey();
    const headers = new Headers(init?.headers || {});
    if (apiKey) {
        // Prefer Authorization header
        headers.set("Authorization", `Bearer ${apiKey}`);
    }
    const combined = { ...init, headers };
    return fetch(input, combined);
}
