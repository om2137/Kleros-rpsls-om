import { getSigner } from '@/utils/connect'
import { ethers } from 'ethers';
import RPSArtificate from '@/utils/RPS.json'
import { useEffect, useState } from 'react';
import Button from './Button';


export function J1Timeout({ gameAddress }: { gameAddress: string }) {

    const [timeoutData, setTimeoutData] = useState<{
        lastAction: number;
        Timeout: number;
        c2: number;
    }>();
    const [timer, setTimer] = useState<string>();
    const [p2Played, setP2Played] = useState(false);
    const [loading, setLoading] = useState(false);
    // const [remaining, setRemaining] = useState(0);

    async function Loadtimeout() {
        try {

            const signer = await getSigner();
            const game = new ethers.Contract(gameAddress, RPSArtificate.abi, signer);
            const lastaction = Number(await game.lastAction());
            const timeout = Number(await game.TIMEOUT());
            const c2value = Number(await game.c2());

            setTimeoutData({
                lastAction: lastaction,
                Timeout: timeout,
                c2: c2value
            })

            const t = new Date((lastaction + timeout) * 1000)
                .toLocaleTimeString("en-GB", { hour12: true });
            setTimer(t)

        } catch (error) {
            console.log(error)
        }
    }

    async function callTimeout() {
        try {
            setLoading(true)
            const signer = await getSigner();
            const contract = new ethers.Contract(gameAddress, RPSArtificate.abi, signer);
            const j2Timeout = await contract.j2Timeout();
            await j2Timeout.wait();
            alert(` executed successfully!`);
        } catch (error) {
            console.log(error)
        } finally { setLoading(false) }
    }

    async function watcher() {
        const signer = await getSigner();
        const game = new ethers.Contract(gameAddress, RPSArtificate.abi, signer);
        const c2 = await game.c2();

        if (Number(c2) !== 0) setP2Played(true);
    }

    useEffect(() => {
        if (gameAddress) Loadtimeout();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameAddress]);

    useEffect(() => {
        if (!gameAddress) return;

        const interval = setInterval(async () => {
            watcher();
        }, 1000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameAddress]);

    return (
        <div >
            {loading && <div className='animate-pulse'>Processing Timeout ...</div>}

            {!loading && timeoutData && (
                <div>
                    {!p2Played ? (
                        <div className='flex items-center gap-2'>
                            <div className="capitalize">
                                {/* Time Remaining: {timer > 0 ? formatTime(timer) : "Time's up"} */}
                                Timeout to call at: {timer}
                            </div>
                            <div>
                                <Button
                                    lable={'Timeout'}
                                    onClick={callTimeout}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="text-green-600 font-bold text-xl">
                            Player 2 has played their move!
                        </div>
                    )}
                </div>
            )}

        </div>
    )
}

export function J2Timeout({ gameAddress, played }: { gameAddress: string, played: boolean }) {

    const [timer, setTimer] = useState<string>();
    const [loading, setLoading] = useState(false);
    // const [p2Played, setP2Played] = useState(false);

    function timeout() {
        try {
            if (played) {
                const timeoutdata = new Date(Date.now() + 5 * 60 * 1000).toLocaleTimeString("en-GB", { hour12: true });
                setTimer(timeoutdata);
            }
        } catch (e) { console.log(e) }
    }

    async function callTimeout() {
        try {
            setLoading(true)
            const signer = await getSigner();
            const contract = new ethers.Contract(gameAddress, RPSArtificate.abi, signer);
            const j2Timeout = await contract.j1Timeout();
            await j2Timeout.wait();
            alert(` executed successfully!`);
        } catch (error) {
            console.log(error)
        } finally { setLoading(false) }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { timeout() }, [played])
    return (
        <div >
            {loading && <div className='animate-pulse'>Processing Timeout ...</div>}
            {!loading && played && <div className='flex flex-col gap-2'>
                <div>
                    Call timeout at {timer}
                </div>
                <div>
                    <Button
                        lable={'Timeout'}
                        onClick={callTimeout}
                    />
                </div>
            </div>}
        </div>
    )
}

