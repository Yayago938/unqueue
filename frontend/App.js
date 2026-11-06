import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { io } from "socket.io-client";

const BACKEND_URL = "http://[IP_Addresspasted]:8000";

const DUMMY_LEADS = [
  {
    id: "demo_1042",
    created_time: "2026-11-06T09:42:00+05:30",
    form_id: "form_instagram_leadgen",
    status: "New",
    score: 92,
    campaign: "Winter Shoe Drop",
    source: "Instagram",
    assigned_to: "Yash Chauhan",
    tags: ["High intent", "Bulk order"],
    field_data: [
      { name: "full_name", values: ["Aarav Mehta"] },
      { name: "email", values: ["aarav.mehta@example.com"] },
      { name: "phone_number", values: ["+91 98765 43210"] },
      { name: "company_name", values: ["Mehta Retail"] },
      { name: "city", values: ["Mumbai"] },
      { name: "budget", values: ["Rs 8,000 - Rs 12,000"] },
      { name: "message", values: ["Looking for bulk winter stock for three stores."] },
    ],
  },
  {
    id: "demo_1041",
    created_time: "2026-11-06T08:18:00+05:30",
    form_id: "form_facebook_leads",
    status: "Contacted",
    score: 78,
    campaign: "Festive Furniture Sale",
    source: "Facebook",
    assigned_to: "Priya Nair",
    tags: ["Follow up"],
    field_data: [
      { name: "full_name", values: ["Neha Kapoor"] },
      { name: "email", values: ["neha.kapoor@example.com"] },
      { name: "phone_number", values: ["+91 99887 76655"] },
      { name: "company_name", values: ["Kapoor Interiors"] },
      { name: "city", values: ["Pune"] },
      { name: "budget", values: ["Rs 25,000 - Rs 40,000"] },
      { name: "message", values: ["Needs a quote for office lounge seating."] },
    ],
  },
  {
    id: "demo_1040",
    created_time: "2026-11-05T18:05:00+05:30",
    form_id: "form_instagram_leadgen",
    status: "Qualified",
    score: 88,
    campaign: "Winter Shoe Drop",
    source: "Instagram",
    assigned_to: "Rohan Verma",
    tags: ["Enterprise", "Delhi"],
    field_data: [
      { name: "full_name", values: ["Ishaan Malhotra"] },
      { name: "email", values: ["ishaan@example.com"] },
      { name: "phone_number", values: ["+91 90000 11223"] },
      { name: "company_name", values: ["Malhotra Sports"] },
      { name: "city", values: ["New Delhi"] },
      { name: "budget", values: ["Rs 50,000+"] },
      { name: "message", values: ["Interested in a yearly supply contract."] },
    ],
  },
  {
    id: "demo_1039",
    created_time: "2026-11-05T14:30:00+05:30",
    form_id: "form_facebook_leads",
    status: "Converted",
    score: 96,
    campaign: "Diwali Gifting Campaign",
    source: "Facebook",
    assigned_to: "Priya Nair",
    tags: ["Closed won", "Gifting"],
    field_data: [
      { name: "full_name", values: ["Saanvi Iyer"] },
      { name: "email", values: ["saanvi.iyer@example.com"] },
      { name: "phone_number", values: ["+91 91234 56789"] },
      { name: "company_name", values: ["Brightside Events"] },
      { name: "city", values: ["Bengaluru"] },
      { name: "budget", values: ["Rs 1,00,000+"] },
      { name: "message", values: ["Confirmed 120 corporate gift hampers."] },
    ],
  },
  {
    id: "demo_1038",
    created_time: "2026-11-05T11:12:00+05:30",
    form_id: "form_instagram_leadgen",
    status: "New",
    score: 64,
    campaign: "Fitness Gear Launch",
    source: "Instagram",
    assigned_to: "Unassigned",
    tags: ["New market"],
    field_data: [
      { name: "full_name", values: ["Kabir Singh"] },
      { name: "email", values: ["kabir.singh@example.com"] },
      { name: "phone_number", values: ["+91 95555 44332"] },
      { name: "company_name", values: ["Pulse Gym"] },
      { name: "city", values: ["Jaipur"] },
      { name: "budget", values: ["Rs 15,000 - Rs 20,000"] },
      { name: "message", values: ["Wants samples before placing an order."] },
    ],
  },
  {
    id: "demo_1037",
    created_time: "2026-11-04T17:45:00+05:30",
    form_id: "form_facebook_leads",
    status: "Contacted",
    score: 71,
    campaign: "Festive Furniture Sale",
    source: "Facebook",
    assigned_to: "Yash Chauhan",
    tags: ["Warm lead"],
    field_data: [
      { name: "full_name", values: ["Ananya Bose"] },
      { name: "email", values: ["ananya.bose@example.com"] },
      { name: "phone_number", values: ["+91 93333 22110"] },
      { name: "company_name", values: ["Bose Design Studio"] },
      { name: "city", values: ["Kolkata"] },
      { name: "budget", values: ["Rs 30,000 - Rs 45,000"] },
      { name: "message", values: ["Requested a catalog and delivery timeline."] },
    ],
  },
];

const FIELD_KEYS = {
  name: ["full_name", "name", "first_name", "last_name"],
  email: ["email", "email_address", "work_email"],
  phone: ["phone_number", "phone", "mobile", "mobile_number"],
  company: ["company_name", "company", "business_name"],
  city: ["city", "location", "state"],
  budget: ["budget", "estimated_budget", "monthly_budget"],
  message: ["message", "notes", "comments"],
};

const STATUS_COLORS = {
  New: { background: "#eef2ff", color: "#4338ca" },
  Contacted: { background: "#e0f2fe", color: "#0369a1" },
  Qualified: { background: "#dcfce7", color: "#15803d" },
  Converted: { background: "#fef3c7", color: "#b45309" },
};

const FILTERS = ["All", "New", "Contacted", "Qualified", "Converted"];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function fieldValue(lead, keys) {
  const fields = lead.field_data || [];
  const values = fields
    .filter((field) => keys.includes(field.name))
    .flatMap((field) =>
      Array.isArray(field.values) ? field.values : [field.values]
    )
    .filter(Boolean);

  return values.join(" ");
}

function getLeadName(lead) {
  return fieldValue(lead, FIELD_KEYS.name) || `Lead ${lead.id}`;
}

function getStatus(lead) {
  return lead.status || "New";
}

function getScore(lead) {
  if (typeof lead.score === "number") {
    return lead.score;
  }

  return Math.min(99, 40 + (lead.field_data?.length || 0) * 8);
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function formatDate(value) {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()} - ${hours}:${minutes}`;
}

function isToday(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function scoreColor(score) {
  if (score >= 85) {
    return "#16a34a";
  }

  if (score >= 70) {
    return "#f59e0b";
  }

  return "#ef4444";
}

export default function App() {
  const [leads, setLeads] = useState(DUMMY_LEADS);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [isDemo, setIsDemo] = useState(true);

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/leads`);
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setLeads(data);
        setIsDemo(false);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeads();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLeads();

    const socket = io(BACKEND_URL, {
      transports: ["websocket"],
    });

    socket.on("new_lead", (lead) => {
      setIsDemo(false);
      setLeads((prev) => {
        if (prev.find((item) => item.id === lead.id)) {
          return prev;
        }

        return [lead, ...prev];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const totalLeads = leads.length;
  const todayLeads = leads.filter((lead) => isToday(lead.created_time)).length;
  const qualifiedLeads = leads.filter((lead) =>
    ["Qualified", "Converted"].includes(getStatus(lead))
  ).length;
  const hotLeads = leads.filter((lead) => getScore(lead) >= 80).length;

  const filteredLeads = leads.filter((lead) => {
    const matchesFilter =
      activeFilter === "All" || getStatus(lead) === activeFilter;

    if (!matchesFilter) {
      return false;
    }

    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    const haystack = [
      getLeadName(lead),
      fieldValue(lead, FIELD_KEYS.email),
      fieldValue(lead, FIELD_KEYS.phone),
      fieldValue(lead, FIELD_KEYS.company),
      fieldValue(lead, FIELD_KEYS.city),
      lead.campaign,
      lead.source,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });

  const renderStat = (label, value, accent) => (
    <View style={styles.statCard} key={label}>
      <View style={[styles.statAccent, { backgroundColor: accent }]} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderFilter = (filter) => {
    const isActive = activeFilter === filter;
    const count =
      filter === "All"
        ? totalLeads
        : leads.filter((lead) => getStatus(lead) === filter).length;

    return (
      <TouchableOpacity
        key={filter}
        style={[styles.filterChip, isActive && styles.filterChipActive]}
        onPress={() => setActiveFilter(filter)}
      >
        <Text
          style={[styles.filterText, isActive && styles.filterTextActive]}
        >
          {filter} {count}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => {
    const name = getLeadName(item);
    const status = getStatus(item);
    const score = getScore(item);
    const statusColors = STATUS_COLORS[status] || STATUS_COLORS.New;
    const email = fieldValue(item, FIELD_KEYS.email);
    const phone = fieldValue(item, FIELD_KEYS.phone);
    const company = fieldValue(item, FIELD_KEYS.company);
    const city = fieldValue(item, FIELD_KEYS.city);
    const budget = fieldValue(item, FIELD_KEYS.budget);
    const message = fieldValue(item, FIELD_KEYS.message);
    const tags = item.tags || [];

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>
              {company || city || "Meta Lead Ad"}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors.background },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColors.color }]}>
              {status}
            </Text>
          </View>
        </View>

        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Intent score</Text>
          <View style={styles.scoreTrack}>
            <View
              style={[
                styles.scoreFill,
                {
                  width: `${score}%`,
                  backgroundColor: scoreColor(score),
                },
              ]}
            />
          </View>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoPill}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {email || "Not provided"}
            </Text>
          </View>
          <View style={styles.infoPill}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {phone || "Not provided"}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{item.campaign || "Direct form"}</Text>
          <Text style={styles.metaDot}>|</Text>
          <Text style={styles.metaText}>{item.source || "Meta"}</Text>
          <Text style={styles.metaDot}>|</Text>
          <Text style={styles.metaText}>{formatDate(item.created_time)}</Text>
        </View>

        <View style={styles.detailGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Budget</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {budget || "-"}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>City</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {city || "-"}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Assigned to</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {item.assigned_to || "Unassigned"}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Form</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {item.form_id || "-"}
            </Text>
          </View>
        </View>

        {tags.length > 0 ? (
          <View style={styles.tagRow}>
            {tags.map((tag) => (
              <View style={styles.tag} key={tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {message ? <Text style={styles.note}>{message}</Text> : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>UNQUEUE - LEAD PIPELINE</Text>
            <Text style={styles.headerTitle}>Leads dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Track every Meta lead, owner, and follow-up in one place.
            </Text>
          </View>
          <View style={[styles.livePill, isDemo && styles.demoPill]}>
            <View style={[styles.liveDot, isDemo && styles.demoDot]} />
            <Text style={styles.liveText}>{isDemo ? "Demo" : "Live"}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {renderStat("Total leads", totalLeads, "#4f46e5")}
          {renderStat("Today", todayLeads, "#0ea5e9")}
          {renderStat("Qualified", qualifiedLeads, "#16a34a")}
          {renderStat("Hot leads", hotLeads, "#f97316")}
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search name, email, company, campaign..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map(renderFilter)}
        </ScrollView>
      </View>

      <FlatList
        data={filteredLeads}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No leads match this search or filter.
          </Text>
        }
        ListFooterComponent={
          filteredLeads.length > 0 ? (
            <Text style={styles.footerText}>
              Showing {filteredLeads.length} of {totalLeads} leads
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#6366f1",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: "#64748b",
    marginTop: 4,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  demoPill: {
    backgroundColor: "#fef3c7",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#16a34a",
    marginRight: 6,
  },
  demoDot: {
    backgroundColor: "#d97706",
  },
  liveText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  statAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  searchInput: {
    marginTop: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a",
  },
  filterRow: {
    paddingTop: 10,
    paddingBottom: 4,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterChipActive: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  filterTextActive: {
    color: "#ffffff",
  },
  listContent: {
    padding: 12,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#4f46e5",
  },
  cardHeaderText: {
    flex: 1,
    paddingRight: 8,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    marginRight: 8,
  },
  scoreTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
  },
  scoreFill: {
    height: 6,
    borderRadius: 3,
  },
  scoreValue: {
    width: 28,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  infoRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  infoPill: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 12,
    color: "#334155",
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 10,
  },
  metaText: {
    fontSize: 11,
    color: "#64748b",
  },
  metaDot: {
    fontSize: 11,
    color: "#cbd5e1",
    marginHorizontal: 6,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
  },
  detailItem: {
    width: "50%",
    marginBottom: 8,
    paddingRight: 8,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    marginTop: 2,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  tag: {
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#475569",
  },
  note: {
    marginTop: 10,
    padding: 10,
    borderRadius: 9,
    backgroundColor: "#f8fafc",
    fontSize: 12,
    lineHeight: 17,
    color: "#475569",
    fontStyle: "italic",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#64748b",
  },
  footerText: {
    textAlign: "center",
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
    marginBottom: 12,
  },
});
