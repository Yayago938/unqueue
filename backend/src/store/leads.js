const leads = new Map();

function getAllLeads() {
  return Array.from(leads.values());
}

function getLead(id) {
  return leads.get(id);
}

function saveLead(lead) {
  leads.set(lead.id, lead);
}

module.exports = {
  getAllLeads,
  getLead,
  saveLead,
};
