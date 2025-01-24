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

    const tokenVal1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyYmQ0MmIwOC04YzU5LTRmZjEtODUzNC00ODJhM2E0NzJmYjkiLCJpYXQiOjE3Mzc0NDA1NDh9.Dyve9vkreAbW1dMe0zIoEsvK_N3hUjHQC6yPVMB1POQ"

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=${tokenVal1}`);

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
