# Constraints

Explicit list of what must never happen in this project. Read before every change.

- **Dependencies**: Do not install new dependencies without asking first. Use dedicated virtual environment.
- **Data & Secrets**: Never commit Kaggle credentials (`kaggle.json`), API keys, or large dataset binary files (`.tif`, `.tar.gz`, `.zip`, raw imagery) to version control.
- **File Integrity**: Maintain documentation-first workflow under `ai-docs/`. Keep inline comments explaining non-obvious code logic.
- **Scope**: Keep changes modular and verified with reproducible checks.
