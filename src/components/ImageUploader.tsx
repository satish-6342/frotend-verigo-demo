import React, { useState, ChangeEvent } from "react";

const PINATA_JWT = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyYjI2NTNiNS1kMzZkLTQ1YTItODlhNS04YWI2ZmMyZTM5NTQiLCJlbWFpbCI6InNhdGlzaEBzeW5yYW0uY28iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNmFiZDlkNDRjNjcyNWZlZjc1NGYiLCJzY29wZWRLZXlTZWNyZXQiOiJlYWRlZGM1NDlkNTllZjVmMTQ4NDBiZDA1MzQ0MzM0YzEyODBjNzU5MTg2MjAwMzdiY2I4YjhhM2ZiZTk3YTdkIiwiZXhwIjoxNzc5NTI0NzgxfQ.hzhjgZuzEHi2GlIxkOur8ghRlO39qILV30MU1ye_Lbs"; // Replace with your actual Pinata JWT

const ImageUploader: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [imageCID, setImageCID] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [metadataCID, setMetadataCID] = useState<string>("");

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
          Authorization: PINATA_JWT
        },
        body: formData
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
    <div>
      <h2>Upload NFT Image</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {loading && <p>Uploading...</p>}

      {imageCID && (
        <div>
          <p>Image IPFS URI: <code>https://silver-tough-fly-320.mypinata.cloud/ipfs/{imageCID}</code></p>
          <img
            src={`https://gateway.pinata.cloud/ipfs/${imageCID}`}
            alt="Uploaded"
            style={{ width: "200px", marginTop: "10px" }}
          />
        </div>
      )}

      {metadataCID && (
        <div>
          <p>Metadata IPFS URI: <code>ipfs://{metadataCID}</code></p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
