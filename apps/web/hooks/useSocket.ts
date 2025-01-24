import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>();

    const tokenVal = localStorage.getItem("token");

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=${tokenVal}`); // replace tokenVal1 with tokenValStore
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