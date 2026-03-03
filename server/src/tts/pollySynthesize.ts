import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs-extra";
import path from "path";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const REGION = process.env.AWS_REGION || "us-west-2";
const BUCKET = process.env.S3_BUCKET || "kronos-avatar-assets";
const polly = new PollyClient({ region: REGION });
const s3 = new S3Client({ region: REGION });

async function streamToBuffer(stream: any) {
    return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
        stream.on("error", (err: Error) => reject(err));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
}

/**
 * Synthesize one page text to mp3 + speechMarks, upload to S3, return { audioUrl, speechMarks }
 * voice: Polly voice id (e.g., "Joanna", "Matthew", any neural voice)
 * ssml: boolean - if true, text is treated as SSML */
export async function synthesizePageToS3({ storyId, pageId, text, voice = "Joanna", ssml = false, s3Prefix = "stories" }:
    { storyId: string; pageId: string; text: string; voice?: string; ssml?: boolean; s3Prefix?: string }) {

    const contentType = ssml ? "ssml" : "text";
    const ssmlText = ssml ? text : `<speak>${escapeForSSML(text)}</speak>`;
    const uid = uuidv4();
    const audioKey = `${s3Prefix}/${storyId}/audio/${pageId}.${uid}.mp3`;
    const marksKey = `${s3Prefix}/${storyId}/audio/${pageId}.${uid}.speechmarks.json`;

    const audioCmd = new SynthesizeSpeechCommand({
        OutputFormat: "mp3",
        TextType: "ssml",
        Text: ssmlText,
        VoiceId: voice as any,
        Engine: "neural"
    });

    const marksCmd = new SynthesizeSpeechCommand({
        OutputFormat: "json",
        SpeechMarkTypes: ["word"],
        TextType: "ssml",
        Text: ssmlText,
        VoiceId: voice as any,
        Engine: "neural"
    });

    const [audioResp, marksResp] = await Promise.all([polly.send(audioCmd), polly.send(marksCmd)]);

    const audioBuffer = await streamToBuffer(audioResp.AudioStream as any);
    const marksBuffer = await streamToBuffer(marksResp.AudioStream as any);

    await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: audioKey,
        Body: audioBuffer,
        ContentType: "audio/mpeg",
        ACL: "public-read"
    }));

    await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: marksKey,
        Body: marksBuffer,
        ContentType: "application/json",
        ACL: "public-read"
    }));

    const marksText = marksBuffer.toString("utf8").trim();
    const lines = marksText.split("\n").filter(Boolean);
    const marks = lines.map((ln, idx) => {
        try {
            const j = JSON.parse(ln);
            const time = Number(j.time ?? j.ms ?? 0);
            return { time, value: j.value ?? j.word ?? "", index: idx };
        } catch (err) {
            return null;
        }
    }).filter(Boolean);

    const audioUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${encodeURIComponent(audioKey)}`;
    const marksUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${encodeURIComponent(marksKey)}`;

    return {
        pageId,
        audioUrl,
        marksUrl,
        speechMarks: marks
    };
}

function escapeForSSML(text: string) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
