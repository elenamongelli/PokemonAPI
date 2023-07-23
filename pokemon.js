const calculateBMI = (weight, height) => {
  const heightInMeters = height / 10; // from decimetres to meters
  const weightInKilograms = weight / 10; // from hectograms to kilograms
  return +(weightInKilograms / (heightInMeters * heightInMeters)).toFixed(3);
};

const getAllPokemon = async () => {
  const allPokemon = [];

  let url = 'https://pokeapi.co/api/v2/pokemon?limit=100';
  let currentOffset = 0;

  while (true) {
    // Use dynamic import() to load "node-fetch" module
    const fetch = await import('node-fetch');
    const response = await fetch.default(url);
    const { results } = await response.json();
    allPokemon.push(...results);

    if (results.length == 0) {
      break;
    }

    currentOffset += 100;
    url = `https://pokeapi.co/api/v2/pokemon?limit=100&offset=${currentOffset}`;
  }

  return allPokemon;
};

(async () => {
  // Use dynamic import() to load "node-fetch" module
  const fetch = await import('node-fetch').then((module) => module.default);

  try {
    const allPokemon = await getAllPokemon();
    const pokemonDataPromises = allPokemon.map((pokemon) =>
      fetch(pokemon.url).then((response) => response.json())
    );

    const pokemonDataList = await Promise.all(pokemonDataPromises);

    // Filter Pokemon with game index version names "Red", "Blue," "LeafGreen," and "White"
    const redBlueLeafGreenWhitePokemon = pokemonDataList.filter((pokemonData) =>
      pokemonData.game_indices.some(
        (gameIndex) =>
          ['red', 'blue', 'leafgreen', 'white'].includes(gameIndex.version.name)
      )
    );

    const allPokemonData = redBlueLeafGreenWhitePokemon.map((pokemonData) => {
      const typeSlot1 = pokemonData.types.find((type) => type.slot === 1)?.type.name || null;
      const typeSlot2 = pokemonData.types.find((type) => type.slot === 2)?.type.name || null;

      return {
        id: pokemonData.id,
        name: pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1),
        baseExperience: pokemonData.base_experience,
        height: pokemonData.height,
        weight: pokemonData.weight,
        pokedexOrder: pokemonData.order,
        bodyMassIndex: calculateBMI(pokemonData.weight, pokemonData.height),
        spriteUrl: pokemonData.sprites.front_default,
        typeSlot1: typeSlot1,
        typeSlot2: typeSlot2,
        versions: pokemonData.game_indices
          .filter((gameIndex) => ['red', 'blue', 'leafgreen', 'white'].includes(gameIndex.version.name))
          .map((gameIndex) => gameIndex.version.name),
      };
    });

    console.log('All Pokemon Data:', allPokemonData);

    const fs = await import('fs').then((module) => module.default);

    // Save the data to a JSON file
    const jsonData = JSON.stringify(allPokemonData, null, 2);
    fs.writeFileSync('pokemon_data.json', jsonData, 'utf8', (err) => {
      if (err) {
        console.error('Error writing JSON file:', err);
      } else {
        console.log('Data saved to pokemon_data.json');
      }
    });
  } catch (error) {
    console.error('Error fetching Pokemon data:', error);
  }
})();
