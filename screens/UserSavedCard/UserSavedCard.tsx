import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Iconos de la librería Ionicons

interface UserSavedCardProps {
  user: {
    email: string;
  };
  onLogin: (email: string) => void;
  onRemove: (email: string) => void;
}

const UserSavedCard: React.FC<UserSavedCardProps> = ({ user, onLogin, onRemove }) => {
  const handleLogin = () => {
    onLogin(user.email);
  };

  const handleRemove = () => {
    onRemove(user.email);
  };

  return (
    <View style={styles.cardContainer}>
      {/* Botón de eliminar */}
      <TouchableOpacity style={styles.closeButton} onPress={handleRemove}>
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>

      {/* Icono de persona */}
      <Ionicons name="person-circle-outline" size={80} color="#0056D2" style={styles.icon} />

      {/* Email del usuario */}
      <Text style={styles.email}>{user.email}</Text>

      {/* Botón de login */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 240, // Ancho de la tarjeta
    height: 300, // Altura de la tarjeta más grande
    backgroundColor: "#F5F5F5",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    position: "relative",
    margin: 10, // Separación entre tarjetas
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 20,
    color: "#333",
  },
  icon: {
    marginBottom: 10, // Espaciado debajo del ícono
  },
  email: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20, // Espaciado debajo del email
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#002368",
    paddingVertical: 15, // Botón más grande
    paddingHorizontal: 50,
    borderRadius: 25,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18, // Fuente más grande
    fontWeight: "bold",
  },
});

export default UserSavedCard;
