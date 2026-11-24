const test = require('node:test');
const assert = require('node:assert/strict');
const { COMMANDS, welcome, run, complete, completeInput } = require('../assets/js/terminal.js');

const data = {
  name: 'Test Person',
  role: 'Student',
  bio: 'A short bio.',
  interests: ['Robots'],
  links: [{ label: 'github', url: 'https://example.com/gh' }],
  experience: [{ period: 'Jun 2026 – Sep 2026', title: 'Intern', place: 'Lab' }],
  education: [{ period: 'Sep 2024 – Jun 2028', title: 'B.S. Testing', place: 'Test University' }],
  experienceUrl: '/experience/',
  projects: [
    { slug: 'proj', title: 'Proj', summary: 'A project.', url: '/projects/proj/' },
    { slug: 'robot-arm', title: 'Robot Arm', summary: 'An arm.', url: '/projects/robot-arm/' },
  ],
  posts: [{ slug: 'post', title: 'Post', date: '2026-03-14', url: '/post/post/' }],
  cvUrl: '/uploads/resume.pdf',
};
const empty = { ...data, interests: [], links: [], experience: [], education: [], projects: [], posts: [] };

// Flatten a result to plain text so assertions do not depend on segment layout.
const text = (lines) =>
  lines.map((line) => line.map((seg) => (typeof seg === 'string' ? seg : seg.text || seg.label || seg.cmd || seg.key || seg.art)).join('')).join('\n');
const hrefs = (lines) => lines.flat().filter((seg) => seg.href).map((seg) => seg.href);
const commands = (lines) => lines.flat().filter((seg) => seg.cmd).map((seg) => seg.cmd);

test('welcome names the owner and offers hugo as a clickable way out', () => {
  const lines = welcome(data);
  assert.match(text(lines), /Test Person/);
  assert.match(text(lines), /Type hugo for the normal website\./);
  assert.ok(commands(lines).includes('hugo'));
});

test('welcome only offers commands that exist', () => {
  for (const name of commands(welcome(data))) {
    assert.ok(COMMANDS.includes(name.split(' ')[0]), name);
    assert.doesNotMatch(text(run(name, data).lines), /not found|no such/, name);
  }
});

test('logo is a closed, symmetric, ASCII-only octagon', () => {
  const art = welcome(data).flat().filter((seg) => seg.art).map((seg) => seg.art);
  assert.equal(art.length, 14);
  const mirror = { '/': '\\', '\\': '/' };
  for (const row of art) {
    assert.match(row, /^[ -~]+$/, 'ASCII only: ' + row);
    const edge = row.trimStart();
    assert.equal(row.length - edge.length + row.length, 33, 'centred in 33 columns: ' + row);
    // The outline is left-right symmetric: "/" on the left pairs with "\" on the right.
    assert.equal(edge.at(-1), mirror[edge[0]] || edge[0], 'outline closes: ' + row);
  }
  assert.equal(art.at(-1 - 13), art[0]);
  assert.match(text(run('welcome', data).lines), /##########   ##########/);
});

// The rows of the welcome banner (logo + info), as text with trailing spaces removed.
const banner = (site) => {
  const lines = welcome(site);
  return text(lines.slice(0, lines.findIndex((line) => !line.length))).split('\n').map((row) => row.trimEnd());
};

test('welcome shows the profile beside the logo, neofetch style', () => {
  assert.deepEqual(
    banner(data).map((row) => row.slice(36)).filter(Boolean),
    ['Test Person', '-----------', 'Role: Student', 'School: Test University', 'Degree: B.S. Testing',
      'Interests: Robots', 'Projects: 2', 'Posts: 1', 'Contact: github']
  );
  // Nine info rows centred against the fourteen logo rows start on the third row.
  assert.equal(banner(data).length, 14);
  assert.equal(banner(data)[2].slice(36), 'Test Person');
  const lines = welcome(data);
  assert.ok(hrefs(lines).includes('https://example.com/gh'));
  // The counts are clickable and run the matching command.
  assert.ok(commands(lines).includes('projects') && commands(lines).includes('posts'));
});

test('welcome profile copes with missing data and with more rows than the logo', () => {
  assert.deepEqual(
    banner(empty).map((row) => row.slice(36)).filter(Boolean),
    ['Test Person', '-----------', 'Role: Student', 'Projects: 0', 'Posts: 0']
  );
  const many = banner({ ...data, interests: Array.from({ length: 20 }, (_, index) => 'Topic ' + index) });
  assert.equal(many.length, 28); // 8 fixed rows + 20 interests
  assert.equal(many[0].slice(36), 'Test Person');
  // Continuation rows line up under the first interest; rows below the logo keep the same column.
  assert.equal(many[5].slice(36), 'Interests: Topic 0');
  assert.equal(many[24], ' '.repeat(36) + '           Topic 19');
});

test('help lists every command as a clickable command', () => {
  assert.deepEqual(commands(run('help', data).lines), COMMANDS);
});

test('every listed command is implemented', () => {
  for (const name of COMMANDS) {
    assert.doesNotMatch(text(run(name, data).lines), /command not found/, name);
  }
});

test('content commands link to the real pages', () => {
  assert.deepEqual(hrefs(run('projects', data).lines), ['/projects/proj/', '/projects/robot-arm/']);
  assert.deepEqual(hrefs(run('posts', data).lines), ['/post/post/']);
  assert.deepEqual(hrefs(run('experience', data).lines), ['/experience/']);
  assert.deepEqual(hrefs(run('cv', data).lines), ['/uploads/resume.pdf']);
  assert.deepEqual(hrefs(run('about', data).lines), ['https://example.com/gh']);
});

test('experience lists jobs, then education, then the link to the full page', () => {
  assert.equal(
    text(run('experience', data).lines),
    'Experience\n  Jun 2026 – Sep 2026  Intern, Lab\n' +
      'Education\n  Sep 2024 – Jun 2028  B.S. Testing, Test University\nfull details'
  );
  // A section with no entries prints no heading.
  assert.equal(text(run('experience', { ...data, experience: [] }).lines).split('\n')[0], 'Education');
  assert.equal(text(run('experience', empty).lines), 'full details');
});

test('hugo and clear return an action and print nothing', () => {
  assert.deepEqual(run('hugo', data), { lines: [], action: 'hugo' });
  assert.deepEqual(run('clear', data), { lines: [], action: 'clear' });
});

test('input is trimmed and case-insensitive', () => {
  assert.deepEqual(run('  HUGO  ', data), run('hugo', data));
});

test('empty input prints nothing', () => {
  assert.deepEqual(run('   ', data), { lines: [] });
});

test('unknown command reports the typed text and points to help', () => {
  const { lines, action } = run('sudo rm', data);
  assert.match(text(lines), /command not found: sudo rm/);
  assert.deepEqual(commands(lines), ['help']);
  assert.equal(action, undefined);
});

test('empty site data does not crash any command', () => {
  for (const name of COMMANDS) run(name, empty);
  assert.match(text(run('projects', empty).lines), /No projects yet/);
  assert.match(text(run('posts', empty).lines), /No posts yet/);
  assert.equal(run('about', empty).lines.length, 2);
});

test('ls at home lists the folders as clickable cd commands', () => {
  for (const typed of ['ls', 'list', 'ls ~', 'LS']) {
    assert.deepEqual(commands(run(typed, data).lines), ['cd ~/projects', 'cd ~/posts'], typed);
  }
  assert.equal(text(run('ls', data).lines).trim(), 'projects/  posts/');
  // From inside a folder, "ls .." is home again.
  assert.deepEqual(run('ls ..', data, ['posts']), run('ls', data));
});

test('ls in a folder lists its pages, linked, with aligned titles', () => {
  const inside = run('ls', data, ['projects']);
  assert.deepEqual(hrefs(inside.lines), ['/projects/proj/', '/projects/robot-arm/']);
  assert.equal(text(inside.lines), 'proj/       Proj\nrobot-arm/  Robot Arm');
  assert.deepEqual(run('ls projects', data), inside);
  assert.deepEqual(run('ls ~/projects/', data, ['posts']), inside);
});

test('cd moves between home and folders', () => {
  assert.deepEqual(run('cd projects', data), { lines: [], cwd: ['projects'] });
  assert.deepEqual(run('cd Projects/', data), { lines: [], cwd: ['projects'] });
  assert.deepEqual(run('cd ..', data, ['projects']), { lines: [], cwd: [] });
  assert.deepEqual(run('cd', data, ['projects']), { lines: [], cwd: [] });
  assert.deepEqual(run('cd ~', data, ['projects']), { lines: [], cwd: [] });
  assert.deepEqual(run('cd ../posts', data, ['projects']), { lines: [], cwd: ['posts'] });
  assert.deepEqual(run('cd ..', data, []), { lines: [], cwd: [] }); // already home: stay
});

test('cd to a page opens it', () => {
  const opened = run('cd robot-arm', data, ['projects']);
  assert.equal(opened.action, 'open');
  assert.equal(opened.url, '/projects/robot-arm/');
  assert.equal(opened.cwd, undefined);
  assert.equal(run('cd projects/proj', data).url, '/projects/proj/');
  assert.equal(run('cd ~/posts/post/', data, ['projects']).url, '/post/post/');
});

test('cd and ls reject paths that do not exist, without moving', () => {
  for (const typed of ['cd nowhere', 'cd projects/nowhere', 'cd about', 'cd projects/proj/deeper', 'cd constructor', 'cd posts', 'cd proj']) {
    // The last two would work from home (or ~/projects) but not from inside ~/posts.
    const result = run(typed, data, ['posts']);
    assert.match(text(result.lines), /^cd: no such folder: /, typed);
    assert.equal(result.cwd, undefined, typed);
    assert.equal(result.action, undefined, typed);
  }
  assert.match(text(run('ls nowhere', data).lines), /^ls: no such folder: nowhere$/);
  assert.match(text(run('ls projects/proj', data).lines), /^ls: no such folder: /);
});

test('tab completes folder and page names after cd and ls', () => {
  assert.equal(completeInput('cd pro', data, []), 'cd projects/');
  assert.equal(completeInput('cd p', data, []), 'cd p'); // projects/ and posts/ share only "p"
  assert.equal(completeInput('cd projects/ro', data, []), 'cd projects/robot-arm');
  assert.equal(completeInput('cd ro', data, ['projects']), 'cd robot-arm');
  assert.equal(completeInput('ls ~/po', data, ['projects']), 'ls ~/posts/');
  assert.equal(completeInput('cd ../po', data, ['projects']), 'cd ../posts/');
  assert.equal(completeInput('cd zzz', data, []), 'cd zzz'); // no match: unchanged
  assert.equal(completeInput('cd ', data, []), 'cd '); // nothing typed: unchanged
  assert.equal(completeInput('cd nowhere/x', data, []), 'cd nowhere/x'); // unknown parent
  assert.equal(completeInput('pr', data, []), 'projects'); // no cd/ls: command names
});

test('tab completion', () => {
  assert.equal(complete('pr', COMMANDS), 'projects'); // unique match
  assert.equal(complete('p', COMMANDS), 'p'); // projects/posts share only "p"
  assert.equal(complete('HU', COMMANDS), 'hugo'); // case-insensitive
  assert.equal(complete('xyz', COMMANDS), 'xyz'); // no match: unchanged
  assert.equal(complete('', COMMANDS), ''); // nothing typed: unchanged
});
