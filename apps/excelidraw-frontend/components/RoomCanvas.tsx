"use client";

import { WS_URL } from "@/config";
import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId }: { roomId: string }) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    let tokenVal = null;

    if (typeof window !== "undefined") {
        tokenVal = window.localStorage.getItem("token");
    }

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=${tokenVal}`);

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
            <div>
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
