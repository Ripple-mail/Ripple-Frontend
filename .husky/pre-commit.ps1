Write-Host "Running formatter..." -ForegroundColor Cyan
& npm run format
if ($LASTEXITCODE -ne 0) {
    Write-Host "Formatting failed. Aborting commit." -ForegroundColor Red
    exit 1
}

Write-Host "Running linter..." -ForegroundColor Cyan
& npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "Linting failed. Aborting commit." -ForegroundColor Red
    exit 1
}

Write-Host "Pre-commit checks passed!" -ForegroundColor Green
exit 0