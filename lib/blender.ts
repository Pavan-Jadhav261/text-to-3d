import { spawn } from "child_process";
import { promises as fs } from "fs";
import * as path from "path";

const BLENDER_PATH = "C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe";
const PYTHON_SCRIPT_FILE = path.join(process.cwd(), "lib", "code.py");
const OUTPUT_DIR = path.join(process.cwd(), "public", "models");
const BLENDER_TIMEOUT_MS = 120000;

export async function writeToPythonFolder(code: string) {
    try {
        await fs.mkdir(path.dirname(PYTHON_SCRIPT_FILE), { recursive: true });
        await fs.writeFile(PYTHON_SCRIPT_FILE, code);
        console.log("Python file created at:", PYTHON_SCRIPT_FILE);
        return PYTHON_SCRIPT_FILE;
    } catch (error) {
        console.error("Error writing Python file:", error);
        throw error;
    }
}

export async function runBlenderScript(pythonScript: string, outputFilename: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            await fs.mkdir(OUTPUT_DIR, { recursive: true });
            const outputPath = path.join(OUTPUT_DIR, outputFilename);
            await fs.rm(outputPath, { force: true });

            const blender = spawn(
                BLENDER_PATH,
                ["--background", "--python", pythonScript],
                { shell: false }
            );

            let stdout = "";
            let stderr = "";

            blender.stdout.on("data", (data) => {
                stdout += data.toString();
                console.log(`Blender: ${data}`);
            });

            blender.stderr.on("data", (data) => {
                stderr += data.toString();
                console.error(`Blender Error: ${data}`);
            });

            blender.on("error", (error) => {
                reject(new Error(`Failed to start Blender process: ${error.message}`));
            });

            const timeout = setTimeout(() => {
                blender.kill("SIGTERM");
                reject(new Error(`Blender execution timed out after ${BLENDER_TIMEOUT_MS / 1000}s.`));
            }, BLENDER_TIMEOUT_MS);

            blender.on("close", async (code) => {
                clearTimeout(timeout);
                const combinedLog = `${stdout}\n${stderr}`;
                const hasPythonTraceback = /Traceback \(most recent call last\):/i.test(combinedLog);

                if (code === 0) {
                    if (hasPythonTraceback) {
                        reject(new Error(`Blender Python traceback detected: ${combinedLog}`));
                        return;
                    }

                    try {
                        await fs.access(outputPath);
                        console.log(`Blender exited successfully and file created at ${outputPath}.`);
                        resolve(`/models/${outputFilename}`);
                    } catch (e) {
                        console.error(`Blender exited with code 0 but output file not found at ${outputPath}`);
                        reject(new Error(`Blender succeeded but output file was not generated. Check Python script for errors.`));
                    }
                } else {
                    console.error(`Blender exited with code ${code}`);
                    reject(new Error(`Blender failed with code ${code}. stderr: ${stderr || "(empty)"}. stdout: ${stdout || "(empty)"}`));
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}
