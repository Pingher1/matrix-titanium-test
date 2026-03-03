import { GLTFExporter } from "three-stdlib";
import type { Object3D } from "three";

export async function exportGLBAndUpload(root: Object3D, fileName = "avatar.glb") {
    const exporter = new GLTFExporter();
    const options = { binary: true };

    const arrayBuffer: ArrayBuffer = await new Promise((resolve, reject) => {
        exporter.parse(
            root,
            (result) => {
                if (result instanceof ArrayBuffer) return resolve(result);
                try {
                    const str = JSON.stringify(result);
                    resolve(new TextEncoder().encode(str).buffer);
                } catch (e) {
                    reject(e);
                }
            },
            (err) => reject(err),
            options
        );
    });

    const presignRes = await fetch("/api/presign-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, contentType: "model/gltf-binary" }),
    });
    if (!presignRes.ok) throw new Error("Failed to get presign");
    const { uploadUrl, publicUrl } = await presignRes.json();

    const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "model/gltf-binary" },
        body: arrayBuffer,
    });
    if (!putRes.ok) throw new Error("Upload failed");

    return { publicUrl };
}
