import { colors, Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
} | {
    type: "pencil";
    points: { x: number; y: number }[];
};

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private scale: number = 1;
    private panX: number = 0;
    private panY: number = 0;
    private selectedTool: Tool = "circle";
    private selectedColor = colors[7];
    private undoStack: Shape[][];
    private redoStack: Shape[][];

    private isDragging: boolean;
    private lastMousePosition: { x: number; y: number };
    private canvasOffset: { x: number; y: number };

    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
        this.undoStack = [];
        this.redoStack = [];
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
        this.isDragging = false;
        this.lastMousePosition = { x: 0, y: 0 };
        this.canvasOffset = { x: 0, y: 0 };
    }

    private saveState() {
        this.undoStack.push([...this.existingShapes]);
        this.redoStack.length = 0; // Clear redo stack on new action
    }

    undo() {
        if (this.undoStack.length > 0) {
            this.redoStack.push([...this.existingShapes]);
            this.existingShapes = this.undoStack.pop()!;
            this.clearCanvas();
        }

        alert("undo");
    }

    redo() {
        if (this.redoStack.length > 0) {
            this.undoStack.push([...this.existingShapes]);
            this.existingShapes = this.redoStack.pop()!;
            this.clearCanvas();
        }

        alert("redo");
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);

        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);

        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);

        this.canvas.removeEventListener("wheel", this.zoomHandler);
    }

    setTool(
        tool:
            | "circle"
            | "pencil"
            | "rect"
            | "clear"
            | "erase"
            | "undo"
            | "redo"
            | "hand"
            | "point"
    ) {
        this.selectedTool = tool;
    }

    setColor(color: string) {
        this.selectedColor.hex = color;
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        console.log(this.existingShapes);
        this.clearCanvas();
    }

    inc() {
        this.scale += 0.2;
        this.clearCanvas();
    }

    dec() {
        this.scale -= 0.2;
        this.clearCanvas();
    }

    zoomHandler = (e: WheelEvent) => {
        e.preventDefault();

        const scaleAmount = -e.deltaY / 200;
        const newScale = this.scale * (1 + scaleAmount);
        if (newScale < 0.1 || newScale > 5) return;

        const mouseX = e.clientX - this.canvas.offsetLeft;
        const mouseY = e.clientY - this.canvas.offsetTop;

        const canvasMouseX = (mouseX - this.panX) / this.scale;
        const canvasMouseY = (mouseY - this.panY) / this.scale;

        this.panX -= canvasMouseX * newScale - canvasMouseX * this.scale;
        this.panY -= canvasMouseY * newScale - canvasMouseY * this.scale;

        this.scale = newScale;
        this.clearCanvas();
    };

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type == "chat") {
                const parsedShape = JSON.parse(message.message);
                this.existingShapes.push(parsedShape.shape);
                this.clearCanvas();
            }
        };
    }

    drawShape(shape: Shape) {
        this.ctx.strokeStyle = this.selectedColor.hex;
        if (shape.type === "rect") {
            this.drawRect(shape);
        } else if (shape.type === "circle") {
            this.drawCircle(shape);
        } else if (shape.type === "pencil") {
            this.drawPencil(shape);
        }
    }

    drawRect(shape: Shape) {
        if (shape.type === "rect") {
            this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
    }

    drawCircle(shape: Shape) {
        if (shape.type === "circle") {
            this.ctx.beginPath();
            this.ctx.arc(
                shape.centerX,
                shape.centerY,
                Math.abs(shape.radius),
                0,
                Math.PI * 2,
            );
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }

    drawPencil(shape: Shape) {
        if (shape.type === "pencil") {
            const points = shape.points;
            this.ctx.beginPath();
            this.ctx.moveTo(points[0].x, points[0].y);
            points.forEach((point) => this.ctx.lineTo(point.x, point.y));
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }

    clearCanvas() {
        this.ctx.save();
        this.ctx.setTransform(
            this.scale,
            0,
            0,
            this.scale,
            this.panX,
            this.panY,
        );
        this.ctx.clearRect(
            -this.panX / this.scale,
            -this.panY / this.scale,
            this.canvas.width / this.scale,
            this.canvas.height / this.scale,
        );
        this.ctx.fillStyle = "rgba(0, 0, 0)";
        this.ctx.fillRect(
            -this.panX / this.scale,
            -this.panY / this.scale,
            this.canvas.width / this.scale,
            this.canvas.height / this.scale,
        );
        //this.ctx.restore();
        this.existingShapes.map((shape) => {
            if (shape.type === "rect") {
                this.ctx.strokeStyle = this.selectedColor.hex;
                this.drawRect(shape);
            } else if (shape.type === "circle") {
                this.drawCircle(shape);
            } else if (shape.type === "pencil") {
                this.drawPencil(shape);
            }
        });
    }

    mouseDownHandler = (e: MouseEvent) => {
        if (this.selectedTool === "hand") {
            this.isDragging = true;
            this.lastMousePosition = { x: e.clientX, y: e.clientY };
        }
        this.clicked = true;
        this.startX = e.clientX;
        this.startY = e.clientY;

        if (this.selectedTool === "pencil") {
            this.existingShapes.push({
                type: "pencil",
                points: [{ x: e.clientX, y: e.clientY }],
            });
        }
    };
    mouseUpHandler = (e: MouseEvent) => {
        this.clicked = false;
        const width = (e.clientX - this.startX) / this.scale;
        const height = (e.clientY - this.startY) / this.scale;
        let shape: Shape | null = null;
        if (this.selectedTool === "hand") {
            this.isDragging = false;
        }
        else if (this.selectedTool === "rect") {
            shape = {
                type: "rect",
                x: (this.startX - this.panX) / this.scale,
                y: (this.startY - this.panY) / this.scale,
                height,
                width,
            };
        } else if (this.selectedTool === "circle") {
            const radius = Math.max(width, height) / 2;
            shape = {
                type: "circle",
                radius: radius,
                centerX: ((this.startX - this.panX) / this.scale) + radius,
                centerY: ((this.startY - this.panY) / this.scale) + radius,
            };
        } else if (this.selectedTool === "pencil") {
            const currentShape =
                this.existingShapes[this.existingShapes.length - 1];
            this.socket.send(JSON.stringify({
                type: "chat",
                message: JSON.stringify({ shape: currentShape }),
                roomId: this.roomId,
            }));
        } else if (this.selectedTool === "erase") {
            this.existingShapes = [];
            this.clearCanvas();
            this.socket.send(JSON.stringify({
                type: "chat",
                message: JSON.stringify({ action: "erase" }),
                roomId: this.roomId,
            }));
            return;
        } else if (this.selectedTool === "clear") {
            this.existingShapes = [];
            this.clearCanvas();
            this.socket.send(JSON.stringify({
                type: "chat",
                message: JSON.stringify({ action: "clear" }),
                roomId: this.roomId,
            }));
        }

        if (!shape) {
            return;
        }

        this.existingShapes.push(shape);

        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape,
            }),
            roomId: this.roomId,
        }));
        this.saveState();
    };
    mouseMoveHandler = (e: MouseEvent) => {
        if (this.clicked && this.selectedTool === "hand" && this.isDragging) {
            const dx = e.clientX - this.lastMousePosition.x;
            const dy = e.clientY - this.lastMousePosition.y;

            // Update canvas offset
            this.canvasOffset.x += dx;
            this.canvasOffset.y += dy;

            // Apply translation to canvas
            this.ctx.translate(dx, dy);

            // Redraw shapes with the new offset
            this.clearCanvas();

            this.lastMousePosition = { x: e.clientX, y: e.clientY };
        }
        if (this.clicked) {
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;

            //console.log(`Mouse Move: X: ${currentX}, Y: ${currentY}`);

            this.clearCanvas();
            if (this.selectedTool === "rect") {
                this.drawRect({
                    type: "rect",
                    x: this.startX,
                    y: this.startY,
                    width: width,
                    height: height,
                });
            } else if (this.selectedTool === "circle") {
                const radius = Math.max(width, height) / 2;

                this.drawCircle({
                    type: "circle",
                    centerX: this.startX + radius,
                    centerY: this.startY + radius,
                    radius,
                });
            } else if (this.selectedTool === "pencil") {
                const currentShape =
                    this.existingShapes[this.existingShapes.length - 1];
                if (currentShape && currentShape.type === "pencil") {
                    currentShape.points.push({ x: e.clientX, y: e.clientY });
                    this.drawPencil(currentShape);
                }
            }
        }
    };

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);

        this.canvas.addEventListener("mouseup", this.mouseUpHandler);

        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);

        this.canvas.addEventListener("wheel", this.zoomHandler);
    }
}
