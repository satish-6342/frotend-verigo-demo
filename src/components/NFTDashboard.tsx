// src/components/NFTDashboard.tsx
import React, { useState, ChangeEvent } from "react";
import { ethers } from "ethers";
import GrantMinterRole from "./SetMinterUI";  // <-- Import GrantMinterRole component

const PINATA_JWT = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyYjI2NTNiNS1kMzZkLTQ1YTItODlhNS04YWI2ZmMyZTM5NTQiLCJlbWFpbCI6InNhdGlzaEBzeW5yYW0uY28iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNmFiZDlkNDRjNjcyNWZlZjc1NGYiLCJzY29wZWRLZXlTZWNyZXQiOiJlYWRlZGM1NDlkNTllZjVmMTQ4NDBiZDA1MzQ0MzM0YzEyODBjNzU5MTg2MjAwMzdiY2I4YjhhM2ZiZTk3YTdkIiwiZXhwIjoxNzc5NTI0NzgxfQ.hzhjgZuzEHi2GlIxkOur8ghRlO39qILV30MU1ye_Lbs"; // Truncated for security

declare global {
  interface Window {
    ethereum?: import("ethers").Eip1193Provider;
  }
}

export default function NFTDashboard() {
  // Wallet States
  const [generatedAddress, setGeneratedAddress] = useState<string>("");
  const [generatedKey, setGeneratedKey] = useState<string>("");
  const [copied, setCopied] = useState<string>("");

  // Mint NFT States
  const [mintAddress, setMintAddress] = useState<string>("");
  const [mintStatus, setMintStatus] = useState<string>("");
  const [mintLoading, setMintLoading] = useState<boolean>(false);
  const [nftImageUrl, setNftImageUrl] = useState("");

  // Login States
  const [loginAddress, setLoginAddress] = useState<string>("");
  const [loginStatus, setLoginStatus] = useState<string>("");
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  // NFT Upload States
  const [imageCID, setImageCID] = useState<string>("");
  const [metadataCID, setMetadataCID] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Handlers
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
        body: JSON.stringify({ walletAddress: mintAddress, imageUrl: nftImageUrl }),
      });

      const data = await res.json();
      setMintStatus(
        `✅ Minted! Tx: <a href="https://testnet.bscscan.com/tx/${data.txHash}" target="_blank" rel="noopener noreferrer">${data.txHash}</a>`
      );
    } catch (err) {
      console.error(err);
      setMintStatus("❌ Error minting NFT.");
    } finally {
      setMintLoading(false);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask");

    try {
      setLoginLoading(true);
      setLoginStatus("🔄 Connecting...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      const challengeRes = await fetch("http://localhost:5000/get-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });

      const { message } = await challengeRes.json();
      const signature = await signer.signMessage(message);

      const verifyRes = await fetch("http://localhost:5000/verify-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, signature }),
      });

      const result = await verifyRes.json();
      if (!result.success || !result.verified) return setLoginStatus("❌ Signature verification failed.");

      const nftRes = await fetch("http://localhost:5000/verify-nft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });

      const nftResult = await nftRes.json();
      setLoginStatus(nftResult.success && nftResult.verified ? "🎉 user verified!" : "❌ NFT not found.");
      setLoginAddress(walletAddress);
    } catch (err) {
      console.error(err);
      setLoginStatus("❌ Error. See console.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({ name: file.name });
    formData.append("pinataMetadata", metadata);

    try {
      const uploadRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: PINATA_JWT,
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      const cid = uploadData.IpfsHash;
      setImageCID(cid);

      console.log("Image CID:", cid);
    } catch (error) {
      console.error("File upload failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Generate Wallet */}
      <div style={styles.card}>
        <h2>🆕 Generate Wallet</h2>
        <button style={styles.button} onClick={generateWallet}>
          Generate Wallet
        </button>
        {generatedAddress && (
          <>
            <p>
              <strong>Address:</strong>
            </p>
            <div style={styles.copyBox}>
              <code>{generatedAddress}</code>
              <button
                style={styles.button}
                onClick={() => copyToClipboard(generatedAddress, "address")}
              >
                📋
              </button>
              {copied === "address" && <span style={styles.copied}>Copied!</span>}
            </div>
            <p>
              <strong>Private Key:</strong>
            </p>
            <div style={styles.copyBox}>
              <code>{generatedKey}</code>
              <button
                style={styles.button}
                onClick={() => copyToClipboard(generatedKey, "private")}
              >
                📋
              </button>
              {copied === "private" && <span style={styles.copied}>Copied!</span>}
            </div>
          </>
        )}
      </div>

      {/* IPFS Upload */}
      <div style={styles.card}>
        <h2>🖼️ Upload NFT Image</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={styles.input}
        />
        {loading && <p>Uploading...</p>}
        {imageCID && (
          <>
            <p>
              Image IPFS URI:{" "}
              <code>https://silver-tough-fly-320.mypinata.cloud/ipfs/{imageCID}</code>
            </p>
            <img
              src={`https://gateway.pinata.cloud/ipfs/${imageCID}`}
              alt="Uploaded"
              style={styles.imgPreview}
            />
          </>
        )}
        {metadataCID && (
          <p>
            Metadata IPFS URI: <code>ipfs://{metadataCID}</code>
          </p>
        )}
      </div>

      {/* Mint NFT */}
      <div style={styles.card}>
        <h2>🪙 Mint NFT</h2>
        <input
          type="text"
          value={mintAddress}
          onChange={(e) => setMintAddress(e.target.value)}
          placeholder="Wallet address to mint NFT"
          style={styles.input}
        />
        <input
          type="text"
          value={nftImageUrl}
          onChange={(e) => setNftImageUrl(e.target.value)}
          placeholder="NFT image URL (optional)"
          style={styles.input}
        />
        <button
          onClick={mintNFT}
          disabled={mintLoading}
          style={{
            ...styles.button,
            ...(mintLoading ? styles.buttonDisabled : {}),
          }}
        >
          {mintLoading ? "Minting..." : "Mint NFT"}
        </button>
        <p dangerouslySetInnerHTML={{ __html: mintStatus }} />
      </div>

      {/* Login & Verify */}
      <div style={styles.card}>
        <h2>🔐 Login & Verify NFT Ownership</h2>
        <button
          onClick={connectWallet}
          disabled={loginLoading}
          style={{
            ...styles.button,
            ...(loginLoading ? styles.buttonDisabled : {}),
          }}
        >
          {loginLoading ? "Connecting..." : "Connect Wallet & Verify"}
        </button>
        <p>{loginStatus}</p>
        {loginAddress && <p>Connected Wallet: {loginAddress}</p>}
      </div>

      {/* Grant Minter Role */}
      <div style={styles.card}>
        <GrantMinterRole />
      </div>
    </div>
  );

}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 900,
    margin: "40px auto",
    padding: "0 20px",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
  },
  card: {
    background: "#f9f9f9",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    flex: "1 1 300px",  // Responsive min width 300px and grow
    maxWidth: 400,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  copyBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#eee",
    padding: 8,
    borderRadius: 5,
    flexWrap: "wrap",
    wordBreak: "break-all",
  },
  copied: {
    marginLeft: 8,
    color: "green",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 5,
    border: "1px solid #ccc",
    fontSize: 14,
    boxSizing: "border-box",
  },
  button: {
    padding: "10px 15px",
    borderRadius: 5,
    border: "none",
    backgroundColor: "#4caf50",
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  buttonDisabled: {
    backgroundColor: "#a5d6a7",
    cursor: "not-allowed",
  },
  imgPreview: {
    width: "100%",
    height: "auto",
    borderRadius: 8,
    marginTop: 10,
    objectFit: "contain",
  },
  statusText: {
    marginTop: 10,
    fontSize: 14,
  },
};

