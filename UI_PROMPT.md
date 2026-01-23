# Prompt for Building the AI Agent UI

**Copy and paste this prompt into your preferred AI Coding Assistant (or send it to me!) to generate the Frontend UI.**

---

**Role:** Expert Frontend Engineer & UX Designer.
**Goal:** Build a "Clinical AI Command Center" dashboard to visualize the output of a Python AI Agent.

### **1. Context**
I have a backend AI agent (`clinical_agent.py`) that acts as a "Medical Chief of Staff". It processes incoming lab results, compares them against hospital policy (RAG), and generates a risk assessment with a creative explanation.

I need a **React/Next.js Dashboard** to display these insights visually. The design must be **Premium, Futuristic, and Medical-Grade** (Dark Mode, Glassmorphism).

### **2. Data Structure (JSON Interface)**
The frontend will receive a list of patients. Here is the TypeScript interface for a single Patient Report:

```typescript
interface PatientReport {
  id: string;
  patientName: string;
  age: number;
  testName: string; // e.g., "Blood Count (CBC)"
  status: "Pending" | "In-progress" | "Processed";
  
  // AI Analysis Results (Populated after processing)
  aiAnalysis?: {
    riskLevel: "Routine" | "Urgent" | "Critical";
    policyLevel: "Level 1" | "Level 2" | "Level 3" | "Level 4" | "Level 5";
    summary: string; // Clinical summary
    policyRule: string; // Exact line quoted from policy
    childAnalogy: string; // Creative explanation
    findings: string[];
  };
}
```

### **3. Required Features**

**A. The "Live Triage" Feed (Main View)**
- A table or card grid showing incoming patients.
- **Status Badges**: Use distinct colors for risks.
  - `Routine` = Green (Soft pill)
  - `Urgent` = Orange (Pulse effect)
  - `Critical` = Red (Blinking/Glowing border)

**B. The "AI Reasoning Engine" (Detail View)**
- When I click a patient, open a **Side Drawer** or **Modal**.
- **Header**: Patient info + Big Risk Badge.
- **Section 1: The Code-Logic**: Show the "Hospital Policy" rule that was triggered. Use a code-block style or a "verified" citation card.
- **Section 2: The Creative Side**: Display the "Child-Friendly Analogy" in a friendly, distinct "Knowledge Card" (maybe with a brain or lightbulb icon).
- **Section 3: Actions**: Buttons for "Approve Note", "Escalate to Senior", "Call Patient".

**C. The "Level 5" Emergency Mode**
- If `policyLevel === "Level 5"`, the entire card should have a red glowing stroke or a "breathing" animation to mimic a hospital alarm.

### **4. Design Aesthetics**
- **Theme**: "Neuro-Foundation" Dark Mode.
- **Colors**: Deep Midnight Blue backgrounds, Electric Blue accents, Neon Red for critical alerts.
- **Typography**: Inter or Roboto (Clean, sans-serif).
- **Vibe**: Code meets Medicine. It should look like a sci-fi medical interface (Star Trek / Iron Man).

### **5. Deliverable**
- Create the `Dashboard.tsx` component.
- Create the `PatientCard.tsx` component.
- Use `framer-motion` for smooth layout transitions if possible.
- Use simulated data (mock data) to demonstrate the UI immediately.

---
