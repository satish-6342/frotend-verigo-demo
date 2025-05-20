import { useState } from "react";

const AdminNFTMinter = () => {
  const [mintTo, setMintTo] = useState("");
  const [status, setStatus] = useState("");

 const mintNFT = async () => {
  if (!mintTo || !/^0x[a-fA-F0-9]{40}$/.test(mintTo)) {
    setStatus("❌ Please enter a valid wallet address.");
    return;
  }

  try {
    setStatus("⏳ Minting NFT...");
    const res = await fetch("http://localhost:5000/mint-nft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: mintTo }),
    });

    const data = await res.json();

    if (data.success) {
      setStatus(`✅ NFT minted successfully! Tx Hash: ${data.txHash}`);
    } else {
      setStatus(`❌ Minting failed: ${data.error}`);
    }
  } catch (err) {
    console.error("Error minting NFT:", err);
    if (err instanceof Error) {
      setStatus("❌ Error: " + err.message);
    } else {
      setStatus("❌ An unknown error occurred.");
    }
  }
};

  return (
    <div className="p-4 border rounded shadow max-w-md mx-auto mt-6">
      <h2 className="text-xl font-bold mb-2">Admin NFT Minter</h2>
      <input
        type="text"
        placeholder="Wallet address"
        value={mintTo}
        onChange={(e) => setMintTo(e.target.value)}
        className="w-full px-2 py-1 border rounded mb-2"
      />
      <button
        onClick={mintNFT}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Mint NFT
      </button>
      <p className="mt-2 text-green-700 break-words">{status}</p>
    </div>
  );
};

export default AdminNFTMinter;
