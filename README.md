# Introduction

[![Build Status](https://travis-ci.org/cultuurnet/uitpas-beheer-angular.svg?branch=master)](https://travis-ci.org/cultuurnet/uitpas-beheer-angular) [![Coverage Status](https://coveralls.io/repos/cultuurnet/uitpas-beheer-angular/badge.svg)](https://coveralls.io/r/cultuurnet/uitpas-beheer-angular)

# UiTPAS beheer

## Build & development
Run `grunt` for building and `grunt serve` for preview.

Install git hooks with `grunt githooks`. This will add a git pre-commit task that runs `grunt test`before every git commit. The commit will not be executed if the tests fail.

Pre-commit hooks can be bypassed with the option `--no-verify`. This should be used as little as possible.

## Testing
 Running `grunt test` will run the unit tests with karma.

## Configuration
 