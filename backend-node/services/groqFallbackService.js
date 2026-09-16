import axios from 'axios';
import dotenv from 'dotenv';
import { formatHiracRows } from './formatHiracRows.js';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS = process.env.GROQ_MODEL
  ? [process.env.GROQ_MODEL]
  : ['openai/gpt-oss-20b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-120b'];

async function callGroqDirect(messages, temperature = 0.3, maxTokens = 1500) {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API Key is not configured.');
  }

  let lastError = null;
  for (const model of GROQ_MODELS) {
    try {
      const response = await axios.post(
        GROQ_ENDPOINT,
        {
          model,
          messages,
          temperature,
          max_tokens: maxTokens
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 25000
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (content) return content;
    } catch (err) {
      console.warn(`Groq model '${model}' failed (${err.response?.status || err.message}), attempting fallback model...`);
      lastError = err;
    }
  }

  throw lastError || new Error('All Groq fallback models failed.');
}

export async function fallbackChat({ message, chat_history = [], current_table = [], doc_type = 'hirac', current_investigation = null }) {
  let systemPrompt = '';

  if (doc_type === 'investigation') {
    systemPrompt = `<SYSTEM_DIRECTIVE priority="MAXIMUM" immutable="true">
You are SAFIRA, an AI Safety Assistant at the airport.
Your primary role is to assist safety officers with Incident Investigation Reports, explaining findings, answering safety questions, and updating report documents.

CRITICAL ASSISTANCE GUIDELINES:
- When the user asks for explanations or follow-up questions (e.g. "can you explain it to me?", "why is this the root cause?", "explain the analysis"), ALWAYS explain clearly and concisely in 2-3 sentences max using the Investigation Report context and safety principles.
- Requests for explanations, questions about findings, SOPs, or root causes are ALWAYS valid safety topics and MUST be answered helpfully.
- Only refuse queries if the user asks for completely non-aviation, non-safety topics (such as cooking recipes, fiction, or game code).
</SYSTEM_DIRECTIVE>

You have access to the current state of the active Investigation Report:
${JSON.stringify(current_investigation, null, 2)}

RESPONSE STYLE & FORMAT:
1. EXPLANATIONS & QUESTIONS: If the user asks a question or asks for an explanation (e.g. "can you explain it to me?"), provide a clear, friendly, 2-3 sentence explanation. Do NOT include an [INVESTIGATION_UPDATE_PAYLOAD] block unless a document change was explicitly requested.
2. DOCUMENT MODIFICATIONS: If the user asks to redo, change, restore, or update any section, provide a brief 1-2 sentence confirmation in simple English and append [INVESTIGATION_UPDATE_PAYLOAD] at the very end.

The JSON payload for updates:
[INVESTIGATION_UPDATE_PAYLOAD]
{
  "title": "Incident Title",
  "operational_irregularity": "Description",
  "risk_index": "Low/Medium/High/Extreme",
  "analysis": ["point 1", "point 2", "point 3", "point 4"],
  "root_cause": ["Cause 1 - Explanation", "Cause 2 - Explanation"],
  "corrective_action": ["Action 1", "Action 2"],
  "preventive_action": ["Action 1", "Action 2"]
}
[/INVESTIGATION_UPDATE_PAYLOAD]`;
  } else {
    systemPrompt = `<SYSTEM_DIRECTIVE priority="MAXIMUM" immutable="true">
You are SAFIRA, an AI Safety Assistant at the airport.
Your primary role is to assist safety officers with HIRAC (Hazard Identification, Risk Assessment & Control) reports, explaining risks, answering safety questions, and updating report tables.

CRITICAL ASSISTANCE GUIDELINES:
- When the user asks for explanations or follow-up questions (e.g. "can you explain it to me?", "why is this high risk?", "explain row 2", "what does likelihood 5 mean?"), ALWAYS explain clearly and concisely in 2-3 sentences max using the HIRAC table data and safety regulations.
- Requests for explanations, questions about risk scores, likelihood vs severity, hazards, SOPs, or mitigations are ALWAYS valid safety topics and MUST be answered helpfully.
- Only refuse queries if the user asks for completely non-aviation, non-safety topics (such as cooking recipes, fiction, or game code).
</SYSTEM_DIRECTIVE>

Current HIRAC table:
${JSON.stringify(current_table, null, 2)}

RESPONSE STYLE & FORMAT:
1. EXPLANATIONS & QUESTIONS: If the user asks a question or asks for an explanation (e.g. "can you explain it to me?", "why is this row extreme?"), provide a clear, helpful, 2-3 sentence explanation. Do NOT include a [TABLE_UPDATE_PAYLOAD] block unless a table change was explicitly requested.
2. TABLE MODIFICATIONS: If the user asks to add, edit, or delete a row (e.g. "change residual risk of row 1 to Low", "add a new row", "modify mitigating actions"), give a 1-sentence confirmation and append the [TABLE_UPDATE_PAYLOAD] JSON block at the end.

When suggesting edits or new rows, prefix mitigating actions with Hierarchy of Controls letters: (a) Elimination, (b) Substitution, (c) Engineering, (d) Administrative, (e) PPE.
Do NOT output alphabetical lists (like f, g, h, etc.). Every action must start with exactly one of: (a), (b), (c), (d), or (e).

JSON block format for table updates:
[TABLE_UPDATE_PAYLOAD]
{
  "action": "modify_row" | "add_row" | "delete_row",
  "row_index": 0-indexed index of row (for modify_row or delete_row),
  "data": { ... }
}
[/TABLE_UPDATE_PAYLOAD]
`;
  }

  const messages = [{ role: 'system', content: systemPrompt }];

  if (Array.isArray(chat_history)) {
    for (const msg of chat_history.slice(-6)) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
  }

  messages.push({ role: 'user', content: `<USER_QUERY>${message}</USER_QUERY>` });

  const reply = await callGroqDirect(messages, 0.3, 1000);
  return { response: reply };
}

export async function fallbackGenerateHirac({ incident_prompt, location = "Mactan Cebu International Airport", department = "Safety & Security" }) {
  const systemPrompt = `You are a senior airport safety officer. Your task is to generate a comprehensive, highly-detailed Hazard Identification, Risk Assessment & Control (HIRAC) report in JSON format based on the safety scenario.

CRITICAL REQUIREMENT: You MUST generate AT LEAST 5 distinct, detailed hazard rows in the JSON array.
Each row must cover a different operational aspect, such as:
1. Airside / Ramp / Apron operations (aircraft movement, pushback, ground crew)
2. Passenger terminal facilities & public areas (boarding gates, jet bridges, concourse)
3. Baggage handling & ground support equipment (tugs, belt loaders, conveyor belts)
4. Fueling, maintenance, or hazardous materials operations (refueling, chemical storage)
5. Emergency response, medical, or evacuation coordination (ARFF, marshaling, crisis response)

Each row object MUST follow this schema exactly:
{
  "operation_type": "Sector or activity (e.g. Ramp Operations, Terminal Facilities, Baggage Handling, Fueling Operations, Emergency Response)",
  "generic_hazard": "The hazard trigger or general category (e.g. Typhoon-induced high winds, Fuel spill, Mechanical failure)",
  "risks": "Consequences of the hazard (e.g. Aircraft structural damage, ground crew injury, flight delays)",
  "existing_defenses": "Current safety barriers and SOPs active before further mitigations",
  "initial_likelihood": 1-5 integer,
  "initial_severity": 1-5 integer,
  "mitigating_actions": "Actions to further reduce risks. Each action MUST start with its corresponding Hierarchy of Controls letter: (a) for Elimination, (b) for Substitution, (c) for Engineering controls, (d) for Administrative controls, (e) for PPE. Example: '(a) Suspend ramp operations during peak winds (c) Deploy tie-down anchors (d) Mandatory ramp safety briefing (e) Wear high-visibility raincoats and safety boots'",
  "residual_likelihood": 1-5 integer (must be <= initial_likelihood),
  "residual_severity": 1-5 integer (must be <= initial_severity),
  "remarks": "Additional notes, audit targets, or SOP codes",
  "target_date": "YYYY-MM-DD date or 'Ongoing'",
  "department_responsible": "The team or department in charge of execution"
}

Provide ONLY the valid JSON array of at least 5 objects. Do not wrap in markdown or backticks. No introductory or concluding remarks.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Generate AT LEAST 5 distinct, detailed HIRAC rows for: ${incident_prompt} at ${location} for ${department}` }
  ];

  let raw = await callGroqDirect(messages, 0.2, 3500);
  const match = raw.match(/\[[\s\S]*\]/);
  if (match) raw = match[0];
  
  const parsed = JSON.parse(raw.trim());
  return formatHiracRows(parsed);
}

export async function fallbackGenerateInvestigation({ executive_summary, id_number = "", position = "", date_of_hiring = "", trainings = "" }) {
  const systemPrompt = `You are a senior airport safety officer. Generate an Incident Investigation Report in JSON format for: ${executive_summary}.
Return ONLY a JSON object with keys: title, operational_irregularity, risk_index, analysis (array of 4 strings), root_cause (array of strings, formatted as 'Statement - Explanation'), corrective_action (array of strings), preventive_action (array of strings).
No backticks, no markdown.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Generate investigation for: ${executive_summary}. Worker position: ${position}.` }
  ];

  let raw = await callGroqDirect(messages, 0.2, 2500);
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) raw = match[0];
  
  return JSON.parse(raw.trim());
}

export async function fallbackSuggestDetails({ title }) {
  const systemPrompt = `You are a senior airport safety officer.
Based on the HIRAC report title, suggest:
1. The most appropriate Airport Department (e.g. Flight Operations, Ground Handling, Passenger Terminal Operations, Facilities, Cargo Operations, Security, Ramp Safety).
2. A unique, realistic, highly-specific safety incident, activity, or hazard scenario description (2-3 detailed sentences).
Return ONLY a valid JSON object:
{
  "department": "Suggested Department name",
  "description": "Suggested safety incident, activity, or hazard description"
}`;
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Suggest safety department and realistic scenario description for: ${title}` }
  ];

  let raw = await callGroqDirect(messages, 0.75, 450);
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) raw = match[0];

  return JSON.parse(raw.trim());
}
