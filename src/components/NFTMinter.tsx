import { useState } from "react";

const AdminNFTMinter = () => {
  const [mintTo, setMintTo] = useState("");
  const [userName, setUserName] = useState("");
  const [status, setStatus] = useState("");

  const mintNFT = async () => {
    try {
      const response = await fetch("http://localhost:5000/mint-nft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: mintTo,
          userName: userName,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus("✅ NFT minted successfully!");
        console.log("NFT minted successfully!", result);
      } else {
        setStatus(`❌ Minting failed: ${result.error}`);
        console.error("Minting failed:", result.error);
      }
    } catch (err) {
      setStatus("❌ Error connecting to mint-nft API.");
      console.error("Error calling mint-nft API:", err);
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
      
      <input
        type="text"
        placeholder="User name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
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
