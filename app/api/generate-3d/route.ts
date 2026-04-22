import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { writeToPythonFolder, runBlenderScript } from "@/lib/blender";
import * as path from "path";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
const OUTPUT_GLB_FILENAME = "output.glb";
const OUTPUT_GLB_PATH = path.join(process.cwd(), "public", "models", OUTPUT_GLB_FILENAME);
const MAX_GENERATION_ATTEMPTS = 3;
const MAX_GROQ_CALL_ATTEMPTS = 2;
const MAX_PREFLIGHT_REPAIR_ATTEMPTS = 2;

const GENERATION_SYSTEM_INSTRUCTION = `You are a senior Blender Python engineer targeting Blender 4.2.
Generate Blender Python code that is robust and produces clean, polished, production-like GLB assets.

Output contract:
- Return only valid Python code. No markdown, no prose.
- Use only imports: bpy, math, mathutils
- Export exactly to: r"${OUTPUT_GLB_PATH}"

Fidelity contract:
- Match the user prompt literally: proportions, silhouette, visible parts, and materials.
- Build separate objects for major parts; avoid one primitive for the whole asset.
- Use believable proportions and clean placement.

Mesh strategy contract (Low-poly default):
- Prioritize low-poly output: visible faceting and controlled polygon count.
- Keep forms simple, readable, and stylized while preserving prompt silhouette.
- Use subdivision/bevel only minimally where absolutely required for stability.
- Avoid dense/global smoothing and avoid high-poly behavior.

Topology contract:
- Quad-first topology whenever practical.
- Triangles are allowed only when unavoidable (caps, tight transitions).
- N-gons are forbidden.

Strict Blender 4.2 safety rules (MUST follow):
- Clear scene first.
- Always set active object before object operators if needed.
- Allowed primitive signatures:
  - bpy.ops.mesh.primitive_cube_add(size=..., location=...)
  - bpy.ops.mesh.primitive_uv_sphere_add(radius=..., location=...)
  - bpy.ops.mesh.primitive_ico_sphere_add(radius=..., subdivisions=..., location=...)
  - bpy.ops.mesh.primitive_cylinder_add(radius=..., depth=..., location=..., rotation=...)
  - bpy.ops.mesh.primitive_cone_add(radius1=..., radius2=..., depth=..., location=..., rotation=...)
  - bpy.ops.mesh.primitive_torus_add(major_radius=..., minor_radius=..., location=..., rotation=...)
- Never pass size= to ico_sphere or uv_sphere.
- Never pass radius1/radius2 to primitive_cylinder_add.
- Never use:
  - vertex_only=
  - auto_smooth_angle
  - use_auto_smooth
  - bpy.ops.mesh.remove_doubles
  - modifiers['Some Name'] lookups
- For modifiers, always do:
  mod = obj.modifiers.new(name="Subd", type='SUBSURF')
  mod.levels = 2
  (never fetch by string key)

Geometry polish rules:
- Use modifier-based bevel/subdivision where appropriate.
- Use smooth shading where appropriate.
- Apply transforms before export.

Required ending:
if bpy.context.object and bpy.context.object.mode != 'OBJECT':
    bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bpy.ops.export_scene.gltf(
    filepath=r"${OUTPUT_GLB_PATH}",
    export_format='GLB',
    use_selection=False,
    export_apply=True
)`;

const REPAIR_SYSTEM_INSTRUCTION = `You are fixing a Blender Python script that failed at runtime on Blender 4.2.
Return only corrected Python code (no markdown/explanations).
Keep the same modeling intent but fix crashes and context issues.
Respect low-poly + quad-first topology strategy.
Never use mesh bevel arg 'vertex_only'.
Never use Mesh.auto_smooth_angle or mesh.use_auto_smooth.
For primitive_ico_sphere_add use radius=, never size=.
For primitive_cylinder_add use radius=, never radius1/radius2.
Never use bpy.ops.mesh.remove_doubles.
Never use modifiers['Name'] indexing.
N-gons forbidden. Triangles only when unavoidable.
Must export exactly to: r"${OUTPUT_GLB_PATH}"`;

const QUALITY_REFINE_SYSTEM_INSTRUCTION = `You are a Blender 4.2 senior reviewer improving model fidelity and finish.
Rewrite the provided script to better match the user prompt exactly and produce a cleaner, polished model.
Output Python code only.

Quality objectives:
- Preserve the user's described shape, proportions, and design language.
- Add missing visible parts from the prompt.
- Improve material realism (base color, roughness, metallic where relevant).
- Follow low-poly strategy: keep polygon count controlled and forms intentionally faceted.
- Follow quad-first topology policy.
- Improve clean topology behavior using modifier-based bevel/subdivision.
- Keep robust context-safe bpy ops usage.
- Keep export path exactly: r"${OUTPUT_GLB_PATH}"
- Never use mesh bevel arg 'vertex_only'.
- Never use Mesh.auto_smooth_angle or mesh.use_auto_smooth.
- For primitive_ico_sphere_add use radius=, never size=.
- For primitive_cylinder_add use radius=, never radius1/radius2.
- Never use bpy.ops.mesh.remove_doubles.
- Never use modifiers['Name'] indexing.
- N-gons forbidden. Triangles only when unavoidable.`;

const extractPythonCode = (content: string) => {
  const fencedMatch = content.match(/```(?:python)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) return fencedMatch[1].trim();
  return content.trim();
};

const sanitizePythonCode = (code: string) => {
  // Blender 4.2 compatibility fixes.
  return code
    .replace(/,\s*vertex_only\s*=\s*(True|False)\s*/g, " ")
    .replace(/vertex_only\s*=\s*(True|False)\s*,\s*/g, "")
    .replace(/primitive_ico_sphere_add\(([^)]*?)\bsize\s*=/g, "primitive_ico_sphere_add($1radius=")
    .replace(/primitive_uv_sphere_add\(([^)]*?)\bsize\s*=/g, "primitive_uv_sphere_add($1radius=")
    .replace(/primitive_cylinder_add\(([^)]*?)\bradius1\s*=\s*([^,\)]+)/g, "primitive_cylinder_add($1radius=$2")
    .replace(/,\s*radius2\s*=\s*[^,\)]*/g, "")
    .replace(/.*auto_smooth_angle.*\n/g, "")
    .replace(/.*use_auto_smooth.*\n/g, "")
    .replace(/.*bpy\.ops\.mesh\.remove_doubles.*\n/g, "")
    .replace(/\n{3,}/g, "\n\n");
};

const EXPORT_BLOCK = `
if bpy.context.object and bpy.context.object.mode != 'OBJECT':
    bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bpy.ops.export_scene.gltf(
    filepath=r"${OUTPUT_GLB_PATH}",
    export_format='GLB',
    use_selection=False,
    export_apply=True
)`;

const ensureExportCall = (code: string) => {
  if (code.includes("bpy.ops.export_scene.gltf")) return code;
  const trimmed = code.trimEnd();
  return `${trimmed}\n\n${EXPORT_BLOCK}\n`;
};

const validatePythonCode = (code: string) => {
  const lowered = code.toLowerCase();
  const bannedTokens = [
    "import os",
    "import sys",
    "import subprocess",
    "from os",
    "from sys",
    "from subprocess",
    "vertex_only=",
    "auto_smooth_angle",
    "use_auto_smooth",
    "primitive_ico_sphere_add(size=",
    "primitive_cylinder_add(radius1=",
    "primitive_cylinder_add(radius2=",
    "bpy.ops.mesh.remove_doubles",
    "modifiers['",
    "modifiers[\"",
    "bpy.ops.mesh.fill(",
    "bpy.ops.mesh.edge_face_add(",
    "bmesh",
  ];

  for (const token of bannedTokens) {
    if (lowered.includes(token)) {
      throw new Error(`Generated script contains banned token: ${token}`);
    }
  }

  if (!code.includes("bpy.ops.export_scene.gltf")) {
    throw new Error("Generated script is missing GLTF export call.");
  }
};

const getPreflightIssues = (code: string): string[] => {
  const issues: string[] = [];
  if (/primitive_ico_sphere_add\([^)]*size\s*=/.test(code)) issues.push("ico_sphere uses size= instead of radius=");
  if (/primitive_cylinder_add\([^)]*radius1\s*=/.test(code)) issues.push("cylinder uses radius1= (invalid in Blender 4.2)");
  if (/primitive_cylinder_add\([^)]*radius2\s*=/.test(code)) issues.push("cylinder uses radius2= (invalid in Blender 4.2)");
  if (/auto_smooth_angle/.test(code)) issues.push("uses auto_smooth_angle");
  if (/use_auto_smooth/.test(code)) issues.push("uses use_auto_smooth");
  if (/bpy\.ops\.mesh\.remove_doubles/.test(code)) issues.push("uses remove_doubles operator");
  if (/modifiers\[['"][^'"]+['"]\]/.test(code)) issues.push("uses fragile modifier name lookup by key");
  if (/bpy\.ops\.mesh\.fill\(/.test(code)) issues.push("uses mesh.fill (n-gon risk)");
  if (/bpy\.ops\.mesh\.edge_face_add\(/.test(code)) issues.push("uses edge_face_add (n-gon risk)");
  if (/import\s+bmesh|from\s+bmesh/.test(code)) issues.push("uses bmesh (outside allowed safe subset)");
  return issues;
};

const categorizePreflightIssues = (issues: string[]) => {
  const categories = new Set<string>();
  for (const issue of issues) {
    if (issue.includes("invalid in Blender 4.2") || issue.includes("size=") || issue.includes("auto_smooth") || issue.includes("remove_doubles")) {
      categories.add("API-compat");
    } else if (issue.includes("n-gon") || issue.includes("modifier") || issue.includes("bmesh")) {
      categories.add("topology-policy");
    } else {
      categories.add("context-policy");
    }
  }
  return Array.from(categories);
};

const categorizeRuntimeFailure = (errorMessage: string) => {
  const lowered = errorMessage.toLowerCase();
  const categories: string[] = [];
  if (
    lowered.includes("keyword") ||
    lowered.includes("unrecognized") ||
    lowered.includes("typeerror") ||
    lowered.includes("invalid")
  ) {
    categories.push("API-compat");
  }
  if (
    lowered.includes("poll() failed, context is incorrect") ||
    lowered.includes("context is incorrect") ||
    lowered.includes("mode_set")
  ) {
    categories.push("context-policy");
  }
  if (
    lowered.includes("keyerror") ||
    lowered.includes("modifiers[") ||
    lowered.includes("n-gon") ||
    lowered.includes("topology")
  ) {
    categories.push("topology-policy");
  }
  return categories.length ? categories : ["API-compat"];
};

const extractMessageText = (message: any): string => {
  const content = message?.content;
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        return part?.text || "";
      })
      .join("\n")
      .trim();
  }
  return "";
};

const createChatCompletion = async (groq: any, messages: any[]) => {
  let lastError = "Model returned an empty response.";

  for (let attempt = 1; attempt <= MAX_GROQ_CALL_ATTEMPTS; attempt += 1) {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 4096,
      messages,
    });

    const text = extractMessageText(completion?.choices?.[0]?.message);
    if (text) return text;

    lastError = "Model returned an empty response.";
    messages = [
      ...messages,
      {
        role: "user",
        content:
          "Your previous response was empty. Return only full Blender Python script now, no markdown.",
      },
    ];
  }

  throw new Error(lastError);
};

const enrichPrompt = (prompt: string) => {
  const trimmed = prompt.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const lower = trimmed.toLowerCase();

  // Improve fidelity for short/vague prompts by turning them into explicit art direction.
  if (words.length <= 3) {
    if (/\btree\b/.test(lower)) {
      return `${trimmed}

Generate a realistic standalone tree with:
- 1 tapered trunk (brown bark material)
- 5-8 primary branches and 10+ secondary branches
- dense leafy canopy made of multiple overlapping clusters
- natural asymmetry and believable proportions
- root flare near base
- smooth shading on organic parts
- final polished look, not abstract primitive-only look`;
    }

    return `${trimmed}

Generate a realistic, production-style version with clear major parts, accurate proportions, detailed materials, and polished finish.`;
  }

  return trimmed;
};

const generateScript = async (groq: any, prompt: string) => {
  const content = await createChatCompletion(groq, [
    { role: "system", content: GENERATION_SYSTEM_INSTRUCTION },
    { role: "user", content: prompt },
  ]);

  const script = ensureExportCall(sanitizePythonCode(extractPythonCode(content)));
  validatePythonCode(script);
  return script;
};

const repairScript = async (
  groq: any,
  originalPrompt: string,
  previousScript: string,
  failureCategories: string[],
  blenderError: string,
) => {
  const content = await createChatCompletion(groq, [
    { role: "system", content: REPAIR_SYSTEM_INSTRUCTION },
    {
      role: "user",
      content: `User prompt:
${originalPrompt}

Previous failing Blender script:
${previousScript}

Failure categories:
${failureCategories.join(", ")}

Blender error:
${blenderError}

Return a corrected full script only.`,
    },
  ]);

  const script = ensureExportCall(sanitizePythonCode(extractPythonCode(content)));
  validatePythonCode(script);
  return script;
};

const preflightRepairScript = async (
  groq: any,
  originalPrompt: string,
  previousScript: string,
  issues: string[],
) => {
  const categories = categorizePreflightIssues(issues);
  return repairScript(
    groq,
    originalPrompt,
    previousScript,
    categories,
    `Preflight static validation failed:\n- ${issues.join("\n- ")}`,
  );
};

const refineScriptForQuality = async (
  groq: any,
  originalPrompt: string,
  draftScript: string,
) => {
  const content = await createChatCompletion(groq, [
    { role: "system", content: QUALITY_REFINE_SYSTEM_INSTRUCTION },
    {
      role: "user",
      content: `User prompt:
${originalPrompt}

Current Blender script draft:
${draftScript}

Return an improved full script that better matches the prompt and yields a cleaner polished GLB.`,
    },
  ]);

  const script = ensureExportCall(sanitizePythonCode(extractPythonCode(content)));
  validatePythonCode(script);
  return script;
};

export async function POST(req: NextRequest) {
  try {
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is required in environment variables" },
        { status: 500 },
      );
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const groq = new Groq({ apiKey: GROQ_API_KEY });
    const enrichedPrompt = enrichPrompt(prompt.trim());

    let latestScript = await generateScript(groq, enrichedPrompt);
    latestScript = await refineScriptForQuality(groq, enrichedPrompt, latestScript);

    for (let i = 0; i < MAX_PREFLIGHT_REPAIR_ATTEMPTS; i += 1) {
      const issues = getPreflightIssues(latestScript);
      if (issues.length === 0) break;
      latestScript = await preflightRepairScript(groq, enrichedPrompt, latestScript, issues);
    }
    let lastError = "";

    for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt += 1) {
      try {
        const scriptPath = await writeToPythonFolder(latestScript);
        const glbPath = await runBlenderScript(scriptPath, OUTPUT_GLB_FILENAME);
        return NextResponse.json({ success: true, glbPath, attempts: attempt });
      } catch (error: any) {
        lastError = error?.message || "Unknown Blender error";
        const categories = categorizeRuntimeFailure(lastError);

        if (attempt >= MAX_GENERATION_ATTEMPTS) break;
        latestScript = await repairScript(groq, enrichedPrompt, latestScript, categories, lastError);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate a valid Blender script after retries.",
        details: lastError,
      },
      { status: 500 },
    );
  } catch (error: any) {
    console.error("Error in generate-3d route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
