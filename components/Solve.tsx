import React, { useEffect, useState } from 'react'
import Button from './Button';
import { ethers } from 'ethers';
import { getProvider, getSigner } from '@/utils/connect';
import RPSArtificate from '@/utils/RPS.json'

export default function Solve({ gameAddress }: { gameAddress: string }) {

    const [showSolve, setShowSolve] = useState(false);
    const [finished, setFinished] = useState(false);
    const [loading, setLoading] = useState(false)
    const c1 = localStorage.getItem('c1');
    const salt = localStorage.getItem('salt');

    async function watcher() {
        const signer = await getSigner();
        const game = new ethers.Contract(gameAddress, RPSArtificate.abi, signer);
        const c2 = await game.c2();
        const stake = await game.stake();
        console.log(Number(stake), Number(c2))
        if (Number(stake) === 0) { setShowSolve(true); setFinished(true); return; }
        if (Number(c2) !== 0) setShowSolve(true);
    }

    useEffect(() => { console.log(showSolve, finished) }, [showSolve, finished])

    useEffect(() => {
        if (!gameAddress) return;

        const interval = setInterval(async () => {
            watcher();
        }, 1000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameAddress]);


    async function solve() {
        try {
            setLoading(true)
            const provider = await getProvider();
            const signer = await getSigner();
            const game = new ethers.Contract(gameAddress, RPSArtificate.abi, signer);

            const [j1, j2] = await Promise.all([
                game.j1(),
                game.j2(),
            ]);

            const bBeforeJ1 = await provider.getBalance(j1);
            const bBeforeJ2 = await provider.getBalance(j2);

            console.log("balances before", {
                j1: ethers.formatEther(bBeforeJ1),
                j2: ethers.formatEther(bBeforeJ2),
            });

            const solve = await game.solve(c1, salt);
            await solve.wait();
            console.log(solve)

            const bAfterJ1 = await provider.getBalance(j1);
            const bAfterJ2 = await provider.getBalance(j2);
            console.log("balances after", {
                j1: ethers.formatEther(bAfterJ1),
                j2: ethers.formatEther(bAfterJ2),
            });
            setFinished(true);
            alert("solved")

        } catch (error) {
            console.log(error)
        } finally { setLoading(false) };
    }

    return (
        <div className='flex flex-col items-center bg-sky-100 rounded-xl m-10 p-10 gap-6 mt-10'>
            <div className='flex flex-col gap-4'>
                <span className='font-semibold text-lg'>solve game</span>
                <span>{gameAddress}</span>
            </div>
            {loading && <span className='animate-pulse'>Solving Game ...</span>}

            <div>
                {showSolve ?
                    finished ?
                        <div className='text-xl font-semibold'>Game Ended</div>
                        :
                        < Button
                            lable={loading ? "Solving" : 'Solve'}
                            onClick={() => {
                                solve();
                            }}
                        />
                    :
                    <div className='animate-pulse'>Waiting for Player 2 ...</div>
                }


            </div>
        </div>
    )
}
