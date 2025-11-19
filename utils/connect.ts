/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from "ethers";

export function getProvider() {
  if ((window as any).ethereum == null) {
    console.log("MetaMask not installed; using read-only defaults");
    alert("metamask not installed");
  }
  return new ethers.BrowserProvider((window as any).ethereum);
}

export async function getSigner() {
  const provider = getProvider();
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
}
