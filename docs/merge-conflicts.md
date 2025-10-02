# Why merge conflicts started appearing

Earlier pull requests merged cleanly because only one side of the history was
changing a given file at a time—Git could fast-forward or automatically
reconcile the diffs. Once both `main` and the feature branch started editing
`frontend/src/components/GameObjectCard.module.css` (and other shared files),
Git found different content in the exact same lines. That overlapping edit is
what produces the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).

In practical terms, the timeline looked like this:

1. A feature branch branched off `main` when the card stylesheet still had the
   old layout.
2. `main` later received updates that kept the legacy styles intact.
3. The branch replaced the same file with the floating collectible styles.
4. When you merged `main` back into the branch, Git saw two competing edits to
   the same lines and halted so a human could pick which version to keep.

Whenever you merge and both branches have touched the same lines, Git will ask
for your decision. If only one side touched a file (or the edits are on
non-overlapping lines), Git merges automatically and you will not see the
conflict markers.
