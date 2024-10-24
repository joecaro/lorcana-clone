import { GameSetupComponent } from "@/components/lorcana/game-setup";
import { Toaster } from "sonner";

export default function Page() {
    return (
        <div className='h-screen max-h-screen overflow-hidden'>
            <GameSetupComponent />
            <Toaster />
        </div>
    );
}
