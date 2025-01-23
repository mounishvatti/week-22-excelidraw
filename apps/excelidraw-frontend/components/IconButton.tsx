import { ReactNode } from "react";

export function IconButton({
    icon,
    onClick,
    activated,
    className,
    title,
}: {
    icon: ReactNode;
    onClick: () => void;
    activated: boolean;
    className?: string;
    title?: string;
}) {
    return (
        <div
            className={`cursor-pointer rounded-lg text-xs p-2 hover:bg-gray ${className} ${
                activated ? "text-indigo-100 bg-indigo-500/60" : "text-gray-400"
            }`}
            onClick={onClick}
            title={title}
        >
            {icon}
        </div>
    );
}
