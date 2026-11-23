import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View, StyleSheet } from "react-native";

interface PokemonDetails {
  name: string;
  sprites: {
    front_default: string | null;
    back_default: string | null;
  };
  types: { type: { name: string } }[];
}

function paramToString(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default function Details() {
  const params = useLocalSearchParams();
  const name = paramToString(params.name);

  const [pokemon, setPokemon] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) {
      setError("No Pokémon selected.");
      setLoading(false);
      setPokemon(null);
      return;
    }

    let cancelled = false;

    async function fetchPokemonByName(pokemonName: string) {
      setLoading(true);
      setError(null);
      setPokemon(null);
      try {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(pokemonName)}`
        );
        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Pokémon not found."
              : `Request failed (${response.status})`
          );
        }
        const data: PokemonDetails = await response.json();
        if (!cancelled) {
          setPokemon(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Something went wrong.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPokemonByName(name);

    return () => {
      cancelled = true;
    };
  }, [name]);

  return (
    <ScrollView
      contentContainerStyle={{
        gap: 16,
        padding: 16,
      }}
    >
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      )}
      {!loading && error && (
        <Text style={styles.error}>{error}</Text>
      )}
      {!loading && !error && pokemon && (
        <View style={{ gap: 12 }}>
          <Text style={styles.title}>{pokemon.name}</Text>
          <Text style={styles.subtitle}>
            {pokemon.types.map((t) => t.type.name).join(", ")}
          </Text>
          <View style={{ flexDirection: "row", gap: 16 }}>
            {pokemon.sprites.front_default ? (
              <Image
                source={{ uri: pokemon.sprites.front_default }}
                style={{ width: 150, height: 150 }}
                resizeMode="contain"
              />
            ) : null}
            {pokemon.sprites.back_default ? (
              <Image
                source={{ uri: pokemon.sprites.back_default }}
                style={{ width: 150, height: 150 }}
                resizeMode="contain"
              />
            ) : null}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textTransform: "capitalize",
  },
  error: {
    color: "#c00",
    fontSize: 16,
  },
});
