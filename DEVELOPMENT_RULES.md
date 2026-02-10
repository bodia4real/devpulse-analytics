# Development Rules & Best Practices

## Commit Message Format

### Structure

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, no logic change)
- **refactor:** Code refactoring
- **test:** Adding/updating tests
- **chore:** Build process, tooling, dependencies
- **perf:** Performance improvements

### Examples

```
feat(api): add database connection setup

- Set up Supabase client and postgres.js
- Add connection test scripts
- Configure environment variables

Closes #123
```

```
fix(auth): resolve token expiration issue

The JWT token was expiring too quickly. Increased expiration time to 7 days.
```

### Rules

- **NO** "Made with Cursor" or AI tool mentions in commits
- **NO** generic messages like "update files" or "fix stuff"
- **DO** write clear, descriptive subject lines (50 chars max)
- **DO** explain WHY in the body, not just WHAT
- **DO** reference issue numbers if applicable
- **DO** use present tense ("add feature" not "added feature")

---

## Development Process

### Before Starting Work

1. Check current branch: `git status`
2. Pull latest changes: `git pull origin main`
3. Create feature branch: `git checkout -b feat/feature-name`
4. Review implementation plan

### During Development

1. Make small, focused commits
2. Test changes before committing
3. Keep commits atomic (one logical change per commit)
4. Write meaningful commit messages

### Before Committing

1. Check what changed: `git status` and `git diff`
2. Test your changes
3. Review code for obvious errors
4. Ensure no sensitive data (API keys, passwords) in commits

### Commit Workflow

1. Stage files: `git add <files>` or `git add .` (be careful!)
2. Review staged changes: `git diff --staged`
3. Commit with proper message: `git commit -m "type(scope): message"`
4. Push to branch: `git push origin feat/feature-name`

### After Completing Feature

1. Update implementation plan (mark steps complete)
2. Test everything works
3. Create pull request or merge to main
4. Delete feature branch after merge

---

## Code Quality

### General

- Write readable, self-documenting code
- Use meaningful variable/function names
- Add comments for complex logic only
- Keep functions small and focused
- Follow existing code style

### TypeScript

- Use types/interfaces, avoid `any`
- Enable strict mode
- Use async/await, not callbacks
- Handle errors properly

### Testing

- Test database connections before proceeding
- Test API endpoints manually
- Add unit tests for complex logic
- Test error cases too

---

## File Organization

### Backend API

- `src/config/` – Configuration files
- `src/middleware/` – Express middleware
- `src/routes/` – API routes
- `src/controllers/` – Route handlers
- `src/types/` – TypeScript types/interfaces
- `src/utils/` – Helper functions

*(Paths are relative to `backend/` when working on the API.)*

### Environment Variables

- Never commit `.env` files
- Use `.env.example` as template
- Document required variables in implementation plan

---

## Git Best Practices

### Branching

- **main** – Production-ready code only
- **feat/** – New features
- **fix/** – Bug fixes
- **docs/** – Documentation updates

### Commits

- One logical change per commit
- Commit often (small commits are better)
- Don't commit broken code
- Don't commit commented-out code
- Don't commit temporary files

### .gitignore

- Always check `.gitignore` before committing
- Add new ignore patterns as needed
- Never commit:
  - `.env` files
  - `node_modules/`
  - Build artifacts
  - IDE config files
  - Logs

---

## Communication

### When Stuck

1. Check LEARNING_NOTES.md for similar concepts
2. Review implementation plan
3. Check documentation
4. Ask for help with specific question

### When Completing Steps

1. Update implementation plan (mark complete)
2. Test the changes
3. Commit with proper message
4. Move to next step

---

*Last Updated: 2024-12-19*
