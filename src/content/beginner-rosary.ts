export const beginnerRosaryRoute = "/learn/rosary";

export const beginnerHomeSection = {
  eyebrow: "Beginner friendly",
  title: "New to the Rosary?",
  body: "You are welcome here. Learn what the Rosary is, why Catholics pray it, and how to follow along even if you have never held one before.",
  ctas: [
    {
      label: "What is the Rosary?",
      href: beginnerRosaryRoute,
      variant: "primary",
    },
    {
      label: "Pray your first Rosary",
      href: "/pray/custom",
      variant: "secondary",
    },
    {
      label: "Learn the parts",
      href: `${beginnerRosaryRoute}#parts`,
      variant: "secondary",
    },
  ],
  paths: [
    {
      title: "I'm new",
      body: "Learn what the Rosary is and how to follow along without pretending you already know every prayer.",
      href: beginnerRosaryRoute,
    },
    {
      title: "I want to pray",
      body: "Open a simple prayer path and let the app show you what comes next.",
      href: "/pray/custom",
    },
    {
      title: "I'm leading a group",
      body: "Build, customize, and print guide cards for a Rosary walk or parish gathering.",
      href: "/builder",
    },
  ],
} as const;

export const beginnerPageIntro = {
  title: "What is the Rosary?",
  subtitle: "A simple guide for people who are new, curious, or just trying to follow along.",
  body: "If you are new to the Rosary, you are not behind. Many Catholics learn it slowly, and plenty of people have followed along at a group Rosary without knowing every prayer or every custom. Walk the Rosary is meant to help you begin without pretending you already know everything.",
} as const;

export const beginnerPageSections = [
  {
    id: "welcome",
    title: "You are welcome here",
    body: [
      "The Rosary can feel unfamiliar at first: beads, repeated prayers, mysteries, responses, and people who seem to know exactly what comes next. You do not need to master all of that before beginning.",
      "A good first step is simply to follow along, listen, and pray what you can. The rhythm becomes clearer as you pray it.",
    ],
  },
  {
    id: "sixty-seconds",
    title: "The Rosary in 60 seconds",
    body: [
      "The Rosary is a Catholic prayer that helps us meditate on the life of Jesus with Mary. It uses repeated prayers, Scripture-shaped reflection, and a set of mysteries from the Gospel.",
      "The repetition is not meant to be empty. It gives the prayer a rhythm so your mind and heart can return again and again to Christ.",
    ],
  },
  {
    id: "during-a-rosary",
    title: "What happens during a Rosary?",
    body: [
      "A full Rosary usually includes five decades. Each decade begins with one Our Father, continues with ten Hail Marys, and usually ends with a Glory Be and the Fatima Prayer.",
      "Groups often begin with the Sign of the Cross, the Apostles' Creed, an Our Father, three Hail Marys, and a Glory Be. Many groups close with the Hail Holy Queen and other customary prayers.",
    ],
  },
  {
    id: "mysteries",
    title: "What are the mysteries?",
    body: [
      "Mysteries are moments from the life of Jesus and Mary. Each decade focuses on one mystery so the repeated prayers become a setting for meditation.",
      "The traditional sets are Joyful, Sorrowful, Glorious, and Luminous. If you do not know them yet, the app can show the mystery for each decade.",
    ],
  },
  {
    id: "repeated-prayers",
    title: "Why are there repeated prayers?",
    body: [
      "The repeated prayers help you slow down and keep a steady rhythm. They are not meant to distract from Jesus, but to help you return to him while meditating on the mystery.",
      "If your mind wanders, that does not mean you failed. Gently return to the words and the mystery in front of you.",
    ],
  },
  {
    id: "physical-beads",
    title: "Do I need physical beads?",
    body: [
      "Rosary beads help you keep your place, but they are not required. You can use this site to follow the structure, count repeated prayers, or pray step by step from your phone.",
      "If you are joining a group and do not have beads, it is completely fine to follow the guide and respond when you are comfortable.",
    ],
  },
  {
    id: "non-catholics",
    title: "Can non-Catholics follow along or pray it?",
    body: [
      "You do not have to be Catholic to learn what the Rosary is or to follow along respectfully. Some prayers may feel unfamiliar at first, especially prayers asking Mary or the saints to pray for us.",
      "Catholics honor Mary and ask for her prayers, but worship belongs to God alone. It is okay to listen, learn, and pray as you are comfortable.",
    ],
  },
  {
    id: "prayers",
    title: "What if I do not know the prayers?",
    body: [
      "You do not need to memorize everything before you start. The guide can show each prayer, keep track of where you are, and help you understand what comes next.",
      "Many people learn the Rosary by praying it slowly over time. Reading the words from your phone is a normal and helpful way to begin.",
    ],
  },
] as const;

export const rosaryStructureParts = [
  {
    title: "Crucifix",
    body: "Begin with the Sign of the Cross and the Apostles' Creed.",
  },
  {
    title: "First large bead",
    body: "Pray the Our Father.",
  },
  {
    title: "Three small beads",
    body: "Pray three Hail Marys, traditionally for faith, hope, and charity.",
  },
  {
    title: "Decades",
    body: "Each decade has one Our Father, ten Hail Marys, and a Glory Be.",
  },
  {
    title: "Mysteries",
    body: "Each decade focuses on a moment from the life of Jesus and Mary.",
  },
  {
    title: "Closing prayers",
    body: "Many groups end with the Hail Holy Queen and other customary prayers.",
  },
] as const;

export const beginnerFaqs = [
  {
    question: "Do I have to be Catholic to pray the Rosary?",
    answer:
      "No. You are welcome to learn, listen, follow along, or pray as you are comfortable. Some people begin by joining only the responses they know.",
  },
  {
    question: "Is praying the Rosary worshiping Mary?",
    answer:
      "No. Catholics worship God alone. The Rosary honors Mary and asks for her prayers while meditating on the life of Jesus.",
  },
  {
    question: "Why do Catholics repeat the Hail Mary so many times?",
    answer:
      "The repetition gives the prayer a steady rhythm. It helps the person slow down and meditate on Jesus through the mysteries.",
  },
  {
    question: "What if I lose my place?",
    answer:
      "That happens to everyone. Rejoin at the next prayer you recognize, ask the leader quietly, or use the guide to see what comes next.",
  },
  {
    question: "Do I need Rosary beads?",
    answer:
      "No. Beads are helpful for counting, but you can begin with the website, a printed guide, or simply by following the leader.",
  },
  {
    question: "What if my group includes prayers I do not know?",
    answer:
      "It is fine to listen the first time. Walk the Rosary can show the prayers and short prompts so you are not left guessing.",
  },
  {
    question: "Can I just listen the first time?",
    answer:
      "Yes. Listening respectfully is a good first step, especially if the words or customs are new to you.",
  },
] as const;

export const beginnerStartLinks = [
  {
    title: "Pray with guidance",
    body: "Use a simple guide and let the app show you what comes next.",
    href: "/pray/custom",
  },
  {
    title: "Build a simple guide",
    body: "Answer a few questions and let Quick Builder create a guide for you.",
    href: "/builder",
  },
  {
    title: "Learn the parts of the Rosary",
    body: "Review the basic bead structure before you join a group or pray on your own.",
    href: "#parts",
  },
] as const;

export const beginnerResourceLink = {
  title: "New to the Rosary?",
  body: "Start with a plain-language explanation of the Rosary, the mysteries, repeated prayers, physical beads, and how to follow along.",
  href: beginnerRosaryRoute,
} as const;
