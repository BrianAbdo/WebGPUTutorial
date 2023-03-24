import { Renderer } from "./renderer";
import shader from "./shaders.wgsl"
import { TriangleMesh } from "./triange_mesh";
const canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("gfx-main");
const renderer = new Renderer(canvas);
renderer.Initialize();
