import React from "react";
import { View, Modal, StyleSheet, TouchableOpacity } from "react-native";
import { Text, IconButton } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import commonStyles from "../styles/commonStyles";
import { useAuth } from "../context/AuthContext";

interface MoreOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}

const MoreOptionsModal: React.FC<MoreOptionsModalProps> = ({
  visible,
  onClose,
  navigation,
}) => {
  const { signOut } = useAuth();

  const handleNavigation = (screen: string) => {
    navigation.navigate(screen);
    onClose();
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
    navigation.navigate("Login");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={commonStyles.headerTitle}>More</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconButton
                icon="close"
                size={24}
                iconColor="black"
                style={styles.closeIconButton}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleNavigation("Help")}
          >
            <Text style={commonStyles.sectionTitle}>Help</Text>
            <Icon
              name="book-outline"
              size={24}
              color="black"
              style={styles.optionIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleNavigation("Settings")}
          >
            <Text style={commonStyles.sectionTitle}>Settings</Text>
            <Icon
              name="cog-outline"
              size={24}
              color="black"
              style={styles.optionIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={handleLogout}>
            <Text style={[commonStyles.sectionTitle, { color: "red" }]}>
              Log out
            </Text>
            <Icon
              name="logout"
              size={24}
              color="red"
              style={styles.optionIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    width: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    fontFamily: "JosefinSans_400Regular",
  },
  closeButton: {
    alignSelf: "flex-end",
    backgroundColor: "white",
    borderRadius: 50,
  },
  closeIconButton: {
    backgroundColor: "white",
    borderRadius: 50,
    padding: 0,
    margin: 0,
  },
  optionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
  },
  optionIcon: {
    marginLeft: "auto",
  },
});

export default MoreOptionsModal;
