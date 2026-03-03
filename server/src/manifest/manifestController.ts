import { Request, Response } from "express";

export function getManifestHandler(req: Request, res: Response) {
    // Sample manifest representing available toys/rooms/outfits
    res.json({
        assets: [
            {
                id: "toy_mohawk_rocker",
                type: "glb",
                title: "Mohawk Rockstar Outfit",
                description: "Stylized mohawk outfit for avatar, gray leather jacket, skinny jeans.",
                price_usd: 4.99,
                cdnUrl: "https://cdn.example.com/barbie/toys/toy_mohawk_rocker.v1.glb",
                thumbnail: "https://cdn.example.com/barbie/thumbs/toy_mohawk_rocker.jpg",
                available: false,
                tags: ["outfit", "rock", "mohawk"]
            },
            {
                id: "room_dreamhouse_living",
                type: "room",
                title: "Dreamhouse Living Room",
                description: "Interactive living room environment with soft pink hues.",
                price_usd: 0,
                cdnUrl: "https://cdn.example.com/barbie/rooms/room_dreamhouse_living.glb",
                thumbnail: "https://cdn.example.com/barbie/thumbs/room_thumb.jpg",
                available: true,
                tags: ["room", "dreamhouse", "free"]
            }
        ]
    });
}
