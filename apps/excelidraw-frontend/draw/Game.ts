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
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);

        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);

        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);

        this.canvas.removeEventListener("wheel", this.zoomHandler);
    }

    setTool(tool: "circle" | "pencil" | "rect") {
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

    zoomHandler = (e: WheelEvent) => {
        e.preventDefault();

        const scaleAmount = -e.deltaY / 500;
        const newScale = this.scale * (1 + scaleAmount); 
        if (newScale < 0.1 || newScale > 5) return; 
    
        const mouseX = e.clientX - this.canvas.offsetLeft;
        const mouseY = e.clientY - this.canvas.offsetTop;
        
        const canvasMouseX = (mouseX - this.panX) / this.scale;
        const canvasMouseY = (mouseY - this.panY) / this.scale;
    
        this.panX -= (canvasMouseX * newScale - canvasMouseX * this.scale);
        this.panY -= (canvasMouseY * newScale - canvasMouseY * this.scale);
    
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
        this.ctx.setTransform(this.scale, 0, 0, this.scale, this.panX, this.panY);
        this.ctx.clearRect(-this.panX/ this.scale, -this.panY/this.scale, this.canvas.width/this.scale, this.canvas.height/this.scale);
        this.ctx.fillStyle = "rgba(0, 0, 0)";
        this.ctx.fillRect(-this.panX/this.scale, -this.panY/this.scale, this.canvas.width/this.scale, this.canvas.height/this.scale);

        this.existingShapes.map((shape) => {
            if (shape.type === "rect") {
                this.ctx.strokeStyle = this.selectedColor.hex;
                this.drawRect(shape);
            } else if (shape.type === "circle") {
                this.drawCircle(shape);
            } else if (shape.type === "pencil") {
                this.ctx.beginPath();
                const points = shape.points;
                this.ctx.moveTo(points[0].x, points[0].y);
                for (const point of points) {
                    this.ctx.lineTo(point.x, point.y);
                }
                this.ctx.stroke();
                this.ctx.closePath();
            }
        });
    }

    mouseDownHandler = (e: MouseEvent) => {
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

        const selectedTool = this.selectedTool;
        const color = this.selectedColor.hex;
        let shape: Shape | null = null;
        if (this.selectedTool === "rect") {
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
    };
    mouseMoveHandler = (e: MouseEvent) => {
        if (this.clicked) {
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;
            this.clearCanvas();
            this.ctx.strokeStyle = this.selectedColor.hex;
            const selectedTool = this.selectedTool;
            console.log(selectedTool);

            if (this.selectedTool === "rect") {
                this.drawRect({
                    type: "rect",
                    x: this.startX,
                    y: this.startY,
                    width,
                    height,
                });
            } else if (selectedTool === "circle") {
                const radius = Math.max(width, height) / 2;

                this.drawCircle({
                    type: "circle",
                    centerX: this.startX + radius,
                    centerY: this.startY + radius,
                    radius,
                });
            } else if (selectedTool === "pencil") {
                const currentShape = this.existingShapes[this.existingShapes.length - 1] as Shape;
                (currentShape as { type: "pencil"; points: { x: number; y: number }[] }).points.push({ x: e.clientX, y: e.clientY });
                this.drawPencil(currentShape);
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
