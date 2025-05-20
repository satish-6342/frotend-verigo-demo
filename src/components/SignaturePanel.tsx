// globals.d.ts (or add this in a separate `.d.ts` file if not already present)
declare global {
  interface Window {
    ethereum?: import("ethers").Eip1193Provider;
  }
}
export {};



import { useState } from "react";
import { ethers } from "ethers";

export default function WalletLogin() {
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // const connectWallet = async () => {
  //   if (!window.ethereum) {
  //     alert("Please install MetaMask");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     setStatus("🔄 Connecting wallet...");

  //     const provider = new ethers.BrowserProvider(window.ethereum);
  //     const signer = await provider.getSigner();
  //     const userAddress = await signer.getAddress();

  //     setAddress(userAddress);
  //     setStatus("🔍 Verifying NFT...");

  //     const response = await fetch("http://localhost:5000/verify-nft", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ walletAddress: userAddress }),
  //     });

  //     const data = await response.json();

  //     if (data.success && data.verified) {
  //       setStatus("✅ Login successful!");
  //     } else {
  //       setStatus("❌ Invalid credentials. NFT not found.");
  //     }
  //   } catch (error: any) {
  //     console.error("Login error:", error);
  //     setStatus("❌ Error during login. Check console for details.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
      setStatus("🎉 user verified. Login successful!");
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
