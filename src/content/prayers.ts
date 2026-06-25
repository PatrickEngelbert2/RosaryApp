import type { Prayer } from "@/lib/rosary/types";

export const prayers: Prayer[] = [
  {
    id: "sign-of-the-cross",
    title: "Sign of the Cross",
    incipit: "In the name of the Father...",
    text: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
    shortText: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
    category: "opening",
  },
  {
    id: "apostles-creed",
    title: "Apostles' Creed",
    incipit: "I believe in God...",
    text: "I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; he descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from there he will come to judge the living and the dead.\n\nI believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.",
    shortText: "I believe in God, the Father almighty, Creator of heaven and earth...",
    category: "opening",
  },
  {
    id: "our-father",
    title: "Our Father",
    incipit: "Our Father...",
    text: "Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven.\n\nGive us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",
    shortText: "Our Father, who art in heaven, hallowed be thy name...",
    category: "decade",
  },
  {
    id: "hail-mary",
    title: "Hail Mary",
    incipit: "Hail Mary...",
    text: "Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus.\n\nHoly Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
    shortText: "Hail Mary, full of grace, the Lord is with thee...",
    category: "decade",
  },
  {
    id: "glory-be",
    title: "Glory Be",
    incipit: "Glory be...",
    text: "Glory be to the Father, and to the Son, and to the Holy Spirit.\n\nAs it was in the beginning, is now, and ever shall be, world without end. Amen.",
    shortText: "Glory be to the Father, and to the Son, and to the Holy Spirit.",
    category: "decade",
  },
  {
    id: "fatima-prayer",
    title: "Fatima Prayer",
    incipit: "O my Jesus...",
    text: "O my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to heaven, especially those in most need of thy mercy. Amen.",
    shortText: "O my Jesus, forgive us our sins, save us from the fires of hell...",
    category: "decade",
  },
  {
    id: "hail-holy-queen",
    title: "Hail Holy Queen",
    incipit: "Hail, holy Queen...",
    text: "Hail, holy Queen, Mother of mercy, our life, our sweetness, and our hope. To thee do we cry, poor banished children of Eve; to thee do we send up our sighs, mourning and weeping in this valley of tears.\n\nTurn then, most gracious advocate, thine eyes of mercy toward us; and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.",
    shortText: "Hail, holy Queen, Mother of mercy, our life, our sweetness, and our hope...",
    category: "closing",
  },
  {
    id: "closing-prayer",
    title: "Closing Prayer",
    incipit: "O God, whose Only Begotten Son...",
    text: "O God, whose only begotten Son, by his life, death, and resurrection, has purchased for us the rewards of eternal life, grant, we beseech thee, that while meditating on these mysteries of the most holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise, through the same Christ our Lord. Amen.",
    shortText: "O God, whose Only Begotten Son...",
    category: "closing",
  },
  {
    id: "memorare",
    title: "Memorare",
    incipit: "Remember, O most gracious Virgin Mary...",
    text: "Remember, O most gracious Virgin Mary, that never was it known that anyone who fled to thy protection, implored thy help, or sought thine intercession was left unaided.\n\nInspired by this confidence, I fly unto thee, O Virgin of virgins, my Mother. To thee do I come, before thee I stand, sinful and sorrowful. O Mother of the Word Incarnate, despise not my petitions, but in thy mercy hear and answer me. Amen.",
    shortText: "Remember, O most gracious Virgin Mary, that never was it known...",
    category: "optional",
  },
  {
    id: "st-michael-prayer",
    title: "St. Michael Prayer",
    incipit: "St. Michael the Archangel...",
    text: "St. Michael the Archangel, defend us in battle. Be our protection against the wickedness and snares of the devil.\n\nMay God rebuke him, we humbly pray, and do thou, O Prince of the heavenly hosts, by the power of God, cast into hell Satan, and all the evil spirits, who prowl about the world seeking the ruin of souls. Amen.",
    shortText: "St. Michael the Archangel, defend us in battle.",
    category: "optional",
  },
];

export const prayersById = Object.fromEntries(
  prayers.map((prayer) => [prayer.id, prayer]),
) as Record<Prayer["id"], Prayer>;
