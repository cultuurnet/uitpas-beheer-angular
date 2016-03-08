# Build & development
Run `grunt` for building and `grunt serve` for preview.

Install git hooks with `grunt githooks`. This will add a git pre-commit task that runs `grunt test`before every git commit. The commit will not be executed if the tests fail.

Pre-commit hooks can be bypassed with the option `--no-verify`. This should be used as little as possible.

## Testing
 Running `grunt test` will run the unit tests with karma.
