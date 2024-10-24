import { BaseCard } from "../../types/game";
import { moveCardToZoneReturnState } from "../actions";

const SapphireCards: BaseCard[] = [
    {
        implemented: true,
        slug: "hades-infernal-schemer",
        url: "/cards/hades-infernal-schemer.jpg",
        name: "Hades",
        title: "Infernal Schemer",
        characteristics: ["dreamborn", "villain", "deity"],
        text: [
            "~~IS THERE A DOWNSIDE TO THIS?~~ When you play this character, you may put chosen opposing character into their player's inkwell facedown.",
        ],
        type: "character",
        flavor: "“He's gotta have a weakness, because everybody's got a weakness.”",
        color: "sapphire",
        cost: 7,
        strength: 3,
        willpower: 6,
        lore: 2,
        language: "EN",
        illustrator: "Matthew Robert Davies",
        number: 147,
        set: "TFC",
        rarity: "legendary",
        abilities: [
            {
                type: "triggered",
                prompt: "Choose a character to put into their player's inkwell.",
                trigger: "play",
                condition: (_, eventCard, thisCard) => {
                    return eventCard?.id === thisCard.id;
                },
                options: {
                    zone: "field",
                    player: "opponent",
                    match: { type: "character" },
                },
                callback: ({ gameState, selectedOption }) => {
                    if (!selectedOption) {
                        return { ...gameState };
                    }

                    return moveCardToZoneReturnState(
                        gameState,
                        "field",
                        "inkwell",
                        selectedOption
                    );
                },
            },
        ],
        staticAbilities: {
            sing: { active: true },
            challenger: { active: false },
            evasive: { active: false },
            resist: { active: false },
            bodyguard: { active: false },
            reckless: { active: false },
        },
        inkwell: false,
        modifiers: [],
    },
];

export default SapphireCards;
