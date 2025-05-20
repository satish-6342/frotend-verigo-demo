import React, { useState } from "react";
import { ethers } from "ethers";
import abi from "../abi/VerigoNFT.json"; // Make sure path is correct

const CONTRACT_ADDRESS = "0x64184a2593294331167F8087d98Aa59705a56446"; // Replace with your deployed contract address

const SetMinterUI = () => {
  const [minterAddress, setMinterAddress] = useState("");
  const [isMinterStatus, setIsMinterStatus] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");

  const handleSetMinterClick = async () => {
    try {
      const AdminPrivateKey = process.env.REACT_APP_ADMIN_PRIVATE_KEY;
      if (!AdminPrivateKey) {
        throw new Error("Admin private key is not set in environment variables.");
      }

      const provider = new ethers.JsonRpcProvider("https://bsc-testnet-rpc.publicnode.com");
      const adminWallet = new ethers.Wallet(AdminPrivateKey, provider);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, adminWallet);

      const tx = await contract.setMinter(minterAddress, isMinterStatus);
      await tx.wait();

      setStatusMsg(`✅ setMinter(${minterAddress}, ${isMinterStatus}) executed successfully.`);
    } catch (err: any) {
      console.error(err);
      setStatusMsg("❌ Error: " + (err.message || "Unknown error"));
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold">Set Minter</h2>

      <input
        type="text"
        value={minterAddress}
        onChange={(e) => setMinterAddress(e.target.value)}
        placeholder="Minter Address"
        className="w-full border p-2 rounded"
      />

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isMinterStatus}
          onChange={() => setIsMinterStatus(!isMinterStatus)}
        />
        <span>{isMinterStatus ? "Enable Minter" : "Disable Minter"}</span>
      </label>

      <button
        onClick={handleSetMinterClick}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Set Minter
      </button>

      {statusMsg && <p className="mt-4 text-sm text-gray-700">{statusMsg}</p>}
    </div>
  );
};

export default SetMinterUI;
