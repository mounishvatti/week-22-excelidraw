import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import {
    Eraser,
    Grab,
    Hand,
    Minus,
    MousePointer,
    Plus,
    Redo2,
    SquareDashedMousePointer,
    Trash2,
    Undo2,
    ZoomIn,
    ZoomOut,
} from "lucide-react";
import { Circle, Pencil, Square } from "lucide-react";
import { Game } from "@/draw/Game";

export type Tool =
    | "circle"
    | "rect"
    | "pencil"
    | "clear"
    | "erase"
    | "undo"
    | "redo"
    | "hand"
    | "point"
    ;

export const colors = [
    { hex: "#000000", name: "Black" },
    { hex: "#ff0000", name: "Red" },
    { hex: "#00ff00", name: "Green" },
    { hex: "#0000ff", name: "Blue" },
    { hex: "#ffff00", name: "Yellow" },
    { hex: "#ff00ff", name: "Magenta" },
    { hex: "#00ffff", name: "Cyan" },
    { hex: "#ffffff", name: "White" },
];

export function Canvas({
    roomId,
    socket,
}: {
    socket: WebSocket;
    roomId: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [zoom, setZoom] = useState(75);
    const [selectedTool, setSelectedTool] = useState<Tool>("circle");
    const [selectedColor, setSelectedColor] = useState(colors[0]);
    const [strokeWidth, setStrokeWidth] = useState<number>(1);

    const handleUndo = () => {
        game?.undo();
    };

    const handleRedo = () => {
        game?.redo();
    };

    const increaseZoom = () => {
        setZoom(zoom + 2);
        game?.inc();
    }

    const decreaseZoom = () => {
        setZoom(zoom - 2);
        game?.dec();
    }

    // Update the canvas cursor when the selected tool changes
    useEffect(() => {
        if (canvasRef.current) {
            const cursorClass = `cursor-${selectedTool}`;
            canvasRef.current.className = cursorClass;
        }
    }, [selectedTool]);

    useEffect(() => { 
        game?.setTool(selectedTool);
    }, [selectedTool, game]);
    
    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);

            return () => {
                g.destroy();
            };
        }
    }, [canvasRef]);

    return (
        <>
            <div
                style={{
                    height: "100vh",
                    overflow: "hidden",
                }}
            >
                <canvas
                    ref={canvasRef}
                    width={window.innerWidth}
                    height={window.innerHeight}
                    className="custom-cursor"
                >
                </canvas>
                <Topbar
                    setSelectedTool={setSelectedTool}
                    selectedTool={selectedTool}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    strokeWidth={strokeWidth}
                    setStrokeWidth={setStrokeWidth}
                />
            </div>
            <div style={{
                position: "fixed",
                bottom: 26,
                left: "20%",
                transform: "translateX(-50%)",
            }}
                className=" text-gray-400 rounded-sm flex items-center justify-center max-w-auto gap-5"
            >
                <button onClick={handleUndo} type="button"
                    className="cursor-pointer text-gray-200 hover:text-indigo-400"
                >
                    <Undo2 />
                </button>
                <span className="text-sm text-zinc-600"> | </span>
                <button onClick={handleRedo} type="button"
                    className="cursor-pointer text-gray-200 hover:text-indigo-300"
                >
                    <Redo2 />
                </button>
            </div>
            <div
                style={{
                    position: "fixed",
                    bottom: 15,
                    left: "10%",
                    transform: "translateX(-50%)",
                    padding: "10px",
                    borderRadius: "10px",
                }}
                className="bg-zinc-900 text-white/80 rounded-lg flex items-center justify-center gap-4 max-w-auto"
            >
                <button
                    onClick={decreaseZoom}
                    type="button"
                    className="pl-4 pr-4 cursor-pointer"
                >
                    <Minus />
                </button>
                <p className="text-sm">
                    {zoom}%
                </p>
                <button
                    onClick={increaseZoom}
                    type="button"
                    className="pl-4 pr-4 cursor-pointer"
                >
                    <Plus />
                </button>
            </div>
        </>
    );
}

function Topbar(
    {
        selectedTool,
        setSelectedTool,
        selectedColor,
        setSelectedColor,
        strokeWidth,
        setStrokeWidth,
    }: {
        selectedTool: Tool;
        setSelectedTool: (s: Tool) => void;
        selectedColor: { hex: string; name: string };
        setSelectedColor: (s: { hex: string; name: string }) => void;
        strokeWidth: number;
        setStrokeWidth: (s: number) => void;
    },
) {
    return (
        <>
            <div
                style={{
                    position: "fixed",
                    top: 10,
                    left: "50%",
                    transform: "translateX(-50%)",
                }}
            >
                <div className="flex gap-2 items-center justify-center bg-zinc-900 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-90 rounded-lg px-4 py-2 text-xs font-mono">
                <IconButton
                        onClick={() => {
                            setSelectedTool("point");
                        }}
                        activated={selectedTool === "point"}
                        icon={<MousePointer />}
                    />

                    <IconButton
                        onClick={() => {
                            setSelectedTool("hand");
                        }}
                        activated={selectedTool === "hand"}
                        icon={<Hand />}
                    />


                    <IconButton
                        onClick={() => {
                            setSelectedTool("pencil");
                        }}
                        activated={selectedTool === "pencil"}
                        icon={<Pencil />}
                    />
                    <IconButton
                        onClick={() => {
                            setSelectedTool("rect");
                        }}
                        activated={selectedTool === "rect"}
                        icon={<Square />}
                    >
                    </IconButton>

                    <IconButton
                        onClick={() => {
                            setSelectedTool("circle");
                        }}
                        activated={selectedTool === "circle"}
                        icon={<Circle />}
                    >
                    </IconButton>

                    <IconButton
                        onClick={() => {
                            setSelectedTool("erase");
                        }}
                        activated={selectedTool === "erase"}
                        icon={<Eraser />}
                    >
                    </IconButton>

                    <span className="opacity-50 text-gray-300">|</span>

                    <IconButton
                        onClick={() => {
                            setSelectedTool("clear");
                        }}
                        activated={selectedTool === "clear"}
                        icon={<Trash2 />}
                    >
                    </IconButton>
                </div>
            </div>
        </>
    );
}
