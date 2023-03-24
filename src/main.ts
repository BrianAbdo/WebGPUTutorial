import shader from "./shaders.wgsl"
const Initialize = async () =>
{

const canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("gfx-main");

if (navigator.gpu) {
    console.log(navigator.onLine)

    const adapter: GPUAdapter = <GPUAdapter>await navigator.gpu.requestAdapter();
    const device: GPUDevice = <GPUDevice> await adapter.requestDevice();
    const context: GPUCanvasContext = <GPUCanvasContext> <unknown>canvas.getContext("webgpu");
    const format: GPUTextureFormat ="bgra8unorm";

    context.configure(
{
        device:device,
        format:format,
        alphaMode:"opaque"
}

    )
    const bindGroupLayout = device.createBindGroupLayout(
        {
            entries:[]
        }
    );
    const bindGroup = device.createBindGroup({
        layout:bindGroupLayout,
        entries:[]
    });
    const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts:[bindGroupLayout],

    });

    const pipeline = device.createRenderPipeline(
    {
        vertex:
        {
            module: device.createShaderModule({
                code:shader
            })
            ,entryPoint:"vs_main"
        },
        fragment:
        {
            module: device.createShaderModule({
                code:shader
            })
            ,entryPoint:"fs_main",
            targets:[{
                format:format
            }]
        },
        primitive:
        {
            topology:"triangle-list"
        },
        layout: pipelineLayout
    }
    );
    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();
    const renderPassEncoder = commandEncoder.beginRenderPass({
        colorAttachments:[{
            view:textureView,
            clearValue: {r:0.5,g:0.0,b:0.25, a:1.0},
            loadOp:"clear",
            storeOp:"store"
        }]
    
    });
    renderPassEncoder.setPipeline(pipeline);
    renderPassEncoder.setBindGroup(0,bindGroup);
    renderPassEncoder.draw(3, 1, 0, 0);
    renderPassEncoder.end();
    device.queue.submit([commandEncoder.finish()])
}
else {

}
}

Initialize();