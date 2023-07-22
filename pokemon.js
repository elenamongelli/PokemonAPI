async function getPokemonData(url) {
  const response = await fetch(url);
  return response.json();
}

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
    const response = await getPokemonData(url);
    const { results } = response;
    allPokemon.push(...results);

    // Exit the loop when no more results are available
    if (results.length < 100) {
      break;
    }

    currentOffset += 100;
    url = `https://pokeapi.co/api/v2/pokemon?limit=100&offset=${currentOffset}`;
  }

  return allPokemon;
};

getAllPokemon()
  .then(async (allPokemon) => {
    const pokemonDataPromises = allPokemon.map((pokemon) =>
      getPokemonData(pokemon.url)
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
        name: pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1), // Capitalize first letter
        baseExperience: pokemonData.base_experience,
        height: pokemonData.height,
        weight: pokemonData.weight,
        order: pokemonData.order,
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

    const fs = require('fs');

    // Save the data to a JSON file
    const jsonData = JSON.stringify(allPokemonData, null, 2);
    fs.writeFileSync('pokemon_data.json', jsonData, 'utf8', (err) => {
      if (err) {
        console.error('Error writing JSON file:', err);
      } else {
        console.log('Data saved to pokemon_data.json');
      }
    });
  })
  .catch((error) => {
    console.error('Error fetching Pokemon data:', error);
  });
