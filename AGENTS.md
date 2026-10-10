<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the ranking experience client-side on the index route, with validated localStorage persistence; this app explicitly needs no login or backend.
- Keep placement rules in a browser-safe pure module with unit tests, so editor state and completion gating share the same invariants.
- Store supplied and downloaded media as Lovable asset pointers; Wikimedia heart flags must remain authentic and traceable to their source.
- Export the same fixed-proportion DOM poster shown in preview with html-to-image, so downloaded rankings match the visible design.
