import { ReactNode } from "react";

export function IconButton({
    icon, onClick, activated
}: {
    icon: ReactNode,
    onClick: () => void,
    activated: boolean
}) {
    return <div className={`cursor-pointer rounded-md text-xs p-2 hover:bg-gray ${activated ? "text-indigo-100 bg-indigo-500/60" : "text-white/80"}`} onClick={onClick}>
        {icon}
    </div>
}

