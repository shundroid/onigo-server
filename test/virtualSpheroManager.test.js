import VirtualSpheroManager from "../virtualSpheroManager";
import VirtualSphero from "sphero-ws-virtual-plugin";

describe("VirtualSpheroManager", () => {
  describe("#constructor()", () => {
    const virtualSpheroManager = new VirtualSpheroManager();
    it("should initialize virtualSphero", () => {
      assert(typeof virtualSpheroManager === "object" &&
             virtualSpheroManager.virtualSphero instanceof VirtualSphero);
    });
  });
  describe("#removeSphero", () => {

  });
});
