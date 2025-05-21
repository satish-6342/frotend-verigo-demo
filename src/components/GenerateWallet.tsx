// src/components/GenerateWallet.tsx

import React, { useState } from "react";
import { ethers } from "ethers";

export default function GenerateWallet() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [privateKey, setPrivateKey] = useState<string>("");
  const [copied, setCopied] = useState<string>("");

  const generateWallet = () => {
    const wallet = ethers.Wallet.createRandom();
    setWalletAddress(wallet.address);
    setPrivateKey(wallet.privateKey);
    setCopied("");
  };

  const copyToClipboard = (text: string, field: "address" | "private") => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(""), 2000);
    });
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h2>Generate Wallet</h2>
      <button onClick={generateWallet}>🔐 Generate Wallet</button>

      {walletAddress && (
        <div style={{ marginTop: "1rem" }}>
          <p><strong>Wallet Address:</strong></p>
          <div style={{ display: "flex", alignItems: "center" }}>
            <code style={{ wordBreak: "break-all" }}>{walletAddress}</code>
            <button onClick={() => copyToClipboard(walletAddress, "address")} style={{ marginLeft: "0.5rem" }}>
              📋
            </button>
            {copied === "address" && <span style={{ marginLeft: "0.5rem", color: "green" }}>Copied!</span>}
          </div>

          <p style={{ marginTop: "1rem" }}><strong>Private Key:</strong></p>
          <div style={{ display: "flex", alignItems: "center" }}>
            <code style={{ wordBreak: "break-all" }}>{privateKey}</code>
            <button onClick={() => copyToClipboard(privateKey, "private")} style={{ marginLeft: "0.5rem" }}>
              📋
            </button>
            {copied === "private" && <span style={{ marginLeft: "0.5rem", color: "green" }}>Copied!</span>}
          </div>
        </div>
      )}
    </div>
  );
}
