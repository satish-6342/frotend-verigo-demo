// src/components/NFTDashboard.tsx

import React, { useState } from "react";
import { ethers } from "ethers";

// Extend window interface
declare global {
  interface Window {
    ethereum?: import("ethers").Eip1193Provider;
  }
}

export default function NFTDashboard() {
  // --- States ---

  // Wallet Generation
  const [generatedAddress, setGeneratedAddress] = useState<string>("");
  const [generatedKey, setGeneratedKey] = useState<string>("");
  const [copied, setCopied] = useState<string>("");

  // Mint NFT
  const [mintAddress, setMintAddress] = useState<string>("");
  const [mintStatus, setMintStatus] = useState<string>("");
  const [mintLoading, setMintLoading] = useState<boolean>(false);

  // Wallet Login & NFT Check
  const [loginAddress, setLoginAddress] = useState<string>("");
  const [loginStatus, setLoginStatus] = useState<string>("");
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  // --- Handlers ---

  // Generate Wallet
  const generateWallet = () => {
    const wallet = ethers.Wallet.createRandom();
    setGeneratedAddress(wallet.address);
    setGeneratedKey(wallet.privateKey);
    setCopied("");
  };

  const copyToClipboard = (text: string, type: "address" | "private") => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(""), 1500);
    });
  };

  // Mint NFT
  const mintNFT = async () => {
    if (!mintAddress) {
      setMintStatus("❗ Wallet address is required.");
      return;
    }

    setMintLoading(true);
    setMintStatus("⏳ Minting NFT...");

    try {
      const res = await fetch("http://localhost:5000/mint-nft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: mintAddress }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMintStatus(`✅ Minted! Tx: ${data.txHash}`);
      } else {
        setMintStatus(`❌ Failed: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setMintStatus("❌ Error minting NFT.");
    } finally {
      setMintLoading(false);
    }
  };

  // Login & Verify NFT
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask");

    try {
      setLoginLoading(true);
      setLoginStatus("🔄 Connecting...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();
      setLoginStatus("🔏 Requesting challenge...");

      const challengeRes = await fetch("http://localhost:5000/get-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });
      const { message } = await challengeRes.json();

      setLoginStatus("✍️ Signing...");
      const signature = await signer.signMessage(message);

      setLoginStatus("🛡️ Verifying...");
      const verifyRes = await fetch("http://localhost:5000/verify-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, signature }),
      });
      const result = await verifyRes.json();

      if (!result.success || !result.verified) {
        setLoginStatus("❌ Signature verification failed.");
        return;
      }

      setLoginStatus("🔍 Verifying NFT...");
      const nftRes = await fetch("http://localhost:5000/verify-nft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });
      const nftResult = await nftRes.json();

      if (nftResult.success && nftResult.verified) {
        setLoginStatus("🎉 NFT verified!");
        setLoginAddress(walletAddress);
      } else {
        setLoginStatus("❌ NFT not found.");
      }
    } catch (err) {
      console.error(err);
      setLoginStatus("❌ Error. See console.");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Generate Wallet */}
      <div style={styles.card}>
        <h2>🆕 Generate Wallet</h2>
        <button onClick={generateWallet}>Generate Wallet</button>

        {generatedAddress && (
          <div style={{ marginTop: "1rem" }}>
            <p><strong>Wallet Address:</strong></p>
            <div style={styles.copyBox}>
              <code>{generatedAddress}</code>
              <button onClick={() => copyToClipboard(generatedAddress, "address")}>📋</button>
              {copied === "address" && <span style={styles.copied}>Copied!</span>}
            </div>

            <p><strong>Private Key:</strong></p>
            <div style={styles.copyBox}>
              <code>{generatedKey}</code>
              <button onClick={() => copyToClipboard(generatedKey, "private")}>📋</button>
              {copied === "private" && <span style={styles.copied}>Copied!</span>}
            </div>
          </div>
        )}
      </div>

      {/* Mint NFT */}
      <div style={styles.card}>
        <h2>🪙 Mint NFT</h2>
        <input
          type="text"
          placeholder="Wallet address to mint NFT"
          value={mintAddress}
          onChange={(e) => setMintAddress(e.target.value)}
          style={styles.input}
        />
        <button onClick={mintNFT} disabled={mintLoading}>
          {mintLoading ? "Minting..." : "Mint NFT"}
        </button>
        {mintStatus && <p>{mintStatus}</p>}
      </div>

      {/* NFT Login */}
      <div style={styles.card}>
        <h2>🔐 Login & Verify NFT</h2>
        {!loginAddress ? (
          <button onClick={connectWallet} disabled={loginLoading}>
            {loginLoading ? "Processing..." : "Connect Wallet"}
          </button>
        ) : (
          <p><strong>✅ Wallet:</strong> {loginAddress}</p>
        )}
        {loginStatus && <p>{loginStatus}</p>}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    padding: "2rem",
    fontFamily: "sans-serif",
    backgroundColor: "#f7f8fa",
    minHeight: "100vh",
  },
  card: {
    backgroundColor: "#fff",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    marginBottom: "1rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  copyBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "1rem",
    wordBreak: "break-word",
  },
  copied: {
    color: "green",
    fontSize: "0.9rem",
  },
};
