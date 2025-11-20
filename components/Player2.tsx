'use client'

import { ethers } from "ethers"
import RPSArtificates from '@/utils/RPS.json'
import { getSigner } from "@/utils/connect"
import { useEffect, useState } from "react";
import Button from "./Button";
import { Move, Moves } from "./InitiateGame";
import { J2Timeout } from "./Timeout";

export default function Player2({ gameAddress }: { gameAddress: string; }) {

    const [selectedMove, setSelectedMove] = useState<Move>();
    const p2Address = localStorage.getItem('p2');
    const [played, setPlayed] = useState(false);
    const [finished, setFinished] = useState(false);
    const p2stake = localStorage.getItem('stake');
    const [loading, setLoading] = useState(false)

    async function p2Move() {
        try {
            console.log('click')
            const signer = await getSigner();
            console.log(p2Address, '===', signer.address)
            if (p2Address !== signer.address.toLowerCase()) {
                alert('please select correct account');
                return;
            }
            setLoading(true)
            const game = new ethers.Contract(gameAddress, RPSArtificates.abi, signer)

            if (!p2stake || p2stake === null) { alert('Invalid Stake'); return; }

            const stake = ethers.parseEther(p2stake)
            const play = await game.play(selectedMove?.value, { value: stake });
            await play.wait();
            console.log(play);
            setPlayed(true)

        } catch (error) {
            console.log(error)
        } finally { setLoading(false) }
    }

    async function watcher() {
        const signer = await getSigner();
        const game = new ethers.Contract(gameAddress, RPSArtificates.abi, signer);
        const stake = await game.stake();

        if (Number(stake) === 0) setFinished(true);
    }

    useEffect(() => {
        if (!gameAddress) return;
        const interval = setInterval(async () => {
            watcher();
        }, 1000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameAddress]);

    useEffect(() => {
        if (!gameAddress) return;
        if (!finished) {
            const interval = setInterval(async () => {
                watcher();
            }, 1000);
            return () => clearInterval(interval);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameAddress, finished]);

    return (
        <div className="min-h-[90vh] flex justify-center items-center">

            <div className="flex flex-col gap-3 justify-center items-start bg-sky-100 rounded-xl p-10">
                <h1 className="w-full font-bold flex justify-center text-xl">Player 2</h1>
                <div className="capitalize px-2">
                    <span className="font-semibold">game:</span> {gameAddress}
                </div>

                <div className="flex capitalize items-center justify-center px-2">
                    <span className="font-semibold">player 2 stake: </span>{p2stake}
                </div>
                {selectedMove &&
                    <div className='bg-sky-50 p-2 rounded-full capitalize'>
                        <span>Selected Move:</span> <span className='font-bold'>{selectedMove.name}</span>
                    </div>
                }
                {loading && <div className="animate-pulse">Deploying Move...</div>}

                {!played && !loading ? <div className='flex flex-col justify-start items-start capitalize text-xl'>
                    <div className='pb-2 px-2 text-lg font-semibold'>Choose Move:</div>
                    <div>
                        {
                            Moves.map((m) =>
                                <Button
                                    key={m.value}
                                    lable={m.name}
                                    style=' rounded-full py-2 px-4 mx-2 capitalize'
                                    background={`cursor-pointer 
                                            ${selectedMove && selectedMove.value === m.value ?
                                            'bg-sky-950 border border-sky-950 text-white ' :
                                            'bg-sky-50 border border-sky-950 text-sky-950 hover:bg-sky-950 hover:text-white'} 
                                            `}
                                    onClick={() => { setSelectedMove(m) }}
                                />
                            )
                        }
                    </div>
                </div>
                    :
                    <div className="px-2">
                        <J2Timeout gameAddress={gameAddress} played={played} />
                    </div>
                }

                {played || finished ?
                    finished ?
                        <div className="flex w-full justify-center font-semibold capitalize">
                            game Ended
                        </div> :
                        <div className="flex justify-center w-full animate-pulse">
                            Waiting for player 1 to revel ...
                        </div>
                    : <div className="w-full flex justify-center">

                        <Button
                            lable={'Play'}
                            disabled={selectedMove ? false : true}
                            onClick={() => {
                                p2Move();
                            }}
                        />

                    </div>}
            </div>

        </div>
    )
}
