import { readFile } from "node:fs/promises";

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const ideas = await readJson("../src/data/raw/ideas-v2.json");
const glossary = await readJson("../src/data/raw/glossary.json");

const ids = new Set(ideas.map((idea) => idea.id));
const duplicateIds = ideas.filter((idea, index) => ideas.findIndex((candidate) => candidate.id === idea.id) !== index);
const missingCore = ideas.filter((idea) => ["id", "title", "shortDescription", "description", "category", "channel", "budgetRange", "difficulty"].some((key) => !idea[key]));
const brokenRelations = ideas.flatMap((idea) => (idea.relatedIdeas ?? []).filter((id) => !ids.has(id)).map((id) => `${idea.id} -> ${id}`));
const glossaryTerms = Object.values(glossary);
const aliases = glossaryTerms.flatMap((term) => term.aliases ?? []);

if (ideas.length < 200) throw new Error(`Expected at least 200 ideas, found ${ideas.length}`);
if (duplicateIds.length) throw new Error(`Duplicate idea ids: ${duplicateIds.map((idea) => idea.id).join(", ")}`);
if (missingCore.length) throw new Error(`Ideas missing core fields: ${missingCore.map((idea) => idea.id).join(", ")}`);
if (brokenRelations.length) throw new Error(`Broken idea relationships: ${brokenRelations.slice(0, 8).join(", ")}`);
if (glossaryTerms.length < 300) throw new Error(`Expected at least 300 business terms, found ${glossaryTerms.length}`);

console.log(JSON.stringify({
  ideas: ideas.length,
  uniqueIdeaIds: ids.size,
  glossaryTerms: glossaryTerms.length,
  glossaryAliases: aliases.length,
  brokenRelations: brokenRelations.length,
}, null, 2));
