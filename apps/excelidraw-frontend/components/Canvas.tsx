import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { useRouter } from "next/navigation";
import {
    AlignJustify,
    Diamond,
    Eraser,
    Grab,
    Hand,
    Minus,
    Moon,
    MousePointer,
    MousePointer2,
    MoveRight,
    Plus,
    Redo2,
    SquareDashedMousePointer,
    Sun,
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
    | "text"
    | "select"
    | "line"
    | "arrow"
    | "rhombus";

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
    const [sidebarClicked, setSidebarClicked] = useState(false);
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
                <div
                    style={{
                        position: "fixed",
                        top: 15,
                        left: 15,
                    }}
                >
                    <button
                        onClick={() => {
                            setSidebarClicked((prev) => !prev)
                            setTimeout(() => {
                                setSidebarClicked(false); // Automatically close after 10 seconds
                            }, 10000); // 10 seconds delay
                        }}
                        className={`${
                            theme === "rgb(24, 24, 27)"
                                ? "text-gray-300 bg-zinc-800"
                                : "text-gray-600 bg-zinc-100"
                        } p-2 rounded-md`}
                        title="Sidebar"
                    >
                        <AlignJustify size={16} />
                    </button>
                    {sidebarClicked && (
                        <div className={`mt-2 ${theme==="rgb(24, 24, 27)"? "bg-zinc-800" : "bg-zinc-50"} p-2 rounded-md shadow-md`}>
                            <div>
                                <ColorSelector
                                    selectedColor={selectedColor}
                                    setSelectedColor={setSelectedColor}
                                    theme={theme}
                                    setTheme={setTheme}
                                    title="Color"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <p
                                    className={`${
                                        theme === "rgb(24, 24, 27)"
                                            ? "text-zinc-400"
                                            : "text-zinc-600"
                                    } text-sm font-sans`}
                                >
                                    Theme:
                                </p>

                                <div className="flex gap-2 p-1">
                                    <button
                                        className={`${
                                            theme === "rgb(24, 24, 27)"
                                                ? "text-zinc-300"
                                                : "text-zinc-50 bg-indigo-500/60 p-0.5 rounded-sm"
                                        }`}
                                        onClick={()=> setTheme("rgb(255, 255, 255)")}
                                        title="Light"
                                    >
                                        <Sun size={16} />
                                    </button>
                                    <button
                                        className={`${
                                            theme === "rgb(24, 24, 27)"
                                                ? "text-zinc-300 bg-indigo-500/60 p-0.5 rounded-sm"
                                                : "text-zinc-600"
                                        }`}
                                        onClick={()=> setTheme("rgb(24, 24, 27)")}
                                        title="Dark"
                                    >
                                        <Moon size={16}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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
                    className={`${
                        theme === "rgb(24, 24, 27)"
                            ? "bg-zinc-800 text-zinc-300"
                            : "bg-white text-zinc-600"
                    } rounded-md p-2 flex shadow-md items-center justify-center gap-5 max-w-auto sm:bottom-16 sm:left-5 sm:translate-x-0 cursor-pointer`}
                >
                    <button
                        onClick={handleUndo}
                        type="button"
                        className="cursor-pointer hover:text-indigo-400 pl-2"
                        title="Undo"
                    >
                        <Undo2 size={16}/>
                    </button>
                    <span className="text-sm text-zinc-300">|</span>
                    <button
                        onClick={handleRedo}
                        type="button"
                        className="cursor-pointer hover:text-indigo-300 pr-2"
                        title="Redo"
                    >
                        <Redo2 size={16}/>
                    </button>
                </div>

                {/* Zoom Controls */}
                <div
                    style={{
                        padding: "10px",
                        borderRadius: "10px",
                    }}
                    className={`fixed bottom-15 left-10% transform -translate-x-1/2 ${
                        theme === "rgb(24, 24, 27)"
                            ? "bg-zinc-800 text-white/80"
                            : "bg-white text-zinc-500"
                    } shadow-md rounded-lg flex items-center justify-center gap-4 max-w-auto sm:bottom-5 sm:left-5 sm:translate-x-0`}
                >
                    <button
                        onClick={decreaseZoom}
                        type="button"
                        className="pl-4 pr-4 cursor-pointer"
                    >
                        <Minus size={20}/>
                    </button>
                    <p className="text-xs">{zoom}%</p>
                    <button
                        onClick={increaseZoom}
                        type="button"
                        className="pl-4 pr-4 cursor-pointer"
                    >
                        <Plus size={20}/>
                    </button>
                </div>
            </>
        </>
    );
}

function ColorSelector({
    selectedColor,
    setSelectedColor,
    theme,
    setTheme,
    title,
}: {
    selectedColor: Color;
    setSelectedColor: (s: Color) => void;
    theme: Theme;
    setTheme: (s: Theme) => void;
    title?: string;
}) { // Default color is Gray
    const [showDropdown, setShowDropdown] = useState(false);

    const handleColorSelect = (color: Color) => {
        setSelectedColor(color);
        setShowDropdown(false);
    };

    return (
        <div className="relative inline-block">
            <div className="flex gap-2 items-center">
                <p
                    className={`${
                        theme === "rgb(24, 24, 27)"
                            ? "text-zinc-400"
                            : "text-zinc-600"
                    } text-sm`}
                >
                    Choose a color:
                </p>
                <button
                    className="p-2 rounded-sm border border-zinc-400"
                    style={{ backgroundColor: selectedColor }}
                    onClick={() => setShowDropdown((prev) => !prev)}
                    title={title}
                >
                    {/* The button displays the selected color */}
                </button>
            </div>
            {/* Dropdown to select color */}
            {showDropdown && (
                <div
                    className={`absolute top-full left-0 shadow-md rounded-sm z-10 ${
                        theme === "rgb(24, 24, 27)" ? "bg-zinc-800" : "bg-zinc-50"
                    }`}
                >
                    <ul className="grid grid-cols-4 gap-2 p-2">
                        {colors.map((color) => (
                            <li
                                key={color}
                                className="w-4 h-4 rounded-sm cursor-pointer border border-zinc-400"
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
                className={`${
                    theme === "rgb(24, 24, 27)" ? "bg-zinc-800" : "bg-white"
                } flex gap-2 items-center justify-center shadow-lg bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-90 rounded-lg px-4 py-1 text-xs font-mono sm:flex-wrap sm:justify-start sm:left-5 sm:top-5`}
            >
                {/* Tool Icons */}
                <IconButton
                    onClick={() => {
                        setSelectedTool("point");
                    }}
                    activated={selectedTool === "point"}
                    icon={<MousePointer2 size={16} />}
                    className="hidden sm:inline-block"
                    title="Pointer"
                />

                <IconButton
                    onClick={() => {
                        setSelectedTool("select");
                    }}
                    activated={selectedTool === "select"}
                    icon={<SquareDashedMousePointer size={16} />}
                    className="hidden sm:inline-block"
                    title="Select"
                />

                <IconButton
                    onClick={() => {
                        setSelectedTool("hand");
                    }}
                    activated={selectedTool === "hand"}
                    icon={<Hand size={16} />}
                    title="Grab"
                />

                <IconButton
                    onClick={() => {
                        setSelectedTool("rect");
                    }}
                    activated={selectedTool === "rect"}
                    icon={<Square size={16} />}
                    title="Rectangle"
                />

                <IconButton
                    onClick={() => {
                        setSelectedTool("rhombus");
                    }}
                    activated={selectedTool === "rhombus"}
                    icon={<Diamond size={16} />}
                    title="Rhombus"
                />

                <IconButton
                    onClick={() => {
                        setSelectedTool("circle");
                    }}
                    activated={selectedTool === "circle"}
                    icon={<Circle size={16} />}
                    title="Circle"
                />

                <IconButton
                    onClick={() => {
                        setSelectedTool("line");
                    }}
                    activated={selectedTool === "line"}
                    icon={<Minus size={16} />}
                    title="Line"
                />

                <IconButton
                    onClick={() => {
                        setSelectedTool("arrow");
                    }}
                    activated={selectedTool === "arrow"}
                    icon={<MoveRight size={16} />}
                    title="Arrow"
                />

                <IconButton
                    onClick={() => {
                        setSelectedTool("pencil");
                    }}
                    activated={selectedTool === "pencil"}
                    icon={<Pencil size={16} />}
                    title="Pencil"
                />

                <IconButton
                    onClick={() => {
                        setSelectedTool("erase");
                    }}
                    activated={selectedTool === "erase"}
                    icon={<Eraser size={16} />}
                    title="Erase"
                />

                <IconButton
                    onClick={() => {
                        setSelectedTool("text");
                    }}
                    activated={selectedTool === "text"}
                    icon={<TypeOutline size={16} />}
                    className="hidden sm:inline-block"
                    title="Text"
                />

                <span className="opacity-50 text-gray-300">|</span>

                <IconButton
                    onClick={() => {
                        setSelectedTool("clear");
                    }}
                    activated={selectedTool === "clear"}
                    icon={<Trash2 size={16} />}
                    title="Clear canvas"
                />
                {/* Collaboration Button */}
                <button
                    onClick={handleCopy}
                    className={`p-2 rounded-md ${
                        collaborativeMode ? "bg-green-600" : "bg-none"
                    } transition-colors duration-300`}
                    title="Collaborative mode"
                >
                    <UsersRound
                        size={16}
                        className={`${
                            theme === "rgb(24, 24, 27)"
                                ? "text-zinc-400"
                                : "text-zinc-500"
                        }`}
                    />
                </button>
            </div>
        </>
    );
}
