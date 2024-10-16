import { GameState } from "@/lib/lorcana/types/game";
import CardComp from "./card";
import { Button } from "../ui/button";

export default function CardSelect(props: {
    inputStage: GameState["inputStage"];
}) {
    if (!props.inputStage) return null;

    return (
        <div className='bg-black bg-opacity-25 absolute top-0 right-0 bottom-0 left-0 flex justify-center items-center'>
            <div className='p-5 flex gap-10 bg-neutral-800 min-w-96 border-neutral-100 rounded-lg'>
                {props.inputStage.options.map(option =>
                    typeof option === "string" ? (
                        <Button
                            key={option}
                            onClick={() => props.inputStage?.callback(option)}
                        >
                            {option}
                        </Button>
                    ) : (
                        <CardComp key={option.id} card={option} />
                    )
                )}
            </div>
        </div>
    );
}
