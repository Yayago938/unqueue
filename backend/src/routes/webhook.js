const express = require("express");
const crypto = require("crypto");

const { fetchLead } = require("../services/metaservice");
const { getLead, saveLead } = require("../store/leads");

function verifySignature(rawBody, signature) {
  const expected = `sha256=${crypto
    .createHmac("sha256", process.env.META_APP_SECRET)
    .update(rawBody)
    .digest("hex")}`;

  return signature === expected;
}

function createWebhookRouter(io) {
  const router = express.Router();

  router.get("/", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
      return res.status(200).type("text/plain").send(challenge);
    }

    return res.sendStatus(403);
  });

  router.post("/", async (req, res) => {
    const rawBody = req.body;
    const signature = req.get("X-Hub-Signature-256");

    if (!verifySignature(rawBody, signature)) {
      return res.status(401).json({
        error: "Invalid webhook signature",
      });
    }

    const payload = JSON.parse(rawBody.toString("utf8"));

    for (const entry of payload.entry) {
      if (entry.id !== process.env.PAGE_ID) {
        continue;
      }

      for (const change of entry.changes) {
        if (change.field !== "leadgen") {
          continue;
        }

        const leadId = change.value?.leadgen_id;

        if (!leadId || getLead(leadId)) {
          continue;
        }

        const rawLead = await fetchLead(leadId);

        saveLead(rawLead);
        io.emit("new_lead", rawLead);
        console.log("New lead received:", rawLead.id);
      }
    }

    return res.sendStatus(200);
  });

  return router;
}

module.exports = createWebhookRouter;
