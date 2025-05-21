// src/components/WalletLogin.tsx

import { useState } from "react";
import { ethers } from "ethers";

// Extend the global Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: import("ethers").Eip1193Provider;
  }
}

export default function WalletLogin() {
  const [address, setAddress] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    try {
      setLoading(true);
      setStatus("🔄 Connecting to wallet...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      setStatus("🔏 Requesting challenge...");

      // Step 1: Get challenge message
      const challengeRes = await fetch("http://localhost:5000/get-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });

      const { message } = await challengeRes.json();

      setStatus("✍️ Signing challenge...");

      // Step 2: Sign message
      const signature = await signer.signMessage(message);

      setStatus("🛡️ Verifying signature...");

      // Step 3: Verify the signature
      const verifyRes = await fetch("http://localhost:5000/verify-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, signature }),
      });

      const result = await verifyRes.json();

      if (!result.success || !result.verified) {
        setStatus("❌ Signature verification failed.");
        return;
      }

      setStatus("🔍 Verifying NFT ownership...");

      // Step 4: Check NFT ownership
      const nftRes = await fetch("http://localhost:5000/verify-nft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });

      const nftResult = await nftRes.json();

      if (nftResult.success && nftResult.verified) {
        setStatus("🎉 NFT verified. Login successful!");
        setAddress(walletAddress); // ✅ Show address only after full verification
      } else {
        setStatus("❌ NFT not found. Access denied.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Something went wrong. See console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h2>NFT Login</h2>

      {/* Show connect button only if not connected */}
      {!address ? (
        <button onClick={connectWallet} disabled={loading}>
          {loading ? "Processing..." : "Connect Wallet"}
        </button>
      ) : (
        <div>
          <button disabled style={{ background: "#4caf50", color: "white", cursor: "default" }}>
            ✅ Connected
          </button>
          <p><strong>Wallet:</strong> {address}</p>
        </div>
      )}

      {status && <p>{status}</p>}
    </div>
  );
}
