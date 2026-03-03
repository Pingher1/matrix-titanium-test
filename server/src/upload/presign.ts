import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { Request, Response } from "express";

const REGION = process.env.AWS_REGION || "us-west-2";
const BUCKET = process.env.S3_BUCKET || "kronos-avatar-assets";

const s3 = new S3Client({ region: REGION });

export async function createPresignHandler(req: Request, res: Response) {
    try {
        const { filename, contentType } = req.body;
        if (!filename || !contentType) {
            return res.status(400).json({ error: "Missing filename or contentType" });
        }

        const key = `uploads/pending/${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

        const { url, fields } = await createPresignedPost(s3, {
            Bucket: BUCKET,
            Key: key,
            Conditions: [
                ["content-length-range", 0, 52428800], // 50MB max
                ["eq", "$Content-Type", contentType]
            ],
            Fields: {
                "Content-Type": contentType
            },
            Expires: 300 // 5 minutes
        });

        res.json({ url, fields, key });
    } catch (error) {
        console.error("Presign error:", error);
        res.status(500).json({ error: "Failed to generate presigned upload" });
    }
}
