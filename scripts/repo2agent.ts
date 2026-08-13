import { runRepo2AgentCli } from "../site/src/ana/sdk/cli";

const result = await runRepo2AgentCli(process.argv.slice(2));
if (result.stdout) process.stdout.write(`${result.stdout}\n`);
if (result.stderr) process.stderr.write(`${result.stderr}\n`);
process.exitCode = result.status;
