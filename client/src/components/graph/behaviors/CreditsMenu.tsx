import { useState,useContext } from "react";
import { cn } from "@utils/className";
import { GripVertical } from "lucide-react";
import useCountCredits from "../../../features/grafo/hooks/useCountCredits";
import { GraphinContext } from "@antv/graphin";


export default function CreditsMenu() {
  const [open, setOpen] = useState(false);

  const { graph } = useContext(GraphinContext);

  const {BPCredits,credits}  = useCountCredits(graph);

  // console.log({
  //   BPCredits,
  //   credits
  // })
  return (
    <aside
      className={cn(
        "scale-100 absolute right-0 top-1/2 -translate-y-1/2 transition-all duration-1000 ",
        {
          "translate-x-80": !open,
        }
      )}
    >
      <div className="bg-UI-white h-full text-black rounded-md w-80 transition-all duration-1000 ">
        {credits}{" "}
        {BPCredits}
        <button
          className="bg-UI-white p-2 rounded-l-md  h-10 
              fixed top-1/2 -translate-y-1/2 left-0 -translate-x-10"
          onClick={() => setOpen(!open)}
        >
          <GripVertical className="text-gray-300" />
        </button>
      </div>
    </aside>
  );
}
