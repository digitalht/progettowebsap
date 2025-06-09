// export default async function handler(req, res) {
//     // Imposta headers CORS
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

//     // Gestisce richieste OPTIONS (preflight)
//     if (req.method === 'OPTIONS') {
//         res.status(200).end();
//         return;
//     }

//     // Accetta solo richieste POST
//     if (req.method !== 'POST') {
//         res.status(405).json({ error: 'Method not allowed' });
//         return;
//     }

//     try {
//         const { message, systemPrompt } = req.body;

//         // Verifica che i parametri siano presenti
//         if (!message || !systemPrompt) {
//             res.status(400).json({ error: 'Missing message or systemPrompt' });
//             return;
//         }

//         // Chiama OpenAI
//         const response = await fetch('https://api.openai.com/v1/chat/completions', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` // Usa variabile d'ambiente
//             },
//             body: JSON.stringify({
//                 model: 'gpt-3.5-turbo',
//                 messages: [
//                     { role: 'system', content: systemPrompt },
//                     { role: 'user', content: message }
//                 ],
//                 temperature: 0.1
//             })
//         });

//         if (!response.ok) {
//             const errorData = await response.text();
//             console.error('OpenAI API Error:', errorData);
//             res.status(response.status).json({ error: 'OpenAI API Error', details: errorData });
//             return;
//         }

//         const data = await response.json();
//         res.status(200).json(data);

//     } catch (error) {
//         console.error('Errore interno:', error);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// }

// chat.js (unificato)
import express from "express";
import cors from "cors";
import btoa from "btoa";
import fetch, { Headers } from "node-fetch";
import * as tough from "tough-cookie";
import fetchCookie from "fetch-cookie";
import { config } from "dotenv";
config(); // Carica variabili da .env

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const fetchWithCookies = fetchCookie(fetch, new tough.CookieJar());

// === ENDPOINT 1: Recupera entità SAP ===
app.get("/sap/:entity", async (req, res) => {
    const { entity } = req.params;
    const sapUrl = `https://htwds4c.h-t.it:44301/sap/opu/odata/sap/ZGW_SMART_PURCHASING_SRV/${entity}?$format=json&sap-client=200`;

    try {
        const response = await fetch(sapUrl, {
            method: "GET",
            headers: {
                "Authorization": "Basic " + btoa("rcarini:Velcome24"),
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            const text = await response.text();
            return res.status(response.status).send(`Errore SAP: ${text}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Errore proxy SAP:", error);
        res.status(500).send("Errore interno nel proxy.");
    }
});

// === ENDPOINT 2: Recupera item ordine ===
app.get("/sap/order-items/:orderId", async (req, res) => {
    const { orderId } = req.params;
    const sapUrl = `https://htwds4c.h-t.it:44301/sap/opu/odata/sap/ZGW_SMART_PURCHASING_SRV/PurchOrderItemSet?$filter=(OrderNr eq '${orderId}')&$format=xml&sap-client=200`;

    try {
        const response = await fetch(sapUrl, {
            method: "GET",
            headers: {
                "Authorization": "Basic " + btoa("rcarini:Velcome24"),
                "Accept": "application/xml"
            }
        });

        if (!response.ok) {
            const text = await response.text();
            return res.status(response.status).send(`Errore SAP: ${text}`);
        }

        const xmlText = await response.text();
        const { parseStringPromise } = await import("xml2js");

        const result = await parseStringPromise(xmlText, { explicitArray: false });
        const entries = result?.feed?.entry;

        let items = [];

        if (entries) {
            const entriesArray = Array.isArray(entries) ? entries : [entries];
            items = entriesArray.map(entry => {
                const props = entry.content["m:properties"];
                return {
                    OrderPos: props["d:OrderPos"],
                    Price: props["d:Price"],
                    ProductId: props["d:ProductId"],
                    ShortText: props["d:ShortText"]
                };
            });
        }

        res.json({ items });
    } catch (error) {
        console.error("Errore parsing XML:", error);
        res.status(500).send("Errore parsing XML.");
    }
});

// === ENDPOINT 3: Rilascio ordine ===
app.post("/sap/release/:orderId", async (req, res) => {
    const { orderId } = req.params;
    const auth = "Basic " + btoa("rcarini:Velcome24");

    const baseUrl = "https://htwds4c.h-t.it:44301/sap/opu/odata/sap/ZGW_SMART_PURCHASING_SRV";
    const csrfUrl = `${baseUrl}/ReleasePo?sap-client=200`;

    try {
        const csrfRes = await fetchWithCookies(csrfUrl, {
            method: "GET",
            headers: {
                "Authorization": auth,
                "x-csrf-token": "Fetch"
            }
        });

        const csrfToken = csrfRes.headers.get("x-csrf-token");
        if (!csrfToken) throw new Error("CSRF token non ricevuto");

        const releaseUrl = `${baseUrl}/ReleasePo?sap-client=200&Orders='[{"OrderNr":"${orderId}"}]'`;

        const releaseRes = await fetchWithCookies(releaseUrl, {
            method: "POST",
            headers: {
                "Authorization": auth,
                "x-csrf-token": csrfToken
            }
        });

        if (!releaseRes.ok) {
            const errorText = await releaseRes.text();
            return res.status(releaseRes.status).send("Errore rilascio SAP");
        }

        const result = await releaseRes.text();
        res.json({ success: true, message: result });
    } catch (error) {
        console.error("Errore rilascio ordine:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// === ENDPOINT 4: Chat OpenAI ===
app.post("/chat", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
    }

    const { message, systemPrompt } = req.body;

    if (!message || !systemPrompt) {
        return res.status(400).json({ error: "Missing message or systemPrompt" });
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                temperature: 0.1
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            return res.status(response.status).json({ error: "OpenAI API Error", details: errorData });
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error("Errore OpenAI:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});

// === Start Server ===
app.listen(PORT, () => {
    console.log(`✅ Server avviato su http://localhost:${PORT}`);
});
