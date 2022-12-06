#!/bin/sh

# Reset
COLOR_OFF='\033[0m'       # Text Reset
NC=$COLOR_OFF

# Regular Colors
#Black='\033[0;30m'        # Black
RED='\033[0;31m'          # Red
GREEN='\033[0;32m'        # Green
YELLOW='\033[0;33m'       # Yellow
BLUE='\033[0;34m'         # Blue
PURPLE='\033[0;35m'       # Purple
CYAN='\033[0;36m'         # Cyan
WHITE='\033[0;37m'        # White

echo "${GREEN}* iOS Simulator: Erase All Content and Settings${NC}"
killall "Simulator" 2> /dev/null; xcrun simctl erase all

echo "${GREEN}* Deleting node_modules directory${NC}"
rm -rf node_modules 2>/dev/null

echo "${GREEN}* Delete android native folder${NC}"
rm -rf android

echo "${GREEN}* Clearing npm cache${NC}"
npm cache clean --force 2>/dev/null

echo "${GREEN}* Clearing yarn cache${NC}"
yarn cache clean 2>/dev/null

echo "${GREEN}* Deleting yarn.lock${NC}"
rm yarn.lock 2>/dev/null

echo "${GREEN}* Deleting package-lock.json${NC}"
rm package-lock.json 2>/dev/null

echo "${GREEN}* Deleting .expo directory${NC}"
rm -rf .expo 2>/dev/null

echo "${GREEN}* Reinstalling node modules"
yarn install
echo "${NC}"

echo "${GREEN}* Regenerating native directories${NC}"
npx expo prebuild --clean
