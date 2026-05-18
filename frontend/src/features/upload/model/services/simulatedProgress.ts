export async function runSimulatedProgress(stepMs: number, onProgress: (value: number) => void) {
  for (let value = 0; value <= 100; value += 10) {
    await new Promise((resolve) => setTimeout(resolve, stepMs));
    onProgress(value);
  }
}
