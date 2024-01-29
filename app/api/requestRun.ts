export async function requestRun(source: string, stdin: string) {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 2000));
  return {
    exitCode: 0,
    stdout: 'Hello World!',
    stderr: 'Compiling... Done!',
  };
}
