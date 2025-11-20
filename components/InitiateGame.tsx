'use client'
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Button from './Button'
import HasherArtificate from '@/utils/Hasher.json'
import RPSArtificate from '@/utils/RPS.json'
import { getSigner } from '@/utils/connect';
import { ethers } from 'ethers';

const HasherAddress = '0x8576601a2607af4368a5692897113104de006350';
export const Moves = [
    { name: "rock", value: 1 },
    { name: "paper", value: 2 },
    { name: "scissors", value: 3 },
    { name: "spock", value: 4 },
    { name: "lizard", value: 5 }
] as const;

export type Move = typeof Moves[number];

export default function InitiateGame({ address, contractAddr, setContractAddr }: { address: string; contractAddr: string; setContractAddr: Dispatch<SetStateAction<string>> }) {

    const [selectedMove, setSelectedMove] = useState<Move>();
    const [p2, setP2] = useState<string>('');
    const salt = 12345;
    const p1stake = '0.001'
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const gameUrl = `${base}/${contractAddr}`;

    const copyLink = async () => {
        await navigator.clipboard.writeText(gameUrl);
        alert("Link copied!");
    };

    const openLink = () => {
        window.open(gameUrl, "_blank");
    };

    async function deployGame() {
        try {
            const signer = await getSigner();
            const hasher = new ethers.Contract(HasherAddress, HasherArtificate.abi, signer);
            if (!selectedMove) return;

            const hashvalue = await hasher.hash(selectedMove?.value, salt);// move selection and hashing
            console.log(hashvalue)
            const stake = ethers.parseEther(p1stake)

            const game = new ethers.ContractFactory(RPSArtificate.abi, RPSArtificate.bytecode, signer);
            const gameInitiated = await game.deploy(hashvalue, p2, { value: stake })
            await gameInitiated.waitForDeployment();

            const gameAddress = await gameInitiated.getAddress();
            localStorage.setItem("c1", selectedMove?.value.toString());
            localStorage.setItem('salt', salt.toString())

            console.log(`game initiated by ${address}`);

            setContractAddr(gameAddress);
        } catch (e) { console.log(e) }
    }

    useEffect(() => { console.log(selectedMove) }, [selectedMove])
    return (
        <div className='flex flex-col justify-center items-center gap-4'>
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
            <div>
                Player 1 Stake : {p1stake}
            </div>
            <div className='text-xl'>
                {selectedMove && `Selected Move: ${selectedMove.name}`}
            </div>
            <div>
                Player 2:
                <input type="text"
                    className='border outline-none w-104 px-2 py-1'
                    value={p2}
                    onChange={(e) => { setP2(e.target.value) }}
                />
            </div>
            <div>
                {address ?
                    <Button
                        lable={'Initiate Game'}
                        disabled={selectedMove && p2 ? false : true}
                        onClick={() => {
                            deployGame();
                        }}
                    />
                    : 'Connect wallet to initiate game'
                }
            </div>

            {contractAddr &&
                <>
                    <div>
                        game initiated at {contractAddr}
                    </div>
                    <div className='flex gap-4'>

                        <div>
                            <Button
                                lable={'Copy Link'}
                                onClick={() => {
                                    copyLink();
                                }}
                            />
                        </div>
                        <div>
                            <Button
                                lable={'Open Link'}
                                onClick={() => {
                                    openLink();
                                }}
                            />
                        </div>
                    </div>
                </>
            }

        </div>
    )
}
