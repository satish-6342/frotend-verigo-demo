export default function RecoveryRequest() {
  const handleRecovery = () => {
    alert("Recovery request sent to Neoloop Admin.");
    // Optionally trigger backend API or a contract function
  };

  return (
    <div>
      <h2>Lost Phone?</h2>
      <button onClick={handleRecovery}>Trigger Recovery Request</button>
    </div>
  );
}
