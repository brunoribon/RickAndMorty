import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Button,
  TextInput,
} from "react-native";
import FirebaseAuth from "./firebase";

const firebase = new FirebaseAuth();

export default function App() {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [characterList, setCharacters] = useState([]);
  const [errorMessage, setErrorMesssage] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [screen, setScreen] = useState("login");

  const handleGetCharacters = async () => {
    setIsLoading(true);
    await fetch(`https://rickandmortyapi.com/api/character/?page=${page}`)
      .then((response) => response.json())
      .then((data) => {
        if (characterList.length > 0) {
          setCharacters((oldData) => [...oldData, ...data.results]);
        } else {
          setCharacters(data.results);
        }
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });

    setIsLoading(false);
  };

  useEffect(() => {
    firebase.appAuth.onAuthStateChanged((user) => {
      if (user) {
        setScreen("home");
      } else {
        setScreen("login");
      }
    });
    handleGetCharacters();
  }, [page]);

  const renderCharacter = ({ item }) => {
    const { name, image } = item;
    return (
      <View style={styles.chracter}>
        <Image style={styles.image} source={{ uri: image }} />
        <Text style={styles.name}>{name}</Text>
      </View>
    );
  };

  if (screen === "login") {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
        />
        <TextInput
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
        />
        {loading && <Text>Carregando...</Text>}
        {errorMessage && <Text>{errorMessage}</Text>}
        <View style={styles.row}>
          <Button
            onPress={() => {
              setLoading(true);
              firebase.handleLogin({
                auth: firebase.appAuth,
                email,
                password,
                onError: (err) => setErrorMesssage(err),
              });
              setLoading(false);
            }}
            title="Entrar"
          />
          <Button
            onPress={() => {
              setLoading(true);
              firebase.handleCreateAccount({
                auth: firebase.appAuth,
                email,
                password,
                onError: (err) => setErrorMesssage(err),
              });
              setLoading(false);
            }}
            title="Cadastrar"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button title="Sair" onPress={() => firebase.signOut()} />
      <View style={styles.row}>
        <FlatList
          data={characterList}
          keyExtractor={(item) => item.name}
          renderItem={renderCharacter}
        />
      </View>
      {isLoading && (
        <View style={styles.row}>
          <Text style={styles.name}>Carregando...</Text>
        </View>
      )}
      <Button
        disabled={isLoading}
        title="Carregar mais"
        onPress={() => setPage(page + 1)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#27272a",
    color: "#FFFFFF",
    borderRadius: 5,
    padding: 10,
    margin: 10,
    fontSize: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    width: "90%",
    gap: 2,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#18181b",
  },
  chracter: {
    flexDirection: "row",
    alignItems: "start",
    marginBottom: 10,
    width: "100%",
    backgroundColor: "#27272a",
    borderRadius: 5,
    padding: 10,
    gap: 15,
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 0,
    borderRadius: 5,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    width: "100%",
    color: "white",
  },
});
