#!/usr/bin/env bash
# Usage: ./scripts/build-all.sh <tag>
set -e
TAG=${1:-manual}
for s in calculator sum sub mul div; do
  docker build -t calc-$s:$TAG services/$s
done
