# Tests

Off-device checks that run under plain Node (no iPhone needed). Run from the
repo root:

```bash
node test/test-core.js     # timezone / day-count math  (10 checks)
node test/test-notif.js    # notification fire-times     (9 checks)
node test/gen-preview.js   # regenerate the HTML previews (+ sanity checks)
```

After `gen-preview.js`, open the generated files in a browser to *see* the real
screens (confetti + countdown):

```bash
open celebration-preview.html status-preview.html
```

These test the parts that can be verified off-device (math, notification
scheduling, the celebration/status HTML). The **widget tile itself** and
**delivered notifications** can only be tested inside the Scriptable app on an
iPhone — see the "Test it on YOUR iPhone first" section in the top-level README.

> `celebration-preview.html` / `status-preview.html` are generated artifacts and
> are git-ignored.
