'use client'
import Button from "@/components/Button";
import { getProvider, getSigner } from "@/utils/connect";
import { ethers } from "ethers";
import { Dispatch, SetStateAction, useState } from "react";

export default function Wallet({address,setAddress}:{address:string;setAddress:Dispatch<SetStateAction<string>>}) {

    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState<string>("0.0");
    const [network, setNetwork] = useState<string>("");

    async function loadWallet() {
        setLoading(true)
        try {

            const provider = await getProvider();
            const signer = await getSigner();
            const addr = signer.address;
            const bal = await provider.getBalance(addr)
            const nw = await provider.getNetwork();
            // console.log(bal)
            setNetwork(nw.name)
            setBalance(ethers.formatEther(bal))
            setAddress(signer.address)

        } catch (e) {
            console.log(e)
        } finally {
            setLoading(false)
        }
    }

    // useEffect(() => { loadWallet() }, [])

    return (
        <div className="flex flex-col  gap-4 items-center justify-start py-10">
            <div className="text-2xl capitalize">
                kleros RPSLS
            </div>
            <div>
                <Button lable={loading ? `Connecting...` : `Connect`} onClick={loadWallet} />
            </div>
            <div className="flex flex-col">
                <div>
                    {address ? `connected address: ${address}` : 'no address available'}
                </div>
                <div>
                    {balance ? `${balance} ETH` : `no balance available`}
                </div>
                <div>
                    {network ? `${network}` : `no network available`}
                </div>
            </div>
        </div>
    );
}
