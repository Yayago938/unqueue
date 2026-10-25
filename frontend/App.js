import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { io } from "socket.io-client";

const BACKEND_URL = "http://[IP_Addresspasted]:8000";

export default function App() {
  const [leads, setLeads] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/leads`);
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
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
      setLeads((prev) => {
        if (prev.find((l) => l.id === lead.id)) {
          return prev;
        }
        return [lead, ...prev];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const renderItem = ({ item }) => {
    const fieldData = item.field_data || [];

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Lead {item.id}</Text>
        <Text style={styles.cardText}>Form: {item.form_id || "-"}</Text>
        <Text style={styles.cardText}>Created: {item.created_time || "-"}</Text>
        {fieldData.length > 0 ? (
          fieldData.map((field, index) => (
            <Text key={index} style={styles.cardText}>
              {field.name}: {Array.isArray(field.values) ? field.values.join(", ") : field.values}
            </Text>
          ))
        ) : (
          <Text style={styles.cardText}>{JSON.stringify(item)}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Unqueue Leads</Text>
        <Text style={styles.headerSubtitle}>{leads.length} leads</Text>
      </View>
      <FlatList
        data={leads}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No leads yet</Text>
        }
      />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  listContent: {
    padding: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#666",
  },
});
