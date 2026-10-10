import assert from 'node:assert/strict';
import test from 'node:test';
import { processKhoirunnadaAI } from '../lib/ai-engine.ts';

const categories = [
  { id: 'qosidah-arobiah', name: "Qosidah 'Arobiah" },
  { id: 'qosidah-jawa', name: 'Qosidah Jawa' },
  { id: 'qosidah-indonesia', name: 'Qosidah Indonesia' },
];
const titleWords = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel', 'India', 'Juliet', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa', 'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform'];
const qosidahs = categories.flatMap((category, categoryIndex) => Array.from({ length: 17 + categoryIndex }, (_, index) => ({
  id: `${category.id}-${index + 1}`,
  title: `Lagu ${titleWords[index]} ${['Arab', 'Jawa', 'Indonesia'][categoryIndex]}`,
  alternate_title: '',
  category_id: category.id,
  category_name: category.name,
  tags: [],
  arabic_text: `ARAB-${categoryIndex + 1}-${index + 1}`,
  latin_text: `LATIN-${categoryIndex + 1}-${index + 1}`,
  translation: `ARTI-${categoryIndex + 1}-${index + 1}`,
})));
const context = { qosidahs, categories };
const ask = (prompt, v2 = false) => processKhoirunnadaAI(prompt, context, { enableV2Engine: v2 }).text;

test('permintaan cari qosidah menampilkan seluruh kategori dan jumlah yang bersumber dari context', () => {
  const response = ask('Cari Qosidah');
  for (const category of categories) {
    assert.ok(response.includes(category.name));
    assert.ok(response.includes(String(qosidahs.filter((song) => song.category_id === category.id).length)));
  }
  assert.ok(response.includes(String(qosidahs.length)));
});

test('jumlah kategori Jawa tidak salah dianggap typo pada mesin lama dan v2', () => {
  for (const v2 of [false, true]) {
    const response = ask('Qosidah jawa ada berapa?', v2);
    assert.match(response, /memiliki 18 qosidah/);
    assert.doesNotMatch(response, /salah ketik|maksud.*jawab/i);
  }
});

test('daftar kategori terpilih menampilkan semua judul tanpa pemotongan', () => {
  for (const category of categories) {
    const response = ask(`Tampilkan semua qosidah kategori ${category.name}`);
    const expected = qosidahs.filter((song) => song.category_id === category.id);
    assert.ok(response.includes(`seluruh ${expected.length} qosidah`));
    for (const song of expected) assert.ok(response.includes(song.title));
  }
});

test('permintaan seluruh katalog menampilkan semua judul dari semua kategori', () => {
  for (const prompt of ['Tampilkan seluruh qosidah', 'Sebutkan semua qosidah yang tersedia']) {
    const response = ask(prompt);
    assert.ok(response.includes(`seluruh ${qosidahs.length} qosidah`));
    for (const song of qosidahs) assert.ok(response.includes(song.title));
  }
});

test('lirik, teks Arab, Latin, dan arti qosidah terpilih ditarik lengkap dari data', () => {
  const chosen = qosidahs[18];
  const response = ask(`Tolong tampilkan lirik lengkap dan artinya untuk ${chosen.title}`);
  assert.ok(response.includes(chosen.title));
  assert.ok(response.includes(chosen.arabic_text));
  assert.ok(response.includes(chosen.latin_text));
  assert.ok(response.includes(chosen.translation));

  const second = qosidahs[20];
  const multiple = ask(`Tampilkan lirik dan arti ${chosen.title} dan ${second.title}`);
  for (const song of [chosen, second]) {
    assert.ok(multiple.includes(song.arabic_text));
    assert.ok(multiple.includes(song.latin_text));
    assert.ok(multiple.includes(song.translation));
  }
});

test('pilihan nomor mengacu ke daftar terakhir di memori chat, termasuk daftar kategori', () => {
  const selected = [qosidahs[17], qosidahs[19]];
  const numberedContext = {
    ...context,
    memory: { turns: [{ userQuery: 'Tampilkan semua qosidah kategori Qosidah Jawa' }] },
  };
  const numbered = processKhoirunnadaAI('Tampilkan lirik dan artinya nomor 1 dan 3', numberedContext).text;
  for (const song of selected) {
    assert.ok(numbered.includes(song.title));
    assert.ok(numbered.includes(song.arabic_text));
    assert.ok(numbered.includes(song.latin_text));
    assert.ok(numbered.includes(song.translation));
  }
});

test('300 variasi pertanyaan kategori dan jumlah tetap terjawab tepat tanpa klarifikasi typo palsu', () => {
  const prefixes = ['berapa', 'jumlah', 'total', 'ada berapa'];
  const wrappers = ['Qosidah {category} {question}', 'Tolong cek {question} qosidah {category}', 'Saya ingin tahu {question} qosidah kategori {category}'];
  let checked = 0;
  for (let round = 0; round < 100; round += 1) {
    for (const category of categories) {
      const wrapper = wrappers[(round + category.id.length) % wrappers.length];
      const question = prefixes[(round + category.name.length) % prefixes.length];
      const prompt = wrapper.replaceAll('{category}', category.name).replaceAll('{question}', question);
      const response = ask(prompt, round % 2 === 0);
      const count = qosidahs.filter((song) => song.category_id === category.id).length;
      assert.ok(response.includes(`${count} qosidah`), `${prompt} => ${response}`);
      assert.doesNotMatch(response, /salah ketik|maksud.*jawab/i);
      checked += 1;
    }
  }
  assert.equal(checked, 300);
});

test('salah ketik yang jelas pada istilah domain tetap meminta klarifikasi, bukan menebak', () => {
  const response = ask('Bagaimana sejrah Khoirunnada?');
  assert.match(response, /belum yakin|salah ketik/i);
  const categoryTypo = ask('Qosidah jawaa ada berapa?');
  assert.match(categoryTypo, /belum yakin|salah ketik/i);
});
