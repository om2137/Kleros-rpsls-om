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
    // const [p2Address, setP2Address] = useState('');
    const [played, setPlayed] = useState(false);
    const [finished, setFinished] = useState(false)

    async function p2Move() {
        try {
            console.log('click')
            const signer = await getSigner();
            const game = new ethers.Contract(gameAddress, RPSArtificates.abi, signer)

            const stake = ethers.parseEther('0.1')
            const play = await game.play(selectedMove?.value, { value: stake });
            await play.wait();
            console.log(play);
            setPlayed(true)

        } catch (error) {
            console.log(error)
        }
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
        <div className="min-h-screen flex flex-col gap-6 justify-center items-center">
            <div>
                game: {gameAddress} <br />
                For Player: { }
            </div>

            <div>
                <J2Timeout gameAddress={gameAddress} played={played} />
            </div>

            <div className='flex items-center capitalize text-xl'>
                <div>Choose Move:</div>
                {
                    Moves.map((m) =>
                        <Button
                            key={m.value}
                            lable={m.name}
                            background={`cursor-pointer 
                                            ${selectedMove && selectedMove.value === m.value ?
                                    'bg-sky-950 border border-sky-950 text-white hover:bg-white hover:text-sky-950' :
                                    'bg-white border border-sky-950 text-sky-950 hover:bg-sky-950 hover:text-white'} 
                                            `}
                            onClick={() => { setSelectedMove(m) }}
                        />
                    )
                }
            </div>
            <div className='text-xl'>
                {selectedMove && `Selected Move: ${selectedMove.name}`}
            </div>
            {played ? 
                finished ? <>game Ended</>: 
                <div>Waiting for player 1 to revel</div>
            :<div>

                <Button
                    lable={'Play'}
                    disabled={selectedMove ? false : true}
                    onClick={() => {
                        p2Move();
                    }}
                />

            </div>}
        </div>
    )
}
