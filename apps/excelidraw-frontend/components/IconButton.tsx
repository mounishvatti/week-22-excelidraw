import { ReactNode } from "react";

export function IconButton({
    icon, onClick, activated
}: {
    icon: ReactNode,
    onClick: () => void,
    activated: boolean
}) {
    return <div className={`cursor-pointer rounded-full text-sm p-2 bg-black hover:bg-gray ${activated ? "text-indigo-300" : "text-white/80"}`} onClick={onClick}>
        {icon}
    </div>
}

