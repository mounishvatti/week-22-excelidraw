import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { useRouter } from "next/navigation";
import {
    Eraser,
    Grab,
    Hand,
    Minus,
    MousePointer,
    MousePointer2,
    Plus,
    Redo2,
    SquareDashedMousePointer,
    Trash2,
    TypeOutline,
    Undo2,
    UsersRound,
    ZoomIn,
    ZoomOut,
} from "lucide-react";
import { Circle, Pencil, Square } from "lucide-react";
import { Game } from "@/draw/Game";
import { toast } from "react-toastify";

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
    | "text";

export type Color =
    | "#7a7a7a"
    | "#ffa6a6"
    | "#a6ffa6"
    | "#a6a6ff"
    | "#ffffa6"
    | "#ffa6ff"
    | "#a6ffff"
    | "#ffffff";


const colors: Color[] = [
    "#7a7a7a", // Black
    "#ffa6a6", // Red
    "#a6ffa6", // Green
    "#a6a6ff", // Blue
    "#ffffa6", // Yellow
    "#ffa6ff", // Magenta
    "#a6ffff", // Cyan    
    "#ffffff", // White
]   

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
    const [selectedColor, setSelectedColor] = useState<Color>("#ffffff");
    //const [strokeWidth, setStrokeWidth] = useState<number>(1);

    const handleUndo = () => {
        game?.undo();
    };

    const handleRedo = () => {
        game?.redo();
    };

    const increaseZoom = () => {
        setZoom(zoom + 2);
        game?.inc();
    };

    const decreaseZoom = () => {
        setZoom(zoom - 2);
        game?.dec();
    };

    // Update the canvas cursor when the selected tool changes
    useEffect(() => {
        if (canvasRef.current) {
            if(selectedTool === "text") {
                canvasRef.current.className = "cursor-text";
            }
            const cursorClass = `cursor-${selectedTool}`;
            canvasRef.current.className = cursorClass;
        }
    }, [selectedTool]);

    useEffect(() => {
        game?.setColor(selectedColor);
    }, [selectedColor, game]);

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

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };
    
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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
                    setSelectedColor={setSelectedColor}
                    selectedColor={selectedColor}
                />
            </div>
            <div
                style={{
                    position: "fixed",
                    bottom: 26,
                    left: "20%",
                    transform: "translateX(-50%)",
                }}
                className=" text-gray-400 rounded-sm flex items-center justify-center max-w-auto gap-5"
            >
                <button
                    onClick={handleUndo}
                    type="button"
                    className="cursor-pointer text-gray-200 hover:text-indigo-400"
                >
                    <Undo2 />
                </button>
                <span className="text-sm text-zinc-600">|</span>
                <button
                    onClick={handleRedo}
                    type="button"
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

function ColorSelector({
    selectedColor,
    setSelectedColor,
}: {
    selectedColor: Color;
    setSelectedColor: (s: Color) => void;

}) { // Default color is Gray
    const [showDropdown, setShowDropdown] = useState(false);

    const handleColorSelect = (color: Color) => {
        setSelectedColor(color);
        setShowDropdown(false);
    };

    return (
        <div className="relative inline-block">
            <button
                className="p-2 rounded-full border"
                style={{ backgroundColor: selectedColor }}
                onClick={() => setShowDropdown((prev) => !prev)}
            >
                {/* The button displays the selected color */}
            </button>
            {/* Dropdown menu */}
            {showDropdown && (
                <div className="absolute top-full mt-6 left-0 bg-zinc-900 shadow rounded z-10">
                    <ul className="flex space-x-2 p-2">
                        {colors.map((color) => (
                            <li
                                key={color}
                                className="w-6 h-6 rounded-full cursor-pointer"
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorSelect(color)} // Handle color selection
                                title={color} // Tooltip to show color hex code
                            >
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function Topbar(
    {
        selectedTool,
        setSelectedTool,
        selectedColor,
        setSelectedColor,
    }: {
        selectedTool: Tool;
        setSelectedTool: (s: Tool) => void;
        selectedColor: Color;
        setSelectedColor: (s: Color) => void;
    },
) {
    const [isCopied, setIsCopied] = useState(false);
    const [collaborativeMode, setCollaborativeMode] = useState(false);

    const handleCopy = () => {
        const currentUrl = window.location.href; // Get the current URL
        navigator.clipboard.writeText(currentUrl) // Copy URL to clipboard
            .then(() => {
                toast.success("URL copied to clipboard!");
                setIsCopied(true); // Set the copied state to true
                setCollaborativeMode(true);
                setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
            })
            .catch((err) => console.error("Failed to copy URL:", err));
    };
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
                        icon={<MousePointer2 />}
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

                    <ColorSelector
                        selectedColor={selectedColor}
                        setSelectedColor={setSelectedColor}
                    />

                    <IconButton
                        onClick={() => {
                            setSelectedTool("erase");
                        }}
                        activated={selectedTool === "erase"}
                        icon={<Eraser />}
                    >
                    </IconButton>

                    <IconButton
                        onClick={() => {
                            setSelectedTool("text");
                        }}
                        activated={selectedTool === "text"}
                        icon={<TypeOutline />}
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

                    <span className="opacity-50 text-gray-200">|</span>

                    <button
                        onClick={handleCopy}
                        className={`p-2 rounded ${
                            collaborativeMode
                                ? "bg-indigo-500/60"
                                : "bg-transparent"
                        } transition-colors duration-300`}
                    >
                        <UsersRound className="text-gray-200" />
                    </button>
                </div>
            </div>
        </>
    );
}
