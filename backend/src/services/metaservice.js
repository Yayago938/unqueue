const axios = require("axios");

async function fetchLead(leadId) {
  const version = process.env.META_GRAPH_API_VERSION;

  const url = `https://graph.facebook.com/${version}/${encodeURIComponent(leadId)}`;

  const response = await axios.get(url, {
    params: {
      fields: "id,created_time,form_id,field_data",
      access_token: process.env.PAGE_TOKEN,
    },
    timeout: 10000,
  });

  return response.data;
}

module.exports = {
  fetchLead,
};