// No dotenv import needed, running with --env-file

async function runDiagnostics() {
  console.log("=== ASTRA DIAGNOSTICS ===");
  
  const astraKey = process.env.ASTRA_API_KEY;
  const primaryModel = process.env.PRIMARY_AI_MODEL || "gpt-6-astra";
  
  console.log(`ASTRA_API_KEY present: ${!!astraKey}`);
  console.log(`PRIMARY_AI_MODEL: ${primaryModel}`);
  
  if (!astraKey) {
    console.log("❌ Missing ASTRA_API_KEY in .env.local");
    return;
  }
  
  console.log("\\nSending minimal authenticated request to official OpenAI API...");
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${astraKey}`
      },
      body: JSON.stringify({
        model: primaryModel,
        messages: [{ role: "user", content: "test" }],
        max_tokens: 5
      })
    });
    
    console.log(`HTTP Status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    
    if (!response.ok) {
      console.log("Error type/code:", data.error?.type || "unknown", "/", data.error?.code || "unknown");
      console.log("Sanitized error message:", data.error?.message || "No message provided");
    } else {
      console.log("✅ Success! Model returned:", data.model);
    }
    
  } catch (err: any) {
    console.log(`Network or fetch error: ${err.message}`);
  }
}

runDiagnostics().catch(console.error);
