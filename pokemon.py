from pyspark.sql import SparkSession
from pyspark.sql.functions import udf
from pyspark.sql.types import FloatType, StringType

# Set up Spark
spark = SparkSession.builder.appName("PokemonDataProcessing").getOrCreate()

# Function to calculate BMI
def calculate_bmi(weight, height):
    height_in_meters = height / 10  # from decimetres to meters
    weight_in_kilograms = weight / 10  # from hectograms to kilograms
    return round(weight_in_kilograms / (height_in_meters * height_in_meters), 3)

# Register UDF for BMI calculation
calculate_bmi_udf = udf(calculate_bmi, FloatType())

# Function to capitalize first letter of a string
def capitalize_first_letter(name):
    return name.capitalize()

# Register UDF for capitalizing first letter
capitalize_first_letter_udf = udf(capitalize_first_letter, StringType())

# Data Ingestion and Transformation
pokemon_data = spark.read.json("https://pokeapi.co/api/v2/pokemon?limit=100")
pokemon_data = pokemon_data.withColumn("name", capitalize_first_letter_udf("name"))
pokemon_data = pokemon_data.withColumn("bodyMassIndex", calculate_bmi_udf("weight", "height"))

# Filter Pokemon with game index version names "Red", "Blue," "LeafGreen," and "White"
red_blue_leaf_green_white_filter = lambda game_indices: any(version["name"] in ['red', 'blue', 'leafgreen', 'white'] for version in game_indices)
filtered_pokemon_data = pokemon_data.filter(red_blue_leaf_green_white_filter(pokemon_data.game_indices))

# Extract relevant columns
selected_columns = ["id", "name", "base_experience", "height", "weight", "order", "bodyMassIndex"]
all_pokemon_data = filtered_pokemon_data.select(*selected_columns)

# Show the results
all_pokemon_data.show()

# Stop Spark Session
spark.stop()
