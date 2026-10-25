const express = require("express");
const crypto = require("crypto");

const { fetchLead } = require("../services/metaservice");
const { getLead, saveLead } = require("../store/leads");

function verifySignature(rawBody, signature) {
  if (
    !Buffer.isBuffer(rawBody) ||
    typeof signature !== "string" ||
    !signature.startsWith("sha256=")
  ) {
    return false;
  }

  const receivedHex = signature.slice("sha256=".length);

  if (!/^[0-9a-f]{64}$/i.test(receivedHex)) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", process.env.META_APP_SECRET)
    .update(rawBody)
    .digest();

  const received = Buffer.from(receivedHex, "hex");

  return (
    received.length === expected.length &&
    crypto.timingSafeEqual(received, expected)
  );
}

function createWebhookRouter(io) {
  const router = express.Router();

  router.get("/", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (
      mode === "subscribe" &&
      token === process.env.META_VERIFY_TOKEN &&
      typeof challenge === "string"
    ) {
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

    let payload;

    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch {
      return res.status(400).json({
        error: "Invalid JSON payload",
      });
    }

    if (payload.object !== "page" || !Array.isArray(payload.entry)) {
      return res.status(400).json({
        error: "Unexpected webhook payload",
      });
    }

    try {
      for (const entry of payload.entry) {

        if (entry.id !== process.env.PAGE_ID) {
          continue;
        }

        for (const change of entry.changes || []) {
          if (change.field !== "leadgen") {
            continue;
          }

          const leadId = change.value?.leadgen_id;

          if (!leadId) {
            continue;
          }

          if (getLead(leadId)) {
            continue;
          }

          // Retrieve the actual submitted form data.
          const rawLead = await fetchLead(leadId);

          const saved = saveLead(rawLead);

          if (saved) {
            io.emit("new_lead", rawLead);
            console.log("New lead received:", rawLead.id);
          }
        }
      }

      return res.sendStatus(200);
    } catch (error) {

      console.error(
        "Lead processing failed:",
        error.response?.data?.error?.message || error.message
      );

      return res.status(500).json({
        error: "Lead processing failed",
      });
    }
  });

  return router;
}

module.exports = createWebhookRouter;