#!/usr/bin/env bash
set -euo pipefail

corepack yarn install --frozen-lockfile --non-interactive
corepack yarn build:demo
