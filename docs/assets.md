# Asset Handling

The large PNG sprite packs that previously lived under `images/` and `frontend/images/` have been removed from source control to
avoid GitHub failing the pull-request flow with the "Binary files are not supported" banner when the branch is compared on the
web.

Gameplay currently renders abstract object cards without those art assets. Reintroduce optimized (<=1 MB) replacements or load
art from a CDN if you need richer visuals without breaking the PR workflow again.
