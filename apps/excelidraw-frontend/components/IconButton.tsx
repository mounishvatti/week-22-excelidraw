import { ReactNode } from "react";

export function IconButton({
    icon, onClick, activated
}: {
    icon: ReactNode,
    onClick: () => void,
    activated: boolean
}) {
    return <div className={`m-2 pointer rounded-full border border-gray-700 p-2 bg-black hover:bg-gray ${activated ? "text-indigo-400" : "text-white/80"}`} onClick={onClick}>
        {icon}
    </div>
}

