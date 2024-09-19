declare module "fabric-guidelines-plugin" {
  import { Canvas, Object as FabricObject } from "fabric";

  interface AligningOptions {
    lineMargin?: number;
    lineWidth?: number;
    lineColor?: string;
  }

  interface IgnoreObjType {
    key: string;
    value: any;
  }

  interface CustomFabricObject extends fabric.Object {
    myType?: string;
  }

  interface AlignGuidelinesOptions {
    canvas: Canvas;
    pickObjTypes: IgnoreObjType[];
    ignoreObjTypes?: IgnoreObjType[];
    aligningOptions?: AligningOptions;
  }

  class AlignGuidelines {
    constructor(options: AlignGuidelinesOptions);

    // Initialize the plugin
    init(): void;

    // Additional methods and properties can be added here if needed
    activate(): void;
    drawGuidelines(): void;
    clearLinesMeta(): void;
    // Include any other public methods or properties
  }

  export { AlignGuidelines };
}
