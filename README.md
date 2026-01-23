# Clinical Insight Agent - "Dr. Watson"

## 1. Executive Summary
This AI Agent is designed to seamlessly integrate with the **Consultant Dashboard** module of the Neuro-Foundation project. It addresses a critical bottleneck: **The time-consuming review of routine diagnostic reports.**

Instead of a Consultant manually opening every "Blood Test" or "MRI" file in `ConsultantInvestigationDetails`, this Agent proactively:
1.  **Monitors** incoming reports.
2.  **Analyzes** raw data against clinical reference ranges.
3.  **Triages** cases by urgency (e.g., flagging "Critical" values immediately).
4.  **Drafts** a clinical summary for the Consultant to simply "Sign Off".

## 2. Deep Analysis of Consultant Dashboard Integration

Based on strict analysis of the `ConsultantDashboard` module (specifically `ConsultantInvestigation.tsx` and `ConsultantInvestigationDetails.tsx`), the workflow is currently:
*   **Current State**: Consultant sees a list -> Clicks "View" -> Reads PDF -> Types Notes -> Updates Status.
*   **Agent-Enhanced State**: Agent reads PDF in background -> Updates Status to "Review Needed (Critical)" -> Pre-fills the Notes section.

### Key Touchpoints:
*   **Input Data**: "Investigation" objects (found in `ConsultantInvestigationDetails.tsx` dummy data).
*   **Actions**: Updating `status`, `priority`, and appending to a (hypothetical) `clinicalNotes` field.

## 3. Agent Architecture (The "Brain" & "Hands")

We utilize **LangGraph** to build a Cyclic State Machine, which is superior to linear scripts for clinical reasoning.

### The Tools (Results "Hands")
1.  **`fetch_pending_investigations`**: Queries the dashboard state for reports with status 'Pending'.
2.  **`biomedical_analyzer`**: Simulates reading a medical report (e.g., Blood Test) and extracting key biomarkers (Hemoglobin, WBC, Troponin).
3.  **`reference_validator`**: Compares extracted values against standard ranges (e.g., "Is WBC > 11,000?").
4.  **`risk_assessor`**: Logic to determine if a patient is "Routine", "Urgent", or "Critical".
5.  **`write_clinical_note`**: Appends the findings to the patient's record.

### The Workflow (The "Nervous System")

```mermaid
graph TD
    Start[User: "Auto-Review Pending Reports"] --> Fetch[Tool: Fetch Pending Investigations]
    Fetch --> LLM_Decide{LLM: Analyze or Stop?}
    LLM_Decide -->|No Reports| End[Finish]
    LLM_Decide -->|Found Reports| Analyze[Tool: Biomedical Analyzer]
    Analyze --> Validate[Tool: Reference Validator]
    Validate --> Assess[Tool: Risk Assessor]
    Assess --> Grade{Critical?}
    
    Grade -->|Yes| Alert[Action: Mark 'URGENT' + SMS Alert]
    Grade -->|No| Draft[Action: Mark 'Review' + Draft Note]
    
    Alert --> Update[Tool: Update Record]
    Draft --> Update
    Update --> LLM_Decide
```

## 4. Technical Implementation Steps (Python & LangChain)
The accompanying `clinical_agent.py` implements this logic:

1.  **State Definition**: Uses `TypedDict` to track the `messages`, `current_patient_id`, and `risk_level`.
2.  **Node Construction**: Python functions representing each step (Analyzing, Grading, Writing).
3.  **Graph Compilation**: `LangGraph` compiles these nodes into a runnable application.
