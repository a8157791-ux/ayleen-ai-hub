# Ayleen Edit integration QA

**Findings**

- No actionable P0/P1/P2 visual findings remain in the implemented shell and homepage.
- The local integration preview uses `AYLEEN_DEMO=1` because this checkout does not contain `DATABASE_URL`. Production uses the existing Prisma records; the demo records are never selected when the database is enabled.

**Comparison target**

- Source visual truth: `/Users/aileen/Documents/ChatGPT/ayleen-ai/prototype/qa/desktop-top-final.png`.
- Implementation screenshot: `qa/integrated-desktop-final.png`.
- Full-view comparison: `qa/integration-comparison.png`.
- Responsive evidence: `qa/integrated-mobile-visible.png`.
- Desktop state: light theme, home route, local visual-verification data. CSS viewport 1440 × 1024 at 1×; in-app content capture 1436 × 1021. Source is 1440 × 1024 at 1×. The comparison contains both within equal 1440 × 1024 surfaces.
- Mobile state: light theme, home route, top of featured feed. CSS viewport 390 × 844 at 1×; in-app content capture 386 × 835.
- Archive refinement references: the two user-provided screenshots showing the misaligned page-heading/card axes and the study archive grid. Live production captures of `/study`, `/tools`, `/saved`, and `/study/6` were compared against those references after deployment.

**Required fidelity surfaces**

- Fonts and typography: requested IBM Plex Sans/Pretendard system stack is used for UI; Cormorant Garamond is retained for the approved `Ayleen [Edit]` wordmark. Section headings are 16px desktop / 15px mobile and follow the approved Korean-title then English-caption hierarchy.
- Spacing and layout rhythm: 72px desktop rail, 90px masthead, three-column featured row, four-column secondary and study rows. Computed desktop tracks were 416px × 3 and 307px × 4 without horizontal overflow. Mobile tracks were 346px × 1 and 167px × 2 without horizontal overflow.
- Colors and visual tokens: light neutral default, fine warm-gray dividers and black type match the source direction. Optional remembered dark tokens and toggle were exercised.
- Image quality and asset fidelity: original record thumbnails are used when present. Missing or failed images use the generated ivory-paper editorial cover. All local verification images loaded; no placeholder boxes, emoji or CSS-generated art are used for imagery.
- Copy and content: navigation, section names, wordmark and captions match the approved prototype. Card descriptions/dates intentionally replace some prototype tag rows because they map to the existing database fields.

**Interaction and integration checks**

- Existing Prisma schema, API routes, admin routes, study details, saved links and authentication providers were preserved.
- Homepage reads up to 7 news, 7 references, 4 tools and 4 published study records from the existing database.
- Sidebar routes expose home, news, tools, reference, study, saved and login; current route uses a filled Phosphor icon and inactive routes use thin icons.
- Theme toggled light → dark → light successfully.
- Missing-image fallback is shared by news, reference and study cards.
- Desktop and mobile layouts were rendered in the in-app browser. No horizontal overflow was observed.
- Production build completed successfully across all 29 routes.
- Browser accessibility tree contained all primary navigation links, search input, theme control, headings and card links.
- Live production `/news`, `/reference`, and `/study` routes were inspected with real records after the archive redesign. Images, generated fallbacks, active filled rail icons, filters, headings, and responsive two-column tablet state rendered without clipping or horizontal overflow.
- Archive rules now match the selected design: news/reference begin with three featured cards and continue in four-column compact rows; study uses four-column compact rows. At mobile width the featured cards become one column and compact cards become two columns.
- Each desktop rail icon has a small icon-specific hover motion, while `prefers-reduced-motion` continues to disable all animation.
- Editorial card dates use an explicit Asia/Seoul timezone to keep server and browser text identical during hydration.
- Page heading, category navigation, and list/card grids now share the same horizontal start and end edges. Browser geometry checks returned the same left coordinate for the study heading, first category, and first card.
- The category bar's full-width bottom border was removed; only the active category's short underline remains. The hero divider stays as the single section separator.
- Tools, saved items, search results, and study detail now use the same quiet line-based editorial treatment. Live navigation across these routes produced zero browser console errors.
- Console: no visible runtime error overlay or failed application render was observed. A full automated console capture was not available on this surface.

**Comparison history**

1. P2: the compact rail monogram wrapped as `[`, `e`, `]` vertically. Wrapped its contents in a non-wrapping inline block. The final desktop and mobile captures show `[e]` on one line.
2. The first build failed because a server component imported a client-oriented icon package. Moved card-only icons to the existing Tabler webfont; the subsequent production build passed. This was a runtime compatibility fix, not a visual change.
3. The full-view comparison shows the intended follow-up difference: the implementation adds the requested four-card secondary row beneath the featured three cards. No unresolved P0/P1/P2 mismatch remains.

**Open Questions**

- Live production data and authenticated admin mutation cannot be exercised locally until `DATABASE_URL` and auth environment variables are supplied. The code paths and database schema were preserved, and the build validates them statically.

**Follow-up Polish**

- P3: after reviewing real production titles, individual line clamps may be tuned if unusually long Korean/English headlines produce uneven compact-card heights.

**Implementation Checklist**

- [x] Apply approved light editorial shell to the existing Next.js project.
- [x] Connect homepage sections to existing Prisma models.
- [x] Add shared fallback thumbnail behavior.
- [x] Preserve application routes and backend APIs.
- [x] Validate production build, desktop, mobile and theme state.
- [x] Extend the editorial card system to insight, reference and study archives.
- [x] Add rail hover motion and verify active filled icon states.
- [x] Align archive titles, category navigation, and content grids.
- [x] Remove the redundant category rule and refine remaining public detail routes.

final result: passed
