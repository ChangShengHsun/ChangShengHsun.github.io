// Terminal mode for the home page.
// Command logic comes first and has no DOM access, so tests/terminal.test.js
// can load this file in Node. The DOM wiring below only runs in a browser.
(function () {
  'use strict';

  var HELP = [
    ['help', 'list commands'],
    ['welcome', 'show the welcome screen again'],
    ['ls', 'list what is in this folder (also: list)'],
    ['cd', 'enter a folder or open a page, e.g. cd projects'],
    ['about', 'who I am'],
    ['experience', 'work experience and education'],
    ['projects', 'things I have built'],
    ['posts', 'recent posts'],
    ['cv', 'my CV (PDF)'],
    ['hugo', 'switch to the normal website'],
    ['clear', 'clear the screen'],
  ];
  var COMMANDS = HELP.map(function (entry) { return entry[0]; });

  // Folders under the home directory; each name is also a key of the site data.
  var FOLDERS = ['projects', 'posts'];
  function isFolder(segments) { return segments.length === 1 && FOLDERS.indexOf(segments[0]) >= 0; }

  // Resolve a typed path against the current folder into segments:
  // [] is home, ['projects'] a folder, ['projects', 'gridstage'] a page.
  function resolve(cwd, target) {
    var segments = /^[~\/]/.test(target) ? [] : cwd.slice();
    target.toLowerCase().split('/').forEach(function (part) {
      if (part === '..') segments.pop();
      else if (part && part !== '.' && part !== '~') segments.push(part);
    });
    return segments;
  }

  // The site icon (assets/media/icon.png: "SC" in an octagon) drawn in text.
  // ASCII only: a character missing from the web font would be drawn by a
  // fallback font with a different width and push the rows out of line.
  var LOGO = [
    '    _________________________',
    '   /                         \\',
    '  /                           \\',
    ' /                             \\',
    '|                               |',
    '|    ##########   ##########    |',
    '|    ##           ##            |',
    '|    ##########   ##            |',
    '|            ##   ##            |',
    '|    ##########   ##########    |',
    '|                               |',
    ' \\                             /',
    '  \\                           /',
    '   \\_________________________/',
  ];

  // A line is an array of segments: a plain string, {text, href} for a link,
  // {cmd} for a clickable command, or {art} for a row of the logo.
  function link(text, href) { return { text: text, href: href }; }

  function welcome(data) {
    var shortcuts = ['  '];
    ['help', 'about', 'experience', 'projects', 'posts', 'cv'].forEach(function (name) {
      shortcuts.push({ cmd: name }, '  ');
    });
    return LOGO.map(function (row) { return [{ art: row }]; }).concat([
      [],
      ['Welcome to ' + data.name + "'s website (terminal mode)."],
      ['Type a command and press Enter, or click one:'],
      shortcuts,
      ['Or browse like a shell:  ', { cmd: 'ls' }, '  ', { cmd: 'cd projects' }, '  ', { cmd: 'cd ..' }],
      ['Type ', { cmd: 'hugo' }, ' for the normal website.'],
    ]);
  }

  // cwd is the current folder as path segments. A result may carry a new cwd,
  // or an action for the browser: 'hugo', 'clear', or 'open' with a url.
  function run(input, data, cwd) {
    cwd = cwd || [];
    var words = input.trim().split(/\s+/);
    var name = words[0].toLowerCase();
    var target = words[1] || '';
    switch (name) {
      case '':
        return { lines: [] };
      case 'welcome':
        return { lines: welcome(data) };
      case 'ls':
      case 'list': {
        var where = resolve(cwd, target);
        if (!where.length) {
          // Absolute paths, so an old listing still works after the folder changes.
          var folders = [];
          FOLDERS.forEach(function (folder) { folders.push({ cmd: 'cd ~/' + folder, label: folder + '/' }, '  '); });
          return { lines: [folders] };
        }
        if (!isFolder(where)) return { lines: [['ls: no such folder: ' + target]] };
        var pages = data[where[0]];
        var width = pages.reduce(function (longest, page) { return Math.max(longest, page.slug.length); }, 0) + 3;
        return {
          lines: pages.map(function (page) {
            return [link(page.slug + '/', page.url), ' '.repeat(width - page.slug.length - 1) + page.title];
          }),
        };
      }
      case 'cd': {
        var destination = target ? resolve(cwd, target) : [];
        if (!destination.length || isFolder(destination)) return { lines: [], cwd: destination };
        var page = destination.length === 2 && isFolder(destination.slice(0, 1)) &&
          data[destination[0]].filter(function (candidate) { return candidate.slug === destination[1]; })[0];
        if (page) return { lines: [['opening ' + page.title + ' ...']], action: 'open', url: page.url };
        return { lines: [['cd: no such folder: ' + target]] };
      }
      case 'help':
        return {
          lines: HELP.map(function (entry) {
            return [{ cmd: entry[0] }, ' '.repeat(12 - entry[0].length) + entry[1]];
          }),
        };
      case 'about': {
        var lines = [[data.name + ' — ' + data.role], [data.bio]];
        if (data.interests.length) lines.push(['Interests: ' + data.interests.join(', ')]);
        if (data.links.length) {
          var contact = ['Contact: '];
          data.links.forEach(function (item, index) {
            if (index) contact.push('  ');
            contact.push(link(item.label, item.url));
          });
          lines.push(contact);
        }
        return { lines: lines };
      }
      case 'experience': {
        var rows = [];
        [['Experience', data.experience], ['Education', data.education]].forEach(function (section) {
          if (section[1].length) rows.push([section[0]]);
          section[1].forEach(function (entry) {
            rows.push(['  ' + entry.period + '  ' + entry.title + ', ' + entry.place]);
          });
        });
        rows.push([link('full details', data.experienceUrl)]);
        return { lines: rows };
      }
      case 'projects':
        return {
          lines: data.projects.length
            ? data.projects.map(function (page) { return [link(page.title, page.url), '  ' + page.summary]; })
            : [['No projects yet.']],
        };
      case 'posts':
        return {
          lines: data.posts.length
            ? data.posts.map(function (page) { return [page.date + '  ', link(page.title, page.url)]; })
            : [['No posts yet.']],
        };
      case 'cv':
        return { lines: [[link('Open CV (PDF)', data.cvUrl)]] };
      case 'hugo':
        return { lines: [], action: 'hugo' };
      case 'clear':
        return { lines: [], action: 'clear' };
      default:
        return { lines: [['command not found: ' + input.trim() + ' — try ', { cmd: 'help' }]] };
    }
  }

  // Tab completion: a unique match completes fully, several matches complete
  // to their shared prefix, no match leaves the input alone.
  function complete(input, names) {
    var prefix = input.trim().toLowerCase();
    var matches = names.filter(function (name) { return name.indexOf(prefix) === 0; });
    if (!prefix || !matches.length) return input;
    var shared = matches[0];
    matches.forEach(function (name) {
      while (name.indexOf(shared) !== 0) shared = shared.slice(0, -1);
    });
    return shared;
  }

  // Tab on the whole input line: complete a path after cd/ls, else a command name.
  function completeInput(input, data, cwd) {
    var match = /^(\s*(?:cd|ls|list)\s+)(.*)$/i.exec(input);
    if (!match) return complete(input, COMMANDS);
    var cut = match[2].lastIndexOf('/') + 1;
    var parent = resolve(cwd, match[2].slice(0, cut));
    var names = [];
    if (!parent.length) names = FOLDERS.map(function (folder) { return folder + '/'; });
    else if (isFolder(parent)) names = data[parent[0]].map(function (page) { return page.slug; });
    return match[1] + match[2].slice(0, cut) + complete(match[2].slice(cut), names);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { COMMANDS: COMMANDS, welcome: welcome, run: run, complete: complete, completeInput: completeInput };
    return;
  }

  // ── Browser wiring ─────────────────────────────────────────────────────────

  var root = document.documentElement;
  // The head script sets data-term only on desktop; phones keep the normal site.
  if (!('term' in root.dataset)) return;

  var term = document.getElementById('term');
  var output = document.getElementById('term-out');
  var field = document.getElementById('term-input');
  var promptLabel = document.getElementById('term-prompt');
  var data = JSON.parse(document.getElementById('term-data').textContent);
  var history = [];
  var historyIndex = 0;
  var cwd = [];

  function setMode(on) {
    root.dataset.term = on ? 'on' : 'off';
    // Private windows can throw on storage access; the mode still switches.
    try {
      if (on) localStorage.removeItem('term-mode');
      else localStorage.setItem('term-mode', 'hugo');
    } catch (error) {}
    if (on) field.focus();
  }

  function print(lines) {
    lines.forEach(function (segments) {
      var row = document.createElement('div');
      row.className = 'term-line';
      segments.forEach(function (segment) {
        var node;
        if (typeof segment === 'string') {
          node = document.createTextNode(segment);
        } else if (segment.art) {
          row.classList.add('term-art');
          node = document.createTextNode(segment.art);
        } else if (segment.cmd) {
          node = document.createElement('button');
          node.type = 'button';
          node.dataset.cmd = segment.cmd;
          node.textContent = segment.label || segment.cmd;
        } else {
          node = document.createElement('a');
          node.href = segment.href;
          node.textContent = segment.text;
        }
        row.appendChild(node);
      });
      output.appendChild(row);
    });
    term.scrollTop = term.scrollHeight;
  }

  function execute(text) {
    print([[promptLabel.textContent + ' ' + text]]);
    var result = run(text, data, cwd);
    if (result.action === 'clear') output.textContent = '';
    print(result.lines);
    if (result.cwd) {
      cwd = result.cwd;
      promptLabel.textContent = promptLabel.dataset.user + ':~' + cwd.map(function (part) { return '/' + part; }).join('') + '$';
    }
    if (result.action === 'hugo') setMode(false);
    if (result.action === 'open') location.href = result.url;
  }

  field.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      if (field.value.trim()) history.push(field.value);
      historyIndex = history.length;
      execute(field.value);
      field.value = '';
    } else if (event.key === 'Tab') {
      event.preventDefault();
      field.value = completeInput(field.value, data, cwd);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      historyIndex = Math.max(0, Math.min(history.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1)));
      field.value = history[historyIndex] || '';
    }
  });

  term.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-cmd]');
    if (button) execute(button.dataset.cmd);
    // Keep typing possible after any click, unless the visitor is selecting text.
    if (!event.target.closest('a') && !String(getSelection())) field.focus();
  });

  // The theme's biography block has no hook under the avatar, so the button
  // is inserted here instead of overriding the whole block template.
  var avatar = document.querySelector('.resume-biography .avatar-wrapper');
  if (avatar) {
    var opener = document.createElement('button');
    opener.type = 'button';
    opener.className = 'term-open';
    opener.textContent = '>_ Terminal mode';
    opener.addEventListener('click', function () { setMode(true); });
    avatar.insertAdjacentElement('afterend', opener);
  }

  print(welcome(data));
  if (root.dataset.term === 'on') field.focus();
})();
