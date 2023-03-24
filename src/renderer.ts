import { TriangleMesh } from "./triange_mesh";
import shader from "./shaders.wgsl"
import {mat4} from "gl-matrix"
export class Renderer
{
    canvas : HTMLCanvasElement;

    //Device / Context Objects
    adapter?: GPUAdapter;
    device?: GPUDevice ;
    context?: GPUCanvasContext;
    format?: GPUTextureFormat;

    //Pipeline objects
    uniformBuffer?: GPUBuffer;
    bindGroup?: GPUBindGroup;
    pipeline?:GPURenderPipeline;
    //Assets
    mesh?:TriangleMesh;

    t:number;

    constructor(canvas : HTMLCanvasElement)
    {
        this.canvas = canvas;
        this.t = 0.0;
    }

Render = () =>{
    if (!this.context || !this.device || !this.uniformBuffer || !this.pipeline || !this.bindGroup || !this.mesh) return;
    this.t += .01
    const projection = mat4.create();
    mat4.perspective(projection,Math.PI/4, 500/500, 0.1, 10);
    const view = mat4.create();
    mat4.lookAt(view, [-2,0,2], [0,0,0], [0,0,1]);
    const model = mat4.create();
    mat4.rotate(model,model,this.t,[0,0,1]);

    this.device.queue.writeBuffer(this.uniformBuffer,0,<ArrayBuffer>model);

    this.device.queue.writeBuffer(this.uniformBuffer,64,<ArrayBuffer>view);
    this.device.queue.writeBuffer(this.uniformBuffer,128,<ArrayBuffer>projection);

    const commandEncoder = this.device.createCommandEncoder();
    const textureView = this.context.getCurrentTexture().createView();
    const renderPassEncoder = commandEncoder.beginRenderPass({
        colorAttachments:[{
            view:textureView,
            clearValue: {r:0.5,g:0.0,b:0.25, a:1.0},
            loadOp:"clear",
            storeOp:"store"
        }]
    
    });
    renderPassEncoder.setPipeline(this.pipeline);
    renderPassEncoder.setBindGroup(0,this.bindGroup);
    renderPassEncoder.setVertexBuffer(0,this.mesh.buffer);
    renderPassEncoder.draw(3, 1, 0, 0);
    renderPassEncoder.end();
    this.device.queue.submit([commandEncoder.finish()])
    requestAnimationFrame(this.Render)


}
Initialize = async () =>
{

if (navigator.gpu) {

    this.adapter = <GPUAdapter>await navigator.gpu.requestAdapter();
    this.device = <GPUDevice> await this.adapter.requestDevice();
    this.context = <GPUCanvasContext> <unknown>this.canvas.getContext("webgpu");
    this.format ="bgra8unorm";

    this.context.configure(
{
        device:this.device,
        format:this.format,
        alphaMode:"opaque"
}

    )
    this.uniformBuffer = this.device.createBuffer(
        {
            size: 64 * 3,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        }
    )
    const bindGroupLayout = this.device.createBindGroupLayout(
        {
            entries:[{
                binding:0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {}
            }]
        }
    );
    this.bindGroup = this.device.createBindGroup({
        layout:bindGroupLayout,
        entries:[{
            binding:0,
            resource:{buffer:this.uniformBuffer}
        }]
    });
    const pipelineLayout = this.device.createPipelineLayout({
        bindGroupLayouts:[bindGroupLayout],

    });
    this.mesh = new TriangleMesh(this.device);

    this.pipeline = this.device.createRenderPipeline(
    {
        vertex:
        {
            module: this.device.createShaderModule({
                code:shader
            })
            ,entryPoint:"vs_main",
            buffers: [this.mesh.bufferLayout]
        },
        fragment:
        {
            module: this.device.createShaderModule({
                code:shader
            })
            ,entryPoint:"fs_main",
            targets:[{
                format:this.format
            }]
        },
        primitive:
        {
            topology:"triangle-list"
        },
        layout: pipelineLayout
    }
    );
    this.Render();
}
else {

}
}

}