#!/bin/bash
set -e
set -x

echo "--- ci_post_clone.sh starting ---"

# Move from ios/ci_scripts/ back to repo root
cd ../../

# Install Node and CocoaPods on the CI machine
brew install node cocoapods || true

# Log versions for debugging
node --version
npm --version

# Install JS dependencies
npm ci || npm install

# Generate the native iOS project
CI="true" npx expo prebuild --platform ios

echo "--- ci_post_clone.sh done ---"