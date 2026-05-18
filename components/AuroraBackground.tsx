"use client";

import { useEffect, useRef } from "react";

export default function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    let rafId = 0;
    const startTime = performance.now();
    const mouse  = { x: 0.5, y: 0.5 };
    const smooth = { x: 0.5, y: 0.5 };

    function onMouseMove(e: MouseEvent) {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = 1.0 - e.clientY / window.innerHeight;
    }
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    function resize() {
      canvas!.width  = Math.floor(window.innerWidth  * 0.6);
      canvas!.height = Math.floor(window.innerHeight * 0.6);
      canvas!.style.width  = "100%";
      canvas!.style.height = "100%";
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }

    const vert = `attribute vec2 a_pos; void main(){gl_Position=vec4(a_pos,0,1);}`;

    const frag = `
      precision mediump float;
      uniform vec2  u_res;
      uniform float u_time;
      uniform vec2  u_mouse;

      vec2 hash2(vec2 p){
        p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));
        return fract(sin(p)*43758.5453);
      }
      float noise(vec2 p){
        vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);
        return mix(
          mix(dot(hash2(i),f),dot(hash2(i+vec2(1,0)),f-vec2(1,0)),u.x),
          mix(dot(hash2(i+vec2(0,1)),f-vec2(0,1)),dot(hash2(i+vec2(1,1)),f-vec2(1,1)),u.x),
          u.y)*0.5+0.5;
      }
      float fbm(vec2 p){
        float v=0.0,a=0.5;
        for(int i=0;i<4;i++){v+=a*noise(p);p*=2.0;a*=0.5;}
        return v;
      }
      void main(){
        vec2 uv = gl_FragCoord.xy / u_res;
        float asp = u_res.x/u_res.y;
        vec2 p = vec2(uv.x*asp, uv.y) * 1.5;
        float t = u_time * 0.0008;

        // domain warp
        vec2 q = vec2(fbm(p+t), fbm(p+vec2(5.2,1.3)+t*0.9));
        vec2 r = vec2(fbm(p+3.5*q+vec2(1.7,9.2)+t*0.7), fbm(p+3.5*q+vec2(8.3,2.8)+t*0.6));
        float n = fbm(p + 3.5*r);

        // mouse pull
        vec2 m = vec2(u_mouse.x*asp, u_mouse.y)*1.5;
        float d = length(p-m);
        n += exp(-d*d*1.5)*0.35;
        n = clamp(n,0.0,1.0);

        // vertical fade — stronger at top
        n *= smoothstep(0.0,0.7,uv.y)*0.5 + smoothstep(1.0,0.3,uv.y)*0.5;

        // curve — NOT too aggressive
        n = pow(n, 1.3);

        // colour
        vec3 col = vec3(0.0);
        col = mix(col, vec3(0.00,0.20,0.18), smoothstep(0.0,0.3,n));
        col = mix(col, vec3(0.00,0.80,0.65), smoothstep(0.3,0.6,n));
        col = mix(col, vec3(0.40,0.28,0.60), smoothstep(0.6,0.8,n));
        col = mix(col, vec3(0.85,0.92,1.00), smoothstep(0.8,1.0,n));

        float alpha = n * 0.70;
        gl_FragColor = vec4(col*alpha, alpha);
      }
    `;

    function sh(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src); gl!.compileShader(s); return s;
    }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog); gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes   = gl.getUniformLocation(prog, "u_res");
    const uTime  = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    function draw() {
      smooth.x += (mouse.x - smooth.x) * 0.04;
      smooth.y += (mouse.y - smooth.y) * 0.04;
      gl!.clearColor(0,0,0,0); gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      gl!.uniform1f(uTime, performance.now() - startTime);
      gl!.uniform2f(uMouse, smooth.x, smooth.y);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 1,
      }}
      aria-hidden
    />
  );
}