import type { AgentJsonType } from "../manifest/schemas";
import type { RepositoryDomain } from "../repositories/schemas";
import { initRepo2Agent } from "./init";
import { publishRepo2Agent, registerRepo2AgentDirectory } from "./register";
import { testRepo2AgentDirectory } from "./test-command";
import { validateRepo2AgentDirectory } from "./validate";

export type Repo2AgentCliResult = {
  status: number;
  stdout: string;
  stderr: string;
};

const usage = `Usage: repo2agent <init|validate|test|register|publish> [options]

  init --dir PATH [--id ID] [--name NAME] [--repository OWNER/NAME]
       [--domain DOMAIN] [--capability CAPABILITY] [--type agent|tool]
  validate [DIR]
  test [DIR]
  register [DIR] --manifests PATH
  publish          (denied until explicitly authorized)
`;

const readFlag = (args: readonly string[], name: string): string | undefined => {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = args[index + 1];
  return value && !value.startsWith("--") ? value : undefined;
};

const directoryFrom = (args: readonly string[]): string => {
  const flagged = readFlag(args, "--dir");
  if (flagged) return flagged;
  const candidate = args[1];
  if (candidate && !candidate.startsWith("--")) return candidate;
  return ".";
};

export const runRepo2AgentCli = async (argv: readonly string[]): Promise<Repo2AgentCliResult> => {
  const command = argv[0];
  if (!command || command === "--help" || command === "-h") {
    return { status: 0, stdout: usage, stderr: "" };
  }
  try {
    if (command === "publish") {
      const denied = publishRepo2Agent();
      return { status: 1, stdout: "", stderr: denied.error };
    }
    if (command === "init") {
      const directory = readFlag(argv, "--dir");
      if (!directory) return { status: 1, stdout: "", stderr: "--dir is required for init." };
      const type = (readFlag(argv, "--type") ?? "agent") as AgentJsonType;
      const result = await initRepo2Agent({
        directory,
        id: readFlag(argv, "--id") ?? "sample-agent",
        name: readFlag(argv, "--name") ?? "Sample Agent",
        repository: readFlag(argv, "--repository") ?? "uset82/sample-agent",
        domain: (readFlag(argv, "--domain") ?? "web") as RepositoryDomain,
        capability: readFlag(argv, "--capability") ?? "sample-task",
        type,
        ...(argv.includes("--force") ? { force: true } : {}),
      });
      return {
        status: 0,
        stdout: `Initialized Repo2Agent scaffold in ${result.directory}`,
        stderr: "",
      };
    }
    const directory = directoryFrom(argv);
    if (command === "validate") {
      const result = await validateRepo2AgentDirectory(directory);
      if (!result.ok) return { status: 1, stdout: "", stderr: result.error };
      return {
        status: 0,
        stdout: `Valid ${result.document.schema} agent ${result.document.id}`,
        stderr: "",
      };
    }
    if (command === "test") {
      const result = await testRepo2AgentDirectory(directory);
      if (!result.ok) return { status: 1, stdout: "", stderr: result.error };
      return { status: 0, stdout: `Passed contract test for ${result.agentId}`, stderr: "" };
    }
    if (command === "register") {
      const manifestsRoot = readFlag(argv, "--manifests");
      if (!manifestsRoot) {
        return {
          status: 1,
          stdout: "",
          stderr: "--manifests is required. Register does not enable specialists.",
        };
      }
      const result = await registerRepo2AgentDirectory(directory, { manifestsRoot });
      if (!result.ok) return { status: 1, stdout: "", stderr: result.error };
      return {
        status: 0,
        stdout: `Registered ${result.path} (enabled: false, published: false)`,
        stderr: "",
      };
    }
    return { status: 1, stdout: "", stderr: `Unknown command ${command}\n${usage}` };
  } catch (error) {
    return {
      status: 1,
      stdout: "",
      stderr: error instanceof Error ? error.message : "Repo2Agent failed.",
    };
  }
};
