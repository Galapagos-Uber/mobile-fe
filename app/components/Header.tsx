import React from "react";
import { View, StyleSheet } from "react-native";
import { Appbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const Header: React.FC<{ title: string; backButton?: boolean }> = ({
  title,
  backButton,
}) => {
  const navigation = useNavigation();

  return (
    <Appbar.Header style={styles.header}>
      {backButton && (
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
          color="black"
          size={20}
        />
      )}
      <Appbar.Content
        title={title}
        titleStyle={styles.headerTitle}
        style={styles.headerContent}
      />
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "white",
  },
  headerTitle: {
    fontWeight: "bold",
    fontSize: 20,
    color: "black",
    textAlign: "left",
  },
  headerContent: {
    alignItems: "flex-start",
  },
});

export default Header;
