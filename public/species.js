// Species and breed choices for the "add a pet" form.
//
// Strictly speaking a dog is one species and the varieties are breeds, so the
// form asks for species first and then offers that species' breeds. Every list
// ends with "Mixed breed / Unknown" and "Other…" (which opens a free-text box),
// so nothing is unrecordable.

const SPECIES = [
  { value: "dog", zh: "狗", label: "Dog", emoji: "🐶" },
  { value: "cat", zh: "猫", label: "Cat", emoji: "🐱" },
  { value: "rabbit", zh: "兔子", label: "Rabbit", emoji: "🐰" },
  { value: "guinea pig", zh: "豚鼠", label: "Guinea pig", emoji: "🐹" },
  { value: "hamster", zh: "仓鼠", label: "Hamster", emoji: "🐹" },
  { value: "gerbil", zh: "沙鼠", label: "Gerbil", emoji: "🐹" },
  { value: "rat", zh: "大鼠", label: "Rat", emoji: "🐀" },
  { value: "mouse", zh: "小鼠", label: "Mouse", emoji: "🐭" },
  { value: "ferret", zh: "雪貂", label: "Ferret", emoji: "🦦" },
  { value: "bird", zh: "鸟", label: "Bird", emoji: "🐦" },
  { value: "fish", zh: "鱼", label: "Fish", emoji: "🐠" },
  { value: "reptile", zh: "爬行动物", label: "Reptile", emoji: "🦎" },
  { value: "horse", zh: "马", label: "Horse", emoji: "🐴" },
  { value: "other", zh: "其他…", label: "Other…", emoji: "🐾" },
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

// The visible label follows the chosen language; the stored value stays English.
function speciesLabel(s) {
  return (typeof getLang === "function" && getLang() === "zh" && s.zh) ? s.zh : s.label;
}

// Turns a *stored* species value ("dog") into the label for the current language
// ("狗"). Species the owner typed themselves are shown back as they typed them.
function speciesDisplay(value) {
  const hit = SPECIES.find(s => s.value === String(value || "").toLowerCase());
  return hit ? speciesLabel(hit).replace(/…$/, "") : (value || "");
}

// Chinese breed names. Keyed by species because names collide across them —
// "Abyssinian" is both a cat and a guinea pig, "Rex" both a rabbit and a guinea
// pig. The stored value stays the English name; only the label is translated.
const BREED_ZH = {
  "dog": {
    "Affenpinscher": "猴面梗",
    "Afghan Hound": "阿富汗猎犬",
    "Airedale Terrier": "万能梗",
    "Akita": "秋田犬",
    "Alaskan Malamute": "阿拉斯加雪橇犬",
    "American Bulldog": "美国斗牛犬",
    "American Bully": "美国恶霸犬",
    "American Eskimo Dog": "美国爱斯基摩犬",
    "American Foxhound": "美国猎狐犬",
    "American Pit Bull Terrier": "美国比特斗牛梗",
    "American Staffordshire Terrier": "美国斯塔福梗",
    "Anatolian Shepherd Dog": "安纳托利亚牧羊犬",
    "Australian Cattle Dog": "澳大利亚牧牛犬",
    "Australian Kelpie": "澳大利亚卡尔比犬",
    "Australian Shepherd": "澳大利亚牧羊犬",
    "Australian Terrier": "澳大利亚梗",
    "Basenji": "巴仙吉犬",
    "Basset Hound": "巴吉度猎犬",
    "Beagle": "比格犬",
    "Bearded Collie": "古代长须牧羊犬",
    "Beauceron": "博斯罗牧羊犬",
    "Bedlington Terrier": "贝灵顿梗",
    "Belgian Malinois": "比利时马利诺犬",
    "Belgian Sheepdog": "比利时牧羊犬",
    "Belgian Tervuren": "比利时特弗伦犬",
    "Bernese Mountain Dog": "伯恩山犬",
    "Bichon Frise": "比熊犬",
    "Black and Tan Coonhound": "黑褐猎浣熊犬",
    "Bloodhound": "寻血猎犬",
    "Bluetick Coonhound": "蓝斑猎浣熊犬",
    "Border Collie": "边境牧羊犬",
    "Border Terrier": "边境梗",
    "Borzoi": "苏俄猎狼犬",
    "Boston Terrier": "波士顿梗",
    "Bouvier des Flandres": "法兰德斯牧牛犬",
    "Boxer": "拳师犬",
    "Boykin Spaniel": "博伊金猎犬",
    "Briard": "布里牧羊犬",
    "Brittany": "布列塔尼猎犬",
    "Brussels Griffon": "布鲁塞尔格里芬犬",
    "Bull Terrier": "牛头梗",
    "Bulldog (English)": "斗牛犬（英国）",
    "Bullmastiff": "斗牛獒",
    "Cairn Terrier": "凯恩梗",
    "Canaan Dog": "迦南犬",
    "Cane Corso": "卡斯罗犬",
    "Cardigan Welsh Corgi": "卡迪根威尔士柯基犬",
    "Catahoula Leopard Dog": "卡塔霍拉豹犬",
    "Cavalier King Charles Spaniel": "查理王小猎犬",
    "Chesapeake Bay Retriever": "切萨皮克海湾寻回犬",
    "Chihuahua": "吉娃娃",
    "Chinese Crested": "中国冠毛犬",
    "Chinese Shar-Pei": "沙皮犬",
    "Chow Chow": "松狮犬",
    "Clumber Spaniel": "克伦伯猎犬",
    "Cockapoo": "可卡贵宾犬",
    "Cocker Spaniel (American)": "可卡犬（美国）",
    "Cocker Spaniel (English)": "可卡犬（英国）",
    "Collie": "柯利牧羊犬",
    "Coton de Tulear": "棉花面纱犬",
    "Dachshund": "腊肠犬",
    "Dalmatian": "大麦町犬",
    "Doberman Pinscher": "杜宾犬",
    "Dogo Argentino": "阿根廷杜高犬",
    "Dogue de Bordeaux": "波尔多犬",
    "English Setter": "英国雪达犬",
    "English Springer Spaniel": "英国史宾格犬",
    "English Toy Spaniel": "英国玩具猎犬",
    "Field Spaniel": "田野猎犬",
    "Finnish Lapphund": "芬兰拉普猎犬",
    "Finnish Spitz": "芬兰狐狸犬",
    "Flat-Coated Retriever": "平毛寻回犬",
    "Fox Terrier (Smooth)": "猎狐梗（短毛）",
    "Fox Terrier (Wire)": "猎狐梗（刚毛）",
    "French Bulldog": "法国斗牛犬",
    "German Pinscher": "德国宾莎犬",
    "German Shepherd Dog": "德国牧羊犬",
    "German Shorthaired Pointer": "德国短毛指示犬",
    "German Wirehaired Pointer": "德国刚毛指示犬",
    "Giant Schnauzer": "巨型雪纳瑞",
    "Golden Retriever": "金毛寻回犬",
    "Goldendoodle": "金毛贵宾犬",
    "Gordon Setter": "戈登雪达犬",
    "Great Dane": "大丹犬",
    "Great Pyrenees": "大白熊犬",
    "Greater Swiss Mountain Dog": "大瑞士山地犬",
    "Greyhound": "灵缇犬",
    "Havanese": "哈瓦那犬",
    "Ibizan Hound": "依比沙猎犬",
    "Irish Setter": "爱尔兰雪达犬",
    "Irish Terrier": "爱尔兰梗",
    "Irish Water Spaniel": "爱尔兰水猎犬",
    "Irish Wolfhound": "爱尔兰猎狼犬",
    "Italian Greyhound": "意大利灵缇犬",
    "Jack Russell Terrier": "杰克罗素梗",
    "Japanese Chin": "日本狆",
    "Japanese Spitz": "日本尖嘴犬",
    "Keeshond": "荷兰毛狮犬",
    "Kerry Blue Terrier": "凯利蓝梗",
    "Komondor": "可蒙犬",
    "Kuvasz": "库瓦兹犬",
    "Labradoodle": "拉布拉多贵宾犬",
    "Labrador Retriever": "拉布拉多寻回犬",
    "Lagotto Romagnolo": "罗马涅水犬",
    "Lakeland Terrier": "湖畔梗",
    "Leonberger": "莱昂贝格犬",
    "Lhasa Apso": "拉萨犬",
    "Löwchen": "罗秦犬",
    "Maltese": "马尔济斯犬",
    "Maltipoo": "马尔济斯贵宾犬",
    "Manchester Terrier": "曼彻斯特梗",
    "Mastiff": "獒犬",
    "Miniature American Shepherd": "迷你美国牧羊犬",
    "Miniature Bull Terrier": "迷你牛头梗",
    "Miniature Pinscher": "迷你杜宾犬",
    "Miniature Schnauzer": "迷你雪纳瑞",
    "Neapolitan Mastiff": "那不勒斯獒",
    "Newfoundland": "纽芬兰犬",
    "Norfolk Terrier": "诺福克梗",
    "Norwegian Elkhound": "挪威猎麋犬",
    "Norwich Terrier": "诺维奇梗",
    "Nova Scotia Duck Tolling Retriever": "新斯科舍诱鸭寻回犬",
    "Old English Sheepdog": "古代英国牧羊犬",
    "Otterhound": "猎水獭犬",
    "Papillon": "蝴蝶犬",
    "Parson Russell Terrier": "帕森罗素梗",
    "Pekingese": "北京犬",
    "Pembroke Welsh Corgi": "彭布罗克威尔士柯基犬",
    "Petit Basset Griffon Vendéen": "小型旺代格里芬短腿猎犬",
    "Pharaoh Hound": "法老王猎犬",
    "Plott Hound": "普罗特猎犬",
    "Pointer": "指示犬",
    "Polish Lowland Sheepdog": "波兰低地牧羊犬",
    "Pomeranian": "博美犬",
    "Pomsky": "博美哈士奇",
    "Poodle (Miniature)": "贵宾犬（迷你型）",
    "Poodle (Standard)": "贵宾犬（标准型）",
    "Poodle (Toy)": "贵宾犬（玩具型）",
    "Portuguese Water Dog": "葡萄牙水犬",
    "Pug": "巴哥犬",
    "Puggle": "巴哥比格犬",
    "Puli": "波利犬",
    "Pumi": "波密犬",
    "Rat Terrier": "捕鼠梗",
    "Redbone Coonhound": "红骨猎浣熊犬",
    "Rhodesian Ridgeback": "罗得西亚脊背犬",
    "Rottweiler": "罗威纳犬",
    "Saint Bernard": "圣伯纳犬",
    "Saluki": "萨路基猎犬",
    "Samoyed": "萨摩耶犬",
    "Schipperke": "比利时小型牧羊犬",
    "Scottish Deerhound": "苏格兰猎鹿犬",
    "Scottish Terrier": "苏格兰梗",
    "Sealyham Terrier": "西里汉梗",
    "Shetland Sheepdog": "喜乐蒂牧羊犬",
    "Shiba Inu": "柴犬",
    "Shih Tzu": "西施犬",
    "Siberian Husky": "西伯利亚雪橇犬",
    "Silky Terrier": "丝毛梗",
    "Skye Terrier": "斯凯梗",
    "Sloughi": "斯罗基猎犬",
    "Soft Coated Wheaten Terrier": "软毛麦色梗",
    "Spanish Water Dog": "西班牙水犬",
    "Spinone Italiano": "意大利刚毛指示犬",
    "Staffordshire Bull Terrier": "斯塔福斗牛梗",
    "Standard Schnauzer": "标准雪纳瑞",
    "Sussex Spaniel": "苏塞克斯猎犬",
    "Swedish Vallhund": "瑞典牧牛犬",
    "Tibetan Mastiff": "藏獒",
    "Tibetan Spaniel": "西藏猎犬",
    "Tibetan Terrier": "西藏梗",
    "Toy Fox Terrier": "玩具猎狐梗",
    "Treeing Walker Coonhound": "树丛浣熊猎犬",
    "Vizsla": "维兹拉犬",
    "Weimaraner": "威玛猎犬",
    "Welsh Springer Spaniel": "威尔士史宾格犬",
    "Welsh Terrier": "威尔士梗",
    "West Highland White Terrier": "西高地白梗",
    "Whippet": "惠比特犬",
    "Wirehaired Pointing Griffon": "刚毛指示格里芬犬",
    "Xoloitzcuintli": "墨西哥无毛犬",
    "Yorkshire Terrier": "约克夏梗",
  },
  "cat": {
    "Abyssinian": "阿比西尼亚猫",
    "American Bobtail": "美国短尾猫",
    "American Curl": "美国卷耳猫",
    "American Shorthair": "美国短毛猫",
    "American Wirehair": "美国刚毛猫",
    "Balinese": "巴厘猫",
    "Bengal": "孟加拉豹猫",
    "Birman": "伯曼猫",
    "Bombay": "孟买猫",
    "British Longhair": "英国长毛猫",
    "British Shorthair": "英国短毛猫",
    "Burmese": "缅甸猫",
    "Burmilla": "博美拉猫",
    "Chartreux": "沙特尔猫",
    "Cornish Rex": "康沃尔卷毛猫",
    "Devon Rex": "德文卷毛猫",
    "Domestic Longhair": "家养长毛猫",
    "Domestic Shorthair": "家养短毛猫",
    "Egyptian Mau": "埃及猫",
    "Exotic Shorthair": "异国短毛猫",
    "Havana Brown": "哈瓦那棕猫",
    "Himalayan": "喜马拉雅猫",
    "Japanese Bobtail": "日本短尾猫",
    "Korat": "科拉特猫",
    "LaPerm": "拉邦猫",
    "Maine Coon": "缅因猫",
    "Manx": "曼岛猫",
    "Munchkin": "曼基康猫",
    "Nebelung": "内华绒猫",
    "Norwegian Forest Cat": "挪威森林猫",
    "Ocicat": "欧西猫",
    "Oriental Shorthair": "东方短毛猫",
    "Persian": "波斯猫",
    "Peterbald": "彼得秃猫",
    "Pixie-bob": "皮克西短尾猫",
    "Ragamuffin": "褴褛猫",
    "Ragdoll": "布偶猫",
    "Russian Blue": "俄罗斯蓝猫",
    "Savannah": "热带草原猫",
    "Scottish Fold": "苏格兰折耳猫",
    "Selkirk Rex": "塞尔凯克卷毛猫",
    "Siamese": "暹罗猫",
    "Siberian": "西伯利亚猫",
    "Singapura": "新加坡猫",
    "Snowshoe": "雪鞋猫",
    "Somali": "索马里猫",
    "Sphynx": "斯芬克斯无毛猫",
    "Tonkinese": "东奇尼猫",
    "Toyger": "玩具虎猫",
    "Turkish Angora": "土耳其安哥拉猫",
    "Turkish Van": "土耳其梵猫",
  },
  "rabbit": {
    "American": "美国兔",
    "American Fuzzy Lop": "美国绒毛垂耳兔",
    "Angora (English)": "安哥拉兔（英国）",
    "Angora (French)": "安哥拉兔（法国）",
    "Belgian Hare": "比利时野兔",
    "Britannia Petite": "英国小型兔",
    "Californian": "加利福尼亚兔",
    "Champagne d'Argent": "香槟银兔",
    "Checkered Giant": "格子巨兔",
    "Chinchilla": "银栗兔",
    "Dutch": "荷兰兔",
    "Dwarf Hotot": "侏儒海棠兔",
    "English Lop": "英国垂耳兔",
    "English Spot": "英国斑点兔",
    "Flemish Giant": "佛兰德巨兔",
    "Florida White": "佛罗里达白兔",
    "Harlequin": "花斑兔",
    "Havana": "哈瓦那兔",
    "Himalayan": "喜马拉雅兔",
    "Holland Lop": "荷兰垂耳兔",
    "Jersey Wooly": "泽西长毛兔",
    "Lionhead": "狮子头兔",
    "Mini Lop": "迷你垂耳兔",
    "Mini Rex": "迷你雷克斯兔",
    "Mini Satin": "迷你缎毛兔",
    "Netherland Dwarf": "荷兰侏儒兔",
    "New Zealand": "新西兰兔",
    "Palomino": "帕洛米诺兔",
    "Polish": "波兰兔",
    "Rex": "雷克斯兔",
    "Rhinelander": "莱茵兰兔",
    "Satin": "缎毛兔",
    "Silver Fox": "银狐兔",
    "Tan": "褐兔",
  },
  "bird": {
    "African Grey Parrot": "非洲灰鹦鹉",
    "Amazon Parrot": "亚马逊鹦鹉",
    "Budgerigar (Budgie)": "虎皮鹦鹉",
    "Caique": "凯克鹦鹉",
    "Canary": "金丝雀",
    "Cockatiel": "玄凤鹦鹉",
    "Cockatoo": "凤头鹦鹉",
    "Conure": "锥尾鹦鹉",
    "Dove": "鸠鸽",
    "Eclectus": "折衷鹦鹉",
    "Finch (Society)": "十姐妹",
    "Finch (Zebra)": "斑胸草雀",
    "Lorikeet": "吸蜜鹦鹉",
    "Lovebird": "牡丹鹦鹉",
    "Macaw": "金刚鹦鹉",
    "Parrotlet": "小鹦哥",
    "Pigeon": "鸽子",
    "Pionus": "派翁尼斯鹦鹉",
    "Quaker Parrot": "和尚鹦鹉",
  },
  "guinea pig": {
    "Abyssinian": "阿比西尼亚豚鼠",
    "American": "美国豚鼠",
    "Coronet": "冠毛豚鼠",
    "Peruvian": "秘鲁豚鼠",
    "Rex": "雷克斯豚鼠",
    "Silkie (Sheltie)": "丝毛豚鼠",
    "Skinny Pig": "无毛豚鼠",
    "Teddy": "泰迪豚鼠",
    "Texel": "特塞尔豚鼠",
    "White Crested": "白冠豚鼠",
  },
  "hamster": {
    "Chinese": "中国仓鼠",
    "Dwarf Campbell's Russian": "坎贝尔侏儒仓鼠",
    "Dwarf Winter White Russian": "冬白侏儒仓鼠",
    "Roborovski": "罗伯罗夫斯基仓鼠",
    "Syrian (Golden)": "叙利亚仓鼠（金丝熊）",
  },
  "ferret": {
    "Albino": "白化色",
    "Black Sable": "黑貂色",
    "Champagne": "香槟色",
    "Chocolate": "巧克力色",
    "Cinnamon": "肉桂色",
    "Panda": "熊猫色",
    "Sable": "貂色",
    "Silver": "银色",
  },
  "horse": {
    "Appaloosa": "阿帕卢萨马",
    "Arabian": "阿拉伯马",
    "Belgian": "比利时马",
    "Clydesdale": "克莱兹代尔马",
    "Connemara Pony": "康尼马拉矮马",
    "Friesian": "弗里斯兰马",
    "Haflinger": "哈弗林格马",
    "Hanoverian": "汉诺威马",
    "Icelandic": "冰岛马",
    "Miniature Horse": "迷你马",
    "Morgan": "摩根马",
    "Mustang": "野马",
    "Paint Horse": "花马",
    "Percheron": "佩尔什马",
    "Quarter Horse": "夸特马",
    "Shetland Pony": "设得兰矮马",
    "Shire": "夏尔马",
    "Standardbred": "标准竞速马",
    "Tennessee Walking Horse": "田纳西走马",
    "Thoroughbred": "纯血马",
    "Warmblood": "温血马",
    "Welsh Pony": "威尔士矮马",
  },
  "reptile": {
    "Ball Python": "球蟒",
    "Bearded Dragon": "鬃狮蜥",
    "Blue-Tongued Skink": "蓝舌石龙子",
    "Boa Constrictor": "红尾蚺",
    "Chameleon": "变色龙",
    "Corn Snake": "玉米蛇",
    "Crested Gecko": "睫角守宫",
    "Green Iguana": "绿鬣蜥",
    "King Snake": "王蛇",
    "Leopard Gecko": "豹纹守宫",
    "Red-Eared Slider": "巴西龟",
    "Russian Tortoise": "俄罗斯陆龟",
    "Sulcata Tortoise": "苏卡达陆龟",
    "Tegu": "泰加蜥",
    "Uromastyx": "王者蜥",
  },
  _common: {
    "Mixed breed / Unknown": "混种／不确定",
    "Other…": "其他…",
  },
};

// Orders breeds by the label the user actually reads, keeping the two escape
// hatches pinned to the bottom. Chinese sorts by pinyin.
function sortedBreeds(species, breeds) {
  const escapes = breeds.filter(b => b === MIXED || b === OTHER);
  const body = breeds.filter(b => b !== MIXED && b !== OTHER);
  const locale = (typeof getLang === "function" && getLang() === "zh") ? "zh-Hans" : "en";
  body.sort((a, b) => breedLabel(species, a).localeCompare(breedLabel(species, b), locale));
  return [...body, ...escapes];
}

// A breed name in the current language. Unknown/hand-typed breeds pass through.
function breedLabel(species, breed) {
  if (typeof getLang !== "function" || getLang() !== "zh" || !breed) return breed || "";
  const table = BREED_ZH[String(species || "").toLowerCase()];
  return (table && table[breed]) || BREED_ZH._common[breed] || breed;
}

function emojiFor(species) {
  const s = (species || "").toLowerCase();
  const hit = SPECIES.find(x => x.value === s);
  if (hit) return hit.emoji;
  // Fall back to a loose match for free-typed species.
  for (const x of SPECIES) if (s.includes(x.value)) return x.emoji;
  return "🐾";
}

// Wires a species <select> to a searchable breed input. Its datalist lets the
// user type to filter or choose from the same field, while still accepting a
// breed that is not in the curated list.
function wireSpeciesBreed({ speciesSel, speciesOther, breedInput, breedList }) {
  speciesSel.innerHTML = `<option value="" disabled selected>${typeof t === "function" ? t("species_ph") : "Species…"}</option>`;
  for (const s of SPECIES) {
    const o = document.createElement("option");
    o.value = s.value;
    o.textContent = `${s.emoji}  ${speciesLabel(s)}`;
    speciesSel.appendChild(o);
  }

  function populateBreeds(species, selected) {
    breedInput.value = "";
    breedList.innerHTML = "";
    const breeds = BREEDS[species];
    if (breeds) {
      for (const b of sortedBreeds(species, breeds).filter(b => b !== OTHER)) {
        const o = document.createElement("option");
        o.value = breedLabel(species, b);
        // In Chinese, keep the canonical English name searchable too.
        if (o.value !== b) o.label = b;
        breedList.appendChild(o);
      }
    }
    breedInput.placeholder = breeds
      ? (typeof t === "function" ? t("breed_ph") : "Search or choose a breed…")
      : (typeof t === "function" ? t("breed_optional_ph") : "Breed (optional)");
    breedInput.style.display = species ? "block" : "none";
    if (selected) breedInput.value = breeds && breeds.includes(selected)
      ? breedLabel(species, selected)
      : selected;
  }

  speciesSel.addEventListener("change", () => {
    const v = speciesSel.value;
    speciesOther.style.display = v === "other" ? "block" : "none";
    if (v === "other") speciesOther.value = "";
    populateBreeds(v);
  });

  function canonicalBreed(species, value) {
    const typed = String(value || "").trim();
    const breeds = BREEDS[species] || [];
    const folded = typed.toLocaleLowerCase();
    const match = breeds.find(b =>
      b !== OTHER && [b, breedLabel(species, b)]
        .some(label => label.toLocaleLowerCase() === folded)
    );
    return match || typed;
  }

  return {
    getSpecies() {
      return speciesSel.value === "other" ? speciesOther.value.trim() : (speciesSel.value || "");
    },
    getBreed() {
      return canonicalBreed(speciesSel.value, breedInput.value);
    },
    setValues(species, breed) {
      if (!species) { this.reset(); return; }
      if (SPECIES.some(s => s.value === species)) {
        speciesSel.value = species;
        speciesOther.style.display = "none";
        speciesOther.value = "";
        populateBreeds(species, breed);
      } else {
        // A species typed by hand — restore it into the "Other…" box.
        speciesSel.value = "other";
        speciesOther.style.display = "block";
        speciesOther.value = species;
        populateBreeds("other", breed);
      }
    },
    reset() {
      speciesSel.selectedIndex = 0;
      speciesOther.value = ""; speciesOther.style.display = "none";
      breedInput.value = ""; breedInput.style.display = "none";
      breedList.innerHTML = "";
    },
  };
}

if (typeof module !== "undefined") module.exports = { SPECIES, BREEDS, BREED_ZH, emojiFor, speciesLabel, speciesDisplay, breedLabel, sortedBreeds, MIXED, OTHER };
