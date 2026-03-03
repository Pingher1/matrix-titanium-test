export async function createJob(prompt: string) {
    const res = await fetch(`/api/generate-avatar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error("Failed to create job");
    return res.json(); // { jobId }
}

export async function getJobStatus(jobId: string) {
    const res = await fetch(`/api/job/${encodeURIComponent(jobId)}/status`);
    if (!res.ok) throw new Error("Failed to fetch job status");
    return res.json();
}

export function pollJob(jobId: string, onUpdate: (data: any) => void, onComplete?: (data?: any) => void) {
    let stopped = false;
    const loop = async () => {
        try {
            const data = await getJobStatus(jobId);
            onUpdate(data);
            if ((data.status === "done" || data.status === "failed") && !stopped) {
                onComplete?.(data);
                stopped = true;
                return;
            }
        } catch (err) {
            console.error("poll error", err);
        }
        if (!stopped) setTimeout(loop, 1200);
    };
    loop();
    return () => { stopped = true; };
}
