import * as dotenv from "dotenv";
dotenv.config();

import { StateGraph, END, START } from "@langchain/langgraph";
import { HumanMessage, BaseMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";

// ==========================================
// 1. State Definition
// ==========================================
interface AgentState {
    messages: BaseMessage[];
    pending_reports: any[];
    current_report: any | null;
    analysis_result: any | null;
    final_status: string;
}

const stateChannels = {
    messages: {
        reducer: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
        default: () => [],
    },
    pending_reports: {
        reducer: (x: any[], y: any[]) => y,
        default: () => [],
    },
    current_report: {
        reducer: (x: any, y: any) => y,
        default: () => null,
    },
    analysis_result: {
        reducer: (x: any, y: any) => y,
        default: () => null,
    },
    final_status: {
        reducer: (x: string, y: string) => y,
        default: () => "",
    }
};

// ==========================================
// 2. AI Model Initialization
// ==========================================
// We use the OpenAI model. Ensure OPENAI_API_KEY is in your .env file.
const model = new ChatOpenAI({
    modelName: "gpt-4o", // Using the latest efficient model
    temperature: 0,      // Low temperature for factual medical analysis
});


// ==========================================
// 3. Mock Database
// ==========================================
const MOCK_DB = [
    {
        id: "blood-test-1",
        investigationName: "Blood test",
        patientName: "Priya",
        age: 47,
        status: "In-progress",
        raw_data: { Hemoglobin: 8.5, WBC: 14000, Platelets: 150000 },
        history: { Hemoglobin: 11.2 }
    },
    {
        id: "3",
        investigationName: "Ultrasound Pelvis",
        patientName: "Mia Hernandez",
        age: 34,
        status: "Pending",
        raw_data: "No significant abnormalities detected. Ovaries normal size. Endometrium 4mm.",
        history: "Normal"
    }
];

// ==========================================
// 4. Tools
// ==========================================

async function fetchPendingInvestigations(state: AgentState) {
    console.log("\n[Tool] 🔍 Fetching pending & in-progress investigations...");
    await new Promise(r => setTimeout(r, 500)); // Simulate API latency

    // Check if we already have a list (optimization)
    if (state.pending_reports && state.pending_reports.length > 0) {
        return {};
    }

    const pending = MOCK_DB.filter(r => ["Pending", "In-progress"].includes(r.status));
    return { pending_reports: pending };
}

async function analyzeBiomarkers(state: AgentState) {
    const report = state.pending_reports[0];
    console.log(`\n[Tool]  AI ANALYZING report for: ${report.patientName} (${report.investigationName})...`);

    // 1. Construct the Prompt
    const systemPrompt = "You are an expert Clinical AI Assistant. Your job is to analyze medical reports, identify abnormalities, and assess risk based on clinical standards.";

    // READ POLICY FILE
    const fs = await import("fs");
    const policyText = fs.readFileSync("hospital_policy.txt", "utf-8");

    const userPrompt = `
    Analyze this investigation result STRICTLY based on the provided HOSPITAL POLICY.

    HOSPITAL POLICY:
    """
    ${policyText}
    """

    PATIENT: ${report.patientName} (${report.age} years old)
    TEST: ${report.investigationName}
    DATA: ${JSON.stringify(report.raw_data)}
    HISTORY: ${JSON.stringify(report.history || "No prior history")}

    INSTRUCTIONS:
    1. Compare the patient's data against the "CRITICAL VALUE THRESHOLDS" in the Policy.
    2. Assign the specific **Policy Level** (e.g., "Level 4", "Level 5").
    3. **PROOF OF INTELLIGENCE**: Quote the exact line from the policy that applies to this patient.
    
    OUTPUT FORMAT:
    Return ONLY valid JSON with no markdown formatting.
    Structure:
    {
      "findings": ["finding 1", "finding 2"],
      "risk_level": "Routine" | "Urgent" | "Critical",
      "policy_level": "Level X",
      "summary": "Clinical summary string",
      "policy_citation": "The exact line from the policy text",
    }
    `;

    // 2. Call the LLM
    try {
        console.log("   (Connecting to OpenAI GPT-4 with Policy Context...)");
        const startTime = Date.now();

        const response = await model.invoke([
            new SystemMessage("You are a strict Hospital AI Compliance Officer. You must follow the written policy exactly."),
            new HumanMessage(userPrompt)
        ]);

        const duration = Date.now() - startTime;

        // 3. Parse and Validate Output
        const contentStr = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

        // Clean markdown if present
        const jsonStr = contentStr.replace(/```json/g, "").replace(/```/g, "").trim();
        const analysis = JSON.parse(jsonStr);

        console.log(`\n   ✅ **POLICY CHECK** (Generated in ${duration}ms):`);
        console.log(`      • Assigned Level: ${analysis.policy_level}`);
        console.log(`      • Policy Rule:    "${analysis.policy_citation}"`);

        console.log(`\n   > AI Analysis Result: [${analysis.risk_level}] ${analysis.summary}`);

        return {
            current_report: report,
            analysis_result: analysis
        };

    } catch (error) {
        console.error("Error in AI analysis:", error);
        return {
            current_report: report,
            analysis_result: { risk_level: "Unknown", findings: [], summary: "AI Analysis Failed" }
        };
    }
}

async function draftClinicalNote(state: AgentState) {
    const analysis = state.analysis_result;
    const report = state.current_report;

    console.log(`\n[Tool] ✍️ AI DRAFTING NOTE for ${report.patientName}...`);

    const prompt = `
    Write a professional, concise Clinical Note for this patient.
    
    PATIENT: ${report.patientName}
    TEST: ${report.investigationName}
    FINDINGS: ${JSON.stringify(analysis.findings)}
    RISK: ${analysis.risk_level}
    SUMMARY: ${analysis.summary}
    
    The note should include sections: "Clinical Findings", "Assessment", and "Suggested Action".
    Use professional medical terminology.
    `;

    const response = await model.invoke([new HumanMessage(prompt)]);
    const noteContent = response.content as string;

    console.log(`\n   > Note Generated (${noteContent.length} chars).`);

    // Remove the processed item from the queue
    const remaining = state.pending_reports.slice(1);

    return {
        final_status: `Processed (${analysis.risk_level})`,
        pending_reports: remaining
    };
}

// ==========================================
// 5. Graph Construction
// ==========================================

const workflow = new StateGraph<AgentState>({
    channels: stateChannels
})
    .addNode("fetch_data", fetchPendingInvestigations)
    .addNode("analyze", analyzeBiomarkers)
    .addNode("draft", draftClinicalNote);

workflow.addEdge(START, "fetch_data");

async function shouldContinue(state: AgentState) {
    if (!state.pending_reports || state.pending_reports.length === 0) {
        return "end";
    }
    return "analyze";
}

workflow.addConditionalEdges(
    "fetch_data",
    shouldContinue,
    {
        analyze: "analyze",
        end: END
    }
);

workflow.addEdge("analyze", "draft");

workflow.addConditionalEdges(
    "draft",
    shouldContinue,
    {
        analyze: "analyze",
        end: END
    }
);

const app = workflow.compile();

// ==========================================
// 6. Execution
// ==========================================
(async () => {
    console.log("----------------------------------------------------");
    console.log("🤖 STARTING 'SMART-CONSULT' AI AGENT (Powered by GPT-4)");
    console.log("----------------------------------------------------");

    const initialState = {
        messages: [],
        pending_reports: [],
        analysis_result: null,
        final_status: ""
    };

    await app.invoke(initialState);

    console.log("----------------------------------------------------");
    console.log("✅ AGENT WORKFLOW COMPLETE");
    console.log("----------------------------------------------------");
})();
