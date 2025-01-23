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
    Moon,
    Sun,
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
    | "text"
    | "select";

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
];

export type Theme = "rgb(24, 24, 27)" | "rgb(255, 255, 255)";

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
    const [theme, setTheme] = useState<Theme>("rgb(24, 24, 27)");
    //const [strokeWidth, setStrokeWidth] = useState<number>(1);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "rgb(24, 24, 27)" ? "rgb(255, 255, 255)" : "rgb(24, 24, 27)"));
    };

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
            if (selectedTool === "text") {
                canvasRef.current.className = "cursor-text";
            }
            const cursorClass = `cursor-${selectedTool}`;
            canvasRef.current.className = cursorClass;
        }
    }, [selectedTool]);

    useEffect(() => {
        game?.setTheme(theme);
    }, [theme, game]);

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
                    className="custom-cursor bg-zinc-800"
                >
                </canvas>
                <Topbar
                    setSelectedTool={setSelectedTool}
                    selectedTool={selectedTool}
                    setSelectedColor={setSelectedColor}
                    selectedColor={selectedColor}
                    theme={theme}
                    setTheme={setTheme}
                />
                <div style={{
                    position: "fixed",
                    top: 15,
                    right: 15,
                }}>
                    <button onClick={toggleTheme} className={`p-2 rounded-md ${theme === "rgb(24, 24, 27)" ? "text-gray-100" : "text-black"} transition-colors duration-300`}>
                        {theme === "rgb(24, 24, 27)" ? <Moon /> : <Sun />}
                    </button>
                </div>
            </div>
            <>
                {/* Undo/Redo Section */}
                <div
                    style={{
                        position: "fixed",
                        bottom: 21,
                        left: "50%",
                        transform: "translateX(-50%)",
                    }}
                    className="text-gray-400 bg-zinc-900 rounded-md p-2 flex items-center justify-center gap-5 max-w-auto sm:bottom-16 sm:left-5 sm:translate-x-0 cursor-pointer"
                >
                    <button
                        onClick={handleUndo}
                        type="button"
                        className="cursor-pointer text-gray-200 hover:text-indigo-400 pl-2"
                    >
                        <Undo2 />
                    </button>
                    <span className="text-sm text-zinc-600">|</span>
                    <button
                        onClick={handleRedo}
                        type="button"
                        className="cursor-pointer text-gray-200 hover:text-indigo-300 pr-2"
                    >
                        <Redo2 />
                    </button>
                </div>

                {/* Zoom Controls */}
                <div
                    style={{
                        padding: "10px",
                        borderRadius: "10px",
                    }}
                    className="fixed bottom-15 left-10% transform -translate-x-1/2 bg-zinc-900 text-white/80 rounded-lg flex items-center justify-center gap-4 max-w-auto sm:bottom-5 sm:left-5 sm:translate-x-0"
                >
                    <button
                        onClick={decreaseZoom}
                        type="button"
                        className="pl-4 pr-4 cursor-pointer"
                    >
                        <Minus />
                    </button>
                    <p className="text-sm">{zoom}%</p>
                    <button
                        onClick={increaseZoom}
                        type="button"
                        className="pl-4 pr-4 cursor-pointer"
                    >
                        <Plus />
                    </button>
                </div>
            </>
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
                className="p-2.5 border-2 border-dashed border-gray-600 rounded-full"
                style={{ backgroundColor: selectedColor }}
                onClick={() => setShowDropdown((prev) => !prev)}
            >
                {/* The button displays the selected color */}
            </button>
            {/* Dropdown menu */}
            {showDropdown && (
                <div className="absolute top-full mt-6 left-0 bg-zinc-900 shadow rounded-sm z-10">
                    <ul className="flex space-x-2 p-2">
                        {colors.map((color) => (
                            <li
                                key={color}
                                className="w-5 h-5 rounded-full cursor-pointer"
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorSelect(color)} // Handle color selection
                                title={color.toString()} // Tooltip to show color hex code
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
        theme,
        setTheme,
    }: {
        selectedTool: Tool;
        setSelectedTool: (s: Tool) => void;
        selectedColor: Color;
        setSelectedColor: (s: Color) => void;
        theme: Theme;
        setTheme: (s: Theme) => void;
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
            {/* Main Toolbar */}
            <div
                style={{
                    position: "fixed",
                    top: 10,
                    left: "50%",
                    transform: "translateX(-50%)",
                }}
                className={`${theme === "rgb(24, 24, 27)"? "bg-zinc-800": "bg-white"} flex gap-2 items-center justify-center shadow-lg bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-90 rounded-lg px-4 py-2 text-xs font-mono sm:flex-wrap sm:justify-start sm:left-5 sm:top-5`}
            >
                {/* Tool Icons */}
                <IconButton
                    onClick={() => {
                        setSelectedTool("point");
                    }}
                    activated={selectedTool === "point"}
                    icon={<MousePointer2 />}
                    className="hidden sm:inline-block"
                />

                <IconButton
                    onClick={() => {
                        setSelectedTool("select");
                    }}
                    activated={selectedTool === "select"}
                    icon={<SquareDashedMousePointer />}
                    className="hidden sm:inline-block"
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
                />

                <IconButton
                    onClick={() => {
                        setSelectedTool("circle");
                    }}
                    activated={selectedTool === "circle"}
                    icon={<Circle />}
                />

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
                />

                <IconButton
                    onClick={() => {
                        setSelectedTool("text");
                    }}
                    activated={selectedTool === "text"}
                    icon={<TypeOutline />}
                    className="hidden sm:inline-block"
                />

                <span className="opacity-50 text-gray-300">|</span>

                <IconButton
                    onClick={() => {
                        setSelectedTool("clear");
                    }}
                    activated={selectedTool === "clear"}
                    icon={<Trash2 />}
                />
                {/* Collaboration Button */}
                <button
                    onClick={handleCopy}
                    className={`p-2 rounded-md ${
                        collaborativeMode ? "bg-green-600" : "bg-none"
                    } transition-colors duration-300`}
                >
                    <UsersRound className={`${theme === "rgb(24, 24, 27)" ? "text-gray-100" : "text-gray-400"}`} />
                </button>
            </div>
        </>
    );
}
