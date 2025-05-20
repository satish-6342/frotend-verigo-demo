// import { useState } from "react";
// import { ethers } from "ethers";

// export default function WalletManager() {
//   const [wallet, setWallet] = useState<any>(null);

//   const generateWallet = () => {
//     const newWallet = ethers.Wallet.createRandom();
//     localStorage.setItem("verigoWallet", newWallet.privateKey);
//     console.log("privatekey", newWallet.privateKey);
//     setWallet(newWallet);
//   };

//   return (
//     <div>
//       <h2>Custodial Wallet</h2>
//       {wallet ? (
//         <p>Address: {wallet.address}</p>
//       ) : (
//         <button onClick={generateWallet}>Generate Wallet</button>
//       )}
//     </div>
//   );
// }
import { useState } from "react";
import { ethers } from "ethers";

const WalletGenerator = () => {
  const [wallet, setWallet] = useState<{ address: string; privateKey: string } | null>(null);

  const generateWallet = () => {
    const newWallet = ethers.Wallet.createRandom();
    setWallet({
      address: newWallet.address,
      privateKey: newWallet.privateKey,
    });

    // Save locally or send to backend
    localStorage.setItem("verigoWallet", newWallet.privateKey);
  };

  return (
    <div className="p-4 border rounded shadow max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Create Your Verigo Wallet</h2>
      <button
        onClick={generateWallet}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Generate Wallet
      </button>

      {wallet && (
        <div className="mt-4 text-sm">
          <p><strong>Address:</strong> {wallet.address}</p>
          <p><strong>Private Key:</strong> {wallet.privateKey}</p>
        </div>
      )}
    </div>
  );
};

export default WalletGenerator;
