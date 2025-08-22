import CommitGenerator from "./core/CommitGenerator.js";

export default async function run() {
  const generator = new CommitGenerator();
  await generator.run();
}

// Export for testing purposes
export { CommitGenerator };
