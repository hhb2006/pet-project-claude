// Species and breed choices for the "add a pet" form.
//
// Strictly speaking a dog is one species and the varieties are breeds, so the
// form asks for species first and then offers that species' breeds. Every list
// ends with "Mixed breed / Unknown" and "Other…" (which opens a free-text box),
// so nothing is unrecordable.

const SPECIES = [
  { value: "dog", label: "Dog", emoji: "🐶" },
  { value: "cat", label: "Cat", emoji: "🐱" },
  { value: "rabbit", label: "Rabbit", emoji: "🐰" },
  { value: "guinea pig", label: "Guinea pig", emoji: "🐹" },
  { value: "hamster", label: "Hamster", emoji: "🐹" },
  { value: "gerbil", label: "Gerbil", emoji: "🐹" },
  { value: "rat", label: "Rat", emoji: "🐀" },
  { value: "mouse", label: "Mouse", emoji: "🐭" },
  { value: "ferret", label: "Ferret", emoji: "🦦" },
  { value: "bird", label: "Bird", emoji: "🐦" },
  { value: "fish", label: "Fish", emoji: "🐠" },
  { value: "reptile", label: "Reptile", emoji: "🦎" },
  { value: "horse", label: "Horse", emoji: "🐴" },
  { value: "other", label: "Other…", emoji: "🐾" },
];

const MIXED = "Mixed breed / Unknown";
const OTHER = "Other…";

const DOG_BREEDS = [
  "Affenpinscher", "Afghan Hound", "Airedale Terrier", "Akita", "Alaskan Malamute",
  "American Bulldog", "American Bully", "American Eskimo Dog", "American Foxhound",
  "American Pit Bull Terrier", "American Staffordshire Terrier", "Anatolian Shepherd Dog",
  "Australian Cattle Dog", "Australian Kelpie", "Australian Shepherd", "Australian Terrier",
  "Basenji", "Basset Hound", "Beagle", "Bearded Collie", "Beauceron", "Bedlington Terrier",
  "Belgian Malinois", "Belgian Sheepdog", "Belgian Tervuren", "Bernese Mountain Dog",
  "Bichon Frise", "Black and Tan Coonhound", "Bloodhound", "Bluetick Coonhound",
  "Border Collie", "Border Terrier", "Borzoi", "Boston Terrier", "Bouvier des Flandres",
  "Boxer", "Boykin Spaniel", "Briard", "Brittany", "Brussels Griffon", "Bull Terrier",
  "Bulldog (English)", "Bullmastiff", "Cairn Terrier", "Canaan Dog", "Cane Corso",
  "Cardigan Welsh Corgi", "Catahoula Leopard Dog", "Cavalier King Charles Spaniel",
  "Chesapeake Bay Retriever", "Chihuahua", "Chinese Crested", "Chinese Shar-Pei",
  "Chow Chow", "Clumber Spaniel", "Cockapoo", "Cocker Spaniel (American)",
  "Cocker Spaniel (English)", "Collie", "Coton de Tulear", "Dachshund", "Dalmatian",
  "Doberman Pinscher", "Dogo Argentino", "Dogue de Bordeaux", "English Setter",
  "English Springer Spaniel", "English Toy Spaniel", "Field Spaniel", "Finnish Lapphund",
  "Finnish Spitz", "Flat-Coated Retriever", "Fox Terrier (Smooth)", "Fox Terrier (Wire)",
  "French Bulldog", "German Pinscher", "German Shepherd Dog", "German Shorthaired Pointer",
  "German Wirehaired Pointer", "Giant Schnauzer", "Golden Retriever", "Goldendoodle",
  "Gordon Setter", "Great Dane", "Great Pyrenees", "Greater Swiss Mountain Dog",
  "Greyhound", "Havanese", "Ibizan Hound", "Irish Setter", "Irish Terrier",
  "Irish Water Spaniel", "Irish Wolfhound", "Italian Greyhound", "Jack Russell Terrier",
  "Japanese Chin", "Japanese Spitz", "Keeshond", "Kerry Blue Terrier", "Komondor",
  "Kuvasz", "Labradoodle", "Labrador Retriever", "Lagotto Romagnolo", "Lakeland Terrier",
  "Leonberger", "Lhasa Apso", "Löwchen", "Maltese", "Maltipoo", "Manchester Terrier",
  "Mastiff", "Miniature American Shepherd", "Miniature Bull Terrier", "Miniature Pinscher",
  "Miniature Schnauzer", "Neapolitan Mastiff", "Newfoundland", "Norfolk Terrier",
  "Norwegian Elkhound", "Norwich Terrier", "Nova Scotia Duck Tolling Retriever",
  "Old English Sheepdog", "Otterhound", "Papillon", "Parson Russell Terrier", "Pekingese",
  "Pembroke Welsh Corgi", "Petit Basset Griffon Vendéen", "Pharaoh Hound", "Plott Hound",
  "Pointer", "Polish Lowland Sheepdog", "Pomeranian", "Pomsky", "Poodle (Miniature)",
  "Poodle (Standard)", "Poodle (Toy)", "Portuguese Water Dog", "Pug", "Puggle", "Puli",
  "Pumi", "Rat Terrier", "Redbone Coonhound", "Rhodesian Ridgeback", "Rottweiler",
  "Saint Bernard", "Saluki", "Samoyed", "Schipperke", "Scottish Deerhound",
  "Scottish Terrier", "Sealyham Terrier", "Shetland Sheepdog", "Shiba Inu", "Shih Tzu",
  "Siberian Husky", "Silky Terrier", "Skye Terrier", "Sloughi",
  "Soft Coated Wheaten Terrier", "Spanish Water Dog", "Spinone Italiano",
  "Staffordshire Bull Terrier", "Standard Schnauzer", "Sussex Spaniel", "Swedish Vallhund",
  "Tibetan Mastiff", "Tibetan Spaniel", "Tibetan Terrier", "Toy Fox Terrier",
  "Treeing Walker Coonhound", "Vizsla", "Weimaraner", "Welsh Springer Spaniel",
  "Welsh Terrier", "West Highland White Terrier", "Whippet", "Wirehaired Pointing Griffon",
  "Xoloitzcuintli", "Yorkshire Terrier",
];

const CAT_BREEDS = [
  "Abyssinian", "American Bobtail", "American Curl", "American Shorthair",
  "American Wirehair", "Balinese", "Bengal", "Birman", "Bombay", "British Longhair",
  "British Shorthair", "Burmese", "Burmilla", "Chartreux", "Cornish Rex", "Devon Rex",
  "Domestic Longhair", "Domestic Shorthair", "Egyptian Mau", "Exotic Shorthair",
  "Havana Brown", "Himalayan", "Japanese Bobtail", "Korat", "LaPerm", "Maine Coon",
  "Manx", "Munchkin", "Nebelung", "Norwegian Forest Cat", "Ocicat", "Oriental Shorthair",
  "Persian", "Peterbald", "Pixie-bob", "Ragamuffin", "Ragdoll", "Russian Blue", "Savannah",
  "Scottish Fold", "Selkirk Rex", "Siamese", "Siberian", "Singapura", "Snowshoe", "Somali",
  "Sphynx", "Tonkinese", "Toyger", "Turkish Angora", "Turkish Van",
];

const RABBIT_BREEDS = [
  "American", "American Fuzzy Lop", "Angora (English)", "Angora (French)", "Belgian Hare",
  "Britannia Petite", "Californian", "Champagne d'Argent", "Checkered Giant", "Chinchilla",
  "Dutch", "Dwarf Hotot", "English Lop", "English Spot", "Flemish Giant", "Florida White",
  "Harlequin", "Havana", "Himalayan", "Holland Lop", "Jersey Wooly", "Lionhead", "Mini Lop",
  "Mini Rex", "Mini Satin", "Netherland Dwarf", "New Zealand", "Palomino", "Polish", "Rex",
  "Rhinelander", "Satin", "Silver Fox", "Tan",
];

const BIRD_BREEDS = [
  "African Grey Parrot", "Amazon Parrot", "Budgerigar (Budgie)", "Caique", "Canary",
  "Cockatiel", "Cockatoo", "Conure", "Dove", "Eclectus", "Finch (Society)",
  "Finch (Zebra)", "Lorikeet", "Lovebird", "Macaw", "Parrotlet", "Pigeon", "Pionus",
  "Quaker Parrot",
];

const GUINEA_PIG_BREEDS = [
  "Abyssinian", "American", "Coronet", "Peruvian", "Rex", "Silkie (Sheltie)", "Skinny Pig",
  "Teddy", "Texel", "White Crested",
];

const HAMSTER_BREEDS = [
  "Chinese", "Dwarf Campbell's Russian", "Dwarf Winter White Russian", "Roborovski",
  "Syrian (Golden)",
];

const FERRET_BREEDS = ["Albino", "Black Sable", "Champagne", "Chocolate", "Cinnamon", "Panda", "Sable", "Silver"];

const HORSE_BREEDS = [
  "Appaloosa", "Arabian", "Belgian", "Clydesdale", "Connemara Pony", "Friesian",
  "Haflinger", "Hanoverian", "Icelandic", "Miniature Horse", "Morgan", "Mustang",
  "Paint Horse", "Percheron", "Quarter Horse", "Shetland Pony", "Shire", "Standardbred",
  "Tennessee Walking Horse", "Thoroughbred", "Warmblood", "Welsh Pony",
];

const REPTILE_BREEDS = [
  "Ball Python", "Bearded Dragon", "Blue-Tongued Skink", "Boa Constrictor", "Chameleon",
  "Corn Snake", "Crested Gecko", "Green Iguana", "King Snake", "Leopard Gecko",
  "Red-Eared Slider", "Russian Tortoise", "Sulcata Tortoise", "Tegu", "Uromastyx",
];

// Each list gets the two escape hatches appended.
const BREEDS = Object.fromEntries(
  Object.entries({
    dog: DOG_BREEDS,
    cat: CAT_BREEDS,
    rabbit: RABBIT_BREEDS,
    bird: BIRD_BREEDS,
    "guinea pig": GUINEA_PIG_BREEDS,
    hamster: HAMSTER_BREEDS,
    ferret: FERRET_BREEDS,
    horse: HORSE_BREEDS,
    reptile: REPTILE_BREEDS,
  }).map(([k, v]) => [k, [...v, MIXED, OTHER]])
);

function emojiFor(species) {
  const s = (species || "").toLowerCase();
  const hit = SPECIES.find(x => x.value === s);
  if (hit) return hit.emoji;
  // Fall back to a loose match for free-typed species.
  for (const x of SPECIES) if (s.includes(x.value)) return x.emoji;
  return "🐾";
}

if (typeof module !== "undefined") module.exports = { SPECIES, BREEDS, emojiFor, MIXED, OTHER };
