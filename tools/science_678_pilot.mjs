// A stale command must not reactivate the rejected stock or the old green preview.
process.stderr.write('Retired: the old 54-question science pilot was rejected. Use tools/science_booklet_preview.mjs with trusted enrollment 6, 7 or 8.\n');
process.exitCode=1;
