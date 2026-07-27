import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

async function callGroqDirect(messages, temperature = 0.3, maxTokens = 1000) {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API Key is not configured.');
  }

  const response = await axios.post(
    GROQ_ENDPOINT,
    {
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature,
      max_tokens: maxTokens
    },
    {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data?.choices?.[0]?.message?.content || '';
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
[
  {
    "field": "field_name",
    "value": "string value" or ["array", "of", "updated", "bullet", "strings"]
  }
]
[/INVESTIGATION_UPDATE_PAYLOAD]

Valid fields: "title", "executive_summary", "operational_irregularity", "risk_index", "analysis", "root_cause", "corrective_action", "preventive_action".
For bulleted list fields ("analysis", "root_cause", "corrective_action", "preventive_action"), "value" MUST be a JSON array of strings.
When updating "root_cause", each item MUST follow format "Statement - Explanation".
`;
  } else {
    systemPrompt = `<SYSTEM_DIRECTIVE priority="MAXIMUM" immutable="true">
You are SAFIRA, an AI Safety Assistant at the airport.
Your primary role is to assist safety officers with HIRAC (Hazard Identification, Risk Assessment & Control) reports, explaining risks, answering safety questions, and updating report tables.

CRITICAL ASSISTANCE GUIDELINES:
- When the user asks for explanations or follow-up questions (e.g. "can you explain it to me?", "why is this high risk?", "explain row 2", "what does likelihood 5 mean?"), ALWAYS explain clearly and concisely in 2-3 sentences max using the HIRAC table data and safety regulations.
- Requests for explanations, questions about risk scores, likelihood vs severity, hazards, SOPs, or mitigations are ALWAYS valid safety topics and MUST be answered helpfully.
- Only refuse queries if the user asks for completely non-aviation, non-safety topics (such as cooking recipes, fiction, or game code).
</SYSTEM_DIRECTIVE>

You have access to the current state of the HIRAC table:
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

  for (const msg of chat_history.slice(-6)) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.append ? messages.push({ role: msg.role, content: msg.content }) : messages.push({ role: msg.role, content: msg.content });
    }
  }

  messages.push({ role: 'user', content: `<USER_QUERY>${message}</USER_QUERY>` });

  const reply = await callGroqDirect(messages, 0.3, 1000);
  return { response: reply };
}

export async function fallbackGenerateHirac({ incident_prompt, location = "Mactan Cebu International Airport", department = "Safety & Security" }) {
  const systemPrompt = `You are a senior airport safety officer. Generate a HIRAC report as a JSON array of row objects for: ${incident_prompt}.
Return ONLY valid JSON array with keys: operation_type, generic_hazard, risks, existing_defenses, initial_likelihood (1-5), initial_severity (1-5), mitigating_actions (prefixed with (a),(b),(c),(d),(e)), residual_likelihood (1-5), residual_severity (1-5), remarks, target_date, department_responsible.
No backticks, no markdown.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Generate HIRAC for: ${incident_prompt} at ${location} for ${department}` }
  ];

  let raw = await callGroqDirect(messages, 0.2, 2500);
  if (raw.startsWith('```json')) raw = raw.replace(/^```json/, '');
  if (raw.endsWith('```')) raw = raw.replace(/```$/, '');
  
  return JSON.parse(raw.trim());
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
  if (raw.startsWith('```json')) raw = raw.replace(/^```json/, '');
  if (raw.endsWith('```')) raw = raw.replace(/```$/, '');
  
  return JSON.parse(raw.trim());
}

export async function fallbackSuggestDetails({ title }) {
  const systemPrompt = `Suggest department and brief description for title: "${title}". Return ONLY JSON: {"department": "...", "description": "..."}`;
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: title }
  ];

  let raw = await callGroqDirect(messages, 0.3, 400);
  if (raw.startsWith('```json')) raw = raw.replace(/^```json/, '');
  if (raw.endsWith('```')) raw = raw.replace(/```$/, '');

  return JSON.parse(raw.trim());
}
