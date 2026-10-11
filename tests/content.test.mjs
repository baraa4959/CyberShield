import test from "node:test";
import assert from "node:assert/strict";
import { experiences, posters } from "../src/catalog.js";
import { locales } from "../src/locales/index.js";
import { posterCopy } from "../src/single-infographic.js";
import { getStory } from "../src/stories.js";

test("ten immersive experiences and one bilingual approved infographic", () => {
  assert.equal(experiences.length, 10);
  assert.deepEqual(posters, [{ id: "approvedInfographic" }]);
  for (const lang of ["ar", "en"]) {
    const p = posterCopy[lang];
    assert.equal(p.sections.length, 4);
    assert.equal(p.sections[0].cards.length, 4);
    assert.equal(p.sections[1].bullets.length, 4);
    assert.equal(p.sections[2].cards.length, 6);
    assert.equal(p.sections[3].bullets.length, 3);
    for (const exp of experiences) {
      const story = getStory(lang, exp.id);
      assert.ok(story, lang + ": " + exp.id);
      assert.ok(story.summary.length > 12);
      assert.ok(story.scenes.start);
      for (const [id, scene] of Object.entries(story.scenes)) {
        assert.ok(
          scene.app && scene.title && scene.body,
          `${lang}/${exp.id}/${id}`,
        );
        assert.equal(scene.actions.length, 2);
        for (const a of scene.actions) {
          assert.ok(a.reason.length > 12);
          assert.equal(typeof a.good, "boolean");
          assert.ok(a.next === "end" || story.scenes[a.next]);
        }
      }
    }
  }
});
test("UI locale structure is expandable", () => {
  assert.deepEqual(
    Object.keys(locales.ar.ui).sort(),
    Object.keys(locales.en.ui).sort(),
  );
  for (const locale of Object.values(locales))
    for (const value of Object.values(locale.ui)) assert.ok(value.length);
});
