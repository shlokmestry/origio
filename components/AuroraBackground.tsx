"use client";

import { useEffect, useRef } from "react";

export default function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    let rafId = 0;
    const startTime = performance.now();

    const mouse  = { x: 0.5, y: 0.5 };
    const smooth = { x: 0.5, y: 0.5 };

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / rect.width;
      mouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
    }
    function onTouchMove(e: TouchEvent) {
      const t = e.touches[0];
      const rect = canvas!.getBoundingClientRect();
      mouse.x = (t.clientX - rect.left) / rect.width;
      mouse.y = 1.0 - (t.clientY - rect.top) / rect.height;
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    // Use window dimensions — more reliable than parent element
    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas!.width  = Math.floor(w * 0.75);
      canvas!.height = Math.floor(h * 0.75);
      canvas!.style.width  = "100%";
      canvas!.style.height = "100%";
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }

    const vert = `
      attribute vec2 a_pos;
      void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
    `;

    const frag = `
      precision mediump float;
      uniform vec2  u_res;
      uniform float u_time;
      uniform vec2  u_mouse;

      vec2 hash2(vec2 p) {
        p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
        return fract(sin(p)*43758.5453);
      }

      float noise(vec2 p) {
        vec2 i=floor(p), f=fract(p);
        vec2 u=f*f*(3.0-2.0*f);
        float a=dot(hash2(i+vec2(0,0)),f-vec2(0,0));
        float b=dot(hash2(i+vec2(1,0)),f-vec2(1,0));
        float c=dot(hash2(i+vec2(0,1)),f-vec2(0,1));
        float d=dot(hash2(i+vec2(1,1)),f-vec2(1,1));
        return mix(mix(a,b,u.x),mix(c,d,u.x),u.y)*0.5+0.5;
      }

      float fbm(vec2 p) {
        float v=0.0,a=0.5;
        for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}
        return v;
      }

      float warp(vec2 p, float t, vec2 mPull) {
        vec2 q=vec2(
          fbm(p+vec2(0.0,0.0)+t*0.022+mPull*0.5),
          fbm(p+vec2(5.2,1.3)+t*0.018+mPull*0.35)
        );
        vec2 r=vec2(
          fbm(p+4.0*q+vec2(1.7,9.2)+t*0.012),
          fbm(p+4.0*q+vec2(8.3,2.8)+t*0.010)
        );
        return fbm(p+4.0*r);
      }

      vec3 palette(float t) {
        vec3 col = vec3(0.0);
        col = mix(col, vec3(0.00,0.08,0.08), smoothstep(0.0,0.45,t));
        col = mix(col, vec3(0.00,0.55,0.48), smoothstep(0.45,0.65,t));
        col = mix(col, vec3(0.32,0.24,0.46), smoothstep(0.65,0.80,t));
        col = mix(col, vec3(0.80,0.88,0.92), smoothstep(0.80,1.00,t));
        return col;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float aspect = u_res.x / u_res.y;
        vec2 p = vec2(uv.x*aspect, uv.y) * 1.6;
        float t = u_time * 0.001;

        vec2 mUV  = vec2(u_mouse.x*aspect, u_mouse.y) * 1.6;
        float dist = length(p - mUV);
        vec2 mPull = (dist > 0.001)
          ? normalize(mUV - p) * exp(-dist*dist*2.2) * 1.2
          : vec2(0.0);

        float n = warp(p, t, mPull);

        float mask = smoothstep(0.0,0.5,uv.y)*0.4
                   + smoothstep(1.0,0.5,uv.y)*0.6;
        n *= mask;
        n = pow(n, 2.2);

        vec3 col = palette(n);
        float alpha = smoothstep(0.05, 0.40, n) * 0.55;
        gl_FragColor = vec4(col * alpha, alpha);
      }
    `;

    function makeShader(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, makeShader(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, makeShader(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1,-1, 1,-1, -1,1,
       1,-1, 1, 1, -1,1,
    ]), gl.STATIC_DRAW);

    const aPos  = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes   = gl.getUniformLocation(prog, "u_res");
    const uTime  = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const LERP = 0.04;

    function draw() {
      smooth.x += (mouse.x - smooth.x) * LERP;
      smooth.y += (mouse.y - smooth.y) * LERP;

      gl!.clearColor(0,0,0,0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
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
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      "absolute",
        inset:         0,
        width:         "100%",
        height:        "100%",
        pointerEvents: "none",
        zIndex:        1,
        display:       "block",
      }}
      aria-hidden
    />
  );
}