import { useSearchParams, useNavigate } from "react-router-dom";

export function FullWizard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get("edit");

  console.log("🔥 FULLWIZARD LOADED");
  console.log("🔥 editId:", editId);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>✅ WIZARD LOADED!</h1>
      <p><strong>URL Edit ID:</strong> {editId || "None"}</p>
      <p><strong>Current URL:</strong> {window.location.href}</p>
      <button onClick={() => navigate("/dashboard")} style={{ padding: '10px 20px', marginTop: '20px' }}>
        Go to Dashboard
      </button>
      <div style={{ marginTop: '40px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
        <h3>Debug Info:</h3>
        <p>User Agent: {navigator.userAgent.slice(0, 50)}...</p>
        <p>Time: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}
