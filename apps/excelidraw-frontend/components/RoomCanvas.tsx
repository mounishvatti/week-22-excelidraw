"use client";

import { WS_URL } from "@/config";
import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId }: { roomId: string }) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    const tokenValStore = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=${tokenValStore}`);

        ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({
                type: "join_room",
                roomId,
            });
            console.log(data);
            ws.send(data);
        };
    }, []);

    if (!socket) {
        return (
            <div className="flex justify-center items-center h-full">
                Connecting to server....
            </div>
        );
    }

    return (
        <div>
            <Canvas roomId={roomId} socket={socket} />
        </div>
    );
}
