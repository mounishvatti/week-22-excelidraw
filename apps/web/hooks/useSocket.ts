import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";
import { cookies } from "next/headers";

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>();

    const tokenVal = localStorage.getItem("token");

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=${tokenVal}`);
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
    }, []);

    return {
        socket,
        loading
    }

}