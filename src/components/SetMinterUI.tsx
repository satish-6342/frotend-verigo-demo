import React, { useState, FormEvent } from "react";

interface ApiResponse {
  success: boolean;
  txHash?: string;
  error?: string;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 400,
    margin: "auto",
    backgroundColor: "#f9f9f9",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
  },
  heading: {
    marginBottom: 15,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    marginBottom: 12,
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
  messageSuccess: {
    marginTop: 12,
    color: "green",
    fontWeight: "bold",
  },
  messageError: {
    marginTop: 12,
    color: "red",
    fontWeight: "bold",
  },
};

const GrantMinterRole: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleGrantMinter = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("http://localhost:5000/set-minter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });

      const data: ApiResponse = await res.json();

      if (data.success) {
        setMessage(`Minter role granted! Transaction hash: ${data.txHash}`);
      } else {
        setMessage(`Error: ${data.error ?? "Failed to grant role"}`);
      }
    } catch (err: any) {
      setMessage(`Request error: ${err.message}`);
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Grant Minter Role</h3>
      <form onSubmit={handleGrantMinter}>
        <input
          type="text"
          placeholder="Enter wallet address"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          required
          style={styles.input}
        />
        <button
          type="submit"
          disabled={loading}
          style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
        >
          {loading ? "Granting..." : "Grant Minter Role"}
        </button>
      </form>
      {message && (
        <p style={message.startsWith("Error") ? styles.messageError : styles.messageSuccess}>
          {message}
        </p>
      )}
    </div>
  );
};

export default GrantMinterRole;
