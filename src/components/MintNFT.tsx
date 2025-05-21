// src/components/MintNFT.tsx

import React, { useState } from "react";

export default function MintNFT() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleMint = async () => {
    if (!walletAddress) {
      setStatus("❗ Wallet address is required.");
      return;
    }

    setLoading(true);
    setStatus("⏳ Minting NFT...");

    try {
      const res = await fetch("http://localhost:5000/mint-nft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus(`✅ NFT minted successfully! TxHash: ${data.txHash}`);
      } else {
        setStatus(`❌ Minting failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Minting error:", err);
      setStatus("❌ Failed to mint NFT. See console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h2>Mint NFT</h2>

      <input
        type="text"
        placeholder="Enter Wallet Address"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
        style={{ padding: "0.5rem", width: "100%", marginBottom: "1rem" }}
      />

      <button onClick={handleMint} disabled={loading}>
        {loading ? "Minting..." : "Mint NFT"}
      </button>

      {status && <p style={{ marginTop: "1rem" }}>{status}</p>}
    </div>
  );
}
