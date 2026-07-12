# Real-surface verification policy

| Project type | Direct proof |
| --- | --- |
| Web | run the app and exercise the changed user path in a browser |
| CLI | execute the documented command with representative input and inspect output and exit status |
| API | call the endpoint with representative requests and assert response plus persistence effect |
| Library | run focused and relevant integration tests through the public API |
| Automation | run a safe fixture or dry run and inspect produced artifacts |
| Document | render or open the final artifact and inspect the changed content and links |

Run the strongest relevant automated checks as well, but do not confuse a typecheck, linter, or diff with user-visible proof. Record the command, result, and artifact location in the PRD or decision log.
