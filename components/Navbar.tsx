
export default function Navbar({ address }: { address: string }) {
    return (
        <div className="flex justify-between items-center h-12 bg-sky-950 text-white text-xl font-semibold px-10">
            <span>
                KLEROS RPSLS
            </span>
            {address && <span>
                User: {address}
            </span>}
        </div>
    )
}
