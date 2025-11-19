import React, { useEffect, useState } from 'react'
import Button from './Button';
import { ethers } from 'ethers';
import { getProvider, getSigner } from '@/utils/connect';
import RPSArtificate from '@/utils/RPS.json'
import { J1Timeout } from './Timeout';

export default function Solve({ gameAddress }: { gameAddress: string }) {

    const [showSolve, setShowSolve] = useState(false);
    const [finished, setFinished] = useState(false)
    const c1 = localStorage.getItem('c1');
    const salt = localStorage.getItem('salt');

    async function watcher() {
        const signer = await getSigner();
        const game = new ethers.Contract(gameAddress, RPSArtificate.abi, signer);
        const c2 = await game.c2();

        if (Number(c2) !== 0) setShowSolve(true);
    }


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
            const provider = await getProvider();
            const signer = await getSigner();
            const game = new ethers.Contract(gameAddress, RPSArtificate.abi, signer);

            const [j1, j2] = await Promise.all([
                game.j1(),
                game.j2(),
                game.c2(),
                game.stake(),
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
        }
    }

    return (
        <div className='flex flex-col items-center gap-6 mt-10'>
            <div>
                solve game : {gameAddress}
            </div>
            <div>
                {gameAddress && <J1Timeout gameAddress={gameAddress} />}
            </div>
            <div>
                {showSolve ?
                    finished ? 
                    <div className='text-xl font-semibold'>Game Ended</div>    
                    :
                    < Button
                        lable={'Solve'}
                        onClick={() => {
                            solve();
                        }}
                    />
                    :
                    <>Waiting for Player 2 ...</>
                }


            </div>
        </div>
    )
}
