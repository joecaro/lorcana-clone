"use client";
import React, { useEffect } from "react";
import { DndContext, DragEndEvent, useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import CardComp from "./card";
import useGameStore from "@/lib/lorcana/store";
import Hand from "./hand";
import { Shield } from "lucide-react";
import Deck from "./deck";
import {
    Action,
    Card as CardType,
    ParamPlayer,
    Player,
} from "@/lib/lorcana/types/game";
import { computeAvailableActions, isCard } from "@/lib/lorcana/store/utils";
import {
    moveCardToZone,
    PLAYER_ACTIONS,
    processOptionSelect,
} from "@/lib/lorcana/store/actions";
import { Card } from "../ui/card";
import CardSelect from "./card-select";
import useGameInitializer from "./initializer";

type DropZoneProps = {
    id: string;
    cards: CardType[];
    className?: string;
    hideCardDetails?: boolean;
    square?: boolean;
    inkwell?: boolean;
};

const DropZone: React.FC<DropZoneProps> = ({
    id,
    cards,
    className,
    hideCardDetails,
    square,
    inkwell,
}) => {
    const { setNodeRef } = useDroppable({
        id: id,
    });
    const players = useGameStore(state => state.players);
    const currentPlayerIndex = useGameStore(state => state.currentPlayer);
    const availableInk = players[currentPlayerIndex].availableInk;
    const usedInk = (idx: number) =>
        cards.length - Math.abs(cards.length - availableInk) < idx + 1 &&
        inkwell;

    return (
        <motion.div
            ref={setNodeRef}
            layout
            className={`h-14 lg:h-32 m-2 p-2 rounded-lg flex flex-wrap gap-2 items-start ${className}`}
        >
            {cards.map((card, idx) => (
                <CardComp
                    card={card}
                    hideCardDetails={hideCardDetails}
                    square={square}
                    style={usedInk(idx) ? { opacity: ".3" } : {}}
                    key={"drop" + id + card.id}
                />
            ))}
        </motion.div>
    );
};

export default function Game({
    player1,
    player2,
}: {
    player1: ParamPlayer;
    player2: ParamPlayer;
}) {
    useGameInitializer({ player1, player2 });
    const players = useGameStore(state => state.players);
    const currentPlayerIndex = useGameStore(state => state.currentPlayer);
    const inputStage = useGameStore(state => state.inputStage);

    const currentPlayer = players[currentPlayerIndex];
    const opponent = players[currentPlayerIndex === 1 ? 0 : 1];

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return; // If no valid drop target, ignore the event

        const cardToMove =
            currentPlayer.hand.find(card => card.id === active.id) ||
            currentPlayer.field.find(card => card.id === active.id) ||
            currentPlayer.inkwell.find(card => card.id === active.id);

        if (!cardToMove) return; // No card found to move, do nothing

        const sourceZone = ["hand", "field", "inkwell"].find(zone =>
            (currentPlayer[zone as keyof Player] as CardType[]).some(
                card => card.id === active.id
            )
        );

        const targetZone = over.id as keyof Player;

        if (sourceZone && targetZone && sourceZone !== targetZone) {
            // Move card to a new zone
            moveCardToZone(
                sourceZone as "inkwell" | "hand" | "field",
                targetZone as "inkwell" | "hand" | "field",
                cardToMove
            );
        } else if (sourceZone) {
            // Card was dropped back into the same zone
            console.info("Card was dropped back into the same zone");
        }
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className='h-screen max-h-screen overflow-hidden p-8'>
                <div className='grid'>
                    {/* opponent */}
                    <div className='flex'>
                        <span className='relative'>
                            <Shield size={40} />
                            <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                                {opponent.lore}
                            </span>
                        </span>
                    </div>
                    {/* opponent field */}
                    <div>
                        <DropZone
                            id='none'
                            cards={opponent.field}
                            square
                            className='bg-green-100 bg-opacity-20'
                        />
                    </div>
                    {/* player field */}
                    <DropZone
                        id='field'
                        cards={currentPlayer.field}
                        square
                        className='bg-green-100 bg-opacity-20'
                    />
                    {/* player */}
                    <DropZone
                        id='inkwell'
                        cards={currentPlayer.inkwell}
                        hideCardDetails
                        square
                        inkwell
                        className='bg-purple-100 bg-opacity-20'
                    />
                </div>
                <div className='flex'>
                    <span className='relative'>
                        <Shield size={40} />
                        <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                            {currentPlayer.lore}
                        </span>
                    </span>
                </div>
                <div className='mt-8 text-center flex gap-2'>
                    <Deck />
                    <Hand />
                    <Options />
                </div>
            </div>
            {inputStage && inputStage.showDialogue ? (
                <CardSelect inputStage={inputStage} />
            ) : null}
        </DndContext>
    );
}

const OptionKeybinds: Record<string, Action> = {
    p: "play",
    i: "ink",
    e: "pass",
    a: "ability",
    c: "cancel",
    q: "quest",
    h: "challenge",
    x: "end_game",
};

const Options = () => {
    const attackingPlayer = useGameStore(state => state.attacker);
    const availableActions = computeAvailableActions(useGameStore.getState());
    const inputStage = useGameStore(state => state.inputStage);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const action = OptionKeybinds[e.key];
            if (action && availableActions?.find(a => a.type === action)) {
                PLAYER_ACTIONS[action]();
            }

            if (e.key === "d") {
                PLAYER_ACTIONS.draw(1, attackingPlayer);
            }

            inputStage?.computedOptions.forEach((option, index) => {
                if (
                    isCard(option) &&
                    index < 9 &&
                    e.key === String(index + 1)
                ) {
                    processOptionSelect(option, inputStage);
                }
            });
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [availableActions, attackingPlayer, inputStage]);

    return (
        <Card className='bg-black p-4 text-white flex flex-col gap-2 items-stretch absolute right-10 bottom-10'>
            <div>
                <h2>Actions</h2>
                <ul className='w-full flex flex-col items-stretch gap-2'>
                    {availableActions?.map(action => (
                        <Button
                            key={action.type}
                            onPointerDown={e => e.preventDefault()} // prevent keyboard focus
                            onClick={PLAYER_ACTIONS[action.type]}
                        >
                            {action.type}
                        </Button>
                    ))}
                </ul>
            </div>
            <Button onClick={() => PLAYER_ACTIONS.draw(1, attackingPlayer)}>
                Draw Card
            </Button>
        </Card>
    );
};
