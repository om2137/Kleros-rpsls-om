'use client'
import { Dispatch, SetStateAction, useState } from 'react';
import Button from './Button'
import HasherArtificate from '@/utils/Hasher.json'
import RPSArtificate from '@/utils/RPS.json'
import { getSigner } from '@/utils/connect';
import { ethers } from 'ethers';
import { J1Timeout } from './Timeout';

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
    const [loading, setLoading] = useState(false);
    const salt = 12345;
    const [p1stake, setP1stake] = useState<string>('0.001');
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
            setLoading(true)
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
            localStorage.setItem('salt', salt.toString());
            localStorage.setItem('stake', p1stake);
            localStorage.setItem('p2', p2)

            console.log(`game initiated by ${address}`);

            setContractAddr(gameAddress);
        } catch (e) { console.log(e) }
        finally { setLoading(false) }
    }

    // useEffect(() => { console.log(selectedMove) }, [selectedMove])
    return (
        <div className='flex flex-col justify-center items-start bg-sky-100 m-10 p-10 rounded-xl gap-4'>
            {!contractAddr && <>
                <div className='flex flex-col justify-start items-start capitalize text-xl'>
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
                {selectedMove &&
                    <div className='bg-sky-50 p-2 rounded-full capitalize'>
                        <span>Selected Move:</span> <span className='font-bold'>{selectedMove.name}</span>
                    </div>
                }
                {loading && <div>Deploying game...</div>}

                {!loading &&
                    <div className="flex gap-2">
                        <div>
                            <label htmlFor="p1stake">stake:</label>

                            <input type="number"
                                id='p1stake'
                                className='border bg-sky-50 rounded mx-2 outline-none w-20 px-2 py-1 no-spinner'
                                value={p1stake}
                                onChange={(e) => { setP1stake(e.target.value) }}
                            />
                        </div>
                        <div>
                            Player 2:
                            <input type="text"
                                className='border bg-sky-50 rounded mx-2 outline-none w-96 px-2 py-1 '
                                value={p2}
                                onChange={(e) => { setP2(e.target.value) }}
                            />
                        </div>
                    </div>}

                <div className='w-full flex justify-end'>
                    {address ?
                        <Button
                            lable={loading ? 'Deploying Game':'Initiate Game'}
                            disabled={selectedMove && p2 ? false : true}
                            onClick={() => {
                                deployGame();
                            }}
                        />
                        : 'Connect wallet to initiate game'
                    }
                </div>
            </>}
            {contractAddr &&
                <>
                    <div className='capitalize'>
                        <span className="font-semibold">game initiated at </span> {contractAddr}
                    </div>
                    {selectedMove &&
                        <div className='bg-sky-50 p-2 rounded-full capitalize'>
                            <span>Selected P1 Move:</span> <span className='font-bold capitalize'>{selectedMove.name}</span>
                        </div>
                    }
                    <div>
                        {contractAddr && <J1Timeout gameAddress={contractAddr} />}
                    </div>
                    <div className='flex justify-start w-full gap-4'>
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
