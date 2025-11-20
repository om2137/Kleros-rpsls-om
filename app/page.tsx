'use client'
import Wallet from '@/components/ConnectWallet'
import InitiateGame from '@/components/InitiateGame';
import Solve from '@/components/Solve';
import { useState } from 'react';

export default function Page() {

  const [address, setAddress] = useState('');
  const [contractAddr, setContractAddr] = useState('');

  return (
    <div className='text-black flex flex-wrap justify-center items-center'>
      <Wallet address={address} setAddress={setAddress} />
      {address && <InitiateGame address={address} contractAddr={contractAddr} setContractAddr={setContractAddr} />}
      {contractAddr && <Solve gameAddress={contractAddr} />}
    </div>
  )
}
