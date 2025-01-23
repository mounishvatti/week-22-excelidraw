import { ReactNode } from "react";

export function IconButton({
    icon, onClick, activated, className
}: {
    icon: ReactNode,
    onClick: () => void,
    activated: boolean
    className?: string
}) {
    return <div className={`cursor-pointer rounded-lg text-xs p-2 hover:bg-gray ${className} ${activated ? "text-indigo-100 bg-indigo-500/60" : "text-gray-300"}`} onClick={onClick}>
        {icon}
    </div>
}

