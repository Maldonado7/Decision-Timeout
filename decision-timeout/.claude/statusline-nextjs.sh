#!/bin/bash

# Decision-Timeout Next.js Development Status Line
# Comprehensive development information for mobile-optimized Next.js app

# Read JSON input from stdin
input=$(cat)

# Extract common variables
current_dir=$(echo "$input" | jq -r '.workspace.current_dir')
project_dir=$(echo "$input" | jq -r '.workspace.project_dir')
model_name=$(echo "$input" | jq -r '.model.display_name')
output_style=$(echo "$input" | jq -r '.output_style.name')

# Change to project directory
cd "$current_dir" 2>/dev/null || cd "$project_dir" 2>/dev/null || cd "."

# Colors for terminal output (will be dimmed in status line)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m' # No Color

# Initialize status components
project_status=""
build_status=""
dev_metrics=""
test_status=""
mobile_status=""
error_status=""
git_status=""

# 1. PROJECT CONTEXT & GIT INTEGRATION
if [ -d ".git" ]; then
    branch=$(git branch --show-current 2>/dev/null || echo "detached")
    git_dirty=$(git status --porcelain 2>/dev/null | wc -l)
    last_commit=$(git log -1 --pretty=format:"%h %s" 2>/dev/null | cut -c1-30)
    
    if [ "$git_dirty" -gt 0 ]; then
        git_status="${YELLOW}${branch}*${NC} ${DIM}(${git_dirty} changes)${NC}"
    else
        git_status="${GREEN}${branch}${NC} ${DIM}✓${NC}"
    fi
    
    project_status="📱 Decision-Timeout ${DIM}| ${last_commit}${NC}"
else
    git_status="${DIM}no git${NC}"
    project_status="📱 Decision-Timeout"
fi

# 2. BUILD STATUS & ERROR TRACKING
if [ -f "package.json" ]; then
    # Check if Next.js dev server might be running
    if lsof -i :3000 >/dev/null 2>&1; then
        dev_mode="${GREEN}dev:3000${NC}"
    elif lsof -i :3001 >/dev/null 2>&1; then
        dev_mode="${GREEN}dev:3001${NC}"
    else
        dev_mode="${DIM}stopped${NC}"
    fi
    
    # Check for recent build artifacts
    if [ -d ".next" ] && [ -f ".next/build-manifest.json" ]; then
        build_age=$(find .next/build-manifest.json -mtime -1 2>/dev/null | wc -l)
        if [ "$build_age" -gt 0 ]; then
            build_status="${GREEN}built${NC}"
        else
            build_status="${YELLOW}stale${NC}"
        fi
    else
        build_status="${RED}no build${NC}"
    fi
    
    # Check for TypeScript errors
    if command -v tsc >/dev/null 2>&1; then
        ts_check=$(tsc --noEmit 2>&1 | grep -c "error TS" || echo "0")
        if [ "$ts_check" -eq 0 ]; then
            ts_status="${GREEN}TS✓${NC}"
        else
            ts_status="${RED}TS:${ts_check}${NC}"
        fi
    else
        ts_status="${DIM}no TS${NC}"
    fi
    
    # Check for ESLint issues (quick check)
    if command -v eslint >/dev/null 2>&1 && [ -f ".eslintrc.json" ] || [ -f "eslint.config.js" ]; then
        # Quick lint check on a few key files
        lint_issues=$(find src -name "*.tsx" -o -name "*.ts" | head -5 | xargs eslint 2>/dev/null | grep -c "problem" || echo "0")
        if [ "$lint_issues" -eq 0 ]; then
            lint_status="${GREEN}lint✓${NC}"
        else
            lint_status="${YELLOW}lint:${lint_issues}${NC}"
        fi
    else
        lint_status="${DIM}no lint${NC}"
    fi
    
    error_status="$ts_status $lint_status"
fi

# 3. DEVELOPMENT METRICS & MOBILE OPTIMIZATION
if [ -d ".next" ]; then
    # Bundle size estimation (rough)
    if [ -d ".next/static" ]; then
        bundle_size=$(du -sh .next/static 2>/dev/null | cut -f1 | sed 's/[^0-9.]//g' || echo "0")
        if [ -n "$bundle_size" ] && [ "$bundle_size" != "0" ]; then
            # Convert to rough mobile-friendly assessment
            bundle_mb=$(echo "$bundle_size" | cut -d'.' -f1)
            if [ "$bundle_mb" -lt 1 ]; then
                bundle_status="${GREEN}${bundle_size}MB${NC}"
            elif [ "$bundle_mb" -lt 3 ]; then
                bundle_status="${YELLOW}${bundle_size}MB${NC}"
            else
                bundle_status="${RED}${bundle_size}MB${NC}"
            fi
        else
            bundle_status="${DIM}no bundle${NC}"
        fi
    else
        bundle_status="${DIM}no static${NC}"
    fi
    
    dev_metrics="📦 $bundle_status"
fi

# 4. MOBILE DEVELOPMENT & PWA STATUS
mobile_features=""

# Check for PWA manifest
if [ -f "public/manifest.json" ] || [ -f "app/manifest.ts" ] || [ -f "src/app/manifest.ts" ]; then
    mobile_features="${mobile_features}📱PWA "
fi

# Check for service worker
if [ -f "public/sw.js" ] || [ -f "app/sw.js" ]; then
    mobile_features="${mobile_features}⚡SW "
fi

# Check for mobile-specific optimizations in next.config
if [ -f "next.config.ts" ] || [ -f "next.config.js" ]; then
    if grep -q "deviceSizes\|imageSizes" next.config.* 2>/dev/null; then
        mobile_features="${mobile_features}🖼️IMG "
    fi
    if grep -q "compress.*true" next.config.* 2>/dev/null; then
        mobile_features="${mobile_features}🗜️COMP "
    fi
fi

# Check for Tailwind (mobile-first CSS)
if [ -f "tailwind.config.js" ] || [ -f "tailwind.config.ts" ]; then
    mobile_features="${mobile_features}🎨TW "
fi

if [ -n "$mobile_features" ]; then
    mobile_status="📱 ${mobile_features}"
else
    mobile_status="📱 ${DIM}basic${NC}"
fi

# 5. TESTING STATUS
test_files=$(find . -name "*.test.*" -o -name "*.spec.*" 2>/dev/null | wc -l)
if [ "$test_files" -gt 0 ]; then
    test_status="🧪 ${test_files} tests"
else
    test_status="🧪 ${DIM}no tests${NC}"
fi

# Build final status line with sections
printf "%s ${DIM}|${NC} %s %s ${DIM}|${NC} %s ${DIM}|${NC} %s ${DIM}|${NC} %s ${DIM}|${NC} %s ${DIM}|${NC} %s\n" \
    "$project_status" \
    "$git_status" \
    "$dev_mode" \
    "$build_status" \
    "$dev_metrics" \
    "$mobile_status" \
    "$error_status" \
    "$test_status"