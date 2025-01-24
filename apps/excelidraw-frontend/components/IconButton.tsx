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
            // style={{
            //     fontSize: "1.5rem",
            // }}
            className={`cursor-pointer rounded-sm p-1.5 hover:bg-gray ${className} ${
                activated ? "text-indigo-100 bg-indigo-500/60" : "text-zinc-400"
            }`}
            onClick={onClick}
            title={title}
        >
            {icon}
        </div>
    );
}
