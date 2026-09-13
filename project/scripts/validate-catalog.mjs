import { readFile } from "node:fs/promises";

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const ideas = await readJson("../src/data/raw/ideas-v2.json");
const additions = await readJson("../src/data/raw/idea-additions.json");
const glossary = await readJson("../src/data/raw/glossary.json");
const knowledgeSource = await readFile(new URL("../src/data/knowledge.ts", import.meta.url), "utf8");

const allIdeas = [...ideas, ...additions];
const ids = new Set(allIdeas.map((idea) => idea.id));
const duplicateIds = allIdeas.filter((idea, index) => allIdeas.findIndex((candidate) => candidate.id === idea.id) !== index);
const missingCore = ideas.filter((idea) => ["id", "title", "shortDescription", "description", "category", "channel", "budgetRange", "difficulty"].some((key) => !idea[key]));
const missingAdditions = additions.filter((idea) => ["id", "ar", "en", "cat", "catEn", "channel", "budget", "difficulty", "time", "interaction", "scale", "interest", "tags"].some((key) => !idea[key]));
const brokenRelations = ideas.flatMap((idea) => (idea.relatedIdeas ?? []).filter((id) => !ids.has(id)).map((id) => `${idea.id} -> ${id}`));
const glossaryTerms = Object.values(glossary);
const aliases = glossaryTerms.flatMap((term) => term.aliases ?? []);
const extractStringArray = (name) => {
  const body = knowledgeSource.match(new RegExp(`const ${name} = \\[([^\\]]+)\\]`))?.[1] ?? "";
  return [...body.matchAll(/"([^"\\]*(?:\\.[^"\\]*)*)"/g)].map((match) => match[1]);
};
const phraseAliases = [...knowledgeSource.matchAll(/aliases:\s*\[([^\]]+)\]/g)].flatMap((match) => match[1].match(/"([^"\\]*(?:\\.[^"\\]*)*)"/g) ?? []).map((value) => value.slice(1, -1));
const generatedArabicPhrases = extractStringArray("desirePrefixes").flatMap((prefix) => extractStringArray("projectNouns").map((noun) => `${prefix} ${noun}`));
const allPhraseAliases = [...phraseAliases, ...generatedArabicPhrases];
const searchablePhrases = new Set([...aliases, ...allPhraseAliases]);
const arabicPhrases = new Set([...aliases, ...allPhraseAliases].filter((value) => /[\u0600-\u06ff]/.test(value)));

if (additions.length !== 200) throw new Error(`Expected exactly 200 new ideas, found ${additions.length}`);
if (allIdeas.length !== ideas.length + 200) throw new Error(`Expected ${ideas.length + 200} total ideas, found ${allIdeas.length}`);
if (duplicateIds.length) throw new Error(`Duplicate idea ids: ${duplicateIds.map((idea) => idea.id).join(", ")}`);
if (missingCore.length) throw new Error(`Ideas missing core fields: ${missingCore.map((idea) => idea.id).join(", ")}`);
if (missingAdditions.length) throw new Error(`New ideas missing descriptor fields: ${missingAdditions.map((idea) => idea.id).join(", ")}`);
if (brokenRelations.length) throw new Error(`Broken idea relationships: ${brokenRelations.slice(0, 8).join(", ")}`);
if (glossaryTerms.length < 300) throw new Error(`Expected at least 300 business terms, found ${glossaryTerms.length}`);
if (arabicPhrases.size < 1000) throw new Error(`Expected at least 1,000 Arabic business/Gulf phrases, found ${arabicPhrases.size}`);

console.log(JSON.stringify({
  originalIdeas: ideas.length,
  newIdeas: additions.length,
  totalIdeas: allIdeas.length,
  uniqueIdeaIds: ids.size,
  glossaryTerms: glossaryTerms.length,
  glossaryAliases: aliases.length,
  intentPhraseAliases: allPhraseAliases.length,
  searchablePhrases: searchablePhrases.size,
  arabicPhrases: arabicPhrases.size,
  brokenRelations: brokenRelations.length,
}, null, 2));
