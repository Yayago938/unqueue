const leads = new Map();

function getAllLeads() {
  return Array.from(leads.values());
}

function getLead(id) {
  return leads.get(id);
}

function saveLead(lead) {
  if (leads.has(lead.id)) {
    return false;
  }

  leads.set(lead.id, lead);
  return true;
}

module.exports = {
  getAllLeads,
  getLead,
  saveLead,
};